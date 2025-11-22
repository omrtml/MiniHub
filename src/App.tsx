import { useState, useEffect } from 'react';
import { ConnectButton, useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@mysten/dapp-kit/dist/index.css';
import './App.css';
import type { JobDisplay } from './types';
import { ZkLoginPanel } from './components/ZkLoginButton';
import { useZkLogin } from './hooks/useZkLogin';

// Configure query client
const queryClient = new QueryClient();

// Configure network using createNetworkConfig
const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
});

function JobListings() {
  const walletAccount = useCurrentAccount();
  const zkLogin = useZkLogin();
  const [jobs, setJobs] = useState<JobDisplay[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobDisplay[]>([]);
  
  // Check if user is authenticated via either method
  const isAuthenticated = !!walletAccount || zkLogin.isConnected;
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  // Mock data for now - will be replaced with on-chain data
  useEffect(() => {
    // Simulate fetching from blockchain and enriching with off-chain data
    const mockJobs: JobDisplay[] = [
      {
        id: '0x1',
        employer: '0x123abc...',
        title: 'Senior Blockchain Developer',
        description: 'Looking for an experienced blockchain developer to work on Sui ecosystem projects. Must have Move language experience.',
        salary: 150000,
        application_count: 12,
        hired_candidate: null,
        is_active: true,
        deadline: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
        // UI enriched fields
        company: 'Sui Foundation',
        location: 'Remote',
        type: 'Full-time',
        category: 'Engineering',
        salaryDisplay: '$120k - $180k',
        deadlineDisplay: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        postedDate: '2024-11-20'
      },
      {
        id: '0x2',
        employer: '0x456def...',
        title: 'Smart Contract Auditor',
        description: 'Audit Move smart contracts for security vulnerabilities. Experience with blockchain security required.',
        salary: 125000,
        application_count: 8,
        hired_candidate: null,
        is_active: true,
        deadline: Date.now() + 20 * 24 * 60 * 60 * 1000,
        company: 'SecureChain Labs',
        location: 'San Francisco',
        type: 'Contract',
        category: 'Security',
        salaryDisplay: '$100k - $150k',
        deadlineDisplay: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        postedDate: '2024-11-19'
      },
      {
        id: '0x3',
        employer: '0x789ghi...',
        title: 'Web3 Product Manager',
        description: 'Lead product development for our DeFi platform on Sui. Must understand blockchain technology.',
        salary: 140000,
        application_count: 15,
        hired_candidate: null,
        is_active: true,
        deadline: Date.now() + 25 * 24 * 60 * 60 * 1000,
        company: 'DeFi Innovations',
        location: 'New York',
        type: 'Full-time',
        category: 'Product',
        salaryDisplay: '$130k - $170k',
        deadlineDisplay: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        postedDate: '2024-11-18'
      },
    ];
    setJobs(mockJobs);
    setFilteredJobs(mockJobs);
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.company && job.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(job => job.category === selectedCategory);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(job => job.type === selectedType);
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(job => job.location === selectedLocation);
    }

    setFilteredJobs(filtered);
  }, [searchTerm, selectedCategory, selectedType, selectedLocation, jobs]);

  const categories = ['all', ...Array.from(new Set(jobs.map(job => job.category).filter(Boolean)))];
  const types = ['all', ...Array.from(new Set(jobs.map(job => job.type).filter(Boolean)))];
  const locations = ['all', ...Array.from(new Set(jobs.map(job => job.location).filter(Boolean)))];

  return (
    <div className="job-listings-container">
      <div className="filters-section">
        <div className="search-bar">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search jobs by title, company, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label>Category</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Job Type</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              {types.map(type => (
                <option key={type} value={type}>{type === 'all' ? 'All Types' : type}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Location</label>
            <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc === 'all' ? 'All Locations' : loc}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="jobs-header">
        <h2>{filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Found</h2>
        {isAuthenticated && <span className="wallet-indicator">✓ {zkLogin.isConnected ? 'Signed In' : 'Connected'}</span>}
      </div>

      <div className="jobs-grid">
        {filteredJobs.map(job => (
          <div key={job.id} className="job-card">
            <div className="job-header">
              <h3>{job.title}</h3>
              {job.type && <span className="job-type">{job.type}</span>}
            </div>
            {job.company && <div className="job-company">{job.company}</div>}
            <div className="job-meta">
              {job.location && <span className="job-location">📍 {job.location}</span>}
              <span className="job-salary">💰 {job.salaryDisplay || `$${job.salary?.toLocaleString()}`}</span>
            </div>
            <p className="job-description">{job.description}</p>
            <div className="job-footer">
              {job.category && <span className="job-category">{job.category}</span>}
              <span className="job-date">
                {job.postedDate ? `Posted ${new Date(job.postedDate).toLocaleDateString()}` : 'Recently posted'}
              </span>
            </div>
            <div className="job-stats">
              <span>📊 {job.application_count} applications</span>
              <span>⏰ Deadline: {job.deadlineDisplay || new Date(job.deadline).toLocaleDateString()}</span>
            </div>
            <button className="apply-btn" disabled={!isAuthenticated || !job.is_active}>
              {!isAuthenticated ? 'Sign In to Apply' : !job.is_active ? 'Job Closed' : 'Apply Now'}
            </button>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="no-results">
          <h3>No jobs found</h3>
          <p>Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  );
}

function AppContent() {
  const walletAccount = useCurrentAccount();
  const { mutate: disconnectWallet } = useDisconnectWallet();
  const zkLogin = useZkLogin();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Check if user is authenticated via either method
  const isAuthenticated = !!walletAccount || zkLogin.isConnected;
  const userAddress = walletAccount?.address || zkLogin.address;

  // Auto-close modal after successful connection
  useEffect(() => {
    if (isAuthenticated && showAuthModal) {
      const timer = setTimeout(() => {
        setShowAuthModal(false);
      }, 2000); // Close after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, showAuthModal]);

  // Handle disconnect based on auth method
  const handleDisconnect = () => {
    if (zkLogin.isConnected) {
      zkLogin.logout();
    } else if (walletAccount) {
      disconnectWallet();
    }
  };

  return (
    <div className="app">
      <div className="background-gradient"></div>
      <div className="background-grid"></div>
      
      <header className="app-header">
        <div className="logo">
          <div className="logo-icon">MH</div>
          <div className="logo-text">
            <h1>MiniHub</h1>
            <span className="tagline">Sui Job Board</span>
          </div>
        </div>
        <div className="header-actions">
          {isAuthenticated ? (
            <div className="user-info">
              <span className="auth-indicator">
                {zkLogin.isConnected ? '🔐' : '🔗'} Connected
              </span>
              <span className="user-address">
                {userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}
              </span>
              <button 
                onClick={handleDisconnect}
                className="disconnect-btn"
              >
                {zkLogin.isConnected ? 'Sign Out' : 'Disconnect'}
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="connect-btn">
              Connect / Sign In
            </button>
          )}
        </div>
      </header>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="auth-modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAuthModal(false)}>
              ✕
            </button>
            
            <h2 className="modal-title">Connect to MiniHub</h2>
            <p className="modal-subtitle">Choose your preferred authentication method</p>

            {isAuthenticated ? (
              <div className="auth-connected-state">
                <div className="success-badge">
                  <span className="success-icon">✓</span>
                  <h3>Already Connected</h3>
                </div>
                <p className="connected-message">
                  You're connected with {zkLogin.isConnected ? 'zkLogin' : 'wallet'}
                </p>
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="continue-btn"
                >
                  Continue to Jobs
                </button>
              </div>
            ) : (
              <div className="auth-options">
                <div className="auth-section">
                  <h3>Crypto Wallet</h3>
                  <p className="section-desc">Connect with your Sui wallet</p>
                  <ConnectButton />
                </div>

                <div className="auth-divider">
                  <span>OR</span>
                </div>

                <div className="auth-section">
                  <ZkLoginPanel
                    googleClientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
                    redirectUrl={import.meta.env.VITE_REDIRECT_URL || window.location.origin}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="app-main">
        <JobListings />
      </main>

      <footer className="app-footer">
        <p>Built on Sui Network • Secure • Decentralized</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <AppContent />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App;
