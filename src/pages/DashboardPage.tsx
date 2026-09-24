import React from 'react';
import { UserProgress, Lesson, Badge } from '../types/lesson';
import { BADGES } from '../data/badgesData';
import {
  Play,
  CheckCircle,
  Lock,
  Trophy,
  Zap,
  ArrowRight,
  Award,
  Sparkles,
  BookOpen,
  GitBranch,
} from 'lucide-react';
import { sound } from '../game/soundEngine';

interface DashboardPageProps {
  progress: UserProgress;
  lessons: Lesson[];
  onSelectLesson: (lessonId: number) => void;
  onViewCertificate: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  progress,
  lessons,
  onSelectLesson,
  onViewCertificate,
}) => {
  const completedCount = progress.completedLessons.length;
  const totalCount = lessons.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Next active lesson to continue
  const nextLessonId =
    lessons.find(l => !progress.completedLessons.includes(l.id))?.id || 12;
  const nextLesson = lessons.find(l => l.id === nextLessonId) || lessons[0];

  const allCompleted = completedCount >= totalCount;

  // Group lessons by level
  const levels = [
    { level: 1, title: 'Level 1 — Git Fundamentals', lessons: lessons.filter(l => l.level === 1) },
    { level: 2, title: 'Level 2 — Working With History', lessons: lessons.filter(l => l.level === 2) },
    { level: 3, title: 'Level 3 — Branching', lessons: lessons.filter(l => l.level === 3) },
    { level: 4, title: 'Level 4 — Merge Conflicts', lessons: lessons.filter(l => l.level === 4) },
    { level: 5, title: 'Level 5 — GitHub', lessons: lessons.filter(l => l.level === 5) },
    { level: 6, title: 'Level 6 — Collaboration & Capstone', lessons: lessons.filter(l => l.level === 6) },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 font-sans">
      {/* Top Welcome & Mission Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-[#161b22] border border-[#30363d] rounded-2xl shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#58a6ff]">
            <span className="w-2 h-2 rounded-full bg-[#2ea043] animate-ping"></span>
            <span>PLAYER ACTIVE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome, {progress.name || 'Developer'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#8b949e] font-mono">
            Overall Curriculum Progress: {completedCount} of {totalCount} Missions Completed ({progressPercent}%)
          </p>

          {/* Progress Bar */}
          <div className="w-full max-w-md bg-[#0d1117] h-2.5 rounded-full overflow-hidden border border-[#30363d] mt-2">
            <div
              className="bg-gradient-to-r from-[#238636] to-[#2ea043] h-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {allCompleted ? (
            <button
              onClick={() => {
                sound.playFanfare();
                onViewCertificate();
              }}
              className="w-full sm:w-auto px-6 py-3 bg-[#d29922] hover:bg-[#e3b341] text-black font-bold font-mono rounded-xl shadow-glow-yellow flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <Award className="w-5 h-5 text-black" />
              <span>VIEW COURSE CERTIFICATE</span>
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playSuccess();
                onSelectLesson(nextLessonId);
              }}
              className="w-full sm:w-auto px-6 py-3 bg-[#238636] hover:bg-[#2ea043] text-white font-bold font-mono rounded-xl shadow-glow-green flex items-center justify-center space-x-2 transition cursor-pointer group"
            >
              <Play className="w-4 h-4 fill-white group-hover:translate-x-0.5 transition-transform" />
              <span>CONTINUE: MISSION {nextLesson.id}</span>
            </button>
          )}
        </div>
      </div>

      {/* Curriculum Grid grouped by Level */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
          <h2 className="text-lg font-bold text-white font-mono flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-[#58a6ff]" />
            <span>LEARNING PATHWAY (12 MISSIONS)</span>
          </h2>
          <span className="text-xs font-mono text-[#8b949e]">{progress.xp} Total XP</span>
        </div>

        <div className="space-y-6">
          {levels.map(lvl => (
            <div key={lvl.level} className="space-y-3">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#8b949e]">
                {lvl.title}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lvl.lessons.map(lesson => {
                  const isCompleted = progress.completedLessons.includes(lesson.id);
                  // Available if previous lesson completed or if lesson 1
                  const isUnlocked =
                    lesson.id === 1 || progress.completedLessons.includes(lesson.id - 1);

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => {
                        if (isUnlocked) {
                          sound.playKeypress();
                          onSelectLesson(lesson.id);
                        }
                      }}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        isCompleted
                          ? 'bg-[#161b22] border-[#2ea043]/50 hover:border-[#2ea043] cursor-pointer'
                          : isUnlocked
                          ? 'bg-[#161b22] border-[#58a6ff]/50 hover:border-[#58a6ff] hover:shadow-glow-blue cursor-pointer'
                          : 'bg-[#161b22]/40 border-[#30363d]/40 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              isCompleted
                                ? 'bg-[#238636]/20 text-[#2ea043]'
                                : isUnlocked
                                ? 'bg-[#58a6ff]/20 text-[#58a6ff]'
                                : 'bg-[#21262d] text-[#8b949e]'
                            }`}
                          >
                            Mission {lesson.id < 10 ? `0${lesson.id}` : lesson.id}
                          </span>

                          {isCompleted ? (
                            <span className="flex items-center space-x-1 text-[#2ea043] font-bold">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Done</span>
                            </span>
                          ) : isUnlocked ? (
                            <span className="text-[#58a6ff] font-bold">Ready</span>
                          ) : (
                            <span className="flex items-center space-x-1 text-[#8b949e]">
                              <Lock className="w-3 h-3" />
                              <span>Locked</span>
                            </span>
                          )}
                        </div>

                        <h3 className="text-white font-bold text-sm leading-snug">{lesson.title}</h3>
                        <p className="text-xs text-[#8b949e] line-clamp-2 leading-relaxed">
                          {lesson.summary}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-[#30363d]/50 flex items-center justify-between font-mono text-[11px] text-[#8b949e]">
                        <span className="truncate max-w-[150px]">
                          {lesson.commandsTaught.slice(0, 2).join(', ')}
                        </span>
                        {isUnlocked && (
                          <span className="text-[#58a6ff] flex items-center space-x-1 hover:underline">
                            <span>Open</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges & Achievements Showcase */}
      <div className="space-y-4 pt-4 border-t border-[#30363d]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white font-mono flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-[#d29922]" />
            <span>ACHIEVEMENTS &amp; BADGES ({progress.unlockedBadges.length} / {BADGES.length})</span>
          </h2>
          <span className="text-xs font-mono text-[#8b949e]">Earn badges by completing challenges</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {BADGES.map(badge => {
            const isEarned = progress.unlockedBadges.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-3 rounded-xl border flex flex-col items-center text-center space-y-1.5 transition ${
                  isEarned
                    ? 'bg-[#161b22] border-[#d29922]/50 shadow-glow-yellow'
                    : 'bg-[#161b22]/30 border-[#30363d]/30 opacity-40 grayscale'
                }`}
              >
                <div className="text-2xl">{badge.icon}</div>
                <div className="text-xs font-bold text-white font-mono truncate w-full">
                  {badge.title}
                </div>
                <div className="text-[10px] text-[#8b949e] leading-tight line-clamp-2">
                  {badge.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
