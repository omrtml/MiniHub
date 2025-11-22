/**
 * MiniHub SDK - Simplified Read-Only Version
 * Only includes getter functions for reading blockchain data
 */

import { SuiClient } from '@mysten/sui/client';

// ====== Types ======

export interface PackageConfig {
  packageId: string;
  jobBoardId: string;
  userRegistryId: string;
  employerRegistryId: string;
  clockId: string;
}

export interface Job {
  id: string;
  employer: string;
  employerProfileId: string;
  title: string;
  description: string;
  salary?: number;
  applicationCount: number;
  hiredCandidate?: string;
  isActive: boolean;
  deadline: number;
}

export interface ApplicationProfile {
  id: string;
  candidate: string;
  userProfileId: string;
  jobId: string;
  coverMessage: string;
  timestamp: number;
  cvUrl: string;
}

export interface UserProfile {
  id: string;
  userAddress: string;
  name: string;
  bio: string;
  avatarUrl: string;
  skills: string[];
  experienceYears: number;
  portfolioUrl: string;
  createdAt: number;
  updatedAt: number;
}

export interface EmployerProfile {
  id: string;
  employerAddress: string;
  companyName: string;
  description: string;
  logoUrl: string;
  website: string;
  industry: string;
  employeeCount: number;
  foundedYear: number;
  createdAt: number;
  updatedAt: number;
}

export interface JobBoard {
  id: string;
  jobCount: number;
  jobIds: string[];
}

// ====== SDK Class ======

export class MiniHubSDK {
  private client: SuiClient;
  private config: PackageConfig;

  constructor(client: SuiClient, config: PackageConfig) {
    this.client = client;
    this.config = config;
  }

  // ====== Getter Functions ======

  /**
   * Get JobBoard object
   */
  async getJobBoard(): Promise<JobBoard | null> {
    try {
      const object = await this.client.getObject({
        id: this.config.jobBoardId,
        options: { showContent: true },
      });

      if (!object.data || !object.data.content || object.data.content.dataType !== 'moveObject') {
        return null;
      }

      const fields = object.data.content.fields as any;
      return {
        id: fields.id.id,
        jobCount: Number(fields.job_count),
        jobIds: fields.job_ids || [],
      };
    } catch (error) {
      console.error('Error fetching JobBoard:', error);
      return null;
    }
  }

  /**
   * Get specific job by ID
   */
  async getJob(jobId: string): Promise<Job | null> {
    try {
      const object = await this.client.getObject({
        id: jobId,
        options: { showContent: true },
      });

      if (!object.data || !object.data.content || object.data.content.dataType !== 'moveObject') {
        return null;
      }

      const fields = object.data.content.fields as any;
      return {
        id: fields.id.id,
        employer: fields.employer,
        employerProfileId: fields.employer_profile_id,
        title: fields.title,
        description: fields.description,
        salary: fields.salary ? Number(fields.salary) : undefined,
        applicationCount: Number(fields.application_count),
        hiredCandidate: fields.hired_candidate || undefined,
        isActive: fields.is_active,
        deadline: Number(fields.deadline),
      };
    } catch (error) {
      console.error('Error fetching Job:', error);
      return null;
    }
  }

  /**
   * Get all jobs
   */
  async getAllJobs(): Promise<Job[]> {
    try {
      const jobBoard = await this.getJobBoard();
      if (!jobBoard || jobBoard.jobIds.length === 0) {
        return [];
      }

      const jobs = await Promise.all(
        jobBoard.jobIds.map(jobId => this.getJob(jobId))
      );

      return jobs.filter((job): job is Job => job !== null);
    } catch (error) {
      console.error('Error fetching all jobs:', error);
      return [];
    }
  }

  /**
   * Get active jobs only
   */
  async getActiveJobs(): Promise<Job[]> {
    const allJobs = await this.getAllJobs();
    return allJobs.filter(job => job.isActive && !job.hiredCandidate);
  }

  /**
   * Get jobs by employer address
   */
  async getJobsByEmployer(employerAddress: string): Promise<Job[]> {
    const allJobs = await this.getAllJobs();
    return allJobs.filter(job => job.employer === employerAddress);
  }

  /**
   * Get user profile
   */
  async getUserProfile(profileId: string): Promise<UserProfile | null> {
    try {
      const object = await this.client.getObject({
        id: profileId,
        options: { showContent: true },
      });

      if (!object.data || !object.data.content || object.data.content.dataType !== 'moveObject') {
        return null;
      }

      const fields = object.data.content.fields as any;
      return {
        id: fields.id.id,
        userAddress: fields.user_address,
        name: fields.name,
        bio: fields.bio,
        avatarUrl: fields.avatar_url,
        skills: fields.skills || [],
        experienceYears: Number(fields.experience_years),
        portfolioUrl: fields.portfolio_url,
        createdAt: Number(fields.created_at),
        updatedAt: Number(fields.updated_at),
      };
    } catch (error) {
      console.error('Error fetching UserProfile:', error);
      return null;
    }
  }

  /**
   * Get employer profile
   */
  async getEmployerProfile(profileId: string): Promise<EmployerProfile | null> {
    try {
      const object = await this.client.getObject({
        id: profileId,
        options: { showContent: true },
      });

      if (!object.data || !object.data.content || object.data.content.dataType !== 'moveObject') {
        return null;
      }

      const fields = object.data.content.fields as any;
      return {
        id: fields.id.id,
        employerAddress: fields.employer_address,
        companyName: fields.company_name,
        description: fields.description,
        logoUrl: fields.logo_url,
        website: fields.website,
        industry: fields.industry,
        employeeCount: Number(fields.employee_count),
        foundedYear: Number(fields.founded_year),
        createdAt: Number(fields.created_at),
        updatedAt: Number(fields.updated_at),
      };
    } catch (error) {
      console.error('Error fetching EmployerProfile:', error);
      return null;
    }
  }

  /**
   * Get application profile
   */
  async getApplicationProfile(applicationId: string): Promise<ApplicationProfile | null> {
    try {
      const object = await this.client.getObject({
        id: applicationId,
        options: { showContent: true },
      });

      if (!object.data || !object.data.content || object.data.content.dataType !== 'moveObject') {
        return null;
      }

      const fields = object.data.content.fields as any;
      return {
        id: fields.id.id,
        candidate: fields.candidate,
        userProfileId: fields.user_profile_id,
        jobId: fields.job_id,
        coverMessage: fields.cover_message,
        timestamp: Number(fields.timestamp),
        cvUrl: fields.cv_url,
      };
    } catch (error) {
      console.error('Error fetching ApplicationProfile:', error);
      return null;
    }
  }
}
