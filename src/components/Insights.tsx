import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { downloadBlob, localTransactionsGetAll } from "../services/localTransactions";
import type { LocalTransaction } from "../services/localTransactions";

export type InsightsTranslation = {
  navInsights: string;
  insightsPeriod: string;
  insightsAccounts: string;
  insightsTags: string;
  insightsCategories: string;
  insightsPeriodCurrentMonth: string;
  insightsPeriodLastMonth: string;
  insightsPeriodYtd: string;
  insightsPeriodLast12Months: string;
  insightsPeriodCustom: string;
  insightsDateFrom: string;
  insightsDateTo: string;
  insightsAllAccounts: string;
  insightsAllTags: string;
  insightsAllCategories: string;
  insightsNoCategory: string;
  insightsNoTag: string;
  insightsSaveConfig: string;
  insightsLoadConfig: string;
  insightsSetDefault: string;
  insightsConfigName: string;
  insightsConfigNamePlaceholder: string;
  insightsSaveAsDefault: string;
  insightsSaved: string;
  insightsLoadConfigTitle: string;
  insightsNoConfigs: string;
  insightsDeleteConfig: string;
  insightsDeleteConfigConfirm: string;
  insightsConfigDeleted: string;
  insightsExportPdf: string;
  insightsCardReceived: string;
  insightsReceivedListTotal: string;
  insightsCardPaid: string;
  insightsShowMax: string;
  insightsShowAll: string;
  insightsCardByCategory: string;
  insightsCardTotals: string;
  insightsCardBalanceHistory: string;
  insightsCardBalanceAccumulated: string;
  insightsCardBalanceComparison: string;
  insightsAccount: string;
  insightsNavigateToTop: string;
  insightsTotalReceived: string;
  insightsTotalPaid: string;
  insightsDifference: string;
  insightsDate: string;
  insightsDescription: string;
  insightsAmount: string;
  insightsCategory: string;
  insightsEmpty: string;
  insightsMonth: string;
  insightsBalance: string;
  insightsBalanceForecast: string;
  insightsEstimatedRemaining: string;
  insightsEstimatedRevenueLabel: string;
  insightsMonthEstimate: string;
  insightsExportEstimateExcel: string;
  insightsComment: string;
  modalCancel: string;
  modalConfirm: string;
};

const VITE_DEBUG_RAW = import.meta.env.VITE_DEBUG;
const DEBUG_EOM_ESTIMATE = VITE_DEBUG_RAW === "1" || VITE_DEBUG_RAW === "true";

type BalanceForecastResponse = {
  current_balance: number;
  eom_balance: number;
  eom_revenue: number;
  eom_expenses: number;
  balance_forecast: Array<{ date: string; balance: number }>;
  by_category_estimate: Array<{
    category_id: number | null;
    category_name: string;
    average_previous_months: number;
    current_mtd: number;
    estimated_total: number;
  }>;
  recurring_until_eom: Array<{ date: string; amount: number; name: string }>;
  calculation_breakdown?: Record<string, unknown> | null;
};

type BankAccount = {
  id: number;
  friendly_name?: string | null;
  account_name?: string | null;
  institution_name?: string | null;
};

type Category = { id: number; name: string };
type Tag = { id: number; name: string };

type InsightsConfigRead = {
  id: number;
  name: string;
  is_default: boolean;
  period: string;
  custom_date_from?: string | null;
  custom_date_to?: string | null;
  account_ids: number[] | null;
  tag_ids: number[] | null;
  category_ids: number[] | null;
  card_collapsed?: Record<string, boolean> | null;
};

type ListRow = {
  id: number;
  booking_date: string | null;
  posting_date?: string | null;
  description: string;
  amount: string;
  currency: string;
  account_name: string;
  category_name: string | null;
  tag_names: string[];
  comment?: string | null;
};

type InsightsData = {
  received_list: ListRow[];
  paid_list?: ListRow[];
  by_category: Array<{ category_id: number | null; category_name: string; total: number }>;
  totals: { total_received: number; total_paid: number; difference: number };
  balance_history: Array<{ date: string; balance: number }>;
  balance_comparison: Array<{
    month: string;
    received: number;
    paid: number;
    difference: number;
  }>;
};

const CARD_IDS = ["received", "paid", "byCategory", "totals", "balanceHistory", "balanceComparison"] as const;
const LIMIT_OPTIONS = [10, 25, 50, 100] as const;
const RECEIVED_LIST_LIMIT = 500;

function periodToDateRange(
  period: string,
  customFrom: string | null,
  customTo: string | null
): { from: string; to: string } | null {
  const today = new Date();
  const toYmd = (d: Date) => d.toISOString().slice(0, 10);
  if (period === "custom" && customFrom && customTo) return { from: customFrom, to: customTo };
  if (period === "current_month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: toYmd(start), to: toYmd(today) };
  }
  if (period === "last_month") {
    const firstThis = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(firstThis.getTime() - 1);
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    return { from: toYmd(start), to: toYmd(end) };
  }
  if (period === "ytd") {
    const start = new Date(today.getFullYear(), 0, 1);
    return { from: toYmd(start), to: toYmd(today) };
  }
  if (period === "last_12_months") {
    const end = new Date(today);
    const start = new Date(today.getFullYear(), today.getMonth() - 12, 1);
    return { from: toYmd(start), to: toYmd(end) };
  }
  return null;
}

function parseAmount(amountStr: string | null | undefined): number {
  if (amountStr == null || String(amountStr).trim() === "") return 0;
  const n = Number(String(amountStr).trim());
  return Number.isNaN(n) ? 0 : n;
}

function buildInsightsFromLocalTransactions(
  list: LocalTransaction[],
  dateFrom: string,
  dateTo: string
): InsightsData {
  const filtered = list.filter((tx) => {
    if (tx.include_in_totals === false) return false;
    const d = tx.posting_date || tx.booking_date;
    if (!d) return false;
    if (d < dateFrom || d > dateTo) return false;
    return true;
  });
  filtered.sort(
    (a, b) =>
      (a.posting_date || a.booking_date || "").localeCompare(b.posting_date || b.booking_date || "") ||
      0
  );

  const toListRow = (tx: LocalTransaction, accountName: string): ListRow => ({
    id: tx.id || 0,
    booking_date: tx.booking_date ?? null,
    posting_date: tx.posting_date ?? null,
    description: tx.description ?? "",
    amount: tx.amount,
    currency: tx.currency ?? "",
    account_name: accountName,
    category_name: tx.category_name ?? null,
    tag_names: (tx.tags ?? []).map((t) => t.name),
    comment: tx.comment ?? null,
  });

  const accountName = (tx: LocalTransaction) =>
    tx.account_friendly_name ?? tx.account_name ?? tx.institution_name ?? "";

  const receivedCandidates = filtered
    .filter((tx) => parseAmount(tx.amount) > 0)
    .map((tx) => ({ tx, amt: parseAmount(tx.amount) }))
    .sort((a, b) => b.amt - a.amt || (a.tx.posting_date || "").localeCompare(b.tx.posting_date || ""));
  const received_list = receivedCandidates
    .slice(0, RECEIVED_LIST_LIMIT)
    .map(({ tx }) => toListRow(tx, accountName(tx)));

  const paidCandidates = filtered
    .filter((tx) => parseAmount(tx.amount) < 0)
    .map((tx) => ({ tx, amt: parseAmount(tx.amount) }))
    .sort((a, b) => a.amt - b.amt || (a.tx.posting_date || "").localeCompare(b.tx.posting_date || ""));
  const paid_list = paidCandidates
    .slice(0, RECEIVED_LIST_LIMIT)
    .map(({ tx }) => toListRow(tx, accountName(tx)));

  let total_received = 0;
  let total_paid = 0;
  for (const tx of filtered) {
    const amt = parseAmount(tx.amount);
    if (amt > 0) total_received += amt;
    else total_paid += Math.abs(amt);
  }
  const totals = {
    total_received: Math.round(total_received * 100) / 100,
    total_paid: Math.round(total_paid * 100) / 100,
    difference: Math.round((total_received - total_paid) * 100) / 100,
  };

  const catSums: Record<number | string, number> = {};
  const catNames: Record<number | string, string> = { "": "Uncategorized" };
  for (const tx of filtered) {
    const cid = tx.category_id ?? "";
    const key = cid === null ? "" : cid;
    catSums[key] = (catSums[key] ?? 0) + parseAmount(tx.amount);
    if (key !== "" && tx.category_name) catNames[key] = tx.category_name;
  }
  const by_category = Object.entries(catSums)
    .map(([cid, total]) => ({
      category_id: cid === "" ? null : (Number(cid) as number),
      category_name: catNames[cid] ?? (cid === "" ? "Uncategorized" : ""),
      total: Math.round(total * 100) / 100,
    }))
    .sort((a, b) => a.total - b.total);

  let running = 0;
  const balance_history = filtered
    .filter((tx) => tx.posting_date || tx.booking_date)
    .map((tx) => {
      running += parseAmount(tx.amount);
      return {
        date: tx.posting_date || tx.booking_date || "",
        balance: Math.round(running * 100) / 100,
      };
    });

  const monthData: Record<string, { received: number; paid: number }> = {};
  for (const tx of filtered) {
    const d = tx.posting_date || tx.booking_date;
    if (!d) continue;
    const key = d.slice(0, 7);
    if (!monthData[key]) monthData[key] = { received: 0, paid: 0 };
    const amt = parseAmount(tx.amount);
    if (amt > 0) monthData[key].received += amt;
    else monthData[key].paid += Math.abs(amt);
  }
  const balance_comparison = Object.keys(monthData)
    .sort()
    .map((month) => ({
      month,
      received: Math.round(monthData[month].received * 100) / 100,
      paid: Math.round(monthData[month].paid * 100) / 100,
      difference: Math.round((monthData[month].received - monthData[month].paid) * 100) / 100,
    }));

  return {
    received_list,
    paid_list,
    by_category,
    totals,
    balance_history,
    balance_comparison,
  };
}

