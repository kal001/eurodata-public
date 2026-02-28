import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { translationsDe } from "./translations/de";
import { translationsEn } from "./translations/en";
import { translationsEs } from "./translations/es";
import { translationsFr } from "./translations/fr";
import { translationsIt } from "./translations/it";
import { translationsNl } from "./translations/nl";
import { translationsPl } from "./translations/pl";
import { translationsPt } from "./translations/pt";
const LazyAdminDashboard = lazy(() => import("./components/AdminDashboard"));
const LazyAdminUsers = lazy(() => import("./components/AdminUsers"));
const LazyAudit = lazy(() => import("./components/Audit"));
const LazyInsights = lazy(() => import("./components/Insights"));
const LazyOnboarding = lazy(() => import("./components/Onboarding"));
const LazyPrivacyPolicy = lazy(() => import("./components/PrivacyPolicy"));
const LazyAboutUs = lazy(() => import("./components/AboutUs"));
const LazyTermsOfService = lazy(() => import("./components/TermsOfService"));
const LazyRecurringTransactions = lazy(() => import("./components/RecurringTransactions"));
const LazySettings = lazy(() => import("./components/Settings"));
import OnboardingWizard from "./components/OnboardingWizard";
import type { OnboardingStepId } from "./components/OnboardingWizard";

const SectionFallback = () => <div className="min-h-[120px] flex items-center justify-center text-slate-500 dark:text-slate-400" aria-hidden>Loading…</div>;
import {
  localTransactionsClear,
  localTransactionsExportCSV,
  localTransactionsExportJSON,
  localTransactionsExportOFX,
  buildOFXFromTransactions,
  localTransactionsGetAll,
  localTransactionsImportFromCSV,
  localTransactionsImportFromJSON,
  localTransactionsImportFromOFX,
  localTransactionsMergeFromFetch,
  parseCSVToImportPayload,
  parseOFXToImportPayload,
  downloadBlob,
  isLocalDataEncrypted,
  isLocalDataUnlocked,
  setLocalEncryptionKey,
  clearLocalEncryptionKey,
  enableLocalEncryption,
  restoreLocalEncryptionFromSession,
} from "./services/localTransactions";
import type { LocalTransaction } from "./services/localTransactions";
import { getAccountColor } from "./utils/accountColors";

const languages = [
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "nl", label: "Nederlands" },
  { code: "pl", label: "Polski" },
];

// EU countries (ISO 3166-1 alpha-2), sorted by English name
const countryOptions = [
  { code: "AT", names: { en: "Austria", pt: "Áustria", es: "Austria", fr: "Autriche", de: "Österreich", it: "Austria", nl: "Oostenrijk", pl: "Austria" } },
  { code: "BE", names: { en: "Belgium", pt: "Bélgica", es: "Bélgica", fr: "Belgique", de: "Belgien", it: "Belgio", nl: "België", pl: "Belgia" } },
  { code: "BG", names: { en: "Bulgaria", pt: "Bulgária", es: "Bulgaria", fr: "Bulgarie", de: "Bulgarien", it: "Bulgaria", nl: "Bulgarije", pl: "Bułgaria" } },
  { code: "HR", names: { en: "Croatia", pt: "Croácia", es: "Croacia", fr: "Croatie", de: "Kroatien", it: "Croazia", nl: "Kroatië", pl: "Chorwacja" } },
  { code: "CY", names: { en: "Cyprus", pt: "Chipre", es: "Chipre", fr: "Chypre", de: "Zypern", it: "Cipro", nl: "Cyprus", pl: "Cypr" } },
  { code: "CZ", names: { en: "Czech Republic", pt: "República Checa", es: "República Checa", fr: "République tchèque", de: "Tschechien", it: "Repubblica Ceca", nl: "Tsjechië", pl: "Czechy" } },
  { code: "DK", names: { en: "Denmark", pt: "Dinamarca", es: "Dinamarca", fr: "Danemark", de: "Dänemark", it: "Danimarca", nl: "Denemarken", pl: "Dania" } },
  { code: "EE", names: { en: "Estonia", pt: "Estónia", es: "Estonia", fr: "Estonie", de: "Estland", it: "Estonia", nl: "Estland", pl: "Estonia" } },
  { code: "FI", names: { en: "Finland", pt: "Finlândia", es: "Finlandia", fr: "Finlande", de: "Finnland", it: "Finlandia", nl: "Finland", pl: "Finlandia" } },
  { code: "FR", names: { en: "France", pt: "França", es: "Francia", fr: "France", de: "Frankreich", it: "Francia", nl: "Frankrijk", pl: "Francja" } },
  { code: "DE", names: { en: "Germany", pt: "Alemanha", es: "Alemania", fr: "Allemagne", de: "Deutschland", it: "Germania", nl: "Duitsland", pl: "Niemcy" } },
  { code: "GR", names: { en: "Greece", pt: "Grécia", es: "Grecia", fr: "Grèce", de: "Griechenland", it: "Grecia", nl: "Griekenland", pl: "Grecja" } },
  { code: "HU", names: { en: "Hungary", pt: "Hungria", es: "Hungría", fr: "Hongrie", de: "Ungarn", it: "Ungheria", nl: "Hongarije", pl: "Węgry" } },
  { code: "IE", names: { en: "Ireland", pt: "Irlanda", es: "Irlanda", fr: "Irlande", de: "Irland", it: "Irlanda", nl: "Ierland", pl: "Irlandia" } },
  { code: "IT", names: { en: "Italy", pt: "Itália", es: "Italia", fr: "Italie", de: "Italien", it: "Italia", nl: "Italië", pl: "Włochy" } },
  { code: "LV", names: { en: "Latvia", pt: "Letónia", es: "Letonia", fr: "Lettonie", de: "Lettland", it: "Lettonia", nl: "Letland", pl: "Łotwa" } },
  { code: "LT", names: { en: "Lithuania", pt: "Lituânia", es: "Lituania", fr: "Lituanie", de: "Litauen", it: "Lituania", nl: "Litouwen", pl: "Litwa" } },
  { code: "LU", names: { en: "Luxembourg", pt: "Luxemburgo", es: "Luxemburgo", fr: "Luxembourg", de: "Luxemburg", it: "Lussemburgo", nl: "Luxemburg", pl: "Luksemburg" } },
  { code: "MT", names: { en: "Malta", pt: "Malta", es: "Malta", fr: "Malte", de: "Malta", it: "Malta", nl: "Malta", pl: "Malta" } },
  { code: "NL", names: { en: "Netherlands", pt: "Países Baixos", es: "Países Bajos", fr: "Pays-Bas", de: "Niederlande", it: "Paesi Bassi", nl: "Nederland", pl: "Holandia" } },
  { code: "PL", names: { en: "Poland", pt: "Polónia", es: "Polonia", fr: "Pologne", de: "Polen", it: "Polonia", nl: "Polen", pl: "Polska" } },
  { code: "PT", names: { en: "Portugal", pt: "Portugal", es: "Portugal", fr: "Portugal", de: "Portugal", it: "Portogallo", nl: "Portugal", pl: "Portugalia" } },
  { code: "RO", names: { en: "Romania", pt: "Roménia", es: "Rumania", fr: "Roumanie", de: "Rumänien", it: "Romania", nl: "Roemenië", pl: "Rumunia" } },
  { code: "SK", names: { en: "Slovakia", pt: "Eslováquia", es: "Eslovaquia", fr: "Slovaquie", de: "Slowakei", it: "Slovacchia", nl: "Slowakije", pl: "Słowacja" } },
  { code: "SI", names: { en: "Slovenia", pt: "Eslovénia", es: "Eslovenia", fr: "Slovénie", de: "Slowenien", it: "Slovenia", nl: "Slovenië", pl: "Słowenia" } },
  { code: "ES", names: { en: "Spain", pt: "Espanha", es: "España", fr: "Espagne", de: "Spanien", it: "Spagna", nl: "Spanje", pl: "Hiszpania" } },
  { code: "SE", names: { en: "Sweden", pt: "Suécia", es: "Suecia", fr: "Suède", de: "Schweden", it: "Svezia", nl: "Zweden", pl: "Szwecja" } },
];

const baseCurrencyOptions = [
  { code: "EUR", label: "EUR" },
  { code: "USD", label: "USD" },
  { code: "GBP", label: "GBP" },
  { code: "CHF", label: "CHF" },
  { code: "PLN", label: "PLN" },
  { code: "SEK", label: "SEK" },
  { code: "NOK", label: "NOK" },
  { code: "DKK", label: "DKK" },
  { code: "CZK", label: "CZK" },
  { code: "RON", label: "RON" },
  { code: "HUF", label: "HUF" },
  { code: "BGN", label: "BGN" },
];

const translations = {
  en: translationsEn,
  pt: translationsPt,
  es: translationsEs,
  fr: translationsFr,
  de: translationsDe,
  it: translationsIt,
  nl: translationsNl,
  pl: translationsPl,
};

const auth0Locales: Record<string, string> = {
  en: "en",
  pt: "pt",
  es: "es",
  fr: "fr",
  de: "de",
  it: "it",
  nl: "nl",
  pl: "pl",
};

