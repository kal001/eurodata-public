## Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to
Semantic Versioning.

## [1.2.0] - 2026-02-14

- **New transactions:** Transactions imported (Nordigen or PDF) are marked as "New". Transactions list shows a "New" badge with a clear control to mark as reviewed; filter "All" / "New only" added and persisted in user preferences. Backend: `bank_transactions.is_new` and migration 0025; `GET /api/transactions` supports `new_only`; `PATCH /api/transactions/{id}` accepts `is_new`.
- **Transaction comments:** Optional comment field per transaction. Comment icon in each row (filled when a comment exists); modal to add or edit comment (icon buttons with tooltips, ESC to close). Backend: `bank_transactions.comment`; list and PATCH include `comment`; `has_alert` in response when the transaction is the source of an expected-transaction alert.
- **Category filter quick actions:** In the transactions category dropdown, "All" and "No category" buttons to quickly select all categories or only uncategorized.
- **Section persistence:** The active main section (Transações, Contas, Análises) is stored in `localStorage` and restored after page refresh.

## [0.8.0] - 2026-02-08
- **Re-authenticate banks** Added code to handle when 90 days of authorizations have come to an end.

## [0.7.2] - 2026-02-08

- **Transações filters:** Tag filter added (dropdown like Análises with “Include untagged” and per-tag checkboxes). Category filter replaced with multi-select dropdown (categories + “Include uncategorized”) instead of All/With category/Without category; same dropdown UX as Análises.
- **Transações preferences persisted per user:** Account selection (enabled/disabled on cards), selected categories, selected tags, “Include uncategorized”, and “Include untagged” are saved in the backend and restored on load. New DB column `users.transactions_filter_preferences` (JSON, nullable); PATCH `/api/me` and GET `/api/transactions` support the new params (`categories`, `include_uncategorized`, `tags`, `include_untagged`).
- **Fix:** When changing category/tag filters, checkbox and list no longer blink or refresh repeatedly (skip re-apply when profile update came from our own persist; persist effect no longer depends on `profile`).
- **Tags filter behaviour:** Unchecking “Sem etiqueta” with “All” tags now excludes untagged transactions (sends all tag IDs with `include_untagged=false`). When “Sem etiqueta” is unchecked and all tags are unchecked, the list correctly shows no transactions (backend returns empty when `tags=` and `include_untagged=false`).

## [0.5.3] - 2026-02-07

- **Weekly insights PDF email:** Celery Beat task runs every Sunday at 08:00 UTC; sends each user with a primary email an Análises (Insights) report. Uses the user’s default saved Análises configuration (period, accounts, categories, tags); if none, uses current month and all accounts/categories/tags. Collapsed cards in the saved config show only the card title in the report.
- **Email content:** HTML body mirrors the Análises screen (same six cards, same data, same collapse); PDF attachment with full report. SMTP configured via `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_USE_TLS` in env.
- **PDF report:** Header with logo and app name (“Bancos”), footer with report date and page number. Logo is read from `backend/app/assets/logo.png` (copy from `frontend/public/logo.png` if needed; see docs).
- **Make targets:** `make prod-assign-categories` runs category assignment on production via SSH; `make deploy-prod-remote` uses `.env.prod` (no `.env` on server). Production can use `extra_hosts` in `docker-compose.prod.yml` for local mail server hostname resolution.
- **Docs:** B007 updated with weekly insights task; B008 and docs mention backend logo asset for PDF header.

## [0.5.2] - 2026-02-07

- **Async transaction fetch:** POST `/api/banks/connections/{id}/transactions/fetch` returns 202; frontend polls `/transactions/status` and no longer blocks the UI (separate loading state, fetch/add disabled while in progress). First-time import per account skips threshold Telegram alerts to avoid flooding.
- **Telegram alerts:** Transaction alerts include booking date and category when available; test-alerts script (`make test-alerts`) aggregates matches into a single message per user, split by Telegram message size limit when needed.
- **Transactions list:** When all account filters are unchecked, the list shows empty instead of all transactions.
- **Balance refresh:** Prefer multiple GoCardless balance types (closingBooked, current, expected, etc.); mark balance unavailable when the API returns none; log to Audit and return HTTP 429 when GoCardless returns 429.
- **GoCardless rate limits:** All GoCardless requests (list banks, requisition, refresh balances, transaction fetch sync/async) log 429 to Audit (`gocardless_rate_limit`). Removed app-side 5-per-day fetch limit; only the provider limit applies. Frontend shows a single message (“Daily rate limit exceeded with bank provider. Try again later.”) for 429 or async `rate_limited` status on fetch, refresh balances, link bank, and reconnect.
- **Fix:** Define `showToast` before `refreshBalances` in App to fix “Cannot access 'showToast' before initialization” on load.

## [0.5.1] - 2026-02-07

- Frontend: design refresh and production-oriented UI updates; onboarding and app entry (App/main) adjustments.
- Deployment: B008 Debian production doc and production environment configuration updates.

## [0.4.0] - 2026-02-04

- Env: Telegram bot token and Claude/Anthropic API key and model in `.env.example` and `.env.prod.example`; docker-compose env for LLM.
- Nginx: add default.conf for app container.
- Cleanup: remove unused files.

## [0.3.0] - 2026-02-03

- Telegram: user chat ID in profile, link/unlink/test endpoints, transaction alerts when amount crosses account thresholds.
- Transactions: `include_in_totals` flag and UI checkbox; account alert thresholds (`alert_above_amount`, `alert_below_amount`) with edit UI.
- Account coloring in dashboard and transaction lists (deterministic palette).
- Frontend: distinct message for 5xx on `/api/me` (e.g. "Serviço temporariamente indisponível") instead of "Acesso negado".
- Deployment: B008 troubleshooting updated for 502 / backend unreachable; README links to B008 deployment and Telegram docs.

## [0.2.0] - 2026-02-02

- Bank connections and accounts (Nordigen/GoCardless), transaction sync, Celery scheduled fetch.
- Auth0 Post Login Action for user allowlist; admin user management.

## [0.1.0] - 2026-02-01

- Phase 1 scaffolding: frontend, backend, and Docker infrastructure.
- Added setup and architecture documentation.