type Props = {
  apiBase: string;
  apiToken: string | null;
  bankAccounts: BankAccount[];
  categories: Category[];
  tags: Tag[];
  locale: string;
  t: InsightsTranslation;
  showToast: (text: string, type: "success" | "warning" | "error") => void;
  storageMode?: "cloud" | "local";
};

function formatAmount(value: number, currency = "EUR", locale: string, decimals = false): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      useGrouping: true,
      minimumFractionDigits: decimals ? 2 : 0,
      maximumFractionDigits: decimals ? 2 : 0,
    }).format(value);
  } catch {
    return decimals ? `${value.toFixed(2)} ${currency}` : `${Math.round(value)} ${currency}`;
  }
}

function formatMonth(monthStr: string, locale: string): string {
  const [y, m] = monthStr.split("-").map(Number);
  const d = new Date(y, (m || 1) - 1, 1);
  return new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" }).format(d);
}

/** Base height for chart containers; category chart uses dynamic height. */
const CHART_HEIGHT = 256;
const CATEGORY_BAR_HEIGHT = 40;
const CATEGORY_CHART_MAX_HEIGHT = 900;
const CATEGORY_LABEL_MAX_LEN = 22;
const CATEGORY_LABEL_TRUNCATE_TO = 19;

const CATEGORY_LABEL_FONT_SIZE = 14;

function truncateCategoryLabel(value: unknown): string {
  try {
    const s = value != null ? String(value) : "";
    return s.length > CATEGORY_LABEL_MAX_LEN
      ? `${s.slice(0, CATEGORY_LABEL_TRUNCATE_TO)}...`
      : s;
  } catch {
    return "";
  }
}

const popupStyle: React.CSSProperties = {
  position: "fixed",
  zIndex: 9999,
  background: "var(--background)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  padding: "10px 12px",
  maxWidth: "320px",
  minWidth: "200px",
  fontSize: "13px",
  lineHeight: 1.4,
};

