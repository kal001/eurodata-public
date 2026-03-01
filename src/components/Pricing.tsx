import { useEffect } from "react";

export type PricingTranslations = {
  pricingBack: string;
  pricingHeroTitle: string;
  pricingHeroSubtitle: string;
  pricingPlanStandard: string;
  pricingPlanExtraAccount: string;
  pricingVatIncluded: string;
  pricingMostPopular: string;
  pricingStandardPrice: string;
  pricingExtraPrice: string;
  pricingStandardDescription: string;
  pricingStandardInclude1: string;
  pricingStandardInclude2: string;
  pricingStandardInclude3: string;
  pricingExtraDescription: string;
  pricingExtraNote: string;
  pricingCtaStartTrial: string;
  pricingFootnote: string;
  pricingFeaturesTitle: string;
  pricingPremiumBadge: string;
  pricingFeatureCategoryUi: string;
  pricingFeatureCategoryGeneral: string;
  pricingFeatureCategoryTransactions: string;
  pricingFeatureCategorySecurity: string;
  pricingFeatureResponsive: string;
  pricingFeaturePwa: string;
  pricingFeatureLanguages: string;
  pricingFeatureGoogleAuth: string;
  pricingFeatureMultiCurrency: string;
  pricingFeatureSharedAccounts: string;
  pricingFeatureAlertsChannels: string;
  pricingFeatureTelegramBot: string;
  pricingFeatureApi: string;
  pricingFeatureAutoImport: string;
  pricingFeaturePdfImport: string;
  pricingFeatureAutoCategory: string;
  pricingFeatureCustomTags: string;
  pricingFeatureCustomCategories: string;
  pricingFeatureAlertsTransactions: string;
  pricingFeatureRecurringDetection: string;
  pricingFeatureCalendarView: string;
  pricingFeatureExportExcel: string;
  pricingFeatureBalanceForecast: string;
  pricingFeatureDataEncrypted: string;
  pricingFeatureNeverSell: string;
  pricingFeatureCredentialsNeverStored: string;
  pricingFeatureAuthExpire90: string;
  pricingFeatureIso27001: string;
  pricingFeatureServersGermany: string;
  pricingFeatureStorageChoice: string;
  pricingFeatureAiLocal: string;
  pricingFaqTitle: string;
  pricingFaq1Q: string;
  pricingFaq1A: string;
  pricingFaq2Q: string;
  pricingFaq2A: string;
  pricingFaq3Q: string;
  pricingFaq3A: string;
  pricingFaq4Q: string;
  pricingFaq4A: string;
  pricingFaq5Q: string;
  pricingFaq5A: string;
  pricingCtaTitle: string;
  pricingCtaSubtext: string;
  pricingCtaButton: string;
  pricingMetaTitle: string;
  pricingMetaDescription: string;
};

type Props = {
  t: PricingTranslations;
  onBack: () => void;
  onStartTrial: () => void;
};

