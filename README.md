# Embun (Web)

Embun is a personal finance app for Malaysia. This repository is the **browser version**. The Android version lives in a separate repository, [Embun-apk](https://github.com/IzTiger321/Embun-apk), and loads this web app.

Both versions are one product: they share the same features, data and backend. This repo holds the web code and its releases; project documentation is kept in Notion.

## Live app

- Production: https://iztiger-embun.vercel.app
- Other alias (same project): https://embun-theta.vercel.app

## Features

- Accounts, cards and e-wallets grouped by institution, with colour cards
- Transactions, budget pots, subscriptions and bill settlement
- Contacts with bank account, DuitNow ID and DuitNow QR image
- Analytics by day, week, month and year
- CSV import and export, encrypted backup download
- Device list with remote sign-out
- Privacy mode (choose what the eye button hides), Privacy Policy and Terms of Service

## Stack

- React 18, Vite 5, TypeScript, Tailwind CSS 3
- Supabase (authentication, Postgres with Row Level Security, Realtime)
- Recharts for charts, @noble/ciphers for encryption of selected fields

## Project layout

```
index.html              App entry page (Content Security Policy, icons)
public/embun.svg        Logo (also embun.png)
src/main.tsx            React entry point
src/App.tsx             All screens, forms, charts, auth, vault and legal pages
src/lib.ts              Supabase client, encryption helpers, CSV and device helpers
src/index.css           Tailwind base and global styles
src/vite-env.d.ts       Vite type definitions
package.json            Dependencies and scripts
vite.config.ts          Vite configuration
tailwind.config.js      Tailwind configuration
postcss.config.js       PostCSS configuration
tsconfig.json           TypeScript configuration
```

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the address shown in the terminal (usually http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

The build output goes to `dist/`.

## Deploy

The Vercel project **embun** is connected to this repository. Each push to `main` starts a deployment. Check that it shows **Ready**, then promote it to Production if it isn't already.

Vercel settings: framework preset Vite, build command `vite build`, output directory `dist`, Node.js 22.

## Backend configuration (owner)

- Supabase Authentication > URL Configuration: Site URL set to `https://iztiger-embun.vercel.app`, and the same URL in Redirect URLs.
- Supabase Authentication > Email Templates > Magic Link: include `{{ .Token }}` so the vault passphrase change email contains a code.

The Supabase anon key in `src/lib.ts` is public by design. Access is controlled by Row Level Security, not by hiding the key. Never add a service-role key to this repository.

## Security notes

- Sign-in session is kept in the browser and ends after 30 minutes without activity or on sign-out.
- The vault passphrase unlocks encrypted fields on the device. Embun cannot recover a forgotten passphrase.
- Only selected sensitive fields are encrypted. Other fields (for example institution names and dates) are plain text.

## Documentation and records

Project memory, architecture, decisions, change log, issues and release records are kept in Notion under "[EBN] Embun (Project)". Web-specific logs and the current web build are in "[EBN] Web App — Current Build". Records for both versions use the same product name; the Platform column separates Web from APK.

## Privacy and terms

The Privacy Policy and Terms of Service are in the app (Settings, or the link on the sign-in page). They are written for Malaysian users under the Personal Data Protection Act 2010, with CCPA and CPRA principles for California residents.
