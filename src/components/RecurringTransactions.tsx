/**
 * Recurring transactions list & management UI (B012 Phase 4).
 * List with sort/filter, review suggestions, detail/edit modal, create manual.
 * Phase 5: Calendar view and list view alternative.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import RecurringCalendar from "./RecurringCalendar";

export type RecurringItem = {
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
  nominal_amount: string | null;
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

export type AccountOption = {
  id: number;
  friendly_name?: string | null;
  account_name?: string | null;
  institution_name: string;
};

type Props = {
  apiBase: string;
  token: string;
  accounts: AccountOption[];
  locale: string;
  /** When null and storageMode is cloud, show Phase 8 initial detection offer card */
  initialDetectionRunAt?: string | null;
  storageMode?: "cloud" | "local";
  /** Called after user runs or skips initial detection (refetch profile) */
  onInitialDetectionDone?: () => void;
  t: {
    recurringTitle: string;
    recurringSubtitle: string;
    recurringInitialOfferTitle: string;
    recurringInitialOfferBody: string;
    recurringInitialOfferAnalyze: string;
    recurringInitialOfferSkip: string;
    recurringEmptyGuidance: string;
    recurringFindSuggestions: string;
    recurringFinding: string;
    recurringNoSuggestions: string;
    recurringReviewSuggestions: string;
    recurringSuggestionsCount: string;
    recurringConfirm: string;
    recurringDismiss: string;
    recurringSkip: string;
    recurringEditThenConfirm: string;
    recurringProgressOf: string;
    filterAccount: string;
    filterAccountAll: string;
    filterStatus: string;
    filterStatusAll: string;
    filterStatusActive: string;
    filterStatusPaused: string;
    filterStatusSuggested: string;
    sortBy: string;
    sortNextDate: string;
    sortName: string;
    sortFrequency: string;
    sortAmount: string;
    sortConfidence: string;
    searchPlaceholder: string;
    recurringEmpty: string;
    recurringNext: string;
    recurringAmount: string;
    recurringAmountVaries: string;
    recurringFrequency: string;
    recurringFrequencyWeekly: string;
    recurringFrequencyBiweekly: string;
    recurringFrequencyMonthly: string;
    recurringFrequencyQuarterly: string;
    recurringFrequencyYearly: string;
    recurringStatusActive: string;
    recurringStatusPaused: string;
    recurringStatusSuggested: string;
    recurringStatusDismissed: string;
    recurringStatusArchived: string;
    recurringCreateManual: string;
    recurringEdit: string;
    recurringPause: string;
    recurringResume: string;
    recurringDelete: string;
    modalCancel: string;
    modalSave: string;
    modalClose: string;
    detailName: string;
    detailDescriptionPattern: string;
    detailFrequency: string;
    detailInterval: string;
    detailAnchorDay: string;
    detailDayTolerance: string;
    createAlertDayToleranceBefore: string;
    createAlertDayToleranceAfter: string;
    detailExpectedAmount: string;
    detailNominalAmount: string;
    detailAmountTolerance: string;
    createAlertValueToleranceBelow: string;
    createAlertValueToleranceAbove: string;
    detailAlertOnOccurrence: string;
    detailAlertOnMissing: string;
    detailMissingGraceDays: string;
    createRecurringTitle: string;
    createRecurringSuccess: string;
    createRecurringError: string;
    deleteConfirm: string;
    deleteSuccess: string;
    confirmSuccess: string;
    confirmOnlySuggestedError: string;
    dismissSuccess: string;
    recurringViewList: string;
    recurringViewCalendar: string;
    calendarToday: string;
    calendarSummaryTransactions: string;
    calendarSummaryAmount: string;
    calendarUpcoming: string;
    countdownToday: string;
    countdownTomorrow: string;
    countdownInNDays: string;
    countdownDaysAgo: string;
  };
  onToast?: (text: string, type: "success" | "error") => void;
};

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: "recurringFrequencyWeekly",
  biweekly: "recurringFrequencyBiweekly",
  monthly: "recurringFrequencyMonthly",
  quarterly: "recurringFrequencyQuarterly",
  yearly: "recurringFrequencyYearly",
};

function formatCountdown(
  nextDate: string | null,
  locale: string,
  t: { countdownToday: string; countdownTomorrow: string; countdownInNDays: string; countdownDaysAgo: string }
): string {
  if (!nextDate) return "—";
  const [y, m, day] = nextDate.split("-").map(Number);
  const d = new Date(y, m - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diffMs = d.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return t.countdownDaysAgo.replace("{n}", String(Math.abs(diffDays)));
  if (diffDays === 0) return t.countdownToday;
  if (diffDays === 1) return t.countdownTomorrow;
  if (diffDays <= 7) return t.countdownInNDays.replace("{n}", String(diffDays));
  return d.toLocaleDateString(locale, { year: "numeric", month: "short", day: "2-digit" });
}

function formatExpectedAmount(amountStr: string | null, locale: string): string {
  if (amountStr == null || amountStr === "") return "—";
  const trimmed = amountStr.trim();
  const sign = trimmed.startsWith("+") ? "+" : trimmed.startsWith("-") ? "-" : "";
  const num = parseFloat(trimmed.replace(/^[+-]/, "").trim());
  if (Number.isNaN(num)) return amountStr;
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(num));
  return sign + formatted;
}

