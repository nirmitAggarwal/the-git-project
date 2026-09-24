import React, { useEffect } from 'react';
import { Badge } from '../types/lesson';
import { Trophy, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LevelBadgeNotificationProps {
  badge: Badge | null;
  xpEarned?: number;
  onClose: () => void;
}

export const LevelBadgeNotification: React.FC<LevelBadgeNotificationProps> = ({
  badge,
  xpEarned = 100,
  onClose,
}) => {
  useEffect(() => {
    if (badge) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });

      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [badge, onClose]);

  if (!badge) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-[#161b22] border-2 border-[#d29922] rounded-xl p-4 shadow-2xl font-mono text-xs animate-slideIn">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-[#d29922]/20 border border-[#d29922] flex items-center justify-center text-2xl shadow-glow-yellow">
            {badge.icon}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center space-x-1 text-[#e3b341] font-bold text-[10px] uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              <span>ACHIEVEMENT UNLOCKED</span>
            </div>
            <div className="text-white font-bold text-sm">{badge.title}</div>
            <div className="text-[#8b949e] text-[11px] leading-tight">{badge.description}</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-[#8b949e] hover:text-white p-1 rounded hover:bg-[#21262d]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 pt-2 border-t border-[#30363d] flex items-center justify-between text-[11px]">
        <span className="text-[#2ea043] font-bold">+{xpEarned} XP Awarded</span>
        <span className="text-[#8b949e]">Saved to profile</span>
      </div>
    </div>
  );
};
