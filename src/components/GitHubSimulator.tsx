import React, { useState } from 'react';
import { RepositoryState } from '../types/git';
import {
  Folder,
  FileText,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Star,
  GitFork,
  Eye,
  Check,
  Cloud,
  FileCode,
  ExternalLink,
} from 'lucide-react';
import { PullRequestModal } from './PullRequestModal';

interface GitHubSimulatorProps {
  repoState: RepositoryState;
  onPRMerged?: () => void;
}

export const GitHubSimulator: React.FC<GitHubSimulatorProps> = ({ repoState, onPRMerged }) => {
  const [activeTab, setActiveTab] = useState<'code' | 'commits' | 'branches' | 'pulls'>('code');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showPRModal, setShowPRModal] = useState(false);

  const originRemote = repoState.remotes['origin'];
  const hasRemote = Boolean(originRemote);

  // If remote is not added yet, show connect banner
  if (!hasRemote) {
    return (
      <div className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-6 font-mono text-center space-y-3">
        <Cloud className="w-10 h-10 text-[#8b949e] mx-auto animate-pulse" />
        <div className="text-white font-bold text-sm">Remote GitHub Repository Not Connected</div>
        <p className="text-[#8b949e] text-xs max-w-md mx-auto">
          To link your local repository with GitHub, add the remote origin using the terminal command:
        </p>
        <code className="inline-block bg-[#161b22] px-3 py-1.5 rounded border border-[#30363d] text-[#58a6ff] text-xs">
          git remote add origin https://github.com/nirmit/nirmit-demo.git
        </code>
      </div>
    );
  }

  const remoteCommits = originRemote.commits || [];
  const remoteBranches = originRemote.branches || [];

  return (
    <div className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg overflow-hidden shadow-lg font-mono text-xs">
      {/* GitHub Repo Header */}
      <div className="p-3 bg-[#161b22] border-b border-[#30363d] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 fill-white" viewBox="0 0 16 16">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
          </svg>
          <div className="flex items-center space-x-1 text-sm font-sans">
            <span className="text-[#58a6ff] hover:underline cursor-pointer">nirmit</span>
            <span className="text-[#8b949e]">/</span>
            <span className="text-[#58a6ff] font-bold hover:underline cursor-pointer">nirmit-demo</span>
          </div>
          <span className="bg-[#21262d] text-[#8b949e] px-1.5 py-0.5 rounded-full text-[10px] border border-[#30363d]">
            Public
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-[#c9d1d9]">
          <span className="flex items-center space-x-1 bg-[#21262d] px-2 py-0.5 rounded border border-[#30363d]">
            <Eye className="w-3 h-3 text-[#8b949e]" />
            <span>Watch 2</span>
          </span>
          <span className="flex items-center space-x-1 bg-[#21262d] px-2 py-0.5 rounded border border-[#30363d]">
            <GitFork className="w-3 h-3 text-[#8b949e]" />
            <span>Fork 5</span>
          </span>
          <span className="flex items-center space-x-1 bg-[#21262d] px-2 py-0.5 rounded border border-[#30363d]">
            <Star className="w-3 h-3 text-[#e3b341]" />
            <span>Star 18</span>
          </span>
        </div>
      </div>

      {/* GitHub Tabs */}
      <div className="flex border-b border-[#30363d] bg-[#161b22] px-3 gap-4">
        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center space-x-1.5 py-2 px-1 border-b-2 font-medium transition ${
            activeTab === 'code' ? 'border-[#f78166] text-white' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>&lt;&gt; Code</span>
        </button>

        <button
          onClick={() => setActiveTab('commits')}
          className={`flex items-center space-x-1.5 py-2 px-1 border-b-2 font-medium transition ${
            activeTab === 'commits' ? 'border-[#f78166] text-white' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
          }`}
        >
          <GitCommit className="w-3.5 h-3.5" />
          <span>Commits ({remoteCommits.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('branches')}
          className={`flex items-center space-x-1.5 py-2 px-1 border-b-2 font-medium transition ${
            activeTab === 'branches' ? 'border-[#f78166] text-white' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Branches ({remoteBranches.length || 1})</span>
        </button>

        <button
          onClick={() => setActiveTab('pulls')}
          className={`flex items-center space-x-1.5 py-2 px-1 border-b-2 font-medium transition ${
            activeTab === 'pulls' ? 'border-[#f78166] text-white' : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
          }`}
        >
          <GitPullRequest className="w-3.5 h-3.5" />
          <span>Pull Requests (1)</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-3">
        {activeTab === 'code' && (
          <div className="space-y-3">
            {/* Branch selector & latest commit bar */}
            <div className="flex items-center justify-between bg-[#161b22] p-2 rounded border border-[#30363d]">
              <div className="flex items-center space-x-2">
                <GitBranch className="w-3.5 h-3.5 text-[#8b949e]" />
                <span className="font-bold text-[#c9d1d9]">main</span>
              </div>
              <div className="text-[11px] text-[#8b949e]">
                {remoteCommits.length > 0 ? (
                  <span>Latest commit: {remoteCommits[remoteCommits.length - 1]?.shortId}</span>
                ) : (
                  <span>Remote is waiting for your first `git push`</span>
                )}
              </div>
            </div>

            {/* File List */}
            <div className="border border-[#30363d] rounded overflow-hidden">
              {Object.keys(repoState.workingDirectory).length === 0 ? (
                <div className="p-4 text-center text-[#8b949e]">No files in repository</div>
              ) : (
                Object.entries(repoState.workingDirectory).map(([filename, content], i) => (
                  <div
                    key={filename}
                    onClick={() => setSelectedFile(selectedFile === filename ? null : filename)}
                    className={`flex items-center justify-between px-3 py-2 border-b border-[#21262d] hover:bg-[#161b22] cursor-pointer transition ${
                      i % 2 === 0 ? 'bg-[#0d1117]' : 'bg-[#161b22]/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2 text-[#58a6ff]">
                      <FileText className="w-3.5 h-3.5 text-[#8b949e]" />
                      <span className="hover:underline">{filename}</span>
                    </div>
                    <span className="text-[#8b949e] text-[10px] truncate max-w-[200px]">
                      {content.split('\n')[0] || 'file content'}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Selected File Content Viewer */}
            {selectedFile && (
              <div className="border border-[#30363d] rounded overflow-hidden mt-2">
                <div className="bg-[#161b22] px-3 py-1.5 border-b border-[#30363d] text-[11px] font-bold text-[#c9d1d9] flex justify-between">
                  <span>{selectedFile}</span>
                  <button onClick={() => setSelectedFile(null)} className="text-[#8b949e] hover:text-white">
                    Close
                  </button>
                </div>
                <pre className="p-3 bg-[#0d1117] text-[#c9d1d9] overflow-x-auto text-[11px]">
                  {repoState.workingDirectory[selectedFile]}
                </pre>
              </div>
            )}
          </div>
        )}

        {activeTab === 'commits' && (
          <div className="space-y-2">
            {remoteCommits.length === 0 ? (
              <div className="p-6 text-center text-[#8b949e]">
                No commits pushed to GitHub yet.<br />Run <code className="text-[#58a6ff]">git push origin main</code>
              </div>
            ) : (
              remoteCommits.map(c => (
                <div
                  key={c.id}
                  className="p-2.5 bg-[#161b22] border border-[#30363d] rounded flex items-center justify-between"
                >
                  <div className="space-y-0.5 truncate">
                    <div className="text-white font-semibold truncate">{c.message}</div>
                    <div className="text-[10px] text-[#8b949e]">
                      {c.author} committed on {new Date(c.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[#58a6ff] bg-[#21262d] px-2 py-0.5 rounded border border-[#30363d]">
                      {c.shortId}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'branches' && (
          <div className="space-y-2">
            <div className="p-2.5 bg-[#161b22] border border-[#30363d] rounded flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GitBranch className="w-3.5 h-3.5 text-[#2ea043]" />
                <span className="text-white font-bold">main</span>
                <span className="bg-[#21262d] text-[#2ea043] px-1.5 py-0.5 rounded text-[10px]">default</span>
              </div>
              <span className="text-[#8b949e] text-[10px]">Updated recently</span>
            </div>

            {remoteBranches
              .filter(b => b.name !== 'main')
              .map(b => (
                <div
                  key={b.name}
                  className="p-2.5 bg-[#161b22] border border-[#30363d] rounded flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <GitBranch className="w-3.5 h-3.5 text-[#58a6ff]" />
                    <span className="text-[#c9d1d9]">{b.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('pulls');
                      setShowPRModal(true);
                    }}
                    className="text-[#58a6ff] hover:underline text-[10px]"
                  >
                    Compare & pull request
                  </button>
                </div>
              ))}
          </div>
        )}

        {activeTab === 'pulls' && (
          <div className="space-y-3">
            {!showPRModal ? (
              <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <GitPullRequest className="w-5 h-5 text-[#2ea043]" />
                  <div>
                    <div className="text-white font-bold">#42 Add responsive profile page & navigation</div>
                    <div className="text-[#8b949e] text-[10px]">
                      Opened by nirmit-dev • 1 commit • 2 files changed
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowPRModal(true)}
                  className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white font-bold rounded transition"
                >
                  Review & Merge PR
                </button>
              </div>
            ) : (
              <PullRequestModal
                sourceBranch="feature-profile"
                targetBranch="main"
                onMergePR={() => {
                  setShowPRModal(false);
                  if (onPRMerged) onPRMerged();
                }}
                onClose={() => setShowPRModal(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
