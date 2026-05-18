import en from "./en";
import { LanguagePath, Path } from "./types";

const translations = {
  en,
};

const languagePaths: Record<string, LanguagePath> = {
  ar: "languages.ar",
  cs: "languages.cs",
  da: "languages.da",
  de: "languages.de",
  el: "languages.el",
  en: "languages.en",
  es: "languages.es",
  fi: "languages.fi",
  fr: "languages.fr",
  he: "languages.he",
  hi: "languages.hi",
  hu: "languages.hu",
  id: "languages.id",
  it: "languages.it",
  ja: "languages.ja",
  ko: "languages.ko",
  ms: "languages.ms",
  nl: "languages.nl",
  no: "languages.no",
  pl: "languages.pl",
  pt: "languages.pt",
  ro: "languages.ro",
  ru: "languages.ru",
  sv: "languages.sv",
  th: "languages.th",
  tr: "languages.tr",
  uk: "languages.uk",
  vi: "languages.vi",
  zh: "languages.zh",
};

type TranslationParams = Record<string, string | number>;

function normalizeLanguageCode(code: string) {
  const normalizedCode = code.trim().toLowerCase();

  return normalizedCode === "dk" ? "da" : normalizedCode;
}

function interpolateTranslation(template: string, params?: TranslationParams) {
  if (!params) {
    return template;
  }

  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    const value = params[key];

    return value === undefined ? match : String(value);
  });
}

export const getTranslation = (path: Path, params?: TranslationParams) => {
  const defaultLanguage = "en";

  return interpolateTranslation(translations[defaultLanguage][path], params);
};

export const getLanguageLabel = (code: string) => {
  if (!code.trim()) {
    return getTranslation("languages.unknown");
  }

  const path = languagePaths[normalizeLanguageCode(code)];

  return path ? getTranslation(path) : code.toUpperCase();
};