export default function Pricing({ t, onBack, onStartTrial }: Props) {
  useEffect(() => {
    const prevTitle = document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute("content") ?? "";
    document.title = t.pricingMetaTitle;
    metaDesc?.setAttribute("content", t.pricingMetaDescription);
    return () => {
      document.title = prevTitle;
      metaDesc?.setAttribute("content", prevDesc);
    };
  }, [t.pricingMetaTitle, t.pricingMetaDescription]);

  const featureRows: (
    | { category: string }
    | { labelKey: keyof PricingTranslations; premium?: boolean }
  )[] = [
    { category: t.pricingFeatureCategoryUi },
    { labelKey: "pricingFeatureResponsive" },
    { labelKey: "pricingFeaturePwa" },
    { labelKey: "pricingFeatureLanguages" },
    { category: t.pricingFeatureCategoryGeneral },
    { labelKey: "pricingFeatureGoogleAuth" },
    { labelKey: "pricingFeatureMultiCurrency" },
    { labelKey: "pricingFeatureSharedAccounts", premium: true },
    { labelKey: "pricingFeatureAlertsChannels", premium: true },
    { labelKey: "pricingFeatureTelegramBot", premium: true },
    { labelKey: "pricingFeatureApi", premium: true },
    { category: t.pricingFeatureCategoryTransactions },
    { labelKey: "pricingFeatureAutoImport" },
    { labelKey: "pricingFeaturePdfImport" },
    { labelKey: "pricingFeatureAutoCategory" },
    { labelKey: "pricingFeatureCustomTags" },
    { labelKey: "pricingFeatureCustomCategories" },
    { labelKey: "pricingFeatureAlertsTransactions", premium: true },
    { labelKey: "pricingFeatureRecurringDetection" },
    { labelKey: "pricingFeatureCalendarView" },
    { labelKey: "pricingFeatureExportExcel" },
    { labelKey: "pricingFeatureBalanceForecast" },
    { category: t.pricingFeatureCategorySecurity },
    { labelKey: "pricingFeatureDataEncrypted" },
    { labelKey: "pricingFeatureNeverSell" },
    { labelKey: "pricingFeatureCredentialsNeverStored" },
    { labelKey: "pricingFeatureAuthExpire90" },
    { labelKey: "pricingFeatureIso27001" },
    { labelKey: "pricingFeatureServersGermany" },
    { labelKey: "pricingFeatureStorageChoice" },
    { labelKey: "pricingFeatureAiLocal" },
  ];

  let rowIndex = 0;

  return (
    <article className="pt-24 pb-32" aria-label={t.pricingHeroTitle}>
      <div className="mx-auto max-w-4xl px-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: "var(--primary)" }}
        >
          <i className="fa-solid fa-arrow-left" aria-hidden />
          {t.pricingBack}
        </button>

        {/* Section 1 — Hero */}
        <header className="mb-14 text-center">
          <h1
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{ color: "var(--text)" }}
          >
            {t.pricingHeroTitle}
          </h1>
          <p
            className="mx-auto mt-4 max-w-2xl text-base leading-relaxed md:text-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            {t.pricingHeroSubtitle}
          </p>
        </header>

        {/* Section 2 — Pricing cards */}
        <section className="mb-16">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Card 1 — Standard (highlighted) */}
            <div
              className="relative flex flex-col rounded-lg border-2 p-6 transition-shadow hover:shadow-lg"
              style={{
                borderColor: "var(--primary)",
                background: "var(--surface)",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)",
              }}
            >
              <span
                className="absolute -top-3 left-4 rounded-full px-3 py-0.5 text-xs font-semibold"
                style={{ background: "var(--primary)", color: "white" }}
              >
                {t.pricingMostPopular}
              </span>
              <h2
                className="text-xl font-semibold"
                style={{ color: "var(--text)" }}
              >
                {t.pricingPlanStandard}
              </h2>
              <p className="mt-2 text-2xl font-bold" style={{ color: "var(--text)" }}>
                {t.pricingStandardPrice}
              </p>
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                ({t.pricingVatIncluded})
              </p>
              <p
                className="mt-4 text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {t.pricingStandardDescription}
              </p>
              <ul className="mt-4 space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-check text-green-600 dark:text-green-400" aria-hidden />
                  {t.pricingStandardInclude1}
                </li>
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-check text-green-600 dark:text-green-400" aria-hidden />
                  {t.pricingStandardInclude2}
                </li>
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-check text-green-600 dark:text-green-400" aria-hidden />
                  {t.pricingStandardInclude3}
                </li>
              </ul>
              <div className="mt-6 flex-1">
                <button
                  type="button"
                  className="btn-primary w-full"
                  onClick={onStartTrial}
                >
                  {t.pricingCtaStartTrial}
                </button>
              </div>
            </div>

            {/* Card 2 — Extra accounts */}
            <div
              className="flex flex-col rounded-lg border p-6 transition-all hover:shadow-md"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface)",
              }}
            >
              <h2
                className="text-xl font-semibold"
                style={{ color: "var(--text)" }}
              >
                {t.pricingPlanExtraAccount}
              </h2>
              <p className="mt-2 text-2xl font-bold" style={{ color: "var(--text)" }}>
                {t.pricingExtraPrice}
              </p>
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                ({t.pricingVatIncluded})
              </p>
              <p
                className="mt-4 text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {t.pricingExtraDescription}
              </p>
              <p
                className="mt-2 text-sm italic"
                style={{ color: "var(--text-tertiary)" }}
              >
                {t.pricingExtraNote}
              </p>
              <div className="mt-6 flex-1">
                <button
                  type="button"
                  className="btn-primary w-full"
                  onClick={onStartTrial}
                >
                  {t.pricingCtaStartTrial}
                </button>
              </div>
            </div>
          </div>
          <p
            className="mt-6 text-center text-sm"
            style={{ color: "var(--text-tertiary)" }}
          >
            {t.pricingFootnote}
          </p>
        </section>

        {/* Section 3 — Feature table */}
        <section className="mb-16">
          <h2
            className="mb-6 text-2xl font-semibold"
            style={{ color: "var(--text)" }}
          >
            {t.pricingFeaturesTitle}
          </h2>
          <div
            className="overflow-hidden rounded-lg border"
            style={{ borderColor: "var(--border)" }}
          >
            <table className="w-full border-collapse text-left text-sm">
              <tbody>
                {featureRows.map((row) => {
                  if ("category" in row && row.category) {
                    return (
                      <tr
                        key={row.category}
                        className="font-semibold"
                        style={{ background: "var(--surface-hover)" }}
                      >
                        <td
                          colSpan={2}
                          className="px-4 py-3"
                          style={{ color: "var(--text)" }}
                        >
                          {row.category}
                        </td>
                      </tr>
                    );
                  }
                  const { labelKey, premium } = row;
                  const label = t[labelKey];
                  rowIndex += 1;
                  return (
                    <tr
                      key={labelKey}
                      className={rowIndex % 2 === 0 ? "" : "bg-slate-50 dark:bg-slate-800/50"}
                    >
                      <td
                        className="flex flex-wrap items-center gap-2 px-4 py-3"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {label}
                        {premium && (
                          <span
                            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium"
                            style={{
                              background: "var(--primary-50)",
                              color: "var(--primary)",
                            }}
                          >
                            <i className="fa-solid fa-star" aria-hidden />
                            {t.pricingPremiumBadge}
                          </span>
                        )}
                      </td>
                      <td className="w-12 px-4 py-3 text-center">
                        <i
                          className="fa-solid fa-check text-green-600 dark:text-green-400"
                          aria-label="Included"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4 — FAQ */}
        <section className="mb-16">
          <h2
            className="mb-6 text-2xl font-semibold"
            style={{ color: "var(--text)" }}
          >
            {t.pricingFaqTitle}
          </h2>
          <dl className="space-y-6">
            <div>
              <dt
                className="font-medium"
                style={{ color: "var(--text)" }}
              >
                {t.pricingFaq1Q}
              </dt>
              <dd
                className="mt-1 text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {t.pricingFaq1A}
              </dd>
            </div>
            <div>
              <dt
                className="font-medium"
                style={{ color: "var(--text)" }}
              >
                {t.pricingFaq2Q}
              </dt>
              <dd
                className="mt-1 text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {t.pricingFaq2A}
              </dd>
            </div>
            <div>
              <dt
                className="font-medium"
                style={{ color: "var(--text)" }}
              >
                {t.pricingFaq3Q}
              </dt>
              <dd
                className="mt-1 text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {t.pricingFaq3A}
              </dd>
            </div>
            <div>
              <dt
                className="font-medium"
                style={{ color: "var(--text)" }}
              >
                {t.pricingFaq4Q}
              </dt>
              <dd
                className="mt-1 text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {t.pricingFaq4A}
              </dd>
            </div>
            <div>
              <dt
                className="font-medium"
                style={{ color: "var(--text)" }}
              >
                {t.pricingFaq5Q}
              </dt>
              <dd
                className="mt-1 text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {t.pricingFaq5A}
              </dd>
            </div>
          </dl>
        </section>

        {/* Section 5 — Final CTA */}
        <section
          className="rounded-lg border p-8 text-center md:p-10"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <h2
            className="text-2xl font-semibold md:text-3xl"
            style={{ color: "var(--text)" }}
          >
            {t.pricingCtaTitle}
          </h2>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            {t.pricingCtaSubtext}
          </p>
          <button
            type="button"
            className="btn-primary mt-6"
            onClick={onStartTrial}
          >
            {t.pricingCtaButton}
          </button>
        </section>
      </div>
    </article>
  );
}
