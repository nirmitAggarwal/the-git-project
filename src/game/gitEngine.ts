import { RepositoryState, CommandOutput, Commit, Branch, RemoteRepo, ConflictState } from '../types/git';

// Helper to generate short 7-character commit hash
export function generateCommitHash(message: string, parentIds: string[]): string {
  const input = message + parentIds.join(',') + Date.now().toString() + Math.random().toString();
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(7, '0').slice(0, 7);
}

export function createInitialRepoState(): RepositoryState {
  return {
    initialized: false,
    workingDirectory: {},
    stagedFiles: {},
    headCommitId: null,
    currentBranch: 'main',
    branches: {},
    commits: {},
    remotes: {},
    remoteTrackingBranches: {},
    conflict: null,
    headDetached: false,
  };
}

export class GitEngine {
  public static execute(rawCommand: string, state: RepositoryState, authorName: string = 'Developer <dev@gitgame.io>'): {
    nextState: RepositoryState;
    output: CommandOutput;
  } {
    const trimmed = rawCommand.trim();
    if (!trimmed) {
      return {
        nextState: state,
        output: { stdout: '', exitCode: 0 },
      };
    }

    // Clone state immutably
    const nextState: RepositoryState = JSON.parse(JSON.stringify(state));

    // Handle non-git shell helpers
    if (trimmed === 'clear') {
      return {
        nextState,
        output: { stdout: '', exitCode: 0, actionTaken: 'CLEAR' },
      };
    }

    if (trimmed === 'ls' || trimmed === 'dir') {
      const files = Object.keys(nextState.workingDirectory);
      if (files.length === 0) {
        return {
          nextState,
          output: { stdout: '(empty directory)', exitCode: 0 },
        };
      }
      return {
        nextState,
        output: { stdout: files.join('   '), exitCode: 0 },
      };
    }

    if (trimmed.startsWith('cat ')) {
      const filename = trimmed.replace('cat ', '').trim();
      if (nextState.workingDirectory[filename] !== undefined) {
        return {
          nextState,
          output: { stdout: nextState.workingDirectory[filename], exitCode: 0 },
        };
      }
      return {
        nextState,
        output: { stdout: `cat: ${filename}: No such file or directory`, exitCode: 1 },
      };
    }

    if (trimmed.startsWith('touch ')) {
      const filename = trimmed.replace('touch ', '').trim();
      if (!filename) {
        return { nextState, output: { stdout: 'touch: missing file operand', exitCode: 1 } };
      }
      if (nextState.workingDirectory[filename] === undefined) {
        nextState.workingDirectory[filename] = `// Content of ${filename}\n`;
      }
      return {
        nextState,
        output: { stdout: `Created ${filename}`, exitCode: 0 },
      };
    }

    if (trimmed.startsWith('echo ') && trimmed.includes('>')) {
      const parts = trimmed.split('>');
      const content = parts[0].replace('echo', '').trim().replace(/^['"]|['"]$/g, '');
      const filename = parts[1].trim();
      nextState.workingDirectory[filename] = content + '\n';
      return {
        nextState,
        output: { stdout: `Updated ${filename}`, exitCode: 0 },
      };
    }

    if (trimmed === 'help') {
      return {
        nextState,
        output: {
          stdout: `Available Git Commands:
  git init                    Create an empty Git repository
  git status                  Show working tree status
  git add <file> / git add .  Add file contents to the staging area
  git commit -m "<message>"   Record changes to the repository
  git log / git log --oneline Show commit history
  git show [commit]           Show various types of objects
  git branch [name]           List, create, or delete branches
  git switch <branch>         Switch branches
  git checkout <branch>       Switch branches or restore working tree
  git merge <branch>          Join two or more development histories together
  git restore <file>          Restore working tree files
  git reset <commit>          Reset current HEAD to the specified state
  git revert <commit>         Revert some existing commits
  git remote add origin <url> Manage set of tracked repositories
  git push origin <branch>    Update remote refs along with associated objects
  git pull origin <branch>    Fetch from and integrate with another repository
  git fetch origin            Download objects and refs from another repository
  ls, cat, touch, echo        Standard shell utilities
  clear                       Clear terminal output`,
          exitCode: 0,
        },
      };
    }

    if (!trimmed.startsWith('git')) {
      return {
        nextState,
        output: {
          stdout: `command not found: ${trimmed.split(' ')[0]}. Type 'help' for available commands.`,
          exitCode: 127,
        },
      };
    }

    const tokens = trimmed.split(/\s+/);
    const subCommand = tokens[1];

    // git init
    if (subCommand === 'init') {
      if (nextState.initialized) {
        return {
          nextState,
          output: {
            stdout: `Reinitialized existing Git repository in /project/.git/`,
            exitCode: 0,
          },
        };
      }
      nextState.initialized = true;
      nextState.currentBranch = 'main';
      nextState.branches = {};
      return {
        nextState,
        output: {
          stdout: `Initialized empty Git repository in /project/.git/`,
          exitCode: 0,
          actionTaken: 'INIT',
        },
      };
    }

    // Require git init for all remaining git commands
    if (!nextState.initialized) {
      return {
        nextState,
        output: {
          stdout: `fatal: not a git repository (or any of the parent directories): .git\nRun 'git init' to initialize a repository.`,
          exitCode: 128,
        },
      };
    }

    // git status
    if (subCommand === 'status') {
      const lines: string[] = [];
      lines.push(`On branch ${nextState.currentBranch}`);

      // Tracked files in HEAD commit
      const headCommit = nextState.headCommitId ? nextState.commits[nextState.headCommitId] : null;
      const headFiles = headCommit ? headCommit.files : {};

      // In conflict state
      if (nextState.conflict) {
        lines.push(`You have unmerged paths.`);
        lines.push(`  (fix conflicts and run "git commit")`);
        lines.push(`  (use "git merge --abort" to abort the merge)\n`);
        lines.push(`Unmerged paths:`);
        lines.push(`  (use "git add <file>..." to mark resolution)`);
        lines.push(`\t\x1b[31mboth modified:   ${nextState.conflict.file}\x1b[0m\n`);
        return {
          nextState,
          output: { stdout: lines.join('\n'), exitCode: 0 },
        };
      }

      // Staged files
      const stagedKeys = Object.keys(nextState.stagedFiles);
      if (stagedKeys.length > 0) {
        lines.push(`Changes to be committed:`);
        lines.push(`  (use "git restore --staged <file>..." to unstage)`);
        stagedKeys.forEach(f => {
          const isNew = headFiles[f] === undefined;
          lines.push(`\t\x1b[32m${isNew ? 'new file:' : 'modified:'}   ${f}\x1b[0m`);
        });
        lines.push('');
      }

      // Modified not staged
      const modifiedUnstaged: string[] = [];
      const untracked: string[] = [];

      Object.entries(nextState.workingDirectory).forEach(([fname, content]) => {
        const isStaged = nextState.stagedFiles[fname] !== undefined;
        const isCommitted = headFiles[fname] !== undefined;

        if (isStaged) {
          if (nextState.stagedFiles[fname] !== content) {
            modifiedUnstaged.push(fname);
          }
        } else if (isCommitted) {
          if (headFiles[fname] !== content) {
            modifiedUnstaged.push(fname);
          }
        } else {
          untracked.push(fname);
        }
      });

      if (modifiedUnstaged.length > 0) {
        lines.push(`Changes not staged for commit:`);
        lines.push(`  (use "git add <file>..." to update what will be committed)`);
        lines.push(`  (use "git restore <file>..." to discard changes in working directory)`);
        modifiedUnstaged.forEach(f => {
          lines.push(`\t\x1b[31mmodified:   ${f}\x1b[0m`);
        });
        lines.push('');
      }

      if (untracked.length > 0) {
        lines.push(`Untracked files:`);
        lines.push(`  (use "git add <file>..." to include in what will be committed)`);
        untracked.forEach(f => {
          lines.push(`\t\x1b[31m${f}\x1b[0m`);
        });
        lines.push('');
      }

      if (stagedKeys.length === 0 && modifiedUnstaged.length === 0 && untracked.length === 0) {
        lines.push(`nothing to commit, working tree clean`);
      }

      return {
        nextState,
        output: { stdout: lines.join('\n'), exitCode: 0 },
      };
    }

    // git add
    if (subCommand === 'add') {
      const target = tokens.slice(2).join(' ').trim();
      if (!target) {
        return {
          nextState,
          output: { stdout: `Nothing specified, nothing added.\nMaybe you wanted to say 'git add .'?`, exitCode: 1 },
        };
      }

      if (target === '.' || target === '-A' || target === '*') {
        Object.entries(nextState.workingDirectory).forEach(([f, content]) => {
          nextState.stagedFiles[f] = content;
        });
        // If conflict resolved by add
        if (nextState.conflict) {
          // If conflict marker is removed or accepted
          nextState.conflict = null;
        }
        return {
          nextState,
          output: { stdout: ``, exitCode: 0, actionTaken: 'STAGE_ALL' },
        };
      }

      const filesToAdd = target.split(/\s+/);
      const notFound: string[] = [];
      filesToAdd.forEach(f => {
        if (nextState.workingDirectory[f] !== undefined) {
          nextState.stagedFiles[f] = nextState.workingDirectory[f];
          if (nextState.conflict && nextState.conflict.file === f) {
            nextState.conflict = null;
          }
        } else {
          notFound.push(f);
        }
      });

      if (notFound.length > 0) {
        return {
          nextState,
          output: {
            stdout: `fatal: pathspec '${notFound.join(' ')}' did not match any files`,
            exitCode: 128,
          },
        };
      }

      return {
        nextState,
        output: { stdout: ``, exitCode: 0, actionTaken: 'STAGE' },
      };
    }

    // git commit
    if (subCommand === 'commit') {
      let message = '';
      const mIdx = tokens.indexOf('-m');
      if (mIdx !== -1) {
        // Extract quoted message
        const afterM = trimmed.substring(trimmed.indexOf('-m') + 2).trim();
        const match = afterM.match(/^["'](.*?)["']/);
        if (match) {
          message = match[1];
        } else {
          message = afterM.replace(/^["']|["']$/g, '');
        }
      }

      if (!message) {
        return {
          nextState,
          output: {
            stdout: `error: switch \`m' requires a value\nAborting commit due to empty commit message. Use: git commit -m "Your message"`,
            exitCode: 1,
          },
        };
      }

      let stagedCount = Object.keys(nextState.stagedFiles).length;
      if (stagedCount === 0 && !nextState.conflict) {
        // Check if there are modified or untracked files in workingDirectory that can be auto-staged
        const headFiles = nextState.headCommitId ? nextState.commits[nextState.headCommitId]?.files || {} : {};
        const unstaged = Object.entries(nextState.workingDirectory).filter(([f, content]) => {
          return headFiles[f] !== content;
        });

        if (unstaged.length > 0) {
          // Auto-stage modified / untracked files
          unstaged.forEach(([f, content]) => {
            nextState.stagedFiles[f] = content;
          });
          stagedCount = unstaged.length;
        } else {
          // If workingDirectory has no uncommitted changes, auto-create and stage a feature file based on the branch or commit message
          let autoFileName = 'feature.txt';
          let autoContent = `// Feature on branch ${nextState.currentBranch}\n`;
          const lowerMsg = message.toLowerCase();
          const lowerBranch = nextState.currentBranch.toLowerCase();

          if (lowerMsg.includes('dark') || lowerBranch.includes('dark')) {
            autoFileName = 'dark-theme.css';
            autoContent = 'body.dark { background: #0d1117; color: #c9d1d9; }\n';
          } else if (lowerMsg.includes('profile') || lowerBranch.includes('profile')) {
            autoFileName = 'profile.js';
            autoContent = 'export function renderProfile() {}\n';
          } else if (lowerMsg.includes('search') || lowerBranch.includes('search')) {
            autoFileName = 'search.js';
            autoContent = 'export function search() {}\n';
          } else if (lowerMsg.includes('onboarding') || lowerMsg.includes('fix') || lowerBranch.includes('fix')) {
            autoFileName = 'onboarding.js';
            autoContent = '// Fixed onboarding validation\nreturn true;\n';
          } else {
            autoFileName = `${nextState.currentBranch}.js`;
            autoContent = `// Implemented ${message}\n`;
          }

          nextState.workingDirectory[autoFileName] = autoContent;
          nextState.stagedFiles[autoFileName] = autoContent;
          stagedCount = 1;
        }
      }

      // Build file snapshot: current HEAD files overlaid with staged files
      const headFiles = nextState.headCommitId ? { ...nextState.commits[nextState.headCommitId].files } : {};
      const newSnapshot = { ...headFiles, ...nextState.stagedFiles };

      const parentIds: string[] = [];
      if (nextState.headCommitId) {
        parentIds.push(nextState.headCommitId);
      }

      const commitId = generateCommitHash(message, parentIds);
      const newCommit: Commit = {
        id: commitId,
        shortId: commitId.slice(0, 7),
        message,
        parentIds,
        files: newSnapshot,
        timestamp: Date.now(),
        author: authorName,
        branch: nextState.currentBranch,
      };

      nextState.commits[commitId] = newCommit;
      nextState.headCommitId = commitId;
      nextState.branches[nextState.currentBranch] = commitId;
      nextState.stagedFiles = {};
      nextState.conflict = null;

      const changedCount = stagedCount || 1;
      const isRoot = parentIds.length === 0;

      return {
        nextState,
        output: {
          stdout: `[${nextState.currentBranch} ${isRoot ? '(root-commit) ' : ''}${commitId.slice(0, 7)}] ${message}\n ${changedCount} file${changedCount > 1 ? 's' : ''} changed`,
          exitCode: 0,
          actionTaken: 'COMMIT',
        },
      };
    }

    // git log
    if (subCommand === 'log') {
      const isOneLine = trimmed.includes('--oneline');
      if (!nextState.headCommitId) {
        return {
          nextState,
          output: {
            stdout: `fatal: your current branch '${nextState.currentBranch}' does not have any commits yet`,
            exitCode: 128,
          },
        };
      }

      // Collect commits in backwards topological order
      const visited = new Set<string>();
      const commitList: Commit[] = [];
      let queue = [nextState.headCommitId];

      while (queue.length > 0) {
        const id = queue.shift()!;
        if (!visited.has(id) && nextState.commits[id]) {
          visited.add(id);
          const c = nextState.commits[id];
          commitList.push(c);
          queue.push(...c.parentIds);
        }
      }

      if (isOneLine) {
        const lines = commitList.map(c => {
          let branchInfo = '';
          if (c.id === nextState.headCommitId) {
            branchInfo = ` \x1b[36m(HEAD -> \x1b[32m${nextState.currentBranch}\x1b[36m)\x1b[0m`;
          }
          return `\x1b[33m${c.shortId}\x1b[0m${branchInfo} ${c.message}`;
        });
        return {
          nextState,
          output: { stdout: lines.join('\n'), exitCode: 0 },
        };
      }

      const lines = commitList.map(c => {
        let branchInfo = '';
        if (c.id === nextState.headCommitId) {
          branchInfo = ` (HEAD -> ${nextState.currentBranch})`;
        }
        return `commit ${c.id}${branchInfo}\nAuthor: ${c.author}\nDate:   ${new Date(c.timestamp).toUTCString()}\n\n    ${c.message}\n`;
      });

      return {
        nextState,
        output: { stdout: lines.join('\n'), exitCode: 0 },
      };
    }

    // git show
    if (subCommand === 'show') {
      const targetCommitId = tokens[2] || nextState.headCommitId;
      if (!targetCommitId || !nextState.commits[targetCommitId]) {
        // Try short id match
        const found = Object.values(nextState.commits).find(c => c.shortId === targetCommitId || c.id === targetCommitId);
        if (!found) {
          return {
            nextState,
            output: { stdout: `fatal: bad object ${targetCommitId || 'HEAD'}`, exitCode: 128 },
          };
        }
        return {
          nextState,
          output: {
            stdout: `commit ${found.id}\nAuthor: ${found.author}\nDate:   ${new Date(found.timestamp).toUTCString()}\n\n    ${found.message}\n\nFiles in commit:\n${Object.keys(found.files).map(f => `  + ${f}`).join('\n')}`,
            exitCode: 0,
          },
        };
      }

      const c = nextState.commits[targetCommitId];
      return {
        nextState,
        output: {
          stdout: `commit ${c.id}\nAuthor: ${c.author}\nDate:   ${new Date(c.timestamp).toUTCString()}\n\n    ${c.message}\n\nFiles snapshot:\n${Object.keys(c.files).map(f => `  + ${f} (${c.files[f].length} bytes)`).join('\n')}`,
          exitCode: 0,
        },
      };
    }

    // git branch
    if (subCommand === 'branch') {
      const branchArg = tokens[2];
      // git branch (list branches)
      if (!branchArg || branchArg === '-a' || branchArg === '--all') {
        const branchNames = Object.keys(nextState.branches);
        if (branchNames.length === 0 && !nextState.headCommitId) {
          return {
            nextState,
            output: { stdout: `* ${nextState.currentBranch}`, exitCode: 0 },
          };
        }
        if (!branchNames.includes(nextState.currentBranch)) {
          branchNames.push(nextState.currentBranch);
        }
        const lines = branchNames.map(b => {
          if (b === nextState.currentBranch) {
            return `* \x1b[32m${b}\x1b[0m`;
          }
          return `  ${b}`;
        });

        // Show remote branches if any
        if (branchArg === '-a' || branchArg === '--all') {
          Object.keys(nextState.remoteTrackingBranches).forEach(rb => {
            lines.push(`  \x1b[31mremotes/${rb}\x1b[0m`);
          });
        }

        return {
          nextState,
          output: { stdout: lines.join('\n'), exitCode: 0 },
        };
      }

      // git branch -d <branch>
      if (branchArg === '-d' || branchArg === '-D') {
        const toDelete = tokens[3];
        if (!toDelete) {
          return { nextState, output: { stdout: `fatal: branch name required`, exitCode: 1 } };
        }
        if (toDelete === nextState.currentBranch) {
          return {
            nextState,
            output: { stdout: `error: Cannot delete branch '${toDelete}' checked out at '/project'`, exitCode: 1 },
          };
        }
        if (!nextState.branches[toDelete]) {
          return { nextState, output: { stdout: `error: branch '${toDelete}' not found.`, exitCode: 1 } };
        }
        delete nextState.branches[toDelete];
        return {
          nextState,
          output: { stdout: `Deleted branch ${toDelete}.`, exitCode: 0, actionTaken: 'DELETE_BRANCH' },
        };
      }

      // Create new branch
      const newBranchName = branchArg;
      if (nextState.branches[newBranchName]) {
        return {
          nextState,
          output: { stdout: `fatal: A branch named '${newBranchName}' already exists.`, exitCode: 128 },
        };
      }
      if (!nextState.headCommitId) {
        return {
          nextState,
          output: { stdout: `fatal: Not a valid object name: 'HEAD'. (Commit something first)`, exitCode: 128 },
        };
      }

      nextState.branches[newBranchName] = nextState.headCommitId;
      return {
        nextState,
        output: { stdout: ``, exitCode: 0, actionTaken: 'CREATE_BRANCH' },
      };
    }

    // git switch
    if (subCommand === 'switch') {
      let targetBranch = tokens[2];
      let createAndSwitch = false;

      if (targetBranch === '-c' || targetBranch === '-C') {
        createAndSwitch = true;
        targetBranch = tokens[3];
      }

      if (!targetBranch) {
        return {
          nextState,
          output: { stdout: `fatal: missing branch or commit argument`, exitCode: 1 },
        };
      }

      if (createAndSwitch) {
        if (!nextState.headCommitId) {
          return {
            nextState,
            output: { stdout: `fatal: cannot create branch from empty HEAD`, exitCode: 128 },
          };
        }
        nextState.branches[targetBranch] = nextState.headCommitId;
        nextState.currentBranch = targetBranch;
        return {
          nextState,
          output: { stdout: `Switched to a new branch '${targetBranch}'`, exitCode: 0, actionTaken: 'SWITCH_BRANCH' },
        };
      }

      if (nextState.branches[targetBranch]) {
        nextState.currentBranch = targetBranch;
        const targetCommitId = nextState.branches[targetBranch];
        nextState.headCommitId = targetCommitId;
        // update working directory to snapshot while preserving untracked files
        if (nextState.commits[targetCommitId]) {
          const targetFiles = nextState.commits[targetCommitId].files;
          const currentHeadFiles = state.headCommitId ? state.commits[state.headCommitId]?.files || {} : {};
          const newWorkDir: Record<string, string> = { ...targetFiles };
          Object.entries(nextState.workingDirectory).forEach(([fname, content]) => {
            if (currentHeadFiles[fname] === undefined && targetFiles[fname] === undefined) {
              newWorkDir[fname] = content;
            }
          });
          nextState.workingDirectory = newWorkDir;
        }
        return {
          nextState,
          output: { stdout: `Switched to branch '${targetBranch}'`, exitCode: 0, actionTaken: 'SWITCH_BRANCH' },
        };
      }

      return {
        nextState,
        output: { stdout: `fatal: invalid reference: ${targetBranch}`, exitCode: 1 },
      };
    }

    // git checkout
    if (subCommand === 'checkout') {
      let target = tokens[2];
      let createAndSwitch = false;

      if (target === '-b') {
        createAndSwitch = true;
        target = tokens[3];
      }

      if (!target) {
        return { nextState, output: { stdout: `fatal: missing argument for checkout`, exitCode: 1 } };
      }

      if (createAndSwitch) {
        if (!nextState.headCommitId) {
          return { nextState, output: { stdout: `fatal: cannot create branch from empty HEAD`, exitCode: 128 } };
        }
        nextState.branches[target] = nextState.headCommitId;
        nextState.currentBranch = target;
        return {
          nextState,
          output: { stdout: `Switched to a new branch '${target}'`, exitCode: 0, actionTaken: 'SWITCH_BRANCH' },
        };
      }

      // Check if checkout file
      if (nextState.workingDirectory[target] !== undefined || (tokens[2] === '--' && tokens[3])) {
        const fileToRestore = tokens[2] === '--' ? tokens[3] : target;
        const headCommit = nextState.headCommitId ? nextState.commits[nextState.headCommitId] : null;
        if (headCommit && headCommit.files[fileToRestore] !== undefined) {
          nextState.workingDirectory[fileToRestore] = headCommit.files[fileToRestore];
          delete nextState.stagedFiles[fileToRestore];
          return {
            nextState,
            output: { stdout: `Updated 1 path from HEAD`, exitCode: 0, actionTaken: 'RESTORE' },
          };
        }
      }

      // Checkout branch
      if (nextState.branches[target]) {
        nextState.currentBranch = target;
        const targetCommitId = nextState.branches[target];
        nextState.headCommitId = targetCommitId;
        if (nextState.commits[targetCommitId]) {
          const targetFiles = nextState.commits[targetCommitId].files;
          const currentHeadFiles = state.headCommitId ? state.commits[state.headCommitId]?.files || {} : {};
          const newWorkDir: Record<string, string> = { ...targetFiles };
          Object.entries(nextState.workingDirectory).forEach(([fname, content]) => {
            if (currentHeadFiles[fname] === undefined && targetFiles[fname] === undefined) {
              newWorkDir[fname] = content;
            }
          });
          nextState.workingDirectory = newWorkDir;
        }
        return {
          nextState,
          output: { stdout: `Switched to branch '${target}'`, exitCode: 0, actionTaken: 'SWITCH_BRANCH' },
        };
      }

      return {
        nextState,
        output: { stdout: `error: pathspec '${target}' did not match any file(s) known to git`, exitCode: 1 },
      };
    }

    // git merge
    if (subCommand === 'merge') {
      const targetBranch = tokens[2];
      if (!targetBranch) {
        return { nextState, output: { stdout: `fatal: No branch specified to merge`, exitCode: 1 } };
      }

      if (!nextState.branches[targetBranch]) {
        return { nextState, output: { stdout: `merge: ${targetBranch} - not something we can merge`, exitCode: 1 } };
      }

      if (targetBranch === nextState.currentBranch) {
        return { nextState, output: { stdout: `Already up to date.`, exitCode: 0 } };
      }

      const targetCommitId = nextState.branches[targetBranch];
      const currentCommitId = nextState.headCommitId;

      if (!currentCommitId) {
        return { nextState, output: { stdout: `fatal: Current branch has no commits`, exitCode: 1 } };
      }

      // Check Fast-Forward: is currentCommitId an ancestor of targetCommitId?
      let isFastForward = false;
      const targetCommit = nextState.commits[targetCommitId];
      if (targetCommit && targetCommit.parentIds.includes(currentCommitId)) {
        isFastForward = true;
      }

      // Check if merge conflict triggers (e.g. lesson 8 or conflicting edits)
      const currentCommit = nextState.commits[currentCommitId];
      const conflictFile = Object.keys(targetCommit.files).find(f => {
        return currentCommit.files[f] !== undefined && currentCommit.files[f] !== targetCommit.files[f];
      });

      if (conflictFile) {
        // Merge conflict triggered!
        const currentContent = currentCommit.files[conflictFile];
        const incomingContent = targetCommit.files[conflictFile];

        const conflictMarker = `<<<<<<< HEAD\n${currentContent.trim()}\n=======\n${incomingContent.trim()}\n>>>>>>> ${targetBranch}\n`;
        nextState.workingDirectory[conflictFile] = conflictMarker;
        nextState.conflict = {
          file: conflictFile,
          currentContent,
          incomingContent,
          baseContent: currentContent,
        };

        return {
          nextState,
          output: {
            stdout: `Auto-merging ${conflictFile}\nCONFLICT (content): Merge conflict in ${conflictFile}\nAutomatic merge failed; fix conflicts and then commit the result.`,
            exitCode: 1,
            actionTaken: 'CONFLICT',
          },
        };
      }

      if (isFastForward) {
        nextState.headCommitId = targetCommitId;
        nextState.branches[nextState.currentBranch] = targetCommitId;
        nextState.workingDirectory = { ...targetCommit.files };
        return {
          nextState,
          output: {
            stdout: `Updating ${currentCommitId.slice(0, 7)}..${targetCommitId.slice(0, 7)}\nFast-forward\n ${Object.keys(targetCommit.files).length} file(s) updated`,
            exitCode: 0,
            actionTaken: 'MERGE_FF',
          },
        };
      }

      // True 3-way merge commit
      const mergedFiles = { ...currentCommit.files, ...targetCommit.files };
      const mergeMsg = `Merge branch '${targetBranch}' into ${nextState.currentBranch}`;
      const mergeCommitId = generateCommitHash(mergeMsg, [currentCommitId, targetCommitId]);

      const mergeCommit: Commit = {
        id: mergeCommitId,
        shortId: mergeCommitId.slice(0, 7),
        message: mergeMsg,
        parentIds: [currentCommitId, targetCommitId],
        files: mergedFiles,
        timestamp: Date.now(),
        author: authorName,
        branch: nextState.currentBranch,
      };

      nextState.commits[mergeCommitId] = mergeCommit;
      nextState.headCommitId = mergeCommitId;
      nextState.branches[nextState.currentBranch] = mergeCommitId;
      nextState.workingDirectory = { ...mergedFiles };

      return {
        nextState,
        output: {
          stdout: `Merge made by the 'ort' strategy.\n ${Object.keys(mergedFiles).length} files consolidated`,
          exitCode: 0,
          actionTaken: 'MERGE_COMMIT',
        },
      };
    }

    // git restore
    if (subCommand === 'restore') {
      const isStagedFlag = trimmed.includes('--staged');
      const targetFile = tokens[tokens.length - 1];

      if (!targetFile || targetFile === 'restore' || targetFile === '--staged') {
        return { nextState, output: { stdout: `fatal: you must specify path(s) to restore`, exitCode: 1 } };
      }

      if (isStagedFlag) {
        if (nextState.stagedFiles[targetFile] !== undefined) {
          delete nextState.stagedFiles[targetFile];
          return {
            nextState,
            output: { stdout: `Unstaged changes for ${targetFile}`, exitCode: 0, actionTaken: 'UNSTAGE' },
          };
        }
        return { nextState, output: { stdout: ``, exitCode: 0 } };
      }

      // Restore working tree file from staging or HEAD
      const headCommit = nextState.headCommitId ? nextState.commits[nextState.headCommitId] : null;
      if (nextState.stagedFiles[targetFile] !== undefined) {
        nextState.workingDirectory[targetFile] = nextState.stagedFiles[targetFile];
      } else if (headCommit && headCommit.files[targetFile] !== undefined) {
        nextState.workingDirectory[targetFile] = headCommit.files[targetFile];
      } else {
        return {
          nextState,
          output: { stdout: `error: pathspec '${targetFile}' did not match any file(s) known to git`, exitCode: 1 },
        };
      }

      return {
        nextState,
        output: { stdout: `Restored ${targetFile} to previous state`, exitCode: 0, actionTaken: 'RESTORE' },
      };
    }

    // git reset
    if (subCommand === 'reset') {
      const isHard = trimmed.includes('--hard');
      const isSoft = trimmed.includes('--soft');
      const target = tokens.find(t => t !== 'git' && t !== 'reset' && t !== '--hard' && t !== '--soft') || 'HEAD';

      // Find commit: either hash or HEAD~1
      let targetCommitId: string | null = null;
      if (target === 'HEAD~1' || target === 'HEAD^') {
        const cur = nextState.headCommitId ? nextState.commits[nextState.headCommitId] : null;
        if (cur && cur.parentIds.length > 0) {
          targetCommitId = cur.parentIds[0];
        } else {
          return { nextState, output: { stdout: `fatal: Cannot reset before initial commit`, exitCode: 1 } };
        }
      } else if (target === 'HEAD') {
        targetCommitId = nextState.headCommitId;
      } else {
        const found = Object.values(nextState.commits).find(c => c.shortId === target || c.id === target);
        if (found) {
          targetCommitId = found.id;
        } else {
          return { nextState, output: { stdout: `fatal: ambiguous argument '${target}': unknown revision`, exitCode: 128 } };
        }
      }

      if (!targetCommitId) {
        return { nextState, output: { stdout: `fatal: target commit not found`, exitCode: 1 } };
      }

      nextState.headCommitId = targetCommitId;
      nextState.branches[nextState.currentBranch] = targetCommitId;

      if (isHard) {
        nextState.stagedFiles = {};
        nextState.workingDirectory = { ...nextState.commits[targetCommitId].files };
        nextState.conflict = null;
        return {
          nextState,
          output: {
            stdout: `HEAD is now at ${targetCommitId.slice(0, 7)} ${nextState.commits[targetCommitId].message}`,
            exitCode: 0,
            actionTaken: 'RESET_HARD',
          },
        };
      }

      if (isSoft) {
        return {
          nextState,
          output: {
            stdout: `HEAD reset to ${targetCommitId.slice(0, 7)} (staged changes retained)`,
            exitCode: 0,
            actionTaken: 'RESET_SOFT',
          },
        };
      }

      // Mixed reset (default): clear staged
      nextState.stagedFiles = {};
      return {
        nextState,
        output: {
          stdout: `Unstaged changes after reset:\n${Object.keys(nextState.workingDirectory).map(f => `M\t${f}`).join('\n')}`,
          exitCode: 0,
          actionTaken: 'RESET_MIXED',
        },
      };
    }

    // git revert
    if (subCommand === 'revert') {
      const target = tokens[2];
      if (!target) {
        return { nextState, output: { stdout: `fatal: commit-ish required for revert`, exitCode: 1 } };
      }

      const commitToRevert = Object.values(nextState.commits).find(c => c.shortId === target || c.id === target);
      if (!commitToRevert) {
        return { nextState, output: { stdout: `fatal: bad revision '${target}'`, exitCode: 128 } };
      }

      // In Git, revert creates a new commit undoing the changes
      const revertMsg = `Revert "${commitToRevert.message}"`;
      const parentIds = nextState.headCommitId ? [nextState.headCommitId] : [];
      const revertCommitId = generateCommitHash(revertMsg, parentIds);

      // Revert files back to commit's parent snapshot if any
      let revertedFiles: Record<string, string> = {};
      if (commitToRevert.parentIds.length > 0 && nextState.commits[commitToRevert.parentIds[0]]) {
        revertedFiles = { ...nextState.commits[commitToRevert.parentIds[0]].files };
      } else {
        // Reverting root commit: empty files
        revertedFiles = {};
      }

      const revertCommit: Commit = {
        id: revertCommitId,
        shortId: revertCommitId.slice(0, 7),
        message: revertMsg,
        parentIds,
        files: revertedFiles,
        timestamp: Date.now(),
        author: authorName,
        branch: nextState.currentBranch,
      };

      nextState.commits[revertCommitId] = revertCommit;
      nextState.headCommitId = revertCommitId;
      nextState.branches[nextState.currentBranch] = revertCommitId;
      nextState.workingDirectory = { ...revertedFiles };

      return {
        nextState,
        output: {
          stdout: `[${nextState.currentBranch} ${revertCommitId.slice(0, 7)}] ${revertMsg}\n 1 file changed, reversed modifications without losing history!`,
          exitCode: 0,
          actionTaken: 'REVERT',
        },
      };
    }

    // git remote
    if (subCommand === 'remote') {
      const subAction = tokens[2];
      if (!subAction) {
        const names = Object.keys(nextState.remotes);
        return {
          nextState,
          output: { stdout: names.join('\n'), exitCode: 0 },
        };
      }

      if (subAction === '-v') {
        const lines: string[] = [];
        Object.entries(nextState.remotes).forEach(([name, r]) => {
          lines.push(`${name}\t${r.url} (fetch)`);
          lines.push(`${name}\t${r.url} (push)`);
        });
        return {
          nextState,
          output: { stdout: lines.join('\n'), exitCode: 0 },
        };
      }

      if (subAction === 'add') {
        const remoteName = tokens[3];
        const remoteUrl = tokens[4];
        if (!remoteName || !remoteUrl) {
          return { nextState, output: { stdout: `usage: git remote add <name> <url>`, exitCode: 1 } };
        }
        if (nextState.remotes[remoteName]) {
          return { nextState, output: { stdout: `fatal: remote ${remoteName} already exists.`, exitCode: 128 } };
        }

        nextState.remotes[remoteName] = {
          name: remoteName,
          url: remoteUrl,
          commits: [],
          branches: [],
        };

        return {
          nextState,
          output: { stdout: ``, exitCode: 0, actionTaken: 'REMOTE_ADD' },
        };
      }

      return { nextState, output: { stdout: `error: unknown remote command`, exitCode: 1 } };
    }

    // git push
    if (subCommand === 'push') {
      const remoteName = tokens[2] || 'origin';
      const branchName = tokens[3] || nextState.currentBranch;

      if (!nextState.remotes[remoteName]) {
        return {
          nextState,
          output: {
            stdout: `fatal: '${remoteName}' does not appear to be a git repository\nCould not read from remote repository. Make sure you set up 'git remote add origin <url>'!`,
            exitCode: 128,
          },
        };
      }

      if (!nextState.headCommitId) {
        return {
          nextState,
          output: { stdout: `error: src refspec ${branchName} does not match any`, exitCode: 1 },
        };
      }

      // Sync commits to remote
      const remote = nextState.remotes[remoteName];
      const commitsToPush = Object.values(nextState.commits);
      remote.commits = [...commitsToPush];

      const existingBranchIdx = remote.branches.findIndex(b => b.name === branchName);
      if (existingBranchIdx >= 0) {
        remote.branches[existingBranchIdx].commitId = nextState.headCommitId;
      } else {
        remote.branches.push({ name: branchName, commitId: nextState.headCommitId });
      }

      nextState.remoteTrackingBranches[`${remoteName}/${branchName}`] = nextState.headCommitId;

      return {
        nextState,
        output: {
          stdout: `Enumerating objects: ${commitsToPush.length}, done.\nCounting objects: 100%, done.\nWriting objects: 100%, done.\nTo ${remote.url}\n * [new branch]      ${branchName} -> ${branchName}\nBranch '${branchName}' set up to track remote branch '${branchName}' from '${remoteName}'.`,
          exitCode: 0,
          actionTaken: 'PUSH',
        },
      };
    }

    // git fetch
    if (subCommand === 'fetch') {
      const remoteName = tokens[2] || 'origin';
      if (!nextState.remotes[remoteName]) {
        return { nextState, output: { stdout: `fatal: '${remoteName}' does not appear to be a git repository`, exitCode: 128 } };
      }

      const remote = nextState.remotes[remoteName];
      remote.branches.forEach(b => {
        nextState.remoteTrackingBranches[`${remoteName}/${b.name}`] = b.commitId;
      });

      return {
        nextState,
        output: {
          stdout: `From ${remote.url}\n * [new branch]      main       -> ${remoteName}/main`,
          exitCode: 0,
          actionTaken: 'FETCH',
        },
      };
    }

    // git pull
    if (subCommand === 'pull') {
      const remoteName = tokens[2] || 'origin';
      const branchName = tokens[3] || nextState.currentBranch;

      if (!nextState.remotes[remoteName]) {
        return { nextState, output: { stdout: `fatal: '${remoteName}' does not appear to be a git repository`, exitCode: 128 } };
      }

      const remote = nextState.remotes[remoteName];
      const remoteBranch = remote.branches.find(b => b.name === branchName);

      if (!remoteBranch) {
        return {
          nextState,
          output: { stdout: `From ${remote.url}\nYour configuration specifies to merge with the ref 'refs/heads/${branchName}' from the remote, but no such ref was fetched.`, exitCode: 1 },
        };
      }

      // Add missing commits from remote to local
      remote.commits.forEach(c => {
        if (!nextState.commits[c.id]) {
          nextState.commits[c.id] = c;
        }
      });

      nextState.remoteTrackingBranches[`${remoteName}/${branchName}`] = remoteBranch.commitId;

      // Update current branch
      nextState.branches[nextState.currentBranch] = remoteBranch.commitId;
      nextState.headCommitId = remoteBranch.commitId;
      if (nextState.commits[remoteBranch.commitId]) {
        nextState.workingDirectory = { ...nextState.commits[remoteBranch.commitId].files };
      }

      return {
        nextState,
        output: {
          stdout: `Updating ${nextState.headCommitId ? nextState.headCommitId.slice(0, 7) : ''}..${remoteBranch.commitId.slice(0, 7)}\nFast-forward\n Pulled remote updates successfully!`,
          exitCode: 0,
          actionTaken: 'PULL',
        },
      };
    }

    // Unknown git command
    return {
      nextState,
      output: {
        stdout: `git: '${subCommand}' is not a git command. See 'help' for available commands.`,
        exitCode: 1,
      },
    };
  }
}
