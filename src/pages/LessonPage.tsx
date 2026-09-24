import React, { useState, useEffect } from 'react';
import { Lesson, UserProgress } from '../types/lesson';
import { RepositoryState, CommandOutput, Commit } from '../types/git';
import { GitEngine } from '../game/gitEngine';
import { GitGraphCanvas } from '../components/GitGraphCanvas';
import { StagingAreaVisualizer } from '../components/StagingAreaVisualizer';
import { Terminal } from '../components/Terminal';
import { ConflictResolverModal } from '../components/ConflictResolverModal';
import { GitHubSimulator } from '../components/GitHubSimulator';
import { ExercisePanel } from '../components/ExercisePanel';
import { LevelBadgeNotification } from '../components/LevelBadgeNotification';
import { BADGES } from '../data/badgesData';
import { sound } from '../game/soundEngine';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Zap,
  Code,
  Layers,
  Cloud,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LessonPageProps {
  lesson: Lesson;
  progress: UserProgress;
  onUpdateProgress: (updated: Partial<UserProgress>) => void;
  onNavigateDashboard: () => void;
  onNavigateLesson: (lessonId: number) => void;
  onCompleteCurriculum: () => void;
}

export const LessonPage: React.FC<LessonPageProps> = ({
  lesson,
  progress,
  onUpdateProgress,
  onNavigateDashboard,
  onNavigateLesson,
  onCompleteCurriculum,
}) => {
  // Lesson specific repository state
  const [repoState, setRepoState] = useState<RepositoryState>(() => {
    // Clone lesson initial state
    return JSON.parse(JSON.stringify(lesson.initialState));
  });

  const [activeTab, setActiveTab] = useState<'concepts' | 'exercises'>('concepts');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>([]);
  const [recentBadge, setRecentBadge] = useState<any | null>(null);
  const [visualView, setVisualView] = useState<'graph' | 'staging' | 'github'>('graph');

  // Track attempts and hints per exercise
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);

  // Reset lesson state if lesson changes
  useEffect(() => {
    setRepoState(JSON.parse(JSON.stringify(lesson.initialState)));
    setCurrentExerciseIndex(0);
    setCompletedExerciseIds([]);
    setAttempts(0);
    setHintsUsed(0);
    // Default view: if GitHub lesson, start with github or graph
    if (lesson.id >= 9 && lesson.id <= 11) {
      setVisualView('github');
    } else {
      setVisualView('graph');
    }
  }, [lesson.id]);

  const currentExercise = lesson.exercises[currentExerciseIndex] || lesson.exercises[0];

  // Helper to check exercise completion
  const checkExercise = (state: RepositoryState, lastOutput?: string, lastCmd?: string) => {
    if (!currentExercise || completedExerciseIds.includes(currentExercise.id)) return;

    const isPassed = currentExercise.validator(state, lastOutput, lastCmd);
    if (isPassed) {
      sound.playSuccess();
      const updatedCompleted = [...completedExerciseIds, currentExercise.id];
      setCompletedExerciseIds(updatedCompleted);

      // Award XP (+100 for exercise, +50 bonus if no hints)
      let bonusXp = 50;
      if (hintsUsed === 0) bonusXp += 25;
      if (attempts <= 1) bonusXp += 25;

      const newXp = progress.xp + bonusXp;

      // Check if all exercises in this lesson are complete
      if (updatedCompleted.length >= lesson.exercises.length) {
        sound.playFanfare();
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
        });

        const newCompletedLessons = Array.from(new Set([...progress.completedLessons, lesson.id]));
        const newBadges = [...progress.unlockedBadges];

        // Award badge if configured
        if (lesson.badgeReward && !newBadges.includes(lesson.badgeReward)) {
          newBadges.push(lesson.badgeReward);
          const badgeObj = BADGES.find(b => b.id === lesson.badgeReward);
          if (badgeObj) {
            setRecentBadge(badgeObj);
          }
        }

        onUpdateProgress({
          xp: newXp + 100, // +100 completion bonus
          completedLessons: newCompletedLessons,
          unlockedBadges: newBadges,
        });

        // If lesson 12 completed, trigger completion flow
        if (lesson.id === 12) {
          setTimeout(() => {
            onCompleteCurriculum();
          }, 2000);
        }
      } else {
        onUpdateProgress({ xp: newXp });
        // Automatically proceed to next exercise in this lesson
        setCurrentExerciseIndex(prev => prev + 1);
        setAttempts(0);
        setHintsUsed(0);
      }
    }
  };

  // Handle command execution from terminal
  const handleExecuteCommand = (rawCommand: string): CommandOutput => {
    setAttempts(prev => prev + 1);

    const author = `${progress.name || 'Developer'} <${progress.email || 'dev@gitgame.io'}>`;
    const result = GitEngine.execute(rawCommand, repoState, author);

    setRepoState(result.nextState);

    // Validate exercise
    checkExercise(result.nextState, result.output.stdout, rawCommand);

    return result.output;
  };

  // Handle quick actions from StagingAreaVisualizer
  const handleQuickStage = (filename: string) => {
    handleExecuteCommand(`git add ${filename}`);
  };

  const handleQuickUnstage = (filename: string) => {
    handleExecuteCommand(`git restore --staged ${filename}`);
  };

  // Handle conflict resolution from modal
  const handleResolveConflict = (resolvedContent: string) => {
    if (!repoState.conflict) return;
    const fname = repoState.conflict.file;

    // Apply resolved content to working directory and staged files
    const nextState = { ...repoState };
    nextState.workingDirectory[fname] = resolvedContent;
    nextState.stagedFiles[fname] = resolvedContent;
    nextState.conflict = null;

    setRepoState(nextState);
    checkExercise(nextState, 'CONFLICT_RESOLVED', `git add ${fname}`);
  };

  // Handle ordering exercise submit
  const handleOrderSubmit = () => {
    checkExercise(repoState, 'ORDER_VALID');
  };

  // Handle PR merge from GitHub simulation
  const handlePRMerged = () => {
    // Merge feature-profile into main in state
    const nextState = { ...repoState };
    if (nextState.branches['feature-profile']) {
      const commitId = nextState.branches['feature-profile'];
      nextState.branches['main'] = commitId;
      nextState.headCommitId = commitId;
      nextState.remoteTrackingBranches['origin/main'] = commitId;
    }
    setRepoState(nextState);
    checkExercise(nextState, 'PR_MERGED');
  };

  const handleResetRepo = () => {
    sound.playKeypress();
    setRepoState(JSON.parse(JSON.stringify(lesson.initialState)));
    setCompletedExerciseIds([]);
    setAttempts(0);
    setHintsUsed(0);
  };

  const handleNextLesson = () => {
    if (lesson.id < 12) {
      onNavigateLesson(lesson.id + 1);
    } else {
      onCompleteCurriculum();
    }
  };

  const handlePrevLesson = () => {
    if (lesson.id > 1) {
      onNavigateLesson(lesson.id - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col font-sans">
      {/* Lesson Header Navigation */}
      <div className="bg-[#161b22] border-b border-[#30363d] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs select-none">
        <div className="flex items-center space-x-3">
          <button
            onClick={onNavigateDashboard}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Missions</span>
          </button>

          <div className="h-4 w-px bg-[#30363d]" />

          <div>
            <div className="text-[10px] text-[#8b949e] uppercase font-bold">{lesson.levelTitle}</div>
            <div className="text-white font-bold text-sm font-sans flex items-center space-x-2">
              <span>
                Mission {lesson.id < 10 ? `0${lesson.id}` : lesson.id}: {lesson.title}
              </span>
              {progress.completedLessons.includes(lesson.id) && (
                <CheckCircle className="w-4 h-4 text-[#2ea043] inline-block" />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleResetRepo}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white transition"
            title="Reset repository to initial lesson state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Repo</span>
          </button>

          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrevLesson}
              disabled={lesson.id <= 1}
              className="px-2 py-1 rounded bg-[#21262d] hover:bg-[#30363d] disabled:opacity-30 text-white"
            >
              Prev
            </button>
            <button
              onClick={handleNextLesson}
              disabled={lesson.id >= 12}
              className="px-2.5 py-1 rounded bg-[#238636] hover:bg-[#2ea043] disabled:opacity-30 text-white font-bold"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split Workspace */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Lesson Explanations & Exercises (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Sub Navigation: Concepts vs Exercises */}
          <div className="flex bg-[#161b22] border border-[#30363d] rounded-lg p-1 font-mono text-xs">
            <button
              onClick={() => {
                sound.playKeypress();
                setActiveTab('concepts');
              }}
              className={`flex-1 py-1.5 rounded flex items-center justify-center space-x-1.5 font-bold transition ${
                activeTab === 'concepts'
                  ? 'bg-[#238636] text-white shadow-glow-green'
                  : 'text-[#8b949e] hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Explanation &amp; Concepts</span>
            </button>

            <button
              onClick={() => {
                sound.playKeypress();
                setActiveTab('exercises');
              }}
              className={`flex-1 py-1.5 rounded flex items-center justify-center space-x-1.5 font-bold transition ${
                activeTab === 'exercises'
                  ? 'bg-[#238636] text-white shadow-glow-green'
                  : 'text-[#8b949e] hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>
                Exercises ({completedExerciseIds.length}/{lesson.exercises.length})
              </span>
            </button>
          </div>

          {/* Concepts Tab Body */}
          {activeTab === 'concepts' ? (
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 space-y-5 overflow-y-auto flex-1 font-mono text-xs shadow-md">
              <div className="space-y-2">
                <span className="text-[10px] text-[#58a6ff] uppercase font-bold tracking-wider">
                  MISSION BRIEFING
                </span>
                <h2 className="text-xl font-bold text-white font-sans">{lesson.title}</h2>
                <div className="text-[#8b949e] text-xs leading-relaxed whitespace-pre-line font-sans">
                  {lesson.description}
                </div>
              </div>

              {/* Key Concept Modules */}
              <div className="space-y-4 pt-2">
                {lesson.concepts.map((concept, i) => (
                  <div key={i} className="p-3.5 bg-[#0d1117] border border-[#30363d] rounded-lg space-y-2">
                    <h3 className="text-white font-bold text-xs flex items-center space-x-1.5 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2ea043]"></span>
                      <span>{concept.heading}</span>
                    </h3>
                    <p className="text-[#8b949e] text-[11px] leading-relaxed font-sans">{concept.body}</p>
                    {concept.codeSnippet && (
                      <pre className="p-2.5 bg-[#161b22] border border-[#21262d] rounded text-[#79c0ff] text-[11px] overflow-x-auto leading-relaxed">
                        {concept.codeSnippet}
                      </pre>
                    )}
                  </div>
                ))}
              </div>

              {/* Commands Covered */}
              <div className="pt-2 border-t border-[#30363d] space-y-2">
                <span className="text-[10px] text-[#8b949e] font-bold block uppercase">
                  Commands Taught in this Mission:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {lesson.commandsTaught.map((cmd, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-[#21262d] text-[#2ea043] border border-[#30363d] text-[11px]"
                    >
                      {cmd}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA to start exercises */}
              <button
                onClick={() => {
                  sound.playKeypress();
                  setActiveTab('exercises');
                }}
                className="w-full py-2.5 bg-[#238636] hover:bg-[#2ea043] text-white font-bold rounded-lg flex items-center justify-center space-x-2 transition shadow-glow-green cursor-pointer"
              >
                <span>Ready? Start Exercise Tasks</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Exercises Tab Body */
            <ExercisePanel
              lesson={lesson}
              currentExerciseIndex={currentExerciseIndex}
              completedExerciseIds={completedExerciseIds}
              onOrderSubmit={handleOrderSubmit}
              onNextLesson={handleNextLesson}
              onSelectExercise={setCurrentExerciseIndex}
              hintsUsedCount={hintsUsed}
              attemptsCount={attempts}
              onUseHint={() => setHintsUsed(prev => prev + 1)}
            />
          )}
        </div>

        {/* Right Column: Interactive Visualizations & Terminal (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Visual Mode Selector Tabs */}
          <div className="flex items-center justify-between bg-[#161b22] px-3 py-1.5 border border-[#30363d] rounded-lg font-mono text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-[#8b949e] text-[11px] hidden sm:inline">VISUAL VIEW:</span>
              <button
                onClick={() => {
                  sound.playKeypress();
                  setVisualView('graph');
                }}
                className={`px-2.5 py-1 rounded transition ${
                  visualView === 'graph'
                    ? 'bg-[#21262d] text-[#58a6ff] font-bold border border-[#30363d]'
                    : 'text-[#8b949e] hover:text-white'
                }`}
              >
                Git Graph (DAG)
              </button>

              <button
                onClick={() => {
                  sound.playKeypress();
                  setVisualView('staging');
                }}
                className={`px-2.5 py-1 rounded transition ${
                  visualView === 'staging'
                    ? 'bg-[#21262d] text-[#2ea043] font-bold border border-[#30363d]'
                    : 'text-[#8b949e] hover:text-white'
                }`}
              >
                The 3 Trees (Staging)
              </button>

              {lesson.id >= 9 && (
                <button
                  onClick={() => {
                    sound.playKeypress();
                    setVisualView('github');
                  }}
                  className={`px-2.5 py-1 rounded transition ${
                    visualView === 'github'
                      ? 'bg-[#21262d] text-[#bc8cff] font-bold border border-[#30363d]'
                      : 'text-[#8b949e] hover:text-white'
                  }`}
                >
                  GitHub Simulator
                </button>
              )}
            </div>

            <div className="text-[11px] text-[#8b949e]">
              Branch: <span className="text-[#58a6ff] font-bold">{repoState.currentBranch}</span>
            </div>
          </div>

          {/* Conflict Resolver Banner (Automatically appears if conflict occurs) */}
          {repoState.conflict && (
            <ConflictResolverModal
              conflict={repoState.conflict}
              onResolve={handleResolveConflict}
            />
          )}

          {/* Active Visual Mode */}
          {visualView === 'graph' && <GitGraphCanvas repoState={repoState} />}
          {visualView === 'staging' && (
            <StagingAreaVisualizer
              repoState={repoState}
              onQuickStage={handleQuickStage}
              onQuickUnstage={handleQuickUnstage}
            />
          )}
          {visualView === 'github' && (
            <GitHubSimulator repoState={repoState} onPRMerged={handlePRMerged} />
          )}

          {/* Interactive Developer Terminal */}
          <Terminal
            currentBranch={repoState.currentBranch}
            onExecuteCommand={handleExecuteCommand}
            availableFiles={Object.keys(repoState.workingDirectory)}
            suggestedCommand={currentExercise?.solutionCommand}
            onShowHint={() => {
              setActiveTab('exercises');
              setHintsUsed(prev => prev + 1);
            }}
          />
        </div>
      </div>

      {/* Achievement Unlocked Popup Notification */}
      <LevelBadgeNotification
        badge={recentBadge}
        xpEarned={150}
        onClose={() => setRecentBadge(null)}
      />
    </div>
  );
};
