/**
 * Problem types for QDUOJ integration
 */

export interface Problem {
  id: number;
  title: string;
  _id: string;
  difficulty: 'Low' | 'Mid' | 'High';
  tags: string[];
  submission_number: number;
  accepted_number: number;
  created_by?: {
    id: number;
    username: string;
    real_name?: string;
  };
  statistic_info?: {
    submission_number: number;
    accepted_number: number;
  };
}

export interface ProblemFilter {
  keyword?: string;
  tags?: string[];
  difficulty?: 'Low' | 'Mid' | 'High' | null;
  page?: number;
  limit?: number;
}

export interface ProblemListResponse {
  error: string | null;
  data: {
    total: number;
    results: Problem[];
  };
}

export interface TagResponse {
  error: string | null;
  data: string[];
}
