import React, { useState } from 'react';
import { GitPullRequest, Check, MessageSquare, FileDiff, Sparkles, X, GitMerge } from 'lucide-react';
import { sound } from '../game/soundEngine';
import confetti from 'canvas-confetti';

interface PullRequestModalProps {
  sourceBranch: string;
  targetBranch: string;
  onMergePR: () => void;
  onClose?: () => void;
}

export const PullRequestModal: React.FC<PullRequestModalProps> = ({
  sourceBranch,
  targetBranch,
  onMergePR,
  onClose,
}) => {
  const [prTitle, setPrTitle] = useState('Add responsive profile page & navigation');
  const [prDescription, setPrDescription] = useState(
    '### What does this PR do?\n- Adds user profile component\n- Updates responsive mobile navigation\n- Cleans up CSS styling\n\n### Tested on:\n- Chrome, Firefox, Safari'
  );
  const [activeTab, setActiveTab] = useState<'conversation' | 'files'>('conversation');
  const [reviewApproved, setReviewApproved] = useState(false);
  const [isMerged, setIsMerged] = useState(false);

  const handleApprove = () => {
    sound.playSuccess();
    setReviewApproved(true);
  };

  const handleMerge = () => {
    sound.playFanfare();
    setIsMerged(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    setTimeout(() => {
      onMergePR();
    }, 1200);
  };

  return (
    <div className="w-full bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl font-mono text-xs overflow-hidden my-3 animate-fadeIn">
      {/* PR Header */}
      <div className="p-4 bg-[#0d1117] border-b border-[#30363d] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-white text-[11px] font-bold flex items-center space-x-1 ${
                isMerged ? 'bg-[#8957e5]' : 'bg-[#238636]'
              }`}
            >
              {isMerged ? <GitMerge className="w-3 h-3" /> : <GitPullRequest className="w-3 h-3" />}
              <span>{isMerged ? 'Merged' : 'Open'}</span>
            </span>
            <span className="text-white font-bold text-sm">#42 {prTitle}</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-[#8b949e] hover:text-white p-1 rounded">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-[#8b949e]">
          <span>wants to merge 1 commit into</span>
          <span className="bg-[#21262d] text-[#58a6ff] px-1.5 py-0.5 rounded">{targetBranch}</span>
          <span>from</span>
          <span className="bg-[#21262d] text-[#bc8cff] px-1.5 py-0.5 rounded">{sourceBranch}</span>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 border-b border-[#30363d] pt-2 mt-1">
          <button
            onClick={() => setActiveTab('conversation')}
            className={`pb-2 px-1 flex items-center space-x-1.5 border-b-2 font-medium transition ${
              activeTab === 'conversation'
                ? 'border-[#f78166] text-white'
                : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Conversation (1)</span>
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`pb-2 px-1 flex items-center space-x-1.5 border-b-2 font-medium transition ${
              activeTab === 'files'
                ? 'border-[#f78166] text-white'
                : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
            }`}
          >
            <FileDiff className="w-3.5 h-3.5" />
            <span>Files changed (2)</span>
          </button>
        </div>
      </div>

      {/* PR Body */}
      <div className="p-4 space-y-4">
        {activeTab === 'conversation' ? (
          <>
            {/* PR Description Box */}
            <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-md">
              <div className="flex items-center justify-between pb-2 border-b border-[#21262d] text-[#8b949e] text-[10px]">
                <span className="font-bold text-[#c9d1d9]">nirmit-dev commented 10 minutes ago</span>
                <span className="bg-[#21262d] px-1.5 py-0.2 rounded text-[9px]">Author</span>
              </div>
              <div className="pt-2 text-[#c9d1d9] whitespace-pre-line leading-relaxed">
                {prDescription}
              </div>
            </div>

            {/* Simulated Senior Dev / Bot Review */}
            <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-md">
              <div className="flex items-center justify-between pb-2 border-b border-[#21262d] text-[#8b949e] text-[10px]">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#58a6ff]"></span>
                  <span className="font-bold text-[#58a6ff]">senior-architect (Staff Reviewer)</span>
                </div>
                <span>Reviewer</span>
              </div>
              <p className="pt-2 text-[#c9d1d9] leading-relaxed">
                "Looks clean! Verified unit tests pass. Ready for deployment once approved."
              </p>
            </div>

            {/* Approval & Merge Action Bar */}
            <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-md flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                {reviewApproved ? (
                  <div className="flex items-center space-x-1.5 text-[#2ea043]">
                    <Check className="w-4 h-4" />
                    <span className="font-bold">Changes approved by Senior Reviewer</span>
                  </div>
                ) : (
                  <button
                    onClick={handleApprove}
                    className="px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] hover:text-white border border-[#30363d] rounded font-semibold transition"
                  >
                    Approve Changes (Review)
                  </button>
                )}
              </div>

              {!isMerged ? (
                <button
                  onClick={handleMerge}
                  className="px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white font-bold rounded shadow-glow-green flex items-center space-x-1.5 transition"
                >
                  <GitMerge className="w-3.5 h-3.5" />
                  <span>Merge Pull Request</span>
                </button>
              ) : (
                <div className="text-[#8957e5] font-bold flex items-center space-x-1">
                  <Check className="w-4 h-4" />
                  <span>Pull request successfully merged and closed</span>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Files Changed / Diff View */
          <div className="space-y-3">
            <div className="border border-[#30363d] rounded overflow-hidden">
              <div className="bg-[#161b22] px-3 py-1.5 border-b border-[#30363d] text-[11px] font-bold text-[#c9d1d9] flex justify-between">
                <span>profile.js</span>
                <span className="text-[#2ea043]">+24 lines</span>
              </div>
              <div className="p-3 bg-[#0d1117] text-[11px] font-mono leading-relaxed">
                <div className="text-[#2ea043] bg-[#2ea043]/10 px-2 py-0.5">
                  + export function renderUserProfile(user) &#123;
                </div>
                <div className="text-[#2ea043] bg-[#2ea043]/10 px-2 py-0.5">
                  + &nbsp;&nbsp;return `&lt;div class="profile"&gt;$&#123;user.name&#125;&lt;/div&gt;`;
                </div>
                <div className="text-[#2ea043] bg-[#2ea043]/10 px-2 py-0.5">+ &#125;</div>
              </div>
            </div>

            <div className="border border-[#30363d] rounded overflow-hidden">
              <div className="bg-[#161b22] px-3 py-1.5 border-b border-[#30363d] text-[11px] font-bold text-[#c9d1d9] flex justify-between">
                <span>index.html</span>
                <span className="text-[#d29922]">+2 -1 lines</span>
              </div>
              <div className="p-3 bg-[#0d1117] text-[11px] font-mono leading-relaxed">
                <div className="text-[#f85149] bg-[#f85149]/10 px-2 py-0.5">- &lt;nav&gt;Default Nav&lt;/nav&gt;</div>
                <div className="text-[#2ea043] bg-[#2ea043]/10 px-2 py-0.5">
                  + &lt;nav class="responsive-nav"&gt;
                </div>
                <div className="text-[#2ea043] bg-[#2ea043]/10 px-2 py-0.5">
                  + &nbsp;&nbsp;&lt;a href="/profile"&gt;My Profile&lt;/a&gt;
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
