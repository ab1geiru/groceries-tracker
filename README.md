# Groceries Tracker — UST Gold Cloud Sync Edition

A responsive grocery expense tracker using Philippine Peso (₱), Supabase authentication/database, and a static HTML/CSS/JavaScript frontend that can be deployed to Vercel.

## What changed

This version stores transactions in Supabase instead of browser `localStorage`. Sign in with the same account on your phone and laptop and both devices will load the same grocery records.

The UI now uses a UST-inspired gold palette based on `#FFAF00`, and each transaction can optionally record the grocery store visited.

## Files

- `index.html` — interface
- `styles.css` — styling
- `app.js` — app logic, authentication, and cloud database CRUD
- `config.js` — your Supabase Project URL and anon/public key
- `supabase.sql` — database table and Row Level Security policies
- `vercel.json` — Vercel static deployment config

## 1. Create a free Supabase project

1. Go to Supabase and create a project.
2. In the project dashboard, open **SQL Editor**.
3. Paste the full contents of `supabase.sql` and run it.

The SQL creates one table named `grocery_transactions` and enables Row Level Security. Each signed-in user can only read, create, update, or delete their own transactions.

## 2. Add your Supabase credentials

Open `config.js` and replace:

```js
SUPABASE_URL: "YOUR_SUPABASE_URL",
SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_KEY",
```

with your project's **Project URL** and **anon/public key** from Supabase project settings/API settings.

The anon/public key is intended for browser apps. Security comes from the RLS policies in `supabase.sql`. Never put the Supabase service-role key in this file.

## 3. Authentication settings

Supabase may require email confirmation for newly created users. If confirmation is enabled, the app will tell the user to confirm the email before signing in.

For production on Vercel, add your Vercel URL to the allowed Site URL / redirect URLs in Supabase Authentication URL settings.

## 4. Run locally

Open the folder in VS Code and run `index.html` with Live Server.

Because Supabase is an HTTPS cloud service, an internet connection is required for login and database syncing.

## 5. Deploy to Vercel

Push this folder to GitHub, import the repository in Vercel, and deploy it as a static site. There is no build command and no Python/Node server is required.

## Cross-device behavior

1. Create/sign in to an account on the laptop.
2. Add a grocery transaction.
3. Open the deployed tracker on your phone.
4. Sign in with the same email/password.
5. The same transaction appears there because both devices read the same Supabase database records.

## Important

The previous browser-only `localStorage` records are not automatically deleted. This cloud version treats Supabase as the source of truth after sign-in.


## Grocery store field

When creating or editing a transaction, you can enter the store name (for example, `SM Supermarket`, `Puregold`, or `Robinsons Supermarket`). The field is optional so older records remain valid. Store names are also searchable from Transaction History.
