---
name: dayan-divination-web
desc: Local governance for the Dayan divination web app
---

# Local Project Rules

- Tech stack: React + Vite + TypeScript.
- Build command: `npm run build`.
- Test command: `npm test`.
- Task state: `docs/task-state.md`.
- Phase log: `docs/phase-log.md`.
- Implementation plan: `docs/implementation_plan.md`.
- Release topology: `docs/release-topology.md`.
- The app is a reflection and record-keeping tool, not a deterministic prediction or medical/legal/financial advisor.
- Do not add API keys or direct AI provider calls without a new security review.
- If publishing to GitHub Pages, run release topology preflight first and verify Vite `base`, `index.html` script path, and `dist` asset paths.
