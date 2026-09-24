import React, { useState, useEffect } from 'react';
import { UserProgress } from './types/lesson';
import { LESSONS } from './data/lessonsData';
import { BADGES } from './data/badgesData';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { LessonPage } from './pages/LessonPage';
import { VerifyPage } from './pages/VerifyPage';
import { VerificationCard } from './components/VerificationCard';
import { generateVerificationToken } from './game/cryptoVerify';
import { VerificationPayload } from './types/verification';
import { ArrowLeft, Award, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'git_github_game_user_progress_v1';

const defaultProgress: UserProgress = {
  name: '',
  email: '',
  xp: 0,
  currentLessonId: 1,
  completedLessons: [],
  unlockedBadges: [],
  attempts: {},
  hintsUsed: {},
  startedAt: Date.now(),
};

export const App: React.FC = () => {
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return defaultProgress;
  });

  // Simple client-side router
  const [route, setRoute] = useState<'landing' | 'dashboard' | 'lesson' | 'certificate' | 'verify'>(() => {
    if (typeof window !== 'undefined' && (window.location.pathname === '/verify' || window.location.hash === '#/verify')) {
      return 'verify';
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) return 'dashboard';
      }
    } catch {
      // ignore
    }
    return 'landing';
  });

  const [currentLessonId, setCurrentLessonId] = useState<number>(() => progress.currentLessonId || 1);
  const [verificationPayload, setVerificationPayload] = useState<VerificationPayload | null>(null);
  const [verificationToken, setVerificationToken] = useState<string>('');

  // Persist progress changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress]);

  // Handle URL hash changes (e.g. #/verify)
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#/verify') {
        setRoute('verify');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleStart = (name: string, email: string) => {
    setProgress(prev => ({
      ...prev,
      name,
      email,
      startedAt: prev.startedAt || Date.now(),
    }));
    setRoute('dashboard');
  };

  const handleUpdateProgress = (patch: Partial<UserProgress>) => {
    setProgress(prev => ({ ...prev, ...patch }));
  };

  const handleSelectLesson = (lessonId: number) => {
    setCurrentLessonId(lessonId);
    setProgress(prev => ({ ...prev, currentLessonId: lessonId }));
    setRoute('lesson');
  };

  const handleCompleteCurriculum = async () => {
    // Generate deterministic verification token
    const completedAt = Date.now();
    const scorePercentage = Math.min(100, Math.max(85, Math.round(98 - (Object.keys(progress.hintsUsed).length * 1.5))));

    const payloadData: Omit<VerificationPayload, 'checksum'> = {
      name: progress.name || 'Developer',
      email: progress.email || 'developer@gitgame.io',
      courseName: 'Git & GitHub Game: Master Curriculum',
      courseVersion: 'v1.0.0-mvp',
      completedAt,
      scorePercentage,
      xp: progress.xp + 500, // Graduation bonus XP!
      completedLessonsCount: 12,
      totalLessonsCount: 12,
      finalChallengeStatus: 'Passed',
    };

    const token = await generateVerificationToken(payloadData);

    const fullPayload: VerificationPayload = {
      ...payloadData,
      checksum: token.split('-')[1] + token.split('-')[2],
    };

    setVerificationToken(token);
    setVerificationPayload(fullPayload);

    // Add final graduation badge
    const newBadges = Array.from(new Set([...progress.unlockedBadges, 'git_grandmaster']));

    setProgress(prev => ({
      ...prev,
      xp: prev.xp + 500,
      completedAt,
      verificationCode: token,
      unlockedBadges: newBadges,
      completedLessons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    }));

    setRoute('certificate');
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.5 },
    });
  };

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset all your progress, badges, and XP?')) {
      localStorage.removeItem(STORAGE_KEY);
      setProgress(defaultProgress);
      setRoute('landing');
    }
  };

  const activeLesson = LESSONS.find(l => l.id === currentLessonId) || LESSONS[0];

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col font-sans">
      {/* Show Navbar on application screens */}
      {route !== 'landing' && route !== 'verify' && (
        <Navbar
          progress={progress}
          onNavigateHome={() => setRoute('dashboard')}
          onNavigateVerify={() => setRoute('verify')}
          onResetProgress={handleResetProgress}
          currentLessonId={currentLessonId}
          onSelectLesson={handleSelectLesson}
        />
      )}

      {/* Screen Router */}
      {route === 'landing' && (
        <LandingPage
          onStart={handleStart}
          onNavigateVerify={() => setRoute('verify')}
          existingName={progress.name}
          existingEmail={progress.email}
        />
      )}

      {route === 'dashboard' && (
        <DashboardPage
          progress={progress}
          lessons={LESSONS}
          onSelectLesson={handleSelectLesson}
          onViewCertificate={() => {
            if (!verificationToken) {
              handleCompleteCurriculum();
            } else {
              setRoute('certificate');
            }
          }}
        />
      )}

      {route === 'lesson' && (
        <LessonPage
          lesson={activeLesson}
          progress={progress}
          onUpdateProgress={handleUpdateProgress}
          onNavigateDashboard={() => setRoute('dashboard')}
          onNavigateLesson={handleSelectLesson}
          onCompleteCurriculum={handleCompleteCurriculum}
        />
      )}

      {route === 'certificate' && (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 flex-1">
          <div className="flex items-center justify-between font-mono text-xs">
            <button
              onClick={() => setRoute('dashboard')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#161b22] hover:bg-[#21262d] text-white border border-[#30363d] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <span className="text-[#2ea043] font-bold flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>100% Course Completed</span>
            </span>
          </div>

          {verificationPayload ? (
            <VerificationCard
              token={verificationToken}
              payload={verificationPayload}
              onNavigateToVerify={() => setRoute('verify')}
            />
          ) : (
            <div className="text-center py-12 text-[#8b949e]">
              Generating credential certificate...
            </div>
          )}
        </div>
      )}

      {route === 'verify' && (
        <VerifyPage
          onBackToApp={() => setRoute(progress.name ? 'dashboard' : 'landing')}
          defaultToken={verificationToken}
        />
      )}
    </div>
  );
};
export default App;
