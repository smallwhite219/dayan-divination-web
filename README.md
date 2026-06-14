# 大衍筮法網頁版

React + Vite + TypeScript implementation of a Dayan yarrow-stalk divination workflow.

## Features

- Manual guided recording for all 18 changes.
- Random simulation that follows the split/remainder mechanics.
- Original hexagram, moving lines, changed hexagram, and result card.
- Text/JSON export.
- Copyable AI interpretation prompt without any built-in API key.

## Commands

```powershell
npm install
npm test
npm run build
npm run dev
```

For the current GitHub Pages branch-root setup, `index.html` is a committed production entry that loads `./assets/...`.
After UI changes, run `npm run build`, copy the changed files from `dist/assets/` to root `assets/`, and update `index.html`.
Use `index.dev.html` as the Vite development entry when editing source.

## Notes

- This is a reflection and record-keeping tool, not deterministic prediction.
- The app does not include OpenAI or other AI-provider credentials.
- If deploying under a subpath, keep Vite `base: './'` and verify built asset paths.
