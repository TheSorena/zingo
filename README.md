# زینگو | Zingo

**Zingo** is a modern Persian movie & series streaming application built with **Next.js**, **TypeScript**, and **TailwindCSS**.

> Watch and download foreign movies and series **for free**, with **Persian subtitles**, **Persian dubbing**, and **no censorship**.

## Features

- Home Page
- Movie Detail Page
- Series Detail Page
- Search Page
- Live TV & Satellite Channels Page
- Settings Page
- Favorites Page
- Help/Guide Page
- ... and more

## Tech Stack

- Next.js (App Router)
- TypeScript
- TailwindCSS
- Fully responsive UI (mobile, tablet, desktop)
- Persian RTL support with custom fonts

## Getting Started

```bash
git clone <your-repo-url>
cd <repo-folder>
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Your public site URL (used for metadata & SEO) |
| `API_BASE_URL` | External API base URL (default: `https://hostinnegar.com`) |
| `NEXT_PUBLIC_APP_VERSION` | App version shown in settings |

## Deploy on Vercel

1. Push this repo to your GitHub account.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
3. In **Environment Variables**, add:
   - `API_BASE_URL` = `https://hostinnegar.com`
   - `NEXT_PUBLIC_APP_URL` = your deployed URL (e.g. `https://zingo.vercel.app`)
4. Deploy. No other config needed.

## License

MIT License