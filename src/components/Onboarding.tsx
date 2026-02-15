import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAccountColor } from "../utils/accountColors";

type Bank = {
  id: string;
  name: string;
  logo?: string;
  country?: string;
};

type Account = {
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
  needs_reauth?: boolean;
  alert_above_amount?: number | null;
  alert_below_amount?: number | null;
  current_balance?: number | null;
  balance_currency?: string | null;
  balance_updated_at?: string | null;
};

/** Recurring transaction pattern (B012) - replaces TransactionAlertTemplate */
type RecurringTransaction = {
  id: number;
  bank_account_id: number;
  name: string;
  description_pattern: string | null;
  frequency: string;
  interval: number;
  anchor_day: number;
  day_tolerance_before: number;
  day_tolerance_after: number;
  expected_amount: string | null;
  amount_tolerance_below: string;
  amount_tolerance_above: string;
  alert_on_occurrence: boolean;
  alert_on_missing: boolean;
  missing_grace_days: number;
  status: string;
  detection_method: string;
  confidence: number | null;
  next_expected_date: string | null;
  created_at: string;
  updated_at: string;
};

type Props = {
  onComplete: () => void;
  onFetchComplete?: () => void;
  apiBase: string;
  token: string;
  showBalances?: boolean;
  t: {
    onboardingTitle: string;
    onboardingBody: string;
    onboardingCta: string;
    onboardingCountry: string;
    onboardingSearch: string;
    onboardingSelectBank: string;
    onboardingAddAccount: string;
    onboardingAccountsTitle: string;
    onboardingRequired: string;
    languageCode: "en" | "pt" | "es" | "fr";
    onboardingConnectBank: string;
    onboardingCompleting: string;
    onboardingFriendlyNameSave: string;
    accountAlertsTitle: string;
    accountAlertAbove: string;
    accountAlertBelow: string;
    actionEditAlerts: string;
    actionReconnectBank: string;
    actionReauthRequired: string;
    actionFetchTransactions: string;
    actionDeleteAccount: string;
    accountTransactionAlerts: string;
    alertTemplateDay: string;
    alertTemplateAmount: string;
    alertTemplateDelete: string;
    deleteConfirm: string;
    recurringAmountVaries: string;
    alertTemplateDays: string;
    modalCancel: string;
    modalConfirm: string;
    confirmDeleteAccount: string;
    confirmDeleteAccountWarning: string;
    profileSaved: string;
    profileSaveError: string;
    fetchInProgressMessage: string;
    fetchCompleted: string;
    fetchFailed: string;
    transactionsLimitReached: string;
    gocardlessRateLimitExceeded: string;
    importStatementTitle?: string;
    importStatementDrop?: string;
    importStatementSelectFiles?: string;
    importStatementParsing?: string;
    importStatementAnalyse?: string;
    importStatementParseFailed?: string;
    importStatementFileSingular?: string;
    importStatementFilePlural?: string;
    importStatementParsed?: string;
    importStatementTotalTransactions?: string;
    importToAccount?: string;
    importSuccess?: string;
    importFailed?: string;
    createNewAccount?: string;
    assignToExisting?: string;
    statementBankName?: string;
    statementAccountName?: string;
    statementDisplayName?: string;
    statementCountry?: string;
    selectBankForLogo?: string;
    pickBankFromList?: string;
    accountSourceManual?: string;
    accountSourceAutomatic?: string;
    importReviewTitle?: string;
    importReviewBack?: string;
    importReviewImport?: string;
    importReviewFlipSign?: string;
    importReviewFileLabel?: string;
    importReviewInclude?: string;
    importReviewExclude?: string;
  };
};

function flipAmount(amount: string | undefined): string {
  if (amount == null || amount === "") return amount ?? "";
  const n = parseFloat(String(amount).replace(/\s/g, ""));
  if (Number.isNaN(n)) return amount;
  const flipped = -n;
  if (Number.isInteger(flipped)) return String(flipped);
  return flipped.toFixed(2);
}

const countries = [
  { code: "PT", names: { en: "Portugal", pt: "Portugal", es: "Portugal", fr: "Portugal" } },
  { code: "ES", names: { en: "Spain", pt: "Espanha", es: "España", fr: "Espagne" } },
  { code: "FR", names: { en: "France", pt: "França", es: "Francia", fr: "France" } },
  { code: "DE", names: { en: "Germany", pt: "Alemanha", es: "Alemania", fr: "Allemagne" } },
  { code: "IT", names: { en: "Italy", pt: "Itália", es: "Italia", fr: "Italie" } },
  { code: "NL", names: { en: "Netherlands", pt: "Países Baixos", es: "Países Bajos", fr: "Pays-Bas" } },
  { code: "BE", names: { en: "Belgium", pt: "Bélgica", es: "Bélgica", fr: "Belgique" } },
  { code: "LU", names: { en: "Luxembourg", pt: "Luxemburgo", es: "Luxemburgo", fr: "Luxembourg" } },
  { code: "IE", names: { en: "Ireland", pt: "Irlanda", es: "Irlanda", fr: "Irlande" } },
];

