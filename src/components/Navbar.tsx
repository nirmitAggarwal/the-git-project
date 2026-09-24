import React from 'react';
import { UserProgress } from '../types/lesson';
import { GitBranch, Trophy, Volume2, VolumeX, ShieldCheck, RotateCcw, User } from 'lucide-react';
import { sound } from '../game/soundEngine';

interface NavbarProps {
  progress: UserProgress;
  onNavigateHome: () => void;
  onNavigateVerify: () => void;
  onResetProgress: () => void;
  currentLessonId?: number;
  onSelectLesson?: (lessonId: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  progress,
  onNavigateHome,
  onNavigateVerify,
  onResetProgress,
  currentLessonId,
}) => {
  const [muted, setMuted] = React.useState(sound.getMuted());

  const handleToggleSound = () => {
    const isNowMuted = sound.toggleMute();
    setMuted(isNowMuted);
  };

  // Calculate Level based on XP
  const levelNumber = Math.floor(progress.xp / 300) + 1;
  const xpCurrentLevel = progress.xp % 300;
  const levelPercent = Math.min(100, Math.round((xpCurrentLevel / 300) * 100));

  return (
    <nav className="sticky top-0 z-40 w-full bg-[#161b22] border-b border-[#30363d] px-4 py-2.5 font-mono text-xs select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={onNavigateHome}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#238636] flex items-center justify-center text-white shadow-glow-green group-hover:scale-105 transition-transform">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-sm tracking-tight flex items-center space-x-1.5 font-sans">
              <span>GIT &amp; GITHUB GAME</span>
              <span className="text-[10px] bg-[#21262d] text-[#2ea043] px-1.5 py-0.5 rounded border border-[#30363d]">
                MVP
              </span>
            </div>
            <div className="text-[10px] text-[#8b949e]">Interactive Visual Simulator</div>
          </div>
        </div>

        {/* Center: XP & Level Indicator */}
        <div className="hidden md:flex items-center space-x-4 bg-[#0d1117] px-3.5 py-1.5 rounded-full border border-[#30363d]">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#e3b341]">LVL {levelNumber < 10 ? `0${levelNumber}` : levelNumber}</span>
            <div className="w-24 bg-[#21262d] h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#238636] to-[#2ea043] h-full transition-all duration-500"
                style={{ width: `${levelPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-[#8b949e]">{progress.xp} XP</span>
          </div>

          <div className="h-3 w-px bg-[#30363d]" />

          <div className="flex items-center space-x-1.5 text-[#58a6ff]">
            <Trophy className="w-3.5 h-3.5 text-[#d29922]" />
            <span className="font-bold">{progress.unlockedBadges.length} Badges</span>
          </div>

          <div className="h-3 w-px bg-[#30363d]" />

          <div className="text-[#8b949e]">
            {progress.completedLessons.length} / 12 Missions
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center space-x-2">
          {/* Verify Token Page Link */}
          <button
            onClick={onNavigateVerify}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-white border border-[#30363d] transition"
            title="Validator tool for organizers"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#2ea043]" />
            <span className="hidden sm:inline">/verify</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-1.5 rounded bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white border border-[#30363d] transition"
            title={muted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-[#f85149]" /> : <Volume2 className="w-4 h-4 text-[#2ea043]" />}
          </button>

          {/* User profile capsule */}
          <div className="flex items-center space-x-2 pl-1 border-l border-[#30363d]">
            <div className="w-7 h-7 rounded-full bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]/40 flex items-center justify-center font-bold">
              {progress.name ? progress.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="hidden lg:inline text-white font-medium truncate max-w-[100px]">
              {progress.name || 'Developer'}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};
