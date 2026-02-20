/**
 * Recurring calendar view (B012 Phase 5).
 * Month grid of expected payments + list view alternative.
 */
import { useCallback, useEffect, useMemo, useState } from "react";

export type CalendarEntry = {
  date: string;
  recurring_transaction_id: number;
  bank_account_id: number;
  name: string;
  expected_amount: string | null;
  nominal_amount: string | null;
  status: string;
  occurrence_id: number | null;
  bank_transaction_id: number | null;
  is_matched: boolean;
};

export type UpcomingEntry = {
  recurring_transaction_id: number;
  bank_account_id: number;
  name: string;
  expected_date: string;
  expected_amount: string | null;
  nominal_amount: string | null;
  status: string;
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
  selectedAccountId: number | "all";
  onAccountChange: (id: number | "all") => void;
  onOpenRecurring: (recurringId: number) => void;
  locale: string;
  t: {
    filterAccount: string;
    filterAccountAll: string;
    recurringViewList: string;
    recurringViewCalendar: string;
    calendarToday: string;
    calendarMonthTitle: string;
    calendarSummaryTransactions: string;
    calendarSummaryAmount: string;
    recurringAmountVaries: string;
    recurringEdit: string;
    recurringEmpty: string;
    calendarUpcoming: string;
  };
};

/** Short weekday names Mon–Sun in the given locale (week starts Monday). */
function getWeekdayHeaders(locale: string): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const headers: string[] = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date(2024, 0, i);
    headers.push(formatter.format(d));
  }
  return headers;
}

function formatMonthYear(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, { month: "long", year: "numeric" });
}

