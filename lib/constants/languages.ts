/**
 * Language codes and mappings for VocApp
 * Centralizes language-related constants used across the application
 */

export interface Language {
    code: string;
    name: string;
}

/**
 * Supported languages for the application
 * Used in onboarding and deck creation
 */
export const LANGUAGES: Language[] = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "ar", name: "Arabic" },
    { code: "hi", name: "Hindi" },
    { code: "nl", name: "Dutch" },
    { code: "pl", name: "Polish" },
    { code: "tr", name: "Turkish" },
    { code: "sv", name: "Swedish" },
    { code: "no", name: "Norwegian" },
    { code: "da", name: "Danish" },
    { code: "fi", name: "Finnish" },
    { code: "cs", name: "Czech" },
    { code: "uk", name: "Ukrainian" },
    { code: "ro", name: "Romanian" },
    { code: "el", name: "Greek" },
    { code: "hu", name: "Hungarian" },
    { code: "th", name: "Thai" },
    { code: "vi", name: "Vietnamese" },
    { code: "id", name: "Indonesian" },
    { code: "ms", name: "Malay" },
    { code: "he", name: "Hebrew" },
];

/**
 * Maps application language codes to DeepL API language codes
 * Used for translation API calls
 */
export const DEEPL_LANGUAGE_MAP: Record<string, string> = {
    // English variants
    EN: "EN-US",
    en: "EN-US",

    // Portuguese variants
    PT: "PT-PT",
    pt: "PT-PT",

    // Other languages (map uppercase and lowercase to DeepL format)
    BG: "BG",
    bg: "BG",
    CS: "CS",
    cs: "CS",
    DA: "DA",
    da: "DA",
    DE: "DE",
    de: "DE",
    EL: "EL",
    el: "EL",
    ES: "ES",
    es: "ES",
    ET: "ET",
    et: "ET",
    FI: "FI",
    fi: "FI",
    FR: "FR",
    fr: "FR",
    HU: "HU",
    hu: "HU",
    ID: "ID",
    id: "ID",
    IT: "IT",
    it: "IT",
    JA: "JA",
    ja: "JA",
    KO: "KO",
    ko: "KO",
    LT: "LT",
    lt: "LT",
    LV: "LV",
    lv: "LV",
    NB: "NB",
    nb: "NB",
    NL: "NL",
    nl: "NL",
    PL: "PL",
    pl: "PL",
    RO: "RO",
    ro: "RO",
    RU: "RU",
    ru: "RU",
    SK: "SK",
    sk: "SK",
    SL: "SL",
    sl: "SL",
    SV: "SV",
    sv: "SV",
    TR: "TR",
    tr: "TR",
    UK: "UK",
    uk: "UK",
    ZH: "ZH",
    zh: "ZH",

    // Danish special case
    DK: "DA",
    dk: "DA",
};

/**
 * Maps application language codes to Pixabay ISO 639-1 codes
 * Used for image search API calls
 */
export const PIXABAY_LANGUAGE_MAP: Record<string, string> = {
    // Map uppercase app codes to lowercase ISO codes
    EN: "en",
    DK: "da", // Danish
    PT: "pt",
    ES: "es",
    FR: "fr",
    DE: "de",
    IT: "it",
    BG: "bg",
    CS: "cs",
    DA: "da",
    EL: "el",
    ET: "et",
    FI: "fi",
    HU: "hu",
    ID: "id",
    JA: "ja",
    KO: "ko",
    LT: "lt",
    LV: "lv",
    NB: "nb",
    NL: "nl",
    PL: "pl",
    RO: "ro",
    RU: "ru",
    SK: "sk",
    SL: "sl",
    SV: "sv",
    TR: "tr",
    UK: "uk",
    ZH: "zh",
    // Support lowercase input as well
    en: "en",
    dk: "da",
    pt: "pt",
    es: "es",
    fr: "fr",
    de: "de",
    it: "it",
    bg: "bg",
    cs: "cs",
    da: "da",
    el: "el",
    et: "et",
    fi: "fi",
    hu: "hu",
    id: "id",
    ja: "ja",
    ko: "ko",
    lt: "lt",
    lv: "lv",
    nb: "nb",
    nl: "nl",
    pl: "pl",
    ro: "ro",
    ru: "ru",
    sk: "sk",
    sl: "sl",
    sv: "sv",
    tr: "tr",
    uk: "uk",
    zh: "zh",
};

/**
 * Maps application language code to DeepL API format
 * @param code - Language code from the application
 * @returns DeepL-compatible language code
 */
export function mapToDeeplCode(code: string): string {
    return DEEPL_LANGUAGE_MAP[code] || code.toUpperCase();
}

/**
 * Maps application language code to Pixabay API format
 * @param code - Language code from the application
 * @returns Pixabay-compatible language code (defaults to 'en' if unknown)
 */
export function mapToPixabayCode(code: string): string {
    return PIXABAY_LANGUAGE_MAP[code] || "en";
}
