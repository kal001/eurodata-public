## Getting Started

### How to begin

After creating an account and signing in, the first thing to do is add a bank account. Go to the **Accounts** menu and choose between connecting a bank directly (automatic account) or importing a statement from PDF, Excel or CSV (manual account).

The automatic connection is made through certified banking data providers (GoCardless and Enable Banking). Your banking credentials never pass through Eurodata's servers — authentication takes place directly on the bank's website.

### Main navigation

The top navigation bar gives access to the four main sections:

| Icon | Section | Description |
|------|---------|-------------|
| 🧾 | **Transactions** | List, filter, categorise and manage your transactions |
| 🏦 | **Accounts** | Connect banks, import statements, manage accounts |
| 📈 | **Insights** | Charts for income, expenses and trends |
| 🔄 | **Recurring** | Manage periodic payments and income |

### Language and theme

In the top-right corner you can:

- **Change language** by clicking the globe icon — 8 languages available: English, Portuguese, Spanish, French, German, Italian, Dutch, Polish.
- **Switch between light and dark theme** by clicking the moon/sun icon.

---

## Transactions

This is the main section of the application. It shows all your imported transactions, with tools to filter, categorise and organise.

### Account cards (top of page)

At the top, each configured bank account appears as a card. Each card shows:

- **Bank logo** (or generic bank icon)
- **Account type:** document icon = manual account (imported by file); link icon = automatic account (connected to the bank)
- **Account name** with its colour
- **Institution name** and data provider
- **Current balance** and last update date (if "Show balances" is enabled in your profile)

**Checkbox on each card:** checking or unchecking a card filters the transactions shown in the list. By default, all accounts are selected.

### Action buttons (top right)

| Icon | Action |
|------|--------|
| ❓ | Opens contextual help for this section |
| 🔄 | **Refresh transactions** — triggers import of new transactions for all automatic accounts. Disabled when rate limit is reached |
| ⚖️ | **Refresh balances** — updates the balance of all accounts (only shown if "Show balances" is on) |

### List toolbar

| Element | Description |
|---------|-------------|
| **Select all** (checkbox) | Enables multi-select mode; the "Delete selected" button appears |
| 🗑️ **Delete selected** | Deletes all selected transactions (only visible when there are selections) |
| **Search** | Filters the list by transaction description or account name |
| **Rows per page** | Choose 10, 20 or 50 transactions per page |
| **All / New only** | Toggle between showing all transactions or only those marked as new (not yet reviewed) |
| **Categories** | Filter by one or more categories; includes "No category". Use "All" / "None" for quick selection |
| **Tags** | Filter by tags; includes "No tag" option |
| 📄 **Export CSV** | Exports transactions to a CSV file (Excel-compatible). Lets you choose accounts, categories and tags to include. Also available in JSON and OFX format |

### Per-transaction row elements

Each row in the list contains:

| Element | Description |
|---------|-------------|
| **Checkbox** (left) | Selects the transaction for bulk actions (appears when "Select all" is on) |
| **Include in Insights** (checkbox) | When checked, this transaction is counted in Insights charts and totals. Uncheck to exclude one-off or incorrect transactions from statistics |
| **Description** | Transaction text as from the bank. Below it shows the account name with its colour |
| **"New" label** | Appears on recently imported transactions. Click **×** to mark as reviewed and remove the label |
| **"Pending"** | Indicates the transaction has not yet been fully processed by the bank |
| **Category** (dropdown) | Category assigned by AI. Click to change — the system learns from your corrections over time |
| 🔔 **Recurring** (bell icon) | Set up a recurring payment from this transaction. Lets you define alerts for when it occurs or when it is missed |
| 💬 **Comment** (speech icon) | Add or edit a personal note for this transaction. The icon is filled when a comment exists |
| 🗑️ **Delete** (trash icon, red) | Permanently removes this transaction. Asks for confirmation |
| **Tags** | Tags assigned to the transaction, shown as coloured badges. Click to open the tag selection panel |
| **Amount** | Transaction value (right). Positive = received; negative = paid |
| **Posting date** | Date the transaction appears on the statement |
| **Booking date** | Original operation date (may differ from posting date) |
| ▲▼ **Date arrows** | Adjust posting date by ±1 day. Useful to correct dates reported incorrectly by the bank |

### Pagination

Below the list you have pagination controls: "Showing X to Y of Z", and previous/next arrows.

---

## Accounts

