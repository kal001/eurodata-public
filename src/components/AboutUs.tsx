import type { ReactNode } from "react";

export type AboutUsTranslations = {
  aboutTitle: string;
  aboutBack: string;
  aboutLastUpdated: string;
  aboutIntro: string;
  aboutMissionTitle: string;
  aboutMissionContent: string;
  aboutPsd2Paragraph: string;
  aboutPsd2LinkText: string;
  aboutValuesTitle: string;
  aboutValuesContent: string;
  aboutContactTitle: string;
  aboutContactIntro: string;
};

type Props = {
  t: AboutUsTranslations;
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

export default function AboutUs({ t, onBack }: Props) {
  return (
    <article className="pt-24 pb-32" aria-label={t.aboutTitle}>
      <div className="mx-auto max-w-3xl px-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: "var(--primary)" }}
        >
          <i className="fa-solid fa-arrow-left" aria-hidden />
          {t.aboutBack}
        </button>

        <header className="mb-10 border-b pb-6" style={{ borderColor: "var(--border)" }}>
          <h1
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{ color: "var(--text)" }}
          >
            {t.aboutTitle}
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--text-tertiary)" }}
          >
            {t.aboutLastUpdated}
          </p>
        </header>

        <p
          className="mb-10 text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {t.aboutIntro}
        </p>

        <Section title={t.aboutMissionTitle}>
          {t.aboutMissionContent.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
          <p>
            {t.aboutPsd2Paragraph}{" "}
            <a
              href="https://www.ecb.europa.eu/press/intro/mip-online/2018/html/1803_revisedpsd.en.html"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80"
              style={{ color: "var(--primary)" }}
            >
              {t.aboutPsd2LinkText}
            </a>
          </p>
        </Section>

        <Section title={t.aboutValuesTitle}>
          {t.aboutValuesContent.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </Section>

        <section
          className="mt-10 rounded-lg p-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <h2
            className="mb-2 text-lg font-semibold"
            style={{ color: "var(--text)" }}
          >
            {t.aboutContactTitle}
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {t.aboutContactIntro}
          </p>
        </section>
      </div>
    </article>
  );
}