export default function RecurringTransactions({
  apiBase,
  token,
  accounts,
  locale,
  initialDetectionRunAt,
  storageMode,
  onInitialDetectionDone,
  t,
  onToast,
}: Props) {
  const [selectedAccountId, setSelectedAccountId] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"next_date" | "name" | "frequency" | "amount" | "confidence">("next_date");
  const [searchQuery, setSearchQuery] = useState("");
  const [list, setList] = useState<RecurringItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [runSuggestionsLoading, setRunSuggestionsLoading] = useState(false);
  const [initialDetectionLoading, setInitialDetectionLoading] = useState(false);
  const showInitialOffer =
    initialDetectionRunAt == null &&
    storageMode === "cloud" &&
    accounts.length > 0;
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<RecurringItem>>({});
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createAccountId, setCreateAccountId] = useState<number | null>(null);
  const [createForm, setCreateForm] = useState({
    name: "",
    description_pattern: "",
    frequency: "monthly",
    interval: 1,
    anchor_day: 1,
    day_tolerance_before: 1,
    day_tolerance_after: 1,
    expected_amount: "",
    nominal_amount: "",
    amount_tolerance_below: "0",
    amount_tolerance_above: "0",
    alert_on_occurrence: true,
    alert_on_missing: true,
    missing_grace_days: 3,
  });
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewCardCollapsed, setReviewCardCollapsed] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  // ESC closes any open modal
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (editId != null) {
        setEditId(null);
        e.preventDefault();
      } else if (createModalOpen) {
        setCreateModalOpen(false);
        e.preventDefault();
      } else if (deleteConfirmId != null) {
        setDeleteConfirmId(null);
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [editId, createModalOpen, deleteConfirmId]);

  const api = useCallback(
    (path: string, options?: RequestInit) => {
      return fetch(`${apiBase.replace(/\/$/, "")}${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });
    },
    [apiBase, token]
  );

  const loadList = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      if (selectedAccountId === "all") {
        const results: RecurringItem[] = [];
        for (const acc of accounts) {
          const res = await api(`/api/accounts/${acc.id}/recurring-transactions`);
          if (res.ok) {
            const data = await res.json();
            results.push(...data);
          }
        }
        setList(results);
      } else {
        const res = await api(`/api/accounts/${selectedAccountId}/recurring-transactions`);
        if (res.ok) {
          const data = await res.json();
          setList(data);
        } else {
          setList([]);
        }
      }
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [token, selectedAccountId, accounts, api]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const suggestedItems = useMemo(() => list.filter((r) => r.status === "suggested"), [list]);
  const hasSuggestions = suggestedItems.length > 0;
  const currentReviewItem = suggestedItems[reviewIndex] ?? null;

  // When suggestion list length changes, show the review card again (e.g. after new detection)
  useEffect(() => {
    setReviewCardCollapsed(false);
  }, [suggestedItems.length]);

  const runInitialDetection = useCallback(async () => {
    setInitialDetectionLoading(true);
    try {
      const res = await api("/api/me/recurring-initial-detection/run", { method: "POST" });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        await loadList();
        onInitialDetectionDone?.();
        const n = data.suggestions_created ?? 0;
        onToast?.(
          n > 0
            ? t.recurringFindSuggestions + " – " + t.recurringReviewSuggestions
            : t.recurringNoSuggestions,
          n > 0 ? "success" : "success"
        );
      } else {
        const err = await res.json().catch(() => ({}));
        onToast?.(err?.detail ?? t.createRecurringError, "error");
      }
    } catch {
      onToast?.(t.createRecurringError, "error");
    } finally {
      setInitialDetectionLoading(false);
    }
  }, [api, loadList, onInitialDetectionDone, onToast, t]);

  const skipInitialDetection = useCallback(async () => {
    try {
      const res = await api("/api/me/recurring-initial-detection/skip", { method: "POST" });
      if (res.ok) {
        onInitialDetectionDone?.();
      }
    } catch {
      // ignore
    }
  }, [api, onInitialDetectionDone]);

  const runSuggestions = useCallback(async () => {
    const accountId = selectedAccountId === "all" ? accounts[0]?.id : selectedAccountId;
    if (accountId === "all" || accountId == null) return;
    setRunSuggestionsLoading(true);
    try {
      const res = await api(
        `/api/accounts/${accountId}/recurring-suggestions/run?since_months=6&min_confidence=60`,
        { method: "POST" }
      );
      if (res.ok) {
        await loadList();
        onToast?.(t.recurringFindSuggestions + " – " + t.recurringReviewSuggestions, "success");
      }
    } catch {
      onToast?.(t.createRecurringError, "error");
    } finally {
      setRunSuggestionsLoading(false);
    }
  }, [api, selectedAccountId, accounts, loadList, onToast, t]);

  const handleConfirmSuggestion = useCallback(
    async (id: number) => {
      const res = await api(`/api/recurring-transactions/${id}/confirm`, { method: "POST" });
      if (res.ok) {
        onToast?.(t.confirmSuccess, "success");
        await loadList();
        if (reviewIndex >= suggestedItems.length - 1) setReviewIndex(0);
        else setReviewIndex((i) => i + 1);
      } else {
        const data = await res.json().catch(() => ({}));
        const detail = typeof data?.detail === "string" ? data.detail : "";
        if (res.status === 400 && detail.includes("Only suggested")) {
          onToast?.(t.confirmOnlySuggestedError, "error");
        } else {
          onToast?.(t.createRecurringError, "error");
        }
      }
    },
    [api, loadList, onToast, reviewIndex, suggestedItems.length, t]
  );

  const handleDismissSuggestion = useCallback(
    async (id: number) => {
      const res = await api(`/api/recurring-transactions/${id}/dismiss`, { method: "POST" });
      if (res.ok) {
        onToast?.(t.dismissSuccess, "success");
        await loadList();
        if (reviewIndex >= suggestedItems.length - 1) setReviewIndex(0);
        else setReviewIndex((i) => i + 1);
      } else {
        onToast?.(t.createRecurringError, "error");
      }
    },
    [api, loadList, onToast, reviewIndex, suggestedItems.length, t]
  );

  const filteredAndSorted = useMemo(() => {
    let items = list;
    if (statusFilter) items = items.filter((r) => r.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      items = items.filter(
        (r) =>
          (r.name || "").toLowerCase().includes(q) ||
          (r.description_pattern || "").toLowerCase().includes(q)
      );
    }
    items = [...items].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "frequency":
          return (a.frequency || "").localeCompare(b.frequency || "");
        case "amount":
          return parseFloat(a.expected_amount ?? a.nominal_amount ?? "0") - parseFloat(b.expected_amount ?? b.nominal_amount ?? "0");
        case "confidence":
          return (b.confidence ?? 0) - (a.confidence ?? 0);
        default:
          const da = a.next_expected_date ? new Date(a.next_expected_date).getTime() : 0;
          const db = b.next_expected_date ? new Date(b.next_expected_date).getTime() : 0;
          return da - db;
      }
    });
    return items;
  }, [list, statusFilter, searchQuery, sortBy]);

  const openEdit = useCallback((item: RecurringItem) => {
    const dayTol = Math.max(
      item.day_tolerance_before ?? 1,
      item.day_tolerance_after ?? 1,
      item.missing_grace_days ?? 3
    );
    const amtTol = item.amount_tolerance_below ?? item.amount_tolerance_above ?? "0";
    setEditId(item.id);
    setEditForm({
      name: item.name,
      description_pattern: item.description_pattern ?? "",
      frequency: item.frequency,
      interval: item.interval,
      anchor_day: item.anchor_day,
      day_tolerance_before: dayTol,
      day_tolerance_after: dayTol,
      expected_amount: item.expected_amount ?? "",
      nominal_amount: item.nominal_amount ?? "",
      amount_tolerance_below: amtTol,
      amount_tolerance_above: amtTol,
      alert_on_occurrence: item.alert_on_occurrence,
      alert_on_missing: item.alert_on_missing,
      missing_grace_days: dayTol,
    });
  }, []);

  const saveEdit = useCallback(async () => {
    if (editId == null) return;
    const res = await api(`/api/recurring-transactions/${editId}`, {
      method: "PATCH",
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      onToast?.(t.modalSave + " – OK", "success");
      setEditId(null);
      loadList();
    } else {
      onToast?.(t.createRecurringError, "error");
    }
  }, [api, editId, editForm, loadList, onToast, t]);

  const pauseResume = useCallback(
    async (id: number, currentStatus: string) => {
      const res = await api(`/api/recurring-transactions/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: currentStatus === "paused" ? "active" : "paused" }),
      });
      if (res.ok) {
        loadList();
        if (editId === id) setEditId(null);
      }
    },
    [api, loadList, editId]
  );

  const deleteRecurring = useCallback(
    async (id: number) => {
      const res = await api(`/api/recurring-transactions/${id}`, { method: "DELETE" });
      if (res.ok) {
        onToast?.(t.deleteSuccess, "success");
        setEditId((prev) => (prev === id ? null : prev));
        setDeleteConfirmId(null);
        loadList();
      }
    },
    [api, loadList, onToast, t]
  );

  const createRecurring = useCallback(async () => {
    if (createAccountId == null || !createForm.name.trim()) return;
    const res = await api(`/api/accounts/${createAccountId}/recurring-transactions`, {
      method: "POST",
      body: JSON.stringify({
        name: createForm.name.trim(),
        description_pattern: createForm.description_pattern.trim() || null,
        frequency: createForm.frequency,
        interval: createForm.interval,
        anchor_day: createForm.anchor_day,
        day_tolerance_before: createForm.day_tolerance_before,
        day_tolerance_after: createForm.day_tolerance_after,
        expected_amount: createForm.expected_amount.trim() || null,
        nominal_amount: createForm.nominal_amount.trim() || null,
        amount_tolerance_below: createForm.amount_tolerance_below,
        amount_tolerance_above: createForm.amount_tolerance_above,
        alert_on_occurrence: createForm.alert_on_occurrence,
        alert_on_missing: createForm.alert_on_missing,
        missing_grace_days: createForm.missing_grace_days,
      }),
    });
    if (res.ok) {
      onToast?.(t.createRecurringSuccess, "success");
      setCreateModalOpen(false);
      setCreateForm({
        name: "",
        description_pattern: "",
        frequency: "monthly",
        interval: 1,
        anchor_day: 1,
        day_tolerance_before: 1,
        day_tolerance_after: 1,
        expected_amount: "",
        nominal_amount: "",
        amount_tolerance_below: "0",
        amount_tolerance_above: "0",
        alert_on_occurrence: true,
        alert_on_missing: true,
        missing_grace_days: 1,
      });
      loadList();
    } else {
      onToast?.(t.createRecurringError, "error");
    }
  }, [api, createAccountId, createForm, loadList, onToast, t]);

  const getAccountLabel = (accountId: number) => {
    const acc = accounts.find((a) => a.id === accountId);
    return acc?.friendly_name || acc?.account_name || acc?.institution_name || String(accountId);
  };

  const frequencyLabel = (freq: string) => {
    const key = FREQUENCY_LABELS[freq] || freq;
    return t[key as keyof typeof t] || freq;
  };

  const iconBtnClass =
    "inline-flex items-center justify-center p-2 rounded border transition-colors min-w-[2.25rem]";
  const statusIcon = (status: string) => {
    const s = String(status ?? "").toLowerCase();
    if (s === "active")
      return { icon: "fa-solid fa-circle-check", tooltip: t.recurringStatusActive, color: "text-emerald-600 dark:text-emerald-400" };
    if (s === "paused")
      return { icon: "fa-solid fa-pause", tooltip: t.recurringStatusPaused, color: "text-slate-500 dark:text-slate-400" };
    if (s === "dismissed")
      return { icon: "fa-regular fa-circle-xmark", tooltip: t.recurringStatusDismissed, color: "text-slate-500 dark:text-slate-400" };
    if (s === "archived")
      return { icon: "fa-solid fa-archive", tooltip: t.recurringStatusArchived, color: "text-slate-400 dark:text-slate-500" };
    return { icon: "fa-regular fa-clock", tooltip: t.recurringStatusSuggested, color: "text-amber-600 dark:text-amber-400" };
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t.recurringTitle}</h1>
        <button
          type="button"
          className={`${iconBtnClass} border-[var(--primary)] bg-[var(--primary)] text-white hover:opacity-90 disabled:opacity-50`}
          title={t.recurringFindSuggestions}
          aria-label={t.recurringFindSuggestions}
          onClick={runSuggestions}
          disabled={runSuggestionsLoading || (selectedAccountId === "all" && accounts.length === 0)}
        >
          <i className={`fa-solid fa-magnifying-glass-chart ${runSuggestionsLoading ? "fa-spin" : ""}`} aria-hidden />
        </button>
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.recurringSubtitle}</p>

      {/* Phase 8: Initial detection offer (existing & new users) */}
      {showInitialOffer && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            {t.recurringInitialOfferTitle}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {t.recurringInitialOfferBody}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--primary)] bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              onClick={runInitialDetection}
              disabled={initialDetectionLoading}
            >
              {initialDetectionLoading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" aria-hidden />
                  {t.recurringFinding}
                </>
              ) : (
                t.recurringInitialOfferAnalyze
              )}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              onClick={skipInitialDetection}
              disabled={initialDetectionLoading}
            >
              {t.recurringInitialOfferSkip}
            </button>
          </div>
        </div>
      )}

      {/* List / Calendar view toggle */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 dark:border-slate-600">
          <button
            type="button"
            className={`px-3 py-1.5 text-sm rounded-md ${viewMode === "list" ? "bg-slate-200 dark:bg-slate-600" : ""}`}
            onClick={() => setViewMode("list")}
          >
            {t.recurringViewList}
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-sm rounded-md ${viewMode === "calendar" ? "bg-slate-200 dark:bg-slate-600" : ""}`}
            onClick={() => setViewMode("calendar")}
          >
            {t.recurringViewCalendar}
          </button>
        </div>
      </div>

      {/* Suggestions count + Review section (only when there are suggestions) */}
      {hasSuggestions && (
      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-slate-600 dark:text-slate-300">
            {t.recurringSuggestionsCount.replace("{n}", String(suggestedItems.length))}
          </span>
          {reviewCardCollapsed && (
            <button
              type="button"
              className="text-sm font-medium text-amber-700 dark:text-amber-300 hover:underline"
              onClick={() => setReviewCardCollapsed(false)}
            >
              {t.recurringReviewSuggestions}
            </button>
          )}
        </div>

        {/* Card-based review: one suggestion at a time (hidden when skipped with single suggestion) */}
        {currentReviewItem && !reviewCardCollapsed && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
            <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
              {t.recurringReviewSuggestions} — {t.recurringProgressOf.replace("{i}", String(reviewIndex + 1)).replace("{n}", String(suggestedItems.length))}
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {currentReviewItem.name || currentReviewItem.description_pattern || "—"}
                </span>
                {currentReviewItem.confidence != null && (
                  <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 text-xs dark:bg-slate-600">
                    {currentReviewItem.confidence}%
                  </span>
                )}
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {frequencyLabel(currentReviewItem.frequency)} · {currentReviewItem.expected_amount ?? t.recurringAmountVaries} · {getAccountLabel(currentReviewItem.bank_account_id)}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`${iconBtnClass} border-[var(--primary)] text-[var(--primary)]`}
                  title={t.recurringConfirm}
                  aria-label={t.recurringConfirm}
                  onClick={() => handleConfirmSuggestion(currentReviewItem.id)}
                >
                  <i className="fa-solid fa-check" aria-hidden />
                </button>
                <button
                  type="button"
                  className={`${iconBtnClass} border-slate-300 dark:border-slate-600`}
                  title={t.recurringDismiss}
                  aria-label={t.recurringDismiss}
                  onClick={() => handleDismissSuggestion(currentReviewItem.id)}
                >
                  <i className="fa-solid fa-xmark" aria-hidden />
                </button>
                <button
                  type="button"
                  className={`${iconBtnClass} border-slate-300 dark:border-slate-600`}
                  title={t.recurringEditThenConfirm}
                  aria-label={t.recurringEditThenConfirm}
                  onClick={() => {
                    openEdit(currentReviewItem);
                    if (reviewIndex < suggestedItems.length - 1) setReviewIndex((i) => i + 1);
                    else setReviewIndex(0);
                  }}
                >
                  <i className="fa-solid fa-pen" aria-hidden />
                </button>
                <button
                  type="button"
                  className={`${iconBtnClass} border-slate-300 dark:border-slate-600`}
                  title={t.recurringSkip}
                  aria-label={t.recurringSkip}
                  onClick={() => {
                    if (suggestedItems.length <= 1) {
                      setReviewCardCollapsed(true);
                    } else {
                      setReviewIndex((i) => (i >= suggestedItems.length - 1 ? 0 : i + 1));
                    }
                  }}
                >
                  <i className="fa-solid fa-forward" aria-hidden />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {viewMode === "calendar" ? (
        <RecurringCalendar
          apiBase={apiBase}
          token={token}
          accounts={accounts}
          selectedAccountId={selectedAccountId}
          onAccountChange={setSelectedAccountId}
          onOpenRecurring={(recurringId) => {
            const rec = list.find((r) => r.id === recurringId);
            if (rec) openEdit(rec);
          }}
          locale={locale}
          t={{
            filterAccount: t.filterAccount,
            filterAccountAll: t.filterAccountAll,
            recurringViewList: t.recurringViewList,
            recurringViewCalendar: t.recurringViewCalendar,
            calendarToday: t.calendarToday,
            calendarMonthTitle: t.calendarMonthTitle,
            calendarSummaryTransactions: t.calendarSummaryTransactions,
            calendarSummaryAmount: t.calendarSummaryAmount,
            recurringAmountVaries: t.recurringAmountVaries,
            recurringEdit: t.recurringEdit,
            recurringEmpty: t.recurringEmpty,
            calendarUpcoming: t.calendarUpcoming,
          }}
        />
      ) : (
        <>
      {/* Filters + Create */}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-slate-600 dark:text-slate-400">{t.filterAccount}</span>
          <select
            className="rounded border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
            value={selectedAccountId === "all" ? "all" : selectedAccountId}
            onChange={(e) =>
              setSelectedAccountId(e.target.value === "all" ? "all" : parseInt(e.target.value, 10))
            }
          >
            <option value="all">{t.filterAccountAll}</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.friendly_name || acc.account_name || acc.institution_name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-slate-600 dark:text-slate-400">{t.filterStatus}</span>
          <select
            className="rounded border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{t.filterStatusAll}</option>
            <option value="active">{t.filterStatusActive}</option>
            <option value="paused">{t.filterStatusPaused}</option>
            <option value="suggested">{t.filterStatusSuggested}</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-slate-600 dark:text-slate-400">{t.sortBy}</span>
          <select
            className="rounded border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as "next_date" | "name" | "frequency" | "amount" | "confidence"
              )
            }
          >
            <option value="next_date">{t.sortNextDate}</option>
            <option value="name">{t.sortName}</option>
            <option value="frequency">{t.sortFrequency}</option>
            <option value="amount">{t.sortAmount}</option>
            <option value="confidence">{t.sortConfidence}</option>
          </select>
        </label>
        <input
          type="search"
          placeholder={t.searchPlaceholder}
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          type="button"
          className={`${iconBtnClass} ml-auto border-[var(--primary)] text-[var(--primary)] bg-[var(--primary-50)]`}
          title={t.recurringCreateManual}
          aria-label={t.recurringCreateManual}
          onClick={() => {
            setCreateAccountId(
              selectedAccountId === "all" ? (accounts[0]?.id ?? null) : selectedAccountId
            );
            setCreateModalOpen(true);
          }}
        >
          <i className="fa-solid fa-plus" aria-hidden />
        </button>
      </div>

      {/* List */}
      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        {loading ? (
          <div className="p-8 text-center text-slate-500">{t.recurringFinding}</div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500 dark:text-slate-400">{t.recurringEmpty}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {t.recurringEmptyGuidance}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                <th className="p-3 text-left font-medium">{t.detailName}</th>
                <th className="p-3 text-left">{t.recurringFrequency}</th>
                <th className="p-3 text-left">{t.recurringNext}</th>
                <th className="p-3 text-left">{t.recurringAmount}</th>
                <th className="p-3 text-left">{t.filterStatus}</th>
                {selectedAccountId === "all" && <th className="p-3 text-left">{t.filterAccount}</th>}
                <th className="p-3 text-right whitespace-nowrap">{t.recurringEdit}</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((rec) => (
                <tr
                  key={rec.id}
                  className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                >
                  <td className="p-3">
                    <span className="font-medium">{rec.name || rec.description_pattern || "—"}</span>
                    {rec.confidence != null && rec.status === "suggested" && (
                      <span className="ml-1 rounded bg-amber-100 px-1 text-xs dark:bg-amber-900/40">
                        {rec.confidence}%
                      </span>
                    )}
                  </td>
                  <td className="p-3">{frequencyLabel(rec.frequency)}</td>
                  <td className="p-3">{formatCountdown(rec.next_expected_date, locale, t)}</td>
                  <td className="p-3">{rec.expected_amount != null && rec.expected_amount.trim() !== "" ? formatExpectedAmount(rec.expected_amount, locale) : rec.nominal_amount != null && rec.nominal_amount.trim() !== "" ? "~" + formatExpectedAmount(rec.nominal_amount, locale) : t.recurringAmountVaries}</td>
                  <td className="p-3">
                    {(() => {
                      const s = statusIcon(rec.status);
                      return (
                        <span
                          className={`inline-flex items-center justify-center ${s.color}`}
                          title={s.tooltip}
                          role="img"
                          aria-label={s.tooltip}
                        >
                          <i className={`${s.icon} text-base`} aria-hidden />
                        </span>
                      );
                    })()}
                  </td>
                  {selectedAccountId === "all" && (
                    <td className="p-3 text-slate-500">{getAccountLabel(rec.bank_account_id)}</td>
                  )}
                  <td className="p-3 text-right whitespace-nowrap">
                    <div className="inline-flex flex-nowrap items-center justify-end gap-1">
                      {/* Show Confirm only when status is suggested (backend only allows confirming suggested) */}
                      {(() => {
                        const s = String(rec.status ?? "").toLowerCase();
                        const isSuggested = s === "suggested";
                        return isSuggested ? (
                          <button
                            type="button"
                            className={`${iconBtnClass} shrink-0 border-slate-300 dark:border-slate-600`}
                            title={t.recurringConfirm}
                            aria-label={t.recurringConfirm}
                            onClick={() => handleConfirmSuggestion(rec.id)}
                          >
                            <i className="fa-solid fa-check text-xs text-emerald-600 dark:text-emerald-400" aria-hidden />
                          </button>
                        ) : null;
                      })()}
                      <button
                        type="button"
                        className={`${iconBtnClass} shrink-0 border-slate-300 dark:border-slate-600`}
                        title={t.recurringEdit}
                        aria-label={t.recurringEdit}
                        onClick={() => openEdit(rec)}
                      >
                        <i className="fa-solid fa-pen text-xs" aria-hidden />
                      </button>
                      <button
                        type="button"
                        className={`${iconBtnClass} shrink-0 border-slate-300 dark:border-slate-600`}
                        title={rec.status === "paused" ? t.recurringResume : t.recurringPause}
                        aria-label={rec.status === "paused" ? t.recurringResume : t.recurringPause}
                        onClick={() => pauseResume(rec.id, rec.status)}
                      >
                        <i className={`fa-solid ${rec.status === "paused" ? "fa-play" : "fa-pause"} text-xs`} aria-hidden />
                      </button>
                      <button
                        type="button"
                        className={`${iconBtnClass} shrink-0 border-red-200 text-red-600 dark:border-red-800 dark:text-red-400`}
                        title={t.recurringDelete}
                        aria-label={t.recurringDelete}
                        onClick={() => setDeleteConfirmId(rec.id)}
                      >
                        <i className="fa-solid fa-trash text-xs" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
        </>
      )}

      {/* Edit modal */}
      {editId != null && (
        <div className="modal-overlay" onClick={() => setEditId(null)}>
          <div className="modal-card max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="card-title">{t.recurringEdit}</h3>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-sm">
                <span>{t.detailName}</span>
                <input
                  type="text"
                  className="input"
                  value={editForm.name ?? ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span>{t.detailDescriptionPattern}</span>
                <input
                  type="text"
                  className="input"
                  value={editForm.description_pattern ?? ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, description_pattern: e.target.value }))}
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="grid gap-1 text-sm">
                  <span>{t.detailFrequency}</span>
                  <select
                    className="input"
                    value={editForm.frequency ?? "monthly"}
                    onChange={(e) => setEditForm((f) => ({ ...f, frequency: e.target.value }))}
                  >
                    <option value="weekly">{t.recurringFrequencyWeekly}</option>
                    <option value="biweekly">{t.recurringFrequencyBiweekly}</option>
                    <option value="monthly">{t.recurringFrequencyMonthly}</option>
                    <option value="quarterly">{t.recurringFrequencyQuarterly}</option>
                    <option value="yearly">{t.recurringFrequencyYearly}</option>
                  </select>
                </label>
                <label className="grid gap-1 text-sm">
                  <span>{t.detailAnchorDay}</span>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    className="input"
                    value={editForm.anchor_day ?? 1}
                    onChange={(e) => setEditForm((f) => ({ ...f, anchor_day: parseInt(e.target.value, 10) || 1 }))}
                  />
                </label>
              </div>
              <label className="grid gap-1 text-sm">
                <span>{t.detailExpectedAmount}</span>
                <input
                  type="text"
                  className="input"
                  placeholder="-50.00 or leave empty for Varies"
                  value={editForm.expected_amount ?? ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, expected_amount: e.target.value }))}
                />
                {!(editForm.expected_amount ?? "").trim() && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">{t.recurringAmountVaries}</span>
                )}
              </label>
              {!(editForm.expected_amount ?? "").trim() && (
                <label className="grid gap-1 text-sm">
                  <span>{t.detailNominalAmount}</span>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. 80.00"
                    value={editForm.nominal_amount ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, nominal_amount: e.target.value }))}
                  />
                </label>
              )}
              <label className="grid gap-1 text-sm">
                <span>{t.detailDayTolerance}</span>
                <input
                  type="number"
                  min={0}
                  className="input"
                  value={editForm.day_tolerance_before ?? 1}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10) || 0;
                    setEditForm((f) => ({
                      ...f,
                      day_tolerance_before: v,
                      day_tolerance_after: v,
                      missing_grace_days: v,
                    }));
                  }}
                />
              </label>
              {(editForm.expected_amount ?? "").trim() ? (
                <label className="grid gap-1 text-sm">
                  <span>{t.detailAmountTolerance}</span>
                  <input
                    type="text"
                    className="input"
                    value={editForm.amount_tolerance_below ?? "0"}
                    onChange={(e) => {
                      const v = e.target.value;
                      setEditForm((f) => ({ ...f, amount_tolerance_below: v, amount_tolerance_above: v }));
                    }}
                  />
                </label>
              ) : null}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editForm.alert_on_occurrence ?? true}
                    onChange={(e) => setEditForm((f) => ({ ...f, alert_on_occurrence: e.target.checked }))}
                  />
                  {t.detailAlertOnOccurrence}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editForm.alert_on_missing ?? true}
                    onChange={(e) => setEditForm((f) => ({ ...f, alert_on_missing: e.target.checked }))}
                  />
                  {t.detailAlertOnMissing}
                </label>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className={`${iconBtnClass} border-slate-300 dark:border-slate-600`}
                title={t.modalCancel}
                aria-label={t.modalCancel}
                onClick={() => setEditId(null)}
              >
                <i className="fa-solid fa-xmark" aria-hidden />
              </button>
              <button
                type="button"
                className={`${iconBtnClass} border-[var(--primary)] bg-[var(--primary)] text-white`}
                title={t.modalSave}
                aria-label={t.modalSave}
                onClick={saveEdit}
              >
                <i className="fa-solid fa-check" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {createModalOpen && (
        <div className="modal-overlay" onClick={() => setCreateModalOpen(false)}>
          <div className="modal-card max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="card-title">{t.createRecurringTitle}</h3>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-sm">
                <span>{t.filterAccount}</span>
                <select
                  className="input"
                  value={createAccountId ?? ""}
                  onChange={(e) => setCreateAccountId(parseInt(e.target.value, 10) || null)}
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.friendly_name || acc.account_name || acc.institution_name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                <span>{t.detailName}</span>
                <input
                  type="text"
                  className="input"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span>{t.detailDescriptionPattern}</span>
                <input
                  type="text"
                  className="input"
                  value={createForm.description_pattern}
                  onChange={(e) => setCreateForm((f) => ({ ...f, description_pattern: e.target.value }))}
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="grid gap-1 text-sm">
                  <span>{t.detailFrequency}</span>
                  <select
                    className="input"
                    value={createForm.frequency}
                    onChange={(e) => setCreateForm((f) => ({ ...f, frequency: e.target.value }))}
                  >
                    <option value="weekly">{t.recurringFrequencyWeekly}</option>
                    <option value="biweekly">{t.recurringFrequencyBiweekly}</option>
                    <option value="monthly">{t.recurringFrequencyMonthly}</option>
                    <option value="quarterly">{t.recurringFrequencyQuarterly}</option>
                    <option value="yearly">{t.recurringFrequencyYearly}</option>
                  </select>
                </label>
                <label className="grid gap-1 text-sm">
                  <span>{t.detailAnchorDay}</span>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    className="input"
                    value={createForm.anchor_day}
                    onChange={(e) => setCreateForm((f) => ({ ...f, anchor_day: parseInt(e.target.value, 10) || 1 }))}
                  />
                </label>
              </div>
              <label className="grid gap-1 text-sm">
                <span>{t.detailExpectedAmount}</span>
                <input
                  type="text"
                  className="input"
                  placeholder="-50.00 or leave empty for Varies"
                  value={createForm.expected_amount}
                  onChange={(e) => setCreateForm((f) => ({ ...f, expected_amount: e.target.value }))}
                />
                {!createForm.expected_amount.trim() && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">{t.recurringAmountVaries}</span>
                )}
              </label>
              {!createForm.expected_amount.trim() && (
                <label className="grid gap-1 text-sm">
                  <span>{t.detailNominalAmount}</span>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. 80.00"
                    value={createForm.nominal_amount}
                    onChange={(e) => setCreateForm((f) => ({ ...f, nominal_amount: e.target.value }))}
                  />
                </label>
              )}
              <label className="grid gap-1 text-sm">
                <span>{t.detailDayTolerance}</span>
                <input
                  type="number"
                  min={0}
                  className="input"
                  value={createForm.day_tolerance_before}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10) || 0;
                    setCreateForm((f) => ({
                      ...f,
                      day_tolerance_before: v,
                      day_tolerance_after: v,
                      missing_grace_days: v,
                    }));
                  }}
                />
              </label>
              {createForm.expected_amount.trim() ? (
                <label className="grid gap-1 text-sm">
                  <span>{t.detailAmountTolerance}</span>
                  <input
                    type="text"
                    className="input"
                    value={createForm.amount_tolerance_below}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCreateForm((f) => ({ ...f, amount_tolerance_below: v, amount_tolerance_above: v }));
                    }}
                  />
                </label>
              ) : null}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={createForm.alert_on_occurrence}
                    onChange={(e) => setCreateForm((f) => ({ ...f, alert_on_occurrence: e.target.checked }))}
                  />
                  {t.detailAlertOnOccurrence}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={createForm.alert_on_missing}
                    onChange={(e) => setCreateForm((f) => ({ ...f, alert_on_missing: e.target.checked }))}
                  />
                  {t.detailAlertOnMissing}
                </label>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className={`${iconBtnClass} border-slate-300 dark:border-slate-600`}
                title={t.modalCancel}
                aria-label={t.modalCancel}
                onClick={() => setCreateModalOpen(false)}
              >
                <i className="fa-solid fa-xmark" aria-hidden />
              </button>
              <button
                type="button"
                className={`${iconBtnClass} border-[var(--primary)] bg-[var(--primary)] text-white disabled:opacity-50`}
                title={t.modalSave}
                aria-label={t.modalSave}
                onClick={createRecurring}
                disabled={!createForm.name.trim() || createAccountId == null}
              >
                <i className="fa-solid fa-check" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirmId != null && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-recurring-title"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="modal-card max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="delete-recurring-title" className="card-title">
              {t.deleteConfirm}
            </h3>
            {(() => {
              const rec = list.find((r) => r.id === deleteConfirmId);
              return rec ? (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 truncate" title={rec.name || rec.description_pattern || ""}>
                  {rec.name || rec.description_pattern || "—"}
                </p>
              ) : null;
            })()}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className={`${iconBtnClass} border-slate-300 dark:border-slate-600`}
                title={t.modalCancel}
                aria-label={t.modalCancel}
                onClick={() => setDeleteConfirmId(null)}
              >
                <i className="fa-solid fa-xmark" aria-hidden />
              </button>
              <button
                type="button"
                className={`${iconBtnClass} border-red-500 bg-red-500 text-white hover:opacity-90`}
                title={t.modalConfirm}
                aria-label={t.modalConfirm}
                onClick={() => deleteRecurring(deleteConfirmId)}
              >
                <i className="fa-solid fa-check" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
