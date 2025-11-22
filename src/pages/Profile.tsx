import { useState, useEffect } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { useZkLogin } from '../hooks/useZkLogin';
import { MiniHubSDK } from '../sdk/minihub-sdk-simple';
import './Profile.css';

export function Profile() {
  const walletAccount = useCurrentAccount();
  const zkLogin = useZkLogin();
  const client = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const userAddress = walletAccount?.address || zkLogin.address;
  const isAuthenticated = !!walletAccount || zkLogin.isConnected;

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    avatarUrl: '',
    skills: [] as string[],
    experienceYears: 0,
    portfolioUrl: '',
  });
  const [profileId, setProfileId] = useState<string | null>(null);

  const [newSkill, setNewSkill] = useState('');

  // Load existing profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!userAddress) {
        setIsLoading(false);
        return;
      }

      console.log('🔍 Loading profile for address:', userAddress);

      try {
        const sdk = new MiniHubSDK(client, {
          packageId: import.meta.env.VITE_JOB_BOARD_PACKAGE_ID,
          jobBoardId: import.meta.env.VITE_JOB_BOARD_OBJECT_ID,
          userRegistryId: import.meta.env.VITE_USER_REGISTRY_ID,
          employerRegistryId: import.meta.env.VITE_EMPLOYER_REGISTRY_ID,
          clockId: '0x6',
        });

        console.log('📦 SDK Config:', {
          packageId: import.meta.env.VITE_JOB_BOARD_PACKAGE_ID,
          userRegistryId: import.meta.env.VITE_USER_REGISTRY_ID,
        });

        const profile = await sdk.getUserProfileByAddress(userAddress);
        
        console.log('📋 Profile fetched:', profile);

        if (profile) {
          console.log('✅ Profile found! Setting data...');
          setProfileData({
            name: profile.name,
            bio: profile.bio,
            avatarUrl: profile.avatarUrl,
            skills: profile.skills,
            experienceYears: profile.experienceYears,
            portfolioUrl: profile.portfolioUrl,
          });
          setProfileId(profile.id);
          console.log('✅ Profile ID set:', profile.id);
        } else {
          console.log('⚠️ No profile found for this wallet');
        }
      } catch (error) {
        console.error('❌ Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userAddress, client]);

  const handleAddSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter(s => s !== skill),
    });
  };

  const handleSave = async () => {
    if (!userAddress) return;
    
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const sdk = new MiniHubSDK(client, {
        packageId: import.meta.env.VITE_JOB_BOARD_PACKAGE_ID,
        jobBoardId: import.meta.env.VITE_JOB_BOARD_OBJECT_ID,
        userRegistryId: import.meta.env.VITE_USER_REGISTRY_ID,
        employerRegistryId: import.meta.env.VITE_EMPLOYER_REGISTRY_ID,
        clockId: '0x6',
      });

      // Always update if profileId exists (profile was loaded on page load)
      // Only create if profileId is null (no profile found when wallet connected)
      let tx;
      
      if (profileId) {
        // Profile exists - UPDATE it
        console.log('Updating existing profile:', profileId);
        tx = sdk.createUpdateUserProfileTransaction({
          userProfileId: profileId,
          name: profileData.name,
          bio: profileData.bio,
          avatarUrl: profileData.avatarUrl,
          skills: profileData.skills,
          experienceYears: profileData.experienceYears,
          portfolioUrl: profileData.portfolioUrl,
        });
      } else {
        // No profile exists - CREATE new one
        console.log('Creating new profile for wallet:', userAddress);
        tx = sdk.createUserProfileTransaction({
          name: profileData.name,
          bio: profileData.bio,
          avatarUrl: profileData.avatarUrl,
          skills: profileData.skills,
          experienceYears: profileData.experienceYears,
          portfolioUrl: profileData.portfolioUrl,
        });
      }

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async (result) => {
            console.log('✅ Profile saved successfully:', result);
            setSaveStatus({ type: 'success', message: profileId ? 'Profile updated successfully!' : 'Profile created successfully!' });
            setIsEditing(false);
            
            // Wait for transaction to be indexed, then reload profile
            console.log('⏳ Waiting for blockchain to index transaction...');
            setTimeout(async () => {
              try {
                const profile = await sdk.getUserProfileByAddress(userAddress);
                if (profile) {
                  console.log('🔄 Reloaded profile:', profile);
                  setProfileData({
                    name: profile.name,
                    bio: profile.bio,
                    avatarUrl: profile.avatarUrl,
                    skills: profile.skills,
                    experienceYears: profile.experienceYears,
                    portfolioUrl: profile.portfolioUrl,
                  });
                  setProfileId(profile.id);
                  console.log('✅ Profile data refreshed!');
                } else {
                  console.log('⚠️ Profile not found after save');
                }
              } catch (error) {
                console.error('❌ Error reloading profile:', error);
              }
            }, 3000); // Wait 3 seconds for blockchain to index
          },
          onError: (error) => {
            console.error('❌ Error saving profile:', error);
            setSaveStatus({ type: 'error', message: 'Failed to save profile. Please try again.' });
          },
        }
      );
    } catch (error) {
      console.error('Error creating transaction:', error);
      setSaveStatus({ type: 'error', message: 'Failed to create transaction.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="profile-container">
        <div className="profile-not-authenticated">
          <h2>Authentication Required</h2>
          <p>Please connect your wallet or sign in to view your profile</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        {profileId && (
          <div className="profile-status">
            Profile ID: {profileId.slice(0, 8)}...{profileId.slice(-6)}
          </div>
        )}
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="edit-profile-btn"
        >
          {isEditing ? '✕ Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="profile-content">
        {/* Avatar Section */}
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {profileData.avatarUrl ? (
              <img src={profileData.avatarUrl} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">
                {profileData.name ? profileData.name.charAt(0).toUpperCase() : '👤'}
              </div>
            )}
          </div>
          {isEditing && (
            <input
              type="text"
              placeholder="Avatar URL"
              value={profileData.avatarUrl}
              onChange={(e) => setProfileData({ ...profileData, avatarUrl: e.target.value })}
              className="profile-input"
            />
          )}
        </div>

        {/* Basic Info */}
        <div className="profile-section">
          <h2>Basic Information</h2>
          <div className="profile-field">
            <label>Wallet Address</label>
            <div className="profile-address">
              {userAddress?.slice(0, 10)}...{userAddress?.slice(-8)}
            </div>
          </div>

          <div className="profile-field">
            <label>Name</label>
            {isEditing ? (
              <input
                type="text"
                placeholder="Your name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="profile-input"
              />
            ) : (
              <div className="profile-value">{profileData.name || 'Not set'}</div>
            )}
          </div>

          <div className="profile-field">
            <label>Bio</label>
            {isEditing ? (
              <textarea
                placeholder="Tell us about yourself..."
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                className="profile-textarea"
                rows={4}
              />
            ) : (
              <div className="profile-value">{profileData.bio || 'Not set'}</div>
            )}
          </div>

          <div className="profile-field">
            <label>Experience (Years)</label>
            {isEditing ? (
              <input
                type="number"
                min="0"
                placeholder="Years of experience"
                value={profileData.experienceYears}
                onChange={(e) => setProfileData({ ...profileData, experienceYears: parseInt(e.target.value) || 0 })}
                className="profile-input"
              />
            ) : (
              <div className="profile-value">{profileData.experienceYears} years</div>
            )}
          </div>

          <div className="profile-field">
            <label>Portfolio URL</label>
            {isEditing ? (
              <input
                type="url"
                placeholder="https://your-portfolio.com"
                value={profileData.portfolioUrl}
                onChange={(e) => setProfileData({ ...profileData, portfolioUrl: e.target.value })}
                className="profile-input"
              />
            ) : (
              <div className="profile-value">
                {profileData.portfolioUrl ? (
                  <a href={profileData.portfolioUrl} target="_blank" rel="noopener noreferrer">
                    {profileData.portfolioUrl}
                  </a>
                ) : (
                  'Not set'
                )}
              </div>
            )}
          </div>
        </div>

        {/* Skills Section */}
        <div className="profile-section">
          <h2>Skills</h2>
          <div className="skills-container">
            {profileData.skills.map((skill, index) => (
              <div key={index} className="skill-tag">
                {skill}
                {isEditing && (
                  <button 
                    onClick={() => handleRemoveSkill(skill)}
                    className="remove-skill-btn"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {profileData.skills.length === 0 && !isEditing && (
              <div className="no-skills">No skills added yet</div>
            )}
          </div>

          {isEditing && (
            <div className="add-skill-section">
              <input
                type="text"
                placeholder="Add a skill (e.g., React, Solidity)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                className="profile-input"
              />
              <button onClick={handleAddSkill} className="add-skill-btn">
                + Add Skill
              </button>
            </div>
          )}
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="profile-actions">
            {saveStatus && (
              <div className={`save-status ${saveStatus.type}`}>
                {saveStatus.message}
              </div>
            )}
            <button 
              onClick={handleSave} 
              className="save-profile-btn"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
