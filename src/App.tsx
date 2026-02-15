import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import AdminDashboard from "./components/AdminDashboard";
import AdminUsers from "./components/AdminUsers";
import Audit from "./components/Audit";
import Insights from "./components/Insights";
import Onboarding from "./components/Onboarding";
import PrivacyPolicy from "./components/PrivacyPolicy";
import RecurringTransactions from "./components/RecurringTransactions";
import Settings from "./components/Settings";
import { getAccountColor } from "./utils/accountColors";

const languages = [
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
];

// EU countries (ISO 3166-1 alpha-2), sorted by English name
const countryOptions = [
  { code: "AT", names: { en: "Austria", pt: "Áustria", es: "Austria", fr: "Autriche" } },
  { code: "BE", names: { en: "Belgium", pt: "Bélgica", es: "Bélgica", fr: "Belgique" } },
  { code: "BG", names: { en: "Bulgaria", pt: "Bulgária", es: "Bulgaria", fr: "Bulgarie" } },
  { code: "HR", names: { en: "Croatia", pt: "Croácia", es: "Croacia", fr: "Croatie" } },
  { code: "CY", names: { en: "Cyprus", pt: "Chipre", es: "Chipre", fr: "Chypre" } },
  { code: "CZ", names: { en: "Czech Republic", pt: "República Checa", es: "República Checa", fr: "République tchèque" } },
  { code: "DK", names: { en: "Denmark", pt: "Dinamarca", es: "Dinamarca", fr: "Danemark" } },
  { code: "EE", names: { en: "Estonia", pt: "Estónia", es: "Estonia", fr: "Estonie" } },
  { code: "FI", names: { en: "Finland", pt: "Finlândia", es: "Finlandia", fr: "Finlande" } },
  { code: "FR", names: { en: "France", pt: "França", es: "Francia", fr: "France" } },
  { code: "DE", names: { en: "Germany", pt: "Alemanha", es: "Alemania", fr: "Allemagne" } },
  { code: "GR", names: { en: "Greece", pt: "Grécia", es: "Grecia", fr: "Grèce" } },
  { code: "HU", names: { en: "Hungary", pt: "Hungria", es: "Hungría", fr: "Hongrie" } },
  { code: "IE", names: { en: "Ireland", pt: "Irlanda", es: "Irlanda", fr: "Irlande" } },
  { code: "IT", names: { en: "Italy", pt: "Itália", es: "Italia", fr: "Italie" } },
  { code: "LV", names: { en: "Latvia", pt: "Letónia", es: "Letonia", fr: "Lettonie" } },
  { code: "LT", names: { en: "Lithuania", pt: "Lituânia", es: "Lituania", fr: "Lituanie" } },
  { code: "LU", names: { en: "Luxembourg", pt: "Luxemburgo", es: "Luxemburgo", fr: "Luxembourg" } },
  { code: "MT", names: { en: "Malta", pt: "Malta", es: "Malta", fr: "Malte" } },
  { code: "NL", names: { en: "Netherlands", pt: "Países Baixos", es: "Países Bajos", fr: "Pays-Bas" } },
  { code: "PL", names: { en: "Poland", pt: "Polónia", es: "Polonia", fr: "Pologne" } },
  { code: "PT", names: { en: "Portugal", pt: "Portugal", es: "Portugal", fr: "Portugal" } },
  { code: "RO", names: { en: "Romania", pt: "Roménia", es: "Rumania", fr: "Roumanie" } },
  { code: "SK", names: { en: "Slovakia", pt: "Eslováquia", es: "Eslovaquia", fr: "Slovaquie" } },
  { code: "SI", names: { en: "Slovenia", pt: "Eslovénia", es: "Eslovenia", fr: "Slovénie" } },
  { code: "ES", names: { en: "Spain", pt: "Espanha", es: "España", fr: "Espagne" } },
  { code: "SE", names: { en: "Sweden", pt: "Suécia", es: "Suecia", fr: "Suède" } },
];

const translations = {
  en: {
    skipToMain: "Skip to main content",
    navFeatures: "Features",
    toggleDarkMode: "Toggle dark mode",
    openMenu: "Open menu",
    login: "Login",
    logout: "Logout",
    heroEyebrow: "Privacy-first · Pan-European",
    heroTitle: "One app for all your bank accounts. Your data stays yours.",
    heroBody:
      "Connect banks and cards across Europe. We never see or sell your banking data—it is stored for your access only, encrypted, with bank-grade providers. Servers in Germany. Open-source client you can inspect on GitHub.",
    heroAlerts: "Periodic alerts via Telegram and Slack. Weekly insights by email.",
    heroPrimaryCta: "Get started",
    heroSecondaryCta: "View roadmap",
    privacyHighlightsTitle: "Privacy by design",
    privacyHighlight1: "Your banking data is never seen or sold by us. It is stored with user-only access.",
    privacyHighlight2: "Banking data is stored encrypted.",
    privacyHighlight3: "Banking information suppliers are ISO 27000 certified companies.",
    privacyHighlight4: "Bank authentication credentials are not stored or processed through our servers.",
    privacyHighlight5: "App servers are located in Europe (Germany).",
    privacyHighlight6: "The app client code is open-sourced on GitHub and can be inspected by everyone.",
    landingStorageTitle: "Your data, your choice",
    landingStorageSubtitle: "Choose cloud sync (default) or local-only. You can change this anytime in your profile.",
    landingStorageCloudTitle: "Cloud sync",
    landingStorageCloudBody: "Data synced to our servers. Automatic transaction updates and alerts enabled.",
    landingStorageLocalTitle: "Local only",
    landingStorageLocalBody: "No automatic sync or periodic alerts. Refresh manually when you use the app.",
    dashboardTitle: "Daily dashboards",
    dashboardBody:
      "Visualize income, expenses, and savings targets with AI-assisted categorization and smart alerts.",
    totalIncome: "Total income",
    expenses: "Expenses",
    featureAccountsTitle: "Unified accounts",
    featureAccountsBody:
      "Connect all your banks and cards with secure re-authentication. Transactions updated automatically, twice a day.",
    featureCategoriesTitle: "Smart categories",
    featureCategoriesBody:
      "Assign a category to each transaction.\nAI-suggested categories. Learns over time.\nMultiple tags per transaction.",
    featureInsightsTitle: "Clear insights",
    featureInsightsBody:
      "Interactive charts highlight trends by period and account.",
    featureInsightsBodyBullets:
      "Interactive charts highlight trends by period and account.",
    landingFeaturesSectionTitle: "Features",
    featureCalendarTitle: "Calendar view",
    featureCalendarBody: "View upcoming recurrent transactions in calendar view mode.",
    featureNewBadge: "New",
    landingFeaturesCategoriesAndTagsTitle: "Categories and Tags",
    landingFeaturesAnalysisTitle: "Analysis",
    featureBancosTitle: "Banks",
    featureTagsBody:
      "Assign multiple tags per transaction to filter and report. Use tags to associate transactions with users. Use tags to distinguish between personal or business transactions, for example.",
    footerCopyright: "© 2026 eurodata.app",
    footerPrivacy: "Privacy Policy",
    footerGithub: "GitHub",
    footerLinkedin: "LinkedIn",
    footerTwitter: "Twitter",
    mobileMenu: "Mobile menu",
    adminTitle: "User management",
    adminCreate: "Create user",
    adminName: "Display name",
    adminPrimaryEmail: "Primary email",
    adminIsAdmin: "Admin user",
    adminCreateButton: "Create user",
    adminStatusActive: "Active",
    adminStatusInactive: "Inactive",
    adminMakeAdmin: "Make admin",
    adminRemoveAdmin: "Remove admin",
    adminDeactivate: "Deactivate",
    adminActivate: "Activate",
    adminInvite: "Send invite",
    adminAddEmail: "Add email",
    adminDeleteUser: "Delete user",
    adminEmails: "Emails",
    menuProfile: "My profile",
    menuUsers: "Users",
    menuAdminDashboard: "Admin dashboard",
    menuSettings: "Settings",
    menuAudit: "Audit",
    menuLogin: "Login",
    menuLogout: "Logout",
    menuAbout: "About",
    aboutAppName: "Bancos",
    aboutDescription: "Centralize your bank and card accounts, automate transaction categorization, and track spending patterns across currencies.",
    aboutCopyright: "© 2026 eurodata.app",
    aboutSupport: "Support",
    aboutChangelog: "View changelog",
    aboutClose: "Close",
    privacyTitle: "Privacy Policy",
    privacyBack: "Back",
    privacyLastUpdated: "Last updated: February 2026",
    privacyIntro:
      "eurodata.app (\"we\", \"our\", or \"the application\") is committed to protecting your privacy. We do not sell, rent, or share your personal information with third parties for marketing or any other purpose. This policy describes what data we process and your rights.",
    privacySection1Title: "1. Who we are",
    privacySection1Content:
      "This privacy policy applies to the eurodata.app web application (Bancos), which provides bank and card statement tracking and insights. The service is intended for users in Europe.",
    privacySection2Title: "2. Data we collect",
    privacySection2Content:
      "We only collect and process data that is necessary to provide the service: account information you configure (e.g. display name, country, notification preferences), authentication data handled by Auth0 (e.g. email, login), and bank transaction data that you link via open banking (Nordigen/GoCardless) solely to display and categorize your transactions. We do not collect or store data for advertising or analytics that identify you.",
    privacySection3Title: "3. How we use your data",
    privacySection3Content:
      "We use your data exclusively to operate the application: to authenticate you, to fetch and display your transactions, to run AI-assisted categorization based on your categories, and to send you optional alerts (e.g. Telegram, weekly email) if you have enabled them. We do not use your information for marketing, and we do not share or sell your personal or financial data to any third party.",
    privacySection4Title: "4. Data retention",
    privacySection4Content:
      "We retain your data only for as long as your account is active and as required to provide the service and comply with legal obligations. If you close your account or request deletion, we will delete or anonymize your personal and transaction data in line with our data retention and deletion procedures.",
    privacySection5Title: "5. Cookies and similar technologies",
    privacySection5Content:
      "We use strictly necessary cookies and local storage for session and authentication (e.g. Auth0). We do not use cookies or similar technologies for advertising or cross-site tracking. You can control cookies through your browser settings.",
    privacySection6Title: "6. Third-party services",
    privacySection6Content:
      "We use Auth0 for authentication, and open banking providers (e.g. GoCardless/Nordigen) to retrieve your bank data with your consent. These providers process data according to their own privacy policies. We do not pass your data to any other third parties for their marketing or other purposes.",
    privacySection7Title: "7. Your rights",
    privacySection7Content:
      "Depending on your location (including under the GDPR if you are in the European Economic Area), you may have the right to access, correct, export, or delete your personal data, to object to or restrict certain processing, and to lodge a complaint with a supervisory authority. To exercise these rights, please contact us using the details below.",
    privacySection8Title: "8. Changes to this policy",
    privacySection8Content:
      "We may update this privacy policy from time to time. We will post the updated version on this page and indicate the last updated date. Continued use of the service after changes constitutes acceptance of the revised policy.",
    privacyContactTitle: "Contact",
    privacyContactIntro:
      "For any questions about this privacy policy or your personal data, please contact us at the support or contact address provided in the application or on eurodata.app.",
    registerModalTitle: "Request access",
    registerWithEmail: "Register with email",
    registerWithGoogle: "Continue with Google",
    registerModalClose: "Close",
    signupRequestTitle: "Request access",
    signupRequestBody:
      "Access to the app is subject to admin approval. Enter your email address below so we can approve your sign-up. You will receive an email to set your password once an admin has approved your request.",
    signupRequestEmailLabel: "Email address",
    signupRequestSubmit: "Request access",
    signupRequestSuccess: "Request received. Check your email for next steps once an admin approves your access.",
    signupRequestError: "Something went wrong. Please try again later.",
    profileTitle: "Profile",
    profileName: "Name",
    profileCountry: "Country",
    profileCountryPlaceholder: "Select country",
    profileTelegramId: "Telegram Chat ID",
    profileTelegramHelp: "Get your ID from @userinfobot on Telegram",
    profileTelegramLinkButton: "Link with Telegram",
    profileTelegramLinkStep1: "Open Telegram and message our bot",
    profileTelegramLinkStep2: "Send this code to the bot",
    profileTelegramLinkExpires: "Code expires in 10 minutes.",
    profileTelegramLinked: "Telegram linked",
    profileTelegramLinkError: "Could not get link code. Try again.",
    profileTelegramOrManual: "Or enter your Chat ID manually (e.g. from @userinfobot)",
    profileTelegramUnlink: "Unlink",
    profileShowBalances: "Show account balances",
    profileShowBalancesHelp: "Display account balances on the transactions page",
    profileAutoDetection: "Recurring auto-detection",
    profileAutoDetectionHelp: "Automatically detect recurring transactions and suggest patterns (runs daily for cloud storage)",
    profileTelegramAlerts: "Telegram alerts",
    profileTelegramAlertsHelp: "Receive transaction and expected-payment alerts via Telegram",
    profileSlackAlerts: "Slack alerts",
    profileSlackAlertsHelp: "Receive transaction and expected-payment alerts in a Slack channel. Create an incoming webhook in your Slack workspace and paste the URL below.",
    profileSlackWebhookUrl: "Slack webhook URL",
    profileSlackWebhookUrlPlaceholder: "https://hooks.slack.com/services/...",
    profileChannelsSection: "Channels",
    profileAlertsSection: "Alerts",
    profileSlackWebhookHelpPopup: "1. Go to Slack API page: Visit https://api.slack.com/apps\n\n2. Create or select an app: Click \"Create New App\", choose \"From scratch\", give it a name and select your workspace.\n\n3. Enable Incoming Webhooks: In your app settings, click \"Incoming Webhooks\" in the left sidebar and toggle the switch to \"On\".\n\n4. Add webhook to channel: Click \"Add New Webhook to Workspace\" at the bottom, select the channel you want to post to, then click \"Allow\".\n\n5. Copy the webhook URL: Your webhook URL will appear — it looks like https://hooks.slack.com/services/...",
    profileSlackTestButton: "Send test message",
    profileSlackTestSent: "Test message sent to Slack.",
    profileSlackTestError: "Failed to send test message. Check webhook URL and try again.",
    profileTabUser: "User",
    profileTabChannels: "Channels",
    profileTabAlerts: "Alerts",
    profileTabStorage: "Storage",
    profileTabApiTokens: "API Tokens",
    profileWeeklyEmails: "Weekly emails",
    profileWeeklyEmailsHelp: "Receive the weekly Insights report by email (Sunday 08:00 UTC)",
    profileStorageMode: "Data storage",
    profileStorageModeCloud: "Cloud sync",
    profileStorageModeLocal: "Local only",
    profileStorageModeCloudHelp: "Your data is synced to our servers. Automatic transaction updates and alerts are enabled.",
    profileStorageModeLocalHelp: "Automatic transaction fetch and periodic alerts are disabled. You can still refresh manually when you use the app.",
    balanceUpdated: "Updated",
    balanceUnavailable: "Balance unavailable",
    refreshBalances: "Refresh balances and transactions",
    refreshingBalances: "Updating…",
    profileSave: "Save profile",
    profileSaved: "Profile updated.",
    profileSaveError: "Failed to update profile.",
    fetchInProgressMessage: "Importing transactions. You cannot add a new account or fetch more until this finishes.",
    fetchCompleted: "Transactions imported successfully.",
    fetchFailed: "Failed to import transactions.",
    profileEmail: "Email",
    profileStatus: "Status",
    profileAdmin: "Admin",
    profileNoEmail: "No email on file",
    profileApiTokens: "API tokens",
    profileApiTokensHelp: "Create tokens to access the API (e.g. for scripts). Each token is shown only once when created.",
    profileApiTokenCreate: "Create token",
    profileApiTokenName: "Token name",
    profileApiTokenNamePlaceholder: "e.g. Script or Integration",
    profileApiTokenLastUsed: "Last used",
    profileApiTokenNeverUsed: "Never",
    profileApiTokenCopy: "Copy token",
    profileApiTokenCopied: "Copied",
    profileApiTokenCreatedTitle: "Token created",
    profileApiTokenCreatedMessage: "Copy this token now. It won't be shown again.",
    profileApiTokenDelete: "Delete",
    profileApiTokenDeleteConfirm: "Delete this token? It will stop working immediately.",
    profileApiTokensEmpty: "No API tokens yet.",
    modalCancel: "Cancel",
    modalSave: "Save",
    modalConfirm: "Confirm",
    modalDeleteTitle: "Remove user",
    settingsDeleteCategoryTitle: "Delete category?",
    settingsDeleteTagTitle: "Delete tag?",
    confirmDeleteConnection: "Remove bank connection?",
    confirmDeleteAccount: "Delete this account?",
    confirmDeleteAccountWarning: "This will permanently delete the account and all its transactions. This cannot be undone.",
    adminActions: "Actions",
    inviteEmailSent: "Invite email sent.",
    inviteEmailFallback: "Email not sent. Use the invite link below.",
    inviteEmailRetry: "Invite email not sent. Use 'Send invite' to retry.",
    inviteLinkLabel: "Invite link",
    adminSearch: "Search users",
    adminRows: "Rows",
    adminShowing: "Showing",
    adminOf: "of",
    adminPrev: "Previous",
    adminNext: "Next",
    auditViewDetails: "View full details",
    auditDetailsClose: "Close",
    adminEmailVerified: "Email verified",
    adminTelegramId: "Telegram ID",
    adminEditTelegram: "Edit Telegram ID",
    adminTelegramModalTitle: "Edit Telegram Chat ID",
    adminTelegramSave: "Save",
    dashboardWelcome: "Account overview",
    dashboardAccountsTitle: "Bank & card accounts",
    dashboardAccountsBody: "Manage accounts to sync transactions.",
    dashboardAccountsButton: "Manage accounts",
    dashboardAccountsEmpty: "No banks linked yet.",
    dashboardInsightsTitle: "Insights",
    dashboardInsightsBody:
      "Monitor income and expenses with selectable periods and key metrics.",
    dashboardInsightsPeriod: "Period",
    dashboardTransactionsTitle: "Recent transactions",
    dashboardTransactionsBody:
      "Review the latest activity and filter by bank or all accounts.",
    dashboardTransactionsFilter: "Bank filter",
    dashboardFilterAll: "All banks",
    dashboardAccountsTooltip: "Manage accounts",
    dashboardInsightsTooltip: "View insights",
    dashboardTransactionsTooltip: "View transactions",
    transactionsListTitle: "All transactions",
    transactionsListEmpty: "No transactions available yet.",
    transactionsAmount: "Amount",
    transactionsDate: "Date",
    transactionsAccount: "Account",
    transactionsSearch: "Search transactions",
    transactionsRows: "Rows",
    transactionsShowing: "Showing",
    transactionsOf: "of",
    transactionsTo: "to",
    transactionsPrev: "Previous",
    transactionsNext: "Next",
    statusConnected: "Connected",
    statusLastUpdated: "Last updated",
    actionReconnect: "Reconnect",
    actionDelete: "Delete",
    actionFetchTransactions: "Get transactions",
    actionDeleteAccount: "Delete account",
    transactionsFetching: "Fetching transactions...",
    transactionsFetched: "Transactions fetched",
    transactionsNoAccounts: "No accounts available for this bank.",
    transactionsFailed: "Failed to fetch transactions.",
    transactionsLimitReached: "Daily transaction fetch limit reached.",
    gocardlessRateLimitExceeded: "Daily rate limit exceeded with bank provider. Try again later.",
    importStatementTitle: "Import statement (PDF)",
    importStatementDrop: "Drop PDF files here",
    importStatementSelectFiles: "Select files",
    importStatementParsing: "Analysing...",
    importStatementAnalyse: "Analyse",
    importStatementParseFailed: "Analysis failed",
    importStatementFileSingular: "file",
    importStatementFilePlural: "files",
    importStatementParsed: "parsed",
    importStatementTotalTransactions: "Total transactions",
    importToAccount: "Import to",
    importSuccess: "Imported",
    importFailed: "Import failed",
    createNewAccount: "Create new account",
    assignToExisting: "Assign to existing account",
    statementBankName: "Bank name",
    statementAccountName: "Account name",
    statementDisplayName: "Display name",
    statementCountry: "Country",
    selectBankForLogo: "Update logo",
    pickBankFromList: "Pick from bank list",
    accountSourceManual: "Manual",
    accountSourceAutomatic: "Automatic",
    importReviewTitle: "Review transactions",
    importReviewBack: "Back",
    importReviewImport: "Import",
    importReviewFlipSign: "Flip sign (credit ↔ debit)",
    importReviewFileLabel: "File",
    importReviewInclude: "Include in import",
    importReviewExclude: "Exclude from import",
    refreshBalancesPartialRateLimit: "Some accounts could not be updated (rate limit). Balances updated for the rest.",
    transactionUpdateError: "Failed to update transaction.",
    confirmDeleteTransaction: "Delete transaction?",
    confirmDeleteTransactionWarning: "This transaction will be permanently removed. This cannot be undone.",
    bookingDate: "Booking date",
    postingDate: "Posting date",
    postingDateEarlier: "Earlier (posting date -1 day)",
    postingDateLater: "Later (posting date +1 day)",
    transactionStatusPending: "Pending",
    transactionCategory: "Category",
    transactionTags: "Tags",
    filterCategoryAll: "All",
    filterCategoryNone: "No category",
    filterCategoryWith: "With category",
    filterCategoryWithout: "Without category",
    exportTransactionsTitle: "Export transactions",
    exportDates: "Dates",
    exportDatesAll: "All dates",
    exportDatesRange: "Selected period",
    exportDateFrom: "From",
    exportDateTo: "To",
    exportAccounts: "Accounts",
    exportAccountsAll: "All accounts",
    exportAccountsSelected: "Selected accounts",
    exportCategories: "Categories",
    exportCategoriesAll: "All categories",
    exportCategoriesSelected: "Selected categories",
    exportCategoriesEmpty: "Empty categories (uncategorized)",
    exportTags: "Tags",
    exportTagsAll: "All tags",
    exportTagsSelected: "Selected tags",
    exportDownload: "Export CSV",
    exportCancel: "Cancel",
    exportSuccess: "CSV downloaded.",
    exportNumberFormat: "Number format",
    exportNumberFormatHelp: "Match your Excel locale so amounts display correctly.",
    exportDecimalSeparator: "Decimal",
    exportDecimalPeriod: "Period (.)",
    exportDecimalComma: "Comma (,)",
    exportThousandsSeparator: "Thousands",
    exportThousandsNone: "None",
    exportThousandsComma: "Comma (,)",
    exportThousandsPeriod: "Period (.)",
    settingsTitle: "Settings",
    settingsCategories: "Categories",
    settingsTags: "Tags",
    settingsAddCategory: "Add category",
    settingsAddTag: "Add tag",
    settingsCategoryName: "Category name",
    settingsTagName: "Tag name",
    settingsExport: "Export",
    settingsImport: "Import",
    settingsExportImport: "Export / Import",
    settingsExportSuccess: "Settings exported.",
    settingsImportSuccess: "Import done: {created} created, {skipped} already existed.",
    settingsImportError: "Import failed. Check file format.",
    settingsImportFileInvalid: "File must contain categories and/or tags.",
    auditTitle: "Audit log",
    auditDate: "Date",
    auditUser: "User",
    auditAction: "Action",
    auditResource: "Resource",
    auditDetails: "Details",
    auditFilterAction: "Action",
    auditFilterAll: "All",
    auditResult: "Result",
    auditResultSuccess: "Success",
    auditResultFail: "Fail",
    auditResultInfo: "Info",
    audit_action_user_login: "User login",
    audit_action_user_logout: "User logout",
    audit_action_user_create: "User created",
    audit_action_user_delete: "User deleted",
    audit_action_category_create: "Category created",
    audit_action_category_update: "Category updated",
    audit_action_category_delete: "Category deleted",
    audit_action_tag_create: "Tag created",
    audit_action_tag_update: "Tag updated",
    audit_action_tag_delete: "Tag deleted",
    audit_action_account_linked: "Account linked",
    audit_action_account_deleted: "Account deleted",
    audit_action_account_alerts_updated: "Account alerts updated",
    audit_action_transactions_fetched: "Transactions fetched",
    audit_action_transaction_edited: "Transaction edited",
    transactionsIncludeInTotals: "Include in totals",
    actionUpdateAccountName: "Update account name",
    accountAlertsTitle: "Alert thresholds",
    accountAlertAbove: "Alert above (€)",
    accountAlertBelow: "Alert below (€)",
    actionEditAlerts: "Edit alert thresholds",
    actionReconnectBank: "Reconnect bank",
    actionReauthRequired: "Re-authentication required – reconnect this account",
    accountTransactionAlerts: "Expected transaction alerts",
    transactionsFilterAll: "All",
    transactionsFilterNewOnly: "New only",
    transactionNew: "New",
    transactionClearNew: "Mark as reviewed",
    transactionComment: "Comment",
    transactionCommentAdd: "Add comment",
    transactionCommentPlaceholder: "Add a comment...",
    createAlertFromTransaction: "Recurring",
    createAlertTitle: "Set up recurring transaction",
    createAlertDayToleranceBefore: "Day tolerance before",
    createAlertDayToleranceAfter: "Day tolerance after",
    createAlertValueToleranceBelow: "Value tolerance below",
    createAlertValueToleranceAbove: "Value tolerance above",
    alertTemplateDescription: "Description",
    alertTemplateDay: "Day",
    alertTemplateDayTolerance: "({before} before / {after} after)",
    alertTemplateDays: "days",
    alertTemplateAmount: "Amount",
    alertTemplateEdit: "Edit",
    alertTemplateDelete: "Delete",
    alertCreated: "Alert created.",
    alertDeleted: "Alert deleted.",
    alertCreateError: "Failed to create alert.",
    audit_action_alert_created: "Alert created",
    audit_action_alert_deleted: "Alert deleted",
    audit_action_gocardless_rate_limit: "GoCardless rate limit (429)",
    audit_action_transaction_fetch_limit_reached: "Daily fetch limit reached",
    audit_action_transactions_fetch_scheduled: "Scheduled transaction fetch",
    audit_action_weekly_send_report: "Weekly report sent",
    audit_action_statement_parsed: "Statement parsed (PDF)",
    audit_action_transactions_imported_from_pdf: "Transactions imported from PDF",
    audit_action_manual_account_created: "Manual account created",
    audit_action_account_logo_updated: "Account logo updated",
    audit_action_daily_missing_transaction_alerts: "Daily missing transaction alerts sent",
    audit_action_get_account_transactions: "Account transactions obtained from bank",
    audit_action_list_institutions: "Institutions list consulted",
    audit_action_create_requisition: "Bank link request created",
    audit_action_get_requisition: "Link status consulted",
    audit_action_get_account_details: "Account details obtained",
    metricsTitle: "Admin dashboard",
    metricsUsers: "Users",
    metricsBanking: "Banking",
    metricsRecurring: "Recurring transactions",
    metricsEngagement: "Engagement",
    metricsTotalUsers: "Total users",
    metricsActiveUsers7d: "Active users (7 days)",
    metricsActiveUsers30d: "Active users (30 days)",
    metricsOnboardingCompleted: "Onboarding completed",
    metricsUsersWithAccount: "Users with at least one account",
    metricsTotalAccounts: "Total bank accounts",
    metricsTotalConnections: "Total bank connections",
    metricsTotalTransactions: "Total transactions",
    metricsAvgAccountsPerUser: "Avg accounts per user",
    metricsAvgTransactionsPerUser: "Avg transactions per user",
    metricsTotalPatterns: "Total recurring patterns",
    metricsPatternsActive: "Patterns (active)",
    metricsPatternsSuggested: "Patterns (suggested)",
    metricsPatternsPaused: "Patterns (paused)",
    metricsPatternsAutoDetected: "Auto-detected",
    metricsPatternsManual: "Manual",
    metricsPatternsMigrated: "Migrated",
    metricsUsersWithPatterns: "Users with patterns",
    metricsAvgPatternsPerUser: "Avg patterns per user (with patterns)",
    metricsOccurrencesMatched: "Matched occurrences",
    metricsTelegramEnabled: "Users with Telegram alerts",
    metricsWeeklyEmailsEnabled: "Users with weekly emails",
    metricsLoading: "Loading metrics…",
    metricsError: "Failed to load metrics",
    accountTransactionAlertsEmpty: "No expected transaction alerts. Create one from a transaction (bell icon in the transactions list).",
    helpTitle: "Help",
    helpClose: "Close",
    helpTransactionsTitle: "Help: Transactions",
    helpTransactionsIntro: "This screen lists your transactions. Use the filters to narrow results. Below is what each element does.",
    helpTxSearch: "Search",
    helpTxSearchDesc: "Filter by transaction description or account name.",
    helpTxRows: "Rows per page",
    helpTxRowsDesc: "Choose how many transactions to show per page (10, 20, 50).",
    helpTxFilterAll: "All / New only",
    helpTxFilterAllDesc: "Show all transactions or only those marked as new (not yet reviewed).",
    helpTxCategoryFilter: "Category filter",
    helpTxCategoryFilterDesc: "Filter by one or more categories. Use All or No category for quick selection.",
    helpTxTagFilter: "Tag filter",
    helpTxTagFilterDesc: "Filter by tags; optionally include untagged transactions.",
    helpTxExport: "Export CSV",
    helpTxExportDesc: "Download transactions as a CSV file for Excel.",
    helpTxCategorySelect: "Category (per row)",
    helpTxCategorySelectDesc: "Assign or change the category for this transaction.",
    helpTxAlertIcon: "Recurring",
    helpTxAlertIconDesc: "Set up a recurring transaction so we notify you when it occurs or when it is missing (e.g. monthly payment).",
    helpTxCommentIcon: "Comment",
    helpTxCommentIconDesc: "Add or edit a note for this transaction.",
    helpTxDeleteIcon: "Delete",
    helpTxDeleteIconDesc: "Remove this transaction permanently.",
    helpTxTags: "Tags",
    helpTxTagsDesc: "Assign or change tags for this transaction.",
    helpTxNewBadge: "New",
    helpTxNewBadgeDesc: "Transaction imported recently. Click the × to mark as reviewed.",
    helpTxIncludeInInsights: "Include in insights (checkbox)",
    helpTxIncludeInInsightsDesc: "Check to include this transaction in Insights (charts and totals); uncheck to exclude it.",
    helpTxPostingDateArrows: "Posting date (up/down arrows)",
    helpTxPostingDateArrowsDesc: "Up arrow: move posting date one day later. Down arrow: move it one day earlier.",
    helpTxPaginationArrows: "Previous / next page",
    helpTxPaginationArrowsDesc: "Left arrow: previous page of the list. Right arrow: next page.",
    helpAccountTypeIcon: "Account type icon (next to logo)",
    helpAccountTypeIconDesc: "Document icon = manual account (transactions imported e.g. via PDF). Link icon = automatic account (linked to bank, syncs balances and transactions).",
    helpAccountsTitle: "Help: Accounts",
    helpAccountsIntro: "Manage your bank and card accounts. Link new accounts or manage existing ones.",
    helpAccountLinkBank: "Link a bank",
    helpAccountLinkBankDesc: "Start the process to connect a bank or card account via the secure provider.",
    helpAccountLinkedList: "Linked accounts",
    helpAccountLinkedListDesc: "Accounts you have configured.",
    helpAccountRefresh: "Refresh balances",
    helpAccountRefreshDesc: "Update balances and fetch new transactions from the bank.",
    helpAccountFetch: "Fetch transactions",
    helpAccountFetchDesc: "Manually trigger fetching transactions for this connection.",
    helpAccountAlerts: "Account alerts",
    helpAccountAlertsDesc: "Show or edit configured alerts for the account.",
    helpAccountDelete: "Delete account",
    helpAccountDeleteDesc: "Delete the account (and all its transactions).",
    helpAccountReconnect: "Reconnect",
    helpAccountReconnectDesc: "Re-authenticate when the bank connection has expired (e.g. every 90 days).",
    helpInsightsTitle: "Help: Insights",
    helpInsightsIntro: "View income, expenses, and trends by period. Save configurations to reuse filters.",
    helpInsightsPeriod: "Period",
    helpInsightsPeriodDesc: "Select the time range for the charts (current month, last month, YTD, last 12 months, or custom).",
    helpInsightsConfigs: "Saved configurations",
    helpInsightsConfigsDesc: "Save and load filter configurations (period, accounts, categories, tags).",
    helpInsightsCards: "Cards",
    helpInsightsCardsDesc: "Received, paid, by category, totals, balance history. Expand or collapse each card.",
    helpProfileTitle: "Help: Profile",
    helpProfileIntro: "Your account settings and preferences for alerts and display.",
    helpProfileName: "Display name",
    helpProfileNameDesc: "Your name as shown in the app.",
    helpProfileCountry: "Country",
    helpProfileCountryDesc: "Used for date and number formatting.",
    helpProfileTelegram: "Telegram Chat ID",
    helpProfileTelegramDesc: "Link your Telegram to receive transaction and expected-payment alerts.",
    helpProfileShowBalances: "Show account balances",
    helpProfileShowBalancesDesc: "Show or hide balance on the transactions page.",
    helpProfileTelegramAlerts: "Telegram alerts",
    helpProfileTelegramAlertsDesc: "Enable or disable Telegram notifications.",
    helpProfileWeeklyEmails: "Weekly emails",
    helpProfileWeeklyEmailsDesc: "Receive the weekly Insights report by email.",
    onboardingTitle: "Available Banks",
    onboardingBody: "Choose the bank you want to add",
    onboardingCta: "Complete onboarding",
    onboardingCountry: "Country",
    onboardingSearch: "Search banks",
    onboardingSelectBank: "Select a bank",
    onboardingAddAccount: "Add account",
    onboardingConnectBank: "Connect bank",
    onboardingCompleting: "Redirecting to your bank...",
    onboardingFriendlyNameSave: "Save account name",
    onboardingAccountsTitle: "Linked accounts",
    onboardingRequired: "Please add at least one account.",
    notAuthorizedTitle: "Access denied",
    notAuthorizedBody:
      "Your user is not authorized yet. Contact the administrator to be added.",
    accessDeniedTitle: "Login not allowed",
    accessDeniedBody:
      "Your login was denied by the app's access check. If you were just created by an admin, the check may be running against a different server (e.g. production). Ask your admin to ensure your account exists there, or to point the allowlist at this environment (e.g. via a tunnel for local development).",
    accessDeniedTryAgain: "Back to home",
    serverErrorTitle: "Service temporarily unavailable",
    serverErrorBody:
      "The server could not be reached. This is not an authorization issue. Try again in a few minutes or contact the administrator if it persists.",
    navTransactions: "Transactions",
    navAccounts: "Accounts",
    navInsights: "Insights",
    navRecurring: "Recurring",
    recurringTitle: "Recurring transactions",
    recurringSubtitle: "Track and manage expected recurring payments. Run detection to find suggestions from your history.",
    recurringInitialOfferTitle: "Find recurring patterns",
    recurringInitialOfferBody: "We can analyze your last 12 months of transactions to suggest recurring payments (subscriptions, rent, utilities). Optional; processing runs on our servers.",
    recurringInitialOfferAnalyze: "Analyze my transactions",
    recurringInitialOfferSkip: "Skip for now",
    recurringEmptyGuidance: "Create a pattern manually from a transaction (e.g. Netflix, rent, utilities) or run detection above. More history helps.",
    recurringFindSuggestions: "Find suggestions",
    recurringFinding: "Analysing…",
    recurringNoSuggestions: "No new suggestions.",
    recurringReviewSuggestions: "Review suggestions",
    recurringSuggestionsCount: "{n} suggestion(s) to review",
    recurringConfirm: "Confirm",
    recurringDismiss: "Dismiss",
    recurringSkip: "Skip",
    recurringEditThenConfirm: "Edit then confirm",
    recurringProgressOf: "{i} of {n}",
    filterAccount: "Account",
    filterAccountAll: "All accounts",
    filterStatus: "Status",
    filterStatusAll: "All",
    filterStatusActive: "Active",
    filterStatusPaused: "Paused",
    filterStatusSuggested: "Suggested",
    sortBy: "Sort by",
    sortNextDate: "Next date",
    sortName: "Name",
    sortFrequency: "Frequency",
    sortAmount: "Amount",
    sortConfidence: "Confidence",
    searchPlaceholder: "Search by name…",
    recurringEmpty: "No recurring transactions. Add one from a transaction or run detection.",
    recurringNext: "Next",
    recurringAmount: "Amount",
    recurringAmountVaries: "Varies",
    recurringFrequency: "Frequency",
    recurringFrequencyWeekly: "Weekly",
    recurringFrequencyBiweekly: "Biweekly",
    recurringFrequencyMonthly: "Monthly",
    recurringFrequencyQuarterly: "Quarterly",
    recurringFrequencyYearly: "Yearly",
    recurringStatusActive: "Active",
    recurringStatusPaused: "Paused",
    recurringStatusSuggested: "Suggested",
    recurringStatusDismissed: "Dismissed",
    recurringStatusArchived: "Archived",
    recurringCreateManual: "Add recurring",
    recurringEdit: "Edit",
    recurringPause: "Pause",
    recurringResume: "Resume",
    recurringDelete: "Delete",
    recurringViewList: "List",
    recurringViewCalendar: "Calendar",
    calendarToday: "Today",
    calendarMonthTitle: "Month",
    calendarSummaryTransactions: "{n} expected transaction(s)",
    calendarSummaryAmount: "Total",
    calendarUpcoming: "Upcoming",
    countdownToday: "Today",
    countdownTomorrow: "Tomorrow",
    countdownInNDays: "In {n} days",
    countdownDaysAgo: "{n} days ago",
    modalClose: "Close",
    detailName: "Name",
    detailDescriptionPattern: "Description pattern",
    detailFrequency: "Frequency",
    detailInterval: "Interval",
    detailAnchorDay: "Anchor day",
    detailDayTolerance: "Day tolerance (± days)",
    detailExpectedAmount: "Expected amount",
    detailNominalAmount: "Nominal amount (for totals)",
    detailAmountTolerance: "Amount tolerance (±)",
    detailAlertOnOccurrence: "Alert when it occurs",
    detailAlertOnMissing: "Alert when missing",
    detailMissingGraceDays: "Missing grace (days)",
    createRecurringTitle: "Add recurring transaction",
    createRecurringSuccess: "Recurring transaction created.",
    createRecurringError: "Something went wrong.",
    deleteConfirm: "Remove this recurring transaction?",
    deleteSuccess: "Removed.",
    confirmSuccess: "Suggestion confirmed.",
    confirmOnlySuggestedError: "Only suggestions can be confirmed. This item may have been dismissed.",
    dismissSuccess: "Suggestion dismissed.",
    incomeVsExpenses: "Income vs Expenses",
    monthlyTrend: "Monthly Trend",
    topCategories: "Top Categories",
    period: "Period",
    days: "days",
    year: "year",
    insightsPeriod: "Period",
    insightsAccounts: "Accounts",
    insightsTags: "Tags",
    insightsCategories: "Categories",
    insightsPeriodCurrentMonth: "Current month",
    insightsPeriodLastMonth: "Last month",
    insightsPeriodYtd: "Since beginning of year",
    insightsPeriodLast12Months: "Last 12 months",
    insightsPeriodCustom: "Custom",
    insightsDateFrom: "From",
    insightsDateTo: "To",
    insightsAllAccounts: "All",
    insightsAllTags: "All",
    insightsAllCategories: "All",
    insightsNoCategory: "No category",
    insightsNoTag: "No tag",
    insightsSaveConfig: "Save configuration",
    insightsLoadConfig: "Load configuration",
    insightsSetDefault: "Set as default",
    insightsConfigName: "Configuration name",
    insightsConfigNamePlaceholder: "e.g. Monthly review",
    insightsSaveAsDefault: "Set as default",
    insightsSaved: "Configuration saved.",
    insightsLoadConfigTitle: "Load configuration",
    insightsNoConfigs: "No saved configurations.",
    insightsDeleteConfig: "Delete configuration",
    insightsDeleteConfigConfirm: "Delete this configuration?",
    insightsConfigDeleted: "Configuration deleted.",
    insightsExportPdf: "Export PDF",
    insightsCardReceived: "List of received values",
    insightsReceivedListTotal: "Total",
    insightsCardPaid: "List of paid values",
    insightsShowMax: "Show",
    insightsShowAll: "All",
    insightsCardByCategory: "Total by category",
    insightsCardTotals: "Total received, paid and difference",
    insightsCardBalanceHistory: "Balance history",
    insightsCardBalanceAccumulated: "Accumulated balance",
    insightsCardBalanceComparison: "Balance comparison (month-over-month)",
    insightsAccount: "Account",
    insightsNavigateToTop: "Navigate to top",
    insightsTotalReceived: "Total received",
    insightsTotalPaid: "Total paid",
    insightsDifference: "Difference",
    insightsDate: "Date",
    insightsDescription: "Description",
    insightsAmount: "Amount",
    insightsCategory: "Category",
    insightsEmpty: "No data for the selected filters.",
    insightsMonth: "Month",
    insightsBalance: "Balance",
    insightsComment: "Comment",
    myProfile: "My profile",
    userManagement: "User management",
    settings: "Settings",
    audit: "Audit",
  },
  pt: {
    skipToMain: "Ir para o conteúdo principal",
    navFeatures: "Funcionalidades",
    toggleDarkMode: "Alternar modo escuro",
    openMenu: "Abrir menu",
    login: "Entrar",
    logout: "Sair",
    heroEyebrow: "Privacidade em primeiro · Pan-Europeu",
    heroTitle: "Uma app para todas as suas contas bancárias. Os seus dados ficam seus.",
    heroBody:
      "Ligue bancos e cartões em toda a Europa. Nunca vemos nem vendemos os seus dados bancários—ficam armazenados só para si, encriptados, com fornecedores de nível bancário. Servidores na Alemanha. Cliente em código aberto que pode inspecionar no GitHub.",
    heroAlerts: "Alertas periódicos por Telegram e Slack. Análises semanais por email.",
    heroPrimaryCta: "Começar",
    heroSecondaryCta: "Ver roadmap",
    privacyHighlightsTitle: "Privacidade por design",
    privacyHighlight1: "Os seus dados bancários nunca são vistos nem vendidos por nós. Ficam armazenados com acesso apenas do utilizador.",
    privacyHighlight2: "Os dados bancários são armazenados encriptados.",
    privacyHighlight3: "Os fornecedores de informação bancária são empresas certificadas ISO 27000.",
    privacyHighlight4: "As credenciais de autenticação bancária não são armazenadas nem processadas nos nossos servidores.",
    privacyHighlight5: "Os servidores da aplicação estão na Europa (Alemanha).",
    privacyHighlight6: "O código cliente da app é open-source no GitHub e pode ser inspecionado por todos.",
    landingStorageTitle: "Os seus dados, a sua escolha",
    landingStorageSubtitle: "Escolha sincronização na nuvem (predefinido) ou apenas local. Pode alterar no perfil quando quiser.",
    landingStorageCloudTitle: "Sincronização na nuvem",
    landingStorageCloudBody: "Dados sincronizados nos nossos servidores. Atualizações automáticas de movimentos e alertas ativos.",
    landingStorageLocalTitle: "Apenas local",
    landingStorageLocalBody: "Sem sincronização automática nem alertas periódicos. Atualize manualmente quando usar a aplicação.",
    dashboardTitle: "Painéis diários",
    dashboardBody:
      "Visualize receitas, despesas e metas de poupança com categorização assistida por IA e alertas inteligentes.",
    totalIncome: "Total de receitas",
    expenses: "Despesas",
    featureAccountsTitle: "Todos os Bancos Europeus",
    featureAccountsBody:
      "Ligue todas as contas em bancos e cartões em 30 países da Europa, com reautenticação segura. Transações actualizadas automaticamente, duas vezes por dia.",
    featureCategoriesTitle: "Categorias e etiquetas",
    featureCategoriesBody:
      "Atribua categorias a cada transação.\nSugestão de categorias feita por IA. Aprendizagem com o tempo.\nMúltiplas etiquetas para cada transação.",
    featureInsightsTitle: "Análises claras",
    featureInsightsBody:
      "Gráficos interativos destacam tendências por período e conta. Relatórios semanais e possibilidade de exportação de relatórios para pdf.",
    featureInsightsBodyBullets:
      "Gráficos interativos destacam tendências por período e conta. Relatórios semanais e possibilidade de exportação de relatórios para pdf.",
    landingFeaturesSectionTitle: "Funcionalidades",
    featureCalendarTitle: "Vista de calendário",
    featureCalendarBody: "Veja as transações recorrentes futuras em modo de calendário.",
    featureNewBadge: "Novo",
    landingFeaturesCategoriesAndTagsTitle: "Categorias e etiquetas",
    landingFeaturesAnalysisTitle: "Análises",
    featureBancosTitle: "Bancos",
    featureTagsBody:
      "Atribua várias etiquetas por transação para filtrar e reportar.\nUse etiquetas para associar transações com utilizadores.\nUse etiquetas para distinguir entre transações pessoais ou de empresa, por exemplo.",
    footerCopyright: "© 2026 eurodata.app",
    footerPrivacy: "Política de Privacidade",
    footerGithub: "GitHub",
    footerLinkedin: "LinkedIn",
    footerTwitter: "Twitter",
    mobileMenu: "Menu móvel",
    adminTitle: "Gestão de utilizadores",
    adminCreate: "Criar utilizador",
    adminName: "Nome a apresentar",
    adminPrimaryEmail: "Email principal",
    adminIsAdmin: "Utilizador admin",
    adminCreateButton: "Criar utilizador",
    adminStatusActive: "Ativo",
    adminStatusInactive: "Inativo",
    adminMakeAdmin: "Tornar admin",
    adminRemoveAdmin: "Remover admin",
    adminDeactivate: "Desativar",
    adminActivate: "Ativar",
    adminInvite: "Enviar convite",
    adminAddEmail: "Adicionar email",
    adminDeleteUser: "Remover utilizador",
    adminEmails: "Emails",
    menuProfile: "O meu perfil",
    menuUsers: "Utilizadores",
    menuAdminDashboard: "Painel de administração",
    menuSettings: "Definições",
    menuAudit: "Auditoria",
    menuLogin: "Entrar",
    menuLogout: "Sair",
    menuAbout: "Acerca",
    aboutAppName: "Bancos",
    aboutDescription: "Centralize as suas contas bancárias e de cartão, automatize a categorização de transações e acompanhe padrões de gastos em várias moedas.",
    aboutCopyright: "© 2026 eurodata.app",
    aboutSupport: "Suporte",
    aboutChangelog: "Ver registo de alterações",
    aboutClose: "Fechar",
    metricsTitle: "Painel de administração",
    metricsUsers: "Utilizadores",
    metricsBanking: "Contas bancárias",
    metricsRecurring: "Transações recorrentes",
    metricsEngagement: "Participação",
    metricsTotalUsers: "Total de utilizadores",
    metricsActiveUsers7d: "Utilizadores ativos (7 dias)",
    metricsActiveUsers30d: "Utilizadores ativos (30 dias)",
    metricsOnboardingCompleted: "Onboarding concluído",
    metricsUsersWithAccount: "Utilizadores com pelo menos uma conta",
    metricsTotalAccounts: "Total de contas bancárias",
    metricsTotalConnections: "Total de ligações bancárias",
    metricsTotalTransactions: "Total de transações",
    metricsAvgAccountsPerUser: "Média de contas por utilizador",
    metricsAvgTransactionsPerUser: "Média de transações por utilizador",
    metricsTotalPatterns: "Total de padrões recorrentes",
    metricsPatternsActive: "Padrões (ativos)",
    metricsPatternsSuggested: "Padrões (sugeridos)",
    metricsPatternsPaused: "Padrões (pausados)",
    metricsPatternsAutoDetected: "Detetados automaticamente",
    metricsPatternsManual: "Manuais",
    metricsPatternsMigrated: "Migrados",
    metricsUsersWithPatterns: "Utilizadores com padrões",
    metricsAvgPatternsPerUser: "Média de padrões por utilizador (com padrões)",
    metricsOccurrencesMatched: "Ocorrências correspondidas",
    metricsTelegramEnabled: "Utilizadores com alertas Telegram",
    metricsWeeklyEmailsEnabled: "Utilizadores com e-mails semanais",
    metricsLoading: "A carregar métricas…",
    metricsError: "Erro ao carregar métricas",
    privacyTitle: "Política de Privacidade",
    privacyBack: "Voltar",
    privacyLastUpdated: "Última atualização: fevereiro de 2026",
    privacyIntro:
      "O eurodata.app (\"nós\", \"nosso\" ou \"a aplicação\") está empenhado em proteger a sua privacidade. Não vendemos, alugamos nem partilhamos os seus dados pessoais com terceiros para fins de marketing ou qualquer outro. Esta política descreve que dados tratamos e os seus direitos.",
    privacySection1Title: "1. Quem somos",
    privacySection1Content:
      "Esta política de privacidade aplica-se à aplicação web eurodata.app (Bancos), que disponibiliza o acompanhamento de extratos bancários e de cartão. O serviço destina-se a utilizadores na Europa.",
    privacySection2Title: "2. Dados que recolhemos",
    privacySection2Content:
      "Só recolhemos e tratamos dados necessários ao serviço: informações da conta que configurar (ex.: nome, país, preferências de notificação), dados de autenticação tratados pela Auth0 (ex.: email, início de sessão) e dados de transações bancárias que associar via open banking (Nordigen/GoCardless) apenas para mostrar e categorizar as suas transações. Não recolhemos nem armazenamos dados para publicidade ou análise que o identifiquem.",
    privacySection3Title: "3. Como usamos os seus dados",
    privacySection3Content:
      "Usamos os seus dados exclusivamente para operar a aplicação: autenticá-lo, obter e mostrar as suas transações, aplicar categorização assistida por IA com base nas suas categorias e enviar alertas opcionais (ex.: Telegram, email semanal) se os tiver ativado. Não usamos os seus dados para marketing nem partilhamos ou vendemos os seus dados pessoais ou financeiros a terceiros.",
    privacySection4Title: "4. Conservação dos dados",
    privacySection4Content:
      "Conservamos os seus dados apenas enquanto a sua conta estiver ativa e pelo tempo necessário para prestar o serviço e cumprir obrigações legais. Se encerrar a conta ou pedir eliminação, eliminaremos ou anonimizaremos os seus dados pessoais e de transações de acordo com os nossos procedimentos.",
    privacySection5Title: "5. Cookies e tecnologias semelhantes",
    privacySection5Content:
      "Utilizamos cookies e armazenamento local estritamente necessários para sessão e autenticação (ex.: Auth0). Não utilizamos cookies ou tecnologias semelhantes para publicidade ou rastreio entre sites. Pode controlar os cookies nas definições do browser.",
    privacySection6Title: "6. Serviços de terceiros",
    privacySection6Content:
      "Utilizamos a Auth0 para autenticação e prestadores de open banking (ex.: GoCardless/Nordigen) para obter os seus dados bancários com o seu consentimento. Estes prestadores tratam dados conforme as respetivas políticas de privacidade. Não transmitimos os seus dados a outros terceiros para marketing ou outros fins.",
    privacySection7Title: "7. Os seus direitos",
    privacySection7Content:
      "Consoante a sua localização (incluindo ao abrigo do RGPD se estiver na Área Económica Europeia), pode ter direito a aceder, retificar, exportar ou eliminar os seus dados pessoais, a opor-se ou limitar certo tratamento e a apresentar queixa a uma autoridade de controlo. Para exercer estes direitos, contacte-nos pelos meios indicados abaixo.",
    privacySection8Title: "8. Alterações a esta política",
    privacySection8Content:
      "Podemos atualizar esta política de privacidade. A versão atualizada será publicada nesta página com a data da última atualização. O uso continuado do serviço após alterações constitui aceitação da política revista.",
    privacyContactTitle: "Contacto",
    privacyContactIntro:
      "Para questões sobre esta política de privacidade ou os seus dados pessoais, contacte-nos pelo endereço de suporte ou contacto indicado na aplicação ou em eurodata.app.",
    registerModalTitle: "Solicitar acesso",
    registerWithEmail: "Registar com email",
    registerWithGoogle: "Continuar com Google",
    registerModalClose: "Fechar",
    signupRequestTitle: "Solicitar acesso",
    signupRequestBody:
      "O acesso à aplicação está sujeito à aprovação de um administrador. Indique o seu email abaixo para que possamos aprovar o seu registo. Receberá um email para definir a sua palavra-passe assim que um administrador aprovar o pedido.",
    signupRequestEmailLabel: "Endereço de email",
    signupRequestSubmit: "Solicitar acesso",
    signupRequestSuccess: "Pedido recebido. Consulte o seu email para os próximos passos assim que um administrador aprovar o seu acesso.",
    signupRequestError: "Ocorreu um erro. Tente novamente mais tarde.",
    profileTitle: "Perfil",
    profileName: "Nome",
    profileCountry: "País",
    profileCountryPlaceholder: "Selecionar país",
    profileTelegramId: "ID de Chat do Telegram",
    profileTelegramHelp: "Obtenha o seu ID através do @userinfobot no Telegram",
    profileTelegramLinkButton: "Ligar com Telegram",
    profileTelegramLinkStep1: "Abra o Telegram e envie uma mensagem ao nosso bot",
    profileTelegramLinkStep2: "Envie este código ao bot",
    profileTelegramLinkExpires: "O código expira em 10 minutos.",
    profileTelegramLinked: "Telegram ligado",
    profileTelegramLinkError: "Não foi possível obter o código. Tente novamente.",
    profileTelegramOrManual: "Ou introduza o seu ID de Chat manualmente (ex.: @userinfobot)",
    profileTelegramUnlink: "Desligar",
    profileShowBalances: "Mostrar saldos das contas",
    profileShowBalancesHelp: "Mostrar saldos das contas na página de transações",
    profileAutoDetection: "Deteção automática de recorrências",
    profileAutoDetectionHelp: "Detetar transações recorrentes e sugerir padrões automaticamente (executado diariamente com armazenamento na nuvem)",
    profileTelegramAlerts: "Alertas Telegram",
    profileTelegramAlertsHelp: "Receber alertas de transações e pagamentos esperados via Telegram",
    profileSlackAlerts: "Alertas Slack",
    profileSlackAlertsHelp: "Receber alertas de transações e pagamentos esperados num canal Slack. Crie um incoming webhook no seu espaço Slack e cole o URL abaixo.",
    profileSlackWebhookUrl: "URL do webhook Slack",
    profileSlackWebhookUrlPlaceholder: "https://hooks.slack.com/services/...",
    profileChannelsSection: "Canais",
    profileAlertsSection: "Alertas",
    profileSlackWebhookHelpPopup: "1. Ir à página da API Slack: Visite https://api.slack.com/apps\n\n2. Criar ou selecionar uma app: Clique em \"Create New App\", escolha \"From scratch\", dê um nome e selecione o seu espaço.\n\n3. Ativar Incoming Webhooks: Nas definições da app, clique em \"Incoming Webhooks\" na barra lateral e ative a opção \"On\".\n\n4. Adicionar webhook ao canal: Clique em \"Add New Webhook to Workspace\" no fundo, selecione o canal onde quer publicar e clique em \"Allow\".\n\n5. Copiar o URL do webhook: O URL do webhook aparecerá — tem o formato https://hooks.slack.com/services/...",
    profileSlackTestButton: "Enviar mensagem de teste",
    profileSlackTestSent: "Mensagem de teste enviada para o Slack.",
    profileSlackTestError: "Falha ao enviar mensagem de teste. Verifique o URL do webhook e tente novamente.",
    profileTabUser: "Utilizador",
    profileTabChannels: "Canais",
    profileTabAlerts: "Alertas",
    profileTabStorage: "Armazenamento",
    profileTabApiTokens: "Tokens de API",
    profileWeeklyEmails: "Emails semanais",
    profileWeeklyEmailsHelp: "Receber o relatório semanal de Análises por email (domingo 08:00 UTC)",
    profileStorageMode: "Armazenamento de dados",
    profileStorageModeCloud: "Sincronização na nuvem",
    profileStorageModeLocal: "Apenas local",
    profileStorageModeCloudHelp: "Os seus dados são sincronizados nos nossos servidores. Atualizações automáticas de movimentos e alertas estão ativas.",
    profileStorageModeLocalHelp: "A atualização automática de movimentos e os alertas periódicos estão desativados. Pode atualizar manualmente quando usar a aplicação.",
    balanceUpdated: "Atualizado",
    balanceUnavailable: "Saldo indisponível",
    refreshBalances: "Atualizar saldos e movimentos",
    refreshingBalances: "A atualizar…",
    profileSave: "Guardar perfil",
    profileSaved: "Perfil atualizado.",
    profileSaveError: "Erro ao atualizar perfil.",
    fetchInProgressMessage: "A importar transações. Não pode adicionar nova conta nem importar mais até terminar.",
    fetchCompleted: "Transações importadas com sucesso.",
    fetchFailed: "Falha ao importar transações.",
    profileEmail: "Email",
    profileStatus: "Estado",
    profileAdmin: "Admin",
    profileNoEmail: "Sem email registado",
    profileApiTokens: "Tokens de API",
    profileApiTokensHelp: "Criar tokens para aceder à API (ex.: scripts). Cada token é mostrado apenas uma vez ao criar.",
    profileApiTokenCreate: "Criar token",
    profileApiTokenName: "Nome do token",
    profileApiTokenNamePlaceholder: "ex. Script ou Integração",
    profileApiTokenLastUsed: "Último uso",
    profileApiTokenNeverUsed: "Nunca",
    profileApiTokenCopy: "Copiar token",
    profileApiTokenCopied: "Copiado",
    profileApiTokenCreatedTitle: "Token criado",
    profileApiTokenCreatedMessage: "Copie este token agora. Não será mostrado novamente.",
    profileApiTokenDelete: "Eliminar",
    profileApiTokenDeleteConfirm: "Eliminar este token? Deixará de funcionar imediatamente.",
    profileApiTokensEmpty: "Ainda não há tokens de API.",
    modalCancel: "Cancelar",
    modalSave: "Guardar",
    modalConfirm: "Confirmar",
    modalDeleteTitle: "Remover utilizador",
    settingsDeleteCategoryTitle: "Eliminar categoria?",
    settingsDeleteTagTitle: "Eliminar etiqueta?",
    confirmDeleteConnection: "Remover ligação ao banco?",
    confirmDeleteAccount: "Eliminar esta conta?",
    confirmDeleteAccountWarning: "A conta e todas as suas transacções serão eliminadas permanentemente. Esta acção não pode ser anulada.",
    adminActions: "Ações",
    inviteEmailSent: "Convite enviado por email.",
    inviteEmailFallback: "Email não enviado. Use o link abaixo.",
    inviteEmailRetry: "Email não enviado. Use \"Enviar convite\" para repetir.",
    inviteLinkLabel: "Link de convite",
    adminSearch: "Pesquisar utilizadores",
    adminRows: "Linhas",
    adminShowing: "A mostrar",
    adminOf: "de",
    adminPrev: "Anterior",
    adminNext: "Seguinte",
    auditViewDetails: "Ver detalhes completos",
    auditDetailsClose: "Fechar",
    adminEmailVerified: "Email confirmado",
    adminTelegramId: "ID Telegram",
    adminEditTelegram: "Editar ID Telegram",
    adminTelegramModalTitle: "Editar ID de Chat do Telegram",
    adminTelegramSave: "Guardar",
    dashboardWelcome: "Resumo das contas",
    dashboardAccountsTitle: "Contas bancárias e cartões",
    dashboardAccountsBody: "Gerir contas para sincronizar transações.",
    dashboardAccountsButton: "Gerir contas",
    dashboardAccountsEmpty: "Sem bancos ligados.",
    dashboardInsightsTitle: "Insights",
    dashboardInsightsBody:
      "Acompanhe receitas e despesas com períodos selecionáveis.",
    dashboardInsightsPeriod: "Período",
    dashboardTransactionsTitle: "Transações recentes",
    dashboardTransactionsBody:
      "Consulte a atividade recente e filtre por banco ou todas as contas.",
    dashboardTransactionsFilter: "Filtro de banco",
    dashboardFilterAll: "Todos os bancos",
    dashboardAccountsTooltip: "Gerir contas",
    dashboardInsightsTooltip: "Ver insights",
    dashboardTransactionsTooltip: "Ver transações",
    transactionsListTitle: "Todas as transações",
    transactionsListEmpty: "Ainda não existem transações.",
    transactionsAmount: "Montante",
    transactionsDate: "Data",
    transactionsAccount: "Conta",
    transactionsSearch: "Pesquisar transações",
    transactionsRows: "Linhas",
    transactionsShowing: "A mostrar",
    transactionsOf: "de",
    transactionsTo: "a",
    transactionsPrev: "Anterior",
    transactionsNext: "Seguinte",
    statusConnected: "Ligado",
    statusLastUpdated: "Atualizado",
    actionReconnect: "Reconectar",
    actionDelete: "Eliminar",
    actionFetchTransactions: "Obter transações",
    actionDeleteAccount: "Eliminar conta",
    transactionsFetching: "A obter transações...",
    transactionsFetched: "Transações obtidas",
    transactionsNoAccounts: "Sem contas disponíveis para este banco.",
    transactionsFailed: "Falha ao obter transações.",
    transactionsLimitReached: "Limite diário de transações atingido.",
    gocardlessRateLimitExceeded: "Limite diário do fornecedor do banco excedido. Tente mais tarde.",
    importStatementTitle: "Importar extrato (PDF)",
    importStatementDrop: "Arraste ficheiros PDF para aqui",
    importStatementSelectFiles: "Selecionar ficheiros",
    importStatementParsing: "A analisar...",
    importStatementAnalyse: "Analisar",
    importStatementParseFailed: "Análise falhou",
    importStatementFileSingular: "ficheiro",
    importStatementFilePlural: "ficheiros",
    importStatementParsed: "analisado",
    importStatementTotalTransactions: "Total de transações",
    importToAccount: "Importar para",
    importSuccess: "Importadas",
    importFailed: "Falha na importação",
    createNewAccount: "Criar nova conta",
    assignToExisting: "Atribuir a conta existente",
    statementBankName: "Nome do banco",
    statementAccountName: "Nome da conta",
    statementDisplayName: "Nome a mostrar",
    statementCountry: "País",
    selectBankForLogo: "Atualizar logo",
    pickBankFromList: "Escolher da lista de bancos",
    accountSourceManual: "Manual",
    accountSourceAutomatic: "Automático",
    importReviewTitle: "Rever transações",
    importReviewBack: "Voltar",
    importReviewImport: "Importar",
    importReviewFlipSign: "Inverter sinal (crédito ↔ débito)",
    importReviewFileLabel: "Ficheiro",
    importReviewInclude: "Incluir na importação",
    importReviewExclude: "Excluir da importação",
    refreshBalancesPartialRateLimit: "Algumas contas não puderam ser atualizadas (limite). Saldos atualizados para as restantes.",
    transactionUpdateError: "Falha ao atualizar a transação.",
    confirmDeleteTransaction: "Eliminar transação?",
    confirmDeleteTransactionWarning: "Esta transação será removida permanentemente. Não pode ser anulada.",
    bookingDate: "Data de registo",
    postingDate: "Data de lançamento",
    postingDateEarlier: "Anterior (data lançamento -1 dia)",
    postingDateLater: "Posterior (data lançamento +1 dia)",
    transactionStatusPending: "Pendente",
    transactionCategory: "Categoria",
    transactionTags: "Etiquetas",
    filterCategoryAll: "Todas",
    filterCategoryNone: "Sem categoria",
    filterCategoryWith: "Com categoria",
    filterCategoryWithout: "Sem categoria",
    exportTransactionsTitle: "Exportar transações",
    exportDates: "Datas",
    exportDatesAll: "Todas as datas",
    exportDatesRange: "Período selecionado",
    exportDateFrom: "De",
    exportDateTo: "Até",
    exportAccounts: "Contas",
    exportAccountsAll: "Todas as contas",
    exportAccountsSelected: "Contas selecionadas",
    exportCategories: "Categorias",
    exportCategoriesAll: "Todas as categorias",
    exportCategoriesSelected: "Categorias selecionadas",
    exportCategoriesEmpty: "Sem categoria",
    exportTags: "Etiquetas",
    exportTagsAll: "Todas as etiquetas",
    exportTagsSelected: "Etiquetas selecionadas",
    exportDownload: "Exportar CSV",
    exportCancel: "Cancelar",
    exportSuccess: "CSV descarregado.",
    exportNumberFormat: "Formato de números",
    exportNumberFormatHelp: "Corresponda à configuração do Excel para os montantes aparecerem corretamente.",
    exportDecimalSeparator: "Decimal",
    exportDecimalPeriod: "Ponto (.)",
    exportDecimalComma: "Vírgula (,)",
    exportThousandsSeparator: "Milhares",
    exportThousandsNone: "Nenhum",
    exportThousandsComma: "Vírgula (,)",
    exportThousandsPeriod: "Ponto (.)",
    settingsTitle: "Definições",
    settingsCategories: "Categorias",
    settingsTags: "Etiquetas",
    settingsAddCategory: "Adicionar categoria",
    settingsAddTag: "Adicionar etiqueta",
    settingsCategoryName: "Nome da categoria",
    settingsTagName: "Nome da etiqueta",
    settingsExport: "Exportar",
    settingsImport: "Importar",
    settingsExportImport: "Exportar / Importar",
    settingsExportSuccess: "Definições exportadas.",
    settingsImportSuccess: "Importação concluída: {created} criados, {skipped} já existiam.",
    settingsImportError: "Falha na importação. Verifique o formato do ficheiro.",
    settingsImportFileInvalid: "O ficheiro deve conter categorias e/ou etiquetas.",
    auditTitle: "Registo de auditoria",
    auditDate: "Data",
    auditUser: "Utilizador",
    auditAction: "Ação",
    auditResource: "Recurso",
    auditDetails: "Detalhes",
    auditFilterAction: "Ação",
    auditFilterAll: "Todas",
    auditResult: "Resultado",
    auditResultSuccess: "Sucesso",
    auditResultFail: "Falha",
    auditResultInfo: "Info",
    audit_action_user_login: "Login",
    audit_action_user_logout: "Logout",
    audit_action_user_create: "Utilizador criado",
    audit_action_user_delete: "Utilizador eliminado",
    audit_action_category_create: "Categoria criada",
    audit_action_category_update: "Categoria atualizada",
    audit_action_category_delete: "Categoria eliminada",
    audit_action_tag_create: "Etiqueta criada",
    audit_action_tag_update: "Etiqueta atualizada",
    audit_action_tag_delete: "Etiqueta eliminada",
    audit_action_account_linked: "Conta ligada",
    audit_action_account_deleted: "Conta eliminada",
    audit_action_account_alerts_updated: "Alertas da conta atualizados",
    audit_action_transactions_fetched: "Transações obtidas",
    audit_action_transaction_edited: "Transação editada",
    transactionsIncludeInTotals: "Incluir nos totais",
    actionUpdateAccountName: "Atualizar nome da conta",
    accountAlertsTitle: "Limiares de alerta",
    accountAlertAbove: "Alerta acima (€)",
    accountAlertBelow: "Alerta abaixo (€)",
    actionEditAlerts: "Editar limiares de alerta",
    actionReconnectBank: "Voltar a ligar banco",
    actionReauthRequired: "Reautenticação necessária – volte a ligar esta conta",
    accountTransactionAlerts: "Alertas de transação esperada",
    transactionsFilterAll: "Todas",
    transactionsFilterNewOnly: "Só novas",
    transactionNew: "Nova",
    transactionClearNew: "Marcar como revistas",
    transactionComment: "Comentário",
    transactionCommentAdd: "Adicionar comentário",
    transactionCommentPlaceholder: "Adicione um comentário...",
    createAlertFromTransaction: "Recorrente",
    createAlertTitle: "Configurar transação recorrente",
    createAlertDayToleranceBefore: "Tolerância dia antes",
    createAlertDayToleranceAfter: "Tolerância dia depois",
    createAlertValueToleranceBelow: "Tolerância valor abaixo",
    createAlertValueToleranceAbove: "Tolerância valor acima",
    alertTemplateDescription: "Descrição",
    alertTemplateDay: "Dia",
    alertTemplateDayTolerance: "({before} antes / {after} depois)",
    alertTemplateDays: "dias",
    alertTemplateAmount: "Valor",
    alertTemplateEdit: "Editar",
    alertTemplateDelete: "Eliminar",
    alertCreated: "Alerta criado.",
    alertDeleted: "Alerta eliminado.",
    alertCreateError: "Falha ao criar alerta.",
    audit_action_alert_created: "Alerta criado",
    audit_action_alert_deleted: "Alerta eliminado",
    audit_action_gocardless_rate_limit: "Limite GoCardless (429)",
    audit_action_transaction_fetch_limit_reached: "Limite diário de importação atingido",
    audit_action_transactions_fetch_scheduled: "Importação agendada de transações",
    audit_action_weekly_send_report: "Relatório semanal enviado",
    audit_action_statement_parsed: "Extrato analisado (PDF)",
    audit_action_transactions_imported_from_pdf: "Transações importadas de PDF",
    audit_action_manual_account_created: "Conta manual criada",
    audit_action_account_logo_updated: "Logo da conta atualizado",
    audit_action_daily_missing_transaction_alerts: "Alertas diários de transação em falta enviados",
    audit_action_get_account_transactions: "Transações da conta obtidas do banco",
    audit_action_list_institutions: "Lista de instituições consultada",
    audit_action_create_requisition: "Pedido de ligação ao banco criado",
    audit_action_get_requisition: "Estado da ligação consultado",
    audit_action_get_account_details: "Dados da conta obtidos",
    accountTransactionAlertsEmpty: "Sem alertas de transação esperada. Crie um a partir de uma transação (ícone de sino na lista).",
    helpTitle: "Ajuda",
    helpClose: "Fechar",
    helpTransactionsTitle: "Ajuda: Transações",
    helpTransactionsIntro: "Esta ecrã lista as suas transações. Use os filtros para refinar. Abaixo, o que faz cada elemento.",
    helpTxSearch: "Pesquisar",
    helpTxSearchDesc: "Filtrar por descrição da transação ou nome da conta.",
    helpTxRows: "Linhas por página",
    helpTxRowsDesc: "Escolha quantas transações mostrar por página (10, 20, 50).",
    helpTxFilterAll: "Todas / Só novas",
    helpTxFilterAllDesc: "Mostrar todas as transações ou só as marcadas como novas (não revistas).",
    helpTxCategoryFilter: "Filtro de categoria",
    helpTxCategoryFilterDesc: "Filtrar por uma ou mais categorias. Use Todas ou Sem categoria para seleção rápida.",
    helpTxTagFilter: "Filtro de etiquetas",
    helpTxTagFilterDesc: "Filtrar por etiquetas; opcionalmente incluir transações sem etiqueta.",
    helpTxExport: "Exportar CSV",
    helpTxExportDesc: "Descarregar transações em ficheiro CSV para Excel.",
    helpTxCategorySelect: "Categoria (por linha)",
    helpTxCategorySelectDesc: "Atribuir ou alterar a categoria desta transação.",
    helpTxAlertIcon: "Recorrente",
    helpTxAlertIconDesc: "Configurar uma transação recorrente para ser notificado quando ocorrer ou quando faltar (ex.: pagamento mensal).",
    helpTxCommentIcon: "Comentário",
    helpTxCommentIconDesc: "Adicionar ou editar uma nota para esta transação.",
    helpTxDeleteIcon: "Eliminar",
    helpTxDeleteIconDesc: "Remover esta transação permanentemente.",
    helpTxTags: "Etiquetas",
    helpTxTagsDesc: "Atribuir ou alterar etiquetas desta transação.",
    helpTxNewBadge: "Nova",
    helpTxNewBadgeDesc: "Transação importada recentemente. Clique no × para marcar como revista.",
    helpTxIncludeInInsights: "Incluir em Análises (caixa de verificação)",
    helpTxIncludeInInsightsDesc: "Marque para incluir esta transação nas Análises (gráficos e totais); desmarque para excluir.",
    helpTxPostingDateArrows: "Data de lançamento (setas cima/baixo)",
    helpTxPostingDateArrowsDesc: "Seta para cima: adiar a data de lançamento um dia. Seta para baixo: antecipar um dia.",
    helpTxPaginationArrows: "Página anterior / seguinte",
    helpTxPaginationArrowsDesc: "Seta esquerda: página anterior da lista. Seta direita: página seguinte.",
    helpAccountTypeIcon: "Ícone do tipo de conta (ao lado do logo)",
    helpAccountTypeIconDesc: "Ícone de documento = conta manual (transações importadas ex.: via PDF). Ícone de ligação = conta automática (ligada ao banco, sincroniza saldos e transações).",
    helpAccountsTitle: "Ajuda: Contas",
    helpAccountsIntro: "Gerir as suas contas bancárias e de cartão. Ligar novas contas ou gerir as existentes.",
    helpAccountLinkBank: "Ligar um banco",
    helpAccountLinkBankDesc: "Iniciar o processo para ligar uma conta bancária ou de cartão através do fornecedor seguro.",
    helpAccountLinkedList: "Contas ligadas",
    helpAccountLinkedListDesc: "Contas que tem configuradas.",
    helpAccountRefresh: "Atualizar saldos",
    helpAccountRefreshDesc: "Atualizar saldos e obter novas transações do banco.",
    helpAccountFetch: "Obter transações",
    helpAccountFetchDesc: "Disparar manualmente a importação de transações desta ligação.",
    helpAccountAlerts: "Alertas da conta",
    helpAccountAlertsDesc: "Ver ou editar alertas configurados para a conta.",
    helpAccountDelete: "Eliminar conta",
    helpAccountDeleteDesc: "Eliminar a conta (e todas as suas transações).",
    helpAccountReconnect: "Religar",
    helpAccountReconnectDesc: "Reautenticar quando a ligação ao banco expirou (ex.: a cada 90 dias).",
    helpInsightsTitle: "Ajuda: Análises",
    helpInsightsIntro: "Ver receitas, despesas e tendências por período. Guarde configurações para reutilizar filtros.",
    helpInsightsPeriod: "Período",
    helpInsightsPeriodDesc: "Selecionar o intervalo para os gráficos (mês atual, último mês, ano, últimos 12 meses ou personalizado).",
    helpInsightsConfigs: "Configurações guardadas",
    helpInsightsConfigsDesc: "Guardar e carregar configurações de filtros (período, contas, categorias, etiquetas).",
    helpInsightsCards: "Cartões",
    helpInsightsCardsDesc: "Recebidos, pagos, por categoria, totais, histórico de saldo. Expandir ou recolher cada cartão.",
    helpProfileTitle: "Ajuda: Perfil",
    helpProfileIntro: "As suas definições e preferências para alertas e visualização.",
    helpProfileName: "Nome",
    helpProfileNameDesc: "O seu nome como aparece na aplicação.",
    helpProfileCountry: "País",
    helpProfileCountryDesc: "Usado para formato de data e número.",
    helpProfileTelegram: "ID de Chat do Telegram",
    helpProfileTelegramDesc: "Ligar o Telegram para receber alertas de transações e pagamentos esperados.",
    helpProfileShowBalances: "Mostrar saldos das contas",
    helpProfileShowBalancesDesc: "Mostrar ou ocultar saldo na página de transações.",
    helpProfileTelegramAlerts: "Alertas Telegram",
    helpProfileTelegramAlertsDesc: "Ativar ou desativar notificações por Telegram.",
    helpProfileWeeklyEmails: "Emails semanais",
    helpProfileWeeklyEmailsDesc: "Receber o relatório semanal de Análises por email.",
    onboardingTitle: "Lista de Bancos disponíveis",
    onboardingBody: "Escolha o banco que quer acrescentar",
    onboardingCta: "Concluir onboarding",
    onboardingCountry: "País",
    onboardingSearch: "Pesquisar bancos",
    onboardingSelectBank: "Selecionar banco",
    onboardingAddAccount: "Adicionar conta",
    onboardingConnectBank: "Ligar banco",
    onboardingCompleting: "A redirecionar para o banco...",
    onboardingFriendlyNameSave: "Guardar nome da conta",
    onboardingAccountsTitle: "Contas ligadas",
    onboardingRequired: "Adicione pelo menos uma conta.",
    notAuthorizedTitle: "Acesso negado",
    notAuthorizedBody:
      "Este utilizador ainda não está autorizado. Contacte o administrador.",
    accessDeniedTitle: "Entrada não permitida",
    accessDeniedBody:
      "O seu login foi recusado pela verificação de acesso da aplicação. Se acabou de ser criado por um administrador, a verificação pode estar a usar outro servidor (ex.: produção). Peça ao administrador para confirmar que a sua conta existe nesse ambiente ou para apontar a allowlist para este (ex.: túnel em desenvolvimento local).",
    accessDeniedTryAgain: "Voltar ao início",
    serverErrorTitle: "Serviço temporariamente indisponível",
    serverErrorBody:
      "Não foi possível contactar o servidor. Não é um problema de autorização. Tente novamente dentro de minutos ou contacte o administrador se persistir.",
    navTransactions: "Transações",
    navAccounts: "Contas",
    navInsights: "Análises",
    navRecurring: "Recorrentes",
    recurringTitle: "Transações recorrentes",
    recurringSubtitle: "Gerir pagamentos recorrentes. Execute a deteção para sugerir padrões a partir do histórico.",
    recurringInitialOfferTitle: "Encontrar padrões recorrentes",
    recurringInitialOfferBody: "Podemos analisar os últimos 12 meses de transações para sugerir pagamentos recorrentes (subscrições, renda, utilities). Opcional; o processamento é feito nos nossos servidores.",
    recurringInitialOfferAnalyze: "Analisar as minhas transações",
    recurringInitialOfferSkip: "Agora não",
    recurringEmptyGuidance: "Crie um padrão manualmente a partir de uma transação (ex.: Netflix, renda, contas) ou execute a deteção acima. Mais histórico ajuda.",
    recurringFindSuggestions: "Encontrar sugestões",
    recurringFinding: "A analisar…",
    recurringNoSuggestions: "Nenhuma sugestão nova.",
    recurringReviewSuggestions: "Rever sugestões",
    recurringSuggestionsCount: "{n} sugestão(ões) por rever",
    recurringConfirm: "Confirmar",
    recurringDismiss: "Rejeitar",
    recurringSkip: "Saltar",
    recurringEditThenConfirm: "Editar e confirmar",
    recurringProgressOf: "{i} de {n}",
    filterAccount: "Conta",
    filterAccountAll: "Todas",
    filterStatus: "Estado",
    filterStatusAll: "Todos",
    filterStatusActive: "Ativo",
    filterStatusPaused: "Pausado",
    filterStatusSuggested: "Sugerido",
    sortBy: "Ordenar por",
    sortNextDate: "Próxima data",
    sortName: "Nome",
    sortFrequency: "Frequência",
    sortAmount: "Valor",
    sortConfidence: "Confiança",
    searchPlaceholder: "Pesquisar por nome…",
    recurringEmpty: "Sem transações recorrentes. Adicione a partir de uma transação ou execute a deteção.",
    recurringNext: "Próxima",
    recurringAmount: "Valor",
    recurringAmountVaries: "Variável",
    recurringFrequency: "Frequência",
    recurringFrequencyWeekly: "Semanal",
    recurringFrequencyBiweekly: "Quinzenal",
    recurringFrequencyMonthly: "Mensal",
    recurringFrequencyQuarterly: "Trimestral",
    recurringFrequencyYearly: "Anual",
    recurringStatusActive: "Ativo",
    recurringStatusPaused: "Pausado",
    recurringStatusSuggested: "Sugerido",
    recurringStatusDismissed: "Rejeitado",
    recurringStatusArchived: "Arquivado",
    recurringCreateManual: "Adicionar recorrente",
    recurringEdit: "Editar",
    recurringPause: "Pausar",
    recurringResume: "Retomar",
    recurringDelete: "Eliminar",
    recurringViewList: "Lista",
    recurringViewCalendar: "Calendário",
    calendarToday: "Hoje",
    calendarMonthTitle: "Mês",
    calendarSummaryTransactions: "{n} transação(ões) esperada(s)",
    calendarSummaryAmount: "Total",
    calendarUpcoming: "Próximos",
    countdownToday: "Hoje",
    countdownTomorrow: "Amanhã",
    countdownInNDays: "Em {n} dias",
    countdownDaysAgo: "Há {n} dias",
    detailName: "Nome",
    detailDescriptionPattern: "Padrão da descrição",
    detailFrequency: "Frequência",
    detailInterval: "Intervalo",
    detailAnchorDay: "Dia âncora",
    detailDayTolerance: "Tolerância dia (± dias)",
    detailExpectedAmount: "Valor esperado",
    detailNominalAmount: "Valor nominal (para totais)",
    detailAmountTolerance: "Tolerância valor (±)",
    detailAlertOnOccurrence: "Avisar quando ocorrer",
    detailAlertOnMissing: "Avisar quando faltar",
    detailMissingGraceDays: "Dias de tolerância (falta)",
    createRecurringTitle: "Adicionar transação recorrente",
    createRecurringSuccess: "Transação recorrente criada.",
    createRecurringError: "Ocorreu um erro.",
    deleteConfirm: "Remover esta transação recorrente?",
    deleteSuccess: "Removido.",
    confirmSuccess: "Sugestão confirmada.",
    confirmOnlySuggestedError: "Só sugestões podem ser confirmadas. Este item pode ter sido rejeitado.",
    dismissSuccess: "Sugestão rejeitada.",
    incomeVsExpenses: "Receitas vs Despesas",
    monthlyTrend: "Tendência Mensal",
    topCategories: "Principais Categorias",
    period: "Período",
    days: "dias",
    year: "ano",
    insightsPeriod: "Período",
    insightsAccounts: "Contas",
    insightsTags: "Etiquetas",
    insightsCategories: "Categorias",
    insightsPeriodCurrentMonth: "Mês atual",
    insightsPeriodLastMonth: "Mês anterior",
    insightsPeriodYtd: "Desde início do ano",
    insightsPeriodLast12Months: "Últimos 12 meses",
    insightsPeriodCustom: "Personalizado",
    insightsDateFrom: "De",
    insightsDateTo: "Até",
    insightsAllAccounts: "Todas",
    insightsAllTags: "Todas",
    insightsAllCategories: "Todas",
    insightsNoCategory: "Sem categoria",
    insightsNoTag: "Sem etiqueta",
    insightsSaveConfig: "Guardar configuração",
    insightsLoadConfig: "Carregar configuração",
    insightsSetDefault: "Definir como predefinida",
    insightsConfigName: "Nome da configuração",
    insightsConfigNamePlaceholder: "ex.: Análise mensal",
    insightsSaveAsDefault: "Definir como predefinida",
    insightsSaved: "Configuração guardada.",
    insightsLoadConfigTitle: "Carregar configuração",
    insightsNoConfigs: "Sem configurações guardadas.",
    insightsDeleteConfig: "Eliminar configuração",
    insightsDeleteConfigConfirm: "Eliminar esta configuração?",
    insightsConfigDeleted: "Configuração eliminada.",
    insightsExportPdf: "Exportar PDF",
    insightsCardReceived: "Lista de valores recebidos",
    insightsReceivedListTotal: "Total",
    insightsCardPaid: "Lista de valores pagos",
    insightsShowMax: "Mostrar",
    insightsShowAll: "Todas",
    insightsCardByCategory: "Total por categoria",
    insightsCardTotals: "Total recebido, pago e diferença",
    insightsCardBalanceHistory: "Histórico de saldo",
    insightsCardBalanceAccumulated: "Saldo acumulado",
    insightsCardBalanceComparison: "Comparação de saldo (mês a mês)",
    insightsAccount: "Conta",
    insightsNavigateToTop: "Ir para o topo",
    insightsTotalReceived: "Total recebido",
    insightsTotalPaid: "Total pago",
    insightsDifference: "Diferença",
    insightsDate: "Data",
    insightsDescription: "Descrição",
    insightsAmount: "Montante",
    insightsCategory: "Categoria",
    insightsEmpty: "Sem dados para os filtros selecionados.",
    insightsMonth: "Mês",
    insightsBalance: "Saldo",
    insightsComment: "Comentário",
    myProfile: "O meu perfil",
    userManagement: "Gestão de utilizadores",
    settings: "Definições",
    audit: "Auditoria",
  },
  es: {
    skipToMain: "Saltar al contenido principal",
    navFeatures: "Funciones",
    toggleDarkMode: "Alternar modo oscuro",
    openMenu: "Abrir menú",
    login: "Iniciar sesión",
    logout: "Cerrar sesión",
    heroEyebrow: "Privacidad primero · Pan-Europeo",
    heroTitle: "Una app para todas tus cuentas bancarias. Tus datos siguen siendo tuyos.",
    heroBody:
      "Conecta bancos y tarjetas en toda Europa. Nunca vemos ni vendemos tus datos bancarios—se almacenan solo para tu acceso, cifrados, con proveedores de nivel bancario. Servidores en Alemania. Cliente en código abierto que puedes inspeccionar en GitHub.",
    heroAlerts: "Alertas periódicos por Telegram y Slack. Análisis semanales por email.",
    heroPrimaryCta: "Empezar",
    heroSecondaryCta: "Ver roadmap",
    privacyHighlightsTitle: "Privacidad por diseño",
    privacyHighlight1: "Tus datos bancarios nunca son vistos ni vendidos por nosotros. Se almacenan con acceso solo del usuario.",
    privacyHighlight2: "Los datos bancarios se almacenan cifrados.",
    privacyHighlight3: "Los proveedores de información bancaria son empresas certificadas ISO 27000.",
    privacyHighlight4: "Las credenciales de autenticación bancaria no se almacenan ni procesan en nuestros servidores.",
    privacyHighlight5: "Los servidores de la aplicación están en Europa (Alemania).",
    privacyHighlight6: "El código cliente de la app es open-source en GitHub y puede ser inspeccionado por todos.",
    landingStorageTitle: "Tus datos, tu elección",
    landingStorageSubtitle: "Elige sincronización en la nube (por defecto) o solo local. Puedes cambiarlo en tu perfil cuando quieras.",
    landingStorageCloudTitle: "Sincronización en la nube",
    landingStorageCloudBody: "Datos sincronizados en nuestros servidores. Actualizaciones automáticas de transacciones y alertas activas.",
    landingStorageLocalTitle: "Solo local",
    landingStorageLocalBody: "Sin sincronización automática ni alertas periódicas. Actualiza manualmente al usar la aplicación.",
    dashboardTitle: "Paneles diarios",
    dashboardBody:
      "Visualiza ingresos, gastos y metas de ahorro con categorización asistida por IA y alertas inteligentes.",
    totalIncome: "Ingresos totales",
    expenses: "Gastos",
    featureAccountsTitle: "Cuentas unificadas",
    featureAccountsBody:
      "Conecte todos sus bancos y tarjetas con reautenticación segura. Transacciones actualizadas automáticamente, dos veces al día.",
    featureCategoriesTitle: "Categorías inteligentes",
    featureCategoriesBody:
      "Asigne una categoría a cada transacción.\nSugerencias de categorías por IA. Aprendizaje con el tiempo.\nMúltiples etiquetas por transacción.",
    featureInsightsTitle: "Insights claros",
    featureInsightsBody:
      "Gráficos interactivos destacan tendencias por período y cuenta.",
    featureInsightsBodyBullets:
      "Gráficos interactivos destacan tendencias por período y cuenta.",
    landingFeaturesSectionTitle: "Funcionalidades",
    featureCalendarTitle: "Vista de calendario",
    landingFeaturesCategoriesAndTagsTitle: "Categorías y etiquetas",
    landingFeaturesAnalysisTitle: "Análisis",
    featureBancosTitle: "Bancos",
    featureTagsBody:
      "Asigne varias etiquetas por transacción para filtrar e informar. Use etiquetas para asociar transacciones con usuarios. Use etiquetas para distinguir entre transacciones personales o de empresa, por ejemplo.",
    featureCalendarBody: "Vea las transacciones recurrentes futuras en modo calendario.",
    featureNewBadge: "Nuevo",
    footerCopyright: "© 2026 eurodata.app",
    footerPrivacy: "Política de Privacidad",
    footerGithub: "GitHub",
    footerLinkedin: "LinkedIn",
    footerTwitter: "Twitter",
    mobileMenu: "Menú móvil",
    adminTitle: "Gestión de usuarios",
    adminCreate: "Crear usuario",
    adminName: "Nombre visible",
    adminPrimaryEmail: "Email principal",
    adminIsAdmin: "Usuario admin",
    adminCreateButton: "Crear usuario",
    adminStatusActive: "Activo",
    adminStatusInactive: "Inactivo",
    adminMakeAdmin: "Hacer admin",
    adminRemoveAdmin: "Quitar admin",
    adminDeactivate: "Desactivar",
    adminActivate: "Activar",
    adminInvite: "Enviar invitación",
    adminAddEmail: "Añadir email",
    adminDeleteUser: "Eliminar usuario",
    adminEmails: "Emails",
    menuProfile: "Mi perfil",
    menuUsers: "Usuarios",
    menuAdminDashboard: "Panel de administración",
    menuSettings: "Ajustes",
    menuAudit: "Auditoría",
    menuLogin: "Iniciar sesión",
    menuLogout: "Cerrar sesión",
    menuAbout: "Acerca de",
    aboutAppName: "Bancos",
    aboutDescription: "Centralice sus cuentas bancarias y de tarjetas, automatice la categorización de transacciones y siga los patrones de gasto en varias monedas.",
    aboutCopyright: "© 2026 eurodata.app",
    aboutSupport: "Soporte",
    aboutChangelog: "Ver registro de cambios",
    aboutClose: "Cerrar",
    metricsTitle: "Panel de administración",
    metricsUsers: "Usuarios",
    metricsBanking: "Banca",
    metricsRecurring: "Transacciones recurrentes",
    metricsEngagement: "Participación",
    metricsTotalUsers: "Total de usuarios",
    metricsActiveUsers7d: "Usuarios activos (7 días)",
    metricsActiveUsers30d: "Usuarios activos (30 días)",
    metricsOnboardingCompleted: "Onboarding completado",
    metricsUsersWithAccount: "Usuarios con al menos una cuenta",
    metricsTotalAccounts: "Total de cuentas bancarias",
    metricsTotalConnections: "Total de conexiones bancarias",
    metricsTotalTransactions: "Total de transacciones",
    metricsAvgAccountsPerUser: "Media de cuentas por usuario",
    metricsAvgTransactionsPerUser: "Media de transacciones por usuario",
    metricsTotalPatterns: "Total de patrones recurrentes",
    metricsPatternsActive: "Patrones (activos)",
    metricsPatternsSuggested: "Patrones (sugeridos)",
    metricsPatternsPaused: "Patrones (pausados)",
    metricsPatternsAutoDetected: "Auto-detectados",
    metricsPatternsManual: "Manuales",
    metricsPatternsMigrated: "Migrados",
    metricsUsersWithPatterns: "Usuarios con patrones",
    metricsAvgPatternsPerUser: "Media de patrones por usuario (con patrones)",
    metricsOccurrencesMatched: "Ocurrencias emparejadas",
    metricsTelegramEnabled: "Usuarios con alertas Telegram",
    metricsWeeklyEmailsEnabled: "Usuarios con correos semanales",
    metricsLoading: "Cargando métricas…",
    metricsError: "Error al cargar métricas",
    privacyTitle: "Política de Privacidad",
    privacyBack: "Volver",
    privacyLastUpdated: "Última actualización: febrero de 2026",
    privacyIntro:
      "eurodata.app (\"nosotros\", \"nuestro\" o \"la aplicación\") se compromete a proteger su privacidad. No vendemos, alquilamos ni compartimos su información personal con terceros con fines publicitarios ni de ningún otro tipo. Esta política describe qué datos tratamos y sus derechos.",
    privacySection1Title: "1. Quiénes somos",
    privacySection1Content:
      "Esta política de privacidad se aplica a la aplicación web eurodata.app (Bancos), que ofrece seguimiento de extractos bancarios y de tarjetas. El servicio está dirigido a usuarios en Europa.",
    privacySection2Title: "2. Datos que recogemos",
    privacySection2Content:
      "Solo recogemos y tratamos los datos necesarios para el servicio: información de la cuenta que configure (p. ej. nombre, país, preferencias de notificación), datos de autenticación gestionados por Auth0 (p. ej. correo, inicio de sesión) y datos de transacciones bancarias que vincule mediante open banking (Nordigen/GoCardless) únicamente para mostrar y categorizar sus transacciones. No recogemos ni almacenamos datos para publicidad o análisis que le identifiquen.",
    privacySection3Title: "3. Cómo usamos sus datos",
    privacySection3Content:
      "Usamos sus datos exclusivamente para el funcionamiento de la aplicación: autenticación, obtención y visualización de transacciones, categorización asistida por IA según sus categorías y envío de alertas opcionales (p. ej. Telegram, correo semanal) si las ha activado. No usamos su información para marketing ni compartimos ni vendemos sus datos personales o financieros a terceros.",
    privacySection4Title: "4. Conservación de datos",
    privacySection4Content:
      "Conservamos sus datos solo mientras su cuenta esté activa y el tiempo necesario para prestar el servicio y cumplir obligaciones legales. Si cierra su cuenta o solicita la eliminación, eliminaremos o anonimizaremos sus datos personales y de transacciones según nuestros procedimientos.",
    privacySection5Title: "5. Cookies y tecnologías similares",
    privacySection5Content:
      "Utilizamos cookies y almacenamiento local estrictamente necesarios para la sesión y la autenticación (p. ej. Auth0). No utilizamos cookies ni tecnologías similares para publicidad o seguimiento entre sitios. Puede controlar las cookies en la configuración del navegador.",
    privacySection6Title: "6. Servicios de terceros",
    privacySection6Content:
      "Utilizamos Auth0 para autenticación y proveedores de open banking (p. ej. GoCardless/Nordigen) para obtener sus datos bancarios con su consentimiento. Estos proveedores tratan los datos según sus propias políticas de privacidad. No cedemos sus datos a otros terceros para su marketing u otros fines.",
    privacySection7Title: "7. Sus derechos",
    privacySection7Content:
      "Según su ubicación (incluido el RGPD si está en el Espacio Económico Europeo), puede tener derecho a acceder, rectificar, exportar o eliminar sus datos personales, a oponerse o limitar cierto tratamiento y a presentar una reclamación ante una autoridad de control. Para ejercer estos derechos, contacte con nosotros mediante los datos indicados más abajo.",
    privacySection8Title: "8. Cambios en esta política",
    privacySection8Content:
      "Podemos actualizar esta política de privacidad. La versión actualizada se publicará en esta página con la fecha de última actualización. El uso continuado del servicio tras los cambios constituye la aceptación de la política revisada.",
    privacyContactTitle: "Contacto",
    privacyContactIntro:
      "Para cualquier consulta sobre esta política de privacidad o sus datos personales, contacte con nosotros en la dirección de soporte o contacto indicada en la aplicación o en eurodata.app.",
    registerModalTitle: "Solicitar acceso",
    registerWithEmail: "Registrarse con email",
    registerWithGoogle: "Continuar con Google",
    registerModalClose: "Cerrar",
    signupRequestTitle: "Solicitar acceso",
    signupRequestBody:
      "El acceso a la aplicación está sujeto a la aprobación de un administrador. Indique su dirección de correo para que podamos aprobar su registro. Recibirá un correo para establecer su contraseña cuando un administrador apruebe su solicitud.",
    signupRequestEmailLabel: "Dirección de correo",
    signupRequestSubmit: "Solicitar acceso",
    signupRequestSuccess: "Solicitud recibida. Consulte su correo para los próximos pasos cuando un administrador apruebe su acceso.",
    signupRequestError: "Ha ocurrido un error. Inténtelo de nuevo más tarde.",
    profileTitle: "Perfil",
    profileName: "Nombre",
    profileCountry: "País",
    profileCountryPlaceholder: "Seleccionar país",
    profileTelegramId: "ID de Chat de Telegram",
    profileTelegramHelp: "Obtenga su ID desde @userinfobot en Telegram",
    profileTelegramLinkButton: "Vincular con Telegram",
    profileTelegramLinkStep1: "Abra Telegram y envíe un mensaje a nuestro bot",
    profileTelegramLinkStep2: "Envíe este código al bot",
    profileTelegramLinkExpires: "El código caduca en 10 minutos.",
    profileTelegramLinked: "Telegram vinculado",
    profileTelegramLinkError: "No se pudo obtener el código. Inténtelo de nuevo.",
    profileTelegramOrManual: "O introduzca su ID de Chat manualmente (ej. desde @userinfobot)",
    profileTelegramUnlink: "Desvincular",
    profileShowBalances: "Mostrar saldos de cuentas",
    profileShowBalancesHelp: "Mostrar saldos de cuentas en la página de transacciones",
    profileAutoDetection: "Detección automática de recurrentes",
    profileAutoDetectionHelp: "Detectar transacciones recurrentes y sugerir patrones automáticamente (se ejecuta diariamente con almacenamiento en la nube)",
    profileTelegramAlerts: "Alertas de Telegram",
    profileTelegramAlertsHelp: "Recibir alertas de transacciones y pagos esperados por Telegram",
    profileSlackAlerts: "Alertas Slack",
    profileSlackAlertsHelp: "Recibir alertas de transacciones y pagos esperados en un canal de Slack. Cree un incoming webhook en su espacio de Slack y pegue la URL abajo.",
    profileSlackWebhookUrl: "URL del webhook de Slack",
    profileSlackWebhookUrlPlaceholder: "https://hooks.slack.com/services/...",
    profileChannelsSection: "Canales",
    profileAlertsSection: "Alertas",
    profileSlackWebhookHelpPopup: "1. Ir a la página de la API de Slack: Visite https://api.slack.com/apps\n\n2. Crear o seleccionar una app: Haga clic en \"Create New App\", elija \"From scratch\", póngale nombre y seleccione su espacio.\n\n3. Activar Incoming Webhooks: En la configuración de la app, haga clic en \"Incoming Webhooks\" en la barra lateral y active la opción \"On\".\n\n4. Añadir webhook al canal: Haga clic en \"Add New Webhook to Workspace\" al final, seleccione el canal donde quiere publicar y haga clic en \"Allow\".\n\n5. Copiar la URL del webhook: Verá la URL del webhook — tiene el formato https://hooks.slack.com/services/...",
    profileSlackTestButton: "Enviar mensaje de prueba",
    profileSlackTestSent: "Mensaje de prueba enviado a Slack.",
    profileSlackTestError: "Error al enviar mensaje de prueba. Compruebe la URL del webhook e inténtelo de nuevo.",
    profileTabUser: "Usuario",
    profileTabChannels: "Canales",
    profileTabAlerts: "Alertas",
    profileTabStorage: "Almacenamiento",
    profileTabApiTokens: "Tokens de API",
    profileWeeklyEmails: "Emails semanales",
    profileWeeklyEmailsHelp: "Recibir el informe semanal de Análisis por email (domingo 08:00 UTC)",
    profileStorageMode: "Almacenamiento de datos",
    profileStorageModeCloud: "Sincronización en la nube",
    profileStorageModeLocal: "Solo local",
    profileStorageModeCloudHelp: "Sus datos se sincronizan en nuestros servidores. Las actualizaciones automáticas de transacciones y alertas están activas.",
    profileStorageModeLocalHelp: "La actualización automática de transacciones y las alertas periódicas están desactivadas. Puede actualizar manualmente al usar la aplicación.",
    balanceUpdated: "Actualizado",
    balanceUnavailable: "Saldo no disponible",
    refreshBalances: "Actualizar saldos y movimientos",
    refreshingBalances: "Actualizando…",
    profileSave: "Guardar perfil",
    profileSaved: "Perfil actualizado.",
    profileSaveError: "Error al actualizar perfil.",
    fetchInProgressMessage: "Importando transacciones. No puede añadir otra cuenta ni importar más hasta que termine.",
    fetchCompleted: "Transacciones importadas correctamente.",
    fetchFailed: "Error al importar transacciones.",
    profileEmail: "Email",
    profileStatus: "Estado",
    profileAdmin: "Admin",
    profileNoEmail: "Sin email registrado",
    profileApiTokens: "Tokens de API",
    profileApiTokensHelp: "Crear tokens para acceder a la API (ej. scripts). Cada token se muestra solo una vez al crearlo.",
    profileApiTokenCreate: "Crear token",
    profileApiTokenName: "Nombre del token",
    profileApiTokenNamePlaceholder: "ej. Script o Integración",
    profileApiTokenLastUsed: "Último uso",
    profileApiTokenNeverUsed: "Nunca",
    profileApiTokenCopy: "Copiar token",
    profileApiTokenCopied: "Copiado",
    profileApiTokenCreatedTitle: "Token creado",
    profileApiTokenCreatedMessage: "Copie este token ahora. No se mostrará de nuevo.",
    profileApiTokenDelete: "Eliminar",
    profileApiTokenDeleteConfirm: "¿Eliminar este token? Dejará de funcionar de inmediato.",
    profileApiTokensEmpty: "Aún no hay tokens de API.",
    modalCancel: "Cancelar",
    modalSave: "Guardar",
    modalConfirm: "Confirmar",
    modalDeleteTitle: "Eliminar usuario",
    settingsDeleteCategoryTitle: "¿Eliminar categoría?",
    settingsDeleteTagTitle: "¿Eliminar etiqueta?",
    confirmDeleteConnection: "Eliminar conexión bancaria?",
    confirmDeleteAccount: "¿Eliminar esta cuenta?",
    confirmDeleteAccountWarning: "Se eliminará la cuenta y todas sus transacciones de forma permanente. Esta acción no se puede deshacer.",
    adminActions: "Acciones",
    inviteEmailSent: "Invitación enviada por email.",
    inviteEmailFallback: "Email no enviado. Usa el enlace abajo.",
    inviteEmailRetry: "Email no enviado. Usa \"Enviar invitación\" para reintentar.",
    inviteLinkLabel: "Enlace de invitación",
    adminSearch: "Buscar usuarios",
    adminRows: "Filas",
    adminShowing: "Mostrando",
    adminOf: "de",
    adminPrev: "Anterior",
    adminNext: "Siguiente",
    auditViewDetails: "Ver detalles completos",
    auditDetailsClose: "Cerrar",
    adminEmailVerified: "Email verificado",
    adminTelegramId: "ID Telegram",
    adminEditTelegram: "Editar ID Telegram",
    adminTelegramModalTitle: "Editar ID de Chat de Telegram",
    adminTelegramSave: "Guardar",
    dashboardWelcome: "Resumen de cuentas",
    dashboardAccountsTitle: "Cuentas bancarias y tarjetas",
    dashboardAccountsBody: "Gestionar cuentas para sincronizar transacciones.",
    dashboardAccountsButton: "Gestionar cuentas",
    dashboardAccountsEmpty: "Sin bancos vinculados.",
    dashboardInsightsTitle: "Insights",
    dashboardInsightsBody:
      "Controla ingresos y gastos con periodos seleccionables.",
    dashboardInsightsPeriod: "Periodo",
    dashboardTransactionsTitle: "Transacciones recientes",
    dashboardTransactionsBody:
      "Revisa la actividad reciente y filtra por banco o todas las cuentas.",
    dashboardTransactionsFilter: "Filtro de banco",
    dashboardFilterAll: "Todos los bancos",
    dashboardAccountsTooltip: "Gestionar cuentas",
    dashboardInsightsTooltip: "Ver insights",
    dashboardTransactionsTooltip: "Ver transacciones",
    transactionsListTitle: "Todas las transacciones",
    transactionsListEmpty: "Aún no hay transacciones.",
    transactionsAmount: "Importe",
    transactionsDate: "Fecha",
    transactionsAccount: "Cuenta",
    transactionsSearch: "Buscar transacciones",
    transactionsRows: "Filas",
    transactionsShowing: "Mostrando",
    transactionsOf: "de",
    transactionsTo: "a",
    transactionsPrev: "Anterior",
    transactionsNext: "Siguiente",
    statusConnected: "Conectado",
    statusLastUpdated: "Actualizado",
    actionReconnect: "Reconectar",
    actionDelete: "Eliminar",
    actionFetchTransactions: "Obtener transacciones",
    actionDeleteAccount: "Eliminar cuenta",
    transactionsFetching: "Cargando transacciones...",
    transactionsFetched: "Transacciones obtenidas",
    transactionsNoAccounts: "Sin cuentas disponibles para este banco.",
    transactionsFailed: "Error al obtener transacciones.",
    transactionsLimitReached: "Límite diario alcanzado.",
    gocardlessRateLimitExceeded: "Límite diario del proveedor bancario excedido. Inténtelo más tarde.",
    importStatementTitle: "Importar extracto (PDF)",
    importStatementDrop: "Suelte aquí los archivos PDF",
    importStatementSelectFiles: "Seleccionar archivos",
    importStatementParsing: "Analizando...",
    importStatementAnalyse: "Analizar",
    importStatementParseFailed: "Error al analizar",
    importStatementFileSingular: "archivo",
    importStatementFilePlural: "archivos",
    importStatementParsed: "analizado",
    importStatementTotalTransactions: "Total de transacciones",
    importToAccount: "Importar a",
    importSuccess: "Importadas",
    importFailed: "Error al importar",
    createNewAccount: "Crear nueva cuenta",
    assignToExisting: "Asignar a cuenta existente",
    statementBankName: "Nombre del banco",
    statementAccountName: "Nombre de la cuenta",
    statementDisplayName: "Nombre a mostrar",
    statementCountry: "País",
    selectBankForLogo: "Actualizar logo",
    pickBankFromList: "Elegir de la lista de bancos",
    accountSourceManual: "Manual",
    accountSourceAutomatic: "Automático",
    importReviewTitle: "Revisar transacciones",
    importReviewBack: "Volver",
    importReviewImport: "Importar",
    importReviewFlipSign: "Cambiar signo (crédito ↔ débito)",
    importReviewFileLabel: "Archivo",
    importReviewInclude: "Incluir en la importación",
    importReviewExclude: "Excluir de la importación",
    refreshBalancesPartialRateLimit: "Algunas cuentas no se pudieron actualizar (límite). Saldos actualizados para el resto.",
    transactionUpdateError: "Error al actualizar la transacción.",
    confirmDeleteTransaction: "¿Eliminar transacción?",
    confirmDeleteTransactionWarning: "Esta transacción se eliminará permanentemente. No se puede deshacer.",
    bookingDate: "Fecha contable",
    postingDate: "Fecha valor",
    postingDateEarlier: "Anterior (fecha valor -1 día)",
    postingDateLater: "Posterior (fecha valor +1 día)",
    transactionStatusPending: "Pendiente",
    transactionCategory: "Categoría",
    transactionTags: "Etiquetas",
    filterCategoryAll: "Todas",
    filterCategoryNone: "Sin categoría",
    filterCategoryWith: "Con categoría",
    filterCategoryWithout: "Sin categoría",
    exportTransactionsTitle: "Exportar transacciones",
    exportDates: "Fechas",
    exportDatesAll: "Todas las fechas",
    exportDatesRange: "Período seleccionado",
    exportDateFrom: "Desde",
    exportDateTo: "Hasta",
    exportAccounts: "Cuentas",
    exportAccountsAll: "Todas las cuentas",
    exportAccountsSelected: "Cuentas seleccionadas",
    exportCategories: "Categorías",
    exportCategoriesAll: "Todas las categorías",
    exportCategoriesSelected: "Categorías seleccionadas",
    exportCategoriesEmpty: "Sin categoría",
    exportTags: "Etiquetas",
    exportTagsAll: "Todas las etiquetas",
    exportTagsSelected: "Etiquetas seleccionadas",
    exportDownload: "Exportar CSV",
    exportCancel: "Cancelar",
    exportSuccess: "CSV descargado.",
    exportNumberFormat: "Formato de números",
    exportNumberFormatHelp: "Coincida con la configuración de Excel para que los importes se vean correctamente.",
    exportDecimalSeparator: "Decimal",
    exportDecimalPeriod: "Punto (.)",
    exportDecimalComma: "Coma (,)",
    exportThousandsSeparator: "Millares",
    exportThousandsNone: "Ninguno",
    exportThousandsComma: "Coma (,)",
    exportThousandsPeriod: "Punto (.)",
    settingsTitle: "Ajustes",
    settingsCategories: "Categorías",
    settingsTags: "Etiquetas",
    settingsAddCategory: "Añadir categoría",
    settingsAddTag: "Añadir etiqueta",
    settingsCategoryName: "Nombre de categoría",
    settingsTagName: "Nombre de etiqueta",
    settingsExport: "Exportar",
    settingsImport: "Importar",
    settingsExportImport: "Exportar / Importar",
    settingsExportSuccess: "Ajustes exportados.",
    settingsImportSuccess: "Importación hecha: {created} creados, {skipped} ya existían.",
    settingsImportError: "Error al importar. Compruebe el formato del archivo.",
    settingsImportFileInvalid: "El archivo debe contener categorías y/o etiquetas.",
    auditTitle: "Registro de auditoría",
    auditDate: "Fecha",
    auditUser: "Usuario",
    auditAction: "Acción",
    auditResource: "Recurso",
    auditDetails: "Detalles",
    auditFilterAction: "Acción",
    auditFilterAll: "Todas",
    auditResult: "Resultado",
    auditResultSuccess: "Éxito",
    auditResultFail: "Fallo",
    auditResultInfo: "Info",
    audit_action_user_login: "Login",
    audit_action_user_logout: "Cierre de sesión",
    audit_action_user_create: "Usuario creado",
    audit_action_user_delete: "Usuario eliminado",
    audit_action_category_create: "Categoría creada",
    audit_action_category_update: "Categoría actualizada",
    audit_action_category_delete: "Categoría eliminada",
    audit_action_tag_create: "Etiqueta creada",
    audit_action_tag_update: "Etiqueta actualizada",
    audit_action_tag_delete: "Etiqueta eliminada",
    audit_action_account_linked: "Cuenta vinculada",
    audit_action_account_deleted: "Cuenta eliminada",
    audit_action_account_alerts_updated: "Alertas de cuenta actualizadas",
    audit_action_transactions_fetched: "Transacciones obtenidas",
    audit_action_transaction_edited: "Transacción editada",
    transactionsIncludeInTotals: "Incluir en totales",
    actionUpdateAccountName: "Actualizar nombre de la cuenta",
    accountAlertsTitle: "Umbrales de alerta",
    accountAlertAbove: "Alerta por encima (€)",
    accountAlertBelow: "Alerta por debajo (€)",
    actionEditAlerts: "Editar umbrales de alerta",
    actionReconnectBank: "Reconectar banco",
    actionReauthRequired: "Reautenticación necesaria – reconecte esta cuenta",
    accountTransactionAlerts: "Alertas de transacción esperada",
    transactionsFilterAll: "Todas",
    transactionsFilterNewOnly: "Solo nuevas",
    transactionNew: "Nueva",
    transactionClearNew: "Marcar como revisadas",
    transactionComment: "Comentario",
    transactionCommentAdd: "Añadir comentario",
    transactionCommentPlaceholder: "Añade un comentario...",
    createAlertFromTransaction: "Recurrente",
    createAlertTitle: "Configurar transacción recurrente",
    createAlertDayToleranceBefore: "Tolerancia día antes",
    createAlertDayToleranceAfter: "Tolerancia día después",
    createAlertValueToleranceBelow: "Tolerancia valor por debajo",
    createAlertValueToleranceAbove: "Tolerancia valor por encima",
    alertTemplateDescription: "Descripción",
    alertTemplateDay: "Día",
    alertTemplateDayTolerance: "({before} antes / {after} después)",
    alertTemplateDays: "días",
    alertTemplateAmount: "Importe",
    alertTemplateEdit: "Editar",
    alertTemplateDelete: "Eliminar",
    alertCreated: "Alerta creada.",
    alertDeleted: "Alerta eliminada.",
    alertCreateError: "Error al crear alerta.",
    audit_action_alert_created: "Alerta creada",
    audit_action_alert_deleted: "Alerta eliminada",
    audit_action_gocardless_rate_limit: "Límite GoCardless (429)",
    audit_action_transaction_fetch_limit_reached: "Límite diario de importación alcanzado",
    audit_action_transactions_fetch_scheduled: "Importación programada de transacciones",
    audit_action_weekly_send_report: "Informe semanal enviado",
    audit_action_statement_parsed: "Extracto analizado (PDF)",
    audit_action_transactions_imported_from_pdf: "Transacciones importadas desde PDF",
    audit_action_manual_account_created: "Cuenta manual creada",
    audit_action_account_logo_updated: "Logo de cuenta actualizado",
    audit_action_daily_missing_transaction_alerts: "Alertas diarios de transacción en falta enviados",
    audit_action_get_account_transactions: "Transacciones de la cuenta obtenidas del banco",
    audit_action_list_institutions: "Lista de instituciones consultada",
    audit_action_create_requisition: "Solicitud de vinculación al banco creada",
    audit_action_get_requisition: "Estado de la vinculación consultado",
    audit_action_get_account_details: "Datos de la cuenta obtenidos",
    accountTransactionAlertsEmpty: "Sin alertas de transacción esperada. Cree una desde una transacción (icono de campana en la lista).",
    helpTitle: "Ayuda",
    helpClose: "Cerrar",
    helpTransactionsTitle: "Ayuda: Transacciones",
    helpTransactionsIntro: "Esta pantalla lista sus transacciones. Use los filtros para acotar. Abajo, qué hace cada elemento.",
    helpTxSearch: "Buscar",
    helpTxSearchDesc: "Filtrar por descripción de la transacción o nombre de la cuenta.",
    helpTxRows: "Filas por página",
    helpTxRowsDesc: "Elegir cuántas transacciones mostrar por página (10, 20, 50).",
    helpTxFilterAll: "Todas / Solo nuevas",
    helpTxFilterAllDesc: "Mostrar todas las transacciones o solo las marcadas como nuevas (no revisadas).",
    helpTxCategoryFilter: "Filtro de categoría",
    helpTxCategoryFilterDesc: "Filtrar por una o más categorías. Use Todas o Sin categoría para selección rápida.",
    helpTxTagFilter: "Filtro de etiquetas",
    helpTxTagFilterDesc: "Filtrar por etiquetas; opcionalmente incluir transacciones sin etiqueta.",
    helpTxExport: "Exportar CSV",
    helpTxExportDesc: "Descargar transacciones en CSV para Excel.",
    helpTxCategorySelect: "Categoría (por fila)",
    helpTxCategorySelectDesc: "Asignar o cambiar la categoría de esta transacción.",
    helpTxAlertIcon: "Recurrente",
    helpTxAlertIconDesc: "Configurar una transacción recurrente para recibir avisos cuando ocurra o cuando falte (ej. pago mensual).",
    helpTxCommentIcon: "Comentario",
    helpTxCommentIconDesc: "Añadir o editar una nota para esta transacción.",
    helpTxDeleteIcon: "Eliminar",
    helpTxDeleteIconDesc: "Eliminar esta transacción permanentemente.",
    helpTxTags: "Etiquetas",
    helpTxTagsDesc: "Asignar o cambiar etiquetas de esta transacción.",
    helpTxNewBadge: "Nueva",
    helpTxNewBadgeDesc: "Transacción importada recientemente. Pulse × para marcar como revisada.",
    helpTxIncludeInInsights: "Incluir en Análisis (casilla)",
    helpTxIncludeInInsightsDesc: "Marque para incluir esta transacción en Análisis (gráficos y totales); desmarque para excluirla.",
    helpTxPostingDateArrows: "Fecha valor (flechas arriba/abajo)",
    helpTxPostingDateArrowsDesc: "Flecha arriba: retrasar la fecha valor un día. Flecha abajo: adelantarla un día.",
    helpTxPaginationArrows: "Página anterior / siguiente",
    helpTxPaginationArrowsDesc: "Flecha izquierda: página anterior de la lista. Flecha derecha: página siguiente.",
    helpAccountTypeIcon: "Icono de tipo de cuenta (junto al logo)",
    helpAccountTypeIconDesc: "Icono de documento = cuenta manual (transacciones importadas ej. vía PDF). Icono de enlace = cuenta automática (enlazada al banco, sincroniza saldos y transacciones).",
    helpAccountsTitle: "Ayuda: Cuentas",
    helpAccountsIntro: "Gestionar sus cuentas bancarias y de tarjeta. Enlazar nuevas o gestionar las existentes.",
    helpAccountLinkBank: "Enlazar banco",
    helpAccountLinkBankDesc: "Iniciar el proceso para conectar una cuenta bancaria o de tarjeta mediante el proveedor seguro.",
    helpAccountLinkedList: "Cuentas enlazadas",
    helpAccountLinkedListDesc: "Cuentas que tiene configuradas.",
    helpAccountRefresh: "Actualizar saldos",
    helpAccountRefreshDesc: "Actualizar saldos y obtener nuevas transacciones del banco.",
    helpAccountFetch: "Obtener transacciones",
    helpAccountFetchDesc: "Disparar manualmente la importación de transacciones de esta conexión.",
    helpAccountAlerts: "Alertas de la cuenta",
    helpAccountAlertsDesc: "Ver o editar alertas configurados para la cuenta.",
    helpAccountDelete: "Eliminar cuenta",
    helpAccountDeleteDesc: "Eliminar la cuenta (y todas sus transacciones).",
    helpAccountReconnect: "Reconectar",
    helpAccountReconnectDesc: "Reautenticar cuando la conexión bancaria ha expirado (ej. cada 90 días).",
    helpInsightsTitle: "Ayuda: Análisis",
    helpInsightsIntro: "Ver ingresos, gastos y tendencias por período. Guarde configuraciones para reutilizar filtros.",
    helpInsightsPeriod: "Período",
    helpInsightsPeriodDesc: "Seleccionar el intervalo para los gráficos (mes actual, último mes, año, últimos 12 meses o personalizado).",
    helpInsightsConfigs: "Configuraciones guardadas",
    helpInsightsConfigsDesc: "Guardar y cargar configuraciones de filtros (período, cuentas, categorías, etiquetas).",
    helpInsightsCards: "Tarjetas",
    helpInsightsCardsDesc: "Recibido, pagado, por categoría, totales, historial de saldo. Expandir o colapsar cada tarjeta.",
    helpProfileTitle: "Ayuda: Perfil",
    helpProfileIntro: "Su configuración y preferencias para alertas y visualización.",
    helpProfileName: "Nombre",
    helpProfileNameDesc: "Su nombre como aparece en la aplicación.",
    helpProfileCountry: "País",
    helpProfileCountryDesc: "Usado para formato de fecha y número.",
    helpProfileTelegram: "ID de chat de Telegram",
    helpProfileTelegramDesc: "Enlazar Telegram para recibir alertas de transacciones y pagos esperados.",
    helpProfileShowBalances: "Mostrar saldos de cuentas",
    helpProfileShowBalancesDesc: "Mostrar u ocultar saldo en la página de transacciones.",
    helpProfileTelegramAlerts: "Alertas Telegram",
    helpProfileTelegramAlertsDesc: "Activar o desactivar notificaciones por Telegram.",
    helpProfileWeeklyEmails: "Emails semanales",
    helpProfileWeeklyEmailsDesc: "Recibir el informe semanal de Análisis por email.",
    onboardingTitle: "Bancos disponibles",
    onboardingBody: "Elige el banco que quieres añadir",
    onboardingCta: "Completar onboarding",
    onboardingCountry: "País",
    onboardingSearch: "Buscar bancos",
    onboardingSelectBank: "Seleccionar banco",
    onboardingAddAccount: "Añadir cuenta",
    onboardingConnectBank: "Conectar banco",
    onboardingCompleting: "Redirigiendo al banco...",
    onboardingFriendlyNameSave: "Guardar nombre de la cuenta",
    onboardingAccountsTitle: "Cuentas vinculadas",
    onboardingRequired: "Añade al menos una cuenta.",
    notAuthorizedTitle: "Acceso denegado",
    notAuthorizedBody:
      "Su usuario aún no está autorizado. Contacte al administrador.",
    accessDeniedTitle: "Entrada no permitida",
    accessDeniedBody:
      "Su inicio de sesión fue denegado por la comprobación de acceso de la aplicación. Si un administrador acaba de crearle la cuenta, la comprobación puede estar usando otro servidor (ej. producción). Pida al administrador que confirme que su cuenta existe en ese entorno o que apunte la allowlist a este (ej. túnel en desarrollo local).",
    accessDeniedTryAgain: "Volver al inicio",
    serverErrorTitle: "Servicio temporalmente no disponible",
    serverErrorBody:
      "No se pudo conectar con el servidor. No es un problema de autorización. Vuelve a intentarlo en unos minutos o contacta al administrador si persiste.",
    navTransactions: "Transacciones",
    navAccounts: "Cuentas",
    navInsights: "Análisis",
    navRecurring: "Recurrentes",
    recurringTitle: "Transacciones recurrentes",
    recurringSubtitle: "Gestionar pagos recurrentes. Ejecute la detección para sugerir patrones.",
    recurringInitialOfferTitle: "Encontrar patrones recurrentes",
    recurringInitialOfferBody: "Podemos analizar los últimos 12 meses de transacciones para sugerir pagos recurrentes (suscripciones, alquiler, suministros). Opcional; el proceso se realiza en nuestros servidores.",
    recurringInitialOfferAnalyze: "Analizar mis transacciones",
    recurringInitialOfferSkip: "Ahora no",
    recurringEmptyGuidance: "Cree un patrón manualmente desde una transacción (ej. Netflix, alquiler, suministros) o ejecute la detección. Más historial ayuda.",
    recurringFindSuggestions: "Buscar sugerencias",
    recurringFinding: "Analizando…",
    recurringNoSuggestions: "Ninguna sugerencia nueva.",
    recurringReviewSuggestions: "Revisar sugerencias",
    recurringSuggestionsCount: "{n} sugerencia(s) por revisar",
    recurringConfirm: "Confirmar",
    recurringDismiss: "Rechazar",
    recurringSkip: "Omitir",
    recurringEditThenConfirm: "Editar y confirmar",
    recurringProgressOf: "{i} de {n}",
    filterAccount: "Cuenta",
    filterAccountAll: "Todas",
    filterStatus: "Estado",
    filterStatusAll: "Todos",
    filterStatusActive: "Activo",
    filterStatusPaused: "Pausado",
    filterStatusSuggested: "Sugerido",
    sortBy: "Ordenar por",
    sortNextDate: "Próxima fecha",
    sortName: "Nombre",
    sortFrequency: "Frecuencia",
    sortAmount: "Importe",
    sortConfidence: "Confianza",
    searchPlaceholder: "Buscar por nombre…",
    recurringEmpty: "Sin transacciones recurrentes. Añada desde una transacción o ejecute la detección.",
    recurringNext: "Próxima",
    recurringAmount: "Importe",
    recurringAmountVaries: "Variable",
    recurringFrequency: "Frecuencia",
    recurringFrequencyWeekly: "Semanal",
    recurringFrequencyBiweekly: "Quincenal",
    recurringFrequencyMonthly: "Mensual",
    recurringFrequencyQuarterly: "Trimestral",
    recurringFrequencyYearly: "Anual",
    recurringStatusActive: "Activo",
    recurringStatusPaused: "Pausado",
    recurringStatusSuggested: "Sugerido",
    recurringStatusDismissed: "Rechazado",
    recurringStatusArchived: "Archivado",
    recurringCreateManual: "Añadir recurrente",
    recurringEdit: "Editar",
    recurringPause: "Pausar",
    recurringResume: "Reanudar",
    recurringDelete: "Eliminar",
    recurringViewList: "Lista",
    recurringViewCalendar: "Calendario",
    calendarToday: "Hoy",
    calendarMonthTitle: "Mes",
    calendarSummaryTransactions: "{n} transacción(es) esperada(s)",
    calendarSummaryAmount: "Total",
    calendarUpcoming: "Próximos",
    countdownToday: "Hoy",
    countdownTomorrow: "Mañana",
    countdownInNDays: "En {n} días",
    countdownDaysAgo: "Hace {n} días",
    detailName: "Nombre",
    detailDescriptionPattern: "Patrón de descripción",
    detailFrequency: "Frecuencia",
    detailInterval: "Intervalo",
    detailAnchorDay: "Día ancla",
    detailDayTolerance: "Tolerancia día (± días)",
    detailExpectedAmount: "Importe esperado",
    detailNominalAmount: "Importe nominal (para totales)",
    detailAmountTolerance: "Tolerancia importe (±)",
    detailAlertOnOccurrence: "Avisar cuando ocurra",
    detailAlertOnMissing: "Avisar cuando falte",
    detailMissingGraceDays: "Días de gracia (falta)",
    createRecurringTitle: "Añadir transacción recurrente",
    createRecurringSuccess: "Transacción recurrente creada.",
    createRecurringError: "Algo falló.",
    deleteConfirm: "¿Eliminar esta transacción recurrente?",
    deleteSuccess: "Eliminado.",
    confirmSuccess: "Sugerencia confirmada.",
    confirmOnlySuggestedError: "Solo se pueden confirmar sugerencias. Este elemento puede haber sido rechazado.",
    dismissSuccess: "Sugerencia rechazada.",
    incomeVsExpenses: "Ingresos vs Gastos",
    monthlyTrend: "Tendencia Mensual",
    topCategories: "Principales Categorías",
    period: "Período",
    days: "días",
    year: "año",
    insightsPeriod: "Período",
    insightsAccounts: "Cuentas",
    insightsTags: "Etiquetas",
    insightsCategories: "Categorías",
    insightsPeriodCurrentMonth: "Mes actual",
    insightsPeriodLastMonth: "Mes anterior",
    insightsPeriodYtd: "Desde inicio de año",
    insightsPeriodLast12Months: "Últimos 12 meses",
    insightsPeriodCustom: "Personalizado",
    insightsDateFrom: "Desde",
    insightsDateTo: "Hasta",
    insightsAllAccounts: "Todas",
    insightsAllTags: "Todas",
    insightsAllCategories: "Todas",
    insightsNoCategory: "Sin categoría",
    insightsNoTag: "Sin etiqueta",
    insightsSaveConfig: "Guardar configuración",
    insightsLoadConfig: "Cargar configuración",
    insightsSetDefault: "Establecer por defecto",
    insightsConfigName: "Nombre de la configuración",
    insightsConfigNamePlaceholder: "ej.: Revisión mensual",
    insightsSaveAsDefault: "Establecer por defecto",
    insightsSaved: "Configuración guardada.",
    insightsLoadConfigTitle: "Cargar configuración",
    insightsNoConfigs: "Sin configuraciones guardadas.",
    insightsDeleteConfig: "Eliminar configuración",
    insightsDeleteConfigConfirm: "¿Eliminar esta configuración?",
    insightsConfigDeleted: "Configuración eliminada.",
    insightsExportPdf: "Exportar PDF",
    insightsCardReceived: "Lista de valores recibidos",
    insightsReceivedListTotal: "Total",
    insightsCardPaid: "Lista de valores pagados",
    insightsShowMax: "Mostrar",
    insightsShowAll: "Todas",
    insightsCardByCategory: "Total por categoría",
    insightsCardTotals: "Total recibido, pagado y diferencia",
    insightsCardBalanceHistory: "Historial de saldo",
    insightsCardBalanceAccumulated: "Saldo acumulado",
    insightsCardBalanceComparison: "Comparación de saldo (mes a mes)",
    insightsAccount: "Cuenta",
    insightsNavigateToTop: "Ir arriba",
    insightsTotalReceived: "Total recibido",
    insightsTotalPaid: "Total pagado",
    insightsDifference: "Diferencia",
    insightsDate: "Fecha",
    insightsDescription: "Descripción",
    insightsAmount: "Importe",
    insightsCategory: "Categoría",
    insightsEmpty: "Sin datos para los filtros seleccionados.",
    insightsMonth: "Mes",
    insightsBalance: "Saldo",
    insightsComment: "Comentario",
    myProfile: "Mi perfil",
    userManagement: "Gestión de usuarios",
    settings: "Configuración",
    audit: "Auditoría",
  },
  fr: {
    skipToMain: "Aller au contenu principal",
    navFeatures: "Fonctionnalités",
    toggleDarkMode: "Basculer en mode sombre",
    openMenu: "Ouvrir le menu",
    login: "Se connecter",
    logout: "Se déconnecter",
    heroEyebrow: "Confidentialité d'abord · Pan-Européen",
    heroTitle: "Une app pour tous vos comptes bancaires. Vos données restent les vôtres.",
    heroBody:
      "Connectez banques et cartes dans toute l'Europe. Nous ne voyons ni ne vendons jamais vos données bancaires—elles sont stockées pour votre seul accès, chiffrées, avec des fournisseurs de niveau bancaire. Serveurs en Allemagne. Client open-source que vous pouvez inspecter sur GitHub.",
    heroAlerts: "Alertes périodiques par Telegram et Slack. Analyses hebdomadaires par email.",
    heroPrimaryCta: "Commencer",
    heroSecondaryCta: "Voir la roadmap",
    privacyHighlightsTitle: "Confidentialité par design",
    privacyHighlight1: "Vos données bancaires ne sont jamais vues ni vendues par nous. Elles sont stockées avec accès réservé à l'utilisateur.",
    privacyHighlight2: "Les données bancaires sont stockées chiffrées.",
    privacyHighlight3: "Les fournisseurs d'information bancaire sont des entreprises certifiées ISO 27000.",
    privacyHighlight4: "Les identifiants d'authentification bancaire ne sont pas stockés ni traités sur nos serveurs.",
    privacyHighlight5: "Les serveurs de l'application sont situés en Europe (Allemagne).",
    privacyHighlight6: "Le code client de l'app est open-source sur GitHub et peut être inspecté par tous.",
    landingStorageTitle: "Vos données, votre choix",
    landingStorageSubtitle: "Choisissez la synchronisation cloud (par défaut) ou local uniquement. Vous pouvez changer dans votre profil à tout moment.",
    landingStorageCloudTitle: "Synchronisation cloud",
    landingStorageCloudBody: "Données synchronisées sur nos serveurs. Mises à jour automatiques des transactions et alertes activées.",
    landingStorageLocalTitle: "Local uniquement",
    landingStorageLocalBody: "Pas de synchronisation automatique ni d'alertes périodiques. Actualisez manuellement lorsque vous utilisez l'application.",
    dashboardTitle: "Tableaux de bord quotidiens",
    dashboardBody:
      "Visualisez revenus, dépenses et objectifs d’épargne avec une catégorisation assistée par IA et des alertes intelligentes.",
    totalIncome: "Revenus totaux",
    expenses: "Dépenses",
    featureAccountsTitle: "Comptes unifiés",
    featureAccountsBody:
      "Connectez toutes vos banques et cartes avec une réauthentification sécurisée. Transactions mises à jour automatiquement, deux fois par jour.",
    featureCategoriesTitle: "Catégories intelligentes",
    featureCategoriesBody:
      "Attribuez une catégorie à chaque transaction.\nSuggestions de catégories par IA. Apprentissage dans le temps.\nPlusieurs étiquettes par transaction.",
    featureInsightsTitle: "Insights clairs",
    featureInsightsBody:
      "Des graphiques interactifs mettent en évidence les tendances par période et par compte.",
    featureInsightsBodyBullets:
      "Graphiques interactifs mettent en évidence les tendances par période et par compte.",
    landingFeaturesSectionTitle: "Fonctionnalités",
    featureCalendarTitle: "Vue calendrier",
    featureCalendarBody: "Visualisez les prochaines transactions récurrentes en mode calendrier.",
    featureNewBadge: "Nouveau",
    landingFeaturesCategoriesAndTagsTitle: "Catégories et étiquettes",
    landingFeaturesAnalysisTitle: "Analyse",
    featureBancosTitle: "Banques",
    featureTagsBody:
      "Attribuez plusieurs étiquettes par transaction pour filtrer et rapporter. Utilisez les étiquettes pour associer les transactions aux utilisateurs. Utilisez les étiquettes pour distinguer les transactions personnelles ou professionnelles, par exemple.",
    footerCopyright: "© 2026 eurodata.app",
    footerPrivacy: "Politique de confidentialité",
    footerGithub: "GitHub",
    footerLinkedin: "LinkedIn",
    footerTwitter: "X",
    mobileMenu: "Menu mobile",
    adminTitle: "Gestion des utilisateurs",
    adminCreate: "Créer un utilisateur",
    adminName: "Nom affiché",
    adminPrimaryEmail: "Email principal",
    adminIsAdmin: "Utilisateur admin",
    adminCreateButton: "Créer un utilisateur",
    adminStatusActive: "Actif",
    adminStatusInactive: "Inactif",
    adminMakeAdmin: "Définir admin",
    adminRemoveAdmin: "Retirer admin",
    adminDeactivate: "Désactiver",
    adminActivate: "Activer",
    adminInvite: "Envoyer l’invitation",
    adminAddEmail: "Ajouter un email",
    adminDeleteUser: "Supprimer l’utilisateur",
    adminEmails: "Emails",
    menuProfile: "Mon profil",
    menuUsers: "Utilisateurs",
    menuAdminDashboard: "Tableau de bord admin",
    menuSettings: "Paramètres",
    menuAudit: "Audit",
    menuLogin: "Se connecter",
    menuLogout: "Se déconnecter",
    menuAbout: "À propos",
    aboutAppName: "Bancos",
    aboutDescription: "Centralisez vos comptes bancaires et cartes, automatisez la catégorisation des transactions et suivez les dépenses en plusieurs devises.",
    aboutCopyright: "© 2026 eurodata.app",
    aboutSupport: "Support",
    aboutChangelog: "Voir le journal des modifications",
    aboutClose: "Fermer",
    metricsTitle: "Tableau de bord admin",
    metricsUsers: "Utilisateurs",
    metricsBanking: "Banque",
    metricsRecurring: "Transactions récurrentes",
    metricsEngagement: "Engagement",
    metricsTotalUsers: "Total utilisateurs",
    metricsActiveUsers7d: "Utilisateurs actifs (7 jours)",
    metricsActiveUsers30d: "Utilisateurs actifs (30 jours)",
    metricsOnboardingCompleted: "Onboarding terminé",
    metricsUsersWithAccount: "Utilisateurs avec au moins un compte",
    metricsTotalAccounts: "Total des comptes bancaires",
    metricsTotalConnections: "Total des connexions bancaires",
    metricsTotalTransactions: "Total des transactions",
    metricsAvgAccountsPerUser: "Moy. comptes par utilisateur",
    metricsAvgTransactionsPerUser: "Moy. transactions par utilisateur",
    metricsTotalPatterns: "Total des modèles récurrents",
    metricsPatternsActive: "Modèles (actifs)",
    metricsPatternsSuggested: "Modèles (suggérés)",
    metricsPatternsPaused: "Modèles (en pause)",
    metricsPatternsAutoDetected: "Détectés automatiquement",
    metricsPatternsManual: "Manuels",
    metricsPatternsMigrated: "Migrés",
    metricsUsersWithPatterns: "Utilisateurs avec modèles",
    metricsAvgPatternsPerUser: "Moy. modèles par utilisateur (avec modèles)",
    metricsOccurrencesMatched: "Occurrences associées",
    metricsTelegramEnabled: "Utilisateurs avec alertes Telegram",
    metricsWeeklyEmailsEnabled: "Utilisateurs avec e-mails hebdo",
    metricsLoading: "Chargement des métriques…",
    metricsError: "Échec du chargement des métriques",
    privacyTitle: "Politique de confidentialité",
    privacyBack: "Retour",
    privacyLastUpdated: "Dernière mise à jour : février 2026",
    privacyIntro:
      "eurodata.app (« nous », « notre » ou « l'application ») s'engage à protéger votre vie privée. Nous ne vendons, ne louons ni ne partageons vos données personnelles avec des tiers à des fins marketing ou autres. Cette politique décrit quelles données nous traitons et vos droits.",
    privacySection1Title: "1. Qui nous sommes",
    privacySection1Content:
      "Cette politique de confidentialité s'applique à l'application web eurodata.app (Bancos), qui propose le suivi des relevés bancaires et cartes. Le service est destiné aux utilisateurs en Europe.",
    privacySection2Title: "2. Données que nous collectons",
    privacySection2Content:
      "Nous ne collectons et ne traitons que les données nécessaires au service : informations de compte que vous configurez (ex. nom, pays, préférences de notification), données d'authentification gérées par Auth0 (ex. e-mail, connexion) et données de transactions bancaires que vous liez via l'open banking (Nordigen/GoCardless) uniquement pour afficher et catégoriser vos transactions. Nous ne collectons ni ne stockons de données pour la publicité ou l'analyse vous identifiant.",
    privacySection3Title: "3. Comment nous utilisons vos données",
    privacySection3Content:
      "Nous utilisons vos données uniquement pour faire fonctionner l'application : vous authentifier, récupérer et afficher vos transactions, appliquer la catégorisation assistée par IA selon vos catégories et envoyer des alertes optionnelles (ex. Telegram, e-mail hebdomadaire) si vous les avez activées. Nous n'utilisons pas vos données pour le marketing et ne partageons ni ne vendons vos données personnelles ou financières à des tiers.",
    privacySection4Title: "4. Conservation des données",
    privacySection4Content:
      "Nous conservons vos données tant que votre compte est actif et pendant la durée nécessaire au service et aux obligations légales. Si vous fermez votre compte ou demandez la suppression, nous supprimerons ou anonymiserons vos données personnelles et de transactions conformément à nos procédures.",
    privacySection5Title: "5. Cookies et technologies similaires",
    privacySection5Content:
      "Nous utilisons des cookies et un stockage local strictement nécessaires à la session et à l'authentification (ex. Auth0). Nous n'utilisons pas de cookies ou technologies similaires pour la publicité ou le suivi inter-sites. Vous pouvez gérer les cookies dans les paramètres de votre navigateur.",
    privacySection6Title: "6. Services tiers",
    privacySection6Content:
      "Nous utilisons Auth0 pour l'authentification et des prestataires d'open banking (ex. GoCardless/Nordigen) pour récupérer vos données bancaires avec votre consentement. Ces prestataires traitent les données selon leurs propres politiques. Nous ne transmettons pas vos données à d'autres tiers pour leur marketing ou d'autres fins.",
    privacySection7Title: "7. Vos droits",
    privacySection7Content:
      "Selon votre lieu de résidence (dont le RGPD si vous êtes dans l'Espace économique européen), vous pouvez avoir le droit d'accéder, rectifier, exporter ou supprimer vos données personnelles, de vous opposer ou limiter certains traitements et de saisir une autorité de contrôle. Pour exercer ces droits, contactez-nous aux coordonnées indiquées ci-dessous.",
    privacySection8Title: "8. Modifications de cette politique",
    privacySection8Content:
      "Nous pouvons mettre à jour cette politique de confidentialité. La version mise à jour sera publiée sur cette page avec la date de dernière mise à jour. L'utilisation continue du service après modification vaut acceptation de la politique révisée.",
    privacyContactTitle: "Contact",
    privacyContactIntro:
      "Pour toute question concernant cette politique de confidentialité ou vos données personnelles, contactez-nous à l'adresse de support ou de contact indiquée dans l'application ou sur eurodata.app.",
    registerModalTitle: "Demander l'accès",
    registerWithEmail: "S'inscrire avec email",
    registerWithGoogle: "Continuer avec Google",
    registerModalClose: "Fermer",
    signupRequestTitle: "Demander l'accès",
    signupRequestBody:
      "L'accès à l'application est soumis à l'approbation d'un administrateur. Indiquez votre adresse email ci-dessous pour que nous puissions approuver votre inscription. Vous recevrez un email pour définir votre mot de passe une fois qu'un administrateur aura approuvé votre demande.",
    signupRequestEmailLabel: "Adresse email",
    signupRequestSubmit: "Demander l'accès",
    signupRequestSuccess: "Demande reçue. Consultez votre email pour la suite une fois votre accès approuvé.",
    signupRequestError: "Une erreur s'est produite. Veuillez réessayer plus tard.",
    profileTitle: "Profil",
    profileName: "Nom",
    profileCountry: "Pays",
    profileCountryPlaceholder: "Choisir un pays",
    profileTelegramId: "ID de Chat Telegram",
    profileTelegramHelp: "Obtenez votre ID depuis @userinfobot sur Telegram",
    profileTelegramLinkButton: "Lier avec Telegram",
    profileTelegramLinkStep1: "Ouvrez Telegram et envoyez un message à notre bot",
    profileTelegramLinkStep2: "Envoyez ce code au bot",
    profileTelegramLinkExpires: "Le code expire dans 10 minutes.",
    profileTelegramLinked: "Telegram lié",
    profileTelegramLinkError: "Impossible d'obtenir le code. Réessayez.",
    profileTelegramOrManual: "Ou saisissez votre ID de Chat manuellement (ex. @userinfobot)",
    profileTelegramUnlink: "Délier",
    profileShowBalances: "Afficher les soldes des comptes",
    profileShowBalancesHelp: "Afficher les soldes des comptes sur la page des transactions",
    profileAutoDetection: "Détection automatique des récurrentes",
    profileAutoDetectionHelp: "Détecter automatiquement les transactions récurrentes et suggérer des modèles (exécuté quotidiennement avec stockage cloud)",
    profileTelegramAlerts: "Alertes Telegram",
    profileTelegramAlertsHelp: "Recevoir les alertes de transactions et paiements attendus par Telegram",
    profileSlackAlerts: "Alertes Slack",
    profileSlackAlertsHelp: "Recevoir les alertes de transactions et paiements attendus dans un canal Slack. Créez un webhook entrant dans votre espace Slack et collez l'URL ci-dessous.",
    profileSlackWebhookUrl: "URL du webhook Slack",
    profileSlackWebhookUrlPlaceholder: "https://hooks.slack.com/services/...",
    profileChannelsSection: "Canaux",
    profileAlertsSection: "Alertes",
    profileSlackWebhookHelpPopup: "1. Aller sur la page API Slack : Visitez https://api.slack.com/apps\n\n2. Créer ou sélectionner une app : Cliquez sur \"Create New App\", choisissez \"From scratch\", donnez un nom et sélectionnez votre espace.\n\n3. Activer Incoming Webhooks : Dans les paramètres de l'app, cliquez sur \"Incoming Webhooks\" dans la barre latérale et activez l'option \"On\".\n\n4. Ajouter le webhook au canal : Cliquez sur \"Add New Webhook to Workspace\" en bas, sélectionnez le canal où publier puis \"Allow\".\n\n5. Copier l'URL du webhook : L'URL du webhook s'affichera — du type https://hooks.slack.com/services/...",
    profileSlackTestButton: "Envoyer un message de test",
    profileSlackTestSent: "Message de test envoyé sur Slack.",
    profileSlackTestError: "Échec de l'envoi du message de test. Vérifiez l'URL du webhook et réessayez.",
    profileTabUser: "Utilisateur",
    profileTabChannels: "Canaux",
    profileTabAlerts: "Alertes",
    profileTabStorage: "Stockage",
    profileTabApiTokens: "Tokens API",
    profileWeeklyEmails: "Emails hebdomadaires",
    profileWeeklyEmailsHelp: "Recevoir le rapport hebdomadaire Analyses par email (dimanche 08:00 UTC)",
    profileStorageMode: "Stockage des données",
    profileStorageModeCloud: "Synchronisation cloud",
    profileStorageModeLocal: "Local uniquement",
    profileStorageModeCloudHelp: "Vos données sont synchronisées sur nos serveurs. Les mises à jour automatiques des transactions et les alertes sont activées.",
    profileStorageModeLocalHelp: "La récupération automatique des transactions et les alertes périodiques sont désactivées. Vous pouvez actualiser manuellement lorsque vous utilisez l'application.",
    balanceUpdated: "Mis à jour",
    balanceUnavailable: "Solde non disponible",
    refreshBalances: "Actualiser soldes et mouvements",
    refreshingBalances: "Mise à jour…",
    profileSave: "Enregistrer le profil",
    profileSaved: "Profil mis à jour.",
    profileSaveError: "Échec de la mise à jour.",
    fetchInProgressMessage: "Importation des transactions en cours. Vous ne pouvez pas ajouter de compte ni lancer une autre importation.",
    fetchCompleted: "Transactions importées avec succès.",
    fetchFailed: "Échec de l'importation des transactions.",
    profileEmail: "Email",
    profileStatus: "Statut",
    profileAdmin: "Admin",
    profileNoEmail: "Aucun email enregistré",
    profileApiTokens: "Tokens API",
    profileApiTokensHelp: "Créer des tokens pour accéder à l'API (ex. scripts). Chaque token n'est affiché qu'une fois à la création.",
    profileApiTokenCreate: "Créer un token",
    profileApiTokenName: "Nom du token",
    profileApiTokenNamePlaceholder: "ex. Script ou Intégration",
    profileApiTokenLastUsed: "Dernière utilisation",
    profileApiTokenNeverUsed: "Jamais",
    profileApiTokenCopy: "Copier le token",
    profileApiTokenCopied: "Copié",
    profileApiTokenCreatedTitle: "Token créé",
    profileApiTokenCreatedMessage: "Copiez ce token maintenant. Il ne sera plus affiché.",
    profileApiTokenDelete: "Supprimer",
    profileApiTokenDeleteConfirm: "Supprimer ce token ? Il cessera de fonctionner immédiatement.",
    profileApiTokensEmpty: "Aucun token API pour l'instant.",
    modalCancel: "Annuler",
    modalSave: "Enregistrer",
    modalConfirm: "Confirmer",
    modalDeleteTitle: "Supprimer l’utilisateur",
    confirmDeleteConnection: "Supprimer la connexion bancaire ?",
    settingsDeleteCategoryTitle: "Supprimer la catégorie ?",
    settingsDeleteTagTitle: "Supprimer l'étiquette ?",
    confirmDeleteAccount: "Supprimer ce compte ?",
    confirmDeleteAccountWarning: "Le compte et toutes ses transactions seront définitivement supprimés. Cette action est irréversible.",
    adminActions: "Actions",
    inviteEmailSent: "Invitation envoyée par email.",
    inviteEmailFallback: "Email non envoyé. Utilisez le lien ci-dessous.",
    inviteEmailRetry: "Email non envoyé. Utilisez « Envoyer l’invitation ».",
    inviteLinkLabel: "Lien d’invitation",
    adminSearch: "Rechercher des utilisateurs",
    adminRows: "Lignes",
    adminShowing: "Affichage",
    adminOf: "sur",
    adminPrev: "Précédent",
    adminNext: "Suivant",
    auditViewDetails: "Voir les détails complets",
    auditDetailsClose: "Fermer",
    adminEmailVerified: "Email vérifié",
    adminTelegramId: "ID Telegram",
    adminEditTelegram: "Modifier l'ID Telegram",
    adminTelegramModalTitle: "Modifier l'ID de Chat Telegram",
    adminTelegramSave: "Enregistrer",
    dashboardWelcome: "Vue d’ensemble",
    dashboardAccountsTitle: "Comptes bancaires et cartes",
    dashboardAccountsBody: "Gérer les comptes pour synchroniser les transactions.",
    dashboardAccountsButton: "Gérer les comptes",
    dashboardAccountsEmpty: "Aucune banque liée.",
    dashboardInsightsTitle: "Insights",
    dashboardInsightsBody:
      "Suivez revenus et dépenses avec des périodes sélectionnables.",
    dashboardInsightsPeriod: "Période",
    dashboardTransactionsTitle: "Transactions récentes",
    dashboardTransactionsBody:
      "Consultez l’activité récente et filtrez par banque ou toutes.",
    dashboardTransactionsFilter: "Filtre banque",
    dashboardFilterAll: "Toutes les banques",
    dashboardAccountsTooltip: "Gérer les comptes",
    dashboardInsightsTooltip: "Voir les insights",
    dashboardTransactionsTooltip: "Voir les transactions",
    transactionsListTitle: "Toutes les transactions",
    transactionsListEmpty: "Aucune transaction pour le moment.",
    transactionsAmount: "Montant",
    transactionsDate: "Date",
    transactionsAccount: "Compte",
    transactionsSearch: "Rechercher des transactions",
    transactionsRows: "Lignes",
    transactionsShowing: "Affichage",
    transactionsOf: "sur",
    transactionsTo: "à",
    transactionsPrev: "Précédent",
    transactionsNext: "Suivant",
    statusConnected: "Connecté",
    statusLastUpdated: "Mis à jour",
    actionReconnect: "Reconnecter",
    actionDelete: "Supprimer",
    actionFetchTransactions: "Récupérer les transactions",
    actionDeleteAccount: "Supprimer le compte",
    transactionsFetching: "Récupération des transactions...",
    transactionsFetched: "Transactions récupérées",
    transactionsNoAccounts: "Aucun compte disponible pour cette banque.",
    transactionsFailed: "Échec de récupération des transactions.",
    transactionsLimitReached: "Limite quotidienne atteinte.",
    gocardlessRateLimitExceeded: "Limite quotidienne du fournisseur bancaire dépassée. Réessayez plus tard.",
    importStatementTitle: "Importer un relevé (PDF)",
    importStatementDrop: "Déposez les fichiers PDF ici",
    importStatementSelectFiles: "Sélectionner des fichiers",
    importStatementParsing: "Analyse en cours...",
    importStatementAnalyse: "Analyser",
    importStatementParseFailed: "Échec de l'analyse",
    importStatementFileSingular: "fichier",
    importStatementFilePlural: "fichiers",
    importStatementParsed: "analysé",
    importStatementTotalTransactions: "Total des transactions",
    importToAccount: "Importer vers",
    importSuccess: "Importées",
    importFailed: "Échec de l'importation",
    createNewAccount: "Créer un nouveau compte",
    assignToExisting: "Assigner à un compte existant",
    statementBankName: "Nom de la banque",
    statementAccountName: "Nom du compte",
    statementDisplayName: "Nom à afficher",
    statementCountry: "Pays",
    selectBankForLogo: "Mettre à jour le logo",
    pickBankFromList: "Choisir dans la liste des banques",
    accountSourceManual: "Manuel",
    accountSourceAutomatic: "Automatique",
    importReviewTitle: "Vérifier les transactions",
    importReviewBack: "Retour",
    importReviewImport: "Importer",
    importReviewFlipSign: "Inverser le signe (crédit ↔ débit)",
    importReviewFileLabel: "Fichier",
    importReviewInclude: "Inclure dans l'import",
    importReviewExclude: "Exclure de l'import",
    refreshBalancesPartialRateLimit: "Certains comptes n'ont pas pu être mis à jour (limite). Soldes mis à jour pour les autres.",
    transactionUpdateError: "Échec de la mise à jour de la transaction.",
    confirmDeleteTransaction: "Supprimer la transaction ?",
    confirmDeleteTransactionWarning: "Cette transaction sera définitivement supprimée. Cette action est irréversible.",
    bookingDate: "Date comptable",
    postingDate: "Date de comptabilisation",
    postingDateEarlier: "Plus tôt (date -1 jour)",
    postingDateLater: "Plus tard (date +1 jour)",
    transactionStatusPending: "En attente",
    transactionCategory: "Catégorie",
    transactionTags: "Étiquettes",
    filterCategoryAll: "Toutes",
    filterCategoryNone: "Sans catégorie",
    filterCategoryWith: "Avec catégorie",
    filterCategoryWithout: "Sans catégorie",
    exportTransactionsTitle: "Exporter les transactions",
    exportDates: "Dates",
    exportDatesAll: "Toutes les dates",
    exportDatesRange: "Période sélectionnée",
    exportDateFrom: "Du",
    exportDateTo: "Au",
    exportAccounts: "Comptes",
    exportAccountsAll: "Tous les comptes",
    exportAccountsSelected: "Comptes sélectionnés",
    exportCategories: "Catégories",
    exportCategoriesAll: "Toutes les catégories",
    exportCategoriesSelected: "Catégories sélectionnées",
    exportCategoriesEmpty: "Sans catégorie",
    exportTags: "Étiquettes",
    exportTagsAll: "Toutes les étiquettes",
    exportTagsSelected: "Étiquettes sélectionnées",
    exportDownload: "Exporter CSV",
    exportCancel: "Annuler",
    exportSuccess: "CSV téléchargé.",
    exportNumberFormat: "Format des nombres",
    exportNumberFormatHelp: "Correspond à la configuration Excel pour afficher correctement les montants.",
    exportDecimalSeparator: "Décimal",
    exportDecimalPeriod: "Point (.)",
    exportDecimalComma: "Virgule (,)",
    exportThousandsSeparator: "Milliers",
    exportThousandsNone: "Aucun",
    exportThousandsComma: "Virgule (,)",
    exportThousandsPeriod: "Point (.)",
    settingsTitle: "Paramètres",
    settingsCategories: "Catégories",
    settingsTags: "Étiquettes",
    settingsAddCategory: "Ajouter une catégorie",
    settingsAddTag: "Ajouter une étiquette",
    settingsCategoryName: "Nom de la catégorie",
    settingsTagName: "Nom de l'étiquette",
    settingsExport: "Exporter",
    settingsImport: "Importer",
    settingsExportImport: "Exporter / Importer",
    settingsExportSuccess: "Paramètres exportés.",
    settingsImportSuccess: "Importation terminée : {created} créés, {skipped} existaient déjà.",
    settingsImportError: "Échec de l'importation. Vérifiez le format du fichier.",
    settingsImportFileInvalid: "Le fichier doit contenir des catégories et/ou étiquettes.",
    auditTitle: "Journal d'audit",
    auditDate: "Date",
    auditUser: "Utilisateur",
    auditAction: "Action",
    auditResource: "Ressource",
    auditDetails: "Détails",
    auditFilterAction: "Action",
    auditFilterAll: "Toutes",
    auditResult: "Résultat",
    auditResultSuccess: "Succès",
    auditResultFail: "Échec",
    auditResultInfo: "Info",
    audit_action_user_login: "Connexion",
    audit_action_user_logout: "Déconnexion",
    audit_action_user_create: "Utilisateur créé",
    audit_action_user_delete: "Utilisateur supprimé",
    audit_action_category_create: "Catégorie créée",
    audit_action_category_update: "Catégorie modifiée",
    audit_action_category_delete: "Catégorie supprimée",
    audit_action_tag_create: "Étiquette créée",
    audit_action_tag_update: "Étiquette modifiée",
    audit_action_tag_delete: "Étiquette supprimée",
    audit_action_account_linked: "Compte lié",
    audit_action_account_deleted: "Compte supprimé",
    audit_action_account_alerts_updated: "Seuils d'alerte modifiés",
    audit_action_transactions_fetched: "Transactions récupérées",
    audit_action_transaction_edited: "Transaction modifiée",
    transactionsIncludeInTotals: "Inclure dans les totaux",
    actionUpdateAccountName: "Mettre à jour le nom du compte",
    accountAlertsTitle: "Seuils d'alerte",
    accountAlertAbove: "Alerte au-dessus (€)",
    accountAlertBelow: "Alerte en-dessous (€)",
    actionEditAlerts: "Modifier les seuils d'alerte",
    actionReconnectBank: "Reconnecter la banque",
    actionReauthRequired: "Réauthentification requise – reconnectez ce compte",
    accountTransactionAlerts: "Alertes de transaction attendue",
    transactionsFilterAll: "Toutes",
    transactionsFilterNewOnly: "Nouvelles uniquement",
    transactionNew: "Nouvelle",
    transactionClearNew: "Marquer comme vérifiées",
    transactionComment: "Commentaire",
    transactionCommentAdd: "Ajouter un commentaire",
    transactionCommentPlaceholder: "Ajoutez un commentaire...",
    createAlertFromTransaction: "Récurrent",
    createAlertTitle: "Configurer la transaction récurrente",
    createAlertDayToleranceBefore: "Tolérance jour avant",
    createAlertDayToleranceAfter: "Tolérance jour après",
    createAlertValueToleranceBelow: "Tolérance montant en dessous",
    createAlertValueToleranceAbove: "Tolérance montant au dessus",
    alertTemplateDescription: "Description",
    alertTemplateDay: "Jour",
    alertTemplateDayTolerance: "({before} avant / {after} après)",
    alertTemplateDays: "jours",
    alertTemplateAmount: "Montant",
    alertTemplateEdit: "Modifier",
    alertTemplateDelete: "Supprimer",
    alertCreated: "Alerte créée.",
    alertDeleted: "Alerte supprimée.",
    alertCreateError: "Échec de la création de l'alerte.",
    audit_action_alert_created: "Alerte créée",
    audit_action_alert_deleted: "Alerte supprimée",
    audit_action_gocardless_rate_limit: "Limite GoCardless (429)",
    audit_action_transaction_fetch_limit_reached: "Limite quotidienne d'importation atteinte",
    audit_action_transactions_fetch_scheduled: "Import des transactions programmé",
    audit_action_weekly_send_report: "Rapport hebdomadaire envoyé",
    audit_action_statement_parsed: "Relevé analysé (PDF)",
    audit_action_transactions_imported_from_pdf: "Transactions importées depuis PDF",
    audit_action_manual_account_created: "Compte manuel créé",
    audit_action_account_logo_updated: "Logo du compte mis à jour",
    audit_action_daily_missing_transaction_alerts: "Alertes quotidiennes de transaction manquante envoyées",
    audit_action_get_account_transactions: "Transactions du compte obtenues auprès de la banque",
    audit_action_list_institutions: "Liste des établissements consultée",
    audit_action_create_requisition: "Demande de liaison bancaire créée",
    audit_action_get_requisition: "État de la liaison consulté",
    audit_action_get_account_details: "Détails du compte obtenus",
    accountTransactionAlertsEmpty: "Aucune alerte de transaction attendue. Créez-en une depuis une transaction (icône cloche dans la liste).",
    helpTitle: "Aide",
    helpClose: "Fermer",
    helpTransactionsTitle: "Aide : Transactions",
    helpTransactionsIntro: "Cet écran liste vos transactions. Utilisez les filtres pour affiner. Ci-dessous, à quoi sert chaque élément.",
    helpTxSearch: "Rechercher",
    helpTxSearchDesc: "Filtrer par description de la transaction ou nom du compte.",
    helpTxRows: "Lignes par page",
    helpTxRowsDesc: "Choisir combien de transactions afficher par page (10, 20, 50).",
    helpTxFilterAll: "Toutes / Nouvelles uniquement",
    helpTxFilterAllDesc: "Afficher toutes les transactions ou seulement celles marquées comme nouvelles (non vérifiées).",
    helpTxCategoryFilter: "Filtre de catégorie",
    helpTxCategoryFilterDesc: "Filtrer par une ou plusieurs catégories. Utilisez Toutes ou Sans catégorie pour une sélection rapide.",
    helpTxTagFilter: "Filtre d'étiquettes",
    helpTxTagFilterDesc: "Filtrer par étiquettes ; inclure éventuellement les transactions sans étiquette.",
    helpTxExport: "Exporter CSV",
    helpTxExportDesc: "Télécharger les transactions en fichier CSV pour Excel.",
    helpTxCategorySelect: "Catégorie (par ligne)",
    helpTxCategorySelectDesc: "Attribuer ou modifier la catégorie de cette transaction.",
    helpTxAlertIcon: "Récurrent",
    helpTxAlertIconDesc: "Configurer une transaction récurrente pour être notifié quand elle a lieu ou quand elle manque (ex. paiement mensuel).",
    helpTxCommentIcon: "Commentaire",
    helpTxCommentIconDesc: "Ajouter ou modifier une note pour cette transaction.",
    helpTxDeleteIcon: "Supprimer",
    helpTxDeleteIconDesc: "Supprimer définitivement cette transaction.",
    helpTxTags: "Étiquettes",
    helpTxTagsDesc: "Attribuer ou modifier les étiquettes de cette transaction.",
    helpTxNewBadge: "Nouvelle",
    helpTxNewBadgeDesc: "Transaction importée récemment. Cliquez sur × pour marquer comme vérifiée.",
    helpTxIncludeInInsights: "Inclure dans Analyses (case à cocher)",
    helpTxIncludeInInsightsDesc: "Cochez pour inclure cette transaction dans les Analyses (graphiques et totaux) ; décochez pour l'exclure.",
    helpTxPostingDateArrows: "Date de comptabilisation (flèches haut/bas)",
    helpTxPostingDateArrowsDesc: "Flèche haut : retarder la date d'un jour. Flèche bas : l'avancer d'un jour.",
    helpTxPaginationArrows: "Page précédente / suivante",
    helpTxPaginationArrowsDesc: "Flèche gauche : page précédente de la liste. Flèche droite : page suivante.",
    helpAccountTypeIcon: "Icône type de compte (à côté du logo)",
    helpAccountTypeIconDesc: "Icône document = compte manuel (transactions importées ex. via PDF). Icône lien = compte automatique (lié à la banque, synchronise soldes et transactions).",
    helpAccountsTitle: "Aide : Comptes",
    helpAccountsIntro: "Gérer vos comptes bancaires et cartes. Lier de nouveaux comptes ou gérer les existants.",
    helpAccountLinkBank: "Lier un banque",
    helpAccountLinkBankDesc: "Démarrer le processus pour connecter un compte bancaire ou carte via le fournisseur sécurisé.",
    helpAccountLinkedList: "Comptes liés",
    helpAccountLinkedListDesc: "Comptes que vous avez configurés.",
    helpAccountRefresh: "Actualiser les soldes",
    helpAccountRefreshDesc: "Mettre à jour les soldes et récupérer les nouvelles transactions auprès de la banque.",
    helpAccountFetch: "Récupérer les transactions",
    helpAccountFetchDesc: "Déclencher manuellement l'import des transactions pour cette connexion.",
    helpAccountAlerts: "Alertes du compte",
    helpAccountAlertsDesc: "Afficher ou modifier les alertes configurées pour le compte.",
    helpAccountDelete: "Supprimer le compte",
    helpAccountDeleteDesc: "Supprimer le compte (et toutes ses transactions).",
    helpAccountReconnect: "Reconnecter",
    helpAccountReconnectDesc: "Réauthentifier lorsque la connexion bancaire a expiré (ex. tous les 90 jours).",
    helpInsightsTitle: "Aide : Analyses",
    helpInsightsIntro: "Voir les revenus, dépenses et tendances par période. Enregistrez des configurations pour réutiliser les filtres.",
    helpInsightsPeriod: "Période",
    helpInsightsPeriodDesc: "Sélectionner l'intervalle pour les graphiques (mois en cours, mois dernier, année, 12 derniers mois ou personnalisé).",
    helpInsightsConfigs: "Configurations enregistrées",
    helpInsightsConfigsDesc: "Enregistrer et charger des configurations de filtres (période, comptes, catégories, étiquettes).",
    helpInsightsCards: "Cartes",
    helpInsightsCardsDesc: "Reçu, payé, par catégorie, totaux, historique du solde. Développer ou réduire chaque carte.",
    helpProfileTitle: "Aide : Profil",
    helpProfileIntro: "Vos paramètres et préférences pour les alertes et l'affichage.",
    helpProfileName: "Nom",
    helpProfileNameDesc: "Votre nom tel qu'affiché dans l'application.",
    helpProfileCountry: "Pays",
    helpProfileCountryDesc: "Utilisé pour le format des dates et nombres.",
    helpProfileTelegram: "ID de chat Telegram",
    helpProfileTelegramDesc: "Lier Telegram pour recevoir les alertes de transactions et paiements attendus.",
    helpProfileShowBalances: "Afficher les soldes des comptes",
    helpProfileShowBalancesDesc: "Afficher ou masquer le solde sur la page des transactions.",
    helpProfileTelegramAlerts: "Alertes Telegram",
    helpProfileTelegramAlertsDesc: "Activer ou désactiver les notifications Telegram.",
    helpProfileWeeklyEmails: "Emails hebdomadaires",
    helpProfileWeeklyEmailsDesc: "Recevoir le rapport hebdomadaire Analyses par email.",
    onboardingTitle: "Banques disponibles",
    onboardingBody: "Choisissez la banque que vous souhaitez ajouter",
    onboardingCta: "Terminer l’onboarding",
    onboardingCountry: "Pays",
    onboardingSearch: "Rechercher des banques",
    onboardingSelectBank: "Sélectionner une banque",
    onboardingAddAccount: "Ajouter un compte",
    onboardingConnectBank: "Connecter la banque",
    onboardingCompleting: "Redirection vers la banque...",
    onboardingFriendlyNameSave: "Enregistrer le nom du compte",
    onboardingAccountsTitle: "Comptes liés",
    onboardingRequired: "Ajoutez au moins un compte.",
    notAuthorizedTitle: "Accès refusé",
    notAuthorizedBody:
      "Cet utilisateur n’est pas encore autorisé. Contactez l’administrateur.",
    accessDeniedTitle: "Connexion non autorisée",
    accessDeniedBody:
      "Votre connexion a été refusée par la vérification d'accès de l'application. Si un administrateur vient de créer votre compte, la vérification peut interroger un autre serveur (ex. production). Demandez à l'administrateur de confirmer que votre compte existe dans cet environnement ou de pointer la allowlist vers celui-ci (ex. tunnel en développement local).",
    accessDeniedTryAgain: "Retour à l'accueil",
    serverErrorTitle: "Service temporairement indisponible",
    serverErrorBody:
      "Le serveur n'a pas pu être joint. Ce n'est pas un problème d'autorisation. Réessayez dans quelques minutes ou contactez l'administrateur si cela persiste.",
    navTransactions: "Transactions",
    navAccounts: "Comptes",
    navInsights: "Analyses",
    navRecurring: "Récurrentes",
    recurringTitle: "Transactions récurrentes",
    recurringSubtitle: "Suivre et gérer les paiements récurrents. Lancez la détection pour des suggestions.",
    recurringInitialOfferTitle: "Trouver des paiements récurrents",
    recurringInitialOfferBody: "Nous pouvons analyser vos 12 derniers mois de transactions pour suggérer des paiements récurrents (abonnements, loyer, factures). Optionnel ; le traitement est fait sur nos serveurs.",
    recurringInitialOfferAnalyze: "Analyser mes transactions",
    recurringInitialOfferSkip: "Plus tard",
    recurringEmptyGuidance: "Créez un modèle manuellement depuis une transaction (ex. Netflix, loyer, factures) ou lancez la détection. Plus d’historique aide.",
    recurringFindSuggestions: "Trouver des suggestions",
    recurringFinding: "Analyse en cours…",
    recurringNoSuggestions: "Aucune nouvelle suggestion.",
    recurringReviewSuggestions: "Revoir les suggestions",
    recurringSuggestionsCount: "{n} suggestion(s) à revoir",
    recurringConfirm: "Confirmer",
    recurringDismiss: "Rejeter",
    recurringSkip: "Passer",
    recurringEditThenConfirm: "Modifier puis confirmer",
    recurringProgressOf: "{i} sur {n}",
    filterAccount: "Compte",
    filterAccountAll: "Tous",
    filterStatus: "État",
    filterStatusAll: "Tous",
    filterStatusActive: "Actif",
    filterStatusPaused: "En pause",
    filterStatusSuggested: "Suggéré",
    sortBy: "Trier par",
    sortNextDate: "Prochaine date",
    sortName: "Nom",
    sortFrequency: "Fréquence",
    sortAmount: "Montant",
    sortConfidence: "Confiance",
    searchPlaceholder: "Rechercher par nom…",
    recurringEmpty: "Aucune transaction récurrente. Ajoutez-en depuis une transaction ou lancez la détection.",
    recurringNext: "Prochaine",
    recurringAmount: "Montant",
    recurringAmountVaries: "Variable",
    recurringFrequency: "Fréquence",
    recurringFrequencyWeekly: "Hebdomadaire",
    recurringFrequencyBiweekly: "Bimensuel",
    recurringFrequencyMonthly: "Mensuel",
    recurringFrequencyQuarterly: "Trimestriel",
    recurringFrequencyYearly: "Annuel",
    recurringStatusActive: "Actif",
    recurringStatusPaused: "En pause",
    recurringStatusSuggested: "Suggéré",
    recurringStatusDismissed: "Rejeté",
    recurringStatusArchived: "Archivé",
    recurringCreateManual: "Ajouter une récurrente",
    recurringEdit: "Modifier",
    recurringPause: "Pause",
    recurringResume: "Reprendre",
    recurringDelete: "Supprimer",
    recurringViewList: "Liste",
    recurringViewCalendar: "Calendrier",
    calendarToday: "Aujourd'hui",
    calendarMonthTitle: "Mois",
    calendarSummaryTransactions: "{n} transaction(s) attendue(s)",
    calendarSummaryAmount: "Total",
    calendarUpcoming: "À venir",
    countdownToday: "Aujourd'hui",
    countdownTomorrow: "Demain",
    countdownInNDays: "Dans {n} jours",
    countdownDaysAgo: "Il y a {n} jours",
    detailName: "Nom",
    detailDescriptionPattern: "Modèle de description",
    detailFrequency: "Fréquence",
    detailInterval: "Intervalle",
    detailAnchorDay: "Jour d'ancrage",
    detailDayTolerance: "Tolérance jour (± jours)",
    detailExpectedAmount: "Montant attendu",
    detailNominalAmount: "Montant nominal (pour totaux)",
    detailAmountTolerance: "Tolérance montant (±)",
    detailAlertOnOccurrence: "Alerte à l'occurrence",
    detailAlertOnMissing: "Alerte si manquant",
    detailMissingGraceDays: "Jours de grâce (manquant)",
    createRecurringTitle: "Ajouter une transaction récurrente",
    createRecurringSuccess: "Transaction récurrente créée.",
    createRecurringError: "Une erreur s'est produite.",
    deleteConfirm: "Supprimer cette transaction récurrente ?",
    deleteSuccess: "Supprimé.",
    confirmSuccess: "Suggestion confirmée.",
    confirmOnlySuggestedError: "Seules les suggestions peuvent être confirmées. Cet élément a peut-être été rejeté.",
    dismissSuccess: "Suggestion rejetée.",
    incomeVsExpenses: "Revenus vs Dépenses",
    monthlyTrend: "Tendance Mensuelle",
    topCategories: "Principales Catégories",
    period: "Période",
    days: "jours",
    year: "an",
    insightsPeriod: "Période",
    insightsAccounts: "Comptes",
    insightsTags: "Étiquettes",
    insightsCategories: "Catégories",
    insightsPeriodCurrentMonth: "Mois en cours",
    insightsPeriodLastMonth: "Mois dernier",
    insightsPeriodYtd: "Depuis le début de l'année",
    insightsPeriodLast12Months: "12 derniers mois",
    insightsPeriodCustom: "Personnalisé",
    insightsDateFrom: "Du",
    insightsDateTo: "Au",
    insightsAllAccounts: "Tous",
    insightsAllTags: "Toutes",
    insightsAllCategories: "Toutes",
    insightsNoCategory: "Sans catégorie",
    insightsNoTag: "Sans étiquette",
    insightsSaveConfig: "Enregistrer la configuration",
    insightsLoadConfig: "Charger une configuration",
    insightsSetDefault: "Définir par défaut",
    insightsConfigName: "Nom de la configuration",
    insightsConfigNamePlaceholder: "ex. : Revue mensuelle",
    insightsSaveAsDefault: "Définir par défaut",
    insightsSaved: "Configuration enregistrée.",
    insightsLoadConfigTitle: "Charger une configuration",
    insightsNoConfigs: "Aucune configuration enregistrée.",
    insightsDeleteConfig: "Supprimer la configuration",
    insightsDeleteConfigConfirm: "Supprimer cette configuration ?",
    insightsConfigDeleted: "Configuration supprimée.",
    insightsExportPdf: "Exporter en PDF",
    insightsCardReceived: "Liste des montants reçus",
    insightsReceivedListTotal: "Total",
    insightsCardPaid: "Liste des montants payés",
    insightsShowMax: "Afficher",
    insightsShowAll: "Toutes",
    insightsCardByCategory: "Total par catégorie",
    insightsCardTotals: "Total reçu, payé et différence",
    insightsCardBalanceHistory: "Historique du solde",
    insightsCardBalanceAccumulated: "Solde cumulé",
    insightsCardBalanceComparison: "Comparaison du solde (mois par mois)",
    insightsAccount: "Compte",
    insightsNavigateToTop: "Retour en haut",
    insightsTotalReceived: "Total reçu",
    insightsTotalPaid: "Total payé",
    insightsDifference: "Différence",
    insightsDate: "Date",
    insightsDescription: "Description",
    insightsAmount: "Montant",
    insightsCategory: "Catégorie",
    insightsEmpty: "Aucune donnée pour les filtres sélectionnés.",
    insightsMonth: "Mois",
    insightsBalance: "Solde",
    insightsComment: "Commentaire",
    myProfile: "Mon profil",
    userManagement: "Gestion des utilisateurs",
    settings: "Paramètres",
    audit: "Audit",
  },
};

const auth0Locales: Record<string, string> = {
  en: "en",
  pt: "pt",
  es: "es",
  fr: "fr",
};

type HelpContextId = "transactions" | "accounts" | "insights" | "profile";

const HELP_CONTENT: Record<
  HelpContextId,
  {
    titleKey: string;
    introKey: string;
    items: { icon?: string; icons?: string[]; labelKey: string; descKey: string }[];
  }
> = {
  transactions: {
    titleKey: "helpTransactionsTitle",
    introKey: "helpTransactionsIntro",
    items: [
      { icon: "fa-solid fa-magnifying-glass", labelKey: "helpTxSearch", descKey: "helpTxSearchDesc" },
      { icon: "fa-solid fa-list-ol", labelKey: "helpTxRows", descKey: "helpTxRowsDesc" },
      { icon: "fa-solid fa-filter", labelKey: "helpTxFilterAll", descKey: "helpTxFilterAllDesc" },
      { icon: "fa-solid fa-tags", labelKey: "helpTxCategoryFilter", descKey: "helpTxCategoryFilterDesc" },
      { icon: "fa-solid fa-tag", labelKey: "helpTxTagFilter", descKey: "helpTxTagFilterDesc" },
      { icon: "fa-solid fa-file-csv", labelKey: "helpTxExport", descKey: "helpTxExportDesc" },
      { icon: "fa-solid fa-folder", labelKey: "helpTxCategorySelect", descKey: "helpTxCategorySelectDesc" },
      { icon: "fa-solid fa-bell", labelKey: "helpTxAlertIcon", descKey: "helpTxAlertIconDesc" },
      { icon: "fa-regular fa-comment", labelKey: "helpTxCommentIcon", descKey: "helpTxCommentIconDesc" },
      { icon: "fa-solid fa-trash-can", labelKey: "helpTxDeleteIcon", descKey: "helpTxDeleteIconDesc" },
      { icon: "fa-solid fa-tags", labelKey: "helpTxTags", descKey: "helpTxTagsDesc" },
      { icon: "fa-solid fa-circle-dot", labelKey: "helpTxNewBadge", descKey: "helpTxNewBadgeDesc" },
      { icon: "fa-solid fa-square-check", labelKey: "helpTxIncludeInInsights", descKey: "helpTxIncludeInInsightsDesc" },
      { icons: ["fa-solid fa-chevron-up", "fa-solid fa-chevron-down"], labelKey: "helpTxPostingDateArrows", descKey: "helpTxPostingDateArrowsDesc" },
      { icons: ["fa-solid fa-chevron-left", "fa-solid fa-chevron-right"], labelKey: "helpTxPaginationArrows", descKey: "helpTxPaginationArrowsDesc" },
      { icons: ["fa-solid fa-file-lines", "fa-solid fa-link"], labelKey: "helpAccountTypeIcon", descKey: "helpAccountTypeIconDesc" },
    ],
  },
  accounts: {
    titleKey: "helpAccountsTitle",
    introKey: "helpAccountsIntro",
    items: [
      { icon: "fa-solid fa-plus", labelKey: "helpAccountLinkBank", descKey: "helpAccountLinkBankDesc" },
      { icon: "fa-solid fa-list", labelKey: "helpAccountLinkedList", descKey: "helpAccountLinkedListDesc" },
      { icon: "fa-solid fa-rotate", labelKey: "helpAccountFetch", descKey: "helpAccountFetchDesc" },
      { icon: "fa-solid fa-bell", labelKey: "helpAccountAlerts", descKey: "helpAccountAlertsDesc" },
      { icon: "fa-solid fa-trash-can", labelKey: "helpAccountDelete", descKey: "helpAccountDeleteDesc" },
      { icon: "fa-solid fa-plug", labelKey: "helpAccountReconnect", descKey: "helpAccountReconnectDesc" },
      { icons: ["fa-solid fa-file-lines", "fa-solid fa-link"], labelKey: "helpAccountTypeIcon", descKey: "helpAccountTypeIconDesc" },
    ],
  },
  insights: {
    titleKey: "helpInsightsTitle",
    introKey: "helpInsightsIntro",
    items: [
      { icon: "fa-solid fa-calendar", labelKey: "helpInsightsPeriod", descKey: "helpInsightsPeriodDesc" },
      { icon: "fa-solid fa-folder-open", labelKey: "helpInsightsConfigs", descKey: "helpInsightsConfigsDesc" },
      { icon: "fa-solid fa-chart-column", labelKey: "helpInsightsCards", descKey: "helpInsightsCardsDesc" },
    ],
  },
  profile: {
    titleKey: "helpProfileTitle",
    introKey: "helpProfileIntro",
    items: [
      { icon: "fa-solid fa-user", labelKey: "helpProfileName", descKey: "helpProfileNameDesc" },
      { icon: "fa-solid fa-globe", labelKey: "helpProfileCountry", descKey: "helpProfileCountryDesc" },
      { icon: "fa-brands fa-telegram", labelKey: "helpProfileTelegram", descKey: "helpProfileTelegramDesc" },
      { icon: "fa-solid fa-wallet", labelKey: "helpProfileShowBalances", descKey: "helpProfileShowBalancesDesc" },
      { icon: "fa-solid fa-bell", labelKey: "helpProfileTelegramAlerts", descKey: "helpProfileTelegramAlertsDesc" },
      { icon: "fa-solid fa-envelope", labelKey: "helpProfileWeeklyEmails", descKey: "helpProfileWeeklyEmailsDesc" },
    ],
  },
};

function App() {
  const [isDark, setIsDark] = useState(() => {
    try {
      return window.localStorage.getItem("pf_theme") === "dark";
    } catch {
      return false;
    }
  });
  const [language, setLanguage] = useState(() => {
    const stored = window.localStorage.getItem("pf_language");
    if (stored) {
      const match = languages.find((lang) => lang.code === stored);
      if (match) return match;
    }
    const browserLang = navigator.language.split("-")[0];
    return languages.find((lang) => lang.code === browserLang) ?? languages[0];
  });
  const [languageOpen, setLanguageOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userMenuLocked, setUserMenuLocked] = useState(false);
  const userMenuTimerRef = useRef<number | null>(null);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [aboutVersion, setAboutVersion] = useState<string | null>(null);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [signupRequestEmail, setSignupRequestEmail] = useState("");
  const [signupRequestSubmitting, setSignupRequestSubmitting] = useState(false);
  const [signupRequestSuccess, setSignupRequestSuccess] = useState(false);
  const [signupRequestError, setSignupRequestError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<
    "profile" | "users" | "settings" | "audit" | "adminDashboard" | "home" | "transactions" | "accounts" | "insights" | "recurring" | "privacy"
  >("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showToTopButton, setShowToTopButton] = useState(false);
  const [landingCarouselIndex, setLandingCarouselIndex] = useState(0);
  const [featurePreviewSrc, setFeaturePreviewSrc] = useState<string | null>(null);
  const featurePreviewCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const featurePreviewOpenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const FEATURE_PREVIEW_HOVER_MS = 1500;
  const {
    loginWithRedirect,
    logout,
    isAuthenticated,
    user,
    getAccessTokenSilently,
  } = useAuth0();
  const t = translations[language.code] ?? translations.en;
  const auth0Locale = auth0Locales[language.code] ?? "en";
  const apiBase = import.meta.env.VITE_API_URL ?? "";
  const appName = import.meta.env.VITE_APP_NAME || "Bancos";
  const apiBaseNorm = (apiBase || "").replace(/\/$/, "");
  const changelogHref = apiBaseNorm ? `${apiBaseNorm}/api/changelog` : "/api/changelog";

  const [apiToken, setApiToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<null | {
    is_admin: boolean;
    needs_onboarding: boolean;
    display_name: string | null;
    country?: string | null;
    telegram_chat_id?: string | null;
    show_account_balances?: boolean;
    auto_detection_enabled?: boolean;
    telegram_alerts_enabled?: boolean;
    slack_webhook_url?: string | null;
    slack_alerts_enabled?: boolean;
    weekly_emails_enabled?: boolean;
    storage_mode?: "cloud" | "local";
    recurring_initial_detection_run_at?: string | null;
    transactions_filter_preferences?: {
      account_ids?: number[] | null;
      category_ids?: number[] | null;
      tag_ids?: number[] | null;
      include_uncategorized?: boolean;
      include_untagged?: boolean;
      new_only?: boolean;
    } | null;
    status?: string;
    emails: { email: string; is_primary: boolean }[];
  }>(null);
  const [bankConnections, setBankConnections] = useState<
    {
      id: number;
      institution_id: string;
      institution_name: string;
      country: string;
      logo_url?: string | null;
      status: string;
      updated_at: string;
    }[]
  >([]);
  const [bankAccounts, setBankAccounts] = useState<
    {
      id: number;
      bank_connection_id?: number | null;
      account_id?: string | null;
      account_name?: string | null;
      friendly_name?: string | null;
      institution_id: string;
      institution_name: string;
      country: string;
      logo_url?: string | null;
      account_source?: string;
      alert_above_amount?: number | null;
      alert_below_amount?: number | null;
      current_balance?: number | null;
      balance_currency?: string | null;
      balance_updated_at?: string | null;
    }[]
  >([]);
  const [balancesRefreshing, setBalancesRefreshing] = useState(false);
  const balanceRefreshTriggeredRef = useRef(false);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [tags, setTags] = useState<{ id: number; name: string }[]>([]);
  const [transactionsRecent, setTransactionsRecent] = useState<
    {
      id: number;
      bank_account_id?: number;
      institution_name?: string | null;
      account_name?: string | null;
      account_friendly_name?: string | null;
      description?: string | null;
      amount: string;
      currency: string;
      booking_date?: string | null;
      value_date?: string | null;
      posting_date?: string | null;
      status?: string | null;
      include_in_totals?: boolean;
      category_id?: number | null;
      category_name?: string | null;
      tags?: { id: number; name: string }[];
    }[]
  >([]);
  const [toast, setToast] = useState<{
    text: string;
    type: "success" | "warning" | "error";
  } | null>(null);
  const showToast = (text: string, type: "success" | "warning" | "error") => {
    setToast({ text, type });
  };
  const [profileForm, setProfileForm] = useState({
    display_name: "",
    country: "",
    telegram_chat_id: "",
    show_account_balances: true,
    auto_detection_enabled: true,
    telegram_alerts_enabled: true,
    slack_webhook_url: "",
    slack_alerts_enabled: false,
    weekly_emails_enabled: true,
    storage_mode: "cloud" as "cloud" | "local",
  });
  const [telegramLinkCode, setTelegramLinkCode] = useState<{
    code: string;
    bot_username: string;
    bot_link: string;
  } | null>(null);
  const [telegramLinkCodeLoading, setTelegramLinkCodeLoading] = useState(false);
  const [telegramLinkCodeError, setTelegramLinkCodeError] = useState<string | null>(null);
  const [apiTokens, setApiTokens] = useState<{ id: number; name: string; token_prefix: string; created_at: string; last_used_at: string | null }[]>([]);
  const [apiTokensLoading, setApiTokensLoading] = useState(false);
  const [apiTokenCreateModal, setApiTokenCreateModal] = useState<"closed" | "form" | { name: string; token: string; token_prefix: string }>("closed");
  const [apiTokenCreateName, setApiTokenCreateName] = useState("");
  const [apiTokenCreateSubmitting, setApiTokenCreateSubmitting] = useState(false);
  const [apiTokenCopyFeedback, setApiTokenCopyFeedback] = useState(false);
  const [slackHelpOpen, setSlackHelpOpen] = useState(false);
  const [slackTestLoading, setSlackTestLoading] = useState(false);
  const slackHelpRef = useRef<HTMLDivElement>(null);
  type ProfileTabId = "user" | "channels" | "alerts" | "storage" | "tokens";
  const [profileTab, setProfileTab] = useState<ProfileTabId>("user");
  useEffect(() => {
    if (!slackHelpOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSlackHelpOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (slackHelpRef.current && !slackHelpRef.current.contains(e.target as Node)) setSlackHelpOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick, true);
    };
  }, [slackHelpOpen]);
  const [apiTokenDeleteConfirm, setApiTokenDeleteConfirm] = useState<number | null>(null);
  const apiTokenCreateModalOpenRef = useRef(false);
  apiTokenCreateModalOpenRef.current = apiTokenCreateModal !== "closed";
  const [accountNameModal, setAccountNameModal] = useState<{
    open: boolean;
    accountId: number | null;
    value: string;
  }>({ open: false, accountId: null, value: "" });
  const [accountAlertsModal, setAccountAlertsModal] = useState<{
    open: boolean;
    accountId: number | null;
    accountLabel: string;
    alert_above_amount: string;
    alert_below_amount: string;
  }>({
    open: false,
    accountId: null,
    accountLabel: "",
    alert_above_amount: "0",
    alert_below_amount: "-100",
  });
  const accountAlertsModalOpenRef = useRef(false);
  accountAlertsModalOpenRef.current = accountAlertsModal.open;
  const accountAlertsOverlayRef = useRef<HTMLDivElement>(null);
  const [accountAlertsDeleteRecurringId, setAccountAlertsDeleteRecurringId] = useState<number | null>(null);
  const accountAlertsDeleteRecurringIdRef = useRef<number | null>(null);
  accountAlertsDeleteRecurringIdRef.current = accountAlertsDeleteRecurringId;
  const accountAlertsDeleteOverlayRef = useRef<HTMLDivElement>(null);
  type RecurringTransactionItem = {
    id: number;
    bank_account_id: number;
    name: string;
    description_pattern: string | null;
    frequency: string;
    anchor_day: number;
    day_tolerance_before: number;
    day_tolerance_after: number;
    expected_amount: string | null;
    amount_tolerance_below: string;
    amount_tolerance_above: string;
    alert_on_occurrence: boolean;
    alert_on_missing: boolean;
    missing_grace_days: number;
    next_expected_date: string | null;
    created_at: string;
  };
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransactionItem[]>([]);
  const [createAlertModal, setCreateAlertModal] = useState<{
    open: boolean;
    txId: number;
    description: string | null;
    amount: string;
    currency: string;
    dayOfMonth: number;
    day_tolerance_before: string;
    day_tolerance_after: string;
    value_tolerance_below: string;
    value_tolerance_above: string;
  }>({
    open: false,
    txId: 0,
    description: null,
    amount: "",
    currency: "",
    dayOfMonth: 1,
    day_tolerance_before: "1",
    day_tolerance_after: "1",
    value_tolerance_below: "1",
    value_tolerance_above: "1",
  });
  const [deleteAccountModal, setDeleteAccountModal] = useState<{
    open: boolean;
    connectionId: number | null;
    label: string;
  }>({ open: false, connectionId: null, label: "" });
  const [exportModal, setExportModal] = useState<{
    open: boolean;
    dateMode: "all" | "range";
    dateFrom: string;
    dateTo: string;
    accountMode: "all" | "selected";
    selectedAccountIds: number[];
    categoryMode: "all" | "selected" | "empty";
    selectedCategoryIds: number[];
    tagMode: "all" | "selected";
    selectedTagIds: number[];
    decimalSeparator: "period" | "comma";
    thousandsSeparator: "none" | "comma" | "period";
  }>({
    open: false,
    dateMode: "all",
    dateFrom: "",
    dateTo: "",
    accountMode: "all",
    selectedAccountIds: [],
    categoryMode: "all",
    selectedCategoryIds: [],
    tagMode: "all",
    selectedTagIds: [],
    decimalSeparator: "period",
    thousandsSeparator: "none",
  });
  const [transactionsAll, setTransactionsAll] = useState<
    {
      id: number;
      bank_account_id?: number;
      institution_name?: string | null;
      account_name?: string | null;
      account_friendly_name?: string | null;
      description?: string | null;
      amount: string;
      currency: string;
      booking_date?: string | null;
      value_date?: string | null;
      posting_date?: string | null;
      status?: string | null;
      include_in_totals?: boolean;
      category_id?: number | null;
      category_name?: string | null;
      tags?: { id: number; name: string }[];
      is_new?: boolean;
      comment?: string | null;
      has_alert?: boolean;
    }[]
  >([]);
  const [transactionEditTags, setTransactionEditTags] = useState<number | null>(null);
  const [transactionsTotal, setTransactionsTotal] = useState(0);
  const [transactionsPage, setTransactionsPage] = useState(0);
  const [transactionsPageSize, setTransactionsPageSize] = useState(10);
  const [transactionsSearch, setTransactionsSearch] = useState("");
  const [transactionsCategoryIds, setTransactionsCategoryIds] = useState<number[] | null>(null);
  const [transactionsTagIds, setTransactionsTagIds] = useState<number[] | null>(null);
  const [transactionsIncludeUncategorized, setTransactionsIncludeUncategorized] = useState(true);
  const [transactionsIncludeUntagged, setTransactionsIncludeUntagged] = useState(true);
  const [transactionsAccountFilter, setTransactionsAccountFilter] = useState<number[]>([]);
  const [transactionsNewOnly, setTransactionsNewOnly] = useState(false);
  const [transactionsCategoriesDropdownOpen, setTransactionsCategoriesDropdownOpen] = useState(false);
  const [transactionsTagsDropdownOpen, setTransactionsTagsDropdownOpen] = useState(false);
  const [transactionDeleteConfirm, setTransactionDeleteConfirm] = useState<{
    id: number;
    description?: string;
  } | null>(null);
  const [transactionCommentModal, setTransactionCommentModal] = useState<{
    txId: number;
    description?: string | null;
    comment: string;
  } | null>(null);
  const [helpModalContext, setHelpModalContext] = useState<HelpContextId | null>(null);
  const transactionsCategoriesDropdownRef = useRef<HTMLDivElement>(null);
  const transactionsTagsDropdownRef = useRef<HTMLDivElement>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [accessDeniedFromAuth0, setAccessDeniedFromAuth0] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "access_denied") {
      setAccessDeniedFromAuth0(true);
      params.delete("error");
      params.delete("error_description");
      params.delete("state");
      const query = params.toString();
      const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    try {
      window.localStorage.setItem("pf_theme", isDark ? "dark" : "light");
    } catch {
      // ignore
    }
  }, [isDark]);

  useEffect(() => {
    document.documentElement.lang = language.code;
    if (isAuthenticated) {
      window.localStorage.setItem("pf_language", language.code);
    }
  }, [language.code, isAuthenticated]);

  // When not logged in (landing page), match browser language (pt, es, fr, en or default en)
  useEffect(() => {
    if (!isAuthenticated) {
      const browserLang = navigator.language.split("-")[0].toLowerCase();
      const match = languages.find((lang) => lang.code === browserLang);
      setLanguage(match ?? languages[0]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const onScroll = () =>
      setShowToTopButton(window.scrollY > window.innerHeight * 0.5);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const PERSISTED_SECTIONS = ["transactions", "accounts", "insights", "recurring"] as const;
  const ACTIVE_SECTION_KEY = "pf_active_section";

  // Restore persisted section when authenticated; otherwise default to transactions
  useEffect(() => {
    if (isAuthenticated && activeSection === "home") {
      try {
        const stored = window.localStorage.getItem(ACTIVE_SECTION_KEY);
        const valid = stored && PERSISTED_SECTIONS.includes(stored as (typeof PERSISTED_SECTIONS)[number]);
        setActiveSection(valid ? (stored as (typeof PERSISTED_SECTIONS)[number]) : "transactions");
      } catch {
        setActiveSection("transactions");
      }
    }
  }, [isAuthenticated, activeSection]);

  // Persist active section when it is one of the main tabs
  useEffect(() => {
    if (PERSISTED_SECTIONS.includes(activeSection as (typeof PERSISTED_SECTIONS)[number])) {
      try {
        window.localStorage.setItem(ACTIVE_SECTION_KEY, activeSection);
      } catch {
        // ignore
      }
    }
  }, [activeSection]);

  // Sync section from pathname on load and when user uses browser back/forward (privacy at /privacy, homepage at /)
  useEffect(() => {
    if (window.location.pathname === "/privacy") {
      setActiveSection("privacy");
    }
  }, []);

  useEffect(() => {
    const onPopState = () => {
      if (window.location.pathname === "/privacy") {
        setActiveSection("privacy");
      } else if (window.location.pathname === "/" || window.location.pathname === "") {
        setActiveSection(isAuthenticated ? "transactions" : "home");
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isAuthenticated]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") ?? params.get("ref");
    let didChange = false;
    if (reference) {
      window.localStorage.setItem("pf_bank_reference", reference);
      params.delete("reference");
      params.delete("ref");
      didChange = true;
    }
    const section = params.get("section");
    if (section === "accounts" && isAuthenticated) {
      setActiveSection("accounts");
      params.delete("section");
      didChange = true;
    }
    // Redirect ?section=privacy to /privacy so Privacy Policy has a distinct URL for Google
    if (section === "privacy") {
      setActiveSection("privacy");
      window.history.replaceState({}, "", "/privacy");
      return;
    }
    if (didChange) {
      const query = params.toString();
      const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!aboutModalOpen) return;
    let cancelled = false;
    const versionUrl = apiBaseNorm ? `${apiBaseNorm}/api/version` : "/api/version";
    fetch(versionUrl)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Not ok"))))
      .then((data) => {
        if (!cancelled && data?.version) setAboutVersion(String(data.version).trim() || "—");
      })
      .catch(() => {
        if (cancelled) return;
        fetch("/version.txt")
          .then((res) => (res.ok ? res.text() : Promise.reject(new Error("Not ok"))))
          .then((text) => {
            if (!cancelled) setAboutVersion((text ?? "").trim() || "—");
          })
          .catch(() => {
            if (!cancelled) setAboutVersion("—");
          });
      });
    return () => {
      cancelled = true;
    };
  }, [aboutModalOpen, apiBaseNorm]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated) {
        setProfile(null);
        setAuthError(null);
        return;
      }

      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        });
        setApiToken(token);
        const response = await fetch(`${apiBase}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          setProfile(await response.json());
          setAuthError(null);
          if (!sessionStorage.getItem("pf_audit_login_recorded")) {
            try {
              await fetch(`${apiBase}/api/audit/login-record`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
              });
              sessionStorage.setItem("pf_audit_login_recorded", "1");
            } catch {
              // ignore
            }
          }
        } else {
          setProfile(null);
          setAuthError(response.status >= 500 ? "server_error" : "not_authorized");
        }
      } catch (error) {
        setProfile(null);
        // Network/connection failure (e.g. backend not running) -> show server unreachable, not "access denied"
        const isNetworkError =
          error instanceof TypeError &&
          (error.message === "Failed to fetch" || (error as Error).message?.toLowerCase().includes("fetch"));
        setAuthError(isNetworkError ? "server_error" : "not_authorized");
      }
    };

    loadProfile();
  }, [apiBase, getAccessTokenSilently, isAuthenticated]);

  const handleLogout = useCallback(async () => {
    try {
      if (apiToken) {
        await fetch(`${apiBase}/api/audit/logout-record`, {
          method: "POST",
          headers: { Authorization: `Bearer ${apiToken}` },
        });
      }
    } catch {
      // ignore
    }
    sessionStorage.removeItem("pf_audit_login_recorded");
    setUserMenuLocked(true);
    setUserMenuOpen(false);
    logout({ logoutParams: { returnTo: window.location.origin } });
  }, [apiBase, apiToken, logout]);

  const loadConnections = useCallback(async () => {
    if (!apiToken) {
      setBankConnections([]);
      return;
    }
    try {
      const response = await fetch(`${apiBase}/api/banks/connections`, {
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      if (response.ok) {
        setBankConnections(await response.json());
      }
    } catch {
      setBankConnections([]);
    }
  }, [apiBase, apiToken]);

  const loadAccounts = useCallback(async () => {
    if (!apiToken) {
      setBankAccounts([]);
      return;
    }
    try {
      const response = await fetch(`${apiBase}/api/accounts?_t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${apiToken}` },
        cache: "no-store",
      });
      if (response.ok) {
        setBankAccounts(await response.json());
      }
    } catch {
      setBankAccounts([]);
    }
  }, [apiBase, apiToken]);

  const loadApiTokens = useCallback(async () => {
    if (!apiToken) {
      setApiTokens([]);
      return;
    }
    setApiTokensLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/me/tokens`, {
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      if (response.ok) {
        setApiTokens(await response.json());
      } else {
        setApiTokens([]);
      }
    } catch {
      setApiTokens([]);
    } finally {
      setApiTokensLoading(false);
    }
  }, [apiBase, apiToken]);

  const loadCategories = useCallback(async () => {
    if (!apiToken) return;
    try {
      const response = await fetch(`${apiBase}/api/categories`, {
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      if (response.ok) setCategories(await response.json());
    } catch {
      // ignore network errors; categories stay as-is
    }
  }, [apiBase, apiToken]);

  const loadTags = useCallback(async () => {
    if (!apiToken) return;
    try {
      const response = await fetch(`${apiBase}/api/tags`, {
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      if (response.ok) setTags(await response.json());
    } catch {
      // ignore network errors; tags stay as-is
    }
  }, [apiBase, apiToken]);

  const loadRecentTransactions = useCallback(async () => {
    if (!apiToken) {
      setTransactionsRecent([]);
      return;
    }
    try {
      const response = await fetch(`${apiBase}/api/transactions?limit=5`, {
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTransactionsRecent(Array.isArray(data) ? data : data.items ?? []);
      }
    } catch {
      setTransactionsRecent([]);
    }
  }, [apiBase, apiToken]);

  const loadAllTransactions = useCallback(async () => {
    if (!apiToken) {
      setTransactionsAll([]);
      return;
    }
    // User has accounts but unchecked all: show no transactions (do not request API).
    if (bankAccounts.length > 0 && transactionsAccountFilter.length === 0) {
      setTransactionsAll([]);
      setTransactionsTotal(0);
      return;
    }
    const params = new URLSearchParams();
    params.set("limit", String(transactionsPageSize));
    params.set("offset", String(transactionsPage * transactionsPageSize));
    if (transactionsSearch) {
      params.set("q", transactionsSearch);
    }
    if (transactionsAccountFilter.length > 0) {
      params.set("accounts", transactionsAccountFilter.join(","));
    }
    if (transactionsCategoryIds !== null) {
      params.set("categories", transactionsCategoryIds.join(","));
      params.set("include_uncategorized", String(transactionsIncludeUncategorized));
    }
    if (transactionsTagIds !== null) {
      params.set("tags", transactionsTagIds.join(","));
      params.set("include_untagged", String(transactionsIncludeUntagged));
    } else if (!transactionsIncludeUntagged && tags.length > 0) {
      params.set("tags", tags.map((tag) => tag.id).join(","));
      params.set("include_untagged", "false");
    }
    if (transactionsNewOnly) {
      params.set("new_only", "true");
    }
    try {
      const response = await fetch(`${apiBase}/api/transactions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setTransactionsAll(data);
          setTransactionsTotal(data.length);
        } else {
          setTransactionsAll(data.items ?? []);
          setTransactionsTotal(data.total ?? 0);
        }
      }
    } catch {
      setTransactionsAll([]);
      setTransactionsTotal(0);
    }
  }, [
    apiBase,
    apiToken,
    bankAccounts.length,
    tags,
    transactionsPage,
    transactionsPageSize,
    transactionsSearch,
    transactionsAccountFilter,
    transactionsCategoryIds,
    transactionsTagIds,
    transactionsIncludeUncategorized,
    transactionsIncludeUntagged,
    transactionsNewOnly,
  ]);

  const refreshBalances = useCallback(async () => {
    if (!apiToken) return;
    setBalancesRefreshing(true);
    const headers = { Authorization: `Bearer ${apiToken}` };
    try {
      const balanceRes = await fetch(`${apiBase}/api/accounts/refresh-balances`, {
        method: "POST",
        headers,
      });
      if (balanceRes.status === 429) {
        showToast(t.gocardlessRateLimitExceeded, "warning");
        setBalancesRefreshing(false);
        return;
      }
      if (balanceRes.ok) {
        const data = await balanceRes.json().catch(() => ({}));
        await loadAccounts();
        if (data.rate_limit_hit) {
          showToast(t.refreshBalancesPartialRateLimit, "warning");
        }
      }

      const connectionIds = [
        ...new Set(
          bankAccounts
            .map((a) => a.bank_connection_id)
            .filter((id): id is number => id != null)
        ),
      ];
      if (connectionIds.length === 0) {
        setBalancesRefreshing(false);
        return;
      }

      showToast(t.fetchInProgressMessage, "warning");
      const pending = new Set(connectionIds);
      const fetchPromises = connectionIds.map(async (connectionId) => {
        const res = await fetch(
          `${apiBase}/api/banks/connections/${connectionId}/transactions/fetch`,
          { method: "POST", headers }
        );
        return res.status === 202 ? connectionId : null;
      });
      const started = (await Promise.all(fetchPromises)).filter(
        (id): id is number => id != null
      );
      if (started.length === 0) {
        setBalancesRefreshing(false);
        return;
      }

      const poll = async () => {
        let anyPending = false;
        let hadFailure = false;
        let hadRateLimit = false;
        await Promise.all(
          started.map(async (connectionId) => {
            const statusRes = await fetch(
              `${apiBase}/api/banks/connections/${connectionId}/transactions/status`,
              { headers }
            );
            if (!statusRes.ok) return;
            const data = await statusRes.json();
            if (data.status === "completed" || data.status === "failed" || data.status === "rate_limited") {
              pending.delete(connectionId);
              if (data.status === "failed") hadFailure = true;
              if (data.status === "rate_limited") hadRateLimit = true;
            } else {
              anyPending = true;
            }
          })
        );
        if (!anyPending || pending.size === 0) {
          if (intervalId) clearInterval(intervalId);
          if (hadRateLimit) showToast(t.gocardlessRateLimitExceeded, "warning");
          else if (hadFailure) showToast(t.fetchFailed, "error");
          else showToast(t.fetchCompleted, "success");
          await loadAccounts();
          loadRecentTransactions();
          if (activeSection === "transactions") loadAllTransactions();
          setBalancesRefreshing(false);
        }
      };
      let intervalId: ReturnType<typeof setInterval> | null = setInterval(poll, 2500);
      poll();
    } catch {
      setBalancesRefreshing(false);
    }
  }, [
    apiBase,
    apiToken,
    bankAccounts,
    loadAccounts,
    loadRecentTransactions,
    loadAllTransactions,
    activeSection,
    t.gocardlessRateLimitExceeded,
    t.fetchInProgressMessage,
    t.fetchCompleted,
    t.fetchFailed,
    showToast,
  ]);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    if (activeSection === "profile" && apiToken) loadApiTokens();
  }, [activeSection, apiToken, loadApiTokens]);

  // Refetch profile when opening Profile section so storage_mode and other prefs are up to date
  useEffect(() => {
    if (activeSection !== "profile" || !apiToken || !apiBase) return;
    let cancelled = false;
    fetch(`${apiBase}/api/me`, { headers: { Authorization: `Bearer ${apiToken}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setProfile(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [activeSection, apiToken, apiBase]);

  useEffect(() => {
    loadRecentTransactions();
  }, [loadRecentTransactions]);

  const transactionsSkipNextPersistRef = useRef(false);
  const transactionsSkipNextApplyRef = useRef(false);

  // Apply saved transactions filter preferences when profile loads (not when profile was just updated by our own persist)
  useEffect(() => {
    if (transactionsSkipNextApplyRef.current) {
      transactionsSkipNextApplyRef.current = false;
      return;
    }
    const p = profile?.transactions_filter_preferences;
    if (!p) return;
    transactionsSkipNextPersistRef.current = true;
    if (p.account_ids !== undefined && p.account_ids !== null) {
      setTransactionsAccountFilter(Array.isArray(p.account_ids) ? p.account_ids : []);
    }
    if (p.category_ids !== undefined && p.category_ids !== null) {
      setTransactionsCategoryIds(Array.isArray(p.category_ids) ? (p.category_ids.length ? p.category_ids : null) : null);
    }
    if (p.tag_ids !== undefined && p.tag_ids !== null) {
      setTransactionsTagIds(Array.isArray(p.tag_ids) ? (p.tag_ids.length ? p.tag_ids : null) : null);
    }
    if (p.include_uncategorized !== undefined) setTransactionsIncludeUncategorized(p.include_uncategorized);
    if (p.include_untagged !== undefined) setTransactionsIncludeUntagged(p.include_untagged);
    if (p.new_only !== undefined) setTransactionsNewOnly(p.new_only);
  }, [profile?.transactions_filter_preferences]);

  // Persist transactions filter preferences when user changes them
  useEffect(() => {
    if (!apiToken || !profile) return;
    if (transactionsSkipNextPersistRef.current) {
      transactionsSkipNextPersistRef.current = false;
      return;
    }
    const payload = {
      account_ids: transactionsAccountFilter,
      category_ids: transactionsCategoryIds,
      tag_ids: transactionsTagIds,
      include_uncategorized: transactionsIncludeUncategorized,
      include_untagged: transactionsIncludeUntagged,
      new_only: transactionsNewOnly,
    };
    fetch(`${apiBase}/api/me`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ transactions_filter_preferences: payload }),
    })
      .then((res) => res.ok && res.json())
      .then((updated) => {
        if (updated) {
          transactionsSkipNextApplyRef.current = true;
          setProfile(updated);
        }
      })
      .catch(() => {});
  }, [
    apiBase,
    apiToken,
    transactionsAccountFilter,
    transactionsCategoryIds,
    transactionsTagIds,
    transactionsIncludeUncategorized,
    transactionsIncludeUntagged,
    transactionsNewOnly,
  ]);

  const transactionsCategoriesLabel =
    transactionsCategoryIds === null && transactionsIncludeUncategorized
      ? t.filterCategoryAll
      : transactionsCategoryIds !== null && transactionsCategoryIds.length > 0
        ? `${transactionsCategoryIds.length + (transactionsIncludeUncategorized ? 1 : 0)} ${t.insightsCategories}`
        : transactionsIncludeUncategorized
          ? t.insightsNoCategory
          : t.insightsCategories;
  const transactionsTagsLabel =
    transactionsTagIds === null && transactionsIncludeUntagged
      ? t.filterCategoryAll
      : transactionsTagIds !== null && transactionsTagIds.length > 0
        ? `${transactionsTagIds.length + (transactionsIncludeUntagged ? 1 : 0)} ${t.insightsTags}`
        : transactionsIncludeUntagged
          ? t.insightsNoTag
          : t.insightsTags;
  const toggleTransactionsCategory = (id: number) => {
    setTransactionsCategoryIds((prev) => {
      const allIds = categories.map((c) => c.id);
      const selected = prev === null ? allIds : prev;
      const next = selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id];
      if (next.length === 0) return [];
      if (next.length === categories.length) return null;
      return next;
    });
    setTransactionsPage(0);
  };
  const toggleTransactionsTag = (id: number) => {
    setTransactionsTagIds((prev) => {
      const allIds = tags.map((tag) => tag.id);
      const selected = prev === null ? allIds : prev;
      const next = selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id];
      if (next.length === 0) return [];
      if (next.length === tags.length) return null;
      return next;
    });
    setTransactionsPage(0);
  };
  const transactionsCategoryChecked = (id: number) =>
    transactionsCategoryIds === null || (transactionsCategoryIds !== null && transactionsCategoryIds.includes(id));
  const transactionsTagChecked = (id: number) =>
    transactionsTagIds === null || (transactionsTagIds !== null && transactionsTagIds.includes(id));

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (transactionsCategoriesDropdownRef.current?.contains(target)) return;
      if (transactionsTagsDropdownRef.current?.contains(target)) return;
      setTransactionsCategoriesDropdownOpen(false);
      setTransactionsTagsDropdownOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  useEffect(() => {
    if (!transactionDeleteConfirm) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTransactionDeleteConfirm(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [transactionDeleteConfirm]);

  useEffect(() => {
    if (!transactionCommentModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTransactionCommentModal(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [transactionCommentModal]);

  useEffect(() => {
    if (!helpModalContext) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHelpModalContext(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [helpModalContext]);

  useEffect(() => {
    if (!featurePreviewSrc) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Esc") {
        setFeaturePreviewSrc(null);
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [featurePreviewSrc]);

  useEffect(() => {
    if (!aboutModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Esc") setAboutModalOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [aboutModalOpen]);

  useEffect(() => {
    return () => {
      if (featurePreviewCloseTimeoutRef.current) clearTimeout(featurePreviewCloseTimeoutRef.current);
      if (featurePreviewOpenTimeoutRef.current) clearTimeout(featurePreviewOpenTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (bankAccounts.length === 0) {
      setTransactionsAccountFilter([]);
      return;
    }
    setTransactionsAccountFilter((prev) => {
      if (prev.length === 0) {
        return bankAccounts.map((account) => account.id);
      }
      const next = prev.filter((id) => bankAccounts.some((account) => account.id === id));
      bankAccounts.forEach((account) => {
        if (!next.includes(account.id)) {
          next.push(account.id);
        }
      });
      return next;
    });
  }, [bankAccounts]);

  // When entering Transactions, load accounts/categories/tags once (avoids loop: loadAccounts→bankAccounts→filter effect→loadAllTransactions ref change)
  useEffect(() => {
    if (activeSection === "transactions") {
      loadAccounts();
      loadCategories();
      loadTags();
    }
  }, [activeSection, loadAccounts, loadCategories, loadTags]);

  // When on Transactions, load transaction list (runs when filters/pagination change via loadAllTransactions deps)
  useEffect(() => {
    if (activeSection === "transactions") {
      loadAllTransactions();
    }
  }, [activeSection, loadAllTransactions]);

  // Auto-refresh balances once when on Transactions and any automatic account has no balance (skip manual accounts)
  useEffect(() => {
    if (
      activeSection !== "transactions" ||
      !profile?.show_account_balances ||
      bankAccounts.length === 0 ||
      balanceRefreshTriggeredRef.current
    ) {
      return;
    }
    const automaticAccounts = bankAccounts.filter((a) => a.bank_connection_id != null);
    const hasMissingBalance = automaticAccounts.some((a) => a.current_balance == null);
    if (!hasMissingBalance) return;
    balanceRefreshTriggeredRef.current = true;
    refreshBalances();
  }, [activeSection, profile?.show_account_balances, bankAccounts, refreshBalances]);

  useEffect(() => {
    const refresh = () => {
      loadConnections();
      loadAccounts();
      loadRecentTransactions();
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [loadAccounts, loadConnections]);

  const formatConnectionTooltip = (updatedAt: string) => {
    const date = new Date(updatedAt);
    const formatted = Number.isNaN(date.getTime())
      ? updatedAt
      : date.toLocaleDateString(language.code, {
          year: "numeric",
          month: "short",
          day: "2-digit",
        });
    return `${t.statusConnected} - ${t.statusLastUpdated} ${formatted}`;
  };

  const getLocale = () => {
    if (profile?.country) {
      return `${language.code}-${profile.country}`;
    }
    return language.code;
  };

  const formatAmount = (amount: string, currency: string) => {
    const value = Number(amount);
    if (Number.isNaN(value)) return `${amount} ${currency}`.trim();
    try {
      return new Intl.NumberFormat(getLocale(), {
        style: "currency",
        currency,
        currencyDisplay: "narrowSymbol",
      }).format(value);
    } catch {
      return `${amount} ${currency}`.trim();
    }
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(getLocale(), {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(date);
  };

  const getConnectionAccounts = (connectionId: number) => {
    const seen = new Set<string | number>();
    return bankAccounts.filter((account) => {
      if (account.bank_connection_id !== connectionId) return false;
      const key = account.account_id ?? account.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const isEscape = (e: KeyboardEvent) => e.key === "Escape" || e.key === "Esc";

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isEscape(event)) return;
      if (accountAlertsDeleteRecurringIdRef.current != null) {
        setAccountAlertsDeleteRecurringId(null);
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (apiTokenCreateModalOpenRef.current) {
        setApiTokenCreateModal("closed");
        setApiTokenCreateName("");
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (accountNameModal.open) {
        setAccountNameModal({ open: false, accountId: null, value: "" });
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (exportModal.open) {
        setExportModal((prev) => ({ ...prev, open: false }));
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (accountAlertsModalOpenRef.current) {
        setAccountAlertsModal({
          open: false,
          accountId: null,
          accountLabel: "",
          alert_above_amount: "0",
          alert_below_amount: "-100",
        });
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (deleteAccountModal.open) {
        setDeleteAccountModal({ open: false, connectionId: null, label: "" });
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    };
    document.documentElement.addEventListener("keydown", onKeyDown, true);
    return () => document.documentElement.removeEventListener("keydown", onKeyDown, true);
  }, [accountNameModal.open, accountAlertsModal.open, accountAlertsDeleteRecurringId, apiTokenCreateModal, deleteAccountModal.open, exportModal.open]);

  useEffect(() => {
    if (accountAlertsDeleteRecurringId == null) return;
    const raf = requestAnimationFrame(() => {
      accountAlertsDeleteOverlayRef.current?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [accountAlertsDeleteRecurringId]);

  useEffect(() => {
    if (!accountAlertsModal.open) return;
    const raf = requestAnimationFrame(() => {
      accountAlertsOverlayRef.current?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [accountAlertsModal.open]);

  useEffect(() => {
    const rawStorageMode = profile?.storage_mode;
    const storageMode: "cloud" | "local" =
      rawStorageMode === "local" ? "local" : "cloud";
    setProfileForm({
      display_name: profile?.display_name ?? "",
      country: profile?.country ?? "",
      telegram_chat_id: profile?.telegram_chat_id ?? "",
      show_account_balances: profile?.show_account_balances ?? true,
      auto_detection_enabled: profile?.auto_detection_enabled ?? true,
      telegram_alerts_enabled: profile?.telegram_alerts_enabled ?? true,
      slack_webhook_url: profile?.slack_webhook_url ?? "",
      slack_alerts_enabled: profile?.slack_alerts_enabled ?? false,
      weekly_emails_enabled: profile?.weekly_emails_enabled ?? true,
      storage_mode: storageMode,
    });
  }, [profile]);

  useEffect(() => {
    if (activeSection === "profile") setProfileTab("user");
  }, [activeSection]);

  // When user sends the link code to the bot, profile gets telegram_chat_id; clear the code UI
  useEffect(() => {
    if (telegramLinkCode && profile?.telegram_chat_id) {
      setTelegramLinkCode(null);
      setTelegramLinkCodeError(null);
    }
  }, [telegramLinkCode, profile?.telegram_chat_id]);

  // Poll profile while waiting for user to send the code to the bot
  useEffect(() => {
    if (!telegramLinkCode || profile?.telegram_chat_id || !apiToken) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${apiBase}/api/me`, {
          headers: { Authorization: `Bearer ${apiToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.telegram_chat_id) {
            setProfile(data);
            setTelegramLinkCode(null);
          }
        }
      } catch {
        // ignore
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [telegramLinkCode, profile?.telegram_chat_id, apiToken, apiBase]);

  const handleTelegramLinkCode = async () => {
    if (!apiToken) return;
    setTelegramLinkCodeError(null);
    setTelegramLinkCodeLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/telegram/link-code`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      if (!response.ok) {
        setTelegramLinkCodeError(t.profileTelegramLinkError);
        return;
      }
      const data = await response.json();
      setTelegramLinkCode({
        code: data.code,
        bot_username: data.bot_username || "",
        bot_link: data.bot_link || "",
      });
    } catch {
      setTelegramLinkCodeError(t.profileTelegramLinkError);
    } finally {
      setTelegramLinkCodeLoading(false);
    }
  };

  const handleProfileSave = async () => {
    if (!apiToken) return;
    const response = await fetch(`${apiBase}/api/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        display_name: profileForm.display_name || null,
        country: profileForm.country || null,
        telegram_chat_id: profileForm.telegram_chat_id || null,
        show_account_balances: profileForm.show_account_balances,
        auto_detection_enabled: profileForm.auto_detection_enabled,
        telegram_alerts_enabled: profileForm.telegram_alerts_enabled,
        slack_webhook_url: profileForm.slack_webhook_url?.trim() || null,
        slack_alerts_enabled: profileForm.slack_alerts_enabled,
        weekly_emails_enabled: profileForm.weekly_emails_enabled,
        storage_mode: profileForm.storage_mode === "local" ? "local" : "cloud",
      }),
    });
    if (response.ok) {
      const data = await response.json();
      // Preserve slack_webhook_url in profile if API omits it (so form sync keeps the value)
      if (data.slack_webhook_url === undefined && (profileForm.slack_webhook_url?.trim() ?? "")) {
        data.slack_webhook_url = profileForm.slack_webhook_url.trim();
      }
      setProfile(data);
      showToast(t.profileSaved, "success");
    } else {
      showToast(t.profileSaveError, "error");
    }
  };

  const handleUpdateAccountName = async () => {
    if (!apiToken) return;
    if (!accountNameModal.accountId) return;
    const nextName = accountNameModal.value.trim();
    if (!nextName) return;
    const response = await fetch(
      `${apiBase}/api/accounts/${accountNameModal.accountId}`,
      {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
        body: JSON.stringify({ friendly_name: nextName }),
      }
    );
    if (response.ok) {
      const accountId = accountNameModal.accountId;
      setBankAccounts((prev) =>
        prev.map((acc) =>
          acc.id === accountId ? { ...acc, friendly_name: nextName } : acc
        )
      );
      await loadAccounts();
      await loadRecentTransactions();
      if (activeSection === "transactions") {
        await loadAllTransactions();
      }
      setToast({ text: t.profileSaved, type: "success" });
      setAccountNameModal({ open: false, accountId: null, value: "" });
    } else {
      setToast({ text: t.profileSaveError, type: "error" });
    }
  };

  const handleExportTransactions = async () => {
    if (!apiToken) return;
    const params = new URLSearchParams();
    if (exportModal.dateMode === "range" && exportModal.dateFrom) {
      params.set("date_from", exportModal.dateFrom);
    }
    if (exportModal.dateMode === "range" && exportModal.dateTo) {
      params.set("date_to", exportModal.dateTo);
    }
    if (exportModal.accountMode === "selected" && exportModal.selectedAccountIds.length > 0) {
      params.set("accounts", exportModal.selectedAccountIds.join(","));
    }
    if (exportModal.categoryMode === "empty") {
      params.set("has_category", "no");
    } else if (exportModal.categoryMode === "selected" && exportModal.selectedCategoryIds.length > 0) {
      params.set("categories", exportModal.selectedCategoryIds.join(","));
    }
    if (exportModal.tagMode === "selected" && exportModal.selectedTagIds.length > 0) {
      params.set("tags", exportModal.selectedTagIds.join(","));
    }
    params.set("decimal_sep", exportModal.decimalSeparator);
    params.set("thousands_sep", exportModal.thousandsSeparator);
    const url = `${apiBase}/api/transactions/export?${params.toString()}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiToken}` },
    });
    if (!response.ok) {
      showToast(t.transactionUpdateError, "error");
      return;
    }
    const blob = await response.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    setExportModal((prev) => ({ ...prev, open: false }));
    showToast(t.exportSuccess, "success");
  };

  const handleTransactionIncludeInTotals = async (txId: number, include: boolean) => {
    if (!apiToken) return;
    setTransactionsAll((prev) =>
      prev.map((tx) => (tx.id === txId ? { ...tx, include_in_totals: include } : tx))
    );
    setTransactionsRecent((prev) =>
      prev.map((tx) => (tx.id === txId ? { ...tx, include_in_totals: include } : tx))
    );
    const response = await fetch(`${apiBase}/api/transactions/${txId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ include_in_totals: include }),
    });
    if (!response.ok) {
      setTransactionsAll((prev) =>
        prev.map((tx) => (tx.id === txId ? { ...tx, include_in_totals: !include } : tx))
      );
      setTransactionsRecent((prev) =>
        prev.map((tx) => (tx.id === txId ? { ...tx, include_in_totals: !include } : tx))
      );
      showToast(t.transactionUpdateError, "error");
    }
  };

  const handleTransactionCategoryChange = async (txId: number, categoryId: number | null) => {
    if (!apiToken) return;
    const tx = transactionsAll.find((x) => x.id === txId);
    const categoryName = categoryId ? categories.find((c) => c.id === categoryId)?.name : null;
    setTransactionsAll((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, category_id: categoryId, category_name: categoryName ?? undefined } : t))
    );
    setTransactionsRecent((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, category_id: categoryId, category_name: categoryName ?? undefined } : t))
    );
    const response = await fetch(`${apiBase}/api/transactions/${txId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ category_id: categoryId }),
    });
    if (!response.ok) {
      setTransactionsAll((prev) =>
        prev.map((t) => (t.id === txId && tx ? { ...t, category_id: tx.category_id, category_name: tx.category_name } : t))
      );
      setTransactionsRecent((prev) =>
        prev.map((t) => (t.id === txId && tx ? { ...t, category_id: tx.category_id, category_name: tx.category_name } : t))
      );
      showToast(t.transactionUpdateError, "error");
    }
  };

  const handleTransactionMarkNotNew = async (txId: number) => {
    if (!apiToken) return;
    setTransactionsAll((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, is_new: false } : t))
    );
    setTransactionsRecent((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, is_new: false } : t))
    );
    const response = await fetch(`${apiBase}/api/transactions/${txId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ is_new: false }),
    });
    if (!response.ok) {
      setTransactionsAll((prev) =>
        prev.map((t) => (t.id === txId ? { ...t, is_new: true } : t))
      );
      setTransactionsRecent((prev) =>
        prev.map((t) => (t.id === txId ? { ...t, is_new: true } : t))
      );
      showToast(t.transactionUpdateError, "error");
    }
  };

  const handleTransactionCommentSave = async (txId: number, comment: string) => {
    if (!apiToken) return;
    const tx = transactionsAll.find((x) => x.id === txId);
    setTransactionsAll((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, comment: comment || null } : t))
    );
    setTransactionsRecent((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, comment: comment || null } : t))
    );
    setTransactionCommentModal(null);
    const response = await fetch(`${apiBase}/api/transactions/${txId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment: comment || null }),
    });
    if (!response.ok) {
      setTransactionsAll((prev) =>
        prev.map((t) => (t.id === txId && tx ? { ...t, comment: tx.comment ?? undefined } : t))
      );
      setTransactionsRecent((prev) =>
        prev.map((t) => (t.id === txId && tx ? { ...t, comment: tx.comment ?? undefined } : t))
      );
      showToast(t.transactionUpdateError, "error");
    }
  };

  const handleTransactionPostingDateChange = async (txId: number, delta: 1 | -1) => {
    if (!apiToken) return;
    const tx = transactionsAll.find((x) => x.id === txId);
    const current = tx?.posting_date ?? tx?.booking_date;
    if (!current) return;
    const d = new Date(current);
    d.setDate(d.getDate() + delta);
    const next = d.toISOString().slice(0, 10);
    setTransactionsAll((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, posting_date: next } : t))
    );
    setTransactionsRecent((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, posting_date: next } : t))
    );
    const response = await fetch(`${apiBase}/api/transactions/${txId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ posting_date: next }),
    });
    if (!response.ok) {
      setTransactionsAll((prev) =>
        prev.map((t) => (t.id === txId && tx ? { ...t, posting_date: tx.posting_date ?? tx.booking_date } : t))
      );
      setTransactionsRecent((prev) =>
        prev.map((t) => (t.id === txId && tx ? { ...t, posting_date: tx.posting_date ?? tx.booking_date } : t))
      );
      showToast(t.transactionUpdateError, "error");
    }
  };

  const handleTransactionTagsChange = async (txId: number, tagIds: number[]) => {
    if (!apiToken) return;
    const tx = transactionsAll.find((x) => x.id === txId);
    const newTags = tagIds.map((id) => ({ id, name: tags.find((t) => t.id === id)?.name ?? "" })).filter((t) => t.name);
    setTransactionsAll((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, tags: newTags } : t))
    );
    setTransactionsRecent((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, tags: newTags } : t))
    );
    const response = await fetch(`${apiBase}/api/transactions/${txId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tag_ids: tagIds }),
    });
    if (!response.ok && tx) {
      setTransactionsAll((prev) =>
        prev.map((t) => (t.id === txId ? { ...t, tags: tx.tags ?? [] } : t))
      );
      setTransactionsRecent((prev) =>
        prev.map((t) => (t.id === txId ? { ...t, tags: tx.tags ?? [] } : t))
      );
      showToast(t.transactionUpdateError, "error");
    }
  };

  const handleTransactionDelete = async () => {
    if (!apiToken || !transactionDeleteConfirm) return;
    const txId = transactionDeleteConfirm.id;
    setTransactionDeleteConfirm(null);
    const response = await fetch(`${apiBase}/api/transactions/${txId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${apiToken}` },
    });
    if (response.ok) {
      loadAllTransactions();
      loadRecentTransactions();
    } else {
      showToast(t.transactionUpdateError, "error");
    }
  };

  const loadRecurringTransactions = useCallback(
    async (accountId: number) => {
      if (!apiToken) return;
      const response = await fetch(
        `${apiBase}/api/accounts/${accountId}/recurring-transactions`,
        { headers: { Authorization: `Bearer ${apiToken}` } }
      );
      if (response.ok) {
        const list = await response.json();
        setRecurringTransactions(list);
      } else {
        setRecurringTransactions([]);
      }
    },
    [apiBase, apiToken]
  );

  const recurringAccounts = useMemo(
    () =>
      bankAccounts.map((a) => ({
        id: a.id,
        friendly_name: a.friendly_name,
        account_name: a.account_name,
        institution_name: a.institution_name,
      })),
    [bankAccounts]
  );

  useEffect(() => {
    if (accountAlertsModal.open && accountAlertsModal.accountId != null && apiToken) {
      loadRecurringTransactions(accountAlertsModal.accountId);
    }
  }, [accountAlertsModal.open, accountAlertsModal.accountId, apiToken, loadRecurringTransactions]);

  const handleSaveAccountAlerts = async () => {
    if (!apiToken || accountAlertsModal.accountId == null) return;
    const above = parseFloat(accountAlertsModal.alert_above_amount);
    const below = parseFloat(accountAlertsModal.alert_below_amount);
    if (Number.isNaN(above) || Number.isNaN(below)) return;
    const response = await fetch(
      `${apiBase}/api/accounts/${accountAlertsModal.accountId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          alert_above_amount: above,
          alert_below_amount: below,
        }),
      }
    );
    if (response.ok) {
      await loadAccounts();
      if (accountAlertsModal.accountId != null) {
        await loadRecurringTransactions(accountAlertsModal.accountId);
      }
      setToast({ text: t.profileSaved, type: "success" });
      setAccountAlertsModal({
        open: false,
        accountId: null,
        accountLabel: "",
        alert_above_amount: "0",
        alert_below_amount: "-100",
      });
    } else {
      setToast({ text: t.profileSaveError, type: "error" });
    }
  };

  const handleCreateRecurringFromTransaction = async () => {
    if (!apiToken || !createAlertModal.txId) return;
    const dayTol = parseInt(createAlertModal.day_tolerance_before, 10) || 1;
    const amtTol = createAlertModal.value_tolerance_below || "0";
    const payload = {
      name: createAlertModal.description || "Recurring payment",
      day_tolerance_before: dayTol,
      day_tolerance_after: dayTol,
      missing_grace_days: dayTol,
      amount_tolerance_below: amtTol,
      amount_tolerance_above: amtTol,
    };
    const response = await fetch(
      `${apiBase}/api/transactions/${createAlertModal.txId}/create-recurring`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    if (response.ok) {
      setToast({ text: t.alertCreated, type: "success" });
      setCreateAlertModal((prev) => ({ ...prev, open: false, txId: 0 }));
      if (accountAlertsModal.accountId != null) {
        await loadRecurringTransactions(accountAlertsModal.accountId);
      }
    } else {
      setToast({ text: t.alertCreateError, type: "error" });
    }
  };

  const handleDeleteRecurringTransaction = async (recurringId: number) => {
    if (!apiToken) return;
    const response = await fetch(`${apiBase}/api/recurring-transactions/${recurringId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${apiToken}` },
    });
    if (response.ok) {
      setToast({ text: t.alertDeleted, type: "success" });
      setRecurringTransactions((prev) => prev.filter((r) => r.id !== recurringId));
    }
  };

  const handleUpdateRecurringTransaction = async (
    recurringId: number,
    updates: {
      name?: string;
      day_tolerance_before?: number;
      day_tolerance_after?: number;
      amount_tolerance_below?: string;
      amount_tolerance_above?: string;
      missing_grace_days?: number;
    }
  ) => {
    if (!apiToken) return;
    const response = await fetch(`${apiBase}/api/recurring-transactions/${recurringId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    if (response.ok) {
      setRecurringTransactions((prev) =>
        prev.map((r) =>
          r.id === recurringId
            ? {
                ...r,
                ...(updates.name !== undefined && { name: updates.name }),
                ...(updates.day_tolerance_before !== undefined && {
                  day_tolerance_before: updates.day_tolerance_before,
                }),
                ...(updates.day_tolerance_after !== undefined && {
                  day_tolerance_after: updates.day_tolerance_after,
                }),
                ...(updates.amount_tolerance_below !== undefined && {
                  amount_tolerance_below: updates.amount_tolerance_below,
                }),
                ...(updates.amount_tolerance_above !== undefined && {
                  amount_tolerance_above: updates.amount_tolerance_above,
                }),
                ...(updates.missing_grace_days !== undefined && {
                  missing_grace_days: updates.missing_grace_days,
                }),
              }
            : r
        )
      );
    }
  };

  const handleReconnect = async (connectionId: number) => {
    if (!apiToken) return;
    const response = await fetch(
      `${apiBase}/api/banks/connections/${connectionId}/reconnect`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ language: language.code.toUpperCase() }),
      }
    );
    if (response.ok) {
      const data = await response.json();
      if (data.link) {
        window.location.href = data.link;
      }
    }
  };

  const handleDeleteConnection = async (connectionId: number) => {
    if (!apiToken) return;
    const response = await fetch(`${apiBase}/api/banks/connections/${connectionId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${apiToken}` },
    });
    if (response.ok) {
      setBankConnections((prev) => prev.filter((conn) => conn.id !== connectionId));
    }
  };

  const handleFetchTransactions = async (connectionId: number) => {
    if (!apiToken) return;
    showToast(t.fetchInProgressMessage, "warning");
    const response = await fetch(
      `${apiBase}/api/banks/connections/${connectionId}/transactions/fetch`,
      { method: "POST", headers: { Authorization: `Bearer ${apiToken}` } }
    );
    if (response.status === 202) {
      let intervalId: ReturnType<typeof setInterval> | null = null;
      const poll = async () => {
        const statusRes = await fetch(
          `${apiBase}/api/banks/connections/${connectionId}/transactions/status`,
          { headers: { Authorization: `Bearer ${apiToken}` } }
        );
        if (!statusRes.ok) return;
        const data = await statusRes.json();
        if (data.status === "completed") {
          if (intervalId) clearInterval(intervalId);
          showToast(t.fetchCompleted, "success");
          loadRecentTransactions();
          if (activeSection === "transactions") loadAllTransactions();
        } else if (data.status === "failed") {
          if (intervalId) clearInterval(intervalId);
          showToast(t.fetchFailed, "error");
        } else if (data.status === "rate_limited") {
          if (intervalId) clearInterval(intervalId);
          showToast(t.gocardlessRateLimitExceeded, "warning");
        }
      };
      intervalId = setInterval(poll, 2500);
      poll();
      return;
    }
    if (response.status === 429) {
      showToast(t.gocardlessRateLimitExceeded, "warning");
      return;
    }
    showToast(t.fetchFailed, "error");
  };

  const navigationItems = [
    { id: "transactions", labelKey: "navTransactions", icon: "fa-receipt" },
    { id: "accounts", labelKey: "navAccounts", icon: "fa-building-columns" },
    { id: "insights", labelKey: "navInsights", icon: "fa-chart-line" },
    { id: "recurring", labelKey: "navRecurring", icon: "fa-arrows-rotate" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <a href="#main" className="skip-to-main">
        {t.skipToMain}
      </a>
      <header className="fixed top-0 z-50 w-full border-b border-slate-200 bg-slate-50/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-6xl min-w-0 items-center justify-between gap-2 px-4 py-4 sm:px-6">
          <button
            type="button"
            className="logo-button flex min-w-0 shrink items-center gap-3"
            onClick={() => setActiveSection(isAuthenticated ? "transactions" : "home")}
          >
            <img
              src="/logo.png"
              alt={appName}
              className="h-16 w-auto dark:hidden"
            />
            <img
              src="/logo-dark.png"
              alt={appName}
              className="hidden h-16 w-auto dark:block"
            />
          </button>
          {/* Main Navigation - Desktop (only when authenticated) */}
          {isAuthenticated ? (
            <nav className="hidden md:flex items-center gap-8 ml-12">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as any)}
                  className={`nav-item ${activeSection === item.id ? "active" : ""}`}
                  type="button"
                >
                  <i className={`fa-solid ${item.icon} mr-2`}></i>
                  {t[item.labelKey as keyof typeof t]}
                </button>
              ))}
            </nav>
          ) : null}
          <nav className="hidden items-center gap-8 md:flex">
            <div
              className="relative language-wrapper"
              onMouseEnter={() => setLanguageOpen(true)}
              onMouseLeave={() => setLanguageOpen(false)}
            >
              <button
                className="language-btn flex items-center gap-2 text-sm"
                type="button"
              >
                <i className="fa-solid fa-globe"></i>
                {language.label}
              </button>
              <div
                className={`language-menu ${languageOpen ? "active" : ""}`}
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`language-option w-full text-left ${
                      language.code === lang.code ? "active" : ""
                    }`}
                    onClick={() => {
                      setLanguage(lang);
                      setLanguageOpen(false);
                    }}
                    type="button"
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              className="theme-toggle"
              onClick={() => setIsDark((prev) => !prev)}
              type="button"
              aria-label={t.toggleDarkMode}
            >
              <i className={`fa-solid ${isDark ? "fa-sun" : "fa-moon"}`}></i>
            </button>
            <div
              className={`user-menu ${userMenuOpen ? "is-open" : ""}`}
              onMouseEnter={() => {
                if (userMenuLocked) return;
                if (userMenuTimerRef.current) {
                  window.clearTimeout(userMenuTimerRef.current);
                }
                userMenuTimerRef.current = window.setTimeout(() => {
                  setUserMenuOpen(true);
                }, 500);
              }}
              onMouseLeave={() => {
                if (userMenuTimerRef.current) {
                  window.clearTimeout(userMenuTimerRef.current);
                  userMenuTimerRef.current = null;
                }
                setUserMenuOpen(false);
                setUserMenuLocked(false);
              }}
            >
            <button
              className="user-menu-btn"
              type="button"
              aria-label={t.menuProfile}
                onClick={() => {
                  if (userMenuTimerRef.current) {
                    window.clearTimeout(userMenuTimerRef.current);
                    userMenuTimerRef.current = null;
                  }
                  setUserMenuOpen((open) => !open);
                }}
            >
                <i className="fa-solid fa-circle-user"></i>
                {isAuthenticated && user?.given_name && (
                  <span className="ml-2 hidden md:inline text-sm">{user.given_name}</span>
                )}
              </button>
            <div className={`user-menu-content ${userMenuOpen ? "is-open" : ""}`}>
                {!isAuthenticated ? (
                <>
                  <button
                    className="dropdown-item w-full text-left"
                    type="button"
                    onClick={() => {
                      setUserMenuLocked(true);
                      setUserMenuOpen(false);
                      loginWithRedirect({
                        authorizationParams: {
                          ui_locales: auth0Locale,
                          prompt: "login",
                        },
                      });
                    }}
                  >
                    {t.menuLogin}
                  </button>
                  <button
                    className="dropdown-item w-full text-left"
                    type="button"
                    onClick={() => {
                      setUserMenuLocked(true);
                      setUserMenuOpen(false);
                      setAboutModalOpen(true);
                    }}
                  >
                    {t.menuAbout}
                  </button>
                </>
                ) : (
                  <>
                    <button
                      className="dropdown-item w-full text-left"
                      type="button"
                      onClick={() => {
                        setUserMenuLocked(true);
                        setProfileForm({
                          display_name: profile.display_name ?? "",
                          country: profile.country ?? "",
                          telegram_chat_id: profile.telegram_chat_id ?? "",
                          show_account_balances: profile.show_account_balances ?? true,
                          auto_detection_enabled: profile.auto_detection_enabled ?? true,
                          telegram_alerts_enabled: profile.telegram_alerts_enabled ?? true,
                          weekly_emails_enabled: profile.weekly_emails_enabled ?? true,
                          slack_webhook_url: profile.slack_webhook_url ?? "",
                          slack_alerts_enabled: profile.slack_alerts_enabled ?? false,
                          storage_mode: (profile.storage_mode === "local" ? "local" : "cloud") as "cloud" | "local",
                        });
                        setActiveSection("profile");
                        setUserMenuOpen(false);
                      }}
                    >
                      {t.menuProfile}
                    </button>
                    <button
                      className="dropdown-item w-full text-left"
                      type="button"
                      onClick={() => {
                        setUserMenuLocked(true);
                        setActiveSection("settings");
                        setUserMenuOpen(false);
                      }}
                    >
                      {t.menuSettings}
                    </button>
                    {profile?.is_admin ? (
                      <>
                        <div className="dropdown-separator" role="separator" />
                        <button
                          className="dropdown-item w-full text-left"
                          type="button"
                          onClick={() => {
                            setUserMenuLocked(true);
                            setActiveSection("users");
                            setUserMenuOpen(false);
                          }}
                        >
                          {t.menuUsers}
                        </button>
                        <button
                          className="dropdown-item w-full text-left"
                          type="button"
                          onClick={() => {
                            setUserMenuLocked(true);
                            setActiveSection("adminDashboard");
                            setUserMenuOpen(false);
                          }}
                        >
                          {t.menuAdminDashboard}
                        </button>
                        <button
                          className="dropdown-item w-full text-left"
                          type="button"
                          onClick={() => {
                            setUserMenuLocked(true);
                            setActiveSection("audit");
                            setUserMenuOpen(false);
                          }}
                        >
                          {t.menuAudit}
                        </button>
                        <div className="dropdown-separator" role="separator" />
                      </>
                    ) : (
                      <div className="dropdown-separator" role="separator" />
                    )}
                    <button
                      className="dropdown-item w-full text-left"
                      type="button"
                      onClick={() => {
                        setUserMenuLocked(true);
                        setUserMenuOpen(false);
                        setAboutModalOpen(true);
                      }}
                    >
                      {t.menuAbout}
                    </button>
                    <button
                      className="dropdown-item w-full text-left"
                      type="button"
                    onClick={() => void handleLogout()}
                    >
                      {t.menuLogout}
                    </button>
                  </>
                )}
              </div>
            </div>
          </nav>
          <div className="flex shrink-0 items-center gap-2 md:hidden">
            <div className="relative">
              <button
                type="button"
                className="theme-toggle"
                onClick={() => setLanguageOpen((prev) => !prev)}
                aria-label={language.label}
                aria-expanded={languageOpen}
              >
                <i className="fa-solid fa-globe"></i>
              </button>
              <div className={`language-menu ${languageOpen ? "active" : ""}`}>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`language-option w-full text-left ${
                      language.code === lang.code ? "active" : ""
                    }`}
                    onClick={() => {
                      setLanguage(lang);
                      setLanguageOpen(false);
                    }}
                    type="button"
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              className="theme-toggle"
              onClick={() => setIsDark((prev) => !prev)}
              type="button"
              aria-label={t.toggleDarkMode}
            >
              <i className={`fa-solid ${isDark ? "fa-sun" : "fa-moon"}`}></i>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn-secondary z-10 shrink-0"
              type="button"
              aria-label={t.openMenu}
            >
              <i className={`fa-solid ${mobileMenuOpen ? "fa-xmark" : "fa-bars"}`}></i>
            </button>
          </div>
        </div>
      </header>
      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-nav-overlay"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="mobile-nav-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    loginWithRedirect({
                      authorizationParams: {
                        ui_locales: auth0Locale,
                        prompt: "login",
                      },
                    });
                  }}
                  className="mobile-nav-item"
                  type="button"
                >
                  <i className="fa-solid fa-right-to-bracket"></i>
                  <span>{t.menuLogin}</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAboutModalOpen(true);
                  }}
                  className="mobile-nav-item"
                  type="button"
                >
                  <i className="fa-solid fa-circle-info"></i>
                  <span>{t.menuAbout}</span>
                </button>
              </>
            ) : (
              <>
                {/* Main navigation items */}
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`mobile-nav-item ${activeSection === item.id ? "active" : ""}`}
                    type="button"
                  >
                    <i className={`fa-solid ${item.icon}`}></i>
                    <span>{t[item.labelKey as keyof typeof t]}</span>
                  </button>
                ))}

                <div className="mobile-nav-divider"></div>

                {/* User menu items */}
                <button
                  onClick={() => {
                    setActiveSection("profile");
                    setMobileMenuOpen(false);
                  }}
                  className="mobile-nav-item"
                  type="button"
                >
                  <i className="fa-solid fa-user"></i>
                  <span>{t.myProfile}</span>
                </button>

                {profile?.is_admin && (
                  <>
                    <button
                      onClick={() => {
                        setActiveSection("users");
                        setMobileMenuOpen(false);
                      }}
                      className="mobile-nav-item"
                      type="button"
                    >
                      <i className="fa-solid fa-users"></i>
                      <span>{t.userManagement}</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveSection("audit");
                        setMobileMenuOpen(false);
                      }}
                      className="mobile-nav-item"
                      type="button"
                    >
                      <i className="fa-solid fa-clipboard-list"></i>
                      <span>{t.audit}</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    setActiveSection("settings");
                    setMobileMenuOpen(false);
                  }}
                  className="mobile-nav-item"
                  type="button"
                >
                  <i className="fa-solid fa-cog"></i>
                  <span>{t.settings}</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAboutModalOpen(true);
                  }}
                  className="mobile-nav-item"
                  type="button"
                >
                  <i className="fa-solid fa-circle-info"></i>
                  <span>{t.menuAbout}</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    void handleLogout();
                  }}
                  className="mobile-nav-item"
                  type="button"
                >
                  <i className="fa-solid fa-right-from-bracket"></i>
                  <span>{t.menuLogout}</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {toast ? <div className={`toast ${toast.type}`}>{toast.text}</div> : null}
      {aboutModalOpen ? (
        <div
          className="modal-overlay"
          onClick={() => {
            setAboutModalOpen(false);
            setAboutVersion(null);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-title"
        >
          <div
            className="modal-card about-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="about-modal-header">
              <img
                src={isDark ? "/logo-dark.png" : "/logo.png"}
                alt=""
                className="about-modal-logo"
                width={64}
                height={64}
              />
              <h2 id="about-title" className="about-modal-title">
                {appName}
              </h2>
              <p className="about-modal-version">
                {aboutVersion !== null ? `v${aboutVersion}` : "…"}
              </p>
            </div>
            <p className="about-modal-description">{t.aboutDescription}</p>
            <p className="about-modal-copyright">{t.aboutCopyright}</p>
            <p className="about-modal-support">
              {t.aboutSupport}:{" "}
              <a href="mailto:info@eurodata.app" className="about-modal-support-link">
                info@eurodata.app
              </a>
            </p>
            <a
              href={changelogHref}
              target="_blank"
              rel="noopener noreferrer"
              className="about-modal-changelog"
            >
              {t.aboutChangelog}
              <i className="fa-solid fa-external-link ml-1" aria-hidden></i>
            </a>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                className="p-2 rounded-md border transition-colors"
                style={{
                  background: "var(--surface-hover)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
                title={t.aboutClose}
                aria-label={t.aboutClose}
                onClick={() => {
                  setAboutModalOpen(false);
                  setAboutVersion(null);
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {registerModalOpen ? (
        <div
          className="modal-overlay"
          onClick={() => {
            if (!signupRequestSubmitting) {
              setRegisterModalOpen(false);
              setSignupRequestSuccess(false);
              setSignupRequestError(null);
              setSignupRequestEmail("");
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="register-modal-title"
        >
          <div
            className="modal-card about-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="register-modal-title" className="about-modal-title mb-4">
              {t.signupRequestTitle}
            </h2>
            {signupRequestSuccess ? (
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                {t.signupRequestSuccess}
              </p>
            ) : (
              <>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  {t.signupRequestBody}
                </p>
                <form
                  id="signup-request-form"
                  className="flex flex-col gap-3"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const email = signupRequestEmail.trim();
                    if (!email) return;
                    setSignupRequestError(null);
                    setSignupRequestSubmitting(true);
                    try {
                      const res = await fetch(`${apiBase}/api/signup-request`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email }),
                      });
                      if (res.ok) {
                        setSignupRequestSuccess(true);
                      } else {
                        const data = await res.json().catch(() => ({}));
                        setSignupRequestError(
                          typeof data.detail === "string"
                            ? data.detail
                            : t.signupRequestError
                        );
                      }
                    } catch {
                      setSignupRequestError(t.signupRequestError);
                    } finally {
                      setSignupRequestSubmitting(false);
                    }
                  }}
                >
                  <label htmlFor="signup-request-email" className="sr-only">
                    {t.signupRequestEmailLabel}
                  </label>
                  <input
                    id="signup-request-email"
                    type="email"
                    className="input"
                    placeholder={t.signupRequestEmailLabel}
                    value={signupRequestEmail}
                    onChange={(e) => setSignupRequestEmail(e.target.value)}
                    required
                    disabled={signupRequestSubmitting}
                    autoComplete="email"
                  />
                  {signupRequestError ? (
                    <p className="text-sm text-rose-500" role="alert">
                      {signupRequestError}
                    </p>
                  ) : null}
                </form>
              </>
            )}
            <div className="flex justify-end items-center gap-2 mt-4">
              {!signupRequestSuccess && (
                <button
                  type="submit"
                  form="signup-request-form"
                  className="inline-flex items-center justify-center p-2 rounded-md border transition-colors shrink-0"
                  style={{
                    background: "var(--primary-50)",
                    borderColor: "var(--primary)",
                    color: "var(--primary)",
                  }}
                  title={t.signupRequestSubmit}
                  aria-label={t.signupRequestSubmit}
                  disabled={signupRequestSubmitting}
                >
                  {signupRequestSubmitting ? (
                    <span className="text-sm">…</span>
                  ) : (
                    <i className="fa-solid fa-paper-plane text-sm" aria-hidden />
                  )}
                </button>
              )}
              <button
                type="button"
                className="p-2 rounded-md border transition-colors"
                style={{
                  background: "var(--surface-hover)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
                title={t.registerModalClose}
                aria-label={t.registerModalClose}
                onClick={() => {
                  setRegisterModalOpen(false);
                  setSignupRequestSuccess(false);
                  setSignupRequestError(null);
                  setSignupRequestEmail("");
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {accountNameModal.open ? (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="card-title">{t.actionUpdateAccountName}</h3>
            <div className="mt-4 grid gap-3">
              <input
                className="input"
                value={accountNameModal.value}
                onChange={(event) =>
                  setAccountNameModal((prev) => ({
                    ...prev,
                    value: event.target.value,
                  }))
                }
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="p-2 rounded-md border transition-colors"
                  style={{
                    background: "var(--surface-hover)",
                    borderColor: "var(--border)",
                    color: "var(--text)",
                  }}
                  title={t.modalCancel}
                  aria-label={t.modalCancel}
                  onClick={() =>
                    setAccountNameModal({ open: false, accountId: null, value: "" })
                  }
                >
                  <i className="fa-solid fa-xmark" />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-md border transition-colors"
                  style={{
                    background: "var(--primary-50)",
                    borderColor: "var(--primary)",
                    color: "var(--primary)",
                  }}
                  title={t.modalConfirm}
                  aria-label={t.modalConfirm}
                  onClick={handleUpdateAccountName}
                >
                  <i className="fa-solid fa-check" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {accountAlertsModal.open ? (
        <div
          ref={accountAlertsOverlayRef}
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="account-alerts-title"
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Esc") {
              e.preventDefault();
              e.stopPropagation();
              setAccountAlertsModal({
                open: false,
                accountId: null,
                accountLabel: "",
                alert_above_amount: "0",
                alert_below_amount: "-100",
              });
            }
          }}
        >
          <div className="modal-card max-h-[90vh] overflow-y-auto">
            <h3 id="account-alerts-title" className="card-title">{t.accountAlertsTitle}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              {accountAlertsModal.accountLabel}
            </p>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-sm">
                <span>{t.accountAlertAbove}</span>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={accountAlertsModal.alert_above_amount}
                  onChange={(e) =>
                    setAccountAlertsModal((prev) => ({
                      ...prev,
                      alert_above_amount: e.target.value,
                    }))
                  }
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span>{t.accountAlertBelow}</span>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={accountAlertsModal.alert_below_amount}
                  onChange={(e) =>
                    setAccountAlertsModal((prev) => ({
                      ...prev,
                      alert_below_amount: e.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {t.accountTransactionAlerts}
                </h4>
                <button
                  type="button"
                  className="text-xs font-medium"
                  style={{ color: "var(--primary)" }}
                  onClick={() => {
                    setAccountAlertsModal((prev) => ({ ...prev, open: false, accountId: null, accountLabel: "", alert_above_amount: "0", alert_below_amount: "-100" }));
                    setActiveSection("recurring");
                  }}
                >
                  {t.navRecurring} →
                </button>
              </div>
              {recurringTransactions.length === 0 ? (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {t.accountTransactionAlertsEmpty}
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {recurringTransactions.map((rec) => (
                    <li
                      key={rec.id}
                      className="rounded border border-slate-200 bg-slate-50 p-2 text-sm dark:border-slate-700 dark:bg-slate-800/50"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-slate-700 dark:text-slate-200 truncate">
                            {rec.name || rec.description_pattern || "—"}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {t.alertTemplateDay}: {rec.anchor_day} (±{Math.max(rec.day_tolerance_before ?? 1, rec.day_tolerance_after ?? 1, rec.missing_grace_days ?? 1)} {t.alertTemplateDays}) · {t.alertTemplateAmount}: {(rec.expected_amount ?? "").trim() ? `${rec.expected_amount} (±${rec.amount_tolerance_below ?? rec.amount_tolerance_above ?? "0"})` : t.recurringAmountVaries}
                            {rec.next_expected_date ? ` · Next: ${String(rec.next_expected_date)}` : ""}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="p-2 rounded-md border transition-colors"
                            style={{
                              background: "var(--surface-hover)",
                              borderColor: "var(--border)",
                              color: "var(--error)",
                            }}
                            title={t.alertTemplateDelete}
                            aria-label={t.alertTemplateDelete}
                            onClick={() => setAccountAlertsDeleteRecurringId(rec.id)}
                          >
                            <i className="fa-solid fa-trash text-xs" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="p-2 rounded-md transition-colors"
                style={{
                  background: "var(--surface-hover)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 0 0 1px var(--border)",
                }}
                title={t.modalCancel}
                aria-label={t.modalCancel}
                onClick={() =>
                  setAccountAlertsModal({
                    open: false,
                    accountId: null,
                    accountLabel: "",
                    alert_above_amount: "0",
                    alert_below_amount: "-100",
                  })
                }
              >
                <i className="fa-solid fa-xmark" />
              </button>
              <button
                type="button"
                className="p-2 rounded-md transition-colors"
                style={{
                  background: "var(--primary-50)",
                  color: "var(--primary)",
                  border: "1px solid var(--primary)",
                  boxShadow: "0 0 0 1px var(--primary)",
                }}
                title={t.modalConfirm}
                aria-label={t.modalConfirm}
                onClick={handleSaveAccountAlerts}
              >
                <i className="fa-solid fa-check" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {/* Delete recurring confirmation (from Limiares de alerta) */}
      {accountAlertsDeleteRecurringId != null ? (
        <div
          ref={accountAlertsDeleteOverlayRef}
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="account-alerts-delete-title"
          style={{ zIndex: 10001 }}
          tabIndex={-1}
          onClick={() => setAccountAlertsDeleteRecurringId(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Esc") {
              e.preventDefault();
              e.stopPropagation();
              setAccountAlertsDeleteRecurringId(null);
            }
          }}
        >
          <div
            className="modal-card max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="account-alerts-delete-title" className="card-title">
              {t.deleteConfirm}
            </h3>
            {(() => {
              const rec = recurringTransactions.find((r) => r.id === accountAlertsDeleteRecurringId);
              return rec ? (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 truncate" title={rec.name || rec.description_pattern || ""}>
                  {rec.name || rec.description_pattern || "—"}
                </p>
              ) : null;
            })()}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="p-2 rounded-md border transition-colors"
                style={{
                  background: "var(--surface-hover)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
                title={t.modalCancel}
                aria-label={t.modalCancel}
                onClick={() => setAccountAlertsDeleteRecurringId(null)}
              >
                <i className="fa-solid fa-xmark" />
              </button>
              <button
                type="button"
                className="p-2 rounded-md border transition-colors border-red-500 bg-red-500 text-white hover:opacity-90"
                title={t.modalConfirm}
                aria-label={t.modalConfirm}
                onClick={async () => {
                  await handleDeleteRecurringTransaction(accountAlertsDeleteRecurringId);
                  setAccountAlertsDeleteRecurringId(null);
                }}
              >
                <i className="fa-solid fa-check" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {createAlertModal.open ? (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="card-title">{t.createAlertTitle}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-300 truncate">
              {createAlertModal.description ?? "—"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.alertTemplateAmount}: {createAlertModal.amount} {createAlertModal.currency} · {t.alertTemplateDay}: {createAlertModal.dayOfMonth}
            </p>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-sm">
                <span>{t.detailDayTolerance}</span>
                <input
                  type="number"
                  min={0}
                  className="input"
                  value={createAlertModal.day_tolerance_before}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCreateAlertModal((prev) => ({
                      ...prev,
                      day_tolerance_before: v,
                      day_tolerance_after: v,
                    }));
                  }}
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span>{t.detailAmountTolerance}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  className="input"
                  value={createAlertModal.value_tolerance_below}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCreateAlertModal((prev) => ({
                      ...prev,
                      value_tolerance_below: v,
                      value_tolerance_above: v,
                    }));
                  }}
                />
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="icon-button"
                type="button"
                title={t.modalCancel}
                onClick={() =>
                  setCreateAlertModal((prev) => ({ ...prev, open: false, txId: 0 }))
                }
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
              <button
                className="icon-button"
                type="button"
                title={t.modalConfirm}
                onClick={handleCreateRecurringFromTransaction}
              >
                <i className="fa-solid fa-check"></i>
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {deleteAccountModal.open ? (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="card-title">{t.confirmDeleteConnection}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {deleteAccountModal.label}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="p-2 rounded-md border transition-colors"
                style={{
                  background: "var(--surface-hover)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
                title={t.modalCancel}
                aria-label={t.modalCancel}
                onClick={() =>
                  setDeleteAccountModal({ open: false, connectionId: null, label: "" })
                }
              >
                <i className="fa-solid fa-xmark" />
              </button>
              <button
                type="button"
                className="p-2 rounded-md border transition-colors"
                style={{
                  background: "var(--error)",
                  borderColor: "var(--error)",
                  color: "white",
                }}
                title={t.modalConfirm}
                aria-label={t.modalConfirm}
                onClick={async () => {
                  if (!deleteAccountModal.connectionId) return;
                  await handleDeleteConnection(deleteAccountModal.connectionId);
                  setDeleteAccountModal({ open: false, connectionId: null, label: "" });
                }}
              >
                <i className="fa-solid fa-check" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {exportModal.open ? (
        <div className="modal-overlay">
          <div className="modal-card max-w-lg">
            <h3 className="card-title">{t.exportTransactionsTitle}</h3>
            <div className="mt-4 grid gap-4 text-sm">
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-200">{t.exportDates}</span>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="exportDateMode"
                      checked={exportModal.dateMode === "all"}
                      onChange={() =>
                        setExportModal((prev) => ({ ...prev, dateMode: "all" }))
                      }
                    />
                    {t.exportDatesAll}
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="exportDateMode"
                      checked={exportModal.dateMode === "range"}
                      onChange={() =>
                        setExportModal((prev) => ({ ...prev, dateMode: "range" }))
                      }
                    />
                    {t.exportDatesRange}
                  </label>
                </div>
                {exportModal.dateMode === "range" ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <input
                      type="date"
                      className="input"
                      value={exportModal.dateFrom}
                      onChange={(e) =>
                        setExportModal((prev) => ({ ...prev, dateFrom: e.target.value }))
                      }
                    />
                    <span>{t.exportDateTo}</span>
                    <input
                      type="date"
                      className="input"
                      value={exportModal.dateTo}
                      onChange={(e) =>
                        setExportModal((prev) => ({ ...prev, dateTo: e.target.value }))
                      }
                    />
                  </div>
                ) : null}
              </div>
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-200">{t.exportAccounts}</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="exportAccountMode"
                      checked={exportModal.accountMode === "all"}
                      onChange={() =>
                        setExportModal((prev) => ({ ...prev, accountMode: "all" }))
                      }
                    />
                    {t.exportAccountsAll}
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="exportAccountMode"
                      checked={exportModal.accountMode === "selected"}
                      onChange={() =>
                        setExportModal((prev) => ({
                          ...prev,
                          accountMode: "selected",
                          selectedAccountIds:
                            prev.selectedAccountIds.length > 0
                              ? prev.selectedAccountIds
                              : bankAccounts.map((a) => a.id),
                        }))
                      }
                    />
                    {t.exportAccountsSelected}
                  </label>
                </div>
                {exportModal.accountMode === "selected" && bankAccounts.length > 0 ? (
                  <div className="mt-2 flex max-h-32 flex-wrap gap-2 overflow-y-auto rounded border border-slate-200 bg-slate-50 p-2 dark:border-slate-600 dark:bg-slate-800">
                    {bankAccounts.map((account) => (
                      <label
                        key={account.id}
                        className="flex items-center gap-2"
                        style={{ color: getAccountColor(account.id) }}
                      >
                        <input
                          type="checkbox"
                          checked={exportModal.selectedAccountIds.includes(account.id)}
                          onChange={(e) =>
                            setExportModal((prev) => ({
                              ...prev,
                              selectedAccountIds: e.target.checked
                                ? [...prev.selectedAccountIds, account.id]
                                : prev.selectedAccountIds.filter((id) => id !== account.id),
                            }))
                          }
                        />
                        {account.friendly_name ??
                          account.account_name ??
                          account.institution_name}
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-200">{t.exportCategories}</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="exportCategoryMode"
                      checked={exportModal.categoryMode === "all"}
                      onChange={() =>
                        setExportModal((prev) => ({ ...prev, categoryMode: "all" }))
                      }
                    />
                    {t.exportCategoriesAll}
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="exportCategoryMode"
                      checked={exportModal.categoryMode === "selected"}
                      onChange={() =>
                        setExportModal((prev) => ({
                          ...prev,
                          categoryMode: "selected",
                          selectedCategoryIds:
                            prev.selectedCategoryIds.length > 0
                              ? prev.selectedCategoryIds
                              : categories.map((c) => c.id),
                        }))
                      }
                    />
                    {t.exportCategoriesSelected}
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="exportCategoryMode"
                      checked={exportModal.categoryMode === "empty"}
                      onChange={() =>
                        setExportModal((prev) => ({ ...prev, categoryMode: "empty" }))
                      }
                    />
                    {t.exportCategoriesEmpty}
                  </label>
                </div>
                {exportModal.categoryMode === "selected" && categories.length > 0 ? (
                  <div className="mt-2 flex max-h-32 flex-wrap gap-2 overflow-y-auto rounded border border-slate-200 bg-slate-50 p-2 dark:border-slate-600 dark:bg-slate-800">
                    {categories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={exportModal.selectedCategoryIds.includes(cat.id)}
                          onChange={(e) =>
                            setExportModal((prev) => ({
                              ...prev,
                              selectedCategoryIds: e.target.checked
                                ? [...prev.selectedCategoryIds, cat.id]
                                : prev.selectedCategoryIds.filter((id) => id !== cat.id),
                            }))
                          }
                        />
                        {cat.name}
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-200">{t.exportTags}</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="exportTagMode"
                      checked={exportModal.tagMode === "all"}
                      onChange={() =>
                        setExportModal((prev) => ({ ...prev, tagMode: "all" }))
                      }
                    />
                    {t.exportTagsAll}
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="exportTagMode"
                      checked={exportModal.tagMode === "selected"}
                      onChange={() =>
                        setExportModal((prev) => ({
                          ...prev,
                          tagMode: "selected",
                          selectedTagIds:
                            prev.selectedTagIds.length > 0
                              ? prev.selectedTagIds
                              : tags.map((tag) => tag.id),
                        }))
                      }
                    />
                    {t.exportTagsSelected}
                  </label>
                </div>
                {exportModal.tagMode === "selected" && tags.length > 0 ? (
                  <div className="mt-2 flex max-h-32 flex-wrap gap-2 overflow-y-auto rounded border border-slate-200 bg-slate-50 p-2 dark:border-slate-600 dark:bg-slate-800">
                    {tags.map((tag) => (
                      <label key={tag.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={exportModal.selectedTagIds.includes(tag.id)}
                          onChange={(e) =>
                            setExportModal((prev) => ({
                              ...prev,
                              selectedTagIds: e.target.checked
                                ? [...prev.selectedTagIds, tag.id]
                                : prev.selectedTagIds.filter((id) => id !== tag.id),
                            }))
                          }
                        />
                        {tag.name}
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-200">{t.exportNumberFormat}</span>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t.exportNumberFormatHelp}</p>
                <div className="mt-2 flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2">
                    <span className="text-slate-600 dark:text-slate-300">{t.exportDecimalSeparator}</span>
                    <select
                      className="input"
                      value={exportModal.decimalSeparator}
                      onChange={(e) =>
                        setExportModal((prev) => ({
                          ...prev,
                          decimalSeparator: e.target.value as "period" | "comma",
                        }))
                      }
                    >
                      <option value="period">{t.exportDecimalPeriod}</option>
                      <option value="comma">{t.exportDecimalComma}</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-2">
                    <span className="text-slate-600 dark:text-slate-300">{t.exportThousandsSeparator}</span>
                    <select
                      className="input"
                      value={exportModal.thousandsSeparator}
                      onChange={(e) =>
                        setExportModal((prev) => ({
                          ...prev,
                          thousandsSeparator: e.target.value as "none" | "comma" | "period",
                        }))
                      }
                    >
                      <option value="none">{t.exportThousandsNone}</option>
                      <option value="comma">{t.exportThousandsComma}</option>
                      <option value="period">{t.exportThousandsPeriod}</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="p-2 rounded-md border transition-colors"
                style={{
                  background: "var(--surface-hover)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
                title={t.exportCancel}
                aria-label={t.exportCancel}
                onClick={() =>
                  setExportModal((prev) => ({ ...prev, open: false }))
                }
              >
                <i className="fa-solid fa-xmark" />
              </button>
              <button
                type="button"
                className="p-2 rounded-md border transition-colors"
                style={{
                  background: "var(--primary-50)",
                  borderColor: "var(--primary)",
                  color: "var(--primary)",
                }}
                title={t.exportDownload}
                aria-label={t.exportDownload}
                onClick={() => void handleExportTransactions()}
              >
                <i className="fa-solid fa-file-csv" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <main id="main" className="pt-28 pb-24">
        {accessDeniedFromAuth0 ? (
          <section className="mx-auto max-w-3xl px-6 py-24">
            <div className="card">
              <h2 className="card-title">{t.accessDeniedTitle}</h2>
              <p className="card-description">{t.accessDeniedBody}</p>
              <div className="mt-6">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setAccessDeniedFromAuth0(false);
                    setActiveSection("home");
                  }}
                >
                  {t.accessDeniedTryAgain}
                </button>
              </div>
            </div>
          </section>
        ) : null}
        {!accessDeniedFromAuth0 && (
          <>
        {activeSection === "privacy" ? (
          <PrivacyPolicy
            onBack={() => {
              window.history.pushState({}, "", "/");
              setActiveSection(isAuthenticated ? "transactions" : "home");
            }}
            t={{
              privacyTitle: t.privacyTitle,
              privacyBack: t.privacyBack,
              privacyLastUpdated: t.privacyLastUpdated,
              privacyIntro: t.privacyIntro,
              privacySection1Title: t.privacySection1Title,
              privacySection1Content: t.privacySection1Content,
              privacySection2Title: t.privacySection2Title,
              privacySection2Content: t.privacySection2Content,
              privacySection3Title: t.privacySection3Title,
              privacySection3Content: t.privacySection3Content,
              privacySection4Title: t.privacySection4Title,
              privacySection4Content: t.privacySection4Content,
              privacySection5Title: t.privacySection5Title,
              privacySection5Content: t.privacySection5Content,
              privacySection6Title: t.privacySection6Title,
              privacySection6Content: t.privacySection6Content,
              privacySection7Title: t.privacySection7Title,
              privacySection7Content: t.privacySection7Content,
              privacySection8Title: t.privacySection8Title,
              privacySection8Content: t.privacySection8Content,
              privacyContactTitle: t.privacyContactTitle,
              privacyContactIntro: t.privacyContactIntro,
            }}
          />
        ) : null}
        {activeSection !== "privacy" && isAuthenticated && authError ? (
          <section className="mx-auto max-w-3xl px-6 py-24">
            <div className="card">
              <h2 className="card-title">
                {authError === "server_error" ? t.serverErrorTitle : t.notAuthorizedTitle}
              </h2>
              <p className="card-description">
                {authError === "server_error" ? t.serverErrorBody : t.notAuthorizedBody}
              </p>
            </div>
          </section>
        ) : null}

        {isAuthenticated && activeSection !== "profile" && (profile?.needs_onboarding || activeSection === "accounts") ? (
          <div className="relative">
            <button
              type="button"
              className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border rounded-full w-8 h-8 absolute top-4 right-4 z-10"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-secondary)" }}
              title={t.helpTitle}
              aria-label={t.helpTitle}
              onClick={() => setHelpModalContext("accounts")}
            >
              <i className="fa-regular fa-circle-question" aria-hidden />
            </button>
          <Onboarding
            t={{
              onboardingTitle: t.onboardingTitle,
              onboardingBody: t.onboardingBody,
              onboardingCta: t.onboardingCta,
              onboardingCountry: t.onboardingCountry,
              onboardingSearch: t.onboardingSearch,
              onboardingSelectBank: t.onboardingSelectBank,
              onboardingAddAccount: t.onboardingAddAccount,
              onboardingAccountsTitle: t.onboardingAccountsTitle,
              onboardingRequired: t.onboardingRequired,
              languageCode: language.code,
              onboardingConnectBank: t.onboardingConnectBank,
              onboardingCompleting: t.onboardingCompleting,
              onboardingFriendlyNameSave: t.onboardingFriendlyNameSave,
              accountAlertsTitle: t.accountAlertsTitle,
              accountAlertAbove: t.accountAlertAbove,
              accountAlertBelow: t.accountAlertBelow,
              actionEditAlerts: t.actionEditAlerts,
              actionReconnectBank: t.actionReconnectBank,
              actionReauthRequired: t.actionReauthRequired,
              actionFetchTransactions: t.actionFetchTransactions,
              actionDeleteAccount: t.actionDeleteAccount,
              accountTransactionAlerts: t.accountTransactionAlerts,
              alertTemplateDay: t.alertTemplateDay,
              alertTemplateDayTolerance: t.alertTemplateDayTolerance,
              alertTemplateAmount: t.alertTemplateAmount,
              alertTemplateDescription: t.alertTemplateDescription,
              alertTemplateEdit: t.alertTemplateEdit,
              alertTemplateDelete: t.alertTemplateDelete,
              deleteConfirm: t.deleteConfirm,
              alertTemplateDays: t.alertTemplateDays,
              detailDayTolerance: t.detailDayTolerance,
              detailAmountTolerance: t.detailAmountTolerance,
              recurringAmountVaries: t.recurringAmountVaries,
              modalCancel: t.modalCancel,
              modalConfirm: t.modalConfirm,
              confirmDeleteAccount: t.confirmDeleteAccount,
              confirmDeleteAccountWarning: t.confirmDeleteAccountWarning,
              profileSaved: t.profileSaved,
              profileSaveError: t.profileSaveError,
              fetchInProgressMessage: t.fetchInProgressMessage,
              fetchCompleted: t.fetchCompleted,
              fetchFailed: t.fetchFailed,
              transactionsLimitReached: t.transactionsLimitReached,
              gocardlessRateLimitExceeded: t.gocardlessRateLimitExceeded,
              importStatementTitle: t.importStatementTitle,
              importStatementDrop: t.importStatementDrop,
              importStatementSelectFiles: t.importStatementSelectFiles,
              importStatementParsing: t.importStatementParsing,
              importStatementAnalyse: t.importStatementAnalyse,
              importStatementParseFailed: t.importStatementParseFailed,
              importStatementFileSingular: t.importStatementFileSingular,
              importStatementFilePlural: t.importStatementFilePlural,
              importStatementParsed: t.importStatementParsed,
              importStatementTotalTransactions: t.importStatementTotalTransactions,
              importToAccount: t.importToAccount,
              importSuccess: t.importSuccess,
              importFailed: t.importFailed,
              createNewAccount: t.createNewAccount,
              assignToExisting: t.assignToExisting,
              statementBankName: t.statementBankName,
              statementAccountName: t.statementAccountName,
              statementDisplayName: t.statementDisplayName,
              statementCountry: t.statementCountry,
              selectBankForLogo: t.selectBankForLogo,
              pickBankFromList: t.pickBankFromList,
              accountSourceManual: t.accountSourceManual,
              accountSourceAutomatic: t.accountSourceAutomatic,
              importReviewTitle: t.importReviewTitle,
              importReviewBack: t.importReviewBack,
              importReviewImport: t.importReviewImport,
              importReviewFlipSign: t.importReviewFlipSign,
              importReviewFileLabel: t.importReviewFileLabel,
              importReviewInclude: t.importReviewInclude,
              importReviewExclude: t.importReviewExclude,
            }}
            apiBase={apiBase}
            token={apiToken ?? ""}
            showBalances={profile?.show_account_balances ?? true}
            onFetchComplete={() => {
              loadRecentTransactions();
              if (activeSection === "transactions") loadAllTransactions();
            }}
            onComplete={async () => {
              if (!apiToken) return;
              if (profile?.needs_onboarding) {
                await fetch(`${apiBase}/api/onboarding/complete`, {
                  method: "POST",
                  headers: { Authorization: `Bearer ${apiToken}` },
                });
                const response = await fetch(`${apiBase}/api/me`, {
                  headers: { Authorization: `Bearer ${apiToken}` },
                });
                if (response.ok) {
                  setProfile(await response.json());
                }
              }
              setActiveSection("home");
            }}
          />
          </div>
        ) : null}

        {/* Insights Section */}
        {isAuthenticated && !profile?.needs_onboarding && activeSection === "insights" ? (
          <div className="relative">
            <button
              type="button"
              className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border rounded-full w-8 h-8 absolute top-4 right-4 z-10"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-secondary)" }}
              title={t.helpTitle}
              aria-label={t.helpTitle}
              onClick={() => setHelpModalContext("insights")}
            >
              <i className="fa-regular fa-circle-question" aria-hidden />
            </button>
            <Insights
              apiBase={apiBase}
              apiToken={apiToken}
              bankAccounts={bankAccounts}
              categories={categories}
              tags={tags}
              locale={getLocale()}
              t={t}
              showToast={showToast}
            />
          </div>
        ) : null}

        {/* Recurring transactions (B012 Phase 4) */}
        {isAuthenticated && !profile?.needs_onboarding && activeSection === "recurring" && apiToken ? (
          <RecurringTransactions
            apiBase={apiBase}
            token={apiToken}
            accounts={recurringAccounts}
            locale={getLocale()}
            initialDetectionRunAt={profile?.recurring_initial_detection_run_at ?? undefined}
            storageMode={profile?.storage_mode}
            onInitialDetectionDone={async () => {
              try {
                const res = await fetch(`${apiBase}/api/me`, {
                  headers: { Authorization: `Bearer ${apiToken}` },
                });
                if (res.ok) setProfile(await res.json());
              } catch {
                // ignore
              }
            }}
            t={{
              recurringTitle: t.recurringTitle,
              recurringSubtitle: t.recurringSubtitle,
              recurringInitialOfferTitle: t.recurringInitialOfferTitle,
              recurringInitialOfferBody: t.recurringInitialOfferBody,
              recurringInitialOfferAnalyze: t.recurringInitialOfferAnalyze,
              recurringInitialOfferSkip: t.recurringInitialOfferSkip,
              recurringEmptyGuidance: t.recurringEmptyGuidance,
              recurringFindSuggestions: t.recurringFindSuggestions,
              recurringFinding: t.recurringFinding,
              recurringNoSuggestions: t.recurringNoSuggestions,
              recurringReviewSuggestions: t.recurringReviewSuggestions,
              recurringSuggestionsCount: t.recurringSuggestionsCount,
              recurringConfirm: t.recurringConfirm,
              recurringDismiss: t.recurringDismiss,
              recurringSkip: t.recurringSkip,
              recurringEditThenConfirm: t.recurringEditThenConfirm,
              recurringProgressOf: t.recurringProgressOf,
              filterAccount: t.filterAccount,
              filterAccountAll: t.filterAccountAll,
              filterStatus: t.filterStatus,
              filterStatusAll: t.filterStatusAll,
              filterStatusActive: t.filterStatusActive,
              filterStatusPaused: t.filterStatusPaused,
              filterStatusSuggested: t.filterStatusSuggested,
              sortBy: t.sortBy,
              sortNextDate: t.sortNextDate,
              sortName: t.sortName,
              sortFrequency: t.sortFrequency,
              sortAmount: t.sortAmount,
              sortConfidence: t.sortConfidence,
              searchPlaceholder: t.searchPlaceholder,
              recurringEmpty: t.recurringEmpty,
              recurringNext: t.recurringNext,
              recurringAmount: t.recurringAmount,
              recurringAmountVaries: t.recurringAmountVaries,
              recurringFrequency: t.recurringFrequency,
              recurringFrequencyWeekly: t.recurringFrequencyWeekly,
              recurringFrequencyBiweekly: t.recurringFrequencyBiweekly,
              recurringFrequencyMonthly: t.recurringFrequencyMonthly,
              recurringFrequencyQuarterly: t.recurringFrequencyQuarterly,
              recurringFrequencyYearly: t.recurringFrequencyYearly,
              recurringStatusActive: t.recurringStatusActive,
              recurringStatusPaused: t.recurringStatusPaused,
              recurringStatusSuggested: t.recurringStatusSuggested,
              recurringStatusDismissed: t.recurringStatusDismissed,
              recurringStatusArchived: t.recurringStatusArchived,
              recurringCreateManual: t.recurringCreateManual,
              recurringEdit: t.recurringEdit,
              recurringPause: t.recurringPause,
              recurringResume: t.recurringResume,
              recurringDelete: t.recurringDelete,
              recurringViewList: t.recurringViewList,
              recurringViewCalendar: t.recurringViewCalendar,
              calendarToday: t.calendarToday,
              calendarMonthTitle: t.calendarMonthTitle,
              calendarSummaryTransactions: t.calendarSummaryTransactions,
              calendarSummaryAmount: t.calendarSummaryAmount,
              calendarUpcoming: t.calendarUpcoming,
              countdownToday: t.countdownToday,
              countdownTomorrow: t.countdownTomorrow,
              countdownInNDays: t.countdownInNDays,
              countdownDaysAgo: t.countdownDaysAgo,
              modalCancel: t.modalCancel,
              modalSave: t.modalSave,
              modalClose: t.modalClose,
              detailName: t.detailName,
              detailDescriptionPattern: t.detailDescriptionPattern,
              detailFrequency: t.detailFrequency,
              detailInterval: t.detailInterval,
              detailAnchorDay: t.detailAnchorDay,
              detailDayTolerance: t.detailDayTolerance,
              createAlertDayToleranceBefore: t.createAlertDayToleranceBefore,
              createAlertDayToleranceAfter: t.createAlertDayToleranceAfter,
              detailExpectedAmount: t.detailExpectedAmount,
              detailNominalAmount: t.detailNominalAmount,
              detailAmountTolerance: t.detailAmountTolerance,
              createAlertValueToleranceBelow: t.createAlertValueToleranceBelow,
              createAlertValueToleranceAbove: t.createAlertValueToleranceAbove,
              detailAlertOnOccurrence: t.detailAlertOnOccurrence,
              detailAlertOnMissing: t.detailAlertOnMissing,
              detailMissingGraceDays: t.detailMissingGraceDays,
              createRecurringTitle: t.createRecurringTitle,
              createRecurringSuccess: t.createRecurringSuccess,
              createRecurringError: t.createRecurringError,
              deleteConfirm: t.deleteConfirm,
              deleteSuccess: t.deleteSuccess,
              confirmSuccess: t.confirmSuccess,
              confirmOnlySuggestedError: t.confirmOnlySuggestedError,
              dismissSuccess: t.dismissSuccess,
            }}
            onToast={showToast}
          />
        ) : null}

        {isAuthenticated && !profile?.needs_onboarding && activeSection === "transactions" ? (
          <div className="relative">
            <button
              type="button"
              className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border rounded-full w-8 h-8 absolute top-4 right-4 z-10"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-secondary)" }}
              title={t.helpTitle}
              aria-label={t.helpTitle}
              onClick={() => setHelpModalContext("transactions")}
            >
              <i className="fa-regular fa-circle-question" aria-hidden />
            </button>
            {transactionDeleteConfirm ? (
              <div
                className="modal-overlay"
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-transaction-title"
              >
                <div className="modal-card max-w-md">
                  <h3 id="delete-transaction-title" className="card-title">
                    {t.confirmDeleteTransaction}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    {t.confirmDeleteTransactionWarning}
                  </p>
                  {transactionDeleteConfirm.description ? (
                    <p className="text-sm mt-2 truncate" style={{ color: "var(--text)" }} title={transactionDeleteConfirm.description}>
                      {transactionDeleteConfirm.description}
                    </p>
                  ) : null}
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border"
                      style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
                      title={t.modalCancel}
                      aria-label={t.modalCancel}
                      onClick={() => setTransactionDeleteConfirm(null)}
                    >
                      <i className="fa-solid fa-xmark" aria-hidden />
                    </button>
                    <button
                      type="button"
                      className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border border-rose-600 bg-rose-600 text-white hover:bg-rose-700 hover:border-rose-700"
                      style={{ borderColor: "#be123c", backgroundColor: "#be123c", color: "#fff" }}
                      title={t.actionDelete}
                      aria-label={t.actionDelete}
                      onClick={handleTransactionDelete}
                    >
                      <i className="fa-solid fa-trash-can" aria-hidden />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
            {transactionCommentModal ? (
              <div
                className="modal-overlay"
                role="dialog"
                aria-modal="true"
                aria-labelledby="transaction-comment-title"
              >
                <div className="modal-card max-w-md">
                  <h3 id="transaction-comment-title" className="card-title">
                    {t.transactionComment}
                  </h3>
                  {transactionCommentModal.description ? (
                    <p className="text-sm mt-1 truncate" style={{ color: "var(--text-secondary)" }} title={transactionCommentModal.description}>
                      {transactionCommentModal.description}
                    </p>
                  ) : null}
                  <textarea
                    className="input mt-3 min-h-[80px] w-full resize-y"
                    placeholder={t.transactionCommentPlaceholder}
                    value={transactionCommentModal.comment}
                    onChange={(e) =>
                      setTransactionCommentModal((prev) =>
                        prev ? { ...prev, comment: e.target.value } : null
                      )
                    }
                    rows={3}
                  />
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border"
                      style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
                      title={t.modalCancel}
                      aria-label={t.modalCancel}
                      onClick={() => setTransactionCommentModal(null)}
                    >
                      <i className="fa-solid fa-xmark" aria-hidden />
                    </button>
                    <button
                      type="button"
                      className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border"
                      style={{ borderColor: "var(--primary)", background: "var(--primary)", color: "#fff" }}
                      title={t.modalSave}
                      aria-label={t.modalSave}
                      onClick={() =>
                        handleTransactionCommentSave(
                          transactionCommentModal.txId,
                          transactionCommentModal.comment
                        )
                      }
                    >
                      <i className="fa-solid fa-check" aria-hidden />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
            {/* Account cards: always shown when there are accounts; balance only when profile has show_account_balances */}
            {bankAccounts.length > 0 ? (
              <section className="mx-auto max-w-6xl px-6 pt-10 pb-4">
                {profile?.show_account_balances ? (
                  <div className="flex items-center justify-end gap-3 mb-3">
                    <button
                      type="button"
                      className="icon-button p-2 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 disabled:pointer-events-none"
                      onClick={() => refreshBalances()}
                      disabled={balancesRefreshing}
                      title={balancesRefreshing ? t.refreshingBalances : t.refreshBalances}
                      aria-label={balancesRefreshing ? t.refreshingBalances : t.refreshBalances}
                    >
                      <i className={`fa-solid fa-rotate ${balancesRefreshing ? "fa-spin" : ""}`}></i>
                    </button>
                  </div>
                ) : null}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bankAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="card"
                      style={{
                        borderLeftWidth: '4px',
                        borderLeftColor: getAccountColor(account.id)
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {account.logo_url ? (
                            <img
                              src={account.logo_url}
                              alt={account.institution_name}
                              className="h-10 w-10 rounded flex-shrink-0"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                              <i className="fa-solid fa-building-columns text-slate-500 dark:text-slate-400" />
                            </div>
                          )}
                          {(account.account_source === "manual" || (account.bank_connection_id == null && account.account_source !== "nordigen")) ? (
                            <span className="text-slate-500 dark:text-slate-400 flex-shrink-0" title={t.accountSourceManual}>
                              <i className="fa-solid fa-file-lines text-sm" />
                            </span>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400 flex-shrink-0" title={t.accountSourceAutomatic}>
                              <i className="fa-solid fa-link text-sm" />
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <h3
                              className="text-sm font-medium truncate"
                              style={{ color: getAccountColor(account.id) }}
                            >
                              {account.friendly_name ?? account.account_name ?? account.institution_name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {account.institution_name}
                            </p>
                          </div>
                        </div>
                        <label className="flex shrink-0 items-center cursor-pointer" style={{ color: getAccountColor(account.id) }} title={t.transactionsListTitle}>
                          <input
                            type="checkbox"
                            checked={transactionsAccountFilter.includes(account.id)}
                            onChange={(event) => {
                              setTransactionsPage(0);
                              setTransactionsAccountFilter((prev) => {
                                if (event.target.checked) {
                                  return [...prev, account.id];
                                }
                                return prev.filter((value) => value !== account.id);
                              });
                            }}
                            className="h-4 w-4"
                            aria-label={account.friendly_name ?? account.account_name ?? account.institution_name}
                          />
                        </label>
                      </div>

                      {profile?.show_account_balances ? (
                        <div className="mt-3">
                          {account.current_balance !== null && account.current_balance !== undefined ? (
                            <>
                              <div className="text-2xl font-semibold" style={{ color: "var(--text)" }}>
                                {new Intl.NumberFormat(language.code, {
                                  style: 'currency',
                                  currency: account.balance_currency ?? 'EUR'
                                }).format(account.current_balance)}
                              </div>
                              {account.balance_updated_at && (
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  {t.balanceUpdated}: {formatDate(account.balance_updated_at)}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-sm text-slate-500 dark:text-slate-400 italic">
                              {t.balanceUnavailable}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="mx-auto max-w-6xl px-6 py-10">
              <div className="card">
                <h3 className="card-title">{t.transactionsListTitle}</h3>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <input
                  className="input flex-1 min-w-[220px]"
                  placeholder={t.transactionsSearch}
                  value={transactionsSearch}
                  onChange={(event) => {
                    setTransactionsSearch(event.target.value);
                    setTransactionsPage(0);
                  }}
                />
                <label className="flex items-center gap-2">
                  {t.transactionsRows}
                  <select
                    className="input"
                    value={transactionsPageSize}
                    onChange={(event) => {
                      setTransactionsPageSize(Number(event.target.value));
                      setTransactionsPage(0);
                    }}
                  >
                    {[10, 20, 50].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex rounded border overflow-hidden" style={{ borderColor: "var(--border)" }}>
                  <button
                    type="button"
                    className={`px-3 py-1.5 text-sm ${!transactionsNewOnly ? "opacity-100" : "opacity-70"}`}
                    style={{
                      background: !transactionsNewOnly ? "var(--primary-50)" : "var(--surface)",
                      color: !transactionsNewOnly ? "var(--primary)" : "var(--text-secondary)",
                    }}
                    onClick={() => { setTransactionsNewOnly(false); setTransactionsPage(0); }}
                    title={t.transactionsFilterAll}
                  >
                    {t.transactionsFilterAll}
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1.5 text-sm ${transactionsNewOnly ? "opacity-100" : "opacity-70"}`}
                    style={{
                      background: transactionsNewOnly ? "var(--primary-50)" : "var(--surface)",
                      color: transactionsNewOnly ? "var(--primary)" : "var(--text-secondary)",
                    }}
                    onClick={() => { setTransactionsNewOnly(true); setTransactionsPage(0); }}
                    title={t.transactionsFilterNewOnly}
                  >
                    {t.transactionsFilterNewOnly}
                  </button>
                </div>
                <div className="relative" ref={transactionsCategoriesDropdownRef}>
                  <button
                    type="button"
                    className="input flex items-center justify-between gap-2 min-w-[140px]"
                    style={{ color: "var(--text)", background: "var(--background)", borderColor: "var(--border)" }}
                    onClick={() => {
                      setTransactionsCategoriesDropdownOpen((v) => !v);
                      setTransactionsTagsDropdownOpen(false);
                    }}
                  >
                    <span>{transactionsCategoriesLabel}</span>
                    <i className={`fa-solid fa-chevron-${transactionsCategoriesDropdownOpen ? "up" : "down"} text-xs`} />
                  </button>
                  {transactionsCategoriesDropdownOpen && (
                    <div
                      className="absolute top-full left-0 mt-1 py-2 max-h-48 overflow-y-auto min-w-[200px] rounded-md shadow-lg z-20 border"
                      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                    >
                      <div className="flex gap-1 px-2 pb-2 mb-2 border-b" style={{ borderColor: "var(--border)" }}>
                        <button
                          type="button"
                          className="px-2 py-1 text-xs rounded"
                          style={{ color: "var(--primary)", background: "var(--primary-50)" }}
                          onClick={() => {
                            setTransactionsCategoryIds(null);
                            setTransactionsIncludeUncategorized(true);
                            setTransactionsPage(0);
                            setTransactionsCategoriesDropdownOpen(false);
                          }}
                        >
                          {t.filterCategoryAll}
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 text-xs rounded"
                          style={{ color: "var(--text-secondary)", background: "var(--surface-hover)" }}
                          onClick={() => {
                            setTransactionsCategoryIds([]);
                            setTransactionsIncludeUncategorized(true);
                            setTransactionsPage(0);
                            setTransactionsCategoriesDropdownOpen(false);
                          }}
                        >
                          {t.filterCategoryNone}
                        </button>
                      </div>
                      <label className="flex items-center gap-2 px-3 py-1.5 text-sm block hover:bg-opacity-80" style={{ background: "transparent" }}>
                        <input
                          type="checkbox"
                          checked={transactionsIncludeUncategorized}
                          onChange={() => { setTransactionsIncludeUncategorized((v) => !v); setTransactionsPage(0); }}
                        />
                        <span style={{ color: "var(--text)" }}>{t.insightsNoCategory}</span>
                      </label>
                      {categories.map((cat) => (
                        <label key={cat.id} className="flex items-center gap-2 px-3 py-1.5 text-sm block hover:bg-opacity-80" style={{ background: "transparent" }}>
                          <input
                            type="checkbox"
                            checked={transactionsCategoryChecked(cat.id)}
                            onChange={() => toggleTransactionsCategory(cat.id)}
                          />
                          <span style={{ color: "var(--text)" }}>{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative" ref={transactionsTagsDropdownRef}>
                  <button
                    type="button"
                    className="input flex items-center justify-between gap-2 min-w-[140px]"
                    style={{ color: "var(--text)", background: "var(--background)", borderColor: "var(--border)" }}
                    onClick={() => {
                      setTransactionsTagsDropdownOpen((v) => !v);
                      setTransactionsCategoriesDropdownOpen(false);
                    }}
                  >
                    <span>{transactionsTagsLabel}</span>
                    <i className={`fa-solid fa-chevron-${transactionsTagsDropdownOpen ? "up" : "down"} text-xs`} />
                  </button>
                  {transactionsTagsDropdownOpen && (
                    <div
                      className="absolute top-full left-0 mt-1 py-2 max-h-48 overflow-y-auto min-w-[180px] rounded-md shadow-lg z-20 border"
                      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                    >
                      <label className="flex items-center gap-2 px-3 py-1.5 text-sm block hover:bg-opacity-80" style={{ background: "transparent" }}>
                        <input
                          type="checkbox"
                          checked={transactionsIncludeUntagged}
                          onChange={() => { setTransactionsIncludeUntagged((v) => !v); setTransactionsPage(0); }}
                        />
                        <span style={{ color: "var(--text)" }}>{t.insightsNoTag}</span>
                      </label>
                      {tags.map((tag) => (
                        <label key={tag.id} className="flex items-center gap-2 px-3 py-1.5 text-sm block hover:bg-opacity-80" style={{ background: "transparent" }}>
                          <input
                            type="checkbox"
                            checked={transactionsTagChecked(tag.id)}
                            onChange={() => toggleTransactionsTag(tag.id)}
                          />
                          <span style={{ color: "var(--text)" }}>{tag.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
                  style={{
                    background: "var(--surface-hover)",
                    borderColor: "var(--border)",
                    color: "var(--text)",
                  }}
                  onClick={() =>
                    setExportModal((prev) => ({
                      ...prev,
                      open: true,
                      selectedAccountIds: prev.open ? prev.selectedAccountIds : bankAccounts.map((a) => a.id),
                      selectedCategoryIds: prev.open ? prev.selectedCategoryIds : categories.map((c) => c.id),
                      selectedTagIds: prev.open ? prev.selectedTagIds : tags.map((t) => t.id),
                    }))
                  }
                  title={t.exportDownload}
                >
                  <i className="fa-solid fa-file-csv" aria-hidden></i>
                  <span>{t.exportDownload}</span>
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
                <span>
                  {t.transactionsShowing}{" "}
                  {transactionsTotal === 0 ? 0 : transactionsPage * transactionsPageSize + 1}{" "}
                  {t.transactionsTo}{" "}
                  {Math.min(
                    transactionsTotal,
                    transactionsPage * transactionsPageSize + transactionsAll.length
                  )}{" "}
                  {t.transactionsOf} {transactionsTotal}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    className="icon-button"
                    type="button"
                    aria-label={t.transactionsPrev}
                    title={t.transactionsPrev}
                    disabled={transactionsPage === 0}
                    onClick={() => setTransactionsPage((prev) => Math.max(prev - 1, 0))}
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label={t.transactionsNext}
                    title={t.transactionsNext}
                    disabled={
                      (transactionsPage + 1) * transactionsPageSize >= transactionsTotal
                    }
                    onClick={() => setTransactionsPage((prev) => prev + 1)}
                  >
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                {transactionsAll.length === 0 ? (
                  <div className="text-sm text-slate-500 dark:text-slate-300">
                    {t.transactionsListEmpty}
                  </div>
                ) : (
                  transactionsAll.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex flex-col gap-2 border-b border-slate-200 pb-3 text-sm dark:border-slate-700 md:flex-row md:flex-wrap md:items-center md:justify-between"
                    >
                      <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-2 order-1">
                        <input
                          type="checkbox"
                          checked={tx.include_in_totals !== false}
                          onChange={(e) =>
                            handleTransactionIncludeInTotals(tx.id, e.target.checked)
                          }
                          title={t.transactionsIncludeInTotals}
                          aria-label={t.transactionsIncludeInTotals}
                          className="mt-1.5 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-slate-700 dark:text-slate-200 break-words">
                            {tx.description ?? tx.institution_name ?? t.dashboardFilterAll}
                            {tx.status === "pending" ? (
                              <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                                ({t.transactionStatusPending})
                              </span>
                            ) : null}
                          </div>
                          <div
                            className="text-xs font-medium"
                            style={
                              tx.bank_account_id != null
                                ? { color: getAccountColor(tx.bank_account_id) }
                                : undefined
                            }
                          >
                            {(
                              (() => {
                                const account =
                                  tx.bank_account_id != null
                                    ? bankAccounts.find((a) => a.id === tx.bank_account_id)
                                    : null;
                                return account
                                  ? account.friendly_name ??
                                      account.account_name ??
                                      account.institution_name ??
                                      ""
                                  : tx.account_friendly_name ??
                                      tx.account_name ??
                                      tx.institution_name ??
                                      "";
                              })()
                            )}
                          </div>
                        </div>
                      </label>
                      <div className="flex flex-wrap items-center gap-2 order-2 w-full min-w-0 md:w-auto md:order-none">
                        {(tx.is_new ?? false) ? (
                          <span
                            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium shrink-0"
                            style={{ background: "var(--primary-50)", color: "var(--primary)" }}
                            title={t.transactionClearNew}
                          >
                            {t.transactionNew}
                            <button
                              type="button"
                              className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
                              aria-label={t.transactionClearNew}
                              onClick={() => handleTransactionMarkNotNew(tx.id)}
                            >
                              <i className="fa-solid fa-times text-[10px]" aria-hidden />
                            </button>
                          </span>
                        ) : null}
                        <select
                          className="input max-w-[140px] min-w-0 text-xs shrink-0"
                          value={tx.category_id ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            handleTransactionCategoryChange(
                              tx.id,
                              v === "" ? null : Number(v)
                            );
                          }}
                          title={t.transactionCategory}
                        >
                          <option value="">—</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="icon-button text-xs shrink-0 w-8 h-8 inline-flex items-center justify-center"
                          title={t.createAlertFromTransaction}
                          aria-label={t.createAlertFromTransaction}
                          disabled={!tx.booking_date || !tx.amount}
                          onClick={() => {
                            const day = tx.booking_date
                              ? new Date(tx.booking_date).getDate()
                              : 1;
                            setCreateAlertModal({
                              open: true,
                              txId: tx.id,
                              description: tx.description ?? null,
                              amount: tx.amount,
                              currency: tx.currency ?? "",
                              dayOfMonth: day,
                              day_tolerance_before: "1",
                              day_tolerance_after: "1",
                              value_tolerance_below: "0",
                              value_tolerance_above: "0",
                            });
                          }}
                        >
                          <i className="fa-solid fa-bell" aria-hidden></i>
                        </button>
                        <button
                          type="button"
                          className={`icon-button text-xs shrink-0 w-8 h-8 inline-flex items-center justify-center ${(tx.comment ?? "").length > 0 ? "opacity-100" : "opacity-70"}`}
                          title={t.transactionComment}
                          aria-label={t.transactionComment}
                          onClick={() =>
                            setTransactionCommentModal({
                              txId: tx.id,
                              description: tx.description ?? null,
                              comment: tx.comment ?? "",
                            })
                          }
                        >
                          <i className={`fa-${(tx.comment ?? "").length > 0 ? "solid" : "regular"} fa-comment`} aria-hidden></i>
                        </button>
                        <button
                          type="button"
                          className="icon-button text-xs shrink-0 w-8 h-8 inline-flex items-center justify-center text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                          title={t.actionDelete}
                          aria-label={t.actionDelete}
                          onClick={() =>
                            setTransactionDeleteConfirm({
                              id: tx.id,
                              description: tx.description ?? tx.institution_name ?? undefined,
                            })
                          }
                        >
                          <i className="fa-solid fa-trash-can" aria-hidden></i>
                        </button>
                        <div className="relative">
                          <button
                            type="button"
                            className="flex flex-wrap gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
                            onClick={() =>
                              setTransactionEditTags(
                                transactionEditTags === tx.id ? null : tx.id
                              )
                            }
                            title={t.transactionTags}
                          >
                            {(tx.tags ?? []).length === 0 ? (
                              <span className="text-slate-500">+ {t.transactionTags}</span>
                            ) : (
                              (tx.tags ?? []).map((tag) => (
                                <span
                                  key={tag.id}
                                  className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                                >
                                  {tag.name}
                                </span>
                              ))
                            )}
                          </button>
                          {transactionEditTags === tx.id ? (
                            <div className="absolute right-0 top-full z-10 mt-1 max-h-48 w-48 overflow-auto rounded border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                              {tags.map((tag) => {
                                const selected = (tx.tags ?? []).some(
                                  (t) => t.id === tag.id
                                );
                                return (
                                  <label
                                    key={tag.id}
                                    className="flex cursor-pointer items-center gap-2 py-1 text-xs"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selected}
                                      onChange={(e) => {
                                        const currentIds = (tx.tags ?? []).map((t) => t.id);
                                        const next = e.target.checked
                                          ? [...new Set([...currentIds, tag.id])]
                                          : currentIds.filter((id) => id !== tag.id);
                                        handleTransactionTagsChange(tx.id, next);
                                      }}
                                    />
                                    {tag.name}
                                  </label>
                                );
                              })}
                              <button
                                type="button"
                                className="mt-2 w-full rounded border border-slate-200 py-1 text-xs dark:border-slate-600"
                                onClick={() => setTransactionEditTags(null)}
                              >
                                {t.modalCancel}
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className="text-right flex items-start gap-1 justify-end order-3 w-full min-w-0 md:w-auto md:order-none shrink-0">
                        <div>
                          <div>{formatAmount(tx.amount, tx.currency)}</div>
                          <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            {t.postingDate}: {formatDate(tx.posting_date ?? tx.booking_date)}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500">
                            {t.bookingDate}: {formatDate(tx.booking_date)}
                          </div>
                        </div>
                        {(tx.posting_date ?? tx.booking_date) ? (
                          <div className="flex flex-col shrink-0">
                            <button
                              type="button"
                              className="p-0.5 rounded border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                              style={{ color: "var(--text-secondary)" }}
                              title={t.postingDateLater}
                              aria-label={t.postingDateLater}
                              onClick={() => handleTransactionPostingDateChange(tx.id, 1)}
                            >
                              <i className="fa-solid fa-chevron-up text-[10px]" />
                            </button>
                            <button
                              type="button"
                              className="p-0.5 rounded border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                              style={{ color: "var(--text-secondary)" }}
                              title={t.postingDateEarlier}
                              aria-label={t.postingDateEarlier}
                              onClick={() => handleTransactionPostingDateChange(tx.id, -1)}
                            >
                              <i className="fa-solid fa-chevron-down text-[10px]" />
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
          </div>
        ) : null}
        {isAuthenticated && activeSection === "profile" && profile ? (
          <section className="mx-auto max-w-3xl px-6 py-16">
            <div className="card">
              <div className="flex items-center justify-between gap-2">
                <h2 className="card-title">{t.profileTitle}</h2>
                <button
                  type="button"
                  className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border rounded-full w-8 h-8"
                  style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-secondary)" }}
                  title={t.helpTitle}
                  aria-label={t.helpTitle}
                  onClick={() => setHelpModalContext("profile")}
                >
                  <i className="fa-regular fa-circle-question" aria-hidden />
                </button>
              </div>
              <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                <nav
                  className="flex flex-wrap gap-1 border-b mb-4"
                  style={{ borderColor: "var(--border)" }}
                  aria-label={t.profileTitle}
                >
                  {(["user", "channels", "alerts", "storage", "tokens"] as const).map((tabId) => (
                    <button
                      key={tabId}
                      type="button"
                      className="px-3 py-2 rounded-t text-sm font-medium transition-colors"
                      style={{
                        color: profileTab === tabId ? "var(--primary)" : "var(--text-secondary)",
                        borderBottom: profileTab === tabId ? "2px solid var(--primary)" : "2px solid transparent",
                        marginBottom: -1,
                      }}
                      onClick={() => setProfileTab(tabId)}
                    >
                      {tabId === "user" && t.profileTabUser}
                      {tabId === "channels" && t.profileTabChannels}
                      {tabId === "alerts" && t.profileTabAlerts}
                      {tabId === "storage" && t.profileTabStorage}
                      {tabId === "tokens" && t.profileTabApiTokens}
                    </button>
                  ))}
                </nav>
                <div className="grid gap-4">
                  {profileTab === "user" && (
                    <>
                      <div>
                        <span className="font-medium">{t.profileEmail}:</span>{" "}
                        {profile.emails?.find((email) => email.is_primary)?.email ??
                          profile.emails?.[0]?.email ??
                          t.profileNoEmail}
                      </div>
                      <label className="grid gap-2">
                        <span className="font-medium">{t.profileName}</span>
                        <input
                          className="input"
                          value={profileForm.display_name}
                          onChange={(event) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              display_name: event.target.value,
                            }))
                          }
                          placeholder={t.profileName}
                        />
                      </label>
                      <label className="grid gap-2">
                        <span className="font-medium">{t.profileCountry}</span>
                        <select
                          className="input"
                          value={profileForm.country}
                          onChange={(event) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              country: event.target.value,
                            }))
                          }
                        >
                          <option value="" disabled>{t.profileCountryPlaceholder}</option>
                          {countryOptions.map((item) => (
                            <option key={item.code} value={item.code}>
                              {item.names[language.code as "en" | "pt" | "es" | "fr"] ??
                                item.names.en}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                        <input
                          type="checkbox"
                          checked={profileForm.show_account_balances}
                          onChange={(event) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              show_account_balances: event.target.checked,
                            }))
                          }
                          className="h-4 w-4"
                        />
                        <div className="flex-1">
                          <span className="font-medium" style={{ color: "var(--text)" }}>
                            {t.profileShowBalances}
                          </span>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {t.profileShowBalancesHelp}
                          </p>
                        </div>
                      </label>
                      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                        <input
                          type="checkbox"
                          checked={profileForm.auto_detection_enabled}
                          onChange={(event) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              auto_detection_enabled: event.target.checked,
                            }))
                          }
                          className="h-4 w-4"
                        />
                        <div className="flex-1">
                          <span className="font-medium" style={{ color: "var(--text)" }}>
                            {t.profileAutoDetection}
                          </span>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {t.profileAutoDetectionHelp}
                          </p>
                        </div>
                      </label>
                      <div>
                        <span className="font-medium">{t.profileAdmin}:</span>{" "}
                        {profile.is_admin ? "✓" : "—"}
                      </div>
                    </>
                  )}
                  {profileTab === "channels" && (
                    <>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <span className="font-medium inline-flex items-center gap-2" style={{ color: "var(--text)" }}>
                      <i className="fa-brands fa-telegram" aria-hidden style={{ color: "#0088cc" }} />
                      {t.profileTelegramId}
                    </span>
                    {profile?.telegram_chat_id ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm" style={{ color: "var(--text)" }}>
                          {t.profileTelegramLinked} (ID: {profile.telegram_chat_id})
                        </p>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center p-2 rounded border transition-colors min-w-[2.25rem]"
                          style={{
                            background: "var(--surface-hover)",
                            borderColor: "var(--border)",
                            color: "var(--text)",
                          }}
                          title={t.profileTelegramUnlink}
                          aria-label={t.profileTelegramUnlink}
                          onClick={async () => {
                            if (!apiToken) return;
                            const res = await fetch(`${apiBase}/api/telegram/unlink`, {
                              method: "DELETE",
                              headers: { Authorization: `Bearer ${apiToken}` },
                            });
                            if (res.ok) {
                              const meRes = await fetch(`${apiBase}/api/me`, {
                                headers: { Authorization: `Bearer ${apiToken}` },
                              });
                              if (meRes.ok) setProfile(await meRes.json());
                              setProfileForm((prev) => ({ ...prev, telegram_chat_id: "" }));
                            }
                          }}
                        >
                          <i className="fa-solid fa-link-slash text-sm" aria-hidden />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn primary"
                          onClick={handleTelegramLinkCode}
                          disabled={telegramLinkCodeLoading}
                        >
                          {telegramLinkCodeLoading ? "…" : t.profileTelegramLinkButton}
                        </button>
                        {telegramLinkCodeError && (
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {telegramLinkCodeError}
                          </p>
                        )}
                        {telegramLinkCode && (
                          <div
                            className="rounded-lg border p-4 space-y-2"
                            style={{
                              borderColor: "var(--border)",
                              background: "var(--surface)",
                            }}
                          >
                            <p className="text-sm" style={{ color: "var(--text)" }}>
                              1. {t.profileTelegramLinkStep1}
                              {telegramLinkCode.bot_link ? (
                                <>
                                  {" "}
                                  <a
                                    href={telegramLinkCode.bot_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline"
                                  >
                                    @{telegramLinkCode.bot_username}
                                  </a>
                                </>
                              ) : null}
                            </p>
                            <p className="text-sm" style={{ color: "var(--text)" }}>
                              2. {t.profileTelegramLinkStep2}:{" "}
                              <strong className="font-mono text-lg tracking-wider">
                                {telegramLinkCode.code}
                              </strong>
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {t.profileTelegramLinkExpires}
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {t.profileTelegramOrManual}
                        </p>
                        <input
                          className="input"
                          type="text"
                          value={profileForm.telegram_chat_id}
                          onChange={(event) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              telegram_chat_id: event.target.value,
                            }))
                          }
                          placeholder={t.profileTelegramId}
                        />
                      </>
                    )}
                  </div>
                  <div ref={slackHelpRef} className="relative grid gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium inline-flex items-center gap-2" style={{ color: "var(--text)" }}>
                        <i className="fa-brands fa-slack" aria-hidden style={{ color: "#4A154B" }} />
                        {t.profileSlackWebhookUrl}
                      </span>
                      <button
                        type="button"
                        className="p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-offset-1"
                        style={{ color: "var(--text)" }}
                        aria-label={t.profileSlackWebhookUrl}
                        onClick={() => setSlackHelpOpen((open) => !open)}
                      >
                        <i className="fa-solid fa-circle-question text-base" aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50"
                        style={{ color: "var(--text)" }}
                        title={t.profileSlackTestButton}
                        aria-label={t.profileSlackTestButton}
                        disabled={slackTestLoading || !(profileForm.slack_webhook_url?.trim())}
                        onClick={async () => {
                          if (!apiToken) return;
                          setSlackTestLoading(true);
                          try {
                            const res = await fetch(`${apiBase}/api/slack/test`, {
                              method: "POST",
                              headers: {
                                Authorization: `Bearer ${apiToken}`,
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                webhook_url: profileForm.slack_webhook_url?.trim() || null,
                              }),
                            });
                            if (res.ok) {
                              showToast(t.profileSlackTestSent, "success");
                            } else {
                              const err = await res.json().catch(() => ({}));
                              showToast(err.detail || t.profileSlackTestError, "error");
                            }
                          } catch {
                            showToast(t.profileSlackTestError, "error");
                          } finally {
                            setSlackTestLoading(false);
                          }
                        }}
                      >
                        <i className="fa-solid fa-paper-plane text-sm" aria-hidden />
                      </button>
                    </div>
                    {slackHelpOpen && (
                      <div
                        className="absolute left-0 top-full z-50 mt-1 w-80 max-w-[calc(100vw-2rem)] rounded-lg border p-3 text-sm shadow-lg"
                        style={{
                          borderColor: "var(--border)",
                          background: "var(--surface)",
                          color: "var(--text)",
                        }}
                      >
                        {t.profileSlackWebhookHelpPopup.split("\n\n").map((para, i) => (
                          <p key={i} className={i > 0 ? "mt-2" : ""}>
                            {para}
                          </p>
                        ))}
                      </div>
                    )}
                    <input
                      className="input"
                      type="url"
                      value={profileForm.slack_webhook_url}
                      onChange={(event) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          slack_webhook_url: event.target.value,
                        }))
                      }
                      placeholder={t.profileSlackWebhookUrlPlaceholder}
                    />
                  </div>
                </div>
                    </>
                  )}
                  {profileTab === "alerts" && (
                    <>
                <div className="grid gap-2">
                  <span className="font-medium" style={{ color: "var(--text)" }}>{t.profileAlertsSection}</span>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                    <input
                      type="checkbox"
                      checked={profileForm.telegram_alerts_enabled}
                      onChange={(event) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          telegram_alerts_enabled: event.target.checked,
                        }))
                      }
                      className="h-4 w-4"
                    />
                    <div className="flex-1">
                      <span className="font-medium" style={{ color: "var(--text)" }}>
                        {t.profileTelegramAlerts}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {t.profileTelegramAlertsHelp}
                      </p>
                    </div>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                    <input
                      type="checkbox"
                      checked={profileForm.slack_alerts_enabled}
                      onChange={(event) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          slack_alerts_enabled: event.target.checked,
                        }))
                      }
                      className="h-4 w-4"
                    />
                    <div className="flex-1">
                      <span className="font-medium" style={{ color: "var(--text)" }}>
                        {t.profileSlackAlerts}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {t.profileSlackAlertsHelp}
                      </p>
                    </div>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                    <input
                      type="checkbox"
                      checked={profileForm.weekly_emails_enabled}
                      onChange={(event) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          weekly_emails_enabled: event.target.checked,
                        }))
                      }
                      className="h-4 w-4"
                    />
                    <div className="flex-1">
                      <span className="font-medium" style={{ color: "var(--text)" }}>
                        {t.profileWeeklyEmails}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {t.profileWeeklyEmailsHelp}
                      </p>
                    </div>
                  </label>
                </div>
                    </>
                  )}
                  {profileTab === "storage" && (
                    <>
                <div className="grid gap-2">
                  <span className="font-medium" style={{ color: "var(--text)" }}>{t.profileStorageMode}</span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label
                      className={`flex cursor-pointer flex-col gap-2 rounded-lg border p-4 transition-colors ${
                        profileForm.storage_mode === "cloud"
                          ? "border-blue-500 dark:border-blue-400"
                          : "border-slate-200 dark:border-slate-700"
                      }`}
                      style={{
                        background: profileForm.storage_mode === "cloud" ? "var(--primary-50)" : "var(--surface)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="storage_mode"
                          checked={profileForm.storage_mode === "cloud"}
                          onChange={() => setProfileForm((prev) => ({ ...prev, storage_mode: "cloud" }))}
                          className="h-4 w-4"
                        />
                        <span className="font-medium" style={{ color: "var(--text)" }}>{t.profileStorageModeCloud}</span>
                      </div>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{t.profileStorageModeCloudHelp}</p>
                    </label>
                    <label
                      className={`flex cursor-pointer flex-col gap-2 rounded-lg border p-4 transition-colors ${
                        profileForm.storage_mode === "local"
                          ? "border-blue-500 dark:border-blue-400"
                          : "border-slate-200 dark:border-slate-700"
                      }`}
                      style={{
                        background: profileForm.storage_mode === "local" ? "var(--primary-50)" : "var(--surface)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="storage_mode"
                          checked={profileForm.storage_mode === "local"}
                          onChange={() => setProfileForm((prev) => ({ ...prev, storage_mode: "local" }))}
                          className="h-4 w-4"
                        />
                        <span className="font-medium" style={{ color: "var(--text)" }}>{t.profileStorageModeLocal}</span>
                      </div>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{t.profileStorageModeLocalHelp}</p>
                    </label>
                  </div>
                </div>
                    </>
                  )}
                  {profileTab === "tokens" && (
                    <>
                <div className="grid gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium" style={{ color: "var(--text)" }}>{t.profileApiTokens}</span>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center p-2 rounded border transition-colors min-w-[2.25rem]"
                      style={{
                        background: "var(--surface-hover)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                      title={t.profileApiTokenCreate}
                      aria-label={t.profileApiTokenCreate}
                      onClick={() => {
                        setApiTokenCreateModal("form");
                        setApiTokenCreateName("");
                      }}
                    >
                      <i className="fa-solid fa-plus text-sm" aria-hidden />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t.profileApiTokensHelp}</p>
                  {apiTokensLoading ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
                  ) : apiTokens.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t.profileApiTokensEmpty}</p>
                  ) : (
                    <ul className="space-y-2">
                      {apiTokens.map((tok) => (
                        <li
                          key={tok.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
                          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                        >
                          <div className="min-w-0">
                            <span className="font-medium" style={{ color: "var(--text)" }}>{tok.name}</span>
                            <span className="ml-2 font-mono text-xs" style={{ color: "var(--text-tertiary)" }}>{tok.token_prefix}…</span>
                            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                              {t.profileApiTokenLastUsed}: {tok.last_used_at
                                ? new Date(tok.last_used_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })
                                : t.profileApiTokenNeverUsed}
                            </p>
                          </div>
                          {apiTokenDeleteConfirm === tok.id ? (
                            <span className="flex items-center gap-2">
                              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{t.profileApiTokenDeleteConfirm}</span>
                              <button
                                type="button"
                                className="text-xs underline"
                                style={{ color: "var(--text)" }}
                                onClick={() => setApiTokenDeleteConfirm(null)}
                              >
                                {t.modalCancel}
                              </button>
                              <button
                                type="button"
                                className="text-xs font-medium text-red-600 dark:text-red-400"
                                onClick={async () => {
                                  if (!apiToken) return;
                                  const res = await fetch(`${apiBase}/api/me/tokens/${tok.id}`, {
                                    method: "DELETE",
                                    headers: { Authorization: `Bearer ${apiToken}` },
                                  });
                                  if (res.ok) {
                                    setApiTokenDeleteConfirm(null);
                                    loadApiTokens();
                                  }
                                }}
                              >
                                {t.profileApiTokenDelete}
                              </button>
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="inline-flex items-center justify-center p-2 rounded border transition-colors min-w-[2.25rem]"
                              style={{
                                background: "var(--surface-hover)",
                                borderColor: "var(--border)",
                                color: "var(--error)",
                              }}
                              title={t.profileApiTokenDelete}
                              aria-label={t.profileApiTokenDelete}
                              onClick={() => setApiTokenDeleteConfirm(tok.id)}
                            >
                              <i className="fa-solid fa-trash text-sm" aria-hidden />
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                    </>
                  )}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    className="p-2 rounded-md border transition-colors"
                    style={{
                      background: "var(--surface-hover)",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                    title={t.modalCancel}
                    aria-label={t.modalCancel}
                    onClick={() => {
                      setProfileForm({
                        display_name: profile.display_name ?? "",
                        country: profile.country ?? "",
                        telegram_chat_id: profile.telegram_chat_id ?? "",
                        show_account_balances: profile.show_account_balances ?? true,
                        telegram_alerts_enabled: profile.telegram_alerts_enabled ?? true,
                        weekly_emails_enabled: profile.weekly_emails_enabled ?? true,
                      });
                      setActiveSection("home");
                    }}
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-md border transition-colors"
                    style={{
                      background: "var(--primary-50)",
                      borderColor: "var(--primary)",
                      color: "var(--primary)",
                    }}
                    title={t.modalConfirm}
                    aria-label={t.modalConfirm}
                    onClick={handleProfileSave}
                  >
                    <i className="fa-solid fa-check" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {apiTokenCreateModal !== "closed" ? (
          <div
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="api-token-modal-title"
            tabIndex={-1}
            onClick={(e) => {
              if (e.target === e.currentTarget) setApiTokenCreateModal("closed");
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape" || e.key === "Esc") {
                e.preventDefault();
                setApiTokenCreateModal("closed");
                setApiTokenCreateName("");
              }
            }}
          >
            <div className="modal-card max-w-md" onClick={(e) => e.stopPropagation()}>
              {apiTokenCreateModal === "form" ? (
                <>
                  <h2 id="api-token-modal-title" className="card-title">{t.profileApiTokenCreate}</h2>
                  <label className="mt-4 grid gap-2">
                    <span className="font-medium text-sm" style={{ color: "var(--text)" }}>{t.profileApiTokenName}</span>
                    <input
                      className="input"
                      value={apiTokenCreateName}
                      onChange={(e) => setApiTokenCreateName(e.target.value)}
                      placeholder={t.profileApiTokenNamePlaceholder}
                      autoFocus
                    />
                  </label>
                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center p-2 rounded border transition-colors min-w-[2.25rem]"
                      style={{
                        background: "var(--surface-hover)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                      title={t.modalCancel}
                      aria-label={t.modalCancel}
                      onClick={() => { setApiTokenCreateModal("closed"); setApiTokenCreateName(""); }}
                    >
                      <i className="fa-solid fa-xmark" aria-hidden />
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center p-2 rounded border transition-colors min-w-[2.25rem]"
                      style={{
                        background: "var(--primary)",
                        borderColor: "var(--primary)",
                        color: "white",
                      }}
                      title={t.profileApiTokenCreate}
                      aria-label={t.profileApiTokenCreate}
                      disabled={!apiTokenCreateName.trim() || apiTokenCreateSubmitting}
                      onClick={async () => {
                        if (!apiToken || !apiTokenCreateName.trim()) return;
                        setApiTokenCreateSubmitting(true);
                        try {
                          const res = await fetch(`${apiBase}/api/me/tokens`, {
                            method: "POST",
                            headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" },
                            body: JSON.stringify({ name: apiTokenCreateName.trim() }),
                          });
                          if (res.ok) {
                            const data = await res.json();
                            setApiTokenCreateModal({ name: data.name, token: data.token, token_prefix: data.token_prefix });
                            loadApiTokens();
                          }
                        } finally {
                          setApiTokenCreateSubmitting(false);
                        }
                      }}
                    >
                      {apiTokenCreateSubmitting ? (
                        <i className="fa-solid fa-spinner fa-spin" aria-hidden />
                      ) : (
                        <i className="fa-solid fa-check" aria-hidden />
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 id="api-token-modal-title" className="card-title">{t.profileApiTokenCreatedTitle}</h2>
                  <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>{t.profileApiTokenCreatedMessage}</p>
                  <div
                    className="mt-4 rounded-lg border p-3 font-mono text-sm break-all select-all"
                    style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                  >
                    {apiTokenCreateModal.token}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="btn primary"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(apiTokenCreateModal.token);
                          setApiTokenCopyFeedback(true);
                          setTimeout(() => setApiTokenCopyFeedback(false), 2000);
                        } catch {
                          // ignore
                        }
                      }}
                    >
                      {apiTokenCopyFeedback ? t.profileApiTokenCopied : t.profileApiTokenCopy}
                    </button>
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => { setApiTokenCreateModal("closed"); }}
                    >
                      {t.modalConfirm}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : null}

        {helpModalContext ? (
          <div
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-modal-title"
          >
            <div className="modal-card max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-2">
                <h2 id="help-modal-title" className="card-title">
                  {(t as Record<string, string>)[HELP_CONTENT[helpModalContext].titleKey]}
                </h2>
                <button
                  type="button"
                  className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border rounded-full w-8 h-8"
                  style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
                  title={t.helpClose}
                  aria-label={t.helpClose}
                  onClick={() => setHelpModalContext(null)}
                >
                  <i className="fa-solid fa-xmark" aria-hidden />
                </button>
              </div>
              <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                {(t as Record<string, string>)[HELP_CONTENT[helpModalContext].introKey]}
              </p>
              <ul className="mt-4 space-y-3">
                {HELP_CONTENT[helpModalContext].items.map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-sm">
                    <span
                      className={`shrink-0 rounded border inline-flex items-center justify-center gap-1 ${item.icons ? "min-w-[4.5rem] px-1.5 py-1" : "w-8 h-8"}`}
                      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                      aria-hidden
                    >
                      {item.icons ? (
                        <>
                          <i className={`${item.icons[0]} text-base`} style={{ color: "var(--text-secondary)" }} />
                          <span style={{ color: "var(--text-tertiary)", fontSize: "0.65rem" }}>/</span>
                          <i className={`${item.icons[1]} text-base`} style={{ color: "var(--text-secondary)" }} />
                        </>
                      ) : (
                        <i className={`${item.icon} text-base`} style={{ color: "var(--text-secondary)" }} />
                      )}
                    </span>
                    <div>
                      <span className="font-medium" style={{ color: "var(--text)" }}>
                        {(t as Record<string, string>)[item.labelKey]}
                      </span>
                      <p className="mt-0.5" style={{ color: "var(--text-secondary)" }}>
                        {(t as Record<string, string>)[item.descKey]}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        {isAuthenticated && profile?.is_admin && apiToken && activeSection === "adminDashboard" ? (
          <AdminDashboard
            token={apiToken}
            apiBase={apiBase}
            t={{
              metricsTitle: t.metricsTitle,
              metricsUsers: t.metricsUsers,
              metricsBanking: t.metricsBanking,
              metricsRecurring: t.metricsRecurring,
              metricsEngagement: t.metricsEngagement,
              metricsTotalUsers: t.metricsTotalUsers,
              metricsActiveUsers7d: t.metricsActiveUsers7d,
              metricsActiveUsers30d: t.metricsActiveUsers30d,
              metricsOnboardingCompleted: t.metricsOnboardingCompleted,
              metricsUsersWithAccount: t.metricsUsersWithAccount,
              metricsTotalAccounts: t.metricsTotalAccounts,
              metricsTotalConnections: t.metricsTotalConnections,
              metricsTotalTransactions: t.metricsTotalTransactions,
              metricsAvgAccountsPerUser: t.metricsAvgAccountsPerUser,
              metricsAvgTransactionsPerUser: t.metricsAvgTransactionsPerUser,
              metricsTotalPatterns: t.metricsTotalPatterns,
              metricsPatternsActive: t.metricsPatternsActive,
              metricsPatternsSuggested: t.metricsPatternsSuggested,
              metricsPatternsPaused: t.metricsPatternsPaused,
              metricsPatternsAutoDetected: t.metricsPatternsAutoDetected,
              metricsPatternsManual: t.metricsPatternsManual,
              metricsPatternsMigrated: t.metricsPatternsMigrated,
              metricsUsersWithPatterns: t.metricsUsersWithPatterns,
              metricsAvgPatternsPerUser: t.metricsAvgPatternsPerUser,
              metricsOccurrencesMatched: t.metricsOccurrencesMatched,
              metricsTelegramEnabled: t.metricsTelegramEnabled,
              metricsWeeklyEmailsEnabled: t.metricsWeeklyEmailsEnabled,
              metricsLoading: t.metricsLoading,
              metricsError: t.metricsError,
            }}
          />
        ) : null}

        {isAuthenticated && profile?.is_admin && apiToken && activeSection === "audit" ? (
          <Audit
            token={apiToken}
            apiBase={apiBase}
            t={{
              auditTitle: t.auditTitle,
              auditDate: t.auditDate,
              auditUser: t.auditUser,
              auditAction: t.auditAction,
              auditResource: t.auditResource,
              auditDetails: t.auditDetails,
              auditFilterAction: t.auditFilterAction,
              auditFilterAll: t.auditFilterAll,
              auditResult: t.auditResult,
              auditResultSuccess: t.auditResultSuccess,
              auditResultFail: t.auditResultFail,
              auditResultInfo: t.auditResultInfo,
              adminRows: t.adminRows,
              adminShowing: t.adminShowing,
              adminOf: t.adminOf,
              adminPrev: t.adminPrev,
              adminNext: t.adminNext,
              auditViewDetails: t.auditViewDetails,
              auditDetailsClose: t.auditDetailsClose,
            }}
            actionLabels={(() => {
              const keys = [
                "user_login", "user_logout", "user_create", "user_delete",
                "category_create", "category_update", "category_delete",
                "tag_create", "tag_update", "tag_delete",
                "account_linked", "account_deleted", "account_alerts_updated",
                "transactions_fetched", "transaction_edited",
                "alert_created", "alert_deleted",
                "gocardless_rate_limit",
                "transaction_fetch_limit_reached",
                "transactions_fetch_scheduled",
                "weekly_send_report",
                "statement_parsed", "transactions_imported_from_pdf",
                "manual_account_created", "account_logo_updated",
                "daily_missing_transaction_alerts",
                "get_account_transactions", "list_institutions",
                "create_requisition", "get_requisition", "get_account_details",
              ];
              const tAny = t as Record<string, string>;
              return Object.fromEntries(keys.map((k) => [k, tAny[`audit_action_${k}`] ?? k]));
            })()}
          />
        ) : null}

        {isAuthenticated && apiToken && activeSection === "settings" ? (
          <Settings
            token={apiToken}
            apiBase={apiBase}
            t={{
              settingsTitle: t.settingsTitle,
              settingsCategories: t.settingsCategories,
              settingsTags: t.settingsTags,
              settingsAddCategory: t.settingsAddCategory,
              settingsAddTag: t.settingsAddTag,
              settingsCategoryName: t.settingsCategoryName,
              settingsTagName: t.settingsTagName,
              settingsExport: t.settingsExport,
              settingsImport: t.settingsImport,
              settingsExportImport: t.settingsExportImport,
              settingsExportSuccess: t.settingsExportSuccess,
              settingsImportSuccess: t.settingsImportSuccess,
              settingsImportError: t.settingsImportError,
              settingsImportFileInvalid: t.settingsImportFileInvalid,
              modalCancel: t.modalCancel,
              modalConfirm: t.modalConfirm,
              settingsDeleteCategoryTitle: t.settingsDeleteCategoryTitle,
              settingsDeleteTagTitle: t.settingsDeleteTagTitle,
              profileSaved: t.profileSaved,
              profileSaveError: t.profileSaveError,
            }}
          />
        ) : null}

        {isAuthenticated && profile?.is_admin && apiToken && activeSection === "users" ? (
          <AdminUsers
            token={apiToken}
            apiBase={apiBase}
            t={{
              adminTitle: t.adminTitle,
              adminCreate: t.adminCreate,
              adminName: t.adminName,
              adminPrimaryEmail: t.adminPrimaryEmail,
              adminIsAdmin: t.adminIsAdmin,
              adminCreateButton: t.adminCreateButton,
              adminStatusActive: t.adminStatusActive,
              adminStatusInactive: t.adminStatusInactive,
              adminMakeAdmin: t.adminMakeAdmin,
              adminRemoveAdmin: t.adminRemoveAdmin,
              adminDeactivate: t.adminDeactivate,
              adminActivate: t.adminActivate,
              adminInvite: t.adminInvite,
              adminAddEmail: t.adminAddEmail,
              adminDeleteUser: t.adminDeleteUser,
              adminEmails: t.adminEmails,
              modalCancel: t.modalCancel,
              modalConfirm: t.modalConfirm,
              modalDeleteTitle: t.modalDeleteTitle,
              adminActions: t.adminActions,
              inviteEmailSent: t.inviteEmailSent,
              inviteEmailFallback: t.inviteEmailFallback,
              inviteEmailRetry: t.inviteEmailRetry,
              inviteLinkLabel: t.inviteLinkLabel,
              adminSearch: t.adminSearch,
              adminRows: t.adminRows,
              adminShowing: t.adminShowing,
              adminOf: t.adminOf,
              adminPrev: t.adminPrev,
              adminNext: t.adminNext,
              adminEmailVerified: t.adminEmailVerified,
              adminTelegramId: t.adminTelegramId,
              adminEditTelegram: t.adminEditTelegram,
              adminTelegramModalTitle: t.adminTelegramModalTitle,
              adminTelegramSave: t.adminTelegramSave,
            }}
          />
        ) : null}

        {activeSection === "home" && !isAuthenticated ? (
          <section className="mx-auto max-w-6xl px-6 pt-16 pb-4">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                {t.heroEyebrow}
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
                {t.heroTitle}
              </h1>
              <div className="mt-4">
                {t.heroBody.includes("\n\n") ? (
                  t.heroBody
                    .split("\n\n")
                    .filter(Boolean)
                    .map((para, i) => (
                      <p
                        key={i}
                        className={
                          i === 0
                            ? "text-lg text-slate-600 dark:text-slate-300"
                            : "mt-3 text-lg text-slate-600 dark:text-slate-300"
                        }
                      >
                        {para.trim().split("\n").map((line, j) => (
                          <span key={j}>
                            {line}
                            {j < para.trim().split("\n").length - 1 && <br />}
                          </span>
                        ))}
                      </p>
                    ))
                ) : (
                  <p className="text-lg text-slate-600 dark:text-slate-300">
                    {t.heroBody}
                  </p>
                )}
                <p className="mt-3 flex flex-wrap items-center gap-2 text-lg text-slate-600 dark:text-slate-300">
                  <i className="fa-brands fa-telegram text-xl" aria-hidden style={{ color: "#0088cc" }} />
                  <i className="fa-brands fa-slack text-xl" aria-hidden style={{ color: "#4A154B" }} />
                  <i className="fa-solid fa-envelope text-xl" aria-hidden />
                  <span>{t.heroAlerts}</span>
                </p>
              </div>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                <button
                  className="btn-primary"
                  type="button"
                  onClick={() => setRegisterModalOpen(true)}
                >
                  {t.heroPrimaryCta}
                </button>
                <a
                  href="/privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveSection("privacy");
                    window.history.pushState({}, "", "/privacy");
                  }}
                  className="text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {t.footerPrivacy}
                </a>
              </div>
            </div>
            <div className="relative flex justify-center lg:justify-end">
              <div
                className="w-full max-w-xl overflow-hidden rounded-2xl border shadow-2xl transition-shadow duration-300 hover:shadow-xl"
                style={{
                  borderColor: "var(--border)",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px var(--border)",
                }}
              >
                <img
                  src={isDark ? "/landing-dark.jpeg" : "/landing-light.jpeg"}
                  alt={t.dashboardTitle}
                  className="w-full object-cover object-top"
                  width={800}
                  height={600}
                  fetchpriority="high"
                />
              </div>
            </div>
          </div>
          </section>
        ) : null}

        {activeSection === "home" && !isAuthenticated ? (
          <section id="landing-carousel" className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
            <div className="w-full">
              <div className="relative overflow-hidden border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900" style={{ minHeight: "420px" }}>
                {/* Carousel slides - order: 1 Privacidade, 2 Categories and Tags, 3 Analysis, 4 Os seus dados */}
                <div
                  className="flex transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(-${landingCarouselIndex * 100}%)` }}
                >
                  {/* Slide 1: Privacidade por design */}
                  <div className="min-w-full shrink-0 px-6 py-8 md:px-10 md:py-10">
                    <h2 className="text-center text-xl font-bold text-slate-900 dark:text-slate-100 md:text-2xl">
                      {t.privacyHighlightsTitle}
                    </h2>
                    <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" aria-hidden>
                          <i className="fa-solid fa-shield-halved text-sm"></i>
                        </span>
                        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.privacyHighlight1}</p>
                      </div>
                      <div className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" aria-hidden>
                          <i className="fa-solid fa-lock text-sm"></i>
                        </span>
                        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.privacyHighlight2}</p>
                      </div>
                      <div className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" aria-hidden>
                          <i className="fa-solid fa-certificate text-sm"></i>
                        </span>
                        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.privacyHighlight3}</p>
                      </div>
                      <div className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" aria-hidden>
                          <i className="fa-solid fa-key text-sm"></i>
                        </span>
                        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.privacyHighlight4}</p>
                      </div>
                      <div className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" aria-hidden>
                          <i className="fa-solid fa-server text-sm"></i>
                        </span>
                        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.privacyHighlight5}</p>
                      </div>
                      <div className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" aria-hidden>
                          <i className="fa-brands fa-github text-sm"></i>
                        </span>
                        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.privacyHighlight6}</p>
                      </div>
                    </div>
                  </div>

                  {/* Slide 2: Categories and Tags (2 cards) */}
                  <div className="min-w-full shrink-0 px-6 py-8 md:px-10 md:py-10">
                    <h2 className="text-center text-xl font-bold text-slate-900 dark:text-slate-100 md:text-2xl">
                      {t.landingFeaturesCategoriesAndTagsTitle ?? "Categories and Tags"}
                    </h2>
                    <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
                      <div className="flex flex-col overflow-visible rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <div
                          className="group relative h-44 w-full shrink-0 cursor-zoom-in overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFeaturePreviewSrc(isDark ? "/categories-dark.png" : "/categories.png")}
                          onKeyDown={(e) => e.key === "Enter" && setFeaturePreviewSrc(isDark ? "/categories-dark.png" : "/categories.png")}
                          onMouseEnter={() => {
                            if (featurePreviewCloseTimeoutRef.current) {
                              clearTimeout(featurePreviewCloseTimeoutRef.current);
                              featurePreviewCloseTimeoutRef.current = null;
                            }
                            if (featurePreviewOpenTimeoutRef.current) {
                              clearTimeout(featurePreviewOpenTimeoutRef.current);
                              featurePreviewOpenTimeoutRef.current = null;
                            }
                            const src = isDark ? "/categories-dark.png" : "/categories.png";
                            featurePreviewOpenTimeoutRef.current = setTimeout(() => setFeaturePreviewSrc(src), FEATURE_PREVIEW_HOVER_MS);
                          }}
                          onMouseLeave={() => {
                            if (featurePreviewOpenTimeoutRef.current) {
                              clearTimeout(featurePreviewOpenTimeoutRef.current);
                              featurePreviewOpenTimeoutRef.current = null;
                            }
                            featurePreviewCloseTimeoutRef.current = setTimeout(() => setFeaturePreviewSrc(null), 200);
                          }}
                        >
                          <img src={isDark ? "/categories-dark.png" : "/categories.png"} alt="" className="h-full w-full object-cover object-top" width={320} height={180} />
                        </div>
                        <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">{t.settingsCategories}</h3>
                        <p className="mt-1 flex-1 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.featureCategoriesBody}</p>
                      </div>
                      <div className="flex flex-col overflow-visible rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <div
                          className="group relative h-44 w-full shrink-0 cursor-zoom-in overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFeaturePreviewSrc(isDark ? "/tags-dark.png" : "/tags.png")}
                          onKeyDown={(e) => e.key === "Enter" && setFeaturePreviewSrc(isDark ? "/tags-dark.png" : "/tags.png")}
                          onMouseEnter={() => {
                            if (featurePreviewCloseTimeoutRef.current) {
                              clearTimeout(featurePreviewCloseTimeoutRef.current);
                              featurePreviewCloseTimeoutRef.current = null;
                            }
                            if (featurePreviewOpenTimeoutRef.current) {
                              clearTimeout(featurePreviewOpenTimeoutRef.current);
                              featurePreviewOpenTimeoutRef.current = null;
                            }
                            const src = isDark ? "/tags-dark.png" : "/tags.png";
                            featurePreviewOpenTimeoutRef.current = setTimeout(() => setFeaturePreviewSrc(src), FEATURE_PREVIEW_HOVER_MS);
                          }}
                          onMouseLeave={() => {
                            if (featurePreviewOpenTimeoutRef.current) {
                              clearTimeout(featurePreviewOpenTimeoutRef.current);
                              featurePreviewOpenTimeoutRef.current = null;
                            }
                            featurePreviewCloseTimeoutRef.current = setTimeout(() => setFeaturePreviewSrc(null), 200);
                          }}
                        >
                          <img src={isDark ? "/tags-dark.png" : "/tags.png"} alt="" className="h-full w-full object-cover object-top" width={320} height={180} />
                        </div>
                        <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">{t.settingsTags}</h3>
                        <p className="mt-1 flex-1 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.featureTagsBody ?? "Assign multiple tags per transaction."}</p>
                      </div>
                    </div>
                  </div>

                  {/* Slide 3: Analysis (3 cards: Bancos, Análises claras, Vista de calendário) */}
                  <div className="min-w-full shrink-0 px-6 py-8 md:px-10 md:py-10">
                    <h2 className="text-center text-xl font-bold text-slate-900 dark:text-slate-100 md:text-2xl">
                      {t.landingFeaturesAnalysisTitle ?? "Analysis"}
                    </h2>
                    <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">
                      <div className="flex flex-col overflow-visible rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <div
                          className="group relative h-44 w-full shrink-0 cursor-zoom-in overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFeaturePreviewSrc(isDark ? "/banks-dark.png" : "/banks.png")}
                          onKeyDown={(e) => e.key === "Enter" && setFeaturePreviewSrc(isDark ? "/banks-dark.png" : "/banks.png")}
                          onMouseEnter={() => {
                            if (featurePreviewCloseTimeoutRef.current) {
                              clearTimeout(featurePreviewCloseTimeoutRef.current);
                              featurePreviewCloseTimeoutRef.current = null;
                            }
                            if (featurePreviewOpenTimeoutRef.current) {
                              clearTimeout(featurePreviewOpenTimeoutRef.current);
                              featurePreviewOpenTimeoutRef.current = null;
                            }
                            const src = isDark ? "/banks-dark.png" : "/banks.png";
                            featurePreviewOpenTimeoutRef.current = setTimeout(() => setFeaturePreviewSrc(src), FEATURE_PREVIEW_HOVER_MS);
                          }}
                          onMouseLeave={() => {
                            if (featurePreviewOpenTimeoutRef.current) {
                              clearTimeout(featurePreviewOpenTimeoutRef.current);
                              featurePreviewOpenTimeoutRef.current = null;
                            }
                            featurePreviewCloseTimeoutRef.current = setTimeout(() => setFeaturePreviewSrc(null), 200);
                          }}
                        >
                          <img src={isDark ? "/banks-dark.png" : "/banks.png"} alt="" className="h-full w-full object-cover object-top" width={320} height={180} />
                        </div>
                        <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">{t.featureBancosTitle ?? t.featureAccountsTitle}</h3>
                        <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.featureAccountsBody}</p>
                      </div>
                      <div className="flex flex-col overflow-visible rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <div
                          className="group relative h-44 w-full shrink-0 cursor-zoom-in overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFeaturePreviewSrc(isDark ? "/insights-dark.jpeg" : "/insights.jpeg")}
                          onKeyDown={(e) => e.key === "Enter" && setFeaturePreviewSrc(isDark ? "/insights-dark.jpeg" : "/insights.jpeg")}
                          onMouseEnter={() => {
                            if (featurePreviewCloseTimeoutRef.current) {
                              clearTimeout(featurePreviewCloseTimeoutRef.current);
                              featurePreviewCloseTimeoutRef.current = null;
                            }
                            if (featurePreviewOpenTimeoutRef.current) {
                              clearTimeout(featurePreviewOpenTimeoutRef.current);
                              featurePreviewOpenTimeoutRef.current = null;
                            }
                            const src = isDark ? "/insights-dark.jpeg" : "/insights.jpeg";
                            featurePreviewOpenTimeoutRef.current = setTimeout(() => setFeaturePreviewSrc(src), FEATURE_PREVIEW_HOVER_MS);
                          }}
                          onMouseLeave={() => {
                            if (featurePreviewOpenTimeoutRef.current) {
                              clearTimeout(featurePreviewOpenTimeoutRef.current);
                              featurePreviewOpenTimeoutRef.current = null;
                            }
                            featurePreviewCloseTimeoutRef.current = setTimeout(() => setFeaturePreviewSrc(null), 200);
                          }}
                        >
                          <img src={isDark ? "/insights-dark.jpeg" : "/insights.jpeg"} alt="" className="h-full w-full object-cover object-top" width={320} height={180} />
                        </div>
                        <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">{t.featureInsightsTitle}</h3>
                        <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                          {(t.featureInsightsBodyBullets ?? t.featureInsightsBody).split("\n").filter((line) => line.trim()).join(" ")}
                        </p>
                      </div>
                      <div className="flex flex-col overflow-visible rounded-lg border border-slate-200 bg-slate-50 p-4 ring-2 ring-blue-500/50 dark:border-slate-700 dark:bg-slate-800/50 dark:ring-blue-400/50">
                        <div
                          className="group relative h-44 w-full shrink-0 cursor-zoom-in overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                          role="button"
                          tabIndex={0}
                          onClick={() => setFeaturePreviewSrc(isDark ? "/calendar-dark.jpeg" : "/calendar.jpeg")}
                          onKeyDown={(e) => e.key === "Enter" && setFeaturePreviewSrc(isDark ? "/calendar-dark.jpeg" : "/calendar.jpeg")}
                          onMouseEnter={() => {
                            if (featurePreviewCloseTimeoutRef.current) {
                              clearTimeout(featurePreviewCloseTimeoutRef.current);
                              featurePreviewCloseTimeoutRef.current = null;
                            }
                            if (featurePreviewOpenTimeoutRef.current) {
                              clearTimeout(featurePreviewOpenTimeoutRef.current);
                              featurePreviewOpenTimeoutRef.current = null;
                            }
                            const src = isDark ? "/calendar-dark.jpeg" : "/calendar.jpeg";
                            featurePreviewOpenTimeoutRef.current = setTimeout(() => setFeaturePreviewSrc(src), FEATURE_PREVIEW_HOVER_MS);
                          }}
                          onMouseLeave={() => {
                            if (featurePreviewOpenTimeoutRef.current) {
                              clearTimeout(featurePreviewOpenTimeoutRef.current);
                              featurePreviewOpenTimeoutRef.current = null;
                            }
                            featurePreviewCloseTimeoutRef.current = setTimeout(() => setFeaturePreviewSrc(null), 200);
                          }}
                        >
                          <img src={isDark ? "/calendar-dark.jpeg" : "/calendar.jpeg"} alt="" className="h-full w-full object-cover object-top" width={320} height={180} />
                        </div>
                        <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">
                          <span className="inline-flex items-center gap-2">
                            {t.featureCalendarTitle}
                            <span className="inline-flex items-center gap-1 rounded-full border border-blue-400 bg-blue-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm dark:border-blue-500 dark:bg-blue-600" title={t.featureNewBadge}>
                              {t.featureNewBadge}
                            </span>
                          </span>
                        </h3>
                        <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.featureCalendarBody}</p>
                      </div>
                    </div>
                  </div>

                  {/* Slide 4: Os seus dados, a sua escolha */}
                  <div className="min-w-full shrink-0 px-6 py-8 md:px-10 md:py-10">
                    <h2 className="text-center text-xl font-bold text-slate-900 dark:text-slate-100 md:text-2xl">
                      {t.landingStorageTitle}
                    </h2>
                    <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {t.landingStorageSubtitle}
                    </p>
                    <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
                      <div className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" aria-hidden>
                          <i className="fa-solid fa-cloud-arrow-up text-sm"></i>
                        </span>
                        <div>
                          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t.landingStorageCloudTitle}</h3>
                          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.landingStorageCloudBody}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" aria-hidden>
                          <i className="fa-solid fa-laptop text-sm"></i>
                        </span>
                        <div>
                          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t.landingStorageLocalTitle}</h3>
                          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.landingStorageLocalBody}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Carousel controls - subtle */}
                <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setLandingCarouselIndex((i) => (i <= 0 ? 3 : i - 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                    aria-label="Previous slide"
                  >
                    <i className="fa-solid fa-chevron-left text-xs"></i>
                  </button>
                  {[0, 1, 2, 3].map((idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setLandingCarouselIndex(idx)}
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${
                        landingCarouselIndex === idx
                          ? "bg-slate-500 dark:bg-slate-400"
                          : "bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500"
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                      aria-current={landingCarouselIndex === idx ? "true" : undefined}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setLandingCarouselIndex((i) => (i >= 3 ? 0 : i + 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                    aria-label="Next slide"
                  >
                    <i className="fa-solid fa-chevron-right text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : null}

          </>
        )}

      {/* Feature image preview overlay (landing Funcionalidades) */}
      {featurePreviewSrc ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Preview"
          onMouseEnter={() => {
            if (featurePreviewCloseTimeoutRef.current) {
              clearTimeout(featurePreviewCloseTimeoutRef.current);
              featurePreviewCloseTimeoutRef.current = null;
            }
          }}
          onMouseLeave={() => setFeaturePreviewSrc(null)}
          onClick={() => setFeaturePreviewSrc(null)}
        >
          <div
            className="flex max-h-[90vh] max-w-[90vw] items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => {
              if (featurePreviewCloseTimeoutRef.current) {
                clearTimeout(featurePreviewCloseTimeoutRef.current);
                featurePreviewCloseTimeoutRef.current = null;
              }
            }}
          >
            <img
              src={featurePreviewSrc}
              alt=""
              className="max-h-[90vh] max-w-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      ) : null}

      </main>

      <footer className="fixed bottom-0 w-full border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-slate-500 dark:text-slate-400 md:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span>{t.footerCopyright}</span>
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                setActiveSection("privacy");
                window.history.pushState({}, "", "/privacy");
              }}
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              {t.footerPrivacy}
            </a>
          </div>
          <div className="flex gap-4">
            <a href="https://github.com/kal001/eurodata-public" target="_blank" rel="noopener noreferrer" aria-label={t.footerGithub} className="hover:text-blue-600">
              <i className="fa-brands fa-github"></i>
            </a>
            <a href="#" aria-label={t.footerLinkedin} className="hover:text-blue-600">
              <i className="fa-brands fa-linkedin"></i>
            </a>
            <a href="#" aria-label={t.footerTwitter} className="hover:text-blue-600">
              <i className="fa-brands fa-x-twitter"></i>
            </a>
          </div>
        </div>
      </footer>

      {/* Floating "To top" - all authenticated sections when scrolled */}
      {isAuthenticated && !profile?.needs_onboarding && showToTopButton && (
        <button
          type="button"
          className="fixed bottom-6 right-6 p-3 rounded-full shadow-lg border z-30 transition-opacity"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--primary)",
          }}
          title={t.insightsNavigateToTop}
          aria-label={t.insightsNavigateToTop}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <i className="fa-solid fa-arrow-up" />
        </button>
      )}
    </div>
  );
}

export default App;