function formatAmount(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
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

function getMonthGrid(year: number, month: number): (number | null)[][] {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const firstDay = first.getDay();
  const lastDate = last.getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) week.push(null);
  for (let d = 1; d <= lastDate; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

export default function RecurringCalendar({
  apiBase,
  token,
  accounts,
  selectedAccountId,
  onAccountChange,
  onOpenRecurring,
  locale,
  t,
}: Props) {
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth() + 1);
  const [calendarEntries, setCalendarEntries] = useState<CalendarEntry[]>([]);
  const [upcomingEntries, setUpcomingEntries] = useState<UpcomingEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const accountIds = useMemo(
    () => (selectedAccountId === "all" ? accounts.map((a) => a.id) : [selectedAccountId]),
    [selectedAccountId, accounts]
  );

  const fetchCalendar = useCallback(async () => {
    if (accountIds.length === 0) {
      setCalendarEntries([]);
      return;
    }
    setLoading(true);
    try {
      const allEntries: CalendarEntry[] = [];
      for (const aid of accountIds) {
        const res = await fetch(
          `${apiBase}/api/recurring-calendar?account_id=${aid}&year=${calendarYear}&month=${calendarMonth}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          allEntries.push(...data);
        }
      }
      allEntries.sort((a, b) => {
        const d = a.date.localeCompare(b.date);
        return d !== 0 ? d : (a.name || "").localeCompare(b.name || "");
      });
      setCalendarEntries(allEntries);
    } catch {
      setCalendarEntries([]);
    } finally {
      setLoading(false);
    }
  }, [apiBase, token, accountIds, calendarYear, calendarMonth]);

  const fetchUpcoming = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (selectedAccountId !== "all") params.set("account_id", String(selectedAccountId));
      const res = await fetch(`${apiBase}/api/recurring-upcoming?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUpcomingEntries(data);
      } else {
        setUpcomingEntries([]);
      }
    } catch {
      setUpcomingEntries([]);
    } finally {
      setLoading(false);
    }
  }, [apiBase, token, selectedAccountId]);

  useEffect(() => {
    if (viewMode === "calendar") fetchCalendar();
    else fetchUpcoming();
  }, [viewMode, fetchCalendar, fetchUpcoming]);

  const goToToday = useCallback(() => {
    const now = new Date();
    setCalendarYear(now.getFullYear());
    setCalendarMonth(now.getMonth() + 1);
    setSelectedDate(null);
  }, []);

  const monthGrid = useMemo(
    () => getMonthGrid(calendarYear, calendarMonth),
    [calendarYear, calendarMonth]
  );

  const entriesByDate = useMemo(() => {
    const map: Record<string, CalendarEntry[]> = {};
    for (const e of calendarEntries) {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    }
    return map;
  }, [calendarEntries]);

  const todayStr = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  }, []);

  const summary = useMemo(() => {
    let total = 0;
    const seen = new Set<string>();
    for (const e of calendarEntries) {
      const dateNorm =
        e.date && e.date.length >= 10
          ? e.date.slice(0, 10)
          : e.date;
      if (dateNorm < todayStr) continue;
      const key = `${dateNorm}|${e.recurring_transaction_id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const hasExpected =
        e.expected_amount != null && String(e.expected_amount).trim() !== "";
      const hasNominal =
        e.nominal_amount != null && String(e.nominal_amount).trim() !== "";
      const raw = hasExpected ? e.expected_amount : hasNominal ? e.nominal_amount : null;
      if (!raw) continue;
      const normalized = String(raw).replace(",", ".");
      const amt = parseFloat(normalized);
      if (!Number.isNaN(amt)) total += amt;
    }
    return { count: seen.size, total };
  }, [calendarEntries, todayStr]);

  const iconBtnClass =
    "inline-flex items-center justify-center p-2 rounded border transition-colors min-w-[2.25rem]";

  const isCurrentMonth =
    calendarYear === new Date().getFullYear() && calendarMonth === new Date().getMonth() + 1;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-slate-600 dark:text-slate-400">{t.filterAccount}</span>
          <select
            className="rounded border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
            value={selectedAccountId === "all" ? "all" : selectedAccountId}
            onChange={(e) =>
              onAccountChange(e.target.value === "all" ? "all" : parseInt(e.target.value, 10))
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

      {viewMode === "list" ? (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <h3 className="px-4 py-2 text-sm font-medium bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            {t.calendarUpcoming}
          </h3>
          {loading ? (
            <div className="p-6 text-center text-slate-500">…</div>
          ) : upcomingEntries.length === 0 ? (
            <div className="p-6 text-center text-slate-500">{t.recurringEmpty}</div>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {upcomingEntries.map((entry) => (
                <li
                  key={`${entry.recurring_transaction_id}-${entry.expected_date}`}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <div className="min-w-0">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{entry.name}</span>
                    <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
                      {(() => {
                        const [y, m, d] = entry.expected_date.split("-").map(Number);
                        return new Date(y, m - 1, d).toLocaleDateString(locale, {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                        });
                      })()}{" "}
                      · {entry.expected_amount != null && entry.expected_amount.trim() !== ""
                        ? formatExpectedAmount(entry.expected_amount, locale)
                        : entry.nominal_amount != null && entry.nominal_amount.trim() !== ""
                          ? "~" + formatExpectedAmount(entry.nominal_amount, locale)
                          : t.recurringAmountVaries}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={iconBtnClass}
                    style={{
                      background: "var(--surface-hover)",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                    title={t.recurringEdit}
                    aria-label={t.recurringEdit}
                    onClick={() => onOpenRecurring(entry.recurring_transaction_id)}
                  >
                    <i className="fa-solid fa-pen text-xs" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={iconBtnClass}
                style={{
                  background: "var(--surface-hover)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
                aria-label="Previous month"
                onClick={() => {
                  if (calendarMonth === 1) {
                    setCalendarYear((y) => y - 1);
                    setCalendarMonth(12);
                  } else setCalendarMonth((m) => m - 1);
                  setSelectedDate(null);
                }}
              >
                <i className="fa-solid fa-chevron-left" aria-hidden />
              </button>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 min-w-[180px] text-center capitalize">
                {formatMonthYear(new Date(calendarYear, calendarMonth - 1, 1), locale)}
              </h2>
              <button
                type="button"
                className={iconBtnClass}
                style={{
                  background: "var(--surface-hover)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
                aria-label="Next month"
                onClick={() => {
                  if (calendarMonth === 12) {
                    setCalendarYear((y) => y + 1);
                    setCalendarMonth(1);
                  } else setCalendarMonth((m) => m + 1);
                  setSelectedDate(null);
                }}
              >
                <i className="fa-solid fa-chevron-right" aria-hidden />
              </button>
              <button
                type="button"
                className="text-sm underline text-slate-600 dark:text-slate-400"
                onClick={goToToday}
              >
                {t.calendarToday}
              </button>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {t.calendarSummaryTransactions.replace("{n}", String(summary.count))}
              {summary.count > 0 && (
                <> · {t.calendarSummaryAmount}: {formatAmount(summary.total, locale)}</>
              )}
            </div>
          </div>

          {loading ? (
            <div className="mt-4 p-8 text-center text-slate-500">…</div>
          ) : (
            <div className="mt-4 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="grid grid-cols-7 text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                {getWeekdayHeaders(locale).map((day) => (
                  <div key={day} className="p-2 text-center">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 bg-white dark:bg-slate-900">
                {monthGrid.flatMap((week, wi) =>
                  week.map((day, di) => {
                    if (day === null) {
                      return (
                        <div
                          key={`e-${wi}-${di}`}
                          className="min-h-[80px] sm:min-h-[100px] border-b border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                        />
                      );
                    }
                    const dateStr = `${calendarYear}-${String(calendarMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const entries = entriesByDate[dateStr] ?? [];
                    const isToday = isCurrentMonth && day === new Date().getDate();
                    const isSelected = selectedDate === dateStr;
                    return (
                      <div
                        key={dateStr}
                        role="button"
                        tabIndex={0}
                        className={`min-h-[80px] sm:min-h-[100px] border-b border-r border-slate-100 dark:border-slate-800 p-1 flex flex-col cursor-pointer ${
                          isToday ? "ring-1 ring-[var(--primary)]" : ""
                        } ${isSelected ? "bg-primary-50/50 dark:bg-primary-900/20" : ""}`}
                        onClick={() => setSelectedDate(selectedDate === dateStr ? null : dateStr)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedDate(selectedDate === dateStr ? null : dateStr);
                          }
                        }}
                      >
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{day}</div>
                        <div className="flex-1 space-y-0.5 overflow-auto">
                          {entries.slice(0, 3).map((entry) => (
                            <button
                              key={`${entry.recurring_transaction_id}-${entry.date}`}
                              type="button"
                              className={`w-full text-left px-1.5 py-0.5 rounded text-xs truncate block ${
                                entry.is_matched
                                  ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200"
                                  : "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                              }`}
                              title={`${entry.name} · ${entry.expected_amount != null && entry.expected_amount.trim() !== "" ? formatExpectedAmount(entry.expected_amount, locale) : entry.nominal_amount != null && entry.nominal_amount.trim() !== "" ? "~" + formatExpectedAmount(entry.nominal_amount, locale) : t.recurringAmountVaries}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenRecurring(entry.recurring_transaction_id);
                              }}
                            >
                              {entry.name} {entry.is_matched ? "✓" : ""}
                            </button>
                          ))}
                          {entries.length > 3 && (
                            <span className="text-xs text-slate-400 px-1">
                              +{entries.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {selectedDate && entriesByDate[selectedDate]?.length ? (
            <div className="mt-4 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                {(() => {
                  const [y, m, d] = selectedDate.split("-").map(Number);
                  return new Date(y, m - 1, d).toLocaleDateString(locale, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });
                })()}
              </p>
              <ul className="space-y-2">
                {entriesByDate[selectedDate].map((entry) => (
                  <li key={entry.recurring_transaction_id} className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate">{entry.name}</span>
                    <span className="text-sm text-slate-500 text-right tabular-nums shrink-0 min-w-[6rem]">
                      {entry.expected_amount != null && entry.expected_amount.trim() !== ""
                        ? formatExpectedAmount(entry.expected_amount, locale)
                        : entry.nominal_amount != null && entry.nominal_amount.trim() !== ""
                          ? "~" + formatExpectedAmount(entry.nominal_amount, locale)
                          : t.recurringAmountVaries}
                      {entry.is_matched ? " ✓" : ""}
                    </span>
                    <button
                      type="button"
                      className={iconBtnClass}
                      style={{
                        background: "var(--surface-hover)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                      title={t.recurringEdit}
                      onClick={() => onOpenRecurring(entry.recurring_transaction_id)}
                    >
                      <i className="fa-solid fa-pen text-xs" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
