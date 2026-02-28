/**
 * Dynamic loader for locale translations. Loads only the active locale chunk.
 * English is loaded statically in App for first paint; other locales load on demand.
 * Uses explicit named exports to avoid default-export cache staleness issues.
 */
type Translations = Record<string, string>;

const localeToChunk: Record<string, () => Promise<Translations>> = {
  en: () => import("./translations/en").then((m) => m.translationsEn),
  pt: () => import("./translations/pt").then((m) => m.translationsPt),
  es: () => import("./translations/es").then((m) => m.translationsEs),
  fr: () => import("./translations/fr").then((m) => m.translationsFr),
  de: () => import("./translations/de").then((m) => m.translationsDe),
  it: () => import("./translations/it").then((m) => m.translationsIt),
  nl: () => import("./translations/nl").then((m) => m.translationsNl),
  pl: () => import("./translations/pl").then((m) => m.translationsPl),
};

export function loadTranslations(code: string): Promise<Translations> {
  const loader = localeToChunk[code] ?? localeToChunk.en;
  return loader();
}

