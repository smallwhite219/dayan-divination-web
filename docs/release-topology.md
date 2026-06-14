# Release Topology

- Local development path: `D:\vibeCode\projects\dayan-divination-web`
- Authoritative git repository: `https://github.com/smallwhite219/dayan-divination-web.git`
- Intended branch: `main`
- Deploy branch: GitHub Pages artifact, managed by `actions/deploy-pages`
- Workflow trigger branch: `main`
- Pages source mode: Deploy from branch, `main` / root
- Build command: `npm run build`
- Build output directory: `dist`
- Deployment command or owner: push compiled root `index.html` + `assets/`

## Preflight Notes

- This project must be its own nested Git repository; do not push it through the workspace root.
- Workspace root has unrelated dirty files and a global ignore rule, so staging must happen inside this project repo only.
- Vite build currently emits relative asset paths (`./assets/...`) to avoid subpath 404 issues.
- Repository root is currently served directly by GitHub Pages. Root `index.html` must load compiled `./assets/...`, not `./src/main.tsx`.
