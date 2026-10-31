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

## Notes

- Installable offline via `vite-plugin-pwa`.
- Leaving or reloading during a game shows a browser warning.
- Theme follows system preference; toggle on the home screen. Language follows the device and can be switched anytime.
