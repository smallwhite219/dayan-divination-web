# Release Topology

- Local development path: `D:\vibeCode\projects\dayan-divination-web`
- Authoritative git repository: `https://github.com/smallwhite219/dayan-divination-web.git`
- Intended branch: `main`
- Deploy branch: GitHub Pages artifact, managed by `actions/deploy-pages`
- Workflow trigger branch: `main`
- Pages source mode: GitHub Actions
- Build command: `npm run build`
- Build output directory: `dist`
- Deployment command or owner: `.github/workflows/pages.yml`

## Preflight Notes

- This project must be its own nested Git repository; do not push it through the workspace root.
- Workspace root has unrelated dirty files and a global ignore rule, so staging must happen inside this project repo only.
- Vite build currently emits relative asset paths (`./assets/...`) to avoid subpath 404 issues.
- Do not serve the repository root directly as Pages output. Root `index.html` points to `./src/main.tsx` for Vite development and must be compiled before serving.
