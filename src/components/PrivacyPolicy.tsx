import type { ReactNode } from "react";

export type PrivacyPolicyTranslations = {
  privacyTitle: string;
  privacyBack: string;
  privacyLastUpdated: string;
  privacyIntro: string;
  privacySection1Title: string;
  privacySection1Content: string;
  privacySection2Title: string;
  privacySection2Content: string;
  privacySection3Title: string;
  privacySection3Content: string;
  privacySection4Title: string;
  privacySection4Content: string;
  privacySection5Title: string;
  privacySection5Content: string;
  privacySection6Title: string;
  privacySection6Content: string;
  privacySection7Title: string;
  privacySection7Content: string;
  privacySection8Title: string;
  privacySection8Content: string;
  privacyContactTitle: string;
  privacyContactIntro: string;
};

type Props = {
  t: PrivacyPolicyTranslations;
  onBack: () => void;
};

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2
        className="mb-3 text-xl font-semibold text-slate-900 dark:text-slate-100"
        style={{ color: "var(--text)" }}
      >
        {title}
      </h2>
      <div
        className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300"
        style={{ color: "var(--text-secondary)" }}
      >
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPolicy({ t, onBack }: Props) {
  const sections: { title: string; content: string }[] = [
    { title: t.privacySection1Title, content: t.privacySection1Content },
    { title: t.privacySection2Title, content: t.privacySection2Content },
    { title: t.privacySection3Title, content: t.privacySection3Content },
    { title: t.privacySection4Title, content: t.privacySection4Content },
    { title: t.privacySection5Title, content: t.privacySection5Content },
    { title: t.privacySection6Title, content: t.privacySection6Content },
    { title: t.privacySection7Title, content: t.privacySection7Content },
    { title: t.privacySection8Title, content: t.privacySection8Content },
  ];

  return (
    <article className="pt-24 pb-32" aria-label={t.privacyTitle}>
      <div className="mx-auto max-w-3xl px-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: "var(--primary)" }}
        >
          <i className="fa-solid fa-arrow-left" aria-hidden />
          {t.privacyBack}
        </button>

        <header className="mb-10 border-b pb-6" style={{ borderColor: "var(--border)" }}>
          <h1
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{ color: "var(--text)" }}
          >
            {t.privacyTitle}
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--text-tertiary)" }}
          >
            {t.privacyLastUpdated}
          </p>
        </header>

        <p
          className="mb-10 text-base leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {t.privacyIntro}
        </p>

        {sections.map(({ title, content }) => (
          <Section key={title} title={title}>
            {content.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </Section>
        ))}

        <section className="mt-10 rounded-lg p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h2
            className="mb-2 text-lg font-semibold"
            style={{ color: "var(--text)" }}
          >
            {t.privacyContactTitle}
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {t.privacyContactIntro}
          </p>
        </section>
      </div>
    </article>
  );
}