The **Accounts** section lets you manage all your bank accounts — connect new banks, import statements manually or manage existing accounts.

### Existing accounts

Each account appears on a card with:

- **Bank logo** (clickable on manual accounts to update the image)
- **Type:** document icon (manual) or link icon (automatic)
- **Friendly name** editable in the field — click 💾 to save
- **Institution name** and provider
- **Balance** (if enabled in profile)

**Action buttons per account:**

| Icon | Action |
|------|--------|
| 🔔 **Alerts** | View and edit account alerts (e.g. balance below X€) |
| 🔌 **Reconnect** | Re-authenticate the bank connection when it has expired (usually every 90 days). Icon turns red/warning when authentication is needed |
| 🔄 **Fetch transactions** | Manually fetches new transactions for this account (automatic accounts) or opens the import wizard (manual accounts) |
| 🗑️ **Delete** (red) | Removes the account and all its transactions. This cannot be undone |

### Connecting a new bank

To connect a bank automatically:

1. Select **country** in the dropdown
2. Search for the bank by name in the search box
3. Click the bank — you will be redirected to the bank's site to authorise access
4. After authorisation, the account appears in the list and transactions are imported

The connection is valid for about 90 days; when it expires, the account's link icon will show a warning and you should click **Reconnect** to renew.

### Import statement (manual accounts)

Click **Import statement** (import icon, top right) or **Fetch transactions** on a manual account to open the import wizard:

1. **File upload** — drag or select a PDF, Excel (.xlsx) or CSV file
2. **Analyse** — AI analyses the file and extracts transactions automatically
3. **Review** — see the detected transactions and optionally flip signs (useful when debits and credits are swapped)
4. **Assign** — select the existing account to import into, or create a new account

---

## Insights

The **Insights** section shows charts and tables of your income, expenses and trends for the selected period.

### Filter panel

At the top of the page you have the filters:

| Filter | Description |
|--------|-------------|
| **Period** | Current month, Last month, Year to date, Last 12 months, or Custom (with start and end dates) |
| **Accounts** | Select one or more accounts to include in the analysis |
| **Tags** | Filter by projects or tags you want to analyse; includes "No tag" option |
| **Categories** | Select categories to include; use "All" / "None" for quick selection |

**Saved configurations:**

You can save filter sets for reuse:

| Icon | Action |
|------|--------|
| 📂 **Load config** | Load a previously saved configuration |
| 💾 **Save config** | Save the current configuration with a name of your choice. Can set as default |
| ⭐ **Set as default** | Sets the currently applied configuration as default (opens automatically on next visit) |

### Export PDF

The 📄 **Export PDF** button (top right) prints or saves the Insights page as PDF — useful for monthly reports.

### Insight cards

All cards can be expanded or collapsed by clicking the title or the ▲▼ arrow. Data always reflects the applied filters.

#### Received

Table of all income transactions in the period: date, description, account, amount (green). Hovering over a row shows a full summary with category, tags and comment. Shows total per currency in the footer.

#### Paid

Same as Received but for expenses, with amounts in red.

#### By Category

Horizontal bar chart with total per category. Green bars for income, red for expenses. In **Current month** mode, a dashed bar shows the estimated value to end of month based on history.

#### Totals

Three boxes side by side:
- **Total Received** (green)
- **Total Paid** (red)
- **Difference** (green if positive, red if negative)

#### Balance Accumulated

Line chart of balance over the period. In **Current month** mode, a dashed line projects estimated balance to end of month.

#### Monthly Comparison

Table with one row per month: Month | Received | Paid | Difference, with a totals row in the footer. In **Current month** mode, an italic row shows the estimate for the current month, with CSV export button.

---

## Recurring

The **Recurring** section helps you track periodic payments and income: rent, subscriptions, salary, insurance, etc.

### Automatic suggestion detection

The 🔍 **Run suggestions** button (top right) analyses the last 6 months of transactions and detects recurring patterns with at least 60% confidence. Detected suggestions are available for review.

On first use, the app may offer to run the analysis automatically.

### List view

The list view shows all configured recurring items.

**Filters:**

| Filter | Description |
|--------|-------------|
| **Account** | Filter by bank account |
| **Status** | All / Active / Paused / Suggested |
| **Sort by** | Next date, Name, Frequency, Amount, Confidence |
| **Search** | Filter by recurring item name |

**+ Create manual recurring** button — opens the creation form (see below).

#### Suggestions panel

