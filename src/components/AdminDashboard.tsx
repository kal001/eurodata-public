import { useCallback, useEffect, useState } from "react";

type MetricsUsers = {
  total_users: number;
  active_users_7d: number;
  active_users_30d: number;
  users_with_onboarding_completed: number;
  users_with_at_least_one_account: number;
};

type MetricsBanking = {
  total_bank_accounts: number;
  total_bank_connections: number;
  total_transactions: number;
  avg_accounts_per_user: number;
  avg_transactions_per_user: number;
};

type MetricsRecurring = {
  total_patterns: number;
  patterns_active: number;
  patterns_suggested: number;
  patterns_paused: number;
  patterns_auto_detected: number;
  patterns_manual: number;
  patterns_migrated: number;
  users_with_at_least_one_pattern: number;
  avg_patterns_per_user_with_patterns: number;
  occurrences_matched_count: number;
};

type MetricsEngagement = {
  users_with_telegram_enabled: number;
  users_with_weekly_emails_enabled: number;
};

type MetricsData = {
  users: MetricsUsers;
  banking: MetricsBanking;
  recurring: MetricsRecurring;
  engagement: MetricsEngagement;
};

type Translations = {
  metricsTitle: string;
  metricsUsers: string;
  metricsBanking: string;
  metricsRecurring: string;
  metricsEngagement: string;
  metricsTotalUsers: string;
  metricsActiveUsers7d: string;
  metricsActiveUsers30d: string;
  metricsOnboardingCompleted: string;
  metricsUsersWithAccount: string;
  metricsTotalAccounts: string;
  metricsTotalConnections: string;
  metricsTotalTransactions: string;
  metricsAvgAccountsPerUser: string;
  metricsAvgTransactionsPerUser: string;
  metricsTotalPatterns: string;
  metricsPatternsActive: string;
  metricsPatternsSuggested: string;
  metricsPatternsPaused: string;
  metricsPatternsAutoDetected: string;
  metricsPatternsManual: string;
  metricsPatternsMigrated: string;
  metricsUsersWithPatterns: string;
  metricsAvgPatternsPerUser: string;
  metricsOccurrencesMatched: string;
  metricsTelegramEnabled: string;
  metricsWeeklyEmailsEnabled: string;
  metricsLoading: string;
  metricsError: string;
};

type Props = {
  token: string;
  apiBase: string;
  t: Translations;
};

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        {label}
      </div>
    </div>
  );
}

export default function AdminDashboard({ token, apiBase, t }: Props) {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/api/admin/metrics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        setError(text || `HTTP ${res.status}`);
        setData(null);
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [apiBase, token]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="card">
          <p className="text-slate-600 dark:text-slate-400">{t.metricsLoading}</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="card border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">{t.metricsError}: {error}</p>
        </div>
      </section>
    );
  }

  if (!data) return null;

  const { users, banking, recurring, engagement } = data;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="mb-8 text-2xl font-semibold text-slate-900 dark:text-slate-100">
        {t.metricsTitle}
      </h1>

      <div className="mb-10">
        <h2 className="card-title mb-4">{t.metricsUsers}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard label={t.metricsTotalUsers} value={users.total_users} />
          <MetricCard label={t.metricsActiveUsers7d} value={users.active_users_7d} />
          <MetricCard label={t.metricsActiveUsers30d} value={users.active_users_30d} />
          <MetricCard label={t.metricsOnboardingCompleted} value={users.users_with_onboarding_completed} />
          <MetricCard label={t.metricsUsersWithAccount} value={users.users_with_at_least_one_account} />
        </div>
      </div>

      <div className="mb-10">
        <h2 className="card-title mb-4">{t.metricsBanking}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard label={t.metricsTotalAccounts} value={banking.total_bank_accounts} />
          <MetricCard label={t.metricsTotalConnections} value={banking.total_bank_connections} />
          <MetricCard label={t.metricsTotalTransactions} value={banking.total_transactions} />
          <MetricCard label={t.metricsAvgAccountsPerUser} value={banking.avg_accounts_per_user} />
          <MetricCard label={t.metricsAvgTransactionsPerUser} value={banking.avg_transactions_per_user} />
        </div>
      </div>

      <div className="mb-10">
        <h2 className="card-title mb-4">{t.metricsRecurring}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <MetricCard label={t.metricsTotalPatterns} value={recurring.total_patterns} />
          <MetricCard label={t.metricsPatternsActive} value={recurring.patterns_active} />
          <MetricCard label={t.metricsPatternsSuggested} value={recurring.patterns_suggested} />
          <MetricCard label={t.metricsPatternsPaused} value={recurring.patterns_paused} />
          <MetricCard label={t.metricsPatternsAutoDetected} value={recurring.patterns_auto_detected} />
          <MetricCard label={t.metricsPatternsManual} value={recurring.patterns_manual} />
          <MetricCard label={t.metricsPatternsMigrated} value={recurring.patterns_migrated} />
          <MetricCard label={t.metricsUsersWithPatterns} value={recurring.users_with_at_least_one_pattern} />
          <MetricCard label={t.metricsAvgPatternsPerUser} value={recurring.avg_patterns_per_user_with_patterns} />
          <MetricCard label={t.metricsOccurrencesMatched} value={recurring.occurrences_matched_count} />
        </div>
      </div>

      <div>
        <h2 className="card-title mb-4">{t.metricsEngagement}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MetricCard label={t.metricsTelegramEnabled} value={engagement.users_with_telegram_enabled} />
          <MetricCard label={t.metricsWeeklyEmailsEnabled} value={engagement.users_with_weekly_emails_enabled} />
        </div>
      </div>
    </section>
  );
}
