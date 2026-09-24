export interface VirtualFile {
  name: string;
  content: string;
  status: 'untracked' | 'modified' | 'staged' | 'unmodified' | 'deleted' | 'conflicted';
}

export interface Commit {
  id: string;
  shortId: string;
  message: string;
  parentIds: string[];
  files: Record<string, string>; // filename -> content snapshot
  timestamp: number;
  author: string;
  branch?: string;
  tag?: string;
}

export interface Branch {
  name: string;
  commitId: string;
}

export interface RemoteRepo {
  name: string;
  url: string;
  commits: Commit[];
  branches: Branch[];
}

export interface ConflictState {
  file: string;
  currentContent: string; // from HEAD
  incomingContent: string; // from incoming branch
  baseContent: string;
}

export interface RepositoryState {
  initialized: boolean;
  workingDirectory: Record<string, string>; // filename -> current content on disk
  stagedFiles: Record<string, string>; // filename -> staged content snapshot
  headCommitId: string | null;
  currentBranch: string; // e.g. 'main' or 'HEAD' (detached)
  branches: Record<string, string>; // branch name -> commitId
  commits: Record<string, Commit>; // commitId -> Commit
  remotes: Record<string, RemoteRepo>;
  remoteTrackingBranches: Record<string, string>; // e.g. "origin/main" -> commitId
  conflict: ConflictState | null;
  headDetached?: boolean;
}

export interface CommandOutput {
  stdout: string;
  stderr?: string;
  exitCode: number;
  type?: 'info' | 'success' | 'warning' | 'error' | 'git';
  actionTaken?: string;
}
