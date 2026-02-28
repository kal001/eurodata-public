import type { ReactNode } from "react";

export type TermsOfServiceTranslations = {
  termsTitle: string;
  termsBack: string;
  termsLastUpdated: string;
  termsIntro: string;
  termsSection1Title: string;
  termsSection1Content: string;
  termsSection2Title: string;
  termsSection2Content: string;
  termsSection3Title: string;
  termsSection3Content: string;
  termsSection4Title: string;
  termsSection4Content: string;
  termsSection5Title: string;
  termsSection5Content: string;
  termsSection6Title: string;
  termsSection6Content: string;
  termsSection7Title: string;
  termsSection7Content: string;
  termsSection8Title: string;
  termsSection8Content: string;
  termsContactTitle: string;
  termsContactIntro: string;
};

type Props = {
  t: TermsOfServiceTranslations;
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
        className="mb-3 text-xl font-semibold"
        style={{ color: "var(--text)" }}
      >
        {title}
      </h2>
      <div
        className="space-y-3 text-sm leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        {children}
      </div>
    </section>
  );
}

export default function TermsOfService({ t, onBack }: Props) {
  const sections: { title: string; content: string }[] = [
    { title: t.termsSection1Title, content: t.termsSection1Content },
    { title: t.termsSection2Title, content: t.termsSection2Content },
    { title: t.termsSection3Title, content: t.termsSection3Content },
    { title: t.termsSection4Title, content: t.termsSection4Content },
    { title: t.termsSection5Title, content: t.termsSection5Content },
    { title: t.termsSection6Title, content: t.termsSection6Content },
    { title: t.termsSection7Title, content: t.termsSection7Content },
    { title: t.termsSection8Title, content: t.termsSection8Content },
  ];

  return (
    <article className="pt-24 pb-32" aria-label={t.termsTitle}>
      <div className="mx-auto max-w-3xl px-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: "var(--primary)" }}
        >
          <i className="fa-solid fa-arrow-left" aria-hidden />
          {t.termsBack}
        </button>

        <header className="mb-10 border-b pb-6" style={{ borderColor: "var(--border)" }}>
          <h1
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{ color: "var(--text)" }}
          >
            {t.termsTitle}
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--text-tertiary)" }}
          >
            {t.termsLastUpdated}
          </p>
        </header>

        <p
          className="mb-10 text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {t.termsIntro}
        </p>

        {sections.map(({ title, content }) => (
          <Section key={title} title={title}>
            {content.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </Section>
        ))}

        <section
          className="mt-10 rounded-lg p-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <h2
            className="mb-2 text-lg font-semibold"
            style={{ color: "var(--text)" }}
          >
            {t.termsContactTitle}
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {t.termsContactIntro}
          </p>
        </section>
      </div>
    </article>
  );
}
