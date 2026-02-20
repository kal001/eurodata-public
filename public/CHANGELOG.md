## Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to
Semantic Versioning.

## [2.0.0] - 2026-02-17

- **Stripe subscription integration:** Paid subscriptions via Stripe Checkout and Billing Portal. Users can subscribe, manage payment method, and cancel (at period end or immediately). Subscription status and cancel-at-period-end are synced from Stripe and shown in Profile (Subscrição). Refresh button to reload status after using the portal.
- **Subscription lifecycle notifications (Telegram):** Users with Telegram linked and alerts enabled receive messages for subscription activated, reactivated, cancel scheduled, and subscription ended. Admins receive notifications for new subscriptions, reactivations, and cancellations (with user email and cancellation motive). Follow-up message when the user provides cancellation feedback (e.g. “É muito caro”) or comment in the Stripe portal.
- **Cancel-at-period-end handling:** UI shows “Subscrição cancelada — Período atual termina em [date]” when the user has scheduled cancellation. Backend uses Stripe webhook and API (including `cancel_at` fallback) so cancellation state stays in sync with the Stripe dashboard.

## [1.8.0] - 2026-02-16

- **Vast.ai for PDF extraction:** PDF statement extraction can use a rented Vast.ai GPU instance instead of in-server Ollama or Llama Cloud. Set `EXTRACT_PROVIDER=vast_ai` and configure `VAST_AI_API_KEY` and `VAST_AI_INSTANCE_ID`; the app starts the instance when a user imports a PDF and stops it after the last job (with configurable delay). Optional: `VAST_AI_OLLAMA_URL`, `VAST_AI_START_WAIT_SEC`, `VAST_AI_OLLAMA_READY_WAIT_SEC`, `VAST_AI_STOP_DELAY_SEC`. See docs/development/B014 for local vs production setup.

## [1.7.0] - 2026-02-16

- **Ollama for categorization:** Transaction category suggestion can use local Ollama (e.g. qwen2.5:7b) instead of Claude. Set `LLM_PROVIDER=ollama` and configure `OLLAMA_HOST` and `OLLAMA_MODEL`; Claude remains available when `LLM_PROVIDER=claude`.
- **Ollama for bank statement parsing:** PDF statement extraction (manual import) can use local Ollama instead of Llama Cloud. Set `EXTRACT_PROVIDER=ollama` with `OLLAMA_HOST` and `OLLAMA_MODEL`; Llama Cloud remains available when `EXTRACT_PROVIDER=llama_cloud`. Ollama path uses pypdf for PDF-to-text and the same JSON schema as the Llama agent.

## [1.6.0] - 2026-02-15

- **Recurring transactions:** Calendar view: month grid of expected transactions with navigation, summary (count and total), and account filter. Alternative “upcoming” list; dates and amounts respect the user’s locale and UI language.

## [1.5.0] - 2026-02-15

- **Recurring transactions:** New feature to manage recurring payments: create patterns from a transaction, edit or delete them, see next expected date. Replaces the previous “expected transaction alerts” with a richer model (frequencies, tolerances, occurrences). Alerts when a recurring payment occurs or when one is missing (Telegram/Slack unchanged). Migration from existing alert templates to recurring transactions is automatic.

## [1.4.0] - 2026-02-15

- **Data encryption:** Sensitive transaction fields (amount, description, etc.) are encrypted at rest.
- **Local or cloud data storage:** Users can choose in Profile between cloud sync (default; automatic transaction fetch and alerts) or local-only (no automatic sync or periodic alerts; manual refresh only). Landing page highlights this choice.

## [1.3.3] - 2026-02-14

- **Alerts corrected:** Expected-transaction-missing alerts now fire only after the last day of the alert window (e.g. day 18 for day-15 ±2). Once the user is warned, the alert is recorded so it is not sent again until the next month.

## [1.2.0] - 2026-02-14

- **New transactions:** Transactions imported (Automatic or PDF) are marked as "New". Transactions list shows a "New" badge with a clear control to mark as reviewed; filter "All" / "New only" added and persisted in user preferences. 
- **Transaction comments:** Optional comment field per transaction. Comment icon in each row (filled when a comment exists).
- **Category filter quick actions:** In the transactions category dropdown, "All" and "No category" buttons to quickly select all categories or only uncategorized.
- **Section persistence:** The active main section (Transações, Contas, Análises) is stored in `localStorage` and restored after page refresh.