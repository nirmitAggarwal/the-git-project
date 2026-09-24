import { RepositoryState } from './git';

export type ExerciseType = 'terminal' | 'ordering' | 'visual' | 'conflict' | 'github_pr';

export interface OrderingItem {
  id: string;
  text: string;
  order: number;
}

export interface Exercise {
  id: string;
  title: string;
  instruction: string;
  type: ExerciseType;
  hints: string[];
  solutionExplanation: string;
  solutionCommand?: string;
  orderingItems?: OrderingItem[];
  validator: (state: RepositoryState, lastOutput?: string, lastCommand?: string) => boolean;
}

export interface Lesson {
  id: number;
  level: number;
  levelTitle: string;
  title: string;
  summary: string;
  description: string;
  concepts: {
    heading: string;
    body: string;
    codeSnippet?: string;
  }[];
  commandsTaught: string[];
  initialState: RepositoryState;
  exercises: Exercise[];
  badgeReward?: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt?: number;
}

export interface UserProgress {
  name: string;
  email: string;
  xp: number;
  currentLessonId: number;
  completedLessons: number[];
  unlockedBadges: string[];
  attempts: Record<string, number>;
  hintsUsed: Record<string, number>;
  startedAt: number;
  completedAt?: number;
  finalScore?: number;
  verificationCode?: string;
}
