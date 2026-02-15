## Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to
Semantic Versioning.

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