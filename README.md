# Textal — Vue port

This repository contains a Vue 3 + Vite port of the original Textal single-file HTML app.

Quick start:

1. Install dependencies

```bash
npm install
```

2. Run dev server

```bash
npm run dev
```

Open http://localhost:5173 and try the app.

Deploy to GitHub Pages
----------------------

This project is configured to deploy to GitHub Pages under the `textal` repository name. To publish:

1. Make sure your repository is named `textal` (or update the `base` in `vite.config.mjs` to match).
2. Commit and push your code to GitHub.
3. Run:

```bash
npm run deploy
```

This will run `vite build` and publish the `dist` folder to the `gh-pages` branch using the `gh-pages` package.

If your repo name differs, set the `base` option in `vite.config.mjs` to `'/your-repo-name/'` before building.