function TransactionRowPopup({
  row,
  t,
  locale,
  formatAmount,
  rect,
  cursorX,
  amountColor,
}: {
  row: ListRow;
  t: InsightsTranslation;
  locale: string;
  formatAmount: (value: number, currency: string, locale: string, decimals: boolean) => string;
  rect: DOMRect;
  cursorX: number;
  amountColor: string;
}) {
  const dateStr =
    row.posting_date ?? row.booking_date
      ? new Date(row.posting_date ?? row.booking_date ?? "").toLocaleDateString(locale, {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
      : "—";
  return (
    <div
      className="insights-transaction-popup"
      style={{
        ...popupStyle,
        left: cursorX,
        top: rect.bottom + 6,
        transform: "translateX(-50%)",
      }}
    >
      <div style={{ marginBottom: "4px" }}>
        <span style={{ color: "var(--text-secondary)", marginRight: "6px" }}>{t.insightsDate}:</span>
        <span style={{ color: "var(--text)" }}>{dateStr}</span>
      </div>
      <div style={{ marginBottom: "4px" }}>
        <span style={{ color: "var(--text-secondary)", marginRight: "6px" }}>{t.insightsDescription}:</span>
        <span style={{ color: "var(--text)", wordBreak: "break-word" }}>{row.description || "—"}</span>
      </div>
      <div style={{ marginBottom: "4px" }}>
        <span style={{ color: "var(--text-secondary)", marginRight: "6px" }}>{t.insightsAccount}:</span>
        <span style={{ color: "var(--text)" }}>{row.account_name || "—"}</span>
      </div>
      <div style={{ marginBottom: "4px" }}>
        <span style={{ color: "var(--text-secondary)", marginRight: "6px" }}>{t.insightsAmount}:</span>
        <span style={{ color: amountColor }}>{formatAmount(Number(row.amount), row.currency, locale, true)}</span>
      </div>
      <div style={{ marginBottom: "4px" }}>
        <span style={{ color: "var(--text-secondary)", marginRight: "6px" }}>{t.insightsCategory}:</span>
        <span style={{ color: "var(--text)" }}>{row.category_name ?? "—"}</span>
      </div>
      <div style={{ marginBottom: "4px" }}>
        <span style={{ color: "var(--text-secondary)", marginRight: "6px" }}>{t.insightsTags}:</span>
        <span style={{ color: "var(--text)" }}>{row.tag_names?.length ? row.tag_names.join(", ") : "—"}</span>
      </div>
      {(row.comment ?? "").trim() ? (
        <div>
          <span style={{ color: "var(--text-secondary)", marginRight: "6px" }}>{t.insightsComment}:</span>
          <span style={{ color: "var(--text)", wordBreak: "break-word" }}>{row.comment}</span>
        </div>
      ) : null}
    </div>
  );
}

export default function Insights({
  apiBase,
  apiToken,
  bankAccounts,
  categories,
  tags,
  locale,
  t,
  showToast,
  storageMode = "cloud",
}: Props) {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const toYmd = (d: Date) => d.toISOString().slice(0, 10);
  const [period, setPeriod] = useState<string>("current_month");
  const [customDateFrom, setCustomDateFrom] = useState<string>(() => toYmd(firstOfMonth));
  const [customDateTo, setCustomDateTo] = useState<string>(() => toYmd(today));
  const [accountIds, setAccountIds] = useState<number[] | null>(null);
  const [tagIds, setTagIds] = useState<number[] | null>(null);
  const [categoryIds, setCategoryIds] = useState<number[] | null>(null);
  const [includeUntagged, setIncludeUntagged] = useState(true);
  const [includeUncategorized, setIncludeUncategorized] = useState(true);
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null);
  const [balanceForecast, setBalanceForecast] = useState<BalanceForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState<InsightsConfigRead[]>([]);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [deleteConfigModal, setDeleteConfigModal] = useState<{ config: InsightsConfigRead | null }>({ config: null });
  const [loadDropdownOpen, setLoadDropdownOpen] = useState(false);
  const [accountsDropdownOpen, setAccountsDropdownOpen] = useState(false);
  const [tagsDropdownOpen, setTagsDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [appliedConfigId, setAppliedConfigId] = useState<number | null>(null);
  const [cardCollapsed, setCardCollapsed] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {};
    CARD_IDS.forEach((id) => (o[id] = false));
    return o;
  });
  const [receivedLimit, setReceivedLimit] = useState<number | null>(null);
  const [paidLimit, setPaidLimit] = useState<number | null>(10);
  const [hoveredRow, setHoveredRow] = useState<{
    row: ListRow;
    rect: DOMRect;
    cursorX: number;
    amountColor: string;
  } | null>(null);
  const defaultAppliedRef = useRef(false);
  const accountsDropdownRef = useRef<HTMLDivElement>(null);
  const tagsDropdownRef = useRef<HTMLDivElement>(null);
  const categoriesDropdownRef = useRef<HTMLDivElement>(null);
  const loadDropdownRef = useRef<HTMLDivElement>(null);
  const storageModeRef = useRef<"cloud" | "local" | undefined>(storageMode);
  storageModeRef.current = storageMode;

  const emptyInsightsData: InsightsData = {
    received_list: [],
    paid_list: [],
    by_category: [],
    totals: { total_received: 0, total_paid: 0, difference: 0 },
    balance_history: [],
    balance_comparison: [],
  };

  const fetchInsights = useCallback(async () => {
    const noAccountSelected = accountIds !== null && accountIds.length === 0;
    const noCategorySelected =
      categoryIds !== null && categoryIds.length === 0 && !includeUncategorized;
    const noTagSelected = tagIds !== null && tagIds.length === 0 && !includeUntagged;
    if (noAccountSelected || noCategorySelected || noTagSelected) {
      setInsightsData(emptyInsightsData);
      setLoading(false);
      return;
    }
    if (period === "custom" && (!customDateFrom || !customDateTo)) {
      setInsightsData(emptyInsightsData);
      setLoading(false);
      return;
    }
    if (storageMode === undefined) {
      setLoading(false);
      return;
    }

    if (storageMode === "local") {
      setLoading(true);
      try {
        const range = periodToDateRange(period, customDateFrom, customDateTo);
        if (!range) {
          setInsightsData(emptyInsightsData);
          setLoading(false);
          return;
        }
        let list = await localTransactionsGetAll();
        if (accountIds !== null && accountIds.length > 0) {
          const set = new Set(accountIds);
          list = list.filter((tx) => set.has(tx.bank_account_id));
        }
        if (categoryIds !== null && categoryIds.length > 0) {
          const set = new Set(categoryIds);
          list = list.filter(
            (tx) =>
              (tx.category_id != null && set.has(tx.category_id)) ||
              (includeUncategorized && tx.category_id == null)
          );
        } else if (categoryIds !== null && categoryIds.length === 0) {
          list = includeUncategorized
            ? list.filter((tx) => tx.category_id == null)
            : [];
        }
        if (tagIds !== null && tagIds.length > 0) {
          const set = new Set(tagIds);
          list = list.filter((tx) => {
            const txTags = tx.tags ?? [];
            const hasMatch = txTags.some((tag) => set.has(tag.id));
            return hasMatch || (includeUntagged && txTags.length === 0);
          });
        } else if (tagIds !== null && tagIds.length === 0) {
          list = includeUntagged ? list.filter((tx) => (tx.tags ?? []).length === 0) : [];
        }
        const data = buildInsightsFromLocalTransactions(list, range.from, range.to);
        setInsightsData(data);
      } catch {
        setInsightsData(emptyInsightsData);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!apiToken) return;
    setLoading(true);
    const params = new URLSearchParams();
    params.set("period", period);
    if (period === "custom" && customDateFrom && customDateTo) {
      params.set("date_from", customDateFrom);
      params.set("date_to", customDateTo);
    }
    if (accountIds !== null) {
      params.set("accounts", accountIds.length > 0 ? accountIds.join(",") : "none");
    }
    // Categories: omitted = all; "none" or empty = no selection → no transactions
    if (categoryIds !== null || !includeUncategorized) {
      if (categoryIds !== null && categoryIds.length > 0) {
        params.set("categories", categoryIds.join(","));
      } else if (categoryIds !== null && categoryIds.length === 0) {
        params.set("categories", "none");
      } else if (categoryIds === null && !includeUncategorized) {
        params.set("categories", categories.map((c) => c.id).join(","));
      }
      if (includeUncategorized) params.set("include_uncategorized", "true");
    }
    // Tags: omitted = all; "none" or empty = no selection → no transactions
    if (tagIds !== null || !includeUntagged) {
      if (tagIds !== null && tagIds.length > 0) {
        params.set("tags", tagIds.join(","));
      } else if (tagIds !== null && tagIds.length === 0) {
        params.set("tags", "none");
      } else if (tagIds === null && !includeUntagged) {
        params.set("tags", tags.map((t) => t.id).join(","));
      }
      if (includeUntagged) params.set("include_untagged", "true");
    }
    try {
      const res = await fetch(`${apiBase}/api/insights?${params.toString()}`, {
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (storageModeRef.current === "local") return;
        setInsightsData(data);
        if (period === "current_month") {
          try {
            const forecastRes = await fetch(
              `${apiBase}/api/insights/balance-forecast?${params.toString()}`,
              { headers: { Authorization: `Bearer ${apiToken}` } }
            );
            if (forecastRes.ok) {
              const forecastData = await forecastRes.json();
              setBalanceForecast(forecastData);
              if (DEBUG_EOM_ESTIMATE) {
                console.log("EOM estimate (expand to inspect)", {
                  summary: {
                    current_balance: forecastData.current_balance,
                    eom_balance: forecastData.eom_balance,
                    eom_revenue: forecastData.eom_revenue,
                    eom_expenses: forecastData.eom_expenses,
                  },
                  calculation_breakdown: forecastData.calculation_breakdown ?? null,
                  by_category_estimate: forecastData.by_category_estimate ?? [],
                  recurring_until_eom: forecastData.recurring_until_eom ?? [],
                  balance_forecast_daily: forecastData.balance_forecast ?? [],
                });
              } else {
                console.debug("Balance forecast", {
                  eom_balance: forecastData.eom_balance,
                  eom_revenue: forecastData.eom_revenue,
                  eom_expenses: forecastData.eom_expenses,
                  balance_forecast_count: forecastData.balance_forecast?.length,
                  by_category_count: forecastData.by_category_estimate?.length,
                });
              }
            } else {
              setBalanceForecast(null);
            }
          } catch {
            setBalanceForecast(null);
          }
        } else {
          setBalanceForecast(null);
        }
      } else {
        if (storageModeRef.current === "local") return;
        setInsightsData(null);
        setBalanceForecast(null);
      }
    } catch {
      if (storageModeRef.current === "local") return;
      setInsightsData(null);
      setBalanceForecast(null);
    } finally {
      setLoading(false);
    }
  }, [apiBase, apiToken, storageMode, period, customDateFrom, customDateTo, accountIds, categoryIds, tagIds, includeUncategorized, includeUntagged, categories, tags]);

  const exportEstimateToCsv = useCallback(() => {
    if (!balanceForecast) return;
    const rows: string[] = [];
    const esc = (v: string | number) => (typeof v === "string" && (v.includes(",") || v.includes('"') || v.includes("\n")) ? `"${v.replace(/"/g, '""')}"` : String(v));
    rows.push("section,key,value");
    rows.push(`summary,eom_balance,${balanceForecast.eom_balance}`);
    rows.push(`summary,eom_revenue,${balanceForecast.eom_revenue}`);
    rows.push(`summary,eom_expenses,${balanceForecast.eom_expenses}`);
    rows.push("");
    rows.push("category_id,category_name,average_previous_months,current_mtd,estimated_total");
    for (const e of balanceForecast.by_category_estimate || []) {
      rows.push([e.category_id ?? "", e.category_name, e.average_previous_months, e.current_mtd, e.estimated_total].map(esc).join(","));
    }
    rows.push("");
    rows.push("date,amount,name");
    for (const r of balanceForecast.recurring_until_eom || []) {
      rows.push([r.date, r.amount, r.name].map(esc).join(","));
    }
    rows.push("");
    rows.push("date,balance");
    for (const p of balanceForecast.balance_forecast || []) {
      rows.push([p.date, p.balance].map(esc).join(","));
    }
    const csv = "\uFEFF" + rows.join("\n");
    const date = new Date().toISOString().slice(0, 10);
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `eurodata-balance-estimate-${date}.csv`);
    showToast(t.insightsExportEstimateExcel, "success");
  }, [balanceForecast, t, showToast]);

  const fetchConfigs = useCallback(async () => {
    if (!apiToken) return;
    try {
      const res = await fetch(`${apiBase}/api/insights-configs`, {
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      if (res.ok) {
        const list = await res.json();
        setConfigs(list);
      }
    } catch {
      setConfigs([]);
    }
  }, [apiBase, apiToken]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  useEffect(() => {
    if (!saveModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSaveModalOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saveModalOpen]);

  useEffect(() => {
    if (!deleteConfigModal.config) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeDeleteConfigModal();
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [deleteConfigModal.config]);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (accountsDropdownRef.current?.contains(target)) return;
      if (tagsDropdownRef.current?.contains(target)) return;
      if (categoriesDropdownRef.current?.contains(target)) return;
      if (loadDropdownRef.current?.contains(target)) return;
      setAccountsDropdownOpen(false);
      setTagsDropdownOpen(false);
      setCategoriesDropdownOpen(false);
      setLoadDropdownOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // When category data first becomes available, expand the byCategory card so the chart can render (only on data change, not on user collapse)
  const byCategoryDataLength = insightsData?.by_category?.length ?? 0;
  useEffect(() => {
    if (byCategoryDataLength > 0) {
      setCardCollapsed((prev) => ({ ...prev, byCategory: false }));
    }
  }, [byCategoryDataLength]);

  // On mount: load configs
  useEffect(() => {
    if (!apiToken) return;
    fetchConfigs();
  }, [apiToken, fetchConfigs]);

  // When configs load, apply default config once (then refetch insights in next effect)
  useEffect(() => {
    if (configs.length === 0 || defaultAppliedRef.current) return;
    const defaultConfig = configs.find((c) => c.is_default);
    if (defaultConfig) {
      defaultAppliedRef.current = true;
      setPeriod(defaultConfig.period);
      if (defaultConfig.period === "custom" && defaultConfig.custom_date_from && defaultConfig.custom_date_to) {
        setCustomDateFrom(defaultConfig.custom_date_from);
        setCustomDateTo(defaultConfig.custom_date_to);
      }
      setAccountIds(defaultConfig.account_ids ?? null);
      setTagIds(defaultConfig.tag_ids ?? null);
      setCategoryIds(defaultConfig.category_ids ?? null);
      setIncludeUntagged(true);
      setIncludeUncategorized(true);
      setAppliedConfigId(defaultConfig.id);
      if (defaultConfig.card_collapsed && typeof defaultConfig.card_collapsed === "object") {
        const collapsed = { ...defaultConfig.card_collapsed };
        delete (collapsed as Record<string, boolean>).byCategory;
        setCardCollapsed((prev) => ({ ...prev, ...collapsed }));
      }
    }
  }, [configs]);

  const handleLoadConfig = (config: InsightsConfigRead) => {
    setPeriod(config.period);
    if (config.period === "custom" && config.custom_date_from && config.custom_date_to) {
      setCustomDateFrom(config.custom_date_from);
      setCustomDateTo(config.custom_date_to);
    }
    setAccountIds(config.account_ids ?? null);
    setTagIds(config.tag_ids ?? null);
    setCategoryIds(config.category_ids ?? null);
    setIncludeUntagged(true);
    setIncludeUncategorized(true);
    setAppliedConfigId(config.id);
    if (config.card_collapsed && typeof config.card_collapsed === "object") {
      const collapsed = { ...config.card_collapsed };
      delete (collapsed as Record<string, boolean>).byCategory;
      setCardCollapsed((prev) => ({ ...prev, ...collapsed }));
    }
    setLoadDropdownOpen(false);
    fetchInsights();
  };

  const handleSaveConfig = async () => {
    const name = saveName.trim();
    if (!name || !apiToken) return;
    const existing = configs.find((c) => c.name === name);
    const payload = {
      name,
      period,
      ...(period === "custom" && customDateFrom && customDateTo
        ? { custom_date_from: customDateFrom, custom_date_to: customDateTo }
        : {}),
      account_ids: accountIds,
      tag_ids: tagIds,
      category_ids: categoryIds,
      card_collapsed: cardCollapsed,
      is_default: saveAsDefault,
    };
    try {
      if (existing) {
        const res = await fetch(`${apiBase}/api/insights-configs/${existing.id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const updated = await res.json();
          setAppliedConfigId(updated.id);
          setSaveModalOpen(false);
          setSaveName("");
          setSaveAsDefault(false);
          fetchConfigs();
          showToast(t.insightsSaved, "success");
        }
      } else {
        const res = await fetch(`${apiBase}/api/insights-configs`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const created = await res.json();
          setAppliedConfigId(created.id);
          setSaveModalOpen(false);
          setSaveName("");
          setSaveAsDefault(false);
          fetchConfigs();
          showToast(t.insightsSaved, "success");
        }
      }
    } catch {
      showToast("Failed to save", "error");
    }
  };

  const openDeleteConfigModal = (e: React.MouseEvent, config: InsightsConfigRead) => {
    e.stopPropagation();
    setDeleteConfigModal({ config });
  };

  const closeDeleteConfigModal = () => setDeleteConfigModal({ config: null });

  const confirmDeleteConfig = async () => {
    const config = deleteConfigModal.config;
    if (!config || !apiToken) return;
    try {
      const res = await fetch(`${apiBase}/api/insights-configs/${config.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      if (res.ok) {
        if (appliedConfigId === config.id) setAppliedConfigId(null);
        fetchConfigs();
        setLoadDropdownOpen(false);
        showToast(t.insightsConfigDeleted, "success");
        closeDeleteConfigModal();
      }
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  const handleSetDefault = async () => {
    if (appliedConfigId == null || !apiToken) return;
    try {
      const res = await fetch(`${apiBase}/api/insights-configs/${appliedConfigId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_default: true }),
      });
      if (res.ok) {
        fetchConfigs();
        showToast(t.insightsSaved, "success");
      }
    } catch {
      showToast("Failed to set default", "error");
    }
  };

  const toggleCard = (id: string) => {
    setCardCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAccount = (id: number) => {
    setAccountIds((prev) => {
      const allIds = bankAccounts.map((a) => a.id);
      const selected = prev === null ? allIds : prev;
      const next = selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id];
      if (next.length === 0) return [];
      if (next.length === bankAccounts.length) return null;
      return next;
    });
  };
  const toggleTag = (id: number) => {
    setTagIds((prev) => {
      const allIds = tags.map((t) => t.id);
      const selected = prev === null ? allIds : prev;
      const next = selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id];
      if (next.length === 0) return [];
      if (next.length === tags.length) return null;
      return next;
    });
  };
  const toggleCategory = (id: number) => {
    setCategoryIds((prev) => {
      const allIds = categories.map((c) => c.id);
      const selected = prev === null ? allIds : prev;
      const next = selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id];
      if (next.length === 0) return [];
      if (next.length === categories.length) return null;
      return next;
    });
  };

  const accountChecked = (id: number) =>
    accountIds === null || (accountIds !== null && accountIds.includes(id));
  const tagChecked = (id: number) =>
    tagIds === null || (tagIds !== null && tagIds.includes(id));
  const categoryChecked = (id: number) =>
    categoryIds === null || (categoryIds !== null && categoryIds.includes(id));

  const accountsLabel =
    accountIds === null
      ? t.insightsAllAccounts
      : accountIds.length === 0
        ? t.insightsAccounts
        : `${accountIds.length} ${t.insightsAccounts}`;
  const tagsLabel =
    tagIds === null && includeUntagged
      ? t.insightsAllTags
      : tagIds !== null && tagIds.length > 0
        ? `${tagIds.length + (includeUntagged ? 1 : 0)} ${t.insightsTags}`
        : includeUntagged
          ? t.insightsNoTag
          : t.insightsTags;
  const categoriesLabel =
    categoryIds === null && includeUncategorized
      ? t.insightsAllCategories
      : categoryIds !== null && categoryIds.length > 0
        ? `${categoryIds.length + (includeUncategorized ? 1 : 0)} ${t.insightsCategories}`
        : includeUncategorized
          ? t.insightsNoCategory
          : t.insightsCategories;

  const handleExportPdf = () => {
    window.print();
  };

  return (
    <section className="insights-print-area mx-auto max-w-6xl px-6 pt-14 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-3xl font-semibold" style={{ color: "var(--text)" }}>
          {t.navInsights}
        </h2>
        <button
          type="button"
          className="no-print inline-flex items-center justify-center p-2 rounded border transition-colors min-w-[2.25rem]"
          style={{
            background: "var(--surface-hover)",
            borderColor: "var(--border)",
            color: "var(--text)",
          }}
          onClick={handleExportPdf}
          title={t.insightsExportPdf}
          aria-label={t.insightsExportPdf}
        >
          <i className="fa-solid fa-file-pdf text-sm" aria-hidden />
        </button>
      </div>

      {/* Filters - compact */}
      <div
        className="flex flex-wrap items-end gap-4 mb-6 p-4 rounded-lg border"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>
            {t.insightsPeriod}
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="input"
            style={{
              color: "var(--text)",
              background: "var(--background)",
              borderColor: "var(--border)",
              minWidth: "160px",
            }}
          >
            <option value="current_month">{t.insightsPeriodCurrentMonth}</option>
            <option value="last_month">{t.insightsPeriodLastMonth}</option>
            <option value="ytd">{t.insightsPeriodYtd}</option>
            <option value="last_12_months">{t.insightsPeriodLast12Months}</option>
            <option value="custom">{t.insightsPeriodCustom}</option>
          </select>
          {period === "custom" && (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
                <span>{t.insightsDateFrom}</span>
                <input
                  type="date"
                  className="input"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                  style={{ color: "var(--text)", background: "var(--background)", borderColor: "var(--border)" }}
                />
              </label>
              <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
                <span>{t.insightsDateTo}</span>
                <input
                  type="date"
                  className="input"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                  style={{ color: "var(--text)", background: "var(--background)", borderColor: "var(--border)" }}
                />
              </label>
            </div>
          )}
        </div>

        <div className="relative" ref={accountsDropdownRef}>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>
            {t.insightsAccounts}
          </label>
          <button
            type="button"
            className="input w-full text-left flex items-center justify-between"
            style={{
              color: "var(--text)",
              background: "var(--background)",
              borderColor: "var(--border)",
              minWidth: "140px",
            }}
            onClick={() => {
              setAccountsDropdownOpen(!accountsDropdownOpen);
              setTagsDropdownOpen(false);
              setCategoriesDropdownOpen(false);
            }}
          >
            <span>{accountsLabel}</span>
            <i className={`fa-solid fa-chevron-${accountsDropdownOpen ? "up" : "down"} text-xs`} />
          </button>
          {accountsDropdownOpen && (
            <div
              className="absolute top-full left-0 mt-1 py-2 max-h-48 overflow-y-auto min-w-[200px] rounded-md shadow-lg z-20 border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              {bankAccounts.map((acc) => (
                <label
                  key={acc.id}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm block hover:bg-opacity-80"
                  style={{ background: "transparent" }}
                >
                  <input
                    type="checkbox"
                    checked={accountChecked(acc.id)}
                    onChange={() => toggleAccount(acc.id)}
                  />
                  <span style={{ color: "var(--text)" }}>
                    {acc.friendly_name ?? acc.account_name ?? acc.institution_name ?? `#${acc.id}`}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="relative" ref={tagsDropdownRef}>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>
            {t.insightsTags}
          </label>
          <button
            type="button"
            className="input w-full text-left flex items-center justify-between"
            style={{
              color: "var(--text)",
              background: "var(--background)",
              borderColor: "var(--border)",
              minWidth: "140px",
            }}
            onClick={() => {
              setTagsDropdownOpen(!tagsDropdownOpen);
              setAccountsDropdownOpen(false);
              setCategoriesDropdownOpen(false);
            }}
          >
            <span>{tagsLabel}</span>
            <i className={`fa-solid fa-chevron-${tagsDropdownOpen ? "up" : "down"} text-xs`} />
          </button>
          {tagsDropdownOpen && (
            <div
              className="absolute top-full left-0 mt-1 py-2 max-h-48 overflow-y-auto min-w-[180px] rounded-md shadow-lg z-20 border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <label
                className="flex items-center gap-2 px-3 py-1.5 text-sm block hover:bg-opacity-80"
                style={{ background: "transparent" }}
              >
                <input
                  type="checkbox"
                  checked={includeUntagged}
                  onChange={() => setIncludeUntagged((v) => !v)}
                />
                <span style={{ color: "var(--text)" }}>{t.insightsNoTag}</span>
              </label>
              {tags.map((tag) => (
                <label
                  key={tag.id}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm block hover:bg-opacity-80"
                  style={{ background: "transparent" }}
                >
                  <input
                    type="checkbox"
                    checked={tagChecked(tag.id)}
                    onChange={() => toggleTag(tag.id)}
                  />
                  <span style={{ color: "var(--text)" }}>{tag.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="relative" ref={categoriesDropdownRef}>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>
            {t.insightsCategories}
          </label>
          <button
            type="button"
            className="input w-full text-left flex items-center justify-between"
            style={{
              color: "var(--text)",
              background: "var(--background)",
              borderColor: "var(--border)",
              minWidth: "140px",
            }}
            onClick={() => {
              setCategoriesDropdownOpen(!categoriesDropdownOpen);
              setAccountsDropdownOpen(false);
              setTagsDropdownOpen(false);
            }}
          >
            <span>{categoriesLabel}</span>
            <i className={`fa-solid fa-chevron-${categoriesDropdownOpen ? "up" : "down"} text-xs`} />
          </button>
          {categoriesDropdownOpen && (
            <div
              className="absolute top-full left-0 mt-1 py-2 max-h-48 overflow-y-auto min-w-[200px] rounded-md shadow-lg z-20 border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <label
                className="flex items-center gap-2 px-3 py-1.5 text-sm block hover:bg-opacity-80"
                style={{ background: "transparent" }}
              >
                <input
                  type="checkbox"
                  checked={includeUncategorized}
                  onChange={() => setIncludeUncategorized((v) => !v)}
                />
                <span style={{ color: "var(--text)" }}>{t.insightsNoCategory}</span>
              </label>
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm block hover:bg-opacity-80"
                  style={{ background: "transparent" }}
                >
                  <input
                    type="checkbox"
                    checked={categoryChecked(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                  />
                  <span style={{ color: "var(--text)" }}>{cat.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto no-print">
          <div className="relative" ref={loadDropdownRef}>
            <button
              type="button"
              className="p-2 rounded-md border transition-colors"
              style={{
                background: "var(--surface-hover)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
              title={t.insightsLoadConfig}
              onClick={() => setLoadDropdownOpen(!loadDropdownOpen)}
              aria-label={t.insightsLoadConfig}
            >
              <i className="fa-solid fa-folder-open" />
            </button>
            {loadDropdownOpen && (
              <div
                className="absolute top-full right-0 mt-1 py-2 min-w-[200px] rounded-md shadow-lg z-20 border"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                {configs.length === 0 ? (
                  <div className="px-4 py-2 text-sm" style={{ color: "var(--text-tertiary)" }}>
                    {t.insightsNoConfigs}
                  </div>
                ) : (
                  configs.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-1 w-full group"
                      style={{ background: c.id === appliedConfigId ? "var(--primary-50)" : "transparent" }}
                    >
                      <button
                        type="button"
                        className="flex-1 text-left px-4 py-2 text-sm hover:bg-opacity-80 min-w-0"
                        style={{ color: "var(--text)" }}
                        onClick={() => handleLoadConfig(c)}
                      >
                        {c.name}
                        {c.is_default ? " ★" : ""}
                      </button>
                      <button
                        type="button"
                        className="p-2 text-sm rounded opacity-70 hover:opacity-100"
                        style={{ color: "var(--text-secondary)" }}
                        title={t.insightsDeleteConfig}
                        onClick={(e) => openDeleteConfigModal(e, c)}
                        aria-label={t.insightsDeleteConfig}
                      >
                        <i className="fa-solid fa-trash-can" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            className="p-2 rounded-md border transition-colors"
            style={{
              background: "var(--surface-hover)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
            title={t.insightsSaveConfig}
            onClick={() => {
              setLoadDropdownOpen(false);
              setAccountsDropdownOpen(false);
              setTagsDropdownOpen(false);
              setCategoriesDropdownOpen(false);
              setSaveModalOpen(true);
              setSaveName("");
              setSaveAsDefault(false);
            }}
            aria-label={t.insightsSaveConfig}
          >
            <i className="fa-solid fa-floppy-disk" />
          </button>
          {appliedConfigId != null && (
            <button
              type="button"
              className="p-2 rounded-md border transition-colors"
              style={{
                background: "transparent",
                borderColor: "var(--primary)",
                color: "var(--primary)",
              }}
              title={t.insightsSetDefault}
              onClick={handleSetDefault}
              aria-label={t.insightsSetDefault}
            >
              <i className="fa-solid fa-star" />
            </button>
          )}
        </div>
      </div>

      {/* Save config modal */}
      {saveModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setSaveModalOpen(false)}
        >
          <div
            className="p-6 rounded-xl shadow-xl max-w-md w-full"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4" style={{ color: "var(--text)" }}>
              {t.insightsSaveConfig}
            </h3>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>
              {t.insightsConfigName}
            </label>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder={t.insightsConfigNamePlaceholder}
              className="input mb-4"
              style={{
                color: "var(--text)",
                background: "var(--background)",
                borderColor: "var(--border)",
              }}
            />
            <label className="flex items-center gap-2 mb-6">
              <input
                type="checkbox"
                checked={saveAsDefault}
                onChange={(e) => setSaveAsDefault(e.target.checked)}
              />
              <span style={{ color: "var(--text)" }}>{t.insightsSaveAsDefault}</span>
            </label>
            <div className="flex gap-2 justify-end">
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
                onClick={() => setSaveModalOpen(false)}
              >
                <i className="fa-solid fa-xmark" />
              </button>
              <button
                type="button"
                className="p-2 rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "var(--primary-50)",
                  borderColor: "var(--primary)",
                  color: "var(--primary)",
                }}
                title={t.modalConfirm}
                aria-label={t.modalConfirm}
                onClick={handleSaveConfig}
                disabled={!saveName.trim()}
              >
                <i className="fa-solid fa-check" />
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfigModal.config && (
        <div
          className="modal-overlay"
          onClick={closeDeleteConfigModal}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="card-title">{t.insightsDeleteConfigConfirm}</h3>
            {deleteConfigModal.config.name ? (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {deleteConfigModal.config.name}
              </p>
            ) : null}
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
                onClick={closeDeleteConfigModal}
              >
                <i className="fa-solid fa-xmark" />
              </button>
              <button
                type="button"
                className="p-2 rounded-md transition-colors"
                style={{
                  background: "var(--error)",
                  color: "white",
                  border: "1px solid var(--error)",
                  boxShadow: "0 0 0 1px var(--error)",
                }}
                title={t.modalConfirm}
                aria-label={t.modalConfirm}
                onClick={confirmDeleteConfig}
              >
                <i className="fa-solid fa-check" />
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12" style={{ color: "var(--text-tertiary)" }}>
          Loading…
        </div>
      ) : !insightsData ? (
        <div className="text-center py-12" style={{ color: "var(--text-tertiary)" }}>
          {t.insightsEmpty}
        </div>
      ) : (
        <div className="space-y-4 min-w-0">
          {hoveredRow && (
            <TransactionRowPopup
              row={hoveredRow.row}
              rect={hoveredRow.rect}
              cursorX={hoveredRow.cursorX}
              amountColor={hoveredRow.amountColor}
              t={t}
              locale={locale}
              formatAmount={formatAmount}
            />
          )}
          {/* Card: Received list */}
          <div className="card min-w-0">
            <button
              type="button"
              className="w-full flex items-center justify-between text-left"
              onClick={() => toggleCard("received")}
            >
              <h3 className="card-title mb-0">{t.insightsCardReceived}</h3>
              <i
                className={`fa-solid fa-chevron-${cardCollapsed.received ? "down" : "up"}`}
                style={{ color: "var(--text-secondary)" }}
              />
            </button>
            {!cardCollapsed.received && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {t.insightsShowMax}
                  </span>
                  <select
                    value={receivedLimit ?? "all"}
                    onChange={(e) =>
                      setReceivedLimit(e.target.value === "all" ? null : Number(e.target.value))
                    }
                    className="input text-sm"
                    style={{
                      color: "var(--text)",
                      background: "var(--background)",
                      borderColor: "var(--border)",
                      width: "auto",
                      minWidth: "80px",
                    }}
                  >
                    <option value="all">{t.insightsShowAll}</option>
                    {LIMIT_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="min-w-0">
                  {(() => {
                    const receivedSorted = [...insightsData.received_list].sort(
                      (a, b) => Number(b.amount) - Number(a.amount)
                    );
                    return receivedSorted.length === 0 ? (
                    <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                      {t.insightsEmpty}
                    </p>
                  ) : (() => {
                    const displayedRows = receivedLimit
                      ? receivedSorted.slice(0, receivedLimit)
                      : receivedSorted;
                    const totalByCurrency: Record<string, number> = {};
                    displayedRows.forEach((row) => {
                      const c = row.currency || "EUR";
                      totalByCurrency[c] = (totalByCurrency[c] || 0) + Number(row.amount);
                    });
                    const totals = Object.entries(totalByCurrency).sort(([a], [b]) => a.localeCompare(b));
                    return (
                    <div className="insights-list">
                      <div className="insights-list-header">
                        <div className="insights-list-cell">{t.insightsDate}</div>
                        <div className="insights-list-cell">{t.insightsDescription}</div>
                        <div className="insights-list-cell">{t.insightsAccount}</div>
                        <div className="insights-list-cell text-right">{t.insightsAmount}</div>
                      </div>
                      {displayedRows.map((row) => (
                        <div
                          key={row.id}
                          className="insights-list-row-wrapper"
                          style={{ position: "relative" }}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget.firstElementChild ?? e.currentTarget;
                            setHoveredRow({
                              row,
                              rect: el.getBoundingClientRect(),
                              cursorX: e.clientX,
                              amountColor: "var(--success)",
                            });
                          }}
                          onMouseLeave={() => setHoveredRow(null)}
                        >
                          <div className="insights-list-row">
                            <div className="insights-list-cell" data-label={t.insightsDate} style={{ color: "var(--text)" }}>
                              {(row.posting_date ?? row.booking_date)
                                ? new Date(row.posting_date ?? row.booking_date ?? "").toLocaleDateString(locale, {
                                    year: "numeric",
                                    month: "short",
                                    day: "2-digit",
                                  })
                                : "—"}
                            </div>
                            <div className="insights-list-cell break-words" data-label={t.insightsDescription} style={{ color: "var(--text)" }}>
                              {row.description || "—"}
                            </div>
                            <div className="insights-list-cell" data-label={t.insightsAccount} style={{ color: "var(--text-secondary)" }}>
                              {row.account_name || "—"}
                            </div>
                            <div className="insights-list-cell text-right insights-list-cell-amount" data-label={t.insightsAmount} style={{ color: "var(--success)" }}>
                              {formatAmount(Number(row.amount), row.currency, locale, true)}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="insights-list-footer">
                        <div className="insights-list-cell">{t.insightsReceivedListTotal}</div>
                        <div className="insights-list-cell text-right insights-list-cell-amount" style={{ color: "var(--success)" }}>
                          {totals.map(([currency, sum]) => formatAmount(sum, currency, locale, true)).join(" · ")}
                        </div>
                      </div>
                    </div>
                    );
                  })();
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Card: Paid list */}
          <div className="card min-w-0">
            <button
              type="button"
              className="w-full flex items-center justify-between text-left"
              onClick={() => toggleCard("paid")}
            >
              <h3 className="card-title mb-0">{t.insightsCardPaid}</h3>
              <i
                className={`fa-solid fa-chevron-${cardCollapsed.paid ? "down" : "up"}`}
                style={{ color: "var(--text-secondary)" }}
              />
            </button>
            {!cardCollapsed.paid && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {t.insightsShowMax}
                  </span>
                  <select
                    value={paidLimit ?? "all"}
                    onChange={(e) =>
                      setPaidLimit(e.target.value === "all" ? null : Number(e.target.value))
                    }
                    className="input text-sm"
                    style={{
                      color: "var(--text)",
                      background: "var(--background)",
                      borderColor: "var(--border)",
                      width: "auto",
                      minWidth: "80px",
                    }}
                  >
                    <option value="all">{t.insightsShowAll}</option>
                    {LIMIT_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="min-w-0">
                  {(insightsData.paid_list ?? []).length === 0 ? (
                    <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                      {t.insightsEmpty}
                    </p>
                  ) : (() => {
                    const paidRows = insightsData.paid_list ?? [];
                    const displayedPaidRows =
                      paidLimit == null ? paidRows : paidRows.slice(0, paidLimit);
                    const paidTotalByCurrency: Record<string, number> = {};
                    displayedPaidRows.forEach((row) => {
                      const c = row.currency || "EUR";
                      paidTotalByCurrency[c] = (paidTotalByCurrency[c] || 0) + Number(row.amount);
                    });
                    const paidTotals = Object.entries(paidTotalByCurrency).sort(([a], [b]) =>
                      a.localeCompare(b)
                    );
                    return (
                    <div className="insights-list">
                      <div className="insights-list-header">
                        <div className="insights-list-cell">{t.insightsDate}</div>
                        <div className="insights-list-cell">{t.insightsDescription}</div>
                        <div className="insights-list-cell">{t.insightsAccount}</div>
                        <div className="insights-list-cell text-right">{t.insightsAmount}</div>
                      </div>
                      {displayedPaidRows.map((row) => (
                        <div
                          key={row.id}
                          className="insights-list-row-wrapper"
                          style={{ position: "relative" }}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget.firstElementChild ?? e.currentTarget;
                            setHoveredRow({
                              row,
                              rect: el.getBoundingClientRect(),
                              cursorX: e.clientX,
                              amountColor: "var(--error)",
                            });
                          }}
                          onMouseLeave={() => setHoveredRow(null)}
                        >
                          <div className="insights-list-row">
                            <div className="insights-list-cell" data-label={t.insightsDate} style={{ color: "var(--text)" }}>
                              {(row.posting_date ?? row.booking_date)
                                ? new Date(row.posting_date ?? row.booking_date ?? "").toLocaleDateString(locale, {
                                    year: "numeric",
                                    month: "short",
                                    day: "2-digit",
                                  })
                                : "—"}
                            </div>
                            <div className="insights-list-cell break-words" data-label={t.insightsDescription} style={{ color: "var(--text)" }}>
                              {row.description || "—"}
                            </div>
                            <div className="insights-list-cell" data-label={t.insightsAccount} style={{ color: "var(--text-secondary)" }}>
                              {row.account_name || "—"}
                            </div>
                            <div className="insights-list-cell text-right insights-list-cell-amount" data-label={t.insightsAmount} style={{ color: "var(--error)" }}>
                              {formatAmount(Number(row.amount), row.currency, locale, true)}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="insights-list-footer">
                        <div className="insights-list-cell">{t.insightsReceivedListTotal}</div>
                        <div className="insights-list-cell text-right insights-list-cell-amount" style={{ color: "var(--error)" }}>
                          {paidTotals
                            .map(([currency, sum]) => formatAmount(sum, currency, locale, true))
                            .join(" · ")}
                        </div>
                      </div>
                    </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Card: By category */}
          <div className="card">
            <button
              type="button"
              className="w-full flex items-center justify-between text-left"
              onClick={() => toggleCard("byCategory")}
            >
              <h3 className="card-title mb-0">{t.insightsCardByCategory}</h3>
              <i
                className={`fa-solid fa-chevron-${cardCollapsed.byCategory ? "down" : "up"}`}
                style={{ color: "var(--text-secondary)" }}
              />
            </button>
            {!cardCollapsed.byCategory && (
              <div className="mt-4">
                {(() => {
                  const byCategory = insightsData.by_category || [];
                  const hasEstimateCategories =
                    period === "current_month" &&
                    balanceForecast?.by_category_estimate?.length;
                  const mergedCategories: Array<{
                    category_id: number | null;
                    category_name: string;
                    total: number;
                  }> = [...byCategory];
                  if (hasEstimateCategories) {
                    const seenIds = new Set(
                      byCategory.map((c) => c.category_id ?? "null")
                    );
                    for (const e of balanceForecast!.by_category_estimate) {
                      const key = e.category_id ?? "null";
                      if (!seenIds.has(key)) {
                        seenIds.add(key);
                        mergedCategories.push({
                          category_id: e.category_id,
                          category_name: e.category_name,
                          total: 0,
                        });
                      }
                    }
                  }
                  const sorted = mergedCategories.sort((a, b) => b.total - a.total);
                  const isEmpty =
                    sorted.length === 0 &&
                    !hasEstimateCategories;
                  if (isEmpty) {
                    return (
                      <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                        {t.insightsEmpty}
                      </p>
                    );
                  }
                  const estimateByCatId = new Map<number | null, { remaining: number }>();
                  let recurringRevenue = 0;
                  if (period === "current_month" && balanceForecast) {
                    (balanceForecast.by_category_estimate || []).forEach((e) => {
                      const remaining = e.estimated_total - e.current_mtd;
                      estimateByCatId.set(e.category_id, { remaining });
                    });
                    recurringRevenue = (balanceForecast.recurring_until_eom || [])
                      .filter((r) => r.amount > 0)
                      .reduce((s, r) => s + r.amount, 0);
                  }
                  const chartRows = sorted.map((c) => {
                    const est = estimateByCatId.get(c.category_id) ?? null;
                    const remaining = est ? est.remaining : 0;
                    return {
                      name: c.category_name,
                      total: c.total,
                      abs: Math.abs(c.total),
                      remainingAbs: Math.abs(remaining),
                      isRemainingPositive: remaining >= 0,
                    };
                  });
                  if (
                    period === "current_month" &&
                    balanceForecast &&
                    recurringRevenue > 0
                  ) {
                    chartRows.push({
                      name: t.insightsEstimatedRevenueLabel ?? "Estimated revenue (rest of month)",
                      total: 0,
                      abs: 0,
                      remainingAbs: recurringRevenue,
                      isRemainingPositive: true,
                    });
                  }
                  const CATEGORY_CHART_W = 900;
                  const categoryChartH = Math.min(
                    CATEGORY_CHART_MAX_HEIGHT,
                    Math.max(CHART_HEIGHT, chartRows.length * CATEGORY_BAR_HEIGHT)
                  );
                  const chartH = Math.max(300, categoryChartH);
                  const CATEGORY_AXIS_W = 200;
                  const showRemaining = period === "current_month" && balanceForecast;
                  return (
                    <div
                      style={{
                        width: "calc(100% + 1.5rem)",
                        marginLeft: "-1.5rem",
                        height: chartH,
                        overflowX: "auto",
                        overflowY: "hidden",
                      }}
                    >
                      <div style={{ width: CATEGORY_CHART_W }}>
                        <BarChart
                          width={CATEGORY_CHART_W}
                          height={chartH}
                          data={chartRows}
                          layout="vertical"
                          margin={{ top: 4, right: 24, left: CATEGORY_AXIS_W + 24, bottom: 4 }}
                        >
                          <XAxis
                            type="number"
                            stroke="var(--text-tertiary)"
                            fontSize={12}
                            tickFormatter={(v) => formatAmount(v, "EUR", locale)}
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={CATEGORY_AXIS_W}
                            stroke="var(--text-tertiary)"
                            fontSize={CATEGORY_LABEL_FONT_SIZE}
                            interval={0}
                            tickFormatter={(val: unknown) => {
                              try {
                                return truncateCategoryLabel(val ?? "");
                              } catch {
                                return String(val ?? "");
                              }
                            }}
                            tick={{ fill: "var(--text)", fontSize: CATEGORY_LABEL_FONT_SIZE }}
                          />
                          <Tooltip
                            contentStyle={{
                              background: "var(--surface)",
                              border: "1px solid var(--border)",
                              borderRadius: "var(--radius-md)",
                              color: "var(--text)",
                            }}
                            labelStyle={{ color: "var(--text)" }}
                            itemStyle={{ color: "var(--text)" }}
                            formatter={(value: number, name: string) => [
                              formatAmount(value, "EUR", locale),
                              name === "remainingAbs"
                                ? (t.insightsEstimatedRemaining ?? "Estimated remaining")
                                : t.insightsAmount,
                            ]}
                          />
                          <Bar dataKey="abs" stackId="cat" radius={[0, 4, 4, 0]}>
                            {chartRows.map((c, i) => (
                              <Cell
                                key={i}
                                fill={c.total >= 0 ? "var(--success)" : "var(--error)"}
                              />
                            ))}
                          </Bar>
                          {showRemaining && (
                            <Bar
                              dataKey="remainingAbs"
                              stackId="cat"
                              radius={[0, 4, 4, 0]}
                              strokeDasharray="5 5"
                              fillOpacity={0.35}
                            >
                              {chartRows.map((c, i) => (
                                <Cell
                                  key={i}
                                  fill={
                                    c.isRemainingPositive
                                      ? "var(--success)"
                                      : "var(--error)"
                                  }
                                  stroke={
                                    c.isRemainingPositive
                                      ? "var(--success)"
                                      : "var(--error)"
                                  }
                                />
                              ))}
                            </Bar>
                          )}
                        </BarChart>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Card: Totals */}
          <div className="card">
            <button
              type="button"
              className="w-full flex items-center justify-between text-left"
              onClick={() => toggleCard("totals")}
            >
              <h3 className="card-title mb-0">{t.insightsCardTotals}</h3>
              <i
                className={`fa-solid fa-chevron-${cardCollapsed.totals ? "down" : "up"}`}
                style={{ color: "var(--text-secondary)" }}
              />
            </button>
            {!cardCollapsed.totals && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className="p-4 rounded-lg border"
                  style={{ borderColor: "var(--border)", background: "var(--background)" }}
                >
                  <div className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                    {t.insightsTotalReceived}
                  </div>
                  <div className="text-xl font-semibold" style={{ color: "var(--success)" }}>
                    {formatAmount(insightsData.totals.total_received, "EUR", locale)}
                  </div>
                </div>
                <div
                  className="p-4 rounded-lg border"
                  style={{ borderColor: "var(--border)", background: "var(--background)" }}
                >
                  <div className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                    {t.insightsTotalPaid}
                  </div>
                  <div className="text-xl font-semibold" style={{ color: "var(--error)" }}>
                    {formatAmount(insightsData.totals.total_paid, "EUR", locale)}
                  </div>
                </div>
                <div
                  className="p-4 rounded-lg border"
                  style={{ borderColor: "var(--border)", background: "var(--background)" }}
                >
                  <div className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                    {t.insightsDifference}
                  </div>
                  <div
                    className="text-xl font-semibold"
                    style={{
                      color:
                        insightsData.totals.difference >= 0 ? "var(--success)" : "var(--error)",
                    }}
                  >
                    {formatAmount(insightsData.totals.difference, "EUR", locale)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card: Balance accumulated (running total) */}
          <div className="card">
            <button
              type="button"
              className="w-full flex items-center justify-between text-left"
              onClick={() => toggleCard("balanceHistory")}
            >
              <h3 className="card-title mb-0">{t.insightsCardBalanceAccumulated}</h3>
              <i
                className={`fa-solid fa-chevron-${cardCollapsed.balanceHistory ? "down" : "up"}`}
                style={{ color: "var(--text-secondary)" }}
              />
            </button>
            {!cardCollapsed.balanceHistory && (
              <div className="mt-4" style={{ width: "100%", minHeight: CHART_HEIGHT }}>
                {insightsData.balance_history.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                    {t.insightsEmpty}
                  </p>
                ) : (() => {
                  const history = insightsData.balance_history;
                  const n = history.length;
                  let step = 1;
                  if (period === "last_12_months" || period === "ytd") step = Math.max(1, Math.floor(n / 12));
                  else if (period === "last_month" || period === "current_month") step = Math.max(1, Math.floor(n / 8));
                  const thinned = history.filter((_, i) => i % step === 0 || i === n - 1);
                  const withLabel = (d: { date: string; balance: number }) => ({
                    ...d,
                    dateLabel: new Date(d.date).toLocaleDateString(locale, {
                      month: "short",
                      day: "2-digit",
                      year: period === "last_12_months" || period === "ytd" ? "2-digit" : undefined,
                    }),
                  });
                  let chartData: Array<{ date: string; dateLabel: string; balance: number | null; forecastBalance: number | null }> = thinned.map((d) => ({
                    ...withLabel(d),
                    balance: d.balance,
                    forecastBalance: null as number | null,
                  }));
                  const showForecast = period === "current_month" && balanceForecast?.balance_forecast?.length;
                  if (showForecast && chartData.length > 0) {
                    chartData[chartData.length - 1].forecastBalance = chartData[chartData.length - 1].balance;
                    const forecastPoints = balanceForecast!.balance_forecast.map((p) => ({
                      date: p.date,
                      dateLabel: new Date(p.date).toLocaleDateString(locale, {
                        month: "short",
                        day: "2-digit",
                      }),
                      balance: null as number | null,
                      forecastBalance: p.balance,
                    }));
                    chartData = [...chartData, ...forecastPoints];
                  }
                  return (
                    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                      <LineChart
                        data={chartData}
                        margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                      >
                        <XAxis
                          dataKey="dateLabel"
                          stroke="var(--text-tertiary)"
                          fontSize={12}
                          tick={{ fill: "var(--text-secondary)" }}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          stroke="var(--text-tertiary)"
                          fontSize={12}
                          tick={{ fill: "var(--text-secondary)" }}
                          tickFormatter={(v) => formatAmount(v, "EUR", locale)}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-md)",
                            color: "var(--text)",
                          }}
                          labelStyle={{ color: "var(--text)" }}
                          itemStyle={{ color: "var(--text)" }}
                          formatter={(value: number, name: string) => [
                            formatAmount(value, "EUR", locale),
                            name === "forecastBalance" ? (t.insightsBalanceForecast ?? "Estimated (EOM)") : t.insightsBalance,
                          ]}
                          labelFormatter={(_, payload) =>
                            payload[0]?.payload?.dateLabel ?? ""
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="balance"
                          stroke="var(--primary)"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 5, fill: "var(--primary)" }}
                          connectNulls={false}
                        />
                        {showForecast && (
                          <Line
                            type="monotone"
                            dataKey="forecastBalance"
                            stroke="var(--primary)"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            activeDot={{ r: 5, fill: "var(--primary)" }}
                            connectNulls={true}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Card: Balance comparison (month-over-month) - table */}
          <div className="card">
            <div className="w-full flex items-center justify-between gap-2">
              <button
                type="button"
                className="flex-1 flex items-center justify-between text-left min-w-0"
                onClick={() => toggleCard("balanceComparison")}
              >
                <h3 className="card-title mb-0 truncate">{t.insightsCardBalanceComparison}</h3>
                <i
                  className={`fa-solid fa-chevron-${cardCollapsed.balanceComparison ? "down" : "up"} ml-2 shrink-0`}
                  style={{ color: "var(--text-secondary)" }}
                />
              </button>
            </div>
            {!cardCollapsed.balanceComparison && (
              <div className="mt-4 overflow-x-auto">
                {insightsData.balance_comparison.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                    {t.insightsEmpty}
                  </p>
                ) : (() => {
                  const comparison = insightsData.balance_comparison;
                  const totalReceived = comparison.reduce((s, d) => s + d.received, 0);
                  const totalPaid = comparison.reduce((s, d) => s + d.paid, 0);
                  const totalDifference = comparison.reduce((s, d) => s + d.difference, 0);
                  const currentMonthKey = comparison.length > 0 ? comparison[comparison.length - 1].month : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
                  const showEstimateRow = period === "current_month" && balanceForecast;
                  return (
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                        <th className="text-left py-2 pr-4">{t.insightsMonth}</th>
                        <th className="text-right py-2 pr-4">{t.insightsTotalReceived}</th>
                        <th className="text-right py-2 pr-4">{t.insightsTotalPaid}</th>
                        <th className="text-right py-2">{t.insightsDifference}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparison.map((d) => (
                        <tr key={d.month} style={{ borderBottom: "1px solid var(--border-light)" }}>
                          <td className="py-2 pr-4" style={{ color: "var(--text)" }}>
                            {formatMonth(d.month, locale)}
                          </td>
                          <td className="py-2 pr-4 text-right" style={{ color: "var(--success)" }}>
                            {formatAmount(d.received, "EUR", locale)}
                          </td>
                          <td className="py-2 pr-4 text-right" style={{ color: "var(--error)" }}>
                            {formatAmount(d.paid, "EUR", locale)}
                          </td>
                          <td
                            className="py-2 text-right"
                            style={{
                              color: d.difference >= 0 ? "var(--success)" : "var(--error)",
                            }}
                          >
                            {formatAmount(d.difference, "EUR", locale)}
                          </td>
                        </tr>
                      ))}
                      {showEstimateRow && (
                        <tr style={{ borderBottom: "1px solid var(--border-light)", fontStyle: "italic", color: "var(--text-secondary)" }}>
                          <td className="py-2 pr-4">
                            <span className="inline-flex items-center gap-2">
                              {formatMonth(currentMonthKey, locale)} {t.insightsMonthEstimate ?? "estimativa"}
                              <button
                                type="button"
                                className="shrink-0 p-1 rounded border"
                                style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-secondary)" }}
                                title={t.insightsExportEstimateExcel}
                                aria-label={t.insightsExportEstimateExcel}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  exportEstimateToCsv();
                                }}
                              >
                                <i className="fa-solid fa-file-excel" aria-hidden />
                              </button>
                            </span>
                          </td>
                          <td className="py-2 pr-4 text-right" style={{ color: "var(--success)" }}>
                            {formatAmount(balanceForecast!.eom_revenue, "EUR", locale)}
                          </td>
                          <td className="py-2 pr-4 text-right" style={{ color: "var(--error)" }}>
                            {formatAmount(balanceForecast!.eom_expenses, "EUR", locale)}
                          </td>
                          <td
                            className="py-2 text-right"
                            style={{
                              color: (balanceForecast!.eom_revenue - balanceForecast!.eom_expenses) >= 0 ? "var(--success)" : "var(--error)",
                            }}
                          >
                            {formatAmount(balanceForecast!.eom_revenue - balanceForecast!.eom_expenses, "EUR", locale)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: "2px solid var(--border)", color: "var(--text)", fontWeight: 600 }}>
                        <td className="py-2 pr-4">{t.insightsReceivedListTotal}</td>
                        <td className="py-2 pr-4 text-right" style={{ color: "var(--success)" }}>
                          {formatAmount(totalReceived, "EUR", locale)}
                        </td>
                        <td className="py-2 pr-4 text-right" style={{ color: "var(--error)" }}>
                          {formatAmount(totalPaid, "EUR", locale)}
                        </td>
                        <td
                          className="py-2 text-right"
                          style={{
                            color: totalDifference >= 0 ? "var(--success)" : "var(--error)",
                          }}
                        >
                          {formatAmount(totalDifference, "EUR", locale)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