export default function Onboarding({ onComplete, onFetchComplete, t, apiBase, token, showBalances = true }: Props) {
  const [country, setCountry] = useState("PT");
  const [banks, setBanks] = useState<Bank[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [friendlyNames, setFriendlyNames] = useState<Record<number, string>>({});
  const [search, setSearch] = useState("");
  const [banksLoading, setBanksLoading] = useState(false);
  const [fetchInProgressConnectionId, setFetchInProgressConnectionId] = useState<number | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [alertsModal, setAlertsModal] = useState<{
    open: boolean;
    accountId: number | null;
    accountLabel: string;
    alert_above_amount: string;
    alert_below_amount: string;
    transactionAlerts: RecurringTransaction[];
  }>({
    open: false,
    accountId: null,
    accountLabel: "",
    alert_above_amount: "0",
    alert_below_amount: "-100",
    transactionAlerts: [],
  });
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [deleteAlertRecurringId, setDeleteAlertRecurringId] = useState<number | null>(null);
  const [deleteAccountModal, setDeleteAccountModal] = useState<{
    open: boolean;
    accountId: number | null;
    accountLabel: string;
  }>({ open: false, accountId: null, accountLabel: "" });
  const [pdfImportOpen, setPdfImportOpen] = useState(false);
  const [pdfImportPreSelectAccountId, setPdfImportPreSelectAccountId] = useState<number | null>(null);
  const [pdfImportFiles, setPdfImportFiles] = useState<File[]>([]);
  const [pdfImportParsed, setPdfImportParsed] = useState<Array<{ bank_info: Record<string, unknown>; transactions: unknown[] }>>([]);
  const [pdfImportMatch, setPdfImportMatch] = useState<{ match: string; account_id: number | null; candidates: Array<{ id: number; friendly_name: string; institution_name: string }> } | null>(null);
  const [pdfImportTargetAccountId, setPdfImportTargetAccountId] = useState<number | null>(null);
  const [pdfImportWizardMode, setPdfImportWizardMode] = useState<"create" | "assign" | null>(null);
  const [pdfImportCreateForm, setPdfImportCreateForm] = useState({ institution_name: "", account_name: "", display_name: "", country: "PT", institution_id: "", logo_url: "" as string | null });
  const [pdfImportReviewOpen, setPdfImportReviewOpen] = useState(false);
  const [pdfImportReviewTransactions, setPdfImportReviewTransactions] = useState<Array<{ bank_info: Record<string, unknown>; transactions: Array<Record<string, unknown>> }>>([]);
  const [pdfImportReviewAction, setPdfImportReviewAction] = useState<"to_account" | "create" | "assign">("to_account");
  const [pdfImportReviewTargetId, setPdfImportReviewTargetId] = useState<number | null>(null);
  const [pdfImportLoading, setPdfImportLoading] = useState(false);
  const [pdfImportError, setPdfImportError] = useState<string | null>(null);
  const [logoEditAccountId, setLogoEditAccountId] = useState<number | null>(null);
  const [logoEditUrl, setLogoEditUrl] = useState("");
  const [logoEditInstitutionName, setLogoEditInstitutionName] = useState("");
  const [logoEditSelectedBankId, setLogoEditSelectedBankId] = useState("");
  const [logoEditBanks, setLogoEditBanks] = useState<Bank[]>([]);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isManualAccount = (account: Account) => account.account_source === "manual" || (account.bank_connection_id == null && account.account_source !== "nordigen");

  const openPdfImportReview = (action: "to_account" | "create" | "assign", targetId: number | null) => {
    setPdfImportReviewTransactions(
      pdfImportParsed.map((f) => ({
        bank_info: { ...(f.bank_info || {}) },
        transactions: (f.transactions || []).map((t) => {
          const rec = typeof t === "object" && t != null ? (t as Record<string, unknown>) : {};
          return { date: rec.date, amount: String(rec.amount ?? ""), description: rec.description, currency: rec.currency, include: true };
        }),
      }))
    );
    setPdfImportReviewAction(action);
    setPdfImportReviewTargetId(targetId);
    setPdfImportError("");
    setPdfImportReviewOpen(true);
  };

  const setReviewTransactionInclude = (fileIdx: number, txIdx: number, include: boolean) => {
    setPdfImportReviewTransactions((prev) =>
      prev.map((f, i) =>
        i === fileIdx
          ? { ...f, transactions: f.transactions.map((t, j) => (j === txIdx ? { ...t, include } : t)) }
          : f
      )
    );
  };

  const flipReviewTransactionSign = (fileIdx: number, txIdx: number) => {
    setPdfImportReviewTransactions((prev) => {
      const next = prev.map((f, i) =>
        i === fileIdx
          ? {
              ...f,
              transactions: f.transactions.map((t, j) =>
                j === txIdx ? { ...t, amount: flipAmount(String(t.amount ?? "")) } : t
              ),
            }
          : f
      );
      return next;
    });
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape" && e.key !== "Esc") return;
      if (deleteAlertRecurringId != null) {
        setDeleteAlertRecurringId(null);
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (pdfImportReviewOpen) {
        setPdfImportReviewOpen(false);
        e.preventDefault();
      } else if (pdfImportOpen) {
        setPdfImportOpen(false);
        setPdfImportPreSelectAccountId(null);
        e.preventDefault();
      } else if (logoEditAccountId != null) {
        setLogoEditAccountId(null);
        setLogoEditUrl("");
        setLogoEditInstitutionName("");
        setLogoEditSelectedBankId("");
        e.preventDefault();
      }
    };
    document.documentElement.addEventListener("keydown", onKeyDown, true);
    return () => document.documentElement.removeEventListener("keydown", onKeyDown, true);
  }, [deleteAlertRecurringId, pdfImportReviewOpen, pdfImportOpen, logoEditAccountId]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!alertsModal.open) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Esc") {
        setAlertsModal({
          open: false,
          accountId: null,
          accountLabel: "",
          alert_above_amount: "0",
          alert_below_amount: "-100",
          transactionAlerts: [],
        });
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.documentElement.addEventListener("keydown", onEscape, true);
    return () => document.documentElement.removeEventListener("keydown", onEscape, true);
  }, [alertsModal.open]);

  const filteredBanks = useMemo(() => {
    if (!search) return banks;
    return banks.filter((bank) =>
      bank.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [banks, search]);

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" }),
    [token]
  );

  const fetchAccounts = useCallback(async () => {
    const response = await fetch(`${apiBase}/api/accounts?_t=${Date.now()}`, {
      headers,
      cache: "no-store",
    });
    if (response.ok) {
      setAccounts(await response.json());
    }
  }, [apiBase, headers]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    if (accounts.length === 0) {
      setFriendlyNames({});
      return;
    }
    setFriendlyNames((prev) => {
      const next = { ...prev };
      accounts.forEach((account) => {
        if (!next[account.id]) {
          next[account.id] = account.friendly_name ?? account.institution_name;
        }
      });
      return next;
    });
  }, [accounts]);

  useEffect(() => {
    if (logoEditAccountId == null) {
      setLogoEditBanks([]);
      setLogoEditInstitutionName("");
      setLogoEditSelectedBankId("");
      return;
    }
    const account = accounts.find((a) => a.id === logoEditAccountId);
    const accCountry = account?.country || "PT";
    const instName = account?.institution_name?.trim() || "";
    fetch(`${apiBase}/api/banks?country=${accCountry}`, { headers })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Bank[]) => {
        const list = Array.isArray(data) ? data : [];
        setLogoEditBanks(list);
        if (instName && list.length > 0) {
          const match = list.find((b) => (b.name || "").trim() === instName || (b.name || "").toLowerCase().includes(instName.toLowerCase()));
          if (match) {
            setLogoEditSelectedBankId(match.id);
            setLogoEditInstitutionName(match.name || instName);
            if (match.logo) setLogoEditUrl(match.logo);
          } else {
            setLogoEditSelectedBankId("");
          }
        } else {
          setLogoEditSelectedBankId("");
        }
      })
      .catch(() => setLogoEditBanks([]));
  }, [logoEditAccountId, accounts, apiBase]);

  useEffect(() => {
    const loadBanks = async () => {
      setBanksLoading(true);
      const response = await fetch(`${apiBase}/api/banks?country=${country}`, {
        headers,
      });
      if (response.ok) {
        const data = await response.json();
        setBanks(
          data.map((item: Bank) => ({
            id: item.id,
            name: item.name,
            logo: item.logo,
          }))
        );
      } else if (response.status === 429) {
        setToast({ text: t.gocardlessRateLimitExceeded, type: "warning" });
      }
      setBanksLoading(false);
    };
    loadBanks();
  }, [apiBase, country, headers]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference =
      params.get("reference") ??
      params.get("ref") ??
      window.localStorage.getItem("pf_bank_reference");
    if (!reference) return;
    const complete = async () => {
      const completeRes = await fetch(`${apiBase}/api/banks/requisition/complete?reference=${reference}`, {
        method: "POST",
        headers,
      });
      if (completeRes.status === 429) {
        setToast({ text: t.gocardlessRateLimitExceeded, type: "warning" });
      }
      await fetchAccounts();
      window.localStorage.removeItem("pf_bank_reference");
      params.delete("reference");
      params.delete("ref");
      const query = params.toString();
      const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    };
    complete();
  }, [apiBase, fetchAccounts, headers]);

  const startConnection = async (bank: Bank) => {
    if (isRedirecting) return;
    const response = await fetch(`${apiBase}/api/banks/requisition`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        institution_id: bank.id,
        institution_name: bank.name,
        country,
        logo_url: bank.logo,
        language: t.languageCode?.toUpperCase(),
      }),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.link) {
        setIsRedirecting(true);
        window.location.href = data.link;
      }
    } else if (response.status === 429) {
      setToast({ text: t.gocardlessRateLimitExceeded, type: "warning" });
    }
  };

  const loadRecurringTransactions = async (accountId: number): Promise<RecurringTransaction[]> => {
    const response = await fetch(`${apiBase}/api/accounts/${accountId}/recurring-transactions`, { headers });
    if (response.ok) {
      return await response.json();
    }
    return [];
  };

  const saveAccountAlerts = async () => {
    if (alertsModal.accountId == null) return;
    const above = parseFloat(alertsModal.alert_above_amount);
    const below = parseFloat(alertsModal.alert_below_amount);
    if (Number.isNaN(above) || Number.isNaN(below)) return;
    const response = await fetch(`${apiBase}/api/accounts/${alertsModal.accountId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ alert_above_amount: above, alert_below_amount: below }),
    });
    if (response.ok) {
      await fetchAccounts();
      setToast({ text: t.profileSaved, type: "success" });
      setAlertsModal({
        open: false,
        accountId: null,
        accountLabel: "",
        alert_above_amount: "0",
        alert_below_amount: "-100",
        transactionAlerts: [],
      });
    } else {
      setToast({ text: t.profileSaveError, type: "error" });
    }
  };

  const deleteRecurringTransaction = async (recurringId: number) => {
    const response = await fetch(`${apiBase}/api/recurring-transactions/${recurringId}`, {
      method: "DELETE",
      headers,
    });

    if (response.ok) {
      if (alertsModal.accountId) {
        const list = await loadRecurringTransactions(alertsModal.accountId);
        setAlertsModal((prev) => ({ ...prev, transactionAlerts: list }));
      }
      setToast({ text: t.profileSaved, type: "success" });
    } else {
      setToast({ text: t.profileSaveError, type: "error" });
    }
  };

  const reconnectBank = async (account: Account) => {
    if (isRedirecting) return;
    if (!account.bank_connection_id) {
      setToast({ text: t.profileSaveError, type: "error" });
      return;
    }

    const response = await fetch(`${apiBase}/api/banks/connections/${account.bank_connection_id}/reconnect`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        language: t.languageCode?.toUpperCase(),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.link) {
        setIsRedirecting(true);
        window.location.href = data.link;
      }
    } else if (response.status === 429) {
      setToast({ text: t.gocardlessRateLimitExceeded, type: "warning" });
    } else {
      setToast({ text: t.profileSaveError, type: "error" });
    }
  };

  const fetchTransactions = async (account: Account) => {
    if (!account.bank_connection_id) {
      setToast({ text: t.profileSaveError, type: "error" });
      return;
    }
    const connectionId = account.bank_connection_id;
    if (fetchInProgressConnectionId !== null) return;

    const response = await fetch(
      `${apiBase}/api/banks/connections/${connectionId}/transactions/fetch`,
      { method: "POST", headers }
    );

    if (response.status === 202) {
      setFetchInProgressConnectionId(connectionId);
      setToast({ text: t.fetchInProgressMessage, type: "success" });

      const poll = async () => {
        const statusRes = await fetch(
          `${apiBase}/api/banks/connections/${connectionId}/transactions/status`,
          { headers }
        );
        if (!statusRes.ok) return;
        const data = await statusRes.json();
        if (data.status === "completed") {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setFetchInProgressConnectionId(null);
          await fetchAccounts();
          setToast({ text: t.fetchCompleted, type: "success" });
          onFetchComplete?.();
        } else if (data.status === "failed") {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setFetchInProgressConnectionId(null);
          setToast({ text: t.fetchFailed, type: "error" });
        } else if (data.status === "rate_limited") {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setFetchInProgressConnectionId(null);
          setToast({ text: t.gocardlessRateLimitExceeded, type: "warning" });
        }
      };

      pollIntervalRef.current = setInterval(poll, 2500);
      poll();
    } else if (response.status === 429) {
      setToast({ text: t.gocardlessRateLimitExceeded, type: "warning" });
    } else {
      setToast({ text: t.profileSaveError, type: "error" });
    }
  };

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      {toast ? (
        <div className={`toast ${toast.type} mb-4`}>{toast.text}</div>
      ) : null}
      {alertsModal.open ? (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="card-title">{t.accountAlertsTitle}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              {alertsModal.accountLabel}
            </p>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-sm">
                <span>{t.accountAlertAbove}</span>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={alertsModal.alert_above_amount}
                  onChange={(e) =>
                    setAlertsModal((prev) => ({ ...prev, alert_above_amount: e.target.value }))
                  }
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span>{t.accountAlertBelow}</span>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={alertsModal.alert_below_amount}
                  onChange={(e) =>
                    setAlertsModal((prev) => ({ ...prev, alert_below_amount: e.target.value }))
                  }
                />
              </label>

              {alertsModal.transactionAlerts.length > 0 && (
                <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-700">
                  <h4 className="text-sm font-semibold mb-3">{t.accountTransactionAlerts}</h4>
                  <div className="grid gap-2">
                    {alertsModal.transactionAlerts.map((rec) => (
                      <div
                        key={rec.id}
                        className="rounded border border-slate-200 p-2 text-xs dark:border-slate-700"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">
                              {rec.name || rec.description_pattern || t.accountTransactionAlerts}
                            </div>
                            <div className="text-slate-500 dark:text-slate-400">
                              {t.alertTemplateDay}: {rec.anchor_day} (±{Math.max(rec.day_tolerance_before ?? 1, rec.day_tolerance_after ?? 1, rec.missing_grace_days ?? 1)} {t.alertTemplateDays}) · {t.alertTemplateAmount}: {(rec.expected_amount ?? "").trim() ? `${rec.expected_amount} (±${rec.amount_tolerance_below ?? rec.amount_tolerance_above ?? "0"})` : t.recurringAmountVaries}
                              {rec.next_expected_date ? ` · Next: ${rec.next_expected_date}` : ""}
                            </div>
                          </div>
                          <button
                            className="icon-button shrink-0"
                            type="button"
                            title={t.alertTemplateDelete}
                            aria-label={t.alertTemplateDelete}
                            onClick={() => setDeleteAlertRecurringId(rec.id)}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
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
                    setAlertsModal({
                      open: false,
                      accountId: null,
                      accountLabel: "",
                      alert_above_amount: "0",
                      alert_below_amount: "-100",
                      transactionAlerts: [],
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
                  onClick={saveAccountAlerts}
                >
                  <i className="fa-solid fa-check" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {deleteAlertRecurringId != null ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-delete-alert-title"
          tabIndex={-1}
          onClick={() => setDeleteAlertRecurringId(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Esc") {
              e.preventDefault();
              e.stopPropagation();
              setDeleteAlertRecurringId(null);
            }
          }}
        >
          <div
            className="card max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="onboarding-delete-alert-title" className="card-title">
              {t.deleteConfirm}
            </h3>
            {(() => {
              const rec = alertsModal.transactionAlerts.find((r) => r.id === deleteAlertRecurringId);
              return rec ? (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 truncate" title={rec.name || rec.description_pattern || ""}>
                  {rec.name || rec.description_pattern || "—"}
                </p>
              ) : null;
            })()}
            <div className="flex justify-end gap-2 mt-6">
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
                onClick={() => setDeleteAlertRecurringId(null)}
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
                  if (deleteAlertRecurringId == null) return;
                  await deleteRecurringTransaction(deleteAlertRecurringId);
                  setDeleteAlertRecurringId(null);
                }}
              >
                <i className="fa-solid fa-check" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteAccountModal.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="card max-w-md w-full">
            <h3 className="card-title">{t.confirmDeleteAccount}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              {t.confirmDeleteAccountWarning}
            </p>
            {deleteAccountModal.accountLabel ? (
              <p className="mt-3 font-medium" style={{ color: getAccountColor(deleteAccountModal.accountId ?? 0) }}>
                {deleteAccountModal.accountLabel}
              </p>
            ) : null}
            <div className="flex justify-end gap-2 mt-6">
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
                onClick={() => setDeleteAccountModal({ open: false, accountId: null, accountLabel: "" })}
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
                  if (deleteAccountModal.accountId == null) return;
                  const response = await fetch(
                    `${apiBase}/api/accounts/${deleteAccountModal.accountId}`,
                    { method: "DELETE", headers }
                  );
                  if (response.ok) {
                    setAccounts((prev) =>
                      prev.filter((a) => a.id !== deleteAccountModal.accountId)
                    );
                    setDeleteAccountModal({ open: false, accountId: null, accountLabel: "" });
                  } else {
                    setToast({ text: "Failed to delete account", type: "error" });
                  }
                }}
              >
                <i className="fa-solid fa-check" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {pdfImportOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title m-0">{t.importStatementTitle ?? "Import statement (PDF)"}</h3>
              <button
                type="button"
                className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border"
                style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
                title={t.modalCancel ?? "Close"}
                aria-label={t.modalCancel ?? "Close"}
                onClick={() => {
                  setPdfImportOpen(false);
                  setPdfImportPreSelectAccountId(null);
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            {pdfImportError ? (
              <div className="mb-3 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-200">
                {pdfImportError}
              </div>
            ) : null}
            {pdfImportParsed.length === 0 ? (
              <>
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors"
                  style={{ borderColor: "var(--border)" }}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.background = "var(--surface-hover)"; }}
                  onDragLeave={(e) => { e.currentTarget.style.background = ""; }}
                  onDrop={(e) => {
                    e.preventDefault();
                    (e.currentTarget as HTMLElement).style.background = "";
                    const files = Array.from(e.dataTransfer.files).filter((f) => f.name.toLowerCase().endsWith(".pdf"));
                    setPdfImportFiles((prev) => [...prev, ...files]);
                  }}
                >
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t.importStatementDrop ?? "Drop PDF files here"}</p>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    multiple
                    className="hidden"
                    id="pdf-import-input"
                    onChange={(e) => {
                      const files = e.target.files ? Array.from(e.target.files) : [];
                      setPdfImportFiles((prev) => [...prev, ...files]);
                      e.target.value = "";
                    }}
                  />
                  <label
                    htmlFor="pdf-import-input"
                    className="bordered-icon-btn mt-3 inline-flex items-center justify-center border cursor-pointer"
                    style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--primary)" }}
                    title={t.importStatementSelectFiles ?? "Select files"}
                    aria-label={t.importStatementSelectFiles ?? "Select files"}
                  >
                    <i className="fa-solid fa-folder-open text-lg" />
                  </label>
                </div>
                {pdfImportFiles.length > 0 ? (
                  <div className="mt-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      {pdfImportFiles.length} {pdfImportFiles.length === 1 ? (t.importStatementFileSingular ?? "file") : (t.importStatementFilePlural ?? "files")}
                    </p>
                    <ul className="text-sm list-disc list-inside">
                      {pdfImportFiles.map((f, i) => (
                        <li key={i}>{f.name}</li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className="bordered-icon-btn mt-3 inline-flex items-center justify-center border disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--primary)" }}
                      disabled={pdfImportLoading}
                      title={pdfImportLoading ? (t.importStatementParsing ?? "Analysing...") : (t.importStatementAnalyse ?? "Analyse")}
                      aria-label={pdfImportLoading ? (t.importStatementParsing ?? "Analysing...") : (t.importStatementAnalyse ?? "Analyse")}
                      onClick={async () => {
                        setPdfImportError(null);
                        setPdfImportLoading(true);
                        try {
                          const parsed: Array<{ bank_info: Record<string, unknown>; transactions: unknown[] }> = [];
                          for (const file of pdfImportFiles) {
                            const form = new FormData();
                            form.append("file", file);
                            const r = await fetch(`${apiBase}/api/statements/parse`, {
                              method: "POST",
                              headers: { Authorization: `Bearer ${token}` },
                              body: form,
                            });
                            if (!r.ok) {
                              const err = await r.json().catch(() => ({}));
                              throw new Error(err.detail || r.statusText || (t.importStatementParseFailed ?? "Analysis failed"));
                            }
                            const data = await r.json();
                            parsed.push({ bank_info: data.bank_info || {}, transactions: data.transactions || [] });
                          }
                          setPdfImportParsed(parsed);
                          const first = parsed[0]?.bank_info as Record<string, unknown> | undefined;
                          if (first) {
                            const bank = (first.bank_name as string) || "";
                            const account = (first.account_number as string) || (first.iban as string) || "";
                            const country = ((first.country as string) || "PT").toUpperCase().slice(0, 2) || "PT";
                            const validCountry = ["PT", "ES", "FR", "DE", "IT", "NL", "BE", "LU", "IE"].includes(country) ? country : "PT";
                            setPdfImportCreateForm((f) => ({
                              ...f,
                              institution_name: bank || f.institution_name,
                              account_name: account || f.account_name,
                              country: validCountry,
                            }));
                          }
                          const firstBank = parsed[0]?.bank_info;
                          if (firstBank && Object.keys(firstBank).length > 0) {
                            const matchRes = await fetch(`${apiBase}/api/statements/match`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                              body: JSON.stringify({ bank_info: firstBank }),
                            });
                            if (matchRes.ok) {
                              const matchData = await matchRes.json();
                              setPdfImportMatch(matchData);
                              if (matchData.match === "one" && matchData.account_id) {
                                setPdfImportTargetAccountId(matchData.account_id);
                              } else if (pdfImportPreSelectAccountId) {
                                setPdfImportTargetAccountId(pdfImportPreSelectAccountId);
                              }
                            }
                          } else {
                            setPdfImportMatch({ match: "none", account_id: null, candidates: [] });
                            if (pdfImportPreSelectAccountId) setPdfImportTargetAccountId(pdfImportPreSelectAccountId);
                          }
                        } catch (err) {
                          setPdfImportError(err instanceof Error ? err.message : (t.importStatementParseFailed ?? "Analysis failed"));
                        } finally {
                          setPdfImportLoading(false);
                        }
                      }}
                    >
                      <i className={`fa-solid fa-magnifying-glass text-lg ${pdfImportLoading ? "fa-spin" : ""}`} />
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {pdfImportParsed.length} {pdfImportParsed.length === 1 ? (t.importStatementFileSingular ?? "file") : (t.importStatementFilePlural ?? "files")} {t.importStatementParsed ?? "parsed"}. {t.importStatementTotalTransactions ?? "Total transactions"}: {pdfImportParsed.reduce((n, p) => n + (p.transactions?.length ?? 0), 0)}
                </p>
                {pdfImportWizardMode === null ? (
                  <>
                    {pdfImportMatch?.match === "one" && pdfImportTargetAccountId ? (
                      <div className="mt-3">
                        <p className="text-sm">
                          {t.importToAccount ?? "Import to"}: {accounts.find((a) => a.id === pdfImportTargetAccountId)?.friendly_name ?? accounts.find((a) => a.id === pdfImportTargetAccountId)?.institution_name ?? `Account #${pdfImportTargetAccountId}`}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <button
                            type="button"
                            className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border"
                            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
                            title={t.modalCancel ?? "Cancel"}
                            aria-label={t.modalCancel ?? "Cancel"}
                            onClick={() => setPdfImportOpen(false)}
                          >
                            <i className="fa-solid fa-xmark" />
                          </button>
                          <button
                            type="button"
                            className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ borderColor: "var(--primary)", background: "var(--primary)", color: "var(--primary-contrast)" }}
                            title={t.importReviewTitle ?? "Review transactions"}
                            aria-label={t.importReviewTitle ?? "Review transactions"}
                            disabled={pdfImportLoading}
                            onClick={() => openPdfImportReview("to_account", pdfImportTargetAccountId)}
                          >
                            <i className="fa-solid fa-list-check" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border"
                          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
                          title={t.createNewAccount ?? "Create new account"}
                          aria-label={t.createNewAccount ?? "Create new account"}
                          onClick={() => {
                            const first = pdfImportParsed[0]?.bank_info as Record<string, unknown> | undefined;
                            if (first) {
                              const bank = (first.bank_name as string) || "";
                              const account = (first.account_number as string) || (first.iban as string) || "";
                              const country = ((first.country as string) || "PT").toUpperCase().slice(0, 2) || "PT";
                              setPdfImportCreateForm((f) => ({
                                ...f,
                                institution_name: bank || f.institution_name,
                                account_name: account || f.account_name,
                                country: country in { PT: 1, ES: 1, FR: 1, DE: 1, IT: 1, NL: 1, BE: 1, LU: 1, IE: 1 } ? country : "PT",
                              }));
                            }
                            setPdfImportWizardMode("create");
                          }}
                        >
                          <i className="fa-solid fa-plus" />
                        </button>
                        <button
                          type="button"
                          className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border"
                          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
                          title={t.assignToExisting ?? "Assign to existing account"}
                          aria-label={t.assignToExisting ?? "Assign to existing account"}
                          onClick={() => setPdfImportWizardMode("assign")}
                        >
                          <i className="fa-solid fa-link" />
                        </button>
                      </div>
                    )}
                  </>
                ) : pdfImportWizardMode === "create" ? (
                  <div className="mt-3 space-y-3">
                    <label className="block text-sm">
                      {t.statementBankName ?? "Bank name"}
                      <input
                        className="input mt-1 w-full"
                        value={pdfImportCreateForm.institution_name}
                        onChange={(e) => setPdfImportCreateForm((f) => ({ ...f, institution_name: e.target.value }))}
                      />
                    </label>
                    <label className="block text-sm">
                      {t.statementAccountName ?? "Account name"}
                      <input
                        className="input mt-1 w-full"
                        value={pdfImportCreateForm.account_name}
                        onChange={(e) => setPdfImportCreateForm((f) => ({ ...f, account_name: e.target.value }))}
                        placeholder="e.g. last 4 digits or IBAN suffix"
                      />
                    </label>
                    <label className="block text-sm">
                      {t.statementDisplayName ?? "Display name"}
                      <input
                        className="input mt-1 w-full"
                        value={pdfImportCreateForm.display_name}
                        onChange={(e) => setPdfImportCreateForm((f) => ({ ...f, display_name: e.target.value }))}
                        placeholder="e.g. BiG Visa"
                      />
                    </label>
                    <label className="block text-sm">
                      {t.statementCountry ?? "Country"}
                      <select
                        className="input mt-1 w-full"
                        value={pdfImportCreateForm.country}
                        onChange={(e) => setPdfImportCreateForm((f) => ({ ...f, country: e.target.value }))}
                      >
                        {countries.map((c) => (
                          <option key={c.code} value={c.code}>{c.names[t.languageCode] ?? c.names.en}</option>
                        ))}
                      </select>
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border"
                        style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
                        title={t.modalCancel ?? "Back"}
                        aria-label={t.modalCancel ?? "Back"}
                        onClick={() => setPdfImportWizardMode(null)}
                      >
                        <i className="fa-solid fa-arrow-left" />
                      </button>
                      <button
                        type="button"
                        className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ borderColor: "var(--primary)", background: "var(--primary)", color: "var(--primary-contrast)" }}
                        title={t.importReviewTitle ?? "Review transactions"}
                        aria-label={t.importReviewTitle ?? "Review transactions"}
                        disabled={pdfImportLoading || !pdfImportCreateForm.institution_name.trim()}
                        onClick={() => openPdfImportReview("create", null)}
                      >
                        <i className="fa-solid fa-list-check" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 space-y-3">
                    <label className="block text-sm">
                      {t.assignToExisting ?? "Assign to"}
                      <select
                        className="input mt-1 w-full"
                        value={pdfImportTargetAccountId ?? ""}
                        onChange={(e) => setPdfImportTargetAccountId(Number(e.target.value) || null)}
                      >
                        <option value="">—</option>
                        {accounts.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.friendly_name ?? a.account_name ?? a.institution_name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border"
                        style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
                        title={t.modalCancel ?? "Back"}
                        aria-label={t.modalCancel ?? "Back"}
                        onClick={() => setPdfImportWizardMode(null)}
                      >
                        <i className="fa-solid fa-arrow-left" />
                      </button>
                      <button
                        type="button"
                        className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ borderColor: "var(--primary)", background: "var(--primary)", color: "var(--primary-contrast)" }}
                        title={t.importReviewTitle ?? "Review transactions"}
                        aria-label={t.importReviewTitle ?? "Review transactions"}
                        disabled={pdfImportLoading || !pdfImportTargetAccountId}
                        onClick={() => pdfImportTargetAccountId != null && openPdfImportReview("assign", pdfImportTargetAccountId)}
                      >
                        <i className="fa-solid fa-list-check" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : null}

      {pdfImportReviewOpen && pdfImportReviewTransactions.length > 0 ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="card-title m-0">{t.importReviewTitle ?? "Review transactions"}</h3>
              <button
                type="button"
                className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border"
                style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
                title={t.importReviewBack ?? "Back"}
                aria-label={t.importReviewBack ?? "Back"}
                onClick={() => setPdfImportReviewOpen(false)}
              >
                <i className="fa-solid fa-arrow-left" />
              </button>
            </div>
            {pdfImportError ? (
              <div className="mb-3 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-200">
                {pdfImportError}
              </div>
            ) : null}
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              {t.importReviewFlipSign ?? "Toggle sign if a transaction was interpreted as credit instead of debit or vice versa."}
            </p>
            <div className="overflow-y-auto flex-1 min-h-0 border rounded-lg p-2" style={{ borderColor: "var(--border)" }}>
              {pdfImportReviewTransactions.map((file, fileIdx) => (
                <div key={fileIdx} className="mb-4">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    {t.importReviewFileLabel ?? "File"}: {pdfImportFiles[fileIdx]?.name ?? fileIdx + 1}
                  </div>
                  <ul className="space-y-1">
                    {file.transactions.map((tx, txIdx) => {
                      const amount = String(tx.amount ?? "");
                      const isNegative = amount.startsWith("-");
                      const include = tx.include !== false;
                      return (
                        <li
                          key={txIdx}
                          className="flex items-center gap-2 py-1.5 px-2 rounded text-sm"
                          style={{ background: "var(--surface-hover)" }}
                        >
                          <label className="flex shrink-0 items-center cursor-pointer" title={include ? (t.importReviewInclude ?? "Include in import") : (t.importReviewExclude ?? "Exclude from import")}>
                            <input
                              type="checkbox"
                              checked={include}
                              onChange={(e) => setReviewTransactionInclude(fileIdx, txIdx, e.target.checked)}
                              className="h-4 w-4"
                              aria-label={include ? (t.importReviewInclude ?? "Include") : (t.importReviewExclude ?? "Exclude")}
                            />
                          </label>
                          <span className="shrink-0 w-24 text-slate-600 dark:text-slate-300">{String(tx.date ?? "")}</span>
                          <span className={`shrink-0 w-20 font-medium ${isNegative ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                            {amount} {String(tx.currency ?? "").trim() || ""}
                          </span>
                          <span className={`min-w-0 flex-1 truncate ${include ? "text-slate-700 dark:text-slate-200" : "text-slate-400 dark:text-slate-500 line-through"}`} title={String(tx.description ?? "")}>
                            {String(tx.description ?? "")}
                          </span>
                          <button
                            type="button"
                            className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border"
                            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
                            title={t.importReviewFlipSign ?? "Flip sign"}
                            aria-label={t.importReviewFlipSign ?? "Flip sign"}
                            onClick={() => flipReviewTransactionSign(fileIdx, txIdx)}
                          >
                            <i className="fa-solid fa-plus-minus" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
              <button
                type="button"
                className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border"
                style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
                title={t.importReviewBack ?? "Back"}
                aria-label={t.importReviewBack ?? "Back"}
                onClick={() => setPdfImportReviewOpen(false)}
              >
                <i className="fa-solid fa-arrow-left" />
              </button>
              <button
                type="button"
                className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: "var(--primary)", background: "var(--primary)", color: "var(--primary-contrast)" }}
                title={t.importReviewImport ?? "Import"}
                aria-label={t.importReviewImport ?? "Import"}
                disabled={pdfImportLoading}
                onClick={async () => {
                  setPdfImportError(null);
                  setPdfImportLoading(true);
                  try {
                    let targetAccountId = pdfImportReviewTargetId;
                    if (pdfImportReviewAction === "create") {
                      const createRes = await fetch(`${apiBase}/api/accounts/manual`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify({
                          institution_name: pdfImportCreateForm.institution_name.trim(),
                          account_name: pdfImportCreateForm.account_name.trim() || null,
                          friendly_name: pdfImportCreateForm.display_name.trim() || null,
                          country: pdfImportCreateForm.country,
                          institution_id: pdfImportCreateForm.institution_id || null,
                          logo_url: pdfImportCreateForm.logo_url || null,
                        }),
                      });
                      if (!createRes.ok) throw new Error("Failed to create account");
                      const newAccount = await createRes.json();
                      targetAccountId = newAccount.id;
                      const accountsRes = await fetch(`${apiBase}/api/accounts?_t=${Date.now()}`, { headers, cache: "no-store" });
                      if (accountsRes.ok) setAccounts(await accountsRes.json());
                    }
                    if (targetAccountId == null) throw new Error("No account");
                    let total = 0;
                    for (let i = 0; i < pdfImportReviewTransactions.length; i++) {
                      const toImport = pdfImportReviewTransactions[i].transactions.filter((tx) => tx.include !== false);
                      if (toImport.length === 0) continue;
                      const res = await fetch(`${apiBase}/api/statements/import`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify({
                          account_id: targetAccountId,
                          transactions: toImport.map(({ date, amount, description, currency }) => ({ date, amount, description, currency })),
                          bank_info: pdfImportReviewTransactions[i].bank_info,
                          filename: pdfImportFiles[i]?.name,
                        }),
                      });
                      if (!res.ok) throw new Error("Import failed");
                      const data = await res.json();
                      total += data.imported ?? 0;
                    }
                    setToast({ text: (t.importSuccess ?? "Imported") + ` ${total} transactions`, type: "success" });
                    setPdfImportReviewOpen(false);
                    setPdfImportOpen(false);
                    await fetchAccounts();
                    onFetchComplete?.();
                  } catch (e) {
                    setPdfImportError(e instanceof Error ? e.message : (t.importFailed ?? "Import failed"));
                  } finally {
                    setPdfImportLoading(false);
                  }
                }}
              >
                <i className="fa-solid fa-file-import" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {logoEditAccountId != null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="card max-w-sm w-full">
            <h3 className="card-title">{t.selectBankForLogo ?? "Update logo"}</h3>
            <label className="block text-sm mt-2">
              Logo URL
              <input
                className="input mt-1 w-full"
                type="url"
                value={logoEditUrl}
                onChange={(e) => setLogoEditUrl(e.target.value)}
                placeholder="https://..."
              />
            </label>
            {logoEditBanks.length > 0 ? (
              <label className="block text-sm mt-3">
                {t.pickBankFromList ?? "Pick from bank list"}
                <select
                  className="input mt-1 w-full"
                  value={logoEditSelectedBankId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setLogoEditSelectedBankId(id);
                    const bank = logoEditBanks.find((b) => b.id === id);
                    if (bank) {
                      setLogoEditUrl(bank.logo || "");
                      setLogoEditInstitutionName(bank.name);
                    } else {
                      setLogoEditInstitutionName("");
                    }
                  }}
                >
                  <option value="">—</option>
                  {logoEditBanks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border"
                style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
                title={t.modalCancel ?? "Cancel"}
                aria-label={t.modalCancel ?? "Cancel"}
                onClick={() => {
                  setLogoEditAccountId(null);
                  setLogoEditUrl("");
                  setLogoEditInstitutionName("");
                  setLogoEditSelectedBankId("");
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
              <button
                type="button"
                className="bordered-icon-btn shrink-0 inline-flex items-center justify-center border disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: "var(--primary)", background: "var(--primary)", color: "var(--primary-contrast)" }}
                title={t.modalConfirm ?? "Save"}
                aria-label={t.modalConfirm ?? "Save"}
                disabled={!logoEditUrl.trim()}
                onClick={async () => {
                  if (logoEditAccountId == null) return;
                  const body: { logo_url: string | null; institution_name?: string } = {
                    logo_url: logoEditUrl.trim() || null,
                  };
                  if (logoEditInstitutionName.trim()) body.institution_name = logoEditInstitutionName.trim();
                  const r = await fetch(`${apiBase}/api/accounts/${logoEditAccountId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify(body),
                  });
                  if (r.ok) {
                    setLogoEditAccountId(null);
                    setLogoEditUrl("");
                    setLogoEditInstitutionName("");
                    setLogoEditSelectedBankId("");
                    await fetchAccounts();
                  }
                }}
              >
                <i className="fa-solid fa-check" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="card-title m-0">{t.onboardingAccountsTitle}</h3>
          <button
            type="button"
            className="btn-secondary btn-sm flex items-center gap-2"
            onClick={() => {
              setPdfImportOpen(true);
              setPdfImportPreSelectAccountId(null);
              setPdfImportFiles([]);
              setPdfImportParsed([]);
              setPdfImportMatch(null);
              setPdfImportTargetAccountId(null);
              setPdfImportWizardMode(null);
              setPdfImportError(null);
            }}
            title={t.importStatementTitle ?? "Import statement (PDF)"}
            aria-label={t.importStatementTitle ?? "Import statement (PDF)"}
          >
            <i className="fa-solid fa-file-import" />
            <span>{t.importStatementTitle ?? "Import statement (PDF)"}</span>
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
            >
              <div className="flex shrink-0 items-center gap-1.5">
                {account.logo_url ? (
                  isManualAccount(account) ? (
                    <button
                      type="button"
                      className="h-8 w-8 rounded object-contain cursor-pointer border-0 p-0 overflow-hidden hover:opacity-80"
                      onClick={() => {
                        setLogoEditAccountId(account.id);
                        setLogoEditUrl(account.logo_url ?? "");
                        setLogoEditInstitutionName(account.institution_name ?? "");
                      }}
                      title={t.selectBankForLogo ?? "Update logo"}
                      aria-label={t.selectBankForLogo ?? "Update logo"}
                    >
                      <img src={account.logo_url} alt={account.institution_name} className="h-8 w-8 object-contain" />
                    </button>
                  ) : (
                    <img src={account.logo_url} alt={account.institution_name} className="h-8 w-8 rounded object-contain" />
                  )
                ) : (
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                    title={isManualAccount(account) ? (t.selectBankForLogo ?? "Update logo") : undefined}
                    onClick={isManualAccount(account) ? () => {
                      setLogoEditAccountId(account.id);
                      setLogoEditUrl(account.logo_url ?? "");
                      setLogoEditInstitutionName(account.institution_name ?? "");
                    } : undefined}
                    aria-label={t.selectBankForLogo ?? "Update logo"}
                  >
                    <i className="fa-solid fa-building-columns text-slate-500 dark:text-slate-400" />
                  </button>
                )}
                {isManualAccount(account) ? (
                  <span className="text-slate-500 dark:text-slate-400" title={t.accountSourceManual ?? "Manual"} aria-label={t.accountSourceManual ?? "Manual"}>
                    <i className="fa-solid fa-file-lines text-sm" />
                  </span>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400" title={t.accountSourceAutomatic ?? "Automatic"} aria-label={t.accountSourceAutomatic ?? "Automatic"}>
                    <i className="fa-solid fa-link text-sm" />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className="text-sm font-medium"
                  style={{ color: getAccountColor(account.id) }}
                >
                  {account.friendly_name ??
                    account.account_name ??
                    account.institution_name}
                </div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {account.institution_name ?? account.account_name ?? account.account_id ?? account.country}
                </p>
                {showBalances && account.current_balance != null && (
                  <div className="text-sm font-semibold mt-1">
                    {new Intl.NumberFormat(t.languageCode, {
                      style: "currency",
                      currency: account.balance_currency ?? "EUR",
                    }).format(account.current_balance)}
                  </div>
                )}
                <div className="mt-2 flex w-full min-w-0 flex-col gap-2">
                  <div className="flex w-full min-w-0 items-center gap-2">
                    <input
                      className="input text-sm min-w-0 flex-1"
                      value={friendlyNames[account.id] ?? ""}
                      placeholder={account.institution_name}
                      onChange={(event) =>
                        setFriendlyNames((prev) => ({
                          ...prev,
                          [account.id]: event.target.value,
                        }))
                      }
                      onBlur={async () => {
                        const friendlyName = friendlyNames[account.id]?.trim() || "";
                        if (!friendlyName) return;
                        const response = await fetch(`${apiBase}/api/accounts/${account.id}`, {
                          method: "PATCH",
                          headers,
                          body: JSON.stringify({ friendly_name: friendlyName }),
                        });
                        if (response.ok) {
                          setAccounts((prev) =>
                            prev.map((acc) =>
                              acc.id === account.id ? { ...acc, friendly_name: friendlyName } : acc
                            )
                          );
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="shrink-0 p-2 rounded-md transition-colors"
                      style={{
                        background: "var(--surface-hover)",
                        border: "1px solid var(--border)",
                        color: "var(--text)",
                      }}
                      title={t.onboardingFriendlyNameSave}
                      aria-label={t.onboardingFriendlyNameSave}
                      onClick={async () => {
                        const friendlyName = friendlyNames[account.id]?.trim() || "";
                        if (!friendlyName) return;
                        const response = await fetch(`${apiBase}/api/accounts/${account.id}`, {
                          method: "PATCH",
                          headers,
                          body: JSON.stringify({ friendly_name: friendlyName }),
                        });
                        if (response.ok) {
                          setAccounts((prev) =>
                            prev.map((acc) =>
                              acc.id === account.id ? { ...acc, friendly_name: friendlyName } : acc
                            )
                          );
                        }
                      }}
                    >
                      <i className="fa-solid fa-floppy-disk" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="icon-button shrink-0"
                      type="button"
                      title={t.actionEditAlerts}
                      aria-label={t.actionEditAlerts}
                      onClick={async () => {
                        const list = await loadRecurringTransactions(account.id);
                        setAlertsModal({
                          open: true,
                          accountId: account.id,
                          accountLabel:
                            account.friendly_name ??
                            account.account_name ??
                            account.institution_name ??
                            "",
                          alert_above_amount:
                            account.alert_above_amount != null
                              ? String(account.alert_above_amount)
                              : "0",
                          alert_below_amount:
                            account.alert_below_amount != null
                              ? String(account.alert_below_amount)
                              : "-100",
                          transactionAlerts: list,
                        });
                      }}
                    >
                      <i className="fa-solid fa-bell"></i>
                    </button>
                    {!isManualAccount(account) && (
                      <button
                        className={`icon-button shrink-0 ${account.needs_reauth ? "needs-reauth scale-110" : ""}`}
                        type="button"
                        title={account.needs_reauth ? t.actionReauthRequired : t.actionReconnectBank}
                        aria-label={account.needs_reauth ? t.actionReauthRequired : t.actionReconnectBank}
                        onClick={() => reconnectBank(account)}
                      >
                        <i className={account.needs_reauth ? "fa-solid fa-plug-circle-exclamation" : "fa-solid fa-plug"}></i>
                      </button>
                    )}
                    <button
                      className="icon-button shrink-0 disabled:opacity-50 disabled:pointer-events-none"
                      type="button"
                      title={t.actionFetchTransactions}
                      aria-label={t.actionFetchTransactions}
                      disabled={!isManualAccount(account) ? fetchInProgressConnectionId !== null : false}
                      onClick={() => {
                        if (isManualAccount(account)) {
                          setPdfImportPreSelectAccountId(account.id);
                          setPdfImportOpen(true);
                          setPdfImportFiles([]);
                          setPdfImportParsed([]);
                          setPdfImportMatch(null);
                          setPdfImportTargetAccountId(null);
                          setPdfImportWizardMode(null);
                          setPdfImportError(null);
                        } else {
                          fetchTransactions(account);
                        }
                      }}
                    >
                      <i className={isManualAccount(account) ? "fa-solid fa-file-import" : "fa-solid fa-rotate"}></i>
                    </button>
                    <button
                      className="icon-button shrink-0 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                      type="button"
                      title={t.actionDeleteAccount}
                      aria-label={t.actionDeleteAccount}
                      onClick={() =>
                        setDeleteAccountModal({
                          open: true,
                          accountId: account.id,
                          accountLabel:
                            account.friendly_name ??
                            account.account_name ??
                            account.institution_name ??
                            "",
                        })
                      }
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="card-title">{t.onboardingTitle}</h2>
        {t.onboardingBody && <p className="card-description">{t.onboardingBody}</p>}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <label className="text-sm text-slate-500 dark:text-slate-300">
            {t.onboardingCountry}
            <select
              className="input mt-2"
              value={country}
              onChange={(event) => setCountry(event.target.value)}
            >
          {countries.map((item) => (
                <option key={item.code} value={item.code}>
              {item.names[t.languageCode] ?? item.names.en}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-500 dark:text-slate-300 md:col-span-2">
            {t.onboardingSearch}
            <input
              className="input mt-2"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.onboardingSelectBank}
            />
          </label>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {banksLoading ? (
            <div className="text-sm text-slate-500 dark:text-slate-300">
              Loading banks...
            </div>
          ) : (
            filteredBanks.map((bank) => (
              <button
                key={bank.id}
                type="button"
                className="card border border-slate-200 text-left transition hover:border-blue-500 dark:border-slate-700 disabled:opacity-50 disabled:pointer-events-none"
                disabled={fetchInProgressConnectionId !== null}
                onClick={() => startConnection(bank)}
              >
                <div className="flex items-center gap-3">
                  {bank.logo ? (
                    <img src={bank.logo} alt={bank.name} className="h-10 w-10" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                  )}
                  <div className="text-left">
                    <div className="text-sm font-semibold">{bank.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-300">
                      {country}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="mt-6 flex items-center gap-3">
          {accounts.length === 0 ? (
            <span className="text-sm text-rose-500">{t.onboardingRequired}</span>
          ) : null}
          {isRedirecting ? (
            <span className="text-sm text-slate-500 dark:text-slate-300">
              {t.onboardingCompleting}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
