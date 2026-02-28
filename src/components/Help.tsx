export type HelpTranslations = {
  helpPageTitle: string;
  helpBack: string;
  helpIntro: string;
  helpGettingStartedTitle: string;
  helpGettingStartedContent: string;
  helpPageTransactionsTitle: string;
  helpTransactionsContent: string;
  helpSubscriptionTitle: string;
  helpSubscriptionContent: string;
  helpSupportTitle: string;
  helpSupportBody: string;
  helpBugReportLink: string;
  helpFeatureLink: string;
  helpGithubLink: string;
};

type Props = {
  t: HelpTranslations;
  onBack: () => void;
  bugReportUrl: string;
  featureRequestUrl: string;
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
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

export default function Help({ t, onBack, bugReportUrl, featureRequestUrl }: Props) {
  return (
    <article className="pt-24 pb-32" aria-label={t.helpPageTitle}>
      <div className="mx-auto max-w-3xl px-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: "var(--primary)" }}
        >
          <i className="fa-solid fa-arrow-left" aria-hidden />
          {t.helpBack}
        </button>

        <header className="mb-10 border-b pb-6" style={{ borderColor: "var(--border)" }}>
          <h1
            className="text-3xl font-bold tracking-tight md:text-4xl"
            style={{ color: "var(--text)" }}
          >
            {t.helpPageTitle}
          </h1>
          <p
            className="mt-2 text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {t.helpIntro}
          </p>
        </header>

        <Section title={t.helpGettingStartedTitle}>
          {t.helpGettingStartedContent.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </Section>

        <Section title={t.helpPageTransactionsTitle}>
          {t.helpTransactionsContent.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </Section>

        <Section title={t.helpSubscriptionTitle}>
          {t.helpSubscriptionContent.split("\n\n").map((para, i) => (
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
            {t.helpSupportTitle}
          </h2>
          <p
            className="mb-4 text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {t.helpSupportBody}
          </p>
          <div className="flex flex-col gap-2">
            <a
              href={bugReportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-80"
              style={{ color: "var(--primary)" }}
            >
              <i className="fa-solid fa-bug" aria-hidden />
              {t.helpBugReportLink}
            </a>
            <a
              href={featureRequestUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-80"
              style={{ color: "var(--primary)" }}
            >
              <i className="fa-solid fa-lightbulb" aria-hidden />
              {t.helpFeatureLink}
            </a>
            <a
              href="https://github.com/kal001/eurodata-public/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-80"
              style={{ color: "var(--primary)" }}
            >
              <i className="fa-brands fa-github" aria-hidden />
              {t.helpGithubLink}
            </a>
          </div>
        </section>
      </div>
    </article>
  );
}
