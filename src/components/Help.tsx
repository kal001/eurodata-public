import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export type HelpTranslations = {
  helpPageTitle: string;
  helpBack: string;
  helpIntro: string;
  helpLoading: string;
  helpLoadError: string;
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
  /** Locale code (e.g. "pt", "en"). When a file /help/{languageCode}.md exists, it is loaded and rendered; otherwise a short fallback message is shown. */
  languageCode: string;
};

const helpMarkdownClass = "help-markdown";

const markdownComponents = {
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="mt-8 mb-3 text-xl font-semibold" style={{ color: "var(--text)" }}>
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mt-6 mb-2 text-lg font-medium" style={{ color: "var(--text)" }}>
      {children}
    </h3>
  ),
  h4: ({ children }: { children?: React.ReactNode }) => (
    <h4 className="mt-4 mb-2 text-base font-medium" style={{ color: "var(--text)" }}>
      {children}
    </h4>
  ),
  p: ({ children }: { children?: React.ReactNode }) => <p className="mb-3">{children}</p>,
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => <li className="ml-0">{children}</li>,
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-left" style={{ borderColor: "var(--border)" }}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead>
      <tr style={{ borderBottom: "2px solid var(--border)" }}>{children}</tr>
    </thead>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th
      className="py-2 pr-3 font-semibold"
      style={{ color: "var(--text)", borderColor: "var(--border)" }}
    >
      {children}
    </th>
  ),
  tbody: ({ children }: { children?: React.ReactNode }) => <tbody>{children}</tbody>,
  tr: ({ children }: { children?: React.ReactNode }) => (
    <tr style={{ borderBottom: "1px solid var(--border)" }}>{children}</tr>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="py-2 pr-3" style={{ borderColor: "var(--border)" }}>
      {children}
    </td>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className="underline hover:opacity-80"
      style={{ color: "var(--primary)" }}
    >
      {children}
    </a>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong style={{ color: "var(--text)" }}>{children}</strong>
  ),
  hr: () => <hr className="my-6" style={{ borderColor: "var(--border)" }} />,
};

function splitMarkdownSections(content: string): { intro: string; sections: { title: string; body: string }[] } {
  const rawParts = content.trim().split(/^## /m);
  const intro = rawParts[0].trim();
  const sections = rawParts.slice(1).map((p) => {
    const idx = p.indexOf("\n");
    const title = (idx >= 0 ? p.slice(0, idx) : p).trim();
    const body = (idx >= 0 ? p.slice(idx + 1) : "").trim();
    return { title, body };
  });
  return { intro, sections };
}

function SupportBlock({
  t,
  bugReportUrl,
  featureRequestUrl,
}: {
  t: HelpTranslations;
  bugReportUrl: string;
  featureRequestUrl: string;
}) {
  return (
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
  );
}

export default function Help({ t, onBack, bugReportUrl, featureRequestUrl, languageCode }: Props) {
  const [mdContent, setMdContent] = useState<string | null>(null);
  const [mdError, setMdError] = useState(false);

  useEffect(() => {
    setMdError(false);
    setMdContent(null);
    fetch(`/help/${languageCode}.md`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.text();
      })
      .then(setMdContent)
      .catch(() => setMdError(true));
  }, [languageCode]);

  const showMarkdownBody = mdContent != null && !mdError;

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

        {mdContent == null && !mdError && (
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t.helpLoading}</p>
        )}

        {mdError && (
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            {t.helpLoadError}
          </p>
        )}

        {showMarkdownBody && mdContent && (() => {
          const { intro, sections } = splitMarkdownSections(mdContent);
          return (
            <div
              className={`${helpMarkdownClass} mb-10 text-sm leading-relaxed`}
              style={{ color: "var(--text-secondary)" }}
            >
              {intro ? (
                <div className="mb-6">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {intro}
                  </ReactMarkdown>
                </div>
              ) : null}
              {sections.map(({ title, body }) => (
                <details
                  key={title}
                  className="group mb-4"
                >
                  <summary className="flex items-center gap-2 cursor-pointer list-none py-2 font-semibold select-none hover:opacity-90 transition-opacity text-xl [&::-webkit-details-marker]:hidden"
                    style={{ color: "var(--text)" }}
                  >
                    <i
                      className="fa-solid fa-chevron-down text-xs transition-transform duration-200 group-open:rotate-180 shrink-0"
                      style={{ color: "var(--text-secondary)" }}
                      aria-hidden
                    />
                    <span>{title}</span>
                  </summary>
                  <div className="pt-2 pb-2 pl-6">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {body}
                    </ReactMarkdown>
                  </div>
                </details>
              ))}
            </div>
          );
        })()}

        <SupportBlock t={t} bugReportUrl={bugReportUrl} featureRequestUrl={featureRequestUrl} />
      </div>
    </article>
  );
}