type HelpContextId = "transactions" | "accounts" | "insights" | "profile" | "profileTelegramCommands";

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
  profileTelegramCommands: {
    titleKey: "helpTelegramCommandsTitle",
    introKey: "helpTelegramCommandsIntro",
    items: [
      { icon: "fa-solid fa-receipt", labelKey: "helpTgCmdTransactions", descKey: "helpTgCmdTransactionsDesc" },
      { icon: "fa-solid fa-calendar-days", labelKey: "helpTgCmdNext", descKey: "helpTgCmdNextDesc" },
      { icon: "fa-solid fa-scale-balanced", labelKey: "helpTgCmdBalances", descKey: "helpTgCmdBalancesDesc" },
      { icon: "fa-solid fa-calendar", labelKey: "helpTgCmdMonth", descKey: "helpTgCmdMonthDesc" },
      { icon: "fa-solid fa-calendar", labelKey: "helpTgCmdYear", descKey: "helpTgCmdYearDesc" },
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
    "profile" | "users" | "settings" | "audit" | "adminDashboard" | "home" | "transactions" | "accounts" | "insights" | "recurring" | "privacy" | "about" | "terms"
  >("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showToTopButton, setShowToTopButton] = useState(false);
  const [bottomBarVisible, setBottomBarVisible] = useState(true);
  const [mobileHeaderVisible, setMobileHeaderVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const mobileMenuOpenRef = useRef(false);
  const [landingCarouselIndex, setLandingCarouselIndex] = useState(0);
  const [featurePreviewSrc, setFeaturePreviewSrc] = useState<string | null>(null);
  const featurePreviewCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const featurePreviewOpenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const FEATURE_PREVIEW_HOVER_MS = 1500;
  const {
    loginWithRedirect,
    logout,
    isAuthenticated,
    isLoading: auth0Loading,
    user,
    getAccessTokenSilently,
  } = useAuth0();
  const t = useMemo(() => {
    const base = translations.en as Record<string, string>;
    const locale = (translations as Record<string, Record<string, string>>)[language.code];
    if (!locale) return base;
    return { ...base, ...locale };
  }, [language.code]);
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
    base_currency?: string;
    telegram_chat_id?: string | null;
    show_account_balances?: boolean;
    auto_detection_enabled?: boolean;
    telegram_alerts_enabled?: boolean;
    slack_webhook_url?: string | null;
    slack_alerts_enabled?: boolean;
    has_subscription_access?: boolean;
    trial_ends_at?: string | null;
    subscription_status?: string | null;
    subscription_current_period_end?: string | null;
    subscription_cancel_at_period_end?: boolean;
    allowed_automatic_accounts?: number;
    current_automatic_accounts?: number;
    extra_automatic_accounts?: number;
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
    is_authorized_user?: boolean;
    owner_id?: number | null;
    storage_locked_for_shared_account?: boolean;
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
      provider?: string;
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
      account_source?: string; // "nordigen" | "enable_banking" | "manual" – which API the connection uses
      alert_above_amount?: number | null;
      alert_below_amount?: number | null;
      current_balance?: number | null;
      balance_currency?: string | null;
      balance_updated_at?: string | null;
    }[]
  >([]);
  const [balancesRefreshing, setBalancesRefreshing] = useState(false);
  const [transactionsRefreshing, setTransactionsRefreshing] = useState(false);
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
    base_currency: "EUR",
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
  type ProfileTabId = "user" | "channels" | "alerts" | "storage" | "tokens" | "subscription";
  const [profileTab, setProfileTab] = useState<ProfileTabId>("user");
  const profileTabFromUrlRef = useRef<ProfileTabId | null>(null);
  const [wizardDismissed, setWizardDismissed] = useState(false);
  const ONBOARDING_WIZARD_STEP_ORDER: OnboardingStepId[] = ["country", "channels", "alerts", "storage", "categories", "tags", "account"];
  const [onboardingWizardCompletedSteps, setOnboardingWizardCompletedSteps] = useState<Set<OnboardingStepId>>(() => new Set());
  const [onboardingWizardMinimized, setOnboardingWizardMinimized] = useState(false);
  const [showWizardFromProfile, setShowWizardFromProfile] = useState(false);
  const onboardingWizardStorageKeyRef = useRef<string | null>(null);
  const [settingsInitialTab, setSettingsInitialTab] = useState<"categories" | "tags" | null>(null);
  const [subscriptionCheckoutLoading, setSubscriptionCheckoutLoading] = useState(false);
  const [subscriptionPortalLoading, setSubscriptionPortalLoading] = useState(false);
  const [subscriptionRefreshLoading, setSubscriptionRefreshLoading] = useState(false);
  const [accountLimitModalOpen, setAccountLimitModalOpen] = useState(false);
  const [accountSlotLoading, setAccountSlotLoading] = useState(false);
  const [removeSlotModalOpen, setRemoveSlotModalOpen] = useState(false);
  const [removeSlotLoading, setRemoveSlotLoading] = useState(false);
  const [extraAccountPrice, setExtraAccountPrice] = useState<{ unit_amount: number; currency: string } | null>(null);
  const [subscriptionMonthlyTotal, setSubscriptionMonthlyTotal] = useState<{ unit_amount: number; currency: string } | null>(null);
  const formattedSlotPrice = extraAccountPrice
    ? new Intl.NumberFormat(language.code || "en", { style: "currency", currency: extraAccountPrice.currency, minimumFractionDigits: 2 }).format(extraAccountPrice.unit_amount / 100)
    : null;
  const formattedMonthlyTotal = subscriptionMonthlyTotal
    ? new Intl.NumberFormat(language.code || "en", { style: "currency", currency: subscriptionMonthlyTotal.currency, minimumFractionDigits: 2 }).format(subscriptionMonthlyTotal.unit_amount / 100)
    : null;
  // True when the user has more connected automatic accounts than their subscription allows.
  // Fetch and balance buttons are disabled in this state to reflect the backend gate.
  const isOverAutoLimit =
    (profile?.allowed_automatic_accounts ?? 0) > 0 &&
    (profile?.current_automatic_accounts ?? 0) > (profile?.allowed_automatic_accounts ?? 0);
  const [authorizedUsers, setAuthorizedUsers] = useState<{
    pending: { email: string; created_at: string }[];
    authorized: { user_id: number; display_name: string | null; email: string; last_login_at: string | null }[];
  } | null>(null);
  const [authorizedUsersLoading, setAuthorizedUsersLoading] = useState(false);
  const [authorizedUserRequestEmail, setAuthorizedUserRequestEmail] = useState("");
  const [authorizedUserRequestSubmitting, setAuthorizedUserRequestSubmitting] = useState(false);
  const [switchToLocalModalOpen, setSwitchToLocalModalOpen] = useState(false);
  const [switchToCloudModalOpen, setSwitchToCloudModalOpen] = useState(false);
  const [switchToCloudFileInputKey, setSwitchToCloudFileInputKey] = useState(0);
  const [localEncryptionStatus, setLocalEncryptionStatus] = useState<{ encrypted: boolean; unlocked: boolean } | null>(null);
  const [localEncryptModal, setLocalEncryptModal] = useState<"unlock" | "encrypt" | "lock" | null>(null);
  const [localEncryptPassphrase, setLocalEncryptPassphrase] = useState("");
  const [pendingAfterUnlock, setPendingAfterUnlock] = useState<{ type: "export"; format: "json" | "csv" | "ofx" } | { type: "switchToCloud" } | null>(null);
  const localEncryptPassphraseInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (localEncryptModal) {
      const id = requestAnimationFrame(() => {
        localEncryptPassphraseInputRef.current?.focus();
      });
      return () => cancelAnimationFrame(id);
    }
  }, [localEncryptModal]);
  const storageModeRef = useRef<"cloud" | "local" | undefined>(undefined);
  storageModeRef.current = profile?.storage_mode;
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
  const backupImportInputRef = useRef<HTMLInputElement>(null);
  const switchToCloudImportInputRef = useRef<HTMLInputElement>(null);
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
  const [transactionsAccountFilter, setTransactionsAccountFilter] = useState<number[]>(() => {
    try {
      const raw = window.localStorage.getItem("pf_transactions_account_filter");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const ids = parsed.map((x: unknown) => Number(x)).filter((n) => !Number.isNaN(n) && n > 0);
          if (ids.length > 0) return ids;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });
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
  const [transactionsSelectMode, setTransactionsSelectMode] = useState(false);
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<Set<number>>(new Set());
  const [transactionBulkDeleteConfirm, setTransactionBulkDeleteConfirm] = useState<{ ids: number[] } | null>(null);
  const [transactionBulkDeleteSubmitting, setTransactionBulkDeleteSubmitting] = useState(false);
  const [helpModalContext, setHelpModalContext] = useState<HelpContextId | null>(null);
  const transactionsCategoriesDropdownRef = useRef<HTMLDivElement>(null);
  const transactionsTagsDropdownRef = useRef<HTMLDivElement>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [accessDeniedFromAuth0, setAccessDeniedFromAuth0] = useState(false);
  const [pendingCancelReconnect, setPendingCancelReconnect] = useState<{
    connection_id: number;
    prev_reference: string | null;
    prev_requisition_id: string | null;
    prev_status: string | null;
    prev_access_expired: boolean | null;
  } | null>(null);
  const [pendingBankSetupCancel, setPendingBankSetupCancel] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "access_denied") {
      params.delete("error");
      params.delete("error_description");
      params.delete("state");
      const query = params.toString();
      const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
      window.history.replaceState({}, "", newUrl);

      const storedReconnect = sessionStorage.getItem("pf_reconnect_pending");
      if (storedReconnect) {
        try {
          const reconnectData = JSON.parse(storedReconnect);
          sessionStorage.removeItem("pf_reconnect_pending");
          setPendingCancelReconnect(reconnectData);
        } catch {
          setAccessDeniedFromAuth0(true);
        }
      } else if (window.localStorage.getItem("pf_bank_reference")) {
        window.localStorage.removeItem("pf_bank_reference");
        setPendingBankSetupCancel(true);
      } else {
        setAccessDeniedFromAuth0(true);
      }
      return;
    }

  }, []);

  // Detect browser Back-button after reconnect redirect.
  // useEffect([], []) does NOT run on BFCache restore — the page is returned
  // from memory as-is and the component never remounts. The `pageshow` event
  // fires on BOTH initial load AND BFCache restore, making it the correct hook.
  useEffect(() => {
    const handlePageShow = () => {
      const params = new URLSearchParams(window.location.search);
      // Skip if URL already indicates an active flow handled elsewhere.
      const hasActiveFlow =
        params.get("error") === "access_denied" ||
        params.get("reference") != null ||
        params.get("ref") != null ||
        window.location.pathname === "/callback";
      if (hasActiveFlow) return;

      const stored = sessionStorage.getItem("pf_reconnect_pending");
      if (!stored) return;
      try {
        const reconnectData = JSON.parse(stored);
        sessionStorage.removeItem("pf_reconnect_pending");
        setPendingCancelReconnect(reconnectData);
      } catch {
        sessionStorage.removeItem("pf_reconnect_pending");
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  useEffect(() => {
    if (!pendingCancelReconnect || !apiToken) return;
    const { connection_id, ...prevData } = pendingCancelReconnect;
    fetch(`${apiBase}/api/banks/connections/${connection_id}/cancel-reconnect`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(prevData),
    })
      .catch(() => {})
      .finally(() => {
        setPendingCancelReconnect(null);
        // Re-fetch accounts so the restored connection (back to "LN" status)
        // appears in the list — the initial fetch on mount ran before
        // cancel-reconnect completed, so accounts would otherwise stay hidden.
        fetch(`${apiBase}/api/accounts?_t=${Date.now()}`, {
          headers: { Authorization: `Bearer ${apiToken}` },
          cache: "no-store",
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => { if (data) setBankAccounts(data); })
          .catch(() => {})
          .finally(() => {
            setActiveSection("accounts");
            showToast(t.reconnectCancelledMessage, "warning");
          });
      });
  }, [pendingCancelReconnect, apiToken]);

  useEffect(() => {
    if (!pendingBankSetupCancel || auth0Loading) return;
    setPendingBankSetupCancel(false);
    if (isAuthenticated) {
      setActiveSection("accounts");
    }
    showToast(t.bankSetupCancelledMessage, "warning");
  }, [pendingBankSetupCancel, auth0Loading, isAuthenticated]);

  // When returning from Stripe checkout (?subscription=success or ?subscription=cancel), open profile on subscription tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sub = params.get("subscription");
    if (sub === "success" || sub === "cancel") {
      profileTabFromUrlRef.current = "subscription";
      setActiveSection("profile");
      setProfileTab("subscription");
      if (sub === "success") {
        showToast(t.subscriptionSuccessMessage, "success");
      } else {
        showToast(t.subscriptionCancelMessage, "warning");
      }
      params.delete("subscription");
      const query = params.toString();
      const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [t.subscriptionSuccessMessage, t.subscriptionCancelMessage]);

  // When returning from Stripe billing portal (?open=profile&tab=subscription), open profile on subscription tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("open") === "profile" && params.get("tab") === "subscription") {
      profileTabFromUrlRef.current = "subscription";
      setActiveSection("profile");
      setProfileTab("subscription");
      params.delete("open");
      params.delete("tab");
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
    try {
      window.localStorage.setItem("pf_language", language.code);
    } catch {
      // ignore (e.g. private browsing)
    }
  }, [language.code]);

  const SCROLL_EDGE_THRESHOLD = 80;
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const atTop = y <= SCROLL_EDGE_THRESHOLD;
      const atBottom =
        y + window.innerHeight >=
        document.documentElement.scrollHeight - SCROLL_EDGE_THRESHOLD;
      setShowToTopButton(y > window.innerHeight * 0.5);
      setBottomBarVisible(atTop || atBottom);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    mobileMenuOpenRef.current = mobileMenuOpen;
  }, [mobileMenuOpen]);

  // On mobile: hide header when scrolling down, show when scrolling up or near top
  const MOBILE_BREAKPOINT = 768;
  const SCROLL_TOP_THRESHOLD = 80;
  const SCROLL_DELTA_THRESHOLD = 12;
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (window.innerWidth >= MOBILE_BREAKPOINT) {
        setMobileHeaderVisible(true);
        lastScrollYRef.current = y;
        return;
      }
      if (mobileMenuOpenRef.current) {
        lastScrollYRef.current = y;
        return;
      }
      const delta = y - lastScrollYRef.current;
      if (y <= SCROLL_TOP_THRESHOLD) {
        setMobileHeaderVisible(true);
      } else if (delta > SCROLL_DELTA_THRESHOLD) {
        setMobileHeaderVisible(false);
      } else if (delta < -SCROLL_DELTA_THRESHOLD) {
        setMobileHeaderVisible(true);
      }
      lastScrollYRef.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const PERSISTED_SECTIONS = ["transactions", "accounts", "insights", "recurring"] as const;
  const ACTIVE_SECTION_KEY = "pf_active_section";
  const TRANSACTIONS_ACCOUNT_FILTER_KEY = "pf_transactions_account_filter";

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
    } else if (window.location.pathname === "/about") {
      setActiveSection("about");
    } else if (window.location.pathname === "/terms") {
      setActiveSection("terms");
    }
  }, []);

  useEffect(() => {
    const onPopState = () => {
      if (window.location.pathname === "/privacy") {
        setActiveSection("privacy");
      } else if (window.location.pathname === "/about") {
        setActiveSection("about");
      } else if (window.location.pathname === "/terms") {
        setActiveSection("terms");
      } else if (window.location.pathname === "/" || window.location.pathname === "") {
        setActiveSection(isAuthenticated ? "transactions" : "home");
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isAuthenticated]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Only treat explicit bank callback params (reference/ref). Do NOT use "state" here:
    // Auth0 (Google login) also redirects with ?code=...&state=... and we must not consume that.
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
    // Redirect ?section=privacy/about/terms to their canonical URLs
    if (section === "privacy") {
      setActiveSection("privacy");
      window.history.replaceState({}, "", "/privacy");
      return;
    }
    if (section === "about") {
      setActiveSection("about");
      window.history.replaceState({}, "", "/about");
      return;
    }
    if (section === "terms") {
      setActiveSection("terms");
      window.history.replaceState({}, "", "/terms");
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

  const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
  const inactivityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!isAuthenticated) return;
    const scheduleLogout = () => {
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = setTimeout(() => {
        inactivityTimeoutRef.current = null;
        handleLogout();
      }, INACTIVITY_TIMEOUT_MS);
    };
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((ev) => window.addEventListener(ev, scheduleLogout));
    scheduleLogout();
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, scheduleLogout));
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = null;
      }
    };
  }, [isAuthenticated, handleLogout]);

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
        const data = await response.json();
        setBankAccounts(data);
      }
    } catch {
      setBankAccounts([]);
    }
  }, [apiBase, apiToken]);

  const [bankCallbackStatus, setBankCallbackStatus] = useState<"waiting" | "completing" | "done" | "session_lost" | null>(null);
  const bankCallbackDoneRef = useRef(false);
  /** True while we are completing a bank link from sessionStorage (pending flow). Used so [loadAccounts] effect does not overwrite with stale count. */
  const bankCallbackInProgressRef = useRef(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stateFromUrl = params.get("state");
    const codeFromUrl = params.get("code");
    const storedRef = window.localStorage.getItem("pf_bank_reference");
    const isBankCallback =
      window.location.pathname === "/callback" &&
      stateFromUrl != null &&
      codeFromUrl != null &&
      (storedRef === stateFromUrl || storedRef != null);
    if (!isBankCallback || bankCallbackDoneRef.current) {
      if (!isBankCallback) setBankCallbackStatus(null);
      return;
    }
    if (auth0Loading) {
      setBankCallbackStatus("waiting");
      return;
    }
    if (!isAuthenticated) {
      setBankCallbackStatus("waiting");
      // Give Auth0 time to restore session after redirect from bank (e.g. Enable Banking).
      const timeout = setTimeout(() => {
        const p = new URLSearchParams(window.location.search);
        const s = p.get("state");
        const c = p.get("code");
        if (!s || !c) return;
        try {
          sessionStorage.setItem("pf_bank_callback_pending", JSON.stringify({ state: s, code: c }));
        } catch {
          // ignore
        }
        setBankCallbackStatus("session_lost");
        p.delete("state");
        p.delete("code");
        window.history.replaceState({}, "", window.location.pathname + (p.toString() ? `?${p}` : ""));
        window.localStorage.removeItem("pf_bank_reference");
      }, 20000);
      return () => clearTimeout(timeout);
    }
    setBankCallbackStatus("completing");
    bankCallbackDoneRef.current = true;
    (async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
        });
        const completeRes = await fetch(
          `${apiBase}/api/banks/requisition/complete?reference=${encodeURIComponent(stateFromUrl!)}`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ code: codeFromUrl }),
          }
        );
        if (completeRes.ok) {
          window.localStorage.removeItem("pf_bank_reference");
          sessionStorage.removeItem("pf_reconnect_pending");
          params.delete("state");
          params.delete("code");
          window.history.replaceState({}, "", window.location.pathname + (params.toString() ? `?${params}` : ""));
          const accountsRes = await fetch(`${apiBase}/api/accounts?_t=${Date.now()}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          });
          if (accountsRes.ok) {
            const accountsData = await accountsRes.json();
            setBankAccounts(accountsData);
          }
          setActiveSection("accounts");
          [1000, 3000, 6000].forEach((delayMs) => {
            setTimeout(async () => {
              try {
                const t2 = await getAccessTokenSilently({
                  authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
                });
                const r = await fetch(`${apiBase}/api/accounts?_t=${Date.now()}`, {
                  headers: { Authorization: `Bearer ${t2}` },
                  cache: "no-store",
                });
                if (r.ok) {
                  const refetchData = await r.json();
                  setBankAccounts(refetchData);
                }
              } catch {
                // ignore
              }
            }, delayMs);
          });
        } else {
          showToast(t.bankLinkCompleteError ?? "The bank link could not be completed. Please try linking the account again.", "error");
        }
        setBankCallbackStatus(null);
      } catch (err) {
        console.error("[BankLink] callback: error", err);
        showToast(t.bankLinkCompleteError ?? "The bank link could not be completed. Please try linking the account again.", "error");
        setBankCallbackStatus(null);
      }
    })();
  }, [apiBase, auth0Loading, isAuthenticated, getAccessTokenSilently, showToast, t.bankLinkCompleteError]);

  // After login from "session_lost": complete bank link using params we stored before clearing URL.
  useEffect(() => {
    if (auth0Loading || !isAuthenticated || bankCallbackDoneRef.current) return;
    let pending: { state: string; code: string } | null = null;
    try {
      const raw = sessionStorage.getItem("pf_bank_callback_pending");
      if (!raw) return;
      pending = JSON.parse(raw) as { state: string; code: string };
      if (!pending?.state || !pending.code) return;
    } catch {
      return;
    }
    bankCallbackInProgressRef.current = true;
    bankCallbackDoneRef.current = true;
    setBankCallbackStatus("completing");
    (async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
        });
        const completeRes = await fetch(
          `${apiBase}/api/banks/requisition/complete?reference=${encodeURIComponent(pending!.state)}`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ code: pending!.code }),
          }
        );
        if (completeRes.ok) {
          window.localStorage.removeItem("pf_bank_reference");
          sessionStorage.removeItem("pf_reconnect_pending");
          const accountsRes = await fetch(`${apiBase}/api/accounts?_t=${Date.now()}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          });
          if (accountsRes.ok) {
            const accountsData = await accountsRes.json();
            setBankAccounts(accountsData);
          }
          setActiveSection("accounts");
          [1000, 3000, 6000].forEach((delayMs) => {
            setTimeout(async () => {
              try {
                const t2 = await getAccessTokenSilently({
                  authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
                });
                const r = await fetch(`${apiBase}/api/accounts?_t=${Date.now()}`, {
                  headers: { Authorization: `Bearer ${t2}` },
                  cache: "no-store",
                });
                if (r.ok) {
                  const refetchData = await r.json();
                  setBankAccounts(refetchData);
                }
              } catch {
                // ignore
              }
            }, delayMs);
          });
        } else {
          showToast(t.bankLinkCompleteError ?? "The bank link could not be completed. Please try linking the account again.", "error");
        }
      } catch (err) {
        console.error("[BankLink] pending: error", err);
        showToast(t.bankLinkCompleteError ?? "The bank link could not be completed. Please try linking the account again.", "error");
        loadAccounts(); // On failure, refresh list since we skipped the initial load while pending
      } finally {
        setBankCallbackStatus(null);
        sessionStorage.removeItem("pf_bank_callback_pending");
        // Clear ref after delay so [loadAccounts] effect (which may run when apiToken is set late) still skips and does not overwrite with stale 3.
        const clearRefDelayMs = 5000;
        setTimeout(() => {
          bankCallbackInProgressRef.current = false;
        }, clearRefDelayMs);
      }
    })();
  }, [apiBase, auth0Loading, isAuthenticated, getAccessTokenSilently, loadAccounts, showToast, t.bankLinkCompleteError]);

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
    if (profile == null) return;
    const isLocal = profile.storage_mode === "local";
    if (isLocal) {
      try {
        const all = await localTransactionsGetAll();
        const sorted = [...all].sort((a, b) => {
          const da = a.posting_date || a.booking_date || "";
          const db = b.posting_date || b.booking_date || "";
          return db.localeCompare(da);
        });
        const recent = sorted.slice(0, 5).map((t) => ({
          ...t,
          id: t.id || Math.abs((t.local_id || "").split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0)),
        }));
        setTransactionsRecent(recent);
      } catch {
        setTransactionsRecent([]);
      }
      return;
    }
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
        if (storageModeRef.current === "local") return;
        setTransactionsRecent(Array.isArray(data) ? data : data.items ?? []);
      }
    } catch {
      if (storageModeRef.current === "local") return;
      setTransactionsRecent([]);
    }
  }, [apiBase, apiToken, profile?.storage_mode]);

  const loadAllTransactions = useCallback(async () => {
    if (profile == null) return;
    const isLocal = profile.storage_mode === "local";
    if (isLocal) {
      if (bankAccounts.length > 0 && transactionsAccountFilter.length === 0) {
        setTransactionsAll([]);
        setTransactionsTotal(0);
        return;
      }
      try {
        let list = await localTransactionsGetAll();
        if (transactionsAccountFilter.length > 0) {
          list = list.filter((t) => transactionsAccountFilter.includes(t.bank_account_id));
        }
        if (transactionsSearch?.trim()) {
          const q = transactionsSearch.trim().toLowerCase();
          list = list.filter(
            (t) =>
              (t.description ?? "").toLowerCase().includes(q) ||
              (t.institution_name ?? "").toLowerCase().includes(q) ||
              (t.account_name ?? "").toLowerCase().includes(q) ||
              (t.account_friendly_name ?? "").toLowerCase().includes(q)
          );
        }
        if (transactionsCategoryIds !== null && transactionsCategoryIds.length > 0) {
          const set = new Set(transactionsCategoryIds);
          list = list.filter(
            (t) =>
              (t.category_id != null && set.has(t.category_id)) ||
              (transactionsIncludeUncategorized && t.category_id == null)
          );
        } else if (transactionsCategoryIds !== null && !transactionsIncludeUncategorized) {
          list = list.filter((t) => t.category_id == null);
        }
        if (transactionsTagIds !== null && transactionsTagIds.length > 0) {
          const set = new Set(transactionsTagIds);
          list = list.filter((t) => {
            const txTags = t.tags ?? [];
            const hasMatch = txTags.some((tag) => set.has(tag.id));
            return hasMatch || (transactionsIncludeUntagged && txTags.length === 0);
          });
        } else if (transactionsTagIds !== null && !transactionsIncludeUntagged && tags.length > 0) {
          const set = new Set(tags.map((tag) => tag.id));
          list = list.filter((t) => (t.tags ?? []).some((tag) => set.has(tag.id)));
        }
        if (transactionsNewOnly) list = list.filter((t) => t.is_new === true);
        list.sort((a, b) => {
          const da = a.posting_date || a.booking_date || "";
          const db = b.posting_date || b.booking_date || "";
          return db.localeCompare(da);
        });
        const total = list.length;
        const page = list.slice(
          transactionsPage * transactionsPageSize,
          transactionsPage * transactionsPageSize + transactionsPageSize
        );
        setTransactionsAll(
          page.map((t) => ({
            ...t,
            id: t.id || Math.abs((t.local_id || "").split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0)),
          }))
        );
        setTransactionsTotal(total);
      } catch {
        setTransactionsAll([]);
        setTransactionsTotal(0);
      }
      return;
    }
    if (!apiToken) {
      setTransactionsAll([]);
      setTransactionsTotal(0);
      return;
    }
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
        if (storageModeRef.current === "local") return;
        if (Array.isArray(data)) {
          setTransactionsAll(data);
          setTransactionsTotal(data.length);
        } else {
          setTransactionsAll(data.items ?? []);
          setTransactionsTotal(data.total ?? 0);
        }
      }
    } catch {
      if (storageModeRef.current === "local") return;
      setTransactionsAll([]);
      setTransactionsTotal(0);
    }
  }, [
    apiBase,
    apiToken,
    profile?.storage_mode,
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
        return;
      }
      if (balanceRes.ok) {
        const data = await balanceRes.json().catch(() => ({}));
        await loadAccounts();
        if (data.rate_limit_hit) {
          showToast(t.refreshBalancesPartialRateLimit, "warning");
        }
      }
    } catch {
      // ignore
    } finally {
      setBalancesRefreshing(false);
    }
  }, [apiBase, apiToken, loadAccounts, t.gocardlessRateLimitExceeded, t.refreshBalancesPartialRateLimit, showToast]);

  const refreshAllTransactions = useCallback(async () => {
    if (!apiToken) return;
    setTransactionsRefreshing(true);
    const headers = { Authorization: `Bearer ${apiToken}` };
    try {
      const connectionIds = [
        ...new Set(
          bankAccounts
            .map((a) => a.bank_connection_id)
            .filter((id): id is number => id != null)
        ),
      ];
      if (connectionIds.length === 0) {
        setTransactionsRefreshing(false);
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
        setTransactionsRefreshing(false);
        return;
      }

      let intervalId: ReturnType<typeof setInterval> | null = null;
      let rateLimitMessage: string | null = null;
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
              if (data.status === "rate_limited") {
                hadRateLimit = true;
                if (data.result?.message) rateLimitMessage = data.result.message;
              }
            } else {
              anyPending = true;
            }
          })
        );
        if (!anyPending || pending.size === 0) {
          if (intervalId) clearInterval(intervalId);
          if (hadRateLimit) showToast(rateLimitMessage || t.gocardlessRateLimitExceeded, "warning");
          else if (hadFailure) showToast(t.fetchFailed, "error");
          else showToast(t.fetchCompleted, "success");
          if (profile?.storage_mode === "local") {
            for (const connectionId of started) {
              try {
                const res = await fetch(
                  `${apiBase}/api/banks/connections/${connectionId}/transactions/fetch-result`,
                  { headers }
                );
                if (res.ok) {
                  const data = await res.json();
                  if (Array.isArray(data.transactions) && data.transactions.length > 0) {
                    await localTransactionsMergeFromFetch(data.transactions);
                  }
                }
              } catch {
                // ignore per-connection errors
              }
            }
          }
          await loadAccounts();
          loadRecentTransactions();
          if (activeSection === "transactions") loadAllTransactions();
          setTransactionsRefreshing(false);
        }
      };
      intervalId = setInterval(poll, 2500);
      poll();
    } catch {
      setTransactionsRefreshing(false);
    }
  }, [
    apiBase,
    apiToken,
    profile?.storage_mode,
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
    // Skip so we don't overwrite bank accounts while pending bank callback is completing (see BANK_LINK_FLOW_ANALYSIS.md). Use ref so we skip regardless of when apiToken/loadProfile completes.
    if (bankCallbackInProgressRef.current) return;
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

  const loadAuthorizedUsers = useCallback(() => {
    if (!apiToken || !apiBase || !profile || profile.is_authorized_user) return;
    setAuthorizedUsersLoading(true);
    fetch(`${apiBase}/api/me/authorized-users`, { headers: { Authorization: `Bearer ${apiToken}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setAuthorizedUsers({ pending: data.pending || [], authorized: data.authorized || [] });
        else setAuthorizedUsers(null);
      })
      .catch(() => setAuthorizedUsers(null))
      .finally(() => setAuthorizedUsersLoading(false));
  }, [apiBase, apiToken, profile?.id, profile?.is_authorized_user]);

  useEffect(() => {
    if (activeSection === "profile" && profileTab === "user" && profile && !profile.is_authorized_user) loadAuthorizedUsers();
  }, [activeSection, profileTab, profile?.id, profile?.is_authorized_user, loadAuthorizedUsers]);

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
    if (!transactionBulkDeleteConfirm) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Esc") {
        if (!transactionBulkDeleteSubmitting) setTransactionBulkDeleteConfirm(null);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [transactionBulkDeleteConfirm, transactionBulkDeleteSubmitting]);

  useEffect(() => {
    if (!helpModalContext) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHelpModalContext(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [helpModalContext]);

  useEffect(() => {
    if (!accountLimitModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAccountLimitModalOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [accountLimitModalOpen]);

  useEffect(() => {
    if (!removeSlotModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRemoveSlotModalOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [removeSlotModalOpen]);

  useEffect(() => {
    if (!createAlertModal.open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Esc")
        setCreateAlertModal((prev) => ({ ...prev, open: false, txId: 0 }));
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [createAlertModal.open]);

  useEffect(() => {
    const shouldFetch = (accountLimitModalOpen || removeSlotModalOpen || profileTab === "subscription") && extraAccountPrice === null && !!apiToken && !!apiBase;
    if (!shouldFetch) return;
    fetch(`${apiBase}/api/me/subscription/account-slot-price`, {
      headers: { Authorization: `Bearer ${apiToken}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.unit_amount != null) setExtraAccountPrice(data); })
      .catch(() => {});
  }, [accountLimitModalOpen, removeSlotModalOpen, profileTab, extraAccountPrice, apiToken, apiBase]);

  useEffect(() => {
    if (profile?.subscription_monthly_total_cents != null && profile.subscription_monthly_total_currency) {
      setSubscriptionMonthlyTotal({
        unit_amount: profile.subscription_monthly_total_cents,
        currency: profile.subscription_monthly_total_currency,
      });
    }
  }, [profile?.subscription_monthly_total_cents, profile?.subscription_monthly_total_currency]);

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
    const accountIds = bankAccounts.map((a) => a.id);
    setTransactionsAccountFilter((prev) => {
      if (prev.length === 0) {
        try {
          const raw = window.localStorage.getItem(TRANSACTIONS_ACCOUNT_FILTER_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const stored = parsed.map((x: unknown) => Number(x)).filter((n) => !Number.isNaN(n) && n > 0);
              if (stored.length === 0) return []; // user had all unchecked; keep empty so no transactions shown
              const next = stored.filter((id) => accountIds.includes(id));
              accountIds.forEach((id) => {
                if (!next.includes(id)) next.push(id);
              });
              return next;
            }
          }
        } catch {
          // ignore
        }
        return [...accountIds];
      }
      return prev.filter((id) => accountIds.includes(id));
    });
  }, [bankAccounts]);

  // Persist transactions account filter to localStorage so it survives page refresh
  useEffect(() => {
    try {
      window.localStorage.setItem(TRANSACTIONS_ACCOUNT_FILTER_KEY, JSON.stringify(transactionsAccountFilter));
    } catch {
      // ignore
    }
  }, [transactionsAccountFilter]);

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

  // Restore decryption key from localStorage as soon as app mounts (before profile loads), so key is ready when transactions load
  useEffect(() => {
    let cancelled = false;
    restoreLocalEncryptionFromSession().then((restored) => {
      if (cancelled) return;
      if (restored) setLocalEncryptionStatus({ encrypted: true, unlocked: true });
    });
    return () => { cancelled = true; };
  }, []);

  // When profile loads with local storage, ensure key is restored from localStorage then reload transactions
  useEffect(() => {
    if (profile?.storage_mode !== "local" || !apiToken) return;
    let cancelled = false;
    (async () => {
      const restored = await restoreLocalEncryptionFromSession();
      if (cancelled) return;
      if (restored) setLocalEncryptionStatus({ encrypted: true, unlocked: true });
      loadRecentTransactions();
      if (activeSection === "transactions") loadAllTransactions();
    })();
    return () => { cancelled = true; };
  }, [profile?.storage_mode, apiToken, activeSection, loadRecentTransactions, loadAllTransactions]);

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
      if (document.visibilityState !== "visible") return;
      loadConnections();
      loadAccounts();
      loadRecentTransactions();
      if (activeSection === "transactions") loadAllTransactions();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [loadAccounts, loadConnections, loadRecentTransactions, loadAllTransactions, activeSection]);

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
      if (switchToLocalModalOpen) {
        setSwitchToLocalModalOpen(false);
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (switchToCloudModalOpen) {
        setSwitchToCloudModalOpen(false);
        event.preventDefault();
        event.stopPropagation();
        return;
      }
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
      if (localEncryptModal) {
        setLocalEncryptModal(null);
        setLocalEncryptPassphrase("");
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    };
    document.documentElement.addEventListener("keydown", onKeyDown, true);
    return () => document.documentElement.removeEventListener("keydown", onKeyDown, true);
  }, [accountNameModal.open, accountAlertsModal.open, accountAlertsDeleteRecurringId, apiTokenCreateModal, deleteAccountModal.open, exportModal.open, switchToLocalModalOpen, switchToCloudModalOpen, localEncryptModal]);

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
    setProfileForm((prev) => {
      // While switch-to-local modal is open, keep showing "local" so export/cancel don't revert the choice
      const keepLocal =
        switchToLocalModalOpen && prev.storage_mode === "local";
      return {
        display_name: profile?.display_name ?? "",
        country: profile?.country ?? "",
        base_currency: profile?.base_currency ?? "EUR",
        telegram_chat_id: profile?.telegram_chat_id ?? "",
        show_account_balances: profile?.show_account_balances ?? true,
        auto_detection_enabled: profile?.auto_detection_enabled ?? true,
        telegram_alerts_enabled: profile?.telegram_alerts_enabled ?? true,
        slack_webhook_url: profile?.slack_webhook_url ?? "",
        slack_alerts_enabled: profile?.slack_alerts_enabled ?? false,
        weekly_emails_enabled: profile?.weekly_emails_enabled ?? true,
        storage_mode: keepLocal ? "local" : storageMode,
      };
    });
  }, [profile, switchToLocalModalOpen]);

  useEffect(() => {
    if (activeSection === "profile") {
      if (profileTabFromUrlRef.current) {
        setProfileTab(profileTabFromUrlRef.current);
        profileTabFromUrlRef.current = null;
      } else {
        setProfileTab("user");
      }
    }
  }, [activeSection]);

  const onboardingWizardUserKey = profile?.emails?.find((e) => e.is_primary)?.email ?? profile?.emails?.[0]?.email ?? null;
  useEffect(() => {
    if (!onboardingWizardUserKey) return;
    const key = `onboarding_wizard_${onboardingWizardUserKey}`;
    onboardingWizardStorageKeyRef.current = key;
    try {
      const stepsRaw = window.localStorage.getItem(`${key}_steps`);
      if (stepsRaw) {
        const arr = JSON.parse(stepsRaw) as unknown;
        if (Array.isArray(arr)) {
          setOnboardingWizardCompletedSteps(new Set(arr.filter((s): s is OnboardingStepId => ONBOARDING_WIZARD_STEP_ORDER.includes(s))));
        }
      }
      const minRaw = window.localStorage.getItem(`${key}_minimized`);
      setOnboardingWizardMinimized(minRaw === "1");
      const dismissedRaw = window.localStorage.getItem(`${key}_dismissed`);
      setWizardDismissed(dismissedRaw === "1");
    } catch {
      // ignore
    }
  }, [onboardingWizardUserKey]);
  useEffect(() => {
    const key = onboardingWizardStorageKeyRef.current;
    if (!key) return;
    try {
      window.localStorage.setItem(`${key}_steps`, JSON.stringify([...onboardingWizardCompletedSteps]));
    } catch {
      // ignore
    }
  }, [onboardingWizardCompletedSteps]);
  useEffect(() => {
    const key = onboardingWizardStorageKeyRef.current;
    if (!key) return;
    try {
      window.localStorage.setItem(`${key}_minimized`, onboardingWizardMinimized ? "1" : "0");
    } catch {
      // ignore
    }
  }, [onboardingWizardMinimized]);
  useEffect(() => {
    const key = onboardingWizardStorageKeyRef.current;
    if (!key) return;
    try {
      window.localStorage.setItem(`${key}_dismissed`, wizardDismissed ? "1" : "0");
    } catch {
      // ignore
    }
  }, [wizardDismissed]);

  const navigateToOnboardingStep = useCallback((stepId: OnboardingStepId) => {
    if (stepId === "account") {
      setActiveSection("accounts");
    } else if (stepId === "categories") {
      setSettingsInitialTab("categories");
      setActiveSection("settings");
    } else if (stepId === "tags") {
      setSettingsInitialTab("tags");
      setActiveSection("settings");
    } else {
      setActiveSection("profile");
      setProfileTab(stepId === "country" ? "user" : (stepId as ProfileTabId));
    }
  }, []);

  const handleOnboardingWizardStepNavigate = useCallback((stepIndex: number) => {
    const stepId = ONBOARDING_WIZARD_STEP_ORDER[stepIndex];
    if (stepId !== undefined) navigateToOnboardingStep(stepId);
  }, [navigateToOnboardingStep]);

  const handleOnboardingWizardStepToggle = useCallback((stepId: OnboardingStepId) => {
    setOnboardingWizardCompletedSteps((prev) => {
      const next = new Set(prev);
      const isDone = next.has(stepId);
      if (isDone) {
        next.delete(stepId);
      } else {
        next.add(stepId);
        const idx = ONBOARDING_WIZARD_STEP_ORDER.indexOf(stepId);
        const nextId = ONBOARDING_WIZARD_STEP_ORDER[idx + 1];
        if (nextId) navigateToOnboardingStep(nextId);
      }
      return next;
    });
  }, [navigateToOnboardingStep]);
  const handleOnboardingWizardDismiss = useCallback(async () => {
    setWizardDismissed(true);
    setShowWizardFromProfile(false);
    const key = onboardingWizardStorageKeyRef.current;
    if (key) {
      try {
        window.localStorage.setItem(`${key}_dismissed`, "1");
      } catch {
        // ignore
      }
    }
    if (!apiToken || !apiBase || !profile?.needs_onboarding) return;
    try {
      await fetch(`${apiBase}/api/onboarding/complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      const res = await fetch(`${apiBase}/api/me`, { headers: { Authorization: `Bearer ${apiToken}` } });
      if (res.ok) setProfile(await res.json());
    } catch {
      // keep wizard dismissed locally
    }
  }, [apiToken, apiBase, profile?.needs_onboarding]);

  useEffect(() => {
    if (profile?.storage_mode !== "local") return;
    isLocalDataEncrypted().then((encrypted) => {
      setLocalEncryptionStatus({ encrypted, unlocked: isLocalDataUnlocked() });
    });
  }, [profile?.storage_mode, profileTab, localEncryptModal]);

  useEffect(() => {
    if (profile?.storage_mode !== "local") return;
    let cancelled = false;
    (async () => {
      const restored = await restoreLocalEncryptionFromSession();
      if (cancelled) return;
      if (restored) {
        setLocalEncryptionStatus({ encrypted: true, unlocked: true });
        loadRecentTransactions();
        if (activeSection === "transactions") loadAllTransactions();
      }
    })();
    return () => { cancelled = true; };
  }, [profile?.storage_mode, loadRecentTransactions, loadAllTransactions, activeSection]);

  useEffect(() => {
    if (activeSection !== "profile" || profile?.storage_mode !== "local") return;
    let cancelled = false;
    (async () => {
      const encrypted = await isLocalDataEncrypted();
      if (cancelled) return;
      if (!encrypted) return;
      if (isLocalDataUnlocked()) return;
      const restored = await restoreLocalEncryptionFromSession();
      if (cancelled) return;
      if (restored) {
        setLocalEncryptionStatus((s) => (s ? { ...s, unlocked: true } : { encrypted: true, unlocked: true }));
        return;
      }
      setLocalEncryptModal("unlock");
    })();
    return () => { cancelled = true; };
  }, [activeSection, profile?.storage_mode]);

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

  const fetchAllCloudTransactions = useCallback(async (): Promise<LocalTransaction[]> => {
    if (!apiToken) return [];
    const limit = 500;
    let offset = 0;
    const all: LocalTransaction[] = [];
    for (;;) {
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      const res = await fetch(`${apiBase}/api/transactions?${params}`, {
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      if (!res.ok) break;
      const data = await res.json();
      const items = data.items ?? [];
      for (const tx of items) {
        all.push({
          local_id: `local_${tx.bank_account_id}_${tx.transaction_id}`,
          id: tx.id,
          bank_account_id: tx.bank_account_id,
          institution_name: tx.institution_name,
          account_name: tx.account_name,
          account_friendly_name: tx.account_friendly_name,
          transaction_id: tx.transaction_id,
          status: tx.status ?? "booked",
          amount: tx.amount,
          currency: tx.currency ?? "",
          booking_date: tx.booking_date,
          value_date: tx.value_date,
          posting_date: tx.posting_date,
          description: tx.description,
          include_in_totals: tx.include_in_totals !== false,
          category_id: tx.category_id,
          category_name: tx.category_name,
          tags: tx.tags ?? [],
          is_new: tx.is_new !== false,
          comment: tx.comment,
          has_alert: tx.has_alert === true,
        });
      }
      if (items.length < limit) break;
      offset += limit;
    }
    return all;
  }, [apiBase, apiToken]);

  const doProfilePatch = useCallback(async () => {
    if (!apiToken) return false;
    const response = await fetch(`${apiBase}/api/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        display_name: profileForm.display_name || null,
        country: profileForm.country || null,
        base_currency: profileForm.base_currency || "EUR",
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
      if (data.slack_webhook_url === undefined && (profileForm.slack_webhook_url?.trim() ?? "")) {
        data.slack_webhook_url = profileForm.slack_webhook_url.trim();
      }
      setProfile(data);
      showToast(t.profileSaved, "success");
      return true;
    }
    showToast(t.profileSaveError, "error");
    return false;
  }, [apiBase, apiToken, profileForm, t.profileSaved, t.profileSaveError, showToast]);

  const handleProfileSave = async () => {
    if (!apiToken) return;
    const switchingToLocal = profile?.storage_mode === "cloud" && profileForm.storage_mode === "local";
    const switchingToCloud = profile?.storage_mode === "local" && profileForm.storage_mode === "cloud";

    if (switchingToLocal) {
      try {
        const cloudTransactions = await fetchAllCloudTransactions();
        await localTransactionsClear();
        if (cloudTransactions.length > 0) {
          await localTransactionsMergeFromFetch(cloudTransactions);
        }
        setSwitchToLocalModalOpen(true);
      } catch (e) {
        showToast("Could not copy cloud data to this device.", "error");
      }
      return;
    }

    if (switchingToCloud) {
      if (localEncryptionStatus?.encrypted && !localEncryptionStatus?.unlocked) {
        setPendingAfterUnlock({ type: "switchToCloud" });
        setLocalEncryptModal("unlock");
        return;
      }
      const localList = await localTransactionsGetAll();
      if (localList.length === 0) {
        setSwitchToCloudModalOpen(true);
        return;
      }
      try {
        const importPayload = localList.map((t) => ({
          bank_account_id: t.bank_account_id,
          transaction_id: t.transaction_id,
          amount: t.amount,
          currency: t.currency ?? "",
          booking_date: t.booking_date ?? null,
          value_date: t.value_date ?? null,
          posting_date: t.posting_date ?? null,
          description: t.description ?? null,
          status: t.status ?? "booked",
          include_in_totals: t.include_in_totals !== false,
          category_id: t.category_id ?? null,
          tag_ids: (t.tags ?? []).map((tag) => tag.id),
          is_new: t.is_new !== false,
          comment: t.comment ?? null,
        }));
        const importRes = await fetch(`${apiBase}/api/transactions/import`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ transactions: importPayload }),
        });
        if (importRes.ok) {
          const data = await importRes.json();
          showToast(
            data.imported != null ? `${data.imported} transactions uploaded to cloud` : "Data uploaded",
            "success"
          );
        } else if (importRes.status === 403) {
          setActiveSection("profile");
          setProfileTab("subscription");
          showToast(t.subscriptionNoAccess, "error");
        }
      } catch {
        showToast("Could not upload local data; you can import the JSON file later after switching.", "warning");
      }
      const ok = await doProfilePatch();
      if (ok) {
        loadRecentTransactions();
        if (activeSection === "transactions") loadAllTransactions();
      }
      return;
    }

    await doProfilePatch();
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

  const handleBulkDeleteTransactions = async () => {
    if (!apiToken || !transactionBulkDeleteConfirm) return;
    const ids = transactionBulkDeleteConfirm.ids;
    setTransactionBulkDeleteSubmitting(true);
    let failed = false;
    try {
      for (const id of ids) {
        const response = await fetch(`${apiBase}/api/transactions/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${apiToken}` },
        });
        if (!response.ok) failed = true;
      }
    } finally {
      setTransactionBulkDeleteSubmitting(false);
      setTransactionBulkDeleteConfirm(null);
      setSelectedTransactionIds(new Set());
      setTransactionsSelectMode(false);
    }
    if (failed) showToast(t.transactionUpdateError, "error");
    loadAllTransactions();
    loadRecentTransactions();
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
        try {
          sessionStorage.setItem(
            "pf_reconnect_pending",
            JSON.stringify({
              connection_id: data.connection_id ?? connectionId,
              prev_reference: data.prev_reference ?? null,
              prev_requisition_id: data.prev_requisition_id ?? null,
              prev_status: data.prev_status ?? null,
              prev_access_expired: data.prev_access_expired ?? null,
            })
          );
        } catch {
          // ignore
        }
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
          showToast(data.result?.message || t.gocardlessRateLimitExceeded, "warning");
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

  if (bankCallbackStatus === "waiting" || bankCallbackStatus === "completing") {
    return (
      <div className="min-h-screen min-w-0 flex flex-col items-center justify-center bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
        <p className="text-lg text-slate-600 dark:text-slate-300">{t.onboardingCompleting ?? "Completing bank connection..."}</p>
      </div>
    );
  }
  if (bankCallbackStatus === "session_lost") {
    return (
      <div className="min-h-screen min-w-0 flex flex-col items-center justify-center gap-4 bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
        <p className="text-lg text-slate-600 dark:text-slate-300">
          {t.sessionExpiredBankCallback ?? "Session expired. Please log in again to see your linked account."}
        </p>
        <button
          type="button"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          onClick={() => loginWithRedirect()}
        >
          {t.menuLogin ?? "Log in"}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <a href="#main" className="skip-to-main">
        {t.skipToMain}
      </a>
      <header
        className={`fixed top-0 z-50 w-full border-b border-slate-200 bg-slate-50/90 backdrop-blur transition-transform duration-300 ease-out dark:border-slate-800 dark:bg-slate-900/90 ${mobileHeaderVisible ? "translate-y-0" : "-translate-y-full md:translate-y-0"}`}
      >
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
              title={isAuthenticated ? t.menuProfile : t.menuLogin}
              aria-label={isAuthenticated ? t.menuProfile : t.menuLogin}
              onClick={() => {
                if (userMenuTimerRef.current) {
                  window.clearTimeout(userMenuTimerRef.current);
                  userMenuTimerRef.current = null;
                }
                setUserMenuOpen((open) => !open);
              }}
            >
              <i
                className={`fa-solid ${isAuthenticated ? "fa-user" : "fa-user-slash"}`}
                aria-hidden
                style={{ color: isAuthenticated ? "var(--primary)" : "var(--text-secondary)" }}
              />
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
                  <button
                    className="dropdown-item w-full text-left"
                    type="button"
                    onClick={() => {
                      setUserMenuLocked(true);
                      setUserMenuOpen(false);
                      setActiveSection("about");
                      window.history.pushState({}, "", "/about");
                    }}
                  >
                    {t.menuAboutUs}
                  </button>
                  <button
                    className="dropdown-item w-full text-left"
                    type="button"
                    onClick={() => {
                      setUserMenuLocked(true);
                      setUserMenuOpen(false);
                      setActiveSection("terms");
                      window.history.pushState({}, "", "/terms");
                    }}
                  >
                    {t.menuTerms}
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
                          base_currency: profile.base_currency ?? "EUR",
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
                        setSettingsInitialTab(null);
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
                      onClick={() => {
                        setUserMenuLocked(true);
                        setUserMenuOpen(false);
                        setActiveSection("about");
                        window.history.pushState({}, "", "/about");
                      }}
                    >
                      {t.menuAboutUs}
                    </button>
                    <button
                      className="dropdown-item w-full text-left"
                      type="button"
                      onClick={() => {
                        setUserMenuLocked(true);
                        setUserMenuOpen(false);
                        setActiveSection("terms");
                        window.history.pushState({}, "", "/terms");
                      }}
                    >
                      {t.menuTerms}
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
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setActiveSection("about");
                    window.history.pushState({}, "", "/about");
                  }}
                  className="mobile-nav-item"
                  type="button"
                >
                  <i className="fa-solid fa-building"></i>
                  <span>{t.menuAboutUs}</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setActiveSection("terms");
                    window.history.pushState({}, "", "/terms");
                  }}
                  className="mobile-nav-item"
                  type="button"
                >
                  <i className="fa-solid fa-file-contract"></i>
                  <span>{t.menuTerms}</span>
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
                    setSettingsInitialTab(null);
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
                    setActiveSection("about");
                    window.history.pushState({}, "", "/about");
                  }}
                  className="mobile-nav-item"
                  type="button"
                >
                  <i className="fa-solid fa-building"></i>
                  <span>{t.menuAboutUs}</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setActiveSection("terms");
                    window.history.pushState({}, "", "/terms");
                  }}
                  className="mobile-nav-item"
                  type="button"
                >
                  <i className="fa-solid fa-file-contract"></i>
                  <span>{t.menuTerms}</span>
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
      {switchToLocalModalOpen ? (
        <div
          className="modal-overlay"
          onClick={() => setSwitchToLocalModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="switch-to-local-title"
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "28rem" }}
          >
            <div className="flex items-start justify-between gap-2">
              <h2 id="switch-to-local-title" className="text-lg font-semibold" style={{ color: "var(--text)" }}>
                <i className="fa-solid fa-database me-2" aria-hidden style={{ color: "var(--text-secondary)" }} />
                {t.profileSwitchToLocalTitle}
              </h2>
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded border border-solid transition-colors min-w-[2.25rem]"
                style={{ borderWidth: 1, background: "var(--surface-hover)", borderColor: "var(--border)", color: "var(--text)" }}
                title={t.modalCancel}
                aria-label={t.modalCancel}
                onClick={() => setSwitchToLocalModalOpen(false)}
              >
                <i className="fa-solid fa-times" aria-hidden />
              </button>
            </div>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              {t.profileSwitchToLocalCopied}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded border border-solid transition-colors min-w-[2.25rem]"
                style={{ borderWidth: 1, borderColor: "var(--border)", background: "var(--surface-hover)", color: "var(--text)" }}
                title={t.profileDownloadJson}
                aria-label={t.profileDownloadJson}
                onClick={async () => {
                  try {
                    const json = await localTransactionsExportJSON();
                    downloadBlob(new Blob([json], { type: "application/json" }), `eurodata-backup-${new Date().toISOString().slice(0, 10)}.json`);
                    showToast(t.profileDownloadJson, "success");
                  } catch {
                    showToast("Export failed", "error");
                  }
                }}
              >
                <i className="fa-solid fa-file-code" aria-hidden />
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded border border-solid transition-colors min-w-[2.25rem]"
                style={{ borderWidth: 1, borderColor: "var(--border)", background: "var(--surface-hover)", color: "var(--text)" }}
                title={t.profileDownloadCsv}
                aria-label={t.profileDownloadCsv}
                onClick={async () => {
                  try {
                    const csv = await localTransactionsExportCSV();
                    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `eurodata-backup-${new Date().toISOString().slice(0, 10)}.csv`);
                    showToast(t.profileDownloadCsv, "success");
                  } catch {
                    showToast("Export failed", "error");
                  }
                }}
              >
                <i className="fa-solid fa-file-csv" aria-hidden />
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded border border-solid transition-colors min-w-[2.25rem]"
                style={{ borderWidth: 1, borderColor: "var(--border)", background: "var(--surface-hover)", color: "var(--text)" }}
                title={t.profileDownloadOfx}
                aria-label={t.profileDownloadOfx}
                onClick={async () => {
                  try {
                    const ofx = await localTransactionsExportOFX();
                    downloadBlob(new Blob([ofx], { type: "application/x-ofx" }), `eurodata-backup-${new Date().toISOString().slice(0, 10)}.ofx`);
                    showToast(t.profileDownloadOfx, "success");
                  } catch {
                    showToast("Export failed", "error");
                  }
                }}
              >
                <i className="fa-solid fa-file-invoice" aria-hidden />
              </button>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded border border-solid transition-colors min-w-[2.25rem]"
                style={{ borderWidth: 1, borderColor: "var(--border)", background: "var(--surface-hover)", color: "var(--text)" }}
                title={t.modalCancel}
                aria-label={t.modalCancel}
                onClick={() => setSwitchToLocalModalOpen(false)}
              >
                <i className="fa-solid fa-times" aria-hidden />
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded border border-solid transition-colors min-w-[2.25rem]"
                style={{ borderWidth: 1, borderColor: "var(--primary)", background: "var(--primary)", color: "white" }}
                title={t.profileSwitchToLocalConfirm}
                aria-label={t.profileSwitchToLocalConfirm}
                onClick={async () => {
                  if (!apiToken) return;
                  try {
                    await fetch(`${apiBase}/api/transactions`, { method: "DELETE", headers: { Authorization: `Bearer ${apiToken}` } });
                    const ok = await doProfilePatch();
                    if (ok) {
                      setSwitchToLocalModalOpen(false);
                      loadRecentTransactions();
                      if (activeSection === "transactions") loadAllTransactions();
                    }
                  } catch {
                    showToast(t.profileSaveError, "error");
                  }
                }}
              >
                <i className="fa-solid fa-check" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {switchToCloudModalOpen ? (
        <div
          className="modal-overlay"
          onClick={() => setSwitchToCloudModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="switch-to-cloud-title"
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "28rem" }}
          >
            <div className="flex items-start justify-between gap-2">
              <h2 id="switch-to-cloud-title" className="text-lg font-semibold" style={{ color: "var(--text)" }}>
                <i className="fa-solid fa-cloud me-2" aria-hidden style={{ color: "var(--text-secondary)" }} />
                {t.profileSwitchToCloudTitle}
              </h2>
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded border border-solid transition-colors min-w-[2.25rem]"
                style={{ borderWidth: 1, background: "var(--surface-hover)", borderColor: "var(--border)", color: "var(--text)" }}
                title={t.modalCancel}
                aria-label={t.modalCancel}
                onClick={() => setSwitchToCloudModalOpen(false)}
              >
                <i className="fa-solid fa-times" aria-hidden />
              </button>
            </div>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              {t.profileSwitchToCloudNoData}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{t.profileImportData}</span>
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded border border-solid transition-colors min-w-[2.25rem]"
                style={{ borderWidth: 1, borderColor: "var(--border)", background: "var(--surface-hover)", color: "var(--text)" }}
                title={t.profileImportData}
                aria-label={t.profileImportData}
                onClick={() => switchToCloudImportInputRef.current?.click()}
              >
                <i className="fa-solid fa-file-import" aria-hidden />
              </button>
            </div>
            <input
              ref={switchToCloudImportInputRef}
              key={switchToCloudFileInputKey}
              type="file"
              accept=".json,.csv,.ofx,application/json,text/csv,application/x-ofx"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const name = (file.name || "").toLowerCase();
                const isCsv = name.endsWith(".csv");
                const isOfx = name.endsWith(".ofx");
                try {
                  const text = await file.text();
                  if (isCsv) {
                    const { imported } = await localTransactionsImportFromCSV(text);
                    if (imported === 0) {
                      e.target.value = "";
                      return;
                    }
                  } else if (isOfx) {
                    const { imported } = await localTransactionsImportFromOFX(text);
                    if (imported === 0) {
                      e.target.value = "";
                      return;
                    }
                  } else {
                    await localTransactionsImportFromJSON(text);
                  }
                  const localList = await localTransactionsGetAll();
                  if (localList.length > 0) {
                    const importPayload = localList.map((t) => ({
                      bank_account_id: t.bank_account_id,
                      transaction_id: t.transaction_id,
                      amount: t.amount,
                      currency: t.currency ?? "",
                      booking_date: t.booking_date ?? null,
                      value_date: t.value_date ?? null,
                      posting_date: t.posting_date ?? null,
                      description: t.description ?? null,
                      status: t.status ?? "booked",
                      include_in_totals: t.include_in_totals !== false,
                      category_id: t.category_id ?? null,
                      tag_ids: (t.tags ?? []).map((tag) => tag.id),
                      is_new: t.is_new !== false,
                      comment: t.comment ?? null,
                    }));
                    const importRes = await fetch(`${apiBase}/api/transactions/import`, {
                      method: "POST",
                      headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" },
                      body: JSON.stringify({ transactions: importPayload }),
                    });
                    if (importRes.ok) {
                      const data = await importRes.json();
                      showToast(data.imported != null ? `${data.imported} transactions uploaded` : "Data uploaded", "success");
                    } else if (importRes.status === 403) {
                      setActiveSection("profile");
                      setProfileTab("subscription");
                      showToast(t.subscriptionNoAccess, "error");
                    }
                  }
                  const ok = await doProfilePatch();
                  if (ok) {
                    setSwitchToCloudModalOpen(false);
                    setSwitchToCloudFileInputKey((k) => k + 1);
                    loadRecentTransactions();
                    if (activeSection === "transactions") loadAllTransactions();
                  }
                } catch {
                  showToast("Import failed", "error");
                }
                e.target.value = "";
              }}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded border border-solid transition-colors min-w-[2.25rem]"
                style={{ borderWidth: 1, borderColor: "var(--border)", background: "var(--surface-hover)", color: "var(--text)" }}
                title={t.modalCancel}
                aria-label={t.modalCancel}
                onClick={() => setSwitchToCloudModalOpen(false)}
              >
                <i className="fa-solid fa-times" aria-hidden />
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded border border-solid transition-colors min-w-[2.25rem]"
                style={{ borderWidth: 1, borderColor: "var(--primary)", background: "var(--primary)", color: "white" }}
                title={t.profileSwitchToCloudWithoutData}
                aria-label={t.profileSwitchToCloudWithoutData}
                onClick={async () => {
                  const ok = await doProfilePatch();
                  if (ok) setSwitchToCloudModalOpen(false);
                }}
              >
                <i className="fa-solid fa-check" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {localEncryptModal ? (
        <div
          className="modal-overlay"
          onClick={() => { setPendingAfterUnlock(null); setLocalEncryptModal(null); setLocalEncryptPassphrase(""); }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="local-encrypt-modal-title"
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "28rem" }}>
            <div className="flex items-start justify-between gap-2">
              <h2 id="local-encrypt-modal-title" className="text-lg font-semibold" style={{ color: "var(--text)" }}>
                <i className={`fa-solid ${localEncryptModal === "unlock" ? "fa-key" : "fa-lock"} me-2`} aria-hidden style={{ color: "var(--text-secondary)" }} />
                {localEncryptModal === "unlock" ? t.profileLocalUnlock : localEncryptModal === "lock" ? t.profileLocalLock : t.profileLocalEncrypt}
              </h2>
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded border border-solid transition-colors min-w-[2.25rem]"
                style={{ borderWidth: 1, background: "var(--surface-hover)", borderColor: "var(--border)", color: "var(--text)" }}
                title={t.modalCancel}
                aria-label={t.modalCancel}
                onClick={() => { setPendingAfterUnlock(null); setLocalEncryptModal(null); setLocalEncryptPassphrase(""); }}
              >
                <i className="fa-solid fa-times" aria-hidden />
              </button>
            </div>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              {localEncryptModal === "unlock" ? t.profileLocalUnlockHelp : localEncryptModal === "lock" ? t.profileLocalLockConfirmHelp : t.profileLocalEncryptHelp}
            </p>
            <form
              className="mt-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const pass = localEncryptPassphrase.trim();
                if (!pass) return;
                if (localEncryptModal === "unlock") {
                  const ok = await setLocalEncryptionKey(pass);
                  if (ok) {
                    setLocalEncryptionStatus((s) => (s ? { ...s, unlocked: true } : null));
                    loadRecentTransactions();
                    if (activeSection === "transactions") loadAllTransactions();
                    const pending = pendingAfterUnlock;
                    setPendingAfterUnlock(null);
                    if (pending?.type === "export") {
                      try {
                        const date = new Date().toISOString().slice(0, 10);
                        if (pending.format === "json") {
                          const json = await localTransactionsExportJSON();
                          downloadBlob(new Blob([json], { type: "application/json" }), `eurodata-transactions-${date}.json`);
                          showToast(t.profileDownloadJson, "success");
                        } else if (pending.format === "csv") {
                          const csv = await localTransactionsExportCSV();
                          downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `eurodata-transactions-${date}.csv`);
                          showToast(t.profileDownloadCsv, "success");
                        } else {
                          const ofx = await localTransactionsExportOFX();
                          downloadBlob(new Blob([ofx], { type: "application/x-ofx" }), `eurodata-transactions-${date}.ofx`);
                          showToast(t.profileDownloadOfx, "success");
                        }
                      } catch {
                        showToast("Export failed", "error");
                      }
                    } else if (pending?.type === "switchToCloud") {
                      const localList = await localTransactionsGetAll();
                      if (localList.length === 0) {
                        setSwitchToCloudModalOpen(true);
                      } else {
                        try {
                          const importPayload = localList.map((t) => ({
                            bank_account_id: t.bank_account_id,
                            transaction_id: t.transaction_id,
                            amount: t.amount,
                            currency: t.currency ?? "",
                            booking_date: t.booking_date ?? null,
                            value_date: t.value_date ?? null,
                            posting_date: t.posting_date ?? null,
                            description: t.description ?? null,
                            status: t.status ?? "booked",
                            include_in_totals: t.include_in_totals !== false,
                            category_id: t.category_id ?? null,
                            tag_ids: (t.tags ?? []).map((tag) => tag.id),
                            is_new: t.is_new !== false,
                            comment: t.comment ?? null,
                          }));
                          const importRes = await fetch(`${apiBase}/api/transactions/import`, {
                            method: "POST",
                            headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" },
                            body: JSON.stringify({ transactions: importPayload }),
                          });
                          if (importRes.ok) {
                            const data = await importRes.json();
                            showToast(data.imported != null ? `${data.imported} transactions uploaded to cloud` : "Data uploaded", "success");
                          } else if (importRes.status === 403) {
                            setActiveSection("profile");
                            setProfileTab("subscription");
                            showToast(t.subscriptionNoAccess, "error");
                          }
                        } catch {
                          showToast("Could not upload local data; you can import the file later after switching.", "warning");
                        }
                        const patchOk = await doProfilePatch();
                        if (patchOk) {
                          loadRecentTransactions();
                          if (activeSection === "transactions") loadAllTransactions();
                        }
                      }
                    }
                    setLocalEncryptModal(null);
                    setLocalEncryptPassphrase("");
                  } else {
                    showToast("Wrong passphrase", "error");
                  }
                } else if (localEncryptModal === "lock") {
                  const ok = await setLocalEncryptionKey(pass);
                  if (ok) {
                    clearLocalEncryptionKey();
                    setLocalEncryptionStatus((s) => (s ? { ...s, unlocked: false } : null));
                    setLocalEncryptModal(null);
                    setLocalEncryptPassphrase("");
                  } else {
                    showToast("Wrong passphrase", "error");
                  }
                } else {
                  try {
                    await enableLocalEncryption(pass);
                    setLocalEncryptModal(null);
                    setLocalEncryptPassphrase("");
                    setLocalEncryptionStatus({ encrypted: true, unlocked: true });
                    showToast(t.profileSaved, "success");
                  } catch (err) {
                    showToast("Encryption failed", "error");
                  }
                }
              }}
            >
              <input
                ref={localEncryptPassphraseInputRef}
                type="password"
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
                placeholder={t.profilePassphrasePlaceholder}
                value={localEncryptPassphrase}
                onChange={(e) => setLocalEncryptPassphrase(e.target.value)}
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  className="inline-flex items-center justify-center p-2 rounded border border-solid transition-colors min-w-[2.25rem]"
                  style={{ borderWidth: 1, borderColor: "var(--border)", background: "var(--surface-hover)", color: "var(--text)" }}
                  title={t.modalCancel}
                  aria-label={t.modalCancel}
                  onClick={() => { setPendingAfterUnlock(null); setLocalEncryptModal(null); setLocalEncryptPassphrase(""); }}
                >
                  <i className="fa-solid fa-times" aria-hidden />
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center p-2 rounded border border-solid transition-colors min-w-[2.25rem]"
                  style={{ borderWidth: 1, borderColor: "var(--primary)", background: "var(--primary)", color: "white" }}
                  title={localEncryptModal === "unlock" ? t.profileUnlock : localEncryptModal === "lock" ? t.profileLocalLock : t.profileSetPassphrase}
                  aria-label={localEncryptModal === "unlock" ? t.profileUnlock : localEncryptModal === "lock" ? t.profileLocalLock : t.profileSetPassphrase}
                  disabled={!localEncryptPassphrase.trim()}
                >
                  <i className={`fa-solid ${localEncryptModal === "unlock" ? "fa-key" : localEncryptModal === "lock" ? "fa-lock" : "fa-check"}`} aria-hidden />
                </button>
              </div>
            </form>
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
                  <div className="mt-2 rounded border border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800">
                    <div className="flex flex-wrap gap-1 border-b border-slate-200 p-2 dark:border-slate-600">
                      <button
                        type="button"
                        className="rounded px-2 py-1 text-xs transition-colors"
                        style={{ color: "var(--primary)", background: "var(--primary-50)" }}
                        onClick={() =>
                          setExportModal((prev) => ({
                            ...prev,
                            selectedCategoryIds: categories.map((c) => c.id),
                          }))
                        }
                      >
                        {t.filterCategoryAll}
                      </button>
                      <button
                        type="button"
                        className="rounded px-2 py-1 text-xs transition-colors"
                        style={{ color: "var(--text-secondary)", background: "var(--surface-hover)" }}
                        onClick={() =>
                          setExportModal((prev) => ({ ...prev, selectedCategoryIds: [] }))
                        }
                      >
                        {t.filterCategoryNone}
                      </button>
                    </div>
                    <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto p-2">
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
          <Suspense fallback={<SectionFallback />}>
            <LazyPrivacyPolicy
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
          </Suspense>
        ) : null}
        {activeSection === "about" ? (
          <Suspense fallback={<SectionFallback />}>
            <LazyAboutUs
              onBack={() => {
                window.history.pushState({}, "", "/");
                setActiveSection(isAuthenticated ? "transactions" : "home");
              }}
              t={{
                aboutTitle: t.aboutTitle,
                aboutBack: t.aboutBack,
                aboutLastUpdated: t.aboutLastUpdated,
                aboutIntro: t.aboutIntro,
                aboutMissionTitle: t.aboutMissionTitle,
                aboutMissionContent: t.aboutMissionContent,
                aboutPsd2Paragraph: t.aboutPsd2Paragraph,
                aboutPsd2LinkText: t.aboutPsd2LinkText,
                aboutValuesTitle: t.aboutValuesTitle,
                aboutValuesContent: t.aboutValuesContent,
                aboutContactTitle: t.aboutContactTitle,
                aboutContactIntro: t.aboutContactIntro,
              }}
            />
          </Suspense>
        ) : null}
        {activeSection === "terms" ? (
          <Suspense fallback={<SectionFallback />}>
            <LazyTermsOfService
              onBack={() => {
                window.history.pushState({}, "", "/");
                setActiveSection(isAuthenticated ? "transactions" : "home");
              }}
              t={{
                termsTitle: t.termsTitle,
                termsBack: t.termsBack,
                termsLastUpdated: t.termsLastUpdated,
                termsIntro: t.termsIntro,
                termsSection1Title: t.termsSection1Title,
                termsSection1Content: t.termsSection1Content,
                termsSection2Title: t.termsSection2Title,
                termsSection2Content: t.termsSection2Content,
                termsSection3Title: t.termsSection3Title,
                termsSection3Content: t.termsSection3Content,
                termsSection4Title: t.termsSection4Title,
                termsSection4Content: t.termsSection4Content,
                termsSection5Title: t.termsSection5Title,
                termsSection5Content: t.termsSection5Content,
                termsSection6Title: t.termsSection6Title,
                termsSection6Content: t.termsSection6Content,
                termsSection7Title: t.termsSection7Title,
                termsSection7Content: t.termsSection7Content,
                termsSection8Title: t.termsSection8Title,
                termsSection8Content: t.termsSection8Content,
                termsContactTitle: t.termsContactTitle,
                termsContactIntro: t.termsContactIntro,
              }}
            />
          </Suspense>
        ) : null}
        {activeSection !== "privacy" && activeSection !== "about" && activeSection !== "terms" && isAuthenticated && authError ? (
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

        {isAuthenticated && activeSection !== "profile" && activeSection !== "settings" && (profile?.needs_onboarding || activeSection === "accounts") && !(activeSection === "transactions" && bankAccounts.length > 0) && !(activeSection === "insights" && bankAccounts.length > 0) && !(activeSection === "recurring" && bankAccounts.length > 0) ? (
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
          <div className="pt-14">
          <Suspense fallback={<SectionFallback />}>
          <LazyOnboarding
            hasSubscriptionAccess={profile?.has_subscription_access ?? true}
            onSubscriptionRequired={() => {
              setActiveSection("profile");
              setProfileTab("subscription");
              showToast(t.subscriptionNoAccess, "error");
            }}
            onAccountLimitReached={() => {
              setAccountLimitModalOpen(true);
            }}
            isOverAutoLimit={isOverAutoLimit}
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
              automaticAccountsOverLimitTooltip: t.automaticAccountsOverLimitTooltip,
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
          </Suspense>
          </div>
          </div>
        ) : null}

        {/* Insights Section */}
        {isAuthenticated && (bankAccounts.length > 0 || !profile?.needs_onboarding) && activeSection === "insights" ? (
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
            <Suspense fallback={<SectionFallback />}>
            <LazyInsights
              apiBase={apiBase}
              apiToken={apiToken}
              bankAccounts={bankAccounts}
              categories={categories}
              tags={tags}
              locale={getLocale()}
              t={t}
              showToast={showToast}
              storageMode={profile?.storage_mode}
            />
            </Suspense>
          </div>
        ) : null}

        {/* Recurring transactions (B012 Phase 4) */}
        {isAuthenticated && (bankAccounts.length > 0 || !profile?.needs_onboarding) && activeSection === "recurring" && apiToken ? (
          <Suspense fallback={<SectionFallback />}>
          <LazyRecurringTransactions
            apiBase={apiBase}
            token={apiToken}
            accounts={recurringAccounts}
            locale={getLocale()}
            base_currency={profile?.base_currency ?? "EUR"}
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
          </Suspense>
        ) : null}

        {isAuthenticated && activeSection === "transactions" && (bankAccounts.length > 0 || !profile?.needs_onboarding) ? (
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
            <div className="absolute top-14 right-4 z-10 flex items-center gap-2">
              <span title={isOverAutoLimit ? t.automaticAccountsOverLimitTooltip : (transactionsRefreshing ? t.refreshingTransactions : t.refreshTransactions)}>
                <button
                  type="button"
                  className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border rounded-full w-8 h-8 disabled:opacity-50"
                  style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-secondary)" }}
                  onClick={() => refreshAllTransactions()}
                  disabled={balancesRefreshing || transactionsRefreshing || isOverAutoLimit}
                  aria-label={transactionsRefreshing ? t.refreshingTransactions : t.refreshTransactions}
                >
                  <i className={`fa-solid fa-arrows-rotate ${transactionsRefreshing ? "fa-spin" : ""}`} aria-hidden />
                </button>
              </span>
              {profile?.show_account_balances ? (
                <span title={isOverAutoLimit ? t.automaticAccountsOverLimitTooltip : (balancesRefreshing ? t.refreshingBalances : t.refreshBalances)}>
                  <button
                    type="button"
                    className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border rounded-full w-8 h-8 disabled:opacity-50"
                    style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-secondary)" }}
                    onClick={() => refreshBalances()}
                    disabled={balancesRefreshing || transactionsRefreshing || isOverAutoLimit}
                    aria-label={balancesRefreshing ? t.refreshingBalances : t.refreshBalances}
                  >
                    <i className={`fa-solid fa-scale-balanced ${balancesRefreshing ? "fa-spin" : ""}`} aria-hidden />
                  </button>
                </span>
              ) : null}
            </div>
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
            {transactionBulkDeleteConfirm ? (
              <div
                className="modal-overlay"
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-transactions-title"
              >
                <div className="modal-card max-w-md">
                  <h3 id="delete-transactions-title" className="card-title">
                    {t.confirmDeleteTransactions}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    {t.confirmDeleteTransactionsWarning}
                  </p>
                  <p className="text-sm mt-2" style={{ color: "var(--text)" }}>
                    {transactionBulkDeleteConfirm.ids.length} selected
                  </p>
                  {transactionBulkDeleteSubmitting ? (
                    <p className="text-sm mt-2 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                      <i className="fa-solid fa-spinner fa-spin" aria-hidden />
                      Deleting…
                    </p>
                  ) : null}
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border"
                      style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
                      title={t.modalCancel}
                      aria-label={t.modalCancel}
                      onClick={() => setTransactionBulkDeleteConfirm(null)}
                      disabled={transactionBulkDeleteSubmitting}
                    >
                      <i className="fa-solid fa-xmark" aria-hidden />
                    </button>
                    <button
                      type="button"
                      className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border border-rose-600 bg-rose-600 text-white hover:bg-rose-700 hover:border-rose-700 disabled:opacity-70 disabled:pointer-events-none"
                      style={{ borderColor: "#be123c", backgroundColor: "#be123c", color: "#fff" }}
                      title={t.actionDelete}
                      aria-label={t.actionDelete}
                      onClick={handleBulkDeleteTransactions}
                      disabled={transactionBulkDeleteSubmitting}
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
              <section className="mx-auto max-w-6xl px-6 pt-24 pb-4">
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
                            <div className="h-10 w-10 rounded flex-shrink-0 overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                              <img
                                src={account.logo_url}
                                alt={account.institution_name}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
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
                              {account.account_source === "enable_banking" ? (
                                <span className="ml-1.5 text-[10px] uppercase tracking-wide text-blue-600 dark:text-blue-400" title="Linked via Enable Banking">
                                  Enable Banking
                                </span>
                              ) : account.account_source === "nordigen" ? (
                                <span className="ml-1.5 text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500" title="Linked via GoCardless/Nordigen">
                                  GoCardless
                                </span>
                              ) : null}
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
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="card-title mb-0">{t.transactionsListTitle}</h3>
                  <label className="flex items-center gap-2 cursor-pointer shrink-0" title={t.transactionsSelectAll}>
                    <input
                      type="checkbox"
                      checked={transactionsSelectMode && transactionsAll.length > 0 && transactionsAll.every((tx) => selectedTransactionIds.has(tx.id))}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setTransactionsSelectMode(checked);
                        setSelectedTransactionIds(checked ? new Set(transactionsAll.map((tx) => tx.id)) : new Set());
                      }}
                      className="h-4 w-4"
                      aria-label={t.transactionsSelectAll}
                    />
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{t.transactionsSelectAll}</span>
                  </label>
                  {transactionsSelectMode && selectedTransactionIds.size > 0 ? (
                    <button
                      type="button"
                      className="icon-button shrink-0 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                      title={t.actionDelete}
                      aria-label={t.actionDelete}
                      onClick={() => setTransactionBulkDeleteConfirm({ ids: Array.from(selectedTransactionIds) })}
                    >
                      <i className="fa-solid fa-trash-can" aria-hidden />
                    </button>
                  ) : null}
                </div>
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
                  className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border rounded-full w-8 h-8"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface)",
                    color: "var(--text-secondary)",
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
                  aria-label={t.exportDownload}
                >
                  <i className="fa-solid fa-file-csv text-sm" aria-hidden />
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
                  profile?.storage_mode === "local" && localEncryptionStatus?.encrypted && !localEncryptionStatus?.unlocked ? (
                    <div className="text-sm font-semibold py-3 px-4 rounded-lg" style={{ color: "var(--text)", background: "var(--surface-hover)", borderLeft: "4px solid var(--primary)" }}>
                      {t.transactionsLocalLocked}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500 dark:text-slate-300">
                      {t.transactionsListEmpty}
                    </div>
                  )
                ) : (
                  transactionsAll.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex flex-col gap-2 border-b border-slate-200 pb-3 text-sm dark:border-slate-700 md:flex-row md:flex-wrap md:items-center md:justify-between"
                    >
                      {transactionsSelectMode ? (
                        <div className="flex shrink-0 order-0 self-start md:order-none md:self-center">
                          <input
                            type="checkbox"
                            checked={selectedTransactionIds.has(tx.id)}
                            onChange={(e) => {
                              setSelectedTransactionIds((prev) => {
                                const next = new Set(prev);
                                if (e.target.checked) next.add(tx.id);
                                else next.delete(tx.id);
                                return next;
                              });
                            }}
                            className="mt-1.5 shrink-0 md:mt-0"
                            aria-label={t.transactionsSelectAll}
                          />
                        </div>
                      ) : null}
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
                <div className="flex items-center gap-2 min-w-0">
                  <h2 className="card-title m-0">{t.profileTitle}</h2>
                  <button
                    type="button"
                    className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border rounded-full w-7 h-7"
                    style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--primary)" }}
                    title={t.wizardExpand}
                    aria-label={t.wizardExpand}
                    onClick={() => {
                      setWizardDismissed(false);
                      setOnboardingWizardMinimized(false);
                      setShowWizardFromProfile(true);
                    }}
                  >
                    <i className="fa-solid fa-list-check text-xs" aria-hidden />
                  </button>
                </div>
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
                  {(["user", "channels", "alerts", "storage", "tokens", "subscription"] as const).map((tabId) => (
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
                      {tabId === "subscription" && t.profileTabSubscription}
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
                              {item.names[language.code as "en" | "pt" | "es" | "fr" | "de" | "it" | "nl" | "pl"] ??
                                item.names.en}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-2">
                        <span className="font-medium">{t.profileBaseCurrency}</span>
                        <select
                          className="input"
                          value={profileForm.base_currency}
                          onChange={(event) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              base_currency: event.target.value,
                            }))
                          }
                        >
                          {baseCurrencyOptions.map((item) => (
                            <option key={item.code} value={item.code}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {t.profileBaseCurrencyHelp}
                        </p>
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
                      {profile.is_authorized_user ? (
                        <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                          {t.authorizedUserAsAuthorizedMessage}
                        </p>
                      ) : (
                        <>
                          <hr style={{ borderColor: "var(--border)", margin: "1rem 0" }} />
                          <h3 className="font-medium mt-2" style={{ color: "var(--text)" }}>{t.authorizedUsersTitle}</h3>
                          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t.authorizedUsersRequestLabel}</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="email"
                              className="input flex-1 min-w-[12rem]"
                              value={authorizedUserRequestEmail}
                              onChange={(e) => setAuthorizedUserRequestEmail(e.target.value)}
                              placeholder={t.profileEmail}
                            />
                            <button
                              type="button"
                              className="inline-flex items-center justify-center p-2 rounded border transition-colors min-w-[2.25rem] disabled:opacity-50 disabled:pointer-events-none"
                              style={{
                                background: "var(--surface-hover)",
                                borderColor: "var(--border)",
                                color: "var(--text)",
                              }}
                              disabled={!authorizedUserRequestEmail.trim() || authorizedUserRequestSubmitting}
                              title={authorizedUserRequestSubmitting ? "…" : t.authorizedUsersRequestButton}
                              aria-label={authorizedUserRequestSubmitting ? "…" : t.authorizedUsersRequestButton}
                              onClick={async () => {
                                if (!apiToken || !authorizedUserRequestEmail.trim()) return;
                                setAuthorizedUserRequestSubmitting(true);
                                try {
                                  const res = await fetch(`${apiBase}/api/me/authorized-users/request`, {
                                    method: "POST",
                                    headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" },
                                    body: JSON.stringify({ email: authorizedUserRequestEmail.trim() }),
                                  });
                                  const data = await res.json().catch(() => ({}));
                                  if (res.ok && data) {
                                    setAuthorizedUserRequestEmail("");
                                    loadAuthorizedUsers();
                                    const msg = (typeof data.message === "string" && data.message.toLowerCase().includes("already exists"))
                                      ? t.authorizedUserRequestAlreadyExists
                                      : t.authorizedUserRequestSent;
                                    showToast(msg, "success");
                                  } else if (res.status === 400 && data?.detail === "existing_user") {
                                    showToast(t.authorizedUserCannotAuthorizeExistingUser, "error");
                                  } else {
                                    const err = typeof data?.detail === "string" ? data.detail : t.authorizedUserRevokeFailed;
                                    showToast(err, "error");
                                  }
                                } finally {
                                  setAuthorizedUserRequestSubmitting(false);
                                }
                              }}
                            >
                              <i className={`fa-solid fa-user-plus text-sm ${authorizedUserRequestSubmitting ? "fa-spin" : ""}`} aria-hidden />
                            </button>
                          </div>
                          {authorizedUsersLoading ? (
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>…</p>
                          ) : authorizedUsers && (authorizedUsers.pending.length > 0 || authorizedUsers.authorized.length > 0) ? (
                            <div className="grid gap-3 mt-3">
                              {authorizedUsers.pending.length > 0 && (
                                <div>
                                  <span className="font-medium text-sm" style={{ color: "var(--text)" }}>{t.authorizedUsersPendingTitle}</span>
                                  <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>{t.authorizedUsersPendingHint}</p>
                                  <ul className="mt-1 space-y-2">
                                    {authorizedUsers.pending.map((r, i) => (
                                      <li key={i} className="flex flex-wrap items-center gap-2 text-sm">
                                        <span style={{ color: "var(--text)" }}>{r.email}</span>
                                        <button
                                          type="button"
                                          className="inline-flex items-center justify-center p-2 rounded border transition-colors min-w-[2.25rem]"
                                          style={{ borderColor: "var(--border)", background: "var(--surface-hover)", color: "var(--text)" }}
                                          title={t.authorizedUsersRevoke}
                                          aria-label={t.authorizedUsersRevoke}
                                          onClick={async () => {
                                            if (!apiToken) return;
                                            const res = await fetch(
                                              `${apiBase}/api/me/authorized-users/pending?email=${encodeURIComponent(r.email)}`,
                                              { method: "DELETE", headers: { Authorization: `Bearer ${apiToken}` } }
                                            );
                                            if (res.ok) loadAuthorizedUsers();
                                            else showToast(t.authorizedUserRevokeFailed, "error");
                                          }}
                                        >
                                          <i className="fa-solid fa-xmark text-sm" aria-hidden />
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {authorizedUsers.authorized.length > 0 && (
                                <div>
                                  <span className="font-medium text-sm" style={{ color: "var(--text)" }}>{t.authorizedUsersAuthorizedTitle}</span>
                                  <ul className="mt-1 space-y-2">
                                    {authorizedUsers.authorized.map((u) => (
                                      <li key={u.user_id} className="flex flex-wrap items-center gap-2 text-sm">
                                        <span style={{ color: "var(--text)" }}>{u.display_name || u.email}</span>
                                        <span style={{ color: "var(--text-secondary)" }}>({u.email})</span>
                                        <span style={{ color: "var(--text-secondary)" }}>
                                          {t.authorizedUsersLastLogin}: {u.last_login_at
                                            ? new Date(u.last_login_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })
                                            : "—"}
                                        </span>
                                        <button
                                          type="button"
                                          className="inline-flex items-center justify-center p-2 rounded border transition-colors min-w-[2.25rem]"
                                          style={{ borderColor: "var(--border)", background: "var(--surface-hover)", color: "var(--text)" }}
                                          title={t.authorizedUsersRevoke}
                                          aria-label={t.authorizedUsersRevoke}
                                          onClick={async () => {
                                            if (!apiToken) return;
                                            const res = await fetch(`${apiBase}/api/me/authorized-users/${u.user_id}`, {
                                              method: "DELETE",
                                              headers: { Authorization: `Bearer ${apiToken}` },
                                            });
                                            if (res.ok) loadAuthorizedUsers();
                                            else showToast(t.authorizedUserRevokeFailed, "error");
                                          }}
                                        >
                                          <i className="fa-solid fa-user-minus text-sm" aria-hidden />
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ) : null}
                        </>
                      )}
                    </>
                  )}
                  {profileTab === "channels" && (
                    <>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <span className="font-medium inline-flex items-center gap-2" style={{ color: "var(--text)" }}>
                      <i className="fa-brands fa-telegram" aria-hidden style={{ color: "#0088cc" }} />
                      {t.profileTelegramId}
                      <button
                        type="button"
                        className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border rounded-full w-7 h-7"
                        style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-secondary)" }}
                        title={t.helpTelegramCommandsTitle}
                        aria-label={t.helpTelegramCommandsTitle}
                        onClick={() => setHelpModalContext("profileTelegramCommands")}
                      >
                        <i className="fa-regular fa-circle-question text-sm" aria-hidden />
                      </button>
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
                {profile?.storage_locked_for_shared_account && (
                  <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>{t.storageLockedSharedAccount}</p>
                )}
                <div className="grid gap-2">
                  <span className="font-medium" style={{ color: "var(--text)" }}>{t.profileStorageMode}</span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label
                      className={`flex flex-col gap-2 rounded-lg border p-4 transition-colors ${
                        profileForm.storage_mode === "cloud"
                          ? "border-blue-500 dark:border-blue-400"
                          : "border-slate-200 dark:border-slate-700"
                      } ${profile?.storage_locked_for_shared_account ? "cursor-default opacity-90" : "cursor-pointer"}`}
                      style={{
                        background: profileForm.storage_mode === "cloud" ? "var(--primary-50)" : "var(--surface)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="storage_mode"
                          checked={profileForm.storage_mode === "cloud"}
                          onChange={() => !profile?.storage_locked_for_shared_account && setProfileForm((prev) => ({ ...prev, storage_mode: "cloud" }))}
                          disabled={!!profile?.storage_locked_for_shared_account}
                          className="h-4 w-4"
                        />
                        <span className="font-medium" style={{ color: "var(--text)" }}>{t.profileStorageModeCloud}</span>
                      </div>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{t.profileStorageModeCloudHelp}</p>
                    </label>
                    <label
                      className={`flex flex-col gap-2 rounded-lg border p-4 transition-colors ${
                        profileForm.storage_mode === "local"
                          ? "border-blue-500 dark:border-blue-400"
                          : "border-slate-200 dark:border-slate-700"
                      } ${profile?.storage_locked_for_shared_account ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                      style={{
                        background: profileForm.storage_mode === "local" ? "var(--primary-50)" : "var(--surface)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="storage_mode"
                          checked={profileForm.storage_mode === "local"}
                          onChange={() => !profile?.storage_locked_for_shared_account && setProfileForm((prev) => ({ ...prev, storage_mode: "local" }))}
                          disabled={!!profile?.storage_locked_for_shared_account}
                          className="h-4 w-4"
                        />
                        <span className="font-medium" style={{ color: "var(--text)" }}>{t.profileStorageModeLocal}</span>
                      </div>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{t.profileStorageModeLocalHelp}</p>
                    </label>
                  </div>
                </div>
                <div className="mt-6 grid gap-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="font-medium" style={{ color: "var(--text)" }}>{t.profileDownloadMyData}</span>
                      <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                        {t.profileExportHelp}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center p-2 rounded border transition-colors min-w-[2.25rem]"
                        style={{
                          background: "var(--surface-hover)",
                          borderColor: "var(--border)",
                          color: "var(--text)",
                        }}
                        title={t.profileDownloadJson}
                        aria-label={t.profileDownloadJson}
                        onClick={async () => {
                          const isLocal = profile?.storage_mode === "local";
                          if (isLocal && localEncryptionStatus?.encrypted && !localEncryptionStatus?.unlocked) {
                            setPendingAfterUnlock({ type: "export", format: "json" });
                            setLocalEncryptModal("unlock");
                            return;
                          }
                          try {
                            if (isLocal) {
                              const json = await localTransactionsExportJSON();
                              const blob = new Blob([json], { type: "application/json" });
                              downloadBlob(blob, `eurodata-transactions-${new Date().toISOString().slice(0, 10)}.json`);
                            } else {
                              const all = await fetchAllCloudTransactions();
                              const json = JSON.stringify(all, null, 2);
                              const blob = new Blob([json], { type: "application/json" });
                              downloadBlob(blob, `eurodata-transactions-${new Date().toISOString().slice(0, 10)}.json`);
                            }
                            showToast(t.profileDownloadJson, "success");
                          } catch (e) {
                            showToast("Export failed", "error");
                          }
                        }}
                      >
                        <i className="fa-solid fa-file-code" aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center p-2 rounded border transition-colors min-w-[2.25rem]"
                        style={{
                          background: "var(--surface-hover)",
                          borderColor: "var(--border)",
                          color: "var(--text)",
                        }}
                        title={t.profileDownloadCsv}
                        aria-label={t.profileDownloadCsv}
                        onClick={async () => {
                          const isLocal = profile?.storage_mode === "local";
                          if (isLocal && localEncryptionStatus?.encrypted && !localEncryptionStatus?.unlocked) {
                            setPendingAfterUnlock({ type: "export", format: "csv" });
                            setLocalEncryptModal("unlock");
                            return;
                          }
                          try {
                            if (isLocal) {
                              const csv = await localTransactionsExportCSV();
                              const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
                              downloadBlob(blob, `eurodata-transactions-${new Date().toISOString().slice(0, 10)}.csv`);
                            } else {
                              if (!apiToken) {
                                showToast("Export failed", "error");
                                return;
                              }
                              const response = await fetch(`${apiBase}/api/transactions/export`, {
                                method: "GET",
                                headers: { Authorization: `Bearer ${apiToken}` },
                              });
                              if (!response.ok) {
                                showToast("Export failed", "error");
                                return;
                              }
                              const blob = await response.blob();
                              downloadBlob(blob, `eurodata-transactions-${new Date().toISOString().slice(0, 10)}.csv`);
                            }
                            showToast(t.profileDownloadCsv, "success");
                          } catch (e) {
                            showToast("Export failed", "error");
                          }
                        }}
                      >
                        <i className="fa-solid fa-file-csv" aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center p-2 rounded border transition-colors min-w-[2.25rem]"
                        style={{
                          background: "var(--surface-hover)",
                          borderColor: "var(--border)",
                          color: "var(--text)",
                        }}
                        title={t.profileDownloadOfx}
                        aria-label={t.profileDownloadOfx}
                        onClick={async () => {
                          const isLocal = profile?.storage_mode === "local";
                          if (isLocal && localEncryptionStatus?.encrypted && !localEncryptionStatus?.unlocked) {
                            setPendingAfterUnlock({ type: "export", format: "ofx" });
                            setLocalEncryptModal("unlock");
                            return;
                          }
                          try {
                            if (isLocal) {
                              const ofx = await localTransactionsExportOFX();
                              const blob = new Blob([ofx], { type: "application/x-ofx" });
                              downloadBlob(blob, `eurodata-transactions-${new Date().toISOString().slice(0, 10)}.ofx`);
                            } else {
                              if (!apiToken) {
                                showToast("Export failed", "error");
                                return;
                              }
                              const all = await fetchAllCloudTransactions();
                              const ofx = buildOFXFromTransactions(all);
                              const blob = new Blob([ofx], { type: "application/x-ofx" });
                              downloadBlob(blob, `eurodata-transactions-${new Date().toISOString().slice(0, 10)}.ofx`);
                            }
                            showToast(t.profileDownloadOfx, "success");
                          } catch (e) {
                            showToast("Export failed", "error");
                          }
                        }}
                      >
                        <i className="fa-solid fa-file-invoice" aria-hidden />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="font-medium" style={{ color: "var(--text)" }}>{t.profileImportData}</span>
                      <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                        {t.profileImportHelpShort}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center p-2 rounded border transition-colors min-w-[2.25rem]"
                        style={{
                          background: "var(--surface-hover)",
                          borderColor: "var(--border)",
                          color: "var(--text)",
                        }}
                        title={t.profileImportData}
                        aria-label={t.profileImportData}
                        onClick={() => {
                          if (profile?.storage_mode === "local" && localEncryptionStatus?.encrypted && !localEncryptionStatus?.unlocked) {
                            showToast("Unlock data in Profile to import.", "warning");
                            return;
                          }
                          backupImportInputRef.current?.click();
                        }}
                      >
                        <i className="fa-solid fa-file-import" aria-hidden />
                      </button>
                    </div>
                  </div>
                  <input
                      ref={backupImportInputRef}
                      type="file"
                      accept=".json,.csv,.ofx,application/json,text/csv,application/x-ofx"
                      className="sr-only"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const isLocal = profile?.storage_mode === "local";
                        const name = (file.name || "").toLowerCase();
                        const isCsv = name.endsWith(".csv");
                        const isOfx = name.endsWith(".ofx");
                        try {
                          const text = await file.text();
                          if (isOfx) {
                            if (isLocal) {
                              const { imported, errors } = await localTransactionsImportFromOFX(text);
                              if (errors.length > 0) {
                                showToast(`${imported} imported; ${errors.length} errors`, "warning");
                              } else {
                                showToast(`${imported} transactions imported`, "success");
                              }
                            } else {
                              const { transactions, errors } = parseOFXToImportPayload(text);
                              if (transactions.length === 0 && errors.length > 0) {
                                showToast(errors[0] || "Import failed", "error");
                                e.target.value = "";
                                return;
                              }
                              const res = await fetch(`${apiBase}/api/transactions/import`, {
                                method: "POST",
                                headers: {
                                  Authorization: `Bearer ${apiToken}`,
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ transactions }),
                              });
                              if (!res.ok) {
                                if (res.status === 403) {
                                  setActiveSection("profile");
                                  setProfileTab("subscription");
                                  showToast(t.subscriptionNoAccess, "error");
                                } else {
                                  showToast("Import failed", "error");
                                }
                                e.target.value = "";
                                return;
                              }
                              const data = await res.json().catch(() => ({}));
                              const imported = data.imported ?? transactions.length;
                              showToast(errors.length > 0 ? `${imported} imported; ${errors.length} parse errors` : `${imported} transactions imported`, errors.length ? "warning" : "success");
                            }
                          } else if (isCsv) {
                            if (isLocal) {
                              const { imported, errors } = await localTransactionsImportFromCSV(text);
                              if (errors.length > 0) {
                                showToast(`${imported} imported; ${errors.length} errors`, "warning");
                              } else {
                                showToast(`${imported} transactions imported`, "success");
                              }
                            } else {
                              const { transactions, errors } = parseCSVToImportPayload(text);
                              if (transactions.length === 0 && errors.length > 0) {
                                showToast(errors[0] || "Import failed", "error");
                                e.target.value = "";
                                return;
                              }
                              const res = await fetch(`${apiBase}/api/transactions/import`, {
                                method: "POST",
                                headers: {
                                  Authorization: `Bearer ${apiToken}`,
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ transactions }),
                              });
                              if (!res.ok) {
                                if (res.status === 403) {
                                  setActiveSection("profile");
                                  setProfileTab("subscription");
                                  showToast(t.subscriptionNoAccess, "error");
                                } else {
                                  showToast("Import failed", "error");
                                }
                                e.target.value = "";
                                return;
                              }
                              const data = await res.json().catch(() => ({}));
                              const imported = data.imported ?? transactions.length;
                              showToast(errors.length > 0 ? `${imported} imported; ${errors.length} parse errors` : `${imported} transactions imported`, errors.length ? "warning" : "success");
                            }
                          } else {
                            if (isLocal) {
                              const { imported, errors } = await localTransactionsImportFromJSON(text);
                              if (errors.length > 0) {
                                showToast(`${imported} imported; ${errors.length} errors`, "warning");
                              } else {
                                showToast(`${imported} transactions imported`, "success");
                              }
                            } else {
                              let arr: unknown[];
                              try {
                                arr = JSON.parse(text);
                              } catch {
                                showToast("Invalid JSON", "error");
                                e.target.value = "";
                                return;
                              }
                              if (!Array.isArray(arr)) {
                                showToast("Expected a JSON array", "error");
                                e.target.value = "";
                                return;
                              }
                              const transactions = arr.map((o: Record<string, unknown>) => ({
                                bank_account_id: Number(o.bank_account_id),
                                transaction_id: String(o.transaction_id ?? ""),
                                amount: String(o.amount ?? "0"),
                                currency: String(o.currency ?? ""),
                                booking_date: (o.booking_date as string) || null,
                                value_date: (o.value_date as string) || null,
                                posting_date: (o.posting_date as string) || null,
                                description: (o.description as string) || null,
                                status: (o.status as string) || "booked",
                                include_in_totals: o.include_in_totals !== false,
                                category_id: (o.category_id as number) ?? null,
                                tag_ids: Array.isArray(o.tags) ? (o.tags as { id: number }[]).map((x) => x.id) : [],
                                is_new: o.is_new !== false,
                                comment: (o.comment as string) || null,
                              }));
                              const res = await fetch(`${apiBase}/api/transactions/import`, {
                                method: "POST",
                                headers: {
                                  Authorization: `Bearer ${apiToken}`,
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ transactions }),
                              });
                              if (!res.ok) {
                                if (res.status === 403) {
                                  setActiveSection("profile");
                                  setProfileTab("subscription");
                                  showToast(t.subscriptionNoAccess, "error");
                                } else {
                                  showToast("Import failed", "error");
                                }
                                e.target.value = "";
                                return;
                              }
                              const data = await res.json().catch(() => ({}));
                              const imported = data.imported ?? transactions.length;
                              showToast(`${imported} transactions imported`, "success");
                            }
                          }
                          loadRecentTransactions();
                          if (activeSection === "transactions") loadAllTransactions();
                        } catch (err) {
                          showToast("Import failed", "error");
                        }
                        e.target.value = "";
                      }}
                    />
                  {profileForm.storage_mode === "local" && (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <span className="font-medium" style={{ color: "var(--text)" }}>
                          {localEncryptionStatus?.encrypted
                            ? (localEncryptionStatus.unlocked ? t.profileLocalLock : t.profileLocalUnlock)
                            : t.profileLocalEncrypt}
                        </span>
                        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                          {localEncryptionStatus?.encrypted && !localEncryptionStatus?.unlocked
                            ? t.profileLocalUnlockHelp
                            : t.profileLocalEncryptHelp}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        {!localEncryptionStatus?.encrypted && (
                          <button
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded border transition-colors min-w-[2.25rem]"
                            style={{ borderColor: "var(--border)", background: "var(--surface-hover)", color: "var(--text)" }}
                            title={t.profileLocalEncrypt}
                            aria-label={t.profileLocalEncrypt}
                            onClick={() => setLocalEncryptModal("encrypt")}
                          >
                            <i className="fa-solid fa-lock" aria-hidden />
                          </button>
                        )}
                        {localEncryptionStatus?.encrypted && localEncryptionStatus?.unlocked && (
                          <button
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded border transition-colors min-w-[2.25rem]"
                            style={{ borderColor: "var(--border)", background: "var(--surface-hover)", color: "var(--text)" }}
                            title={t.profileLocalLock}
                            aria-label={t.profileLocalLock}
                            onClick={() => setLocalEncryptModal("lock")}
                          >
                            <i className="fa-solid fa-lock-open" aria-hidden />
                          </button>
                        )}
                        {localEncryptionStatus?.encrypted && !localEncryptionStatus?.unlocked && (
                          <button
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded border transition-colors min-w-[2.25rem]"
                            style={{ borderColor: "var(--primary)", background: "var(--primary)", color: "white" }}
                            title={t.profileLocalUnlock}
                            aria-label={t.profileLocalUnlock}
                            onClick={() => setLocalEncryptModal("unlock")}
                          >
                            <i className="fa-solid fa-key" aria-hidden />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                    </>
                  )}
                  {profileTab === "subscription" && (
                    <>
                {profile?.is_authorized_user && (
                  <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>{t.subscriptionOwnerOnly}</p>
                )}
                <div className="grid gap-4">
                  {profile?.is_authorized_user ? (
                    /* Authorized user: read-only status, no manage/subscribe/portal/checkout */
                    <>
                      {profile?.has_subscription_access ? (
                        <>
                          {profile.subscription_status === "active" && (
                            <p className="text-sm m-0" style={{ color: "var(--text)" }}>
                              {profile.subscription_cancel_at_period_end ? t.subscriptionStatusCanceled : t.subscriptionStatusActive}
                              {profile.subscription_current_period_end && (() => {
                                const d = new Date(profile.subscription_current_period_end);
                                if (!Number.isNaN(d.getTime())) {
                                  return <> — {t.subscriptionPeriodEndsOn} {d.toLocaleDateString(undefined, { dateStyle: "long" })}</>;
                                }
                                return null;
                              })()}
                              {formattedMonthlyTotal && <> · {formattedMonthlyTotal}/{t.perMonth}</>}
                            </p>
                          )}
                          {profile.subscription_status !== "active" && (
                            <p className="text-sm m-0" style={{ color: "var(--text)" }}>
                              {t.subscriptionStatusTrial}
                              {profile.trial_ends_at && (
                                <> {t.subscriptionTrialEndsOn} {new Date(profile.trial_ends_at).toLocaleDateString(undefined, { dateStyle: "long" })}</>
                              )}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm m-0" style={{ color: "var(--text)" }}>
                          {t.subscriptionTrialEnded}
                          {profile?.trial_ends_at && (
                            <> {t.subscriptionTrialEndsOn} {new Date(profile.trial_ends_at).toLocaleDateString(undefined, { dateStyle: "long" })}</>
                          )}
                        </p>
                      )}
                    </>
                  ) : profile?.has_subscription_access ? (
                    <>
                      {/* Active subscription: one row — status + date + total left, manage (icon) right */}
                      {profile.subscription_status === "active" && (
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <p className="text-sm m-0" style={{ color: "var(--text)" }}>
                            {profile.subscription_cancel_at_period_end ? t.subscriptionStatusCanceled : t.subscriptionStatusActive}
                            {profile.subscription_current_period_end && (() => {
                              const d = new Date(profile.subscription_current_period_end);
                              if (!Number.isNaN(d.getTime())) {
                                return <> — {t.subscriptionPeriodEndsOn} {d.toLocaleDateString(undefined, { dateStyle: "long" })}</>;
                              }
                              return null;
                            })()}
                            {formattedMonthlyTotal && <> · {formattedMonthlyTotal}/{t.perMonth}</>}
                          </p>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border font-medium transition-colors disabled:opacity-60"
                              style={{
                                borderColor: "var(--border)",
                                background: "var(--surface-hover)",
                                color: "var(--text)",
                              }}
                              disabled={subscriptionRefreshLoading}
                              title={t.subscriptionRefresh}
                              aria-label={subscriptionRefreshLoading ? t.subscriptionRefreshing : t.subscriptionRefresh}
                              onClick={async () => {
                                if (!apiToken || !apiBase) return;
                                setSubscriptionRefreshLoading(true);
                                try {
                                  const res = await fetch(`${apiBase}/api/me`, {
                                    headers: { Authorization: `Bearer ${apiToken}` },
                                  });
                                  if (res.ok) {
                                    setProfile(await res.json());
                                    showToast(t.subscriptionRefreshed, "success");
                                  } else {
                                    showToast("Failed to refresh", "error");
                                  }
                                } catch {
                                  showToast("Failed to refresh", "error");
                                } finally {
                                  setSubscriptionRefreshLoading(false);
                                }
                              }}
                            >
                              <i className={`fa-solid fa-rotate ${subscriptionRefreshLoading ? "fa-spin" : ""}`} aria-hidden />
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border font-medium transition-colors disabled:opacity-60"
                              style={{
                                borderColor: "var(--border)",
                                background: "var(--surface-hover)",
                                color: "var(--text)",
                              }}
                              disabled={subscriptionPortalLoading}
                              title={t.subscriptionManage}
                              aria-label={t.subscriptionManage}
                              onClick={async () => {
                                if (!apiToken || !apiBase) return;
                                setSubscriptionPortalLoading(true);
                                try {
                                  const returnUrl = `${window.location.origin}${window.location.pathname}?open=profile&tab=subscription`;
                                  const res = await fetch(`${apiBase}/api/me/subscription/portal`, {
                                    method: "POST",
                                    headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" },
                                    body: JSON.stringify({ return_url: returnUrl }),
                                  });
                                  const data = await res.json();
                                  if (data?.url) window.location.href = data.url;
                                  else if (!res.ok) {
                                    const err = await res.json().catch(() => ({}));
                                    showToast(err?.detail ?? "Portal unavailable", "error");
                                  }
                                } finally {
                                  setSubscriptionPortalLoading(false);
                                }
                              }}
                            >
                              <i className="fa-solid fa-external-link-alt" aria-hidden />
                            </button>
                          </div>
                        </div>
                      )}
                      {/* Trial: one row — status + date left, subscribe (icon) right */}
                      {profile.subscription_status !== "active" && (
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <p className="text-sm m-0" style={{ color: "var(--text)" }}>
                            {t.subscriptionStatusTrial}
                            {profile.trial_ends_at && (
                              <> {t.subscriptionTrialEndsOn} {new Date(profile.trial_ends_at).toLocaleDateString(undefined, { dateStyle: "long" })}</>
                            )}
                          </p>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border font-medium transition-colors disabled:opacity-60 shrink-0"
                            style={{
                              borderColor: "var(--border)",
                              background: "var(--surface-hover)",
                              color: "var(--text)",
                            }}
                            disabled={subscriptionCheckoutLoading}
                            title={t.subscriptionSubscribe}
                            aria-label={t.subscriptionSubscribe}
                            onClick={async () => {
                              if (!apiToken || !apiBase) return;
                              setSubscriptionCheckoutLoading(true);
                              try {
                                const res = await fetch(`${apiBase}/api/me/subscription/checkout`, {
                                  method: "POST",
                                  headers: { Authorization: `Bearer ${apiToken}` },
                                });
                                const data = await res.json();
                                if (data?.url) window.location.href = data.url;
                                else if (!res.ok) {
                                  const err = await res.json().catch(() => ({}));
                                  showToast(err?.detail ?? "Checkout failed", "error");
                                }
                              } finally {
                                setSubscriptionCheckoutLoading(false);
                              }
                            }}
                          >
                            <i className="fa-solid fa-credit-card" aria-hidden />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-sm m-0" style={{ color: "var(--text)" }}>{t.subscriptionTrialEnded}</p>
                        {profile?.trial_ends_at && (
                          <p className="text-xs m-0 mt-1" style={{ color: "var(--text-secondary)" }}>
                            {t.subscriptionTrialEndsOn} {new Date(profile.trial_ends_at).toLocaleDateString(undefined, { dateStyle: "long" })}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg border font-medium transition-colors disabled:opacity-60 shrink-0"
                        style={{
                          borderColor: "var(--border)",
                          background: "var(--surface-hover)",
                          color: "var(--text)",
                        }}
                        disabled={subscriptionCheckoutLoading}
                        title={t.subscriptionSubscribe}
                        aria-label={t.subscriptionSubscribe}
                        onClick={async () => {
                          if (!apiToken || !apiBase) return;
                          setSubscriptionCheckoutLoading(true);
                          try {
                            const res = await fetch(`${apiBase}/api/me/subscription/checkout`, {
                              method: "POST",
                              headers: { Authorization: `Bearer ${apiToken}` },
                            });
                            const data = await res.json();
                            if (data?.url) window.location.href = data.url;
                            else if (!res.ok) {
                              const err = await res.json().catch(() => ({}));
                              showToast(err?.detail ?? "Checkout failed", "error");
                            }
                          } finally {
                            setSubscriptionCheckoutLoading(false);
                          }
                        }}
                      >
                        <i className="fa-solid fa-credit-card" aria-hidden />
                      </button>
                    </div>
                  )}
                </div>
                {/* Automatic account usage */}
                {profile?.has_subscription_access && (
                  <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-sm font-medium m-0" style={{ color: "var(--text)" }}>
                          {t.automaticAccountsLabel ?? "Automatic accounts"}
                        </p>
                        <p className="text-xs m-0 mt-0.5" style={{ color: "var(--text-secondary)" }}>
                          {profile.current_automatic_accounts ?? 0} / {profile.allowed_automatic_accounts ?? 2} {t.automaticAccountsUsed ?? "used"}
                          {(profile.extra_automatic_accounts ?? 0) > 0 && (
                            <> · {profile.extra_automatic_accounts} {t.automaticAccountsExtra ?? "extra"}</>
                          )}
                        </p>
                      </div>
                      {profile.subscription_status === "active" && (
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors disabled:opacity-60"
                            style={{
                              borderColor: "var(--border)",
                              background: "var(--surface-hover)",
                              color: "var(--text)",
                            }}
                            disabled={accountSlotLoading || removeSlotLoading}
                            title={formattedSlotPrice ? `${t.automaticAccountsAddSlot ?? "Add account"} · ${formattedSlotPrice}/${t.perMonth}` : (t.automaticAccountsAddSlot ?? "Add account")}
                            onClick={() => setAccountLimitModalOpen(true)}
                          >
                            <i className="fa-solid fa-plus text-[10px]" aria-hidden />
                            {formattedSlotPrice
                              ? `${t.automaticAccountsAddSlot ?? "Add account"} · ${formattedSlotPrice}/${t.perMonth}`
                              : (t.automaticAccountsAddSlot ?? "Add account")}
                          </button>
                          {(profile.extra_automatic_accounts ?? 0) > 0 && (
                            <button
                              type="button"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors disabled:opacity-60"
                              style={{
                                borderColor: "var(--border)",
                                background: "var(--surface-hover)",
                                color: "var(--text-secondary)",
                              }}
                              disabled={accountSlotLoading || removeSlotLoading}
                              title={formattedSlotPrice ? `${t.automaticAccountsRemoveSlot ?? "Remove account"} · -${formattedSlotPrice}/${t.perMonth}` : (t.automaticAccountsRemoveSlot ?? "Remove account")}
                              onClick={() => setRemoveSlotModalOpen(true)}
                            >
                              <i className="fa-solid fa-minus text-[10px]" aria-hidden />
                              {formattedSlotPrice
                                ? `${t.automaticAccountsRemoveSlot ?? "Remove account"} · -${formattedSlotPrice}/${t.perMonth}`
                                : (t.automaticAccountsRemoveSlot ?? "Remove account")}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                        base_currency: profile.base_currency ?? "EUR",
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
          <Suspense fallback={<SectionFallback />}>
          <LazyAdminDashboard
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
              metricsActiveSubscriptionUsers: t.metricsActiveSubscriptionUsers,
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
          </Suspense>
        ) : null}

        {isAuthenticated && profile?.is_admin && apiToken && activeSection === "audit" ? (
          <Suspense fallback={<SectionFallback />}>
          <LazyAudit
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
          </Suspense>
        ) : null}

        {isAuthenticated && apiToken && activeSection === "settings" ? (
          <Suspense fallback={<SectionFallback />}>
          <LazySettings
            token={apiToken}
            apiBase={apiBase}
            languageCode={language.code}
            initialTab={settingsInitialTab ?? undefined}
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
              settingsLoadSample: t.settingsLoadSample,
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
          </Suspense>
        ) : null}

        {isAuthenticated && profile?.is_admin && apiToken && activeSection === "users" ? (
          <Suspense fallback={<SectionFallback />}>
          <LazyAdminUsers
            token={apiToken}
            apiBase={apiBase}
            showToast={showToast}
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
              adminResendSync: t.adminResendSync,
              adminResendSyncing: t.adminResendSyncing,
              adminResendSyncSuccess: t.adminResendSyncSuccess,
              adminResendSyncError: t.adminResendSyncError,
              adminBroadcast: t.adminBroadcast,
              adminBroadcastTitle: t.adminBroadcastTitle,
              adminBroadcastDesc: t.adminBroadcastDesc,
              adminBroadcastSelectTemplate: t.adminBroadcastSelectTemplate,
              adminBroadcastSend: t.adminBroadcastSend,
              adminBroadcastSending: t.adminBroadcastSending,
              adminBroadcastSuccess: t.adminBroadcastSuccess,
              adminBroadcastError: t.adminBroadcastError,
              adminBroadcastLoadingTemplates: t.adminBroadcastLoadingTemplates,
              adminBroadcastNoTemplates: t.adminBroadcastNoTemplates,
              adminBroadcastStepTranslating: t.adminBroadcastStepTranslating,
              adminBroadcastStepSending: t.adminBroadcastStepSending,
              adminBroadcastStepCleanup: t.adminBroadcastStepCleanup,
              adminBroadcastDetailSent: t.adminBroadcastDetailSent,
              adminBroadcastDetailErrors: t.adminBroadcastDetailErrors,
              adminBroadcastDetailDeleted: t.adminBroadcastDetailDeleted,
            }}
          />
          </Suspense>
        ) : null}

        {activeSection === "home" && !isAuthenticated ? (
          <section className="mx-auto min-w-0 max-w-6xl px-6 pt-16 pb-4">
          <div className="grid min-w-0 grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            <div className="min-w-0">
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
                <a
                  href="/about"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveSection("about");
                    window.history.pushState({}, "", "/about");
                  }}
                  className="text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {t.footerAbout}
                </a>
                <a
                  href="/terms"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveSection("terms");
                    window.history.pushState({}, "", "/terms");
                  }}
                  className="text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {t.footerTerms}
                </a>
              </div>
            </div>
            <div className="relative min-w-0 flex justify-center lg:justify-end">
              <div
                className="w-full max-w-full overflow-hidden rounded-2xl border shadow-2xl transition-shadow duration-300 hover:shadow-xl sm:max-w-xl"
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
          <section id="landing-carousel" className="w-full min-w-0 max-w-full overflow-x-hidden border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
            <div className="w-full min-w-0 max-w-full">
              <div className="relative w-full min-w-0 overflow-hidden border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900" style={{ minHeight: "420px" }}>
                {/* Carousel slides - order: 1 Privacidade, 2 Categories and Tags, 3 Analysis, 4 Os seus dados */}
                <div
                  className="flex w-full transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(-${landingCarouselIndex * 100}%)` }}
                >
                  {/* Slide 1: Privacidade por design */}
                  <div className="min-w-full shrink-0 max-w-full px-6 py-8 md:px-10 md:py-10" style={{ width: "100%" }}>
                    <h2 className="text-center text-xl font-bold text-slate-900 dark:text-slate-100 md:text-2xl">
                      {t.privacyHighlightsTitle}
                    </h2>
                    <div className="mx-auto mt-8 grid min-w-0 max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="flex min-w-0 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" aria-hidden>
                          <i className="fa-solid fa-shield-halved text-sm"></i>
                        </span>
                        <p className="min-w-0 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.privacyHighlight1}</p>
                      </div>
                      <div className="flex min-w-0 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" aria-hidden>
                          <i className="fa-solid fa-lock text-sm"></i>
                        </span>
                        <p className="min-w-0 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.privacyHighlight2}</p>
                      </div>
                      <div className="flex min-w-0 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" aria-hidden>
                          <i className="fa-solid fa-certificate text-sm"></i>
                        </span>
                        <p className="min-w-0 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.privacyHighlight3}</p>
                      </div>
                      <div className="flex min-w-0 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" aria-hidden>
                          <i className="fa-solid fa-key text-sm"></i>
                        </span>
                        <p className="min-w-0 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.privacyHighlight4}</p>
                      </div>
                      <div className="flex min-w-0 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" aria-hidden>
                          <i className="fa-solid fa-server text-sm"></i>
                        </span>
                        <p className="min-w-0 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.privacyHighlight5}</p>
                      </div>
                      <div className="flex min-w-0 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" aria-hidden>
                          <i className="fa-brands fa-github text-sm"></i>
                        </span>
                        <p className="min-w-0 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.privacyHighlight6}</p>
                      </div>
                    </div>
                  </div>

                  {/* Slide 2: Funcionalidades (2 cards) */}
                  <div className="min-w-full shrink-0 max-w-full px-6 py-8 md:px-10 md:py-10" style={{ width: "100%" }}>
                    <h2 className="text-center text-xl font-bold text-slate-900 dark:text-slate-100 md:text-2xl">
                      {t.landingFeaturesSectionTitle}
                    </h2>
                    <div className="mx-auto mt-8 grid min-w-0 max-w-3xl gap-4 sm:grid-cols-2">
                      <div className="flex min-w-0 flex-col overflow-visible rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <div
                          className="group relative h-44 w-full min-w-0 shrink-0 cursor-zoom-in overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
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
                        <p className="mt-1 min-w-0 flex-1 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.featureCategoriesBody}</p>
                      </div>
                      <div className="flex min-w-0 flex-col overflow-visible rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <div
                          className="group relative h-44 w-full min-w-0 shrink-0 cursor-zoom-in overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
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
                        <p className="mt-1 min-w-0 flex-1 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.featureTagsBody ?? "Assign multiple tags per transaction."}</p>
                      </div>
                    </div>
                  </div>

                  {/* Slide 3: Analysis (3 cards: Bancos, Análises claras, Vista de calendário) */}
                  <div className="min-w-full shrink-0 max-w-full px-6 py-8 md:px-10 md:py-10" style={{ width: "100%" }}>
                    <h2 className="text-center text-xl font-bold text-slate-900 dark:text-slate-100 md:text-2xl">
                      {t.landingFeaturesAnalysisTitle ?? "Analysis"}
                    </h2>
                    <div className="mx-auto mt-8 grid min-w-0 max-w-4xl gap-4 sm:grid-cols-3">
                      <div className="flex min-w-0 flex-col overflow-visible rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <div
                          className="group relative h-44 w-full min-w-0 shrink-0 cursor-zoom-in overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
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
                        <p className="mt-1 min-w-0 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.featureAccountsBody}</p>
                      </div>
                      <div className="flex min-w-0 flex-col overflow-visible rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <div
                          className="group relative h-44 w-full min-w-0 shrink-0 cursor-zoom-in overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
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
                        <p className="mt-1 min-w-0 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                          {(t.featureInsightsBodyBullets ?? t.featureInsightsBody).split("\n").filter((line) => line.trim()).join(" ")}
                        </p>
                      </div>
                      <div className="flex min-w-0 flex-col overflow-visible rounded-lg border border-slate-200 bg-slate-50 p-4 ring-2 ring-blue-500/50 dark:border-slate-700 dark:bg-slate-800/50 dark:ring-blue-400/50">
                        <div
                          className="group relative h-44 w-full min-w-0 shrink-0 cursor-zoom-in overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
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
                        <p className="mt-1 min-w-0 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.featureCalendarBody}</p>
                      </div>
                    </div>
                  </div>

                  {/* Slide 4: Os seus dados, a sua escolha */}
                  <div className="min-w-full shrink-0 max-w-full px-6 py-8 md:px-10 md:py-10" style={{ width: "100%" }}>
                    <h2 className="text-center text-xl font-bold text-slate-900 dark:text-slate-100 md:text-2xl">
                      {t.landingStorageTitle}
                    </h2>
                    <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {t.landingStorageSubtitle}
                    </p>
                    <div className="mx-auto mt-8 grid min-w-0 max-w-3xl gap-4 sm:grid-cols-2">
                      <div className="flex min-w-0 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" aria-hidden>
                          <i className="fa-solid fa-cloud-arrow-up text-sm"></i>
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t.landingStorageCloudTitle}</h3>
                          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.landingStorageCloudBody}</p>
                        </div>
                      </div>
                      <div className="flex min-w-0 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" aria-hidden>
                          <i className="fa-solid fa-laptop text-sm"></i>
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t.landingStorageLocalTitle}</h3>
                          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.landingStorageLocalBody}</p>
                        </div>
                      </div>
                      <div className="flex min-w-0 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" aria-hidden>
                          <i className="fa-solid fa-lock text-sm"></i>
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t.landingStorageEncryptionTitle}</h3>
                          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.landingStorageEncryptionBody}</p>
                        </div>
                      </div>
                      <div className="flex min-w-0 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" aria-hidden>
                          <i className="fa-solid fa-database text-sm"></i>
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t.landingStorageDataTitle}</h3>
                          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t.landingStorageDataBody}</p>
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

      <footer
        className={`fixed bottom-0 left-0 right-0 w-full border-t border-slate-200 bg-slate-50 transition-transform duration-300 ease-out dark:border-slate-800 dark:bg-slate-900 ${bottomBarVisible ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="mx-auto flex min-w-0 max-w-6xl flex-row items-center justify-between gap-x-4 px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
            <span className="whitespace-nowrap">{t.footerCopyright}</span>
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                setActiveSection("privacy");
                window.history.pushState({}, "", "/privacy");
              }}
              className="whitespace-nowrap hover:text-blue-600 dark:hover:text-blue-400"
            >
              {t.footerPrivacy}
            </a>
            <a
              href="/about"
              onClick={(e) => {
                e.preventDefault();
                setActiveSection("about");
                window.history.pushState({}, "", "/about");
              }}
              className="whitespace-nowrap hover:text-blue-600 dark:hover:text-blue-400"
            >
              {t.footerAbout}
            </a>
            <a
              href="/terms"
              onClick={(e) => {
                e.preventDefault();
                setActiveSection("terms");
                window.history.pushState({}, "", "/terms");
              }}
              className="whitespace-nowrap hover:text-blue-600 dark:hover:text-blue-400"
            >
              {t.footerTerms}
            </a>
            <span className="whitespace-nowrap text-xs opacity-80">{t.footerMadeInPortugal}</span>
          </div>
          <div className="flex shrink-0 gap-4 pl-2">
            <a href="https://github.com/kal001/eurodata-public" target="_blank" rel="noopener noreferrer" aria-label={t.footerGithub} className="hover:text-blue-600">
              <i className="fa-brands fa-github"></i>
            </a>
            <a href="#" aria-label={t.footerLinkedin} className="hover:text-blue-600">
              <i className="fa-brands fa-linkedin"></i>
            </a>
          </div>
        </div>
      </footer>

      {/* Onboarding wizard - floating lower left when user has needs_onboarding or opened from Profile icon */}
      {isAuthenticated && profile && ((profile.needs_onboarding && !wizardDismissed) || showWizardFromProfile) && (
        <OnboardingWizard
          steps={[
            { id: "country", label: t.wizardStepCountry },
            { id: "channels", label: t.wizardStepChannels },
            { id: "alerts", label: t.wizardStepAlerts },
            { id: "storage", label: t.wizardStepStorage },
            { id: "categories", label: t.wizardStepCategories },
            { id: "tags", label: t.wizardStepTags },
            { id: "account", label: t.wizardStepAccount },
          ]}
          completedSteps={onboardingWizardCompletedSteps}
          onStepNavigate={handleOnboardingWizardStepNavigate}
          onStepToggle={handleOnboardingWizardStepToggle}
          onDismiss={handleOnboardingWizardDismiss}
          minimized={onboardingWizardMinimized}
          onMinimizeChange={setOnboardingWizardMinimized}
          t={{
            wizardTitle: t.wizardTitle,
            wizardClose: t.wizardClose,
            wizardMinimize: t.wizardMinimize,
            wizardExpand: t.wizardExpand,
          }}
        />
      )}

      {/* Account limit modal — shown when user tries to add an automatic account beyond their limit */}
      {accountLimitModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setAccountLimitModalOpen(false); }}
        >
          <div
            className="w-full max-w-sm rounded-xl shadow-xl p-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h2 className="text-base font-semibold" style={{ color: "var(--text)" }}>
                {t.accountLimitTitle ?? "Automatic account limit reached"}
              </h2>
              <button
                type="button"
                className="p-1.5 rounded-md border transition-colors shrink-0 -mt-0.5"
                style={{ borderColor: "var(--border)", background: "var(--surface-hover)", color: "var(--text-secondary)" }}
                title={t.modalCancel}
                aria-label={t.modalCancel}
                onClick={() => setAccountLimitModalOpen(false)}
              >
                <i className="fa-solid fa-xmark text-sm" aria-hidden />
              </button>
            </div>
            <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
              {formattedSlotPrice
                ? t.accountLimitBody?.replace(/0[.,]75\s*€/g, formattedSlotPrice) ?? `Your plan includes 2 automatic accounts. Each additional account costs ${formattedSlotPrice}/month and is billed through your existing subscription.`
                : (t.accountLimitBody ?? "Your plan includes 2 automatic accounts. Each additional account costs 0.75€/month and is billed through your existing subscription.")}
            </p>
            {profile?.current_automatic_accounts !== undefined && profile?.allowed_automatic_accounts !== undefined && (
              <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
                {t.automaticAccountsLabel ?? "Automatic accounts"}: {profile.current_automatic_accounts} / {profile.allowed_automatic_accounts}
              </p>
            )}
            {profile?.subscription_status !== "active" ? (
              <div>
                <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                  {t.accountLimitSubscribeFirst ?? "Subscribe to get more automatic account slots."}
                </p>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-colors disabled:opacity-60"
                    style={{ borderColor: "var(--border)", background: "var(--surface-hover)", color: "var(--text)" }}
                    disabled={subscriptionCheckoutLoading}
                    title={t.subscriptionSubscribe ?? "Subscribe"}
                    aria-label={t.subscriptionSubscribe ?? "Subscribe"}
                    onClick={async () => {
                      if (!apiToken || !apiBase) return;
                      setSubscriptionCheckoutLoading(true);
                      try {
                        const res = await fetch(`${apiBase}/api/me/subscription/checkout`, {
                          method: "POST",
                          headers: { Authorization: `Bearer ${apiToken}` },
                        });
                        const data = await res.json();
                        if (data?.url) window.location.href = data.url;
                        else showToast(data?.detail ?? "Checkout failed", "error");
                      } finally {
                        setSubscriptionCheckoutLoading(false);
                      }
                    }}
                  >
                    <i className={`fa-solid ${subscriptionCheckoutLoading ? "fa-spinner fa-spin" : "fa-credit-card"} text-sm`} aria-hidden />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-colors disabled:opacity-60"
                  style={{ borderColor: "var(--border)", background: "var(--surface-hover)", color: "var(--text)" }}
                  disabled={accountSlotLoading}
                  title={formattedSlotPrice
                    ? `${t.accountLimitConfirm ?? "Add account"} · ${formattedSlotPrice}/${t.perMonth}`
                    : (t.accountLimitConfirm ?? "Add account")}
                  aria-label={formattedSlotPrice
                    ? `${t.accountLimitConfirm ?? "Add account"} · ${formattedSlotPrice}/${t.perMonth}`
                    : (t.accountLimitConfirm ?? "Add account")}
                  onClick={async () => {
                    if (!apiToken || !apiBase) return;
                    setAccountSlotLoading(true);
                    try {
                      const res = await fetch(`${apiBase}/api/me/subscription/account-slot`, {
                        method: "POST",
                        headers: { Authorization: `Bearer ${apiToken}` },
                      });
                      if (res.ok) {
                        setAccountLimitModalOpen(false);
                        const meRes = await fetch(`${apiBase}/api/me`, { headers: { Authorization: `Bearer ${apiToken}` } });
                        if (meRes.ok) setProfile(await meRes.json());
                        showToast(t.accountSlotAdded ?? "Account slot added. You can now connect another bank.", "success");
                      } else {
                        const err = await res.json().catch(() => ({}));
                        showToast(err?.detail ?? "Could not add account slot.", "error");
                      }
                    } finally {
                      setAccountSlotLoading(false);
                    }
                  }}
                >
                  <i className={`fa-solid ${accountSlotLoading ? "fa-spinner fa-spin" : "fa-plus"} text-sm`} aria-hidden />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Remove slot modal — confirm reducing extra automatic account slots */}
      {removeSlotModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setRemoveSlotModalOpen(false); }}
        >
          <div
            className="w-full max-w-sm rounded-xl shadow-xl p-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h2 className="text-base font-semibold" style={{ color: "var(--text)" }}>
                {t.removeSlotTitle ?? "Reduce automatic accounts"}
              </h2>
              <button
                type="button"
                className="p-1.5 rounded-md border transition-colors shrink-0 -mt-0.5"
                style={{ borderColor: "var(--border)", background: "var(--surface-hover)", color: "var(--text-secondary)" }}
                title={t.modalCancel}
                aria-label={t.modalCancel}
                onClick={() => setRemoveSlotModalOpen(false)}
              >
                <i className="fa-solid fa-xmark text-sm" aria-hidden />
              </button>
            </div>
            {profile?.current_automatic_accounts !== undefined && profile?.allowed_automatic_accounts !== undefined && (
              <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
                {t.automaticAccountsLabel ?? "Automatic accounts"}: {profile.current_automatic_accounts} / {profile.allowed_automatic_accounts}
              </p>
            )}
            {/* Show warning only when reducing would leave the user over the new limit */}
            {(profile?.current_automatic_accounts ?? 0) > (profile?.allowed_automatic_accounts ?? 0) - 1 && (
              <p className="text-sm mb-4 p-3 rounded-lg" style={{ background: "var(--surface-hover)", color: "var(--text-secondary)" }}>
                <i className="fa-solid fa-triangle-exclamation mr-1.5" aria-hidden />
                {t.removeSlotWarningBody ?? "You will have more connected automatic accounts than available slots. Until you disconnect the excess accounts, automatic transaction and balance fetches will stop and you won't be able to add new automatic accounts."}
              </p>
            )}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-colors disabled:opacity-60"
                style={{ borderColor: "var(--border)", background: "var(--surface-hover)", color: "var(--text)" }}
                disabled={removeSlotLoading}
                title={t.removeSlotConfirm ?? "Confirm"}
                aria-label={t.removeSlotConfirm ?? "Confirm"}
                onClick={async () => {
                  if (!apiToken || !apiBase) return;
                  setRemoveSlotLoading(true);
                  try {
                    const res = await fetch(`${apiBase}/api/me/subscription/account-slot`, {
                      method: "DELETE",
                      headers: { Authorization: `Bearer ${apiToken}` },
                    });
                    if (res.ok) {
                      setRemoveSlotModalOpen(false);
                      const meRes = await fetch(`${apiBase}/api/me`, { headers: { Authorization: `Bearer ${apiToken}` } });
                      if (meRes.ok) setProfile(await meRes.json());
                      showToast(t.removeSlotRemoved ?? "Automatic account slot removed.", "success");
                    } else {
                      const err = await res.json().catch(() => ({}));
                      showToast(err?.detail ?? "Could not remove account slot.", "error");
                    }
                  } finally {
                    setRemoveSlotLoading(false);
                  }
                }}
              >
                <i className={`fa-solid ${removeSlotLoading ? "fa-spinner fa-spin" : "fa-check"} text-sm`} aria-hidden />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating "To top" - authenticated sections + public long pages (terms, about, privacy) */}
      {showToTopButton && (isAuthenticated && !profile?.needs_onboarding || activeSection === "terms" || activeSection === "about" || activeSection === "privacy") && (
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
