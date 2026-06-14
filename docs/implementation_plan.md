# 大衍筮法網頁版 Implementation Plan

## Summary

Build an independent React + Vite + TypeScript app for guided and simulated Dayan yarrow-stalk casting. The app records the question, 18 changes, original hexagram, moving lines, changed hexagram, export text/JSON, and an AI-search prompt.

## Key Decisions

- Project path: `D:\vibeCode\projects\dayan-divination-web`.
- No built-in OpenAI/API integration in v1.
- Manual mode records left and right remainders for each change; the app computes the removed count.
- Random mode simulates actual split/remainder mechanics instead of sampling final line values directly.
- No 64-hexagram text database in v1.

## Verification

- `npm test`
- `npm run build`
- Browser smoke test for manual mode, random mode, export, and responsive result card.
