# Groceries Tracker — Grocery Lists + Shopping Mode

A responsive Philippine Peso (₱) grocery planner and expense tracker built with plain HTML, CSS, JavaScript, Supabase, and Vercel.

## What this version adds

The app now supports the complete grocery workflow:

1. **Plan** — create a grocery list before going to the store.
2. **Shop** — open Shopping Mode, check items as they go into the cart, change quantities, and enter actual prices.
3. **Finish** — convert the purchased items into a normal grocery transaction automatically.
4. **Track** — the completed purchase appears in Transaction History and updates the monthly/yearly dashboard metrics.

Grocery lists and transactions both sync through Supabase, so the same account can use them on a laptop, phone, or other device.

## Grocery list features

- List name
- Optional planned date
- Optional grocery store
- Optional budget
- Grocery item name
- Quantity
- Optional estimated price per unit
- Optional notes such as brand, size, or alternatives
- Planned / Shopping / Completed statuses
- Search and status filtering
- Duplicate and delete lists
- Estimated total and current cart total
- Budget remaining / over-budget feedback

## Shopping Mode

Shopping Mode is designed for use while walking around the store.

For each item you can:

- check it when it enters the cart
- change the quantity
- enter the actual price per unit
- see the live item subtotal
- see shopping progress
- see the live cart total
- compare the cart total with the planned budget
- save progress and continue later on another device

**Finish shopping** creates a row in `grocery_transactions` from the checked items and marks the grocery list as completed.

## Files

- `index.html` — main interface
- `styles.css` — UST-gold responsive styling
- `app.js` — authentication, transactions, grocery lists, Shopping Mode, and Supabase CRUD
- `config.js` — Supabase Project URL and publishable key
- `supabase.sql` — database tables, indexes, and Row Level Security policies
- `preview.html` — copy of the current interface for previewing
- `vercel.json` — static Vercel configuration

## Supabase update required

If your existing `grocery_transactions` table is already working, **do not delete it**.

Open:

**Supabase → SQL Editor**

Then run the full updated `supabase.sql`.

The script uses `CREATE TABLE IF NOT EXISTS`, so your existing transaction table and transaction data are left in place. It creates the new `grocery_lists` table, enables Row Level Security, and adds policies so each signed-in user can only access their own lists.

After running the SQL, refresh the app.

The new table contains:

- `id`
- `user_id`
- `list_name`
- `planned_date`
- `shopping_date`
- `store_name`
- `budget`
- `status`
- `items`
- `transaction_id`
- `created_at`
- `updated_at`
- `completed_at`

## Supabase credentials

`config.js` should contain only your browser-safe Project URL and publishable key:

```js
window.GROCERIES_TRACKER_CONFIG = {
  SUPABASE_URL: "https://YOUR-PROJECT.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_...",
  HCAPTCHA_SITE_KEY: "YOUR_HCAPTCHA_SITE_KEY",
};
```

Never put a secret key, service-role key, database password, or Postgres connection string in frontend files.


## Authentication security

This version adds four authentication protections on top of Supabase Auth:

- **24-hour inactivity sign-out** — activity is tracked per browser/device in `localStorage`. If the signed-in browser has no activity for 24 hours, the app signs out that local session. The app also checks the stored timestamp when it is reopened.
- **Progressive failed-login cooldown** — invalid credential attempts on the same browser trigger an increasing client-side cooldown: the 3rd failure waits 30 seconds, then 1 minute, 5 minutes, 15 minutes, 30 minutes, and finally 1 hour for later failures. The counter resets after a successful sign-in or after 24 hours without another recorded failure. This is an extra browser-side layer; keep Supabase Auth rate limits enabled because a determined attacker can bypass frontend-only controls.
- **Password policy matching Supabase** — new accounts must use at least 8 characters and include lowercase, uppercase, a number, and a symbol. Existing users are not blocked from signing in solely because an older password does not match the newer signup policy.
- **hCaptcha** — sign-in and sign-up both require an hCaptcha token, which is passed to Supabase Auth as `captchaToken`.

### Configure hCaptcha

1. Create an hCaptcha site for the production hostname, for example `groceries-tracker-miks-n-clar.vercel.app`.
2. In **Supabase → Authentication → Attack Protection**, enable CAPTCHA protection, choose **hCaptcha**, and paste the hCaptcha **Secret** there.
3. In `config.js`, replace:

```js
HCAPTCHA_SITE_KEY: "YOUR_HCAPTCHA_SITE_KEY",
```

with the public hCaptcha **Sitekey**.

The hCaptcha Secret must never be placed in `config.js`, `app.js`, GitHub, or any other frontend file.

### Supabase Email provider settings

The frontend signup validator is designed to match these Supabase Email provider settings:

- Minimum password length: **8**
- Password requirements: **lowercase + uppercase + digits + symbols**

Keep the same rules enabled in Supabase so the server remains the source of truth for password enforcement.

## Run locally

Open the folder in VS Code and run `index.html` using Live Server.

An internet connection is required for Supabase authentication and sync.

## Deploy updates

Because the Vercel project is already connected to GitHub:

1. Replace/update the project files in VS Code.
2. In GitHub Desktop, review the changes.
3. Commit them, for example: `Add grocery lists and shopping mode`.
4. Click **Push origin**.
5. Vercel automatically deploys the new commit.

## Cross-device example

1. Create a list on your laptop.
2. Open the deployed site on your phone and sign in with the same account.
3. Open the list in Shopping Mode.
4. Check items and enter actual prices in the store.
5. Save progress at any time.
6. Tap **Finish shopping**.
7. The purchase is saved to Transaction History and included in expense metrics.

## Authentication security update

This build adds:

- 24-hour inactivity sign-out per browser/device
- progressive browser-side cooldown after repeated invalid sign-in attempts
- Supabase-matching sign-up password rules: at least 8 characters with lowercase, uppercase, a number, and a symbol
- hCaptcha for sign-in and sign-up
- HTTPS-only production behavior (localhost and 127.0.0.1 remain available for development)
- an email-confirmation dialog after account creation
- an explicit absolute HTTPS redirect for Supabase confirmation emails
- friendly handling for expired/invalid email confirmation links

### Required Supabase URL Configuration

In **Supabase → Authentication → URL Configuration**, use the full URL including `https://`:

```text
Site URL
https://groceries-tracker-miks-n-clar.vercel.app

Redirect URLs
https://groceries-tracker-miks-n-clar.vercel.app/**
```

Do **not** enter only `groceries-tracker-miks-n-clar.vercel.app` without the `https://` scheme. A scheme-less Site URL can be interpreted as a relative path and may redirect confirmation links to your Supabase project domain instead of your Vercel app.

`config.js` also contains `APP_URL` with the canonical production address. Keep it updated if the production domain changes.

### HTTPS

Vercel serves the app over HTTPS. This build also upgrades non-local HTTP visits to HTTPS in the browser and sends an HSTS header from `vercel.json`. HSTS is intentionally not used for localhost development.
