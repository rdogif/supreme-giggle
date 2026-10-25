# Rishaan's Internet Hub

A responsive directory of 264 resources across nine categories, built with React, TypeScript, Vite, Tailwind CSS, and EasyUI.

## Run locally

Use Node.js 22.12+ (Node 24 LTS recommended).

```sh
npm ci
npm run dev
```

## Features

- Fuzzy search across names, categories, descriptions, and tags; `/` or Ctrl/Cmd+K focuses search.
- Category, favorites, trending, free, and no-login filters can be combined.
- Popularity, rating, recently added, and alphabetical sorting.
- Favorites and theme persist using the original `rishaanHubFavorites` and `rishaanHubTheme` keys.
- Favorites export as JSON, random discovery from the filtered collection, and Escape to reset.
- Light/dark themes, reduced-motion support, keyboard focus styles, and mobile navigation.

`resources.json` remains the source of truth; all original records are retained. Favorites remain in this browser on the same origin. Moving to another domain does not transfer browser storage.

## EasyUI components

Read the [introduction](https://easyui.site/docs/introduction/) and browse the [component catalog](https://easyui.site/components).

Installed with the official shadcn GitHub registry:

```sh
npx shadcn@latest add Surajmaurya1/easyui/magnetic-button Surajmaurya1/easyui/spotlight-card Surajmaurya1/easyui/animated-tabs --yes
```

Source is in `src/components/ui/`, with shared motion tokens and utilities in `src/lib/`. Local adaptations add selection semantics, reduced-motion handling, and theme-aware styles. See `THIRD_PARTY_NOTICES.md` for the upstream license.

## Verify

```sh
npm test
npm run build
npm audit
```

The browser regression suite requires a running app and installed Google Chrome:

```sh
npm run dev
# In another terminal:
npm run test:browser
```

Set `BROWSER_CHANNEL=msedge` to test with Edge, or `TEST_URL` to test another server (such as the production preview). The suite covers existing storage, filters, search, sorting, export, random discovery, theme persistence, accessibility, mobile navigation, overflow at five widths, and corrupt local storage. Screenshots are saved to `test-results/`.

## Static deployment

```sh
npm run build
npm run preview
```

Deploy the generated **`dist/` directory**, not the unbuilt source `index.html`. The app remains static; it requires no backend, credentials, or database. Relative asset URLs support deployment at a subdirectory.

For GitHub Pages, select **GitHub Actions** under repository Settings → Pages. The included workflow builds and deploys on pushes to `main` or manual dispatch. Deployment occurs only after changes are pushed to the repository.
