export interface VerificationPayload {
  name: string;
  email: string;
  courseName: string;
  courseVersion: string;
  completedAt: number;
  scorePercentage: number;
  xp: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  finalChallengeStatus: 'Passed' | 'Failed';
  checksum: string;
}

export interface VerificationResult {
  isValid: boolean;
  payload?: VerificationPayload;
  errorMessage?: string;
}