When there are suggestions to review, a panel is shown to evaluate them one by one:

| Button | Action |
|--------|--------|
| ✅ **Confirm** | Accepts the suggestion and adds the recurring item |
| ✏️ **Edit and confirm** | Opens the edit form before confirming |
| ⏭️ **Skip** | Move to the next suggestion (without confirming or dismissing) |
| ✖️ **Dismiss** | Rejects the suggestion |

#### Recurring table

Columns: **Name** | **Frequency** | **Next date** | **Amount** | **Status** | **Account** | **Actions**

**Status icons:**

| Icon | Status |
|------|--------|
| ✅ (green) | **Active** — being tracked |
| ⏸️ (grey) | **Paused** — temporarily suspended |
| 🕐 (amber) | **Suggested** — awaiting confirmation |
| ✖️ (grey) | **Dismissed** |

**Per-row actions:**

| Icon | Action |
|------|--------|
| ✅ **Confirm** | Confirms a pending suggestion |
| ✏️ **Edit** | Opens the edit form |
| ⏸️ / ▶️ **Pause / Resume** | Toggles between active and paused |
| 🗑️ **Delete** (red) | Permanently removes the recurring item |

The **Next date** column shows a countdown: "Today", "Tomorrow" or "In N days".

### Calendar view

Switch to calendar view with the **Calendar** button at the top.

- **Month navigation** — previous/next arrows and "Today" button
- **Month grid** — each day shows expected payments as coloured markers:
  - Green: payment occurred
  - Red: payment missed
  - Default: payment due
- **Summary bar** — total occurrences and total amount converted to base currency
- Click a marker to open details and edit the recurring item

### Create / edit a recurring item

The create or edit form contains:

| Field | Description |
|-------|-------------|
| **Name** | Descriptive name (e.g. "Rent", "Netflix", "Salary") |
| **Account** | Associated bank account (creation only) |
| **Description pattern** | Text that usually appears in the transaction description (for automatic matching) |
| **Frequency** | Weekly / Biweekly / Monthly / Quarterly / Yearly |
| **Anchor day** | Expected day of month (1–31) |
| **Expected amount** | Usual value (negative for expenses, empty for variable amount) |
| **Nominal amount** | Reference value when amount is variable |
| **Day tolerance** | Number of days margin before and after anchor date to detect the transaction |
| **Amount tolerance** | Percentage or absolute margin to accept amount variations |
| **Alert on occurrence** | Sends notification when the matching transaction is detected |
| **Alert on missing** | Sends notification if the payment is not detected within the tolerance |

---

## Telegram Bot

Eurodata can send alerts and answer queries via **Telegram** through the bot **@bancos_alerts_bot**.

### How to set up

1. Go to your **Profile** (top-right menu → My profile)
2. In the Telegram section, click **Link Telegram** — the app shows a direct link to the bot **@bancos_alerts_bot** on Telegram
3. Open Telegram, send a message to the bot, then send the **verification code** shown in the app (valid for 10 minutes)
4. After successful linking, enable **Telegram Alerts** in the preferences section

You can also search directly for **@bancos_alerts_bot** on Telegram.

### Available commands

| Command | Description |
|---------|-------------|
| `/transactions [N]` | Shows the last N transactions (default: 10; max: 100) |
| `/next [N]` | Shows the next N recurring transactions (default: 10) |
| `/balances` | Shows current balance per account and total |
| `/month [config name]` | Current month totals: received, paid, difference. Optionally accepts an Insights config name |
| `/year [config name]` | Year-to-date totals. Optionally accepts an Insights config name |

---

## Subscription

### Free trial period

The app includes a free trial period. During this period you have access to all features without restrictions.

### Active subscription

After the trial, an active subscription is required to:
- Keep automatic bank connections
- Receive daily transaction and balance updates

Without an active subscription, manual accounts (file import) continue to work.

### Managing your subscription

Go to **My profile** → **Subscription** tab to:
- View current subscription status
- Subscribe or renew
- Add extra automatic accounts (beyond those in the base plan)

Each base plan includes 2 automatic accounts. You can add more for an additional reduced monthly cost.

---

## Support

If you have questions this page doesn't answer, or run into a problem:

- 🐛 **Report a bug** — open an issue on the public repository
- 💡 **Suggest a feature** — share your ideas
- 💬 **GitHub Discussions** — join the community at [github.com/kal001/eurodata-public/discussions](https://github.com/kal001/eurodata-public/discussions)

---
