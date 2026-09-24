import { Lesson } from '../types/lesson';
import { RepositoryState } from '../types/git';

const createBaseState = (overrides?: Partial<RepositoryState>): RepositoryState => ({
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
  ...overrides,
});

export const LESSONS: Lesson[] = [
  // ==========================================
  // LEVEL 1: GIT FUNDAMENTALS
  // ==========================================
  {
    id: 1,
    level: 1,
    levelTitle: 'Level 1 — Git Fundamentals',
    title: 'What is Git & The Three Trees',
    summary: 'Master the fundamental architecture of Git: Working Directory, Staging Area, and the Git Repository.',
    description: `Git is a distributed version control system that tracks changes in files over time. Unlike simple backup tools, Git doesn't save copies of entire folders every time—it captures point-in-time snapshots called commits.

Git organizes your code into three primary zones (The Three Trees):
1. **Working Directory**: The actual files on your hard drive you edit.
2. **Staging Area (Index)**: A preparation area where you choose which specific changes to include in your next snapshot.
3. **Git Repository (History)**: The permanent database where snapshots (commits) are securely recorded forever.`,
    concepts: [
      {
        heading: 'The Three Zones of Git',
        body: 'Files transition from your Working Directory -> Staging Area -> Git Repository. This two-step commit process lets you craft clean, organized commits instead of bundling accidental drafts.',
        codeSnippet: `Working Directory  ──(git add)──>  Staging Area  ──(git commit)──>  Git Repository\n(Your messy files)                 (Crafted snapshot)             (Permanent history)`,
      },
      {
        heading: 'Why not just save directly to history?',
        body: 'Imagine you fixed a bug in index.html, but also started an experimental unfinished feature in app.js. The staging area lets you stage ONLY index.html and commit a clean bugfix, leaving app.js uncommitted for later.',
      },
    ],
    commandsTaught: ['git status', 'git add', 'git commit'],
    initialState: createBaseState({
      initialized: true,
      workingDirectory: {
        'index.html': '<h1>My Portfolio</h1>\n<p>Welcome!</p>',
        'style.css': 'body { background: #0d1117; color: #fff; }',
        'draft.txt': 'Notes: fix header layout',
      },
      stagedFiles: {},
    }),
    exercises: [
      {
        id: 'ex-1-order',
        title: 'Exercise 1: Git Life Cycle Sequence',
        instruction: 'Arrange the Git workflow steps in the correct chronological order from modifying code to saving it permanently into history.',
        type: 'ordering',
        hints: [
          'Think about what you do first when coding: write or modify files.',
          'Before creating a snapshot, you must prepare files in the staging area.',
          'The final step stores the snapshot in the repository permanently.',
        ],
        solutionExplanation: 'The standard Git lifecycle is: 1. Edit files in Working Directory -> 2. Inspect state with git status -> 3. Stage selected files with git add -> 4. Commit snapshot with git commit.',
        orderingItems: [
          { id: 'step-edit', text: '1. Modify files in your Working Directory', order: 1 },
          { id: 'step-status', text: '2. Check modified files using "git status"', order: 2 },
          { id: 'step-add', text: '3. Stage intended files using "git add <file>"', order: 3 },
          { id: 'step-commit', text: '4. Save snapshot to history using "git commit -m \\"msg\\""', order: 4 },
        ],
        validator: (_state, lastOutput) => {
          return lastOutput === 'ORDER_VALID';
        },
      },
      {
        id: 'ex-1-terminal',
        title: 'Exercise 2: Inspect Repository Status',
        instruction: 'Type `git status` in the terminal to inspect the current state of the working directory and staging area.',
        type: 'terminal',
        solutionCommand: 'git status',
        hints: [
          'Type the command that displays the working tree status.',
          'It starts with "git " followed by "status".',
        ],
        solutionExplanation: '`git status` inspects your branch, lists staged files, unstaged modified files, and untracked files.',
        validator: (_state, lastOutput, lastCmd) => {
          return Boolean(lastCmd && lastCmd.trim().toLowerCase() === 'git status');
        },
      },
    ],
    badgeReward: 'first_init',
  },

  {
    id: 2,
    level: 1,
    levelTitle: 'Level 1 — Git Fundamentals',
    title: 'Your First Repository: git init & status',
    summary: 'Turn any normal folder into a Git-tracked repository and observe how Git monitors internal state.',
    description: `When you create a project folder on your computer, Git knows nothing about it until you run:
\`git init\`

This command creates a hidden directory named \`.git\` inside your folder. The \`.git\` folder contains all Git's internal plumbing: the object database, branch references, and the index.

Once initialized, running \`git status\` reveals the pulse of your workspace.`,
    concepts: [
      {
        heading: 'Initializing a Repository',
        body: 'Running `git init` transforms the current directory into a Git repository. It sets up the default branch (usually `main`) and creates the tracking index.',
        codeSnippet: `$ git init\nInitialized empty Git repository in /project/.git/`,
      },
      {
        heading: 'Reading `git status` like a pro',
        body: 'Untracked files are files Git has never seen before. When you edit a tracked file, Git marks it as "Changes not staged for commit".',
      },
    ],
    commandsTaught: ['git init', 'git status'],
    initialState: createBaseState({
      initialized: false, // Player must initialize!
      workingDirectory: {
        'README.md': '# Project Alpha\nWelcome to our new repository.',
        'index.html': '<!DOCTYPE html><html><body><h1>Alpha</h1></body></html>',
      },
      stagedFiles: {},
    }),
    exercises: [
      {
        id: 'ex-2-init',
        title: 'Task 1: Initialize Git',
        instruction: 'Initialize this project folder as a new Git repository using the terminal.',
        type: 'terminal',
        solutionCommand: 'git init',
        hints: [
          'What command initializes a brand new Git repo?',
          'Try typing: git init',
        ],
        solutionExplanation: '`git init` creates the local Git database (.git folder) and starts tracking changes.',
        validator: (state) => state.initialized === true,
      },
      {
        id: 'ex-2-status',
        title: 'Task 2: Check Status of New Files',
        instruction: 'Now run `git status` to see how Git detects your untracked project files.',
        type: 'terminal',
        solutionCommand: 'git status',
        hints: [
          'Run the status command to see untracked files.',
          'Type: git status',
        ],
        solutionExplanation: 'Git shows README.md and index.html under "Untracked files".',
        validator: (state, _out, lastCmd) => {
          return state.initialized && Boolean(lastCmd && lastCmd.trim() === 'git status');
        },
      },
    ],
  },

  {
    id: 3,
    level: 1,
    levelTitle: 'Level 1 — Git Fundamentals',
    title: 'Staging & Committing: add & commit',
    summary: 'Selectively stage files into the index and seal them into your first immutable commit node.',
    description: `A **commit** is an immutable cryptographic snapshot of your project at a specific instant in time.

To create a commit:
1. Use \`git add <file>\` to move changes to the Staging Area.
2. Use \`git commit -m "Descriptive message"\` to seal the staged snapshot into history.

Every commit has a unique SHA hash (e.g. \`a7b4c92\`), author details, a timestamp, and a parent pointer.`,
    concepts: [
      {
        heading: 'Staging with `git add`',
        body: 'You can stage specific files (`git add index.html`) or stage all modified files at once (`git add .`).',
        codeSnippet: `$ git add index.html\n$ git status\nChanges to be committed:\n  new file:   index.html`,
      },
      {
        heading: 'Crafting meaningful commits',
        body: 'Always write concise, imperative commit messages (e.g. "Add landing page header", "Fix navigation link bug"). Avoid vague messages like "stuff" or "changes".',
        codeSnippet: `$ git commit -m "Create initial website layout"\n[main (root-commit) 3f8a1b2] Create initial website layout\n 2 files changed`,
      },
    ],
    commandsTaught: ['git add', 'git commit', 'git status'],
    initialState: createBaseState({
      initialized: true,
      workingDirectory: {
        'index.html': '<h1>Developer Portfolio</h1>',
        'style.css': 'body { background: #161b22; }',
        'notes.txt': 'Temporary notes to ignore',
      },
      stagedFiles: {},
    }),
    exercises: [
      {
        id: 'ex-3-add',
        title: 'Task 1: Stage Website Files',
        instruction: 'Stage `index.html` and `style.css` so they are prepared for the initial commit. (You can run `git add index.html style.css` or `git add .`)',
        type: 'terminal',
        solutionCommand: 'git add .',
        hints: [
          'Use `git add` followed by the filename.',
          'To add both, try `git add index.html style.css` or `git add .`',
        ],
        solutionExplanation: 'Files are now in the Staging Area (green in `git status`) waiting to be committed.',
        validator: (state) => {
          return Boolean(state.stagedFiles['index.html'] && state.stagedFiles['style.css']);
        },
      },
      {
        id: 'ex-3-commit',
        title: 'Task 2: Commit Your Work',
        instruction: 'Create your first commit with a message like: `git commit -m "Initial website"`',
        type: 'terminal',
        solutionCommand: 'git commit -m "Initial website"',
        hints: [
          'Remember the `-m` flag to specify your commit message.',
          'Example: git commit -m "Initial website"',
        ],
        solutionExplanation: 'Awesome! A new commit node has been added to your visual Git Graph.',
        validator: (state) => {
          return Object.keys(state.commits).length >= 1;
        },
      },
    ],
    badgeReward: 'first_commit',
  },

  // ==========================================
  // LEVEL 2: WORKING WITH HISTORY
  // ==========================================
  {
    id: 4,
    level: 2,
    levelTitle: 'Level 2 — Working With History',
    title: 'Git Log & History Inspection',
    summary: 'Travel through your repository timeline, analyze commit graphs, and inspect changes.',
    description: `Git repositories are essentially Directed Acyclic Graphs (DAGs) of commits. Every commit points to its parent commit(s).

To explore your project's lineage:
* \`git log\`: Shows detailed log with author, date, and full message.
* \`git log --oneline\`: Shows a compact summary (7-char hash + message).
* \`git show <hash>\`: Reveals the exact changes made in a specific commit.`,
    concepts: [
      {
        heading: 'The Power of `git log --oneline`',
        body: 'In production teams with hundreds of commits, `--oneline` gives you a rapid bird-eye overview of recent progress.',
        codeSnippet: `$ git log --oneline\n7f2a1b4 (HEAD -> main) Add contact form\n3c8d9e2 Style navigation bar\ne4a10f8 Initial commit`,
      },
      {
        heading: 'Interactive Commit Graph',
        body: 'Click any node on the Visual Git Graph in this playground to inspect its snapshot, timestamp, author, and parent relations!',
      },
    ],
    commandsTaught: ['git log', 'git log --oneline', 'git show'],
    initialState: createBaseState({
      initialized: true,
      currentBranch: 'main',
      headCommitId: 'c3',
      branches: { main: 'c3' },
      commits: {
        'c1': {
          id: 'c1',
          shortId: '9a1f2b3',
          message: 'Initial project setup with README',
          parentIds: [],
          files: { 'README.md': '# Project\nInitial release' },
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3,
          author: 'Alex Rivera <alex@dev.io>',
          branch: 'main',
        },
        'c2': {
          id: 'c2',
          shortId: '4b8e7c1',
          message: 'Add responsive landing page and styles',
          parentIds: ['c1'],
          files: { 'README.md': '# Project\nInitial release', 'index.html': '<h1>Home</h1>', 'style.css': 'body { margin: 0; }' },
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2,
          author: 'Alex Rivera <alex@dev.io>',
          branch: 'main',
        },
        'c3': {
          id: 'c3',
          shortId: '7d3a9f0',
          message: 'Implement user login authentication module',
          parentIds: ['c2'],
          files: { 'README.md': '# Project\nInitial release', 'index.html': '<h1>Home</h1>', 'auth.js': 'export const login = () => {};' },
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 1,
          author: 'Alex Rivera <alex@dev.io>',
          branch: 'main',
        },
      },
      workingDirectory: {
        'README.md': '# Project\nInitial release',
        'index.html': '<h1>Home</h1>',
        'auth.js': 'export const login = () => {};',
      },
      stagedFiles: {},
    }),
    exercises: [
      {
        id: 'ex-4-log',
        title: 'Task 1: Inspect Compact History',
        instruction: 'Run `git log --oneline` to view the three commits in compact mode.',
        type: 'terminal',
        solutionCommand: 'git log --oneline',
        hints: [
          'Use the oneline flag to see concise commits.',
          'Type: git log --oneline',
        ],
        solutionExplanation: 'Notice how each commit displays its short 7-character hash alongside the commit message.',
        validator: (_state, _out, lastCmd) => {
          return Boolean(lastCmd && lastCmd.includes('log') && lastCmd.includes('--oneline'));
        },
      },
      {
        id: 'ex-4-show',
        title: 'Task 2: Inspect a Specific Commit',
        instruction: 'Inspect the commit that added auth (`7d3a9f0` or `HEAD`) using `git show`.',
        type: 'terminal',
        solutionCommand: 'git show',
        hints: [
          'Run `git show` without arguments to see the HEAD commit, or specify a hash like `git show 7d3a9f0`.',
        ],
        solutionExplanation: '`git show` displays the full metadata, author, timestamp, and files modified in that commit.',
        validator: (_state, _out, lastCmd) => {
          return Boolean(lastCmd && lastCmd.trim().startsWith('git show'));
        },
      },
    ],
    badgeReward: 'git_historian',
  },

  {
    id: 5,
    level: 2,
    levelTitle: 'Level 2 — Working With History',
    title: 'Undoing Things: restore, reset, revert',
    summary: 'Master the safety net of Git: undo uncommitted edits, backtrack commits, or safely reverse pushed bugs.',
    description: `Mistakes happen. Git provides three primary ways to undo work, each designed for a specific scenario:

1. **\`git restore <file>\`**: Discards unstaged modifications in your working directory, resetting the file back to the latest commit.
2. **\`git reset <commit>\`**: Rewinds your branch pointer backward in time.
   * \`--hard\`: Wipes both staging area and working directory changes (caution!).
   * \`--soft\`: Moves HEAD back but keeps all your changes staged.
3. **\`git revert <commit>\`**: The safe choice for pushed history. Instead of rewriting or erasing past commits, it creates a *new commit* that applies the exact inverse of the target commit!`,
    concepts: [
      {
        heading: 'The Golden Rule of Public History',
        body: 'Never use `git reset` on commits you have already pushed to GitHub or shared with teammates. Rewriting shared history causes chaos for collaborators. Use `git revert` instead!',
        codeSnippet: `Local, unpushed mistake? ──> git reset HEAD~1 (or git restore)\nShared, pushed mistake?  ──> git revert <bad-commit-hash>`,
      },
    ],
    commandsTaught: ['git restore', 'git reset', 'git revert'],
    initialState: createBaseState({
      initialized: true,
      currentBranch: 'main',
      headCommitId: 'c2',
      branches: { main: 'c2' },
      commits: {
        'c1': {
          id: 'c1',
          shortId: '1111111',
          message: 'Stable production codebase',
          parentIds: [],
          files: { 'config.js': 'export const API_URL = "https://prod.api.com";' },
          timestamp: Date.now() - 1000 * 60 * 60,
          author: 'Dev <dev@test.io>',
          branch: 'main',
        },
        'c2': {
          id: 'c2',
          shortId: '2222222',
          message: 'Accidentally pushed broken API endpoint',
          parentIds: ['c1'],
          files: { 'config.js': 'export const API_URL = "http://localhost:broken";' },
          timestamp: Date.now() - 1000 * 30 * 60,
          author: 'Dev <dev@test.io>',
          branch: 'main',
        },
      },
      workingDirectory: {
        'config.js': 'export const API_URL = "http://localhost:broken"; // UNSTAGED TYPO ERROR!',
      },
      stagedFiles: {},
    }),
    exercises: [
      {
        id: 'ex-5-restore',
        title: 'Scenario 1: Discard accidental unstaged edits',
        instruction: 'You made an accidental typo in `config.js` in your working directory. Use `git restore config.js` to discard unstaged changes and restore it back to the last commit.',
        type: 'terminal',
        solutionCommand: 'git restore config.js',
        hints: [
          'Use git restore to discard unstaged modifications.',
          'Command: git restore config.js',
        ],
        solutionExplanation: '`git restore` safely restored `config.js` to the exact state in HEAD!',
        validator: (state) => {
          return !state.workingDirectory['config.js'].includes('UNSTAGED TYPO ERROR!');
        },
      },
      {
        id: 'ex-5-revert',
        title: 'Scenario 2: Safely undo the bad pushed commit',
        instruction: 'Commit `2222222` broke production and was pushed to remote. Undo its changes WITHOUT rewriting history by creating an inverse commit with `git revert 2222222`.',
        type: 'terminal',
        solutionCommand: 'git revert 2222222',
        hints: [
          'Remember: for pushed commits, git revert is the safe mechanism.',
          'Try: git revert 2222222',
        ],
        solutionExplanation: '`git revert` produced a new commit that safely reverses the bug while keeping the audit trail intact!',
        validator: (state) => {
          const headCommit = state.headCommitId ? state.commits[state.headCommitId] : null;
          return Boolean(headCommit && headCommit.message.toLowerCase().includes('revert'));
        },
      },
    ],
    badgeReward: 'time_traveler',
  },

  // ==========================================
  // LEVEL 3: BRANCHING
  // ==========================================
  {
    id: 6,
    level: 3,
    levelTitle: 'Level 3 — Branching',
    title: 'Git Branches & The HEAD Pointer',
    summary: 'Create parallel universes for new features and watch the HEAD pointer shift in real time.',
    description: `In Git, a **branch** is not an expensive copy of all your files. A branch is simply a tiny, lightweight moveable pointer (40 bytes!) to a specific commit.

The special pointer **\`HEAD\`** tells Git which branch and commit you are currently standing on.

Key commands:
* \`git branch <name>\`: Creates a new branch pointer at your current commit.
* \`git switch <name>\`: Moves \`HEAD\` to target branch and updates your working files.
* \`git switch -c <name>\` (or \`git checkout -b <name>\`): Creates and switches in one step.`,
    concepts: [
      {
        heading: 'How HEAD Moves',
        body: 'When you make a new commit on `feature-navbar`, the `feature-navbar` pointer advances to the new commit, while `main` stays where it was. HEAD follows along.',
        codeSnippet: `main:          A──B\n                   \\\nfeature-login:      C──D  <-- HEAD`,
      },
    ],
    commandsTaught: ['git branch', 'git switch', 'git checkout'],
    initialState: createBaseState({
      initialized: true,
      currentBranch: 'main',
      headCommitId: 'c1',
      branches: { main: 'c1' },
      commits: {
        'c1': {
          id: 'c1',
          shortId: '90a1b2c',
          message: 'Initial project setup on main',
          parentIds: [],
          files: { 'index.html': '<h1>Home</h1>' },
          timestamp: Date.now() - 1000 * 60 * 10,
          author: 'Nirmit <nirmit@dev.io>',
          branch: 'main',
        },
      },
      workingDirectory: {
        'index.html': '<h1>Home</h1>',
        'dark-theme.css': 'body.dark { background: #0d1117; color: #c9d1d9; }\n',
      },
      stagedFiles: {},
    }),
    exercises: [
      {
        id: 'ex-6-branch',
        title: 'Task 1: Create a Feature Branch',
        instruction: 'Create a new branch named `feature-darkmode` using `git branch feature-darkmode`.',
        type: 'terminal',
        solutionCommand: 'git branch feature-darkmode',
        hints: [
          'Use git branch followed by the branch name.',
          'Command: git branch feature-darkmode',
        ],
        solutionExplanation: '`feature-darkmode` branch pointer created! Notice in the visual graph that both `main` and `feature-darkmode` point to the same commit.',
        validator: (state) => Boolean(state.branches['feature-darkmode']),
      },
      {
        id: 'ex-6-switch',
        title: 'Task 2: Switch to Your Feature Branch',
        instruction: 'Move HEAD to your new branch using `git switch feature-darkmode` (or `git checkout feature-darkmode`).',
        type: 'terminal',
        solutionCommand: 'git switch feature-darkmode',
        hints: [
          'Switch your active branch using `git switch feature-darkmode`.',
        ],
        solutionExplanation: 'HEAD is now pointing to `feature-darkmode`! Any commits you make now will only affect this branch.',
        validator: (state) => state.currentBranch === 'feature-darkmode',
      },
      {
        id: 'ex-6-commit',
        title: 'Task 3: Commit on Feature Branch',
        instruction: 'Stage and commit your new dark theme feature: run `git commit -m "Add dark theme styles"` (or stage with `git add .` first).',
        type: 'terminal',
        solutionCommand: 'git commit -m "Add dark theme styles"',
        hints: [
          'You can stage with `git add .` or commit directly with: git commit -m "Add dark theme styles"',
        ],
        solutionExplanation: 'Look at the visual graph: the feature branch branched off and moved ahead of main!',
        validator: (state) => {
          return state.currentBranch === 'feature-darkmode' && Object.keys(state.commits).length >= 2;
        },
      },
    ],
    badgeReward: 'branch_master',
  },

  {
    id: 7,
    level: 3,
    levelTitle: 'Level 3 — Branching',
    title: 'Merging Branches: Fast-Forward & Merge Commits',
    summary: 'Bring independent lines of development back together using git merge.',
    description: `When your feature is complete and tested, you integrate it back into your primary branch using \`git merge\`.

There are two primary types of merges:
1. **Fast-Forward Merge**: If the target branch has had no new commits since you branched off, Git simply slides the pointer forward. No extra commit needed!
2. **3-Way Merge (Merge Commit)**: If both branches have new unique commits, Git creates a special **Merge Commit** that has TWO parents, linking both histories together.`,
    concepts: [
      {
        heading: 'Fast-Forward vs Merge Commit',
        body: 'Fast-forward is linear and simple. 3-way merge preserves the distinct story of how a feature was developed in parallel.',
        codeSnippet: `Fast-Forward:\nmain: A──B ──> A──B──C──D (main pointer moved forward)\n\n3-Way Merge Commit:\nmain:    A──B───────M (Merge Commit with 2 parents)\n             \\     /\nfeature:      C───D`,
      },
    ],
    commandsTaught: ['git merge', 'git switch', 'git log --oneline'],
    initialState: createBaseState({
      initialized: true,
      currentBranch: 'main',
      headCommitId: 'c1',
      branches: {
        main: 'c1',
        'feature-search': 'c2',
      },
      commits: {
        'c1': {
          id: 'c1',
          shortId: 'aaa1111',
          message: 'Base app structure',
          parentIds: [],
          files: { 'app.js': 'console.log("App ready");', 'index.html': '<h1>Store</h1>' },
          timestamp: Date.now() - 1000 * 60 * 60,
          author: 'Dev <dev@test.io>',
          branch: 'main',
        },
        'c2': {
          id: 'c2',
          shortId: 'bbb2222',
          message: 'Add search bar component',
          parentIds: ['c1'],
          files: { 'app.js': 'console.log("App ready");', 'index.html': '<h1>Store</h1>', 'search.js': 'export function search() {}' },
          timestamp: Date.now() - 1000 * 30 * 60,
          author: 'Dev <dev@test.io>',
          branch: 'feature-search',
        },
      },
      workingDirectory: { 'app.js': 'console.log("App ready");', 'index.html': '<h1>Store</h1>' },
      stagedFiles: {},
    }),
    exercises: [
      {
        id: 'ex-7-merge',
        title: 'Task: Merge feature-search into main',
        instruction: 'You are on branch `main`. Merge `feature-search` into `main` using `git merge feature-search`.',
        type: 'terminal',
        solutionCommand: 'git merge feature-search',
        hints: [
          'Ensure you merge the feature branch: git merge feature-search',
        ],
        solutionExplanation: 'Fast-forward merge complete! Main now points to the latest commit and includes search.js.',
        validator: (state) => {
          return state.currentBranch === 'main' && state.headCommitId === 'c2';
        },
      },
    ],
    badgeReward: 'merge_artisan',
  },

  // ==========================================
  // LEVEL 4: MERGE CONFLICTS
  // ==========================================
  {
    id: 8,
    level: 4,
    levelTitle: 'Level 4 — Merge Conflicts',
    title: 'Merge Conflicts: Diagnosis & Resolution',
    summary: 'Demystify merge conflicts! Learn how conflict markers work and resolve them interactively.',
    description: `A merge conflict happens when Git cannot figure out how to automatically combine two branches because **the same lines in the same file were modified differently** on both sides.

Instead of guessing, Git pauses the merge and inserts **conflict markers**:

\`\`\`html
<<<<<<< HEAD
<h1>Hello World (from main)</h1>
=======
<h1>Hello GitHub (from feature)</h1>
>>>>>>> feature-header
\`\`\`

To resolve a conflict:
1. Open the file and decide what code to keep (Current, Incoming, or Both).
2. Remove the markers: \`<<<<<<<\`, \`=======\`, \`>>>>>>>\`.
3. Stage the resolved file with \`git add <file>\`.
4. Finalize the merge commit with \`git commit -m "Resolve merge conflict"\`.`,
    concepts: [
      {
        heading: 'Anatomy of Conflict Markers',
        body: 'HEAD shows what was on your current branch. The equals line (=======) divides the two versions. The bottom shows what incoming branch brought in.',
      },
      {
        heading: 'Interactive Conflict Resolver',
        body: 'Use our built-in VS Code style conflict helper below or resolve directly in the terminal!',
      },
    ],
    commandsTaught: ['git merge', 'git add', 'git commit', 'git status'],
    initialState: createBaseState({
      initialized: true,
      currentBranch: 'main',
      headCommitId: 'c1',
      branches: {
        main: 'c1',
        'feature-hero': 'c2',
      },
      commits: {
        'c0': {
          id: 'c0',
          shortId: 'base001',
          message: 'Initial header layout',
          parentIds: [],
          files: { 'index.html': '<h1>Welcome to App</h1>' },
          timestamp: Date.now() - 1000 * 60 * 120,
          author: 'Team <team@dev.io>',
        },
        'c1': {
          id: 'c1',
          shortId: 'main002',
          message: 'Update headline to Hello World on main',
          parentIds: ['c0'],
          files: { 'index.html': '<h1>Hello World</h1>' },
          timestamp: Date.now() - 1000 * 60 * 60,
          author: 'Team <team@dev.io>',
          branch: 'main',
        },
        'c2': {
          id: 'c2',
          shortId: 'feat003',
          message: 'Update headline to Hello GitHub on feature',
          parentIds: ['c0'],
          files: { 'index.html': '<h1>Hello GitHub</h1>' },
          timestamp: Date.now() - 1000 * 60 * 30,
          author: 'Nirmit <nirmit@dev.io>',
          branch: 'feature-hero',
        },
      },
      workingDirectory: { 'index.html': '<h1>Hello World</h1>' },
      stagedFiles: {},
    }),
    exercises: [
      {
        id: 'ex-8-trigger',
        title: 'Step 1: Attempt the Merge to Trigger Conflict',
        instruction: 'Run `git merge feature-hero` from `main` to trigger the merge conflict.',
        type: 'terminal',
        solutionCommand: 'git merge feature-hero',
        hints: ['Run: git merge feature-hero'],
        solutionExplanation: 'Git detected conflicting changes on line 1 of index.html and stopped automatic merge.',
        validator: (state) => state.conflict !== null,
      },
      {
        id: 'ex-8-resolve',
        title: 'Step 2: Resolve the Conflict in index.html',
        instruction: 'Use the interactive conflict resolver panel to choose "Keep Incoming", "Keep Current", or "Keep Both", then stage it with `git add index.html`.',
        type: 'conflict',
        hints: [
          'Click one of the resolution buttons on the Conflict Resolver card above, or stage the resolved file with `git add index.html`.',
        ],
        solutionExplanation: 'The conflict markers have been resolved and index.html is staged!',
        validator: (state) => state.conflict === null && Boolean(state.stagedFiles['index.html']),
      },
      {
        id: 'ex-8-finish',
        title: 'Step 3: Commit the Resolution',
        instruction: 'Finalize the merge by committing: `git commit -m "Resolve merge conflict in index.html"`',
        type: 'terminal',
        solutionCommand: 'git commit -m "Resolve merge conflict in index.html"',
        hints: [
          'Run git commit -m "Resolve merge conflict in index.html"',
        ],
        solutionExplanation: 'Outstanding! You mastered the most intimidating part of Git: resolving merge conflicts cleanly.',
        validator: (state) => {
          return state.conflict === null && Object.keys(state.stagedFiles).length === 0 && Object.keys(state.commits).length >= 4;
        },
      },
    ],
    badgeReward: 'conflict_slayer',
  },

  // ==========================================
  // LEVEL 5: GITHUB
  // ==========================================
  {
    id: 9,
    level: 5,
    levelTitle: 'Level 5 — GitHub',
    title: 'GitHub Basics & Remote Repositories',
    summary: 'Understand the difference between Git (local version control) and GitHub (cloud collaboration platform).',
    description: `Git is your **local tool** that lives on your computer. GitHub is a **cloud platform** that hosts Git repositories online so developers can collaborate globally.

To link your local repository to a remote repository on GitHub:
\`\`\`bash
git remote add origin https://github.com/nirmit/nirmit-demo.git
git remote -v
\`\`\`

* \`origin\` is the conventional shorthand nickname for your primary remote repository.
* \`-v\` (verbose) displays the fetch and push URLs.`,
    concepts: [
      {
        heading: 'Local vs Remote',
        body: 'Your local commits exist only on your laptop until you push them to a remote like GitHub.',
        codeSnippet: `Local (Your Laptop) ──[git push origin main]──> Remote (GitHub Cloud)\nLocal (Your Laptop) <──[git pull origin main]── Remote (GitHub Cloud)`,
      },
    ],
    commandsTaught: ['git remote', 'git remote add', 'git remote -v'],
    initialState: createBaseState({
      initialized: true,
      currentBranch: 'main',
      headCommitId: 'c1',
      branches: { main: 'c1' },
      commits: {
        'c1': {
          id: 'c1',
          shortId: 'e5f6a7b',
          message: 'Initialize project structure',
          parentIds: [],
          files: { 'README.md': '# nirmit-demo\nAwesome Git Project', 'app.js': 'console.log("Ready");' },
          timestamp: Date.now() - 1000 * 60 * 30,
          author: 'Nirmit <nirmit@dev.io>',
          branch: 'main',
        },
      },
      workingDirectory: { 'README.md': '# nirmit-demo\nAwesome Git Project', 'app.js': 'console.log("Ready");' },
      stagedFiles: {},
      remotes: {},
    }),
    exercises: [
      {
        id: 'ex-9-remote-add',
        title: 'Task 1: Add GitHub Remote Origin',
        instruction: 'Add the remote named `origin` with URL `https://github.com/nirmit/nirmit-demo.git` using `git remote add origin https://github.com/nirmit/nirmit-demo.git`.',
        type: 'terminal',
        solutionCommand: 'git remote add origin https://github.com/nirmit/nirmit-demo.git',
        hints: [
          'Command syntax: git remote add origin <url>',
          'Try: git remote add origin https://github.com/nirmit/nirmit-demo.git',
        ],
        solutionExplanation: 'Remote `origin` has been established! Look at the simulated GitHub tab on the right.',
        validator: (state) => Boolean(state.remotes['origin']),
      },
      {
        id: 'ex-9-remote-v',
        title: 'Task 2: Verify Remotes with -v',
        instruction: 'Run `git remote -v` to check your configured fetch and push remote URLs.',
        type: 'terminal',
        solutionCommand: 'git remote -v',
        hints: ['Type: git remote -v'],
        solutionExplanation: '`git remote -v` lists both fetch and push target endpoints for origin.',
        validator: (state, _out, lastCmd) => {
          return Boolean(state.remotes['origin'] && lastCmd && lastCmd.includes('remote') && lastCmd.includes('-v'));
        },
      },
    ],
    badgeReward: 'github_explorer',
  },

  {
    id: 10,
    level: 5,
    levelTitle: 'Level 5 — GitHub',
    title: 'Push & Pull: Synchronizing with Cloud',
    summary: 'Transmit your local commits to GitHub and download updates committed by other developers.',
    description: `Working with remotes revolves around two core actions:
1. **\`git push origin <branch>\`**: Uploads all new commits from your local branch to the corresponding branch on GitHub.
2. **\`git pull origin <branch>\`**: Fetches new commits uploaded to GitHub by teammates and merges them into your local branch.

Behind the scenes: \`git pull\` = \`git fetch\` (download data) + \`git merge\` (integrate into current branch).`,
    concepts: [
      {
        heading: 'Tracking Branches',
        body: 'When you push, Git establishes a tracking pointer like `origin/main`. This lets Git tell you whether your branch is ahead or behind the cloud.',
      },
    ],
    commandsTaught: ['git push', 'git pull', 'git fetch'],
    initialState: createBaseState({
      initialized: true,
      currentBranch: 'main',
      headCommitId: 'c2',
      branches: { main: 'c2' },
      commits: {
        'c1': {
          id: 'c1',
          shortId: '1010101',
          message: 'Initial project setup',
          parentIds: [],
          files: { 'index.html': '<h1>Local App</h1>' },
          timestamp: Date.now() - 1000 * 60 * 60,
          author: 'Dev <dev@test.io>',
        },
        'c2': {
          id: 'c2',
          shortId: '2020202',
          message: 'Local enhancement ready to push',
          parentIds: ['c1'],
          files: { 'index.html': '<h1>Local App</h1>', 'feature.js': 'console.log("New feature");' },
          timestamp: Date.now() - 1000 * 60 * 10,
          author: 'Dev <dev@test.io>',
          branch: 'main',
        },
      },
      workingDirectory: { 'index.html': '<h1>Local App</h1>', 'feature.js': 'console.log("New feature");' },
      stagedFiles: {},
      remotes: {
        origin: {
          name: 'origin',
          url: 'https://github.com/nirmit/nirmit-demo.git',
          commits: [
            {
              id: 'c1',
              shortId: '1010101',
              message: 'Initial project setup',
              parentIds: [],
              files: { 'index.html': '<h1>Local App</h1>' },
              timestamp: Date.now() - 1000 * 60 * 60,
              author: 'Dev <dev@test.io>',
            },
          ],
          branches: [{ name: 'main', commitId: 'c1' }],
        },
      },
      remoteTrackingBranches: { 'origin/main': 'c1' },
    }),
    exercises: [
      {
        id: 'ex-10-push',
        title: 'Task 1: Push Local Commit to GitHub',
        instruction: 'Your local branch is 1 commit ahead of GitHub. Push your commit using `git push origin main`.',
        type: 'terminal',
        solutionCommand: 'git push origin main',
        hints: [
          'Run git push specifying the remote and branch.',
          'Command: git push origin main',
        ],
        solutionExplanation: 'Transmission complete! Your commit `2020202` is now safely backed up on GitHub and visible to teammates.',
        validator: (state) => {
          return Boolean(state.remoteTrackingBranches['origin/main'] === 'c2');
        },
      },
    ],
    badgeReward: 'cloud_sync',
  },

  // ==========================================
  // LEVEL 6: COLLABORATION
  // ==========================================
  {
    id: 11,
    level: 6,
    levelTitle: 'Level 6 — Collaboration',
    title: 'The GitHub Workflow: Pull Requests & Code Review',
    summary: 'Experience the modern team collaboration lifecycle: branches, pull requests, peer reviews, and merges.',
    description: `In professional engineering teams, developers don't push directly to \`main\`. Instead, they follow the **GitHub Flow**:

1. Create a feature branch from main.
2. Commit changes and push to GitHub.
3. Open a **Pull Request (PR)** asking teammates to review changes.
4. Discuss diffs, address review feedback, and receive approvals.
5. Click **Merge Pull Request** to deploy changes into production!`,
    concepts: [
      {
        heading: 'Why Pull Requests matter',
        body: 'Pull Requests provide code quality gates, automated testing runs, and peer knowledge sharing before code impacts real users.',
      },
    ],
    commandsTaught: ['git switch -c', 'git commit', 'git push', 'Pull Request Review'],
    initialState: createBaseState({
      initialized: true,
      currentBranch: 'main',
      headCommitId: 'c1',
      branches: { main: 'c1' },
      commits: {
        'c1': {
          id: 'c1',
          shortId: '91a2b3c',
          message: 'Production stable release',
          parentIds: [],
          files: { 'index.html': '<h1>Production App</h1>', 'README.md': '# Project' },
          timestamp: Date.now() - 1000 * 60 * 120,
          author: 'Lead Dev <lead@company.com>',
        },
      },
      workingDirectory: {
        'index.html': '<h1>Production App</h1>',
        'README.md': '# Project',
        'profile.js': 'export function renderProfile() { return "<div class=\\"profile\\">Profile</div>"; }\n',
      },
      stagedFiles: {},
      remotes: {
        origin: {
          name: 'origin',
          url: 'https://github.com/nirmit/nirmit-demo.git',
          commits: [],
          branches: [{ name: 'main', commitId: 'c1' }],
        },
      },
      remoteTrackingBranches: { 'origin/main': 'c1' },
    }),
    exercises: [
      {
        id: 'ex-11-branch-push',
        title: 'Task 1: Create Branch & Push Feature',
        instruction: 'Create and switch to a feature branch `feature-profile` with `git switch -c feature-profile`, then commit your changes and push with `git push origin feature-profile`.',
        type: 'terminal',
        solutionCommand: 'git switch -c feature-profile',
        hints: [
          'Create branch: git switch -c feature-profile',
          'Commit changes: git commit -m "Add user profile page"',
          'Push: git push origin feature-profile',
        ],
        solutionExplanation: 'Feature branch pushed to GitHub! A prompt to open a Pull Request is now available.',
        validator: (state) => {
          return Boolean(state.branches['feature-profile'] && state.remoteTrackingBranches['origin/feature-profile']);
        },
      },
      {
        id: 'ex-11-pr-modal',
        title: 'Task 2: Review and Merge Pull Request',
        instruction: 'Open the simulated Pull Request viewer in the GitHub panel, review the changed diffs, approve the peer review, and click "Merge Pull Request"!',
        type: 'github_pr',
        hints: [
          'Click the "Pull Requests" tab in the GitHub simulator widget.',
          'Review the diff and click "Approve and Merge".',
        ],
        solutionExplanation: 'Congratulations! You successfully completed the entire real-world GitHub Flow.',
        validator: (_state, lastOutput) => {
          return lastOutput === 'PR_MERGED';
        },
      },
    ],
    badgeReward: 'pr_champion',
  },

  // ==========================================
  // FINAL CAPSTONE MISSION
  // ==========================================
  {
    id: 12,
    level: 6,
    levelTitle: 'Advanced Capstone — Git Mission',
    title: 'Final Mission: Production Crisis at StartupX',
    summary: 'Solve a multi-step real-world crisis: branch, fix, commit, merge, resolve a live conflict, and deploy to GitHub.',
    description: `🔥 **MISSION BRIEFING:**
You are the Lead Engineer at StartupX. A critical update is required on the user onboarding flow, but a colleague just pushed divergent changes to \`main\`.

Your Mission Checklist:
1. Initialize repository and connect to remote origin \`https://github.com/startup/app.git\` (already configured).
2. Create and switch to feature branch \`fix-onboarding\`.
3. Modify and stage the onboarding logic in \`onboarding.js\` and commit:
   \`git commit -m "Fix onboarding step 3 validation"\`
4. Switch back to \`main\`:
   \`git switch main\`
5. Merge \`fix-onboarding\` into \`main\` with \`git merge fix-onboarding\`.
6. Resolve the detected merge conflict in \`onboarding.js\`, stage it with \`git add .\`, and finalize commit.
7. Push the repaired production branch to GitHub with \`git push origin main\`!`,
    concepts: [
      {
        heading: 'Putting Everything Together',
        body: 'This mission synthesizes every single skill you learned: branch management, index staging, conflict resolution, and cloud remote deployment.',
      },
    ],
    commandsTaught: ['git switch -c', 'git commit', 'git merge', 'git add', 'git push'],
    initialState: createBaseState({
      initialized: true,
      currentBranch: 'main',
      headCommitId: 'c_lead',
      branches: {
        main: 'c_lead',
      },
      commits: {
        'c_base': {
          id: 'c_base',
          shortId: 'b012345',
          message: 'Base startup website',
          parentIds: [],
          files: {
            'index.html': '<h1>StartupX</h1>',
            'onboarding.js': '// Onboarding v1\nfunction step3() {\n  return "default";\n}\n',
          },
          timestamp: Date.now() - 1000 * 60 * 180,
          author: 'Startup Team <team@startup.io>',
        },
        'c_lead': {
          id: 'c_lead',
          shortId: 'm123456',
          message: 'Update step 3 to require email confirmation on main',
          parentIds: ['c_base'],
          files: {
            'index.html': '<h1>StartupX</h1>',
            'onboarding.js': '// Onboarding v1\nfunction step3() {\n  return "require_email_code";\n}\n',
          },
          timestamp: Date.now() - 1000 * 60 * 60,
          author: 'Alex Rivera <alex@startup.io>',
          branch: 'main',
        },
      },
      workingDirectory: {
        'index.html': '<h1>StartupX</h1>',
        'onboarding.js': '// Onboarding v1\nfunction step3() {\n  return "validated_phone_and_email";\n}\n',
      },
      stagedFiles: {},
      remotes: {
        origin: {
          name: 'origin',
          url: 'https://github.com/startup/app.git',
          commits: [],
          branches: [{ name: 'main', commitId: 'c_lead' }],
        },
      },
      remoteTrackingBranches: { 'origin/main': 'c_lead' },
    }),
    exercises: [
      {
        id: 'ex-12-branch-commit',
        title: 'Step 1: Create Feature Branch & Make Fix',
        instruction: 'Create and switch to `fix-onboarding`: `git switch -c fix-onboarding`. Then commit the fix: `git commit -m "Fix onboarding step 3 validation"` (or stage any changes if needed).',
        type: 'terminal',
        solutionCommand: 'git switch -c fix-onboarding',
        hints: [
          'Create branch: git switch -c fix-onboarding',
          'Commit: git commit -m "Fix onboarding step 3 validation"',
        ],
        solutionExplanation: 'Feature branch created and committed!',
        validator: (state) => {
          return Boolean(state.branches['fix-onboarding']);
        },
      },
      {
        id: 'ex-12-merge-conflict',
        title: 'Step 2: Switch to main & Merge fix-onboarding',
        instruction: 'Switch back to `main` with `git switch main`, then merge `fix-onboarding` with `git merge fix-onboarding`.',
        type: 'terminal',
        solutionCommand: 'git switch main',
        hints: [
          'Switch: git switch main',
          'Merge: git merge fix-onboarding',
        ],
        solutionExplanation: 'Merge initiated!',
        validator: (state) => {
          return state.currentBranch === 'main';
        },
      },
      {
        id: 'ex-12-push-prod',
        title: 'Step 3: Push Final Resolution to GitHub',
        instruction: 'Ensure conflicts are staged (`git add .`), committed (`git commit -m "Final production fix"`), and push to GitHub: `git push origin main`!',
        type: 'terminal',
        solutionCommand: 'git push origin main',
        hints: [
          'Stage any remaining files: git add .',
          'Commit: git commit -m "Final production fix"',
          'Push: git push origin main',
        ],
        solutionExplanation: 'MISSION ACCOMPLISHED! All 12 lessons and practical capstone completed successfully.',
        validator: (state) => {
          return Boolean(state.remoteTrackingBranches['origin/main'] === state.headCommitId && state.currentBranch === 'main');
        },
      },
    ],
    badgeReward: 'git_architect',
  },
];
