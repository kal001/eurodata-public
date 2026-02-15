import { useCallback, useEffect, useRef, useState } from "react";

type AuditLogEntry = {
  id: number;
  created_at: string;
  user_id: number | null;
  user_display_name: string | null;
  user_email: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  result?: string | null;
};

type ActionLabels = Record<string, string>;

type Translations = {
  auditTitle: string;
  auditDate: string;
  auditUser: string;
  auditAction: string;
  auditResource: string;
  auditDetails: string;
  auditResult: string;
  auditResultSuccess: string;
  auditResultFail: string;
  auditResultInfo: string;
  auditFilterAction: string;
  auditFilterAll: string;
  adminRows: string;
  adminShowing: string;
  adminOf: string;
  adminPrev: string;
  adminNext: string;
  auditViewDetails: string;
  auditDetailsClose: string;
};

type Props = {
  token: string;
  apiBase: string;
  t: Translations;
  actionLabels: ActionLabels;
};

const DETAILS_TOOLTIP_DELAY_MS = 400;

export default function Audit({ token, apiBase, t, actionLabels }: Props) {
  const [items, setItems] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [actionFilter, setActionFilter] = useState<string>("");
  const [hoveredDetailsId, setHoveredDetailsId] = useState<number | null>(null);
  const [detailsModalEntry, setDetailsModalEntry] = useState<AuditLogEntry | null>(null);
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const loadLogs = useCallback(async () => {
    const params = new URLSearchParams();
    params.set("limit", String(pageSize));
    params.set("offset", String(page * pageSize));
    if (actionFilter) params.set("action", actionFilter);
    const response = await fetch(
      `${apiBase}/api/admin/audit-logs?${params.toString()}`,
      { headers }
    );
    if (response.ok) {
      const data = await response.json();
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    }
  }, [apiBase, token, page, pageSize, actionFilter]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "medium",
    });
  };

  const detailsStr = (d: Record<string, unknown> | null) => {
    if (!d || typeof d !== "object") return "";
    return JSON.stringify(d);
  };

  const detailsPretty = (d: Record<string, unknown> | null) => {
    if (!d || typeof d !== "object") return "";
    try {
      return JSON.stringify(d, null, 2);
    } catch {
      return String(d);
    }
  };

  const resultLabel = (r: string | null | undefined) => {
    switch (r) {
      case "success":
        return t.auditResultSuccess;
      case "fail":
        return t.auditResultFail;
      default:
        return t.auditResultInfo;
    }
  };

  const showTooltip = (entryId: number) => {
    tooltipTimeoutRef.current = setTimeout(() => setHoveredDetailsId(entryId), DETAILS_TOOLTIP_DELAY_MS);
  };

  const hideTooltip = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    setHoveredDetailsId(null);
  };

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!detailsModalEntry) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDetailsModalEntry(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [detailsModalEntry]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="card">
        <h2 className="card-title">{t.auditTitle}</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            {t.auditFilterAction}
            <select
              className="input max-w-[200px]"
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="">{t.auditFilterAll}</option>
              {Object.keys(actionLabels).sort().map((key) => (
                <option key={key} value={key}>
                  {actionLabels[key]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            {t.adminRows}
            <select
              className="input w-20"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
            >
              {[25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            {t.adminShowing}{" "}
            {total === 0 ? 0 : page * pageSize + 1}–{Math.min(total, page * pageSize + items.length)}{" "}
            {t.adminOf} {total}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="icon-button"
              aria-label={t.adminPrev}
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button
              type="button"
              className="icon-button"
              aria-label={t.adminNext}
              disabled={(page + 1) * pageSize >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-2 pr-4 font-semibold">{t.auditDate}</th>
                <th className="py-2 pr-4 font-semibold">{t.auditUser}</th>
                <th className="py-2 pr-4 font-semibold">{t.auditAction}</th>
                <th className="py-2 pr-4 font-semibold">{t.auditResult}</th>
                <th className="py-2 pr-4 font-semibold">{t.auditResource}</th>
                <th className="py-2 font-semibold">{t.auditDetails}</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-slate-500 dark:text-slate-400">
                    No audit entries.
                  </td>
                </tr>
              ) : (
                items.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-slate-100 dark:border-slate-800"
                  >
                    <td className="whitespace-nowrap py-2 pr-4 text-slate-600 dark:text-slate-300">
                      {formatDate(entry.created_at)}
                    </td>
                    <td className="py-2 pr-4">
                      {entry.user_display_name ?? entry.user_email ?? entry.user_id ?? "—"}
                    </td>
                    <td className="py-2 pr-4">
                      {actionLabels[entry.action] ?? entry.action}
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className={
                          entry.result === "fail"
                            ? "text-red-600 dark:text-red-400"
                            : entry.result === "success"
                              ? "text-green-600 dark:text-green-400"
                              : "text-slate-500 dark:text-slate-400"
                        }
                      >
                        {resultLabel(entry.result)}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      {entry.resource_type && entry.resource_id
                        ? `${entry.resource_type}#${entry.resource_id}`
                        : "—"}
                    </td>
                    <td className="max-w-xs py-2 font-mono text-xs text-slate-500 dark:text-slate-400">
                      <div
                        className="relative flex min-w-0 items-center gap-1"
                        onMouseEnter={() => showTooltip(entry.id)}
                        onMouseLeave={hideTooltip}
                      >
                        <span className="min-w-0 truncate">
                          {detailsStr(entry.details) || "—"}
                        </span>
                        {(detailsStr(entry.details) || "").length > 0 ? (
                          <button
                            type="button"
                            className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailsModalEntry(entry);
                            }}
                            title={t.auditViewDetails}
                          >
                            {t.auditViewDetails}
                          </button>
                        ) : null}
                        {hoveredDetailsId === entry.id && (detailsStr(entry.details) || "").length > 0 ? (
                          <div
                            className="audit-details-tooltip absolute left-0 top-full z-50 mt-1 max-h-64 w-full min-w-[18rem] max-w-md overflow-auto rounded border border-slate-200 bg-white p-2 text-left shadow-lg dark:border-slate-600 dark:bg-slate-800"
                            role="tooltip"
                          >
                            <pre className="whitespace-pre-wrap break-words font-mono text-xs text-slate-700 dark:text-slate-300">
                              {detailsPretty(entry.details)}
                            </pre>
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detailsModalEntry ? (
        <div
          className="modal-overlay"
          onClick={() => setDetailsModalEntry(null)}
          role="dialog"
          aria-modal="true"
          aria-label={t.auditDetails}
        >
          <div
            className="modal-card flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2 dark:border-slate-700">
              <h3 className="font-semibold">{t.auditDetails}</h3>
              <button
                type="button"
                className="icon-button"
                onClick={() => setDetailsModalEntry(null)}
                title={t.auditDetailsClose}
                aria-label={t.auditDetailsClose}
              >
                <i className="fa-solid fa-times" />
              </button>
            </div>
            <pre className="flex-1 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs text-slate-700 dark:text-slate-300">
              {detailsPretty(detailsModalEntry.details) || "—"}
            </pre>
          </div>
        </div>
      ) : null}
    </section>
  );
}
