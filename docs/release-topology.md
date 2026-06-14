# Release Topology

- Local development path: `D:\vibeCode\projects\dayan-divination-web`
- Authoritative git repository: `https://github.com/smallwhite219/dayan-divination-web.git`
- Intended branch: `main`
- Deploy branch: not configured
- Workflow trigger branch: not configured
- Pages source mode: not configured
- Build command: `npm run build`
- Build output directory: `dist`
- Deployment command or owner: user-managed GitHub repository push

## Preflight Notes

- This project must be its own nested Git repository; do not push it through the workspace root.
- Workspace root has unrelated dirty files and a global ignore rule, so staging must happen inside this project repo only.
- Vite build currently emits relative asset paths (`./assets/...`) to avoid subpath 404 issues.
