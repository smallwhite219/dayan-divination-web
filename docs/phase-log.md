# Phase Log

## 2026-06-14 - Project Scaffold

- Agent: Codex.
- Goal: Create new local project with governance, core algorithm, UI, and test plan.
- Files changed: new `dayan-divination-web` project files.
- Validation:
  - TypeScript test compile passed via bundled Node + local TypeScript.
  - Core algorithm test passed: `dayan tests passed`.
  - TypeScript app check passed: `tsc --noEmit`.
  - Vite production build passed; `dist/index.html` uses `./assets/...` relative paths.
- Browser smoke test: not run because the in-app Browser tool was not exposed by tool discovery in this turn.
- Dependency note: global `npm` was unavailable; validation used a local `node_modules` junction to existing offline dependencies.
- Risks: root `.gitignore` contains `*`, so this project requires force-add if it should be committed from the workspace root.

## 2026-06-14 - GitHub Upload Preparation

- Agent: Codex.
- Goal: Upload this project to `smallwhite219/dayan-divination-web.git`.
- Key decision: initialize `dayan-divination-web` as its own nested Git repository, because workspace root has unrelated dirty state.
- Release topology: recorded in `docs/release-topology.md`.
- Validation before upload: reuse previous `tsc`, unit test, and Vite build results.

## 2026-06-14 - GitHub Upload Completed

- Agent: Codex.
- Goal: Push `dayan-divination-web` to GitHub.
- Remote: `https://github.com/smallwhite219/dayan-divination-web.git`
- Branch: `main`
- Commit pushed: `89d0b12 Initial Dayan divination web app`
- Validation:
  - TypeScript test compile passed.
  - Core algorithm test passed: `dayan tests passed`.
  - TypeScript app check passed: `tsc --noEmit`.
  - Vite production build passed.
- Notes:
  - GitHub CLI was not available, so upload used plain `git push`.
  - No PR was opened because the user requested direct upload to a specific repository.

## 2026-06-14 - GitHub Pages MIME Fix

- Agent: Codex.
- Problem: GitHub Pages served repository root `index.html`, which loaded `./src/main.tsx` directly and failed with MIME type `application/octet-stream`.
- Root cause: Vite source files were pushed, but Pages was not configured to serve the compiled `dist/` output.
- Change: added `.github/workflows/pages.yml` to build with Vite and deploy `dist/` through GitHub Pages Actions.
- Release topology: updated Pages source mode to GitHub Actions.

## 2026-06-14 - Branch-Root Pages Hotfix

- Agent: Codex.
- Problem: GitHub Pages still served branch root after the Actions workflow succeeded.
- Root cause: repository Pages source remained `main` / root, so the Actions artifact was not the live site source.
- Change: copied compiled Vite assets to root `assets/`, changed root `index.html` to load compiled JS/CSS, and preserved the source Vite entry as `index.dev.html`.
- Verification:
  - `https://smallwhite219.github.io/dayan-divination-web/?v=b01f353-2` returns root HTML loading `./assets/index-DqKW2qK9.js` and `./assets/index-C7knN4Il.css`.
  - `https://smallwhite219.github.io/dayan-divination-web/assets/index-DqKW2qK9.js` returns `Content-Type: application/javascript; charset=utf-8`.
  - The page no longer requests `./src/main.tsx`.

## 2026-06-14 - Manual Remainder UX Clarification

- Agent: Codex.
- Problem: Manual mode labels made left/right remainders look like arbitrary user choices.
- Root cause: UI did not explain that the selects are for recording the observed remainders after physically splitting and counting the piles.
- Change: added guidance text, relabeled inputs as recorded remainders, filtered right-side remainder options to valid combinations for each change, and updated the action label.
- Validation:
  - TypeScript app check passed.
  - Core algorithm test passed: `dayan tests passed`.
  - Vite production build passed.

## 2026-06-15 - Six-Press Line Casting UX

- Agent: Codex.
- Goal: Remove remainder selection entirely and let the system record each line.
- Change: replaced manual remainder entry with a six-click "逐爻起卦" flow; each click internally completes one line and records it.
- Rationale: users should not choose left/right remainders; the app should handle and record the divination mechanics.
- Build note: Vite is configured to build from `index.dev.html` so the committed Pages root `index.html` does not bypass source compilation.
- Validation:
  - TypeScript app check passed.
  - Core algorithm test passed: `dayan tests passed`.
  - Vite build passed from `index.dev.html`, transforming 32 modules.
  - Root Pages assets refreshed to `index.dev-DU6QyCz0.js` and `index-HRFNiIVI.css`.
