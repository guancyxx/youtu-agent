/**
 * QDUOJ API Service
 * Handles communication with QDUOJ backend
 */

import type { Problem, ProblemFilter, ProblemListResponse, TagResponse } from '../types/problem';

// QDUOJ API base URL - can be configured via environment variable
const QDUOJ_API_BASE = import.meta.env.VITE_QDUOJ_API_URL || 'http://localhost:8000';

/**
 * Fetch problems from QDUOJ API
 */
export async function getProblems(filter: ProblemFilter = {}): Promise<Problem[]> {
  try {
    const params = new URLSearchParams();
    
    if (filter.keyword) {
      params.append('keyword', filter.keyword);
    }
    
    if (filter.tags && filter.tags.length > 0) {
      params.append('tag', filter.tags.join(','));
    }
    
    if (filter.difficulty) {
      params.append('difficulty', filter.difficulty);
    }
    
    params.append('page', String(filter.page || 1));
    params.append('limit', String(filter.limit || 50));

    const url = `${QDUOJ_API_BASE}/api/problem/?${params.toString()}`;
    console.log('Fetching problems from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ProblemListResponse = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data.data.results || [];
  } catch (error) {
    console.error('Error fetching problems:', error);
    throw error;
  }
}

/**
 * Fetch all available tags from QDUOJ API
 */
export async function getTags(): Promise<string[]> {
  try {
    const url = `${QDUOJ_API_BASE}/api/problem/tags/`;
    console.log('Fetching tags from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: TagResponse = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data.data || [];
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
}

/**
 * Get problem details by ID
 */
export async function getProblemById(problemId: string): Promise<Problem | null> {
  try {
    const url = `${QDUOJ_API_BASE}/api/problem/?problem_id=${problemId}`;
    console.log('Fetching problem details from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data.data || null;
  } catch (error) {
    console.error('Error fetching problem details:', error);
    throw error;
  }
}

/**
 * Calculate acceptance rate for a problem
 */
export function getAcceptanceRate(problem: Problem): number {
  if (!problem.submission_number || problem.submission_number === 0) {
    return 0;
  }
  return Math.round((problem.accepted_number / problem.submission_number) * 100);
}

/**
 * Get difficulty color class
 */
export function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'low':
      return 'difficulty-low';
    case 'mid':
      return 'difficulty-mid';
    case 'high':
      return 'difficulty-high';
    default:
      return 'difficulty-unknown';
  }
}
