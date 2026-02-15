## Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to
Semantic Versioning.

## [1.3.3] - 2026-02-14

- **Alerts corrected:** Expected-transaction-missing alerts now fire only after the last day of the alert window (e.g. day 18 for day-15 ±2). Once the user is warned, the alert is recorded so it is not sent again until the next month.

## [1.2.0] - 2026-02-14

- **New transactions:** Transactions imported (Automatic or PDF) are marked as "New". Transactions list shows a "New" badge with a clear control to mark as reviewed; filter "All" / "New only" added and persisted in user preferences. 
- **Transaction comments:** Optional comment field per transaction. Comment icon in each row (filled when a comment exists).
- **Category filter quick actions:** In the transactions category dropdown, "All" and "No category" buttons to quickly select all categories or only uncategorized.
- **Section persistence:** The active main section (Transações, Contas, Análises) is stored in `localStorage` and restored after page refresh.