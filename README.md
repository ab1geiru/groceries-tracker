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
};
```

Never put a secret key, service-role key, database password, or Postgres connection string in frontend files.

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
