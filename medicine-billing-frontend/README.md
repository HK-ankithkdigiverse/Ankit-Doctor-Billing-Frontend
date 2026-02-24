# Medicine Billing Frontend

React + TypeScript + Vite frontend for the Doctor Billing app.

## API Configuration

The app uses this backend by default:

- `https://ankit-doctor-billing-backend.vercel.app`

You can override it with:

- `VITE_API_URL`

Example:

```bash
cp .env.example .env
```

## Run Locally

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

## Deploy on Vercel

1. Import `medicine-billing-frontend` as a Vercel project.
2. Framework preset: `Vite`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Add env var (optional): `VITE_API_URL=https://ankit-doctor-billing-backend.vercel.app`.

`vercel.json` is included with SPA rewrites so direct route refresh works.
