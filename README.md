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

## Deploy (Vercel)

```bash
npm i -g vercel
vercel link
vercel --prod
```

Or import [github.com/KiemoV/Kaartspel](https://github.com/KiemoV/Kaartspel) in the Vercel dashboard (framework: Vite, output: `dist`).

## Notes

- Installable offline via `vite-plugin-pwa`.
- Leaving or reloading during a game shows a browser warning.
- Theme follows system preference; toggle on the home screen. Language follows the device and can be switched anytime.
