# Git & GitHub Game — Master Edition (MVP)

An interactive, visual browser-based game that teaches students and developers Git and GitHub from beginner to advanced levels.

Inspired by **GitHub × Atom × modern developer IDEs**: clean, technical, minimal, polished, and playful.

---

## 🎮 Core Features

* **Interactive HTML5 Canvas Git Graph (DAG)**:
  * Visualizes commit nodes, branch lines, and bezier curves in real time.
  * Pulsing animated `HEAD` pointer arrow indicating current active branch/commit.
  * Click any commit node to inspect its author, SHA hash, timestamp, and snapshot diffs.
* **The Three Trees Visualizer**:
  * Real-time internal state visualization of **Working Directory ➔ Staging Area (Index) ➔ Git Repository**.
  * Shows untracked, modified, and staged files.
* **Simulated Developer Terminal**:
  * Bash-like developer console with syntax highlighting (green for additions, red for deletions, cyan for branches).
  * Up/Down arrow command history navigation.
  * Tab-key autocompletion for git subcommands and filenames.
  * Real execution against a virtual Git state engine.
* **VS Code-Style 3-Way Conflict Resolver**:
  * Visual highlighting for `HEAD` (current) vs incoming branch.
  * One-click resolution: *Accept Current*, *Accept Incoming*, *Accept Both*, or manual in-place editing.
* **Simulated GitHub Web UI**:
  * Authentic GitHub repository view (`nirmit/nirmit-demo`).
  * Tabs: `<> Code` with file viewer, `Commits` timeline, `Branches`, and `Pull Requests`.
  * Interactive PR review workflow with diff inspection, reviewer approvals, and merge celebrations.
* **Progressive Hint & Learning System**:
  * Hint 1 (conceptual hint) ➔ Hint 2 (targeted clue) ➔ Hint 3 (command prefix) ➔ Reveal Solution.
  * Ordering exercises, command exercises, and mistake-based scenarios.
* **Gamification & Web Audio**:
  * Lightweight XP system (+100 XP per lesson, +50 XP no hints, +25 first try).
  * 12 Achievement Badges (First Commit, Branch Master, Conflict Slayer, Git Grandmaster, etc.).
  * Synthesized zero-latency developer audio feedback (keystrokes, success chimes, error buzzers, fanfare) with mute toggle.
* **Cryptographic Verification System & `/verify` Portal**:
  * Deterministic SHA-256 HMAC-style signature token generated upon completing all 12 missions.
  * `/verify` portal for course organizers to paste and validate completion tokens.
  * Printable & downloadable official certificate.

---

## 🗺️ 12-Mission Learning Pathway

### Level 1 — Git Fundamentals
1. **What is Git & The Three Trees**: Working Directory, Staging Area, and Git Repository.
2. **Your First Repository**: `git init` and `git status`.
3. **Staging & Committing**: `git add`, `git commit -m "..."`.

### Level 2 — Working With History
4. **Git Log & History**: `git log`, `git log --oneline`, `git show`.
5. **Undoing Things**: `git restore`, `git reset`, and `git revert` (mistake recovery).

### Level 3 — Branching
6. **Git Branches & HEAD**: `git branch`, `git switch`, `git checkout`.
7. **Merging Branches**: Fast-forward merges and 3-way merge commits.

### Level 4 — Merge Conflicts
8. **Merge Conflicts**: Diagnosing conflict markers and interactive 3-way resolution.

### Level 5 — GitHub
9. **GitHub Basics & Remotes**: `git remote add origin`, `git remote -v`.
10. **Push & Pull**: `git push origin main`, `git pull`, `git fetch`.

### Level 6 — Collaboration & Capstone
11. **Pull Requests & Code Review**: Feature branch ➔ Push ➔ Open PR ➔ Review ➔ Merge.
12. **Final Mission (StartupX Crisis)**: Multi-step capstone synthesizing branching, bug fixing, merging, conflict resolution, and deploying to GitHub.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### 3. Verify Route
You can visit `http://localhost:5173/#/verify` or click the `/verify` button in the header at any time to test the credential validator.

### 4. Build for Production
```bash
npm run build
```
The compiled bundle will be in `dist/`.

---

## ⚙️ Environment Configuration (Migration / Hosting)

Deployment-specific values live in environment variables instead of the code:

| Variable | Purpose |
| --- | --- |
| `VITE_SITE_URL` | The canonical "main link" of the deployed site. Used for certificate verification URLs and QR codes. Falls back to the current browser origin when unset. |
| `VITE_VERIFICATION_SALT` | Secret salt used to sign and verify course-completion tokens. Changing it invalidates previously issued tokens. |

### Local development

1. Copy the template: `cp .env.example .env`
2. Fill in your values. `.env` is gitignored — never commit it.

### Hosting (Vercel / Netlify / CI)

Because this is a static Vite build, set these as **build-time environment variables** (or secrets) in your hosting dashboard, then redeploy. `VITE_*` variables are inlined into the bundle at build time.

> ⚠️ Note: `VITE_*` variables are public by design (they ship in the JS bundle). The verification salt here only guards the token checksum — if you later need true secrecy, move token signing to a serverless function and keep the salt as a server-only secret.
