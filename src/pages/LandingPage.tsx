import React, { useState } from 'react';
import { GitBranch, Terminal, ShieldCheck, Play, Sparkles, Award, Code, CheckCircle, ArrowRight } from 'lucide-react';
import { sound } from '../game/soundEngine';

interface LandingPageProps {
  onStart: (name: string, email: string) => void;
  onNavigateVerify: () => void;
  existingName?: string;
  existingEmail?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStart,
  onNavigateVerify,
  existingName = '',
  existingEmail = '',
}) => {
  const [name, setName] = useState(existingName);
  const [email, setEmail] = useState(existingEmail);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name to personalize your course credential.');
      return;
    }
    sound.playSuccess();
    onStart(name.trim(), email.trim());
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col justify-between selection:bg-[#238636] selection:text-white font-sans">
      {/* Background glowing developer grid effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#161b22] via-[#0d1117] to-[#0d1117] -z-10" />

      {/* Top Simple Header */}
      <header className="max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#238636] flex items-center justify-center text-white shadow-glow-green">
            <GitBranch className="w-5 h-5" />
          </div>
          <span className="font-bold text-white tracking-tight font-mono text-sm">
            GIT &amp; GITHUB GAME
          </span>
        </div>

        <button
          onClick={onNavigateVerify}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#161b22] hover:bg-[#21262d] text-[#c9d1d9] hover:text-white border border-[#30363d] font-mono text-xs transition"
        >
          <ShieldCheck className="w-4 h-4 text-[#2ea043]" />
          <span>Verify Credential (/verify)</span>
        </button>
      </header>

      {/* Main Hero Container */}
      <main className="max-w-5xl mx-auto px-6 py-10 flex flex-col lg:flex-row items-center gap-12 flex-1 justify-center">
        {/* Left Column: Mission Description */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#161b22] border border-[#30363d] text-xs font-mono text-[#58a6ff]">
            <Sparkles className="w-3.5 h-3.5 text-[#2ea043]" />
            <span>Interactive Visual Simulation • No Reading Docs</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Learn Git &amp; GitHub by <span className="text-[#2ea043] underline decoration-[#238636]/50 underline-offset-8">actually using it.</span>
          </h1>

          <p className="text-base text-[#8b949e] leading-relaxed max-w-xl">
            A developer game designed like modern developer tools (GitHub × VS Code × Terminal). Break things, manipulate commit graphs, resolve merge conflicts, and earn a cryptographically verifiable course certificate.
          </p>

          {/* Quick Feature Pillars */}
          <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs text-[#8b949e]">
            <div className="flex items-center space-x-2 bg-[#161b22] p-2.5 rounded border border-[#30363d]">
              <Terminal className="w-4 h-4 text-[#2ea043]" />
              <span className="text-white">12 Interactive Missions</span>
            </div>
            <div className="flex items-center space-x-2 bg-[#161b22] p-2.5 rounded border border-[#30363d]">
              <GitBranch className="w-4 h-4 text-[#58a6ff]" />
              <span className="text-white">Realtime Commit DAG</span>
            </div>
            <div className="flex items-center space-x-2 bg-[#161b22] p-2.5 rounded border border-[#30363d]">
              <Code className="w-4 h-4 text-[#bc8cff]" />
              <span className="text-white">Interactive PR &amp; Conflicts</span>
            </div>
            <div className="flex items-center space-x-2 bg-[#161b22] p-2.5 rounded border border-[#30363d]">
              <Award className="w-4 h-4 text-[#d29922]" />
              <span className="text-white">Verifiable Certificate</span>
            </div>
          </div>
        </div>

        {/* Right Column: Player Onboarding Box */}
        <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white font-mono flex items-center space-x-2">
              <span className="text-[#2ea043]">&gt;</span>
              <span>Initialize Player</span>
            </h2>
            <p className="text-xs text-[#8b949e]">
              Enter your name and email to record your progress and generate your completion certificate.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="text-[#8b949e] font-semibold block">YOUR NAME / CALLSIGN</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Nirmit Sharma"
                className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-white outline-none focus:border-[#2ea043] transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#8b949e] font-semibold block">EMAIL OR COLLEGE ID (FOR CERTIFICATE)</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. nirmit@college.edu"
                className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-white outline-none focus:border-[#2ea043] transition"
              />
            </div>

            {error && <div className="text-[#f85149] text-[11px] font-semibold">{error}</div>}

            <button
              type="submit"
              className="w-full py-3 bg-[#238636] hover:bg-[#2ea043] text-white font-bold rounded-lg shadow-glow-green flex items-center justify-center space-x-2 transition group text-sm cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white group-hover:translate-x-0.5 transition-transform" />
              <span>START PLAYING GIT GAME</span>
            </button>
          </form>

          <div className="pt-2 border-t border-[#30363d] text-center text-[11px] text-[#8b949e]">
            Progress is automatically saved locally in your browser.
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full px-6 py-6 border-t border-[#21262d] text-center text-xs text-[#8b949e] font-mono flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>Git &amp; GitHub Game — Designed for Developers &amp; Students</div>
        <div className="text-[11px]">Clean • Technical • Minimal • Polished</div>
      </footer>
    </div>
  );
};
