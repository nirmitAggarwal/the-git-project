import React, { useState } from 'react';
import { Exercise, Lesson } from '../types/lesson';
import {
  CheckCircle2,
  Lightbulb,
  HelpCircle,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Zap,
  ArrowUp,
  ArrowDown,
  Layers,
} from 'lucide-react';
import { sound } from '../game/soundEngine';

interface ExercisePanelProps {
  lesson: Lesson;
  currentExerciseIndex: number;
  completedExerciseIds: string[];
  onOrderSubmit?: (items: { id: string; order: number }[]) => void;
  onNextLesson?: () => void;
  onSelectExercise: (index: number) => void;
  hintsUsedCount: number;
  attemptsCount: number;
  onUseHint: () => void;
}

export const ExercisePanel: React.FC<ExercisePanelProps> = ({
  lesson,
  currentExerciseIndex,
  completedExerciseIds,
  onOrderSubmit,
  onNextLesson,
  onSelectExercise,
  hintsUsedCount,
  attemptsCount,
  onUseHint,
}) => {
  const currentExercise = lesson.exercises[currentExerciseIndex] || lesson.exercises[0];
  const isCurrentCompleted = completedExerciseIds.includes(currentExercise?.id);
  const areAllCompleted = lesson.exercises.every(ex => completedExerciseIds.includes(ex.id));

  // Ordering exercise state
  const [orderedList, setOrderedList] = useState(currentExercise?.orderingItems || []);
  const [orderFeedback, setOrderFeedback] = useState<string | null>(null);

  // Sync ordered items when exercise changes
  React.useEffect(() => {
    if (currentExercise?.orderingItems) {
      // Shuffle slightly for challenge
      const shuffled = [...currentExercise.orderingItems].sort(() => Math.random() - 0.5);
      setOrderedList(shuffled);
    }
  }, [currentExercise]);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    sound.playKeypress();
    const newList = [...orderedList];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newList.length) return;

    const temp = newList[index];
    newList[index] = newList[targetIdx];
    newList[targetIdx] = temp;
    setOrderedList(newList);
  };

  const handleValidateOrdering = () => {
    // Check if sorted order is 1, 2, 3...
    const isCorrect = orderedList.every((item, idx) => item.order === idx + 1);
    if (isCorrect) {
      sound.playSuccess();
      setOrderFeedback('Correct! The workflow is properly aligned.');
      if (onOrderSubmit) {
        onOrderSubmit(orderedList);
      }
    } else {
      sound.playError();
      setOrderFeedback('Not quite right yet. Check the sequence of steps and try again.');
    }
  };

  return (
    <div className="w-full bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden font-mono text-xs flex flex-col shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d1117] border-b border-[#30363d]">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-[#e3b341]" />
          <span className="font-bold text-[#c9d1d9] uppercase tracking-wide">
            MISSION EXERCISES ({lesson.exercises.length})
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          {lesson.exercises.map((ex, i) => {
            const done = completedExerciseIds.includes(ex.id);
            const active = i === currentExerciseIndex;
            return (
              <button
                key={ex.id}
                onClick={() => onSelectExercise(i)}
                className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition ${
                  done
                    ? 'bg-[#238636] text-white'
                    : active
                    ? 'bg-[#58a6ff] text-white ring-2 ring-[#58a6ff]/40'
                    : 'bg-[#21262d] text-[#8b949e] hover:bg-[#30363d]'
                }`}
              >
                {done ? '✓' : i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Exercise Content */}
      <div className="p-4 space-y-4 flex-1">
        {/* Title & Status */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase text-[#58a6ff] font-bold">
              Task {currentExerciseIndex + 1} of {lesson.exercises.length}
            </span>
            <h3 className="text-white text-sm font-bold mt-0.5">{currentExercise.title}</h3>
          </div>

          {isCurrentCompleted && (
            <span className="px-2 py-0.5 rounded bg-[#238636]/20 text-[#2ea043] border border-[#2ea043]/30 font-bold flex items-center space-x-1 shrink-0 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>COMPLETED</span>
            </span>
          )}
        </div>

        {/* Instructions */}
        <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-md text-[#c9d1d9] leading-relaxed">
          {currentExercise.instruction}
        </div>

        {/* Ordering Exercise UI */}
        {currentExercise.type === 'ordering' && currentExercise.orderingItems && (
          <div className="space-y-2 pt-1">
            <div className="text-[11px] text-[#8b949e]">
              Arrange the steps in order using the arrows:
            </div>
            <div className="space-y-1.5">
              {orderedList.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 bg-[#0d1117] border border-[#30363d] rounded text-white"
                >
                  <span className="text-xs">{item.text}</span>
                  <div className="flex items-center space-x-1 shrink-0 ml-2">
                    <button
                      onClick={() => moveItem(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-[#21262d] disabled:opacity-30 text-[#8b949e] hover:text-white"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveItem(idx, 'down')}
                      disabled={idx === orderedList.length - 1}
                      className="p-1 rounded hover:bg-[#21262d] disabled:opacity-30 text-[#8b949e] hover:text-white"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              {orderFeedback && (
                <span
                  className={`text-[11px] ${
                    orderFeedback.startsWith('Correct') ? 'text-[#2ea043]' : 'text-[#f85149]'
                  }`}
                >
                  {orderFeedback}
                </span>
              )}
              <button
                onClick={handleValidateOrdering}
                className="ml-auto px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white font-bold rounded shadow-glow-green"
              >
                Verify Sequence
              </button>
            </div>
          </div>
        )}

        {/* Progressive Hint Accordion */}
        <div className="pt-2 border-t border-[#21262d] space-y-2">
          <div className="flex items-center justify-between text-[#8b949e] text-[11px]">
            <div className="flex items-center space-x-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-[#d29922]" />
              <span>
                Progressive Hints ({Math.min(hintsUsedCount, currentExercise.hints.length)} /{' '}
                {currentExercise.hints.length})
              </span>
            </div>
            {hintsUsedCount < currentExercise.hints.length ? (
              <button
                onClick={() => {
                  sound.playKeypress();
                  onUseHint();
                }}
                className="text-[#58a6ff] hover:underline"
              >
                + Unlock Hint
              </button>
            ) : (
              <span className="text-[#8b949e]">All hints unlocked</span>
            )}
          </div>

          {hintsUsedCount > 0 && (
            <div className="space-y-1.5">
              {currentExercise.hints.slice(0, hintsUsedCount).map((hint, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-[#d29922]/10 border border-[#d29922]/30 text-[#e3b341] text-[11px] leading-relaxed animate-fadeIn"
                >
                  <span className="font-bold mr-1">Hint {idx + 1}:</span>
                  {hint}
                </div>
              ))}
            </div>
          )}

          {/* Solution revelation after several attempts or full hints */}
          {(hintsUsedCount >= currentExercise.hints.length || attemptsCount >= 4) &&
            currentExercise.solutionCommand && (
              <div className="p-2.5 rounded bg-[#1f242c] border border-[#58a6ff]/40 text-[#c9d1d9] space-y-1">
                <span className="text-[10px] text-[#58a6ff] font-bold block">SOLUTION:</span>
                <code className="text-[#39d353] font-bold">{currentExercise.solutionCommand}</code>
                <p className="text-[10px] text-[#8b949e]">{currentExercise.solutionExplanation}</p>
              </div>
            )}
        </div>
      </div>

      {/* Bottom Completion Banner */}
      {areAllCompleted && (
        <div className="p-3 bg-[#238636]/15 border-t border-[#2ea043]/30 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[#2ea043]">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span className="font-bold text-xs">All exercises in this lesson solved!</span>
          </div>
          {onNextLesson && (
            <button
              onClick={() => {
                sound.playFanfare();
                onNextLesson();
              }}
              className="px-4 py-1.5 rounded bg-[#238636] hover:bg-[#2ea043] text-white font-bold flex items-center space-x-1.5 shadow-glow-green transition"
            >
              <span>Next Lesson</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
