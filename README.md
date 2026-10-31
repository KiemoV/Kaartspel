# Kaartscore

Mobile-first PWA to keep score during card games with friends (Toepen, Hartenjagen / Hearts, Eenendertigen / Thirty-one). Dutch and English UI. No accounts or storage — everything lives in memory for the current game.

## Start

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Test

```bash
npm test
```

## Privacy

- In-app: start screen → Privacy
- Stable store link: [`/privacy.html`](./public/privacy.html) (NL + EN)

## Live

- **GitHub Pages:** https://kiemov.github.io/Kaartspel/
- **Privacy:** https://kiemov.github.io/Kaartspel/privacy.html

## Deploy (Vercel)

Import [github.com/KiemoV/Kaartspel](https://github.com/KiemoV/Kaartspel) in the Vercel dashboard (framework: Vite, output: `dist`), or:

```bash
npm i -g vercel
vercel link
vercel --prod
```

Note: for Vercel root hosting, build without `BASE_PATH` (default `/`). GitHub Pages builds with `BASE_PATH=/Kaartspel/`.

## Notes

- Installable offline via `vite-plugin-pwa`.
- Leaving or reloading during a game shows a browser warning.
- Theme follows system preference; toggle on the home screen. Language follows the device and can be switched anytime.
