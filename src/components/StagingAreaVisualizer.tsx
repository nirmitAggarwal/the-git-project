import React from 'react';
import { RepositoryState } from '../types/git';
import { Folder, HardDrive, CheckCircle2, FileCode, ArrowRight, Database, AlertCircle } from 'lucide-react';
import { sound } from '../game/soundEngine';

interface StagingAreaVisualizerProps {
  repoState: RepositoryState;
  onQuickStage?: (fileName: string) => void;
  onQuickUnstage?: (fileName: string) => void;
}

export const StagingAreaVisualizer: React.FC<StagingAreaVisualizerProps> = ({
  repoState,
  onQuickStage,
  onQuickUnstage,
}) => {
  const headCommit = repoState.headCommitId ? repoState.commits[repoState.headCommitId] : null;
  const committedFiles = headCommit ? headCommit.files : {};

  // Categorize files in Working Directory
  const workingFiles = Object.entries(repoState.workingDirectory).map(([name, content]) => {
    const isStaged = repoState.stagedFiles[name] !== undefined;
    const isCommitted = committedFiles[name] !== undefined;
    const isModified = isCommitted && committedFiles[name] !== content;
    const isUntracked = !isCommitted && !isStaged;

    let status: 'untracked' | 'modified' | 'clean' = 'clean';
    if (isUntracked) status = 'untracked';
    else if (isModified) status = 'modified';

    return { name, content, status, isStaged };
  });

  const stagedFilesList = Object.entries(repoState.stagedFiles);

  return (
    <div className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg overflow-hidden shadow-md font-mono text-xs">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#161b22] border-b border-[#30363d] text-[#8b949e]">
        <div className="flex items-center space-x-2">
          <HardDrive className="w-3.5 h-3.5 text-[#58a6ff]" />
          <span className="font-semibold text-[#c9d1d9]">THE THREE ZONES (INTERNAL STATE)</span>
        </div>
        <div className="text-[11px] text-[#6e7681]">
          {workingFiles.length} files • {stagedFilesList.length} staged
        </div>
      </div>

      {/* Grid of the 3 zones */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#30363d] p-3 gap-3 md:gap-0 bg-[#0d1117]/80">
        {/* Zone 1: Working Directory */}
        <div className="md:pr-3 flex flex-col min-h-[160px]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-[#c9d1d9]">
              <Folder className="w-4 h-4 text-[#f0883e]" />
              <span className="font-semibold">Working Directory</span>
            </div>
            <span className="text-[10px] bg-[#21262d] px-1.5 py-0.5 rounded text-[#8b949e]">Unstaged</span>
          </div>
          <p className="text-[11px] text-[#8b949e] mb-3 leading-tight">
            Files currently on your disk. Modifications here are not yet prepared for snapshot.
          </p>

          <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[160px]">
            {workingFiles.length === 0 ? (
              <div className="text-[#6e7681] italic text-center py-6">Directory is empty</div>
            ) : (
              workingFiles.map(file => (
                <div
                  key={file.name}
                  className={`p-2 rounded border flex items-center justify-between transition-all ${
                    file.status === 'untracked'
                      ? 'bg-[#1f242c] border-[#f85149]/40 hover:border-[#f85149]'
                      : file.status === 'modified'
                      ? 'bg-[#1f242c] border-[#f0883e]/40 hover:border-[#f0883e]'
                      : 'bg-[#161b22] border-[#30363d]'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileCode className="w-3.5 h-3.5 text-[#8b949e] shrink-0" />
                    <span className="text-[#c9d1d9] truncate font-medium">{file.name}</span>
                    {file.status === 'untracked' && (
                      <span className="text-[9px] bg-[#f85149]/20 text-[#f85149] px-1 rounded">untracked</span>
                    )}
                    {file.status === 'modified' && (
                      <span className="text-[9px] bg-[#f0883e]/20 text-[#f0883e] px-1 rounded">modified</span>
                    )}
                  </div>

                  {onQuickStage && !file.isStaged && (
                    <button
                      onClick={() => {
                        sound.playKeypress();
                        onQuickStage(file.name);
                      }}
                      className="ml-2 px-1.5 py-0.5 rounded bg-[#238636] hover:bg-[#2ea043] text-white text-[10px] flex items-center space-x-1 shrink-0 transition"
                      title="Run git add"
                    >
                      <span>Stage</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Zone 2: Staging Area (Index) */}
        <div className="md:px-3 flex flex-col min-h-[160px]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-[#c9d1d9]">
              <CheckCircle2 className="w-4 h-4 text-[#2ea043]" />
              <span className="font-semibold">Staging Area (Index)</span>
            </div>
            <span className="text-[10px] bg-[#238636]/20 text-[#2ea043] px-1.5 py-0.5 rounded">
              Ready for commit
            </span>
          </div>
          <p className="text-[11px] text-[#8b949e] mb-3 leading-tight">
            Snapshot preview area. Changes here will be permanently written into the next commit.
          </p>

          <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[160px]">
            {stagedFilesList.length === 0 ? (
              <div className="border border-dashed border-[#30363d] rounded p-4 text-center text-[#6e7681] text-[11px]">
                No staged files.<br />Use <code className="text-[#58a6ff]">git add &lt;file&gt;</code> to stage.
              </div>
            ) : (
              stagedFilesList.map(([name]) => (
                <div
                  key={name}
                  className="p-2 rounded bg-[#238636]/10 border border-[#2ea043]/40 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2ea043] shrink-0" />
                    <span className="text-[#c9d1d9] truncate font-medium">{name}</span>
                    <span className="text-[9px] text-[#2ea043] font-semibold">staged</span>
                  </div>

                  {onQuickUnstage && (
                    <button
                      onClick={() => {
                        sound.playKeypress();
                        onQuickUnstage(name);
                      }}
                      className="ml-2 px-1.5 py-0.5 rounded bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#c9d1d9] text-[10px] transition"
                      title="Run git restore --staged"
                    >
                      Unstage
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Zone 3: Git Repository (HEAD commit) */}
        <div className="md:pl-3 flex flex-col min-h-[160px]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-[#c9d1d9]">
              <Database className="w-4 h-4 text-[#58a6ff]" />
              <span className="font-semibold">Git Repository (.git)</span>
            </div>
            <span className="text-[10px] bg-[#58a6ff]/20 text-[#58a6ff] px-1.5 py-0.5 rounded">
              Permanent DAG
            </span>
          </div>
          <p className="text-[11px] text-[#8b949e] mb-3 leading-tight">
            The immutable history of commits. HEAD points to your current active snapshot.
          </p>

          <div className="flex-1 flex flex-col justify-center">
            {headCommit ? (
              <div className="p-3 bg-[#161b22] border border-[#30363d] rounded-lg space-y-2">
                <div className="flex items-center justify-between text-[#8b949e] text-[10px]">
                  <span>HEAD COMMIT</span>
                  <span className="font-bold text-[#58a6ff]">{headCommit.shortId}</span>
                </div>
                <div className="text-white text-xs font-semibold truncate">
                  "{headCommit.message}"
                </div>
                <div className="text-[10px] text-[#8b949e] flex items-center justify-between pt-1 border-t border-[#21262d]">
                  <span>{headCommit.author}</span>
                  <span className="text-[#2ea043]">{Object.keys(headCommit.files).length} files</span>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-[#30363d] rounded p-4 text-center text-[#6e7681] text-[11px]">
                No commits yet in repo history.<br />Run <code className="text-[#58a6ff]">git commit -m "..."</code>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
