/**
 * Language utilities for VocApp
 * Provides validation and normalization for language codes
 */

import { LANGUAGES, mapToDeeplCode, mapToPixabayCode } from '@/lib/constants/languages';

/**
 * Validates if a language code is supported by the application
 * @param code - Language code to validate
 * @returns true if the language is supported
 * @example
 * isValidLanguageCode('en') // true
 * isValidLanguageCode('da') // true
 * isValidLanguageCode('DK') // true (Danish variant)
 * isValidLanguageCode('xyz') // false
 */
export function isValidLanguageCode(code: string): boolean {
    if (!code) return false;

    const normalizedCode = code.toLowerCase();

    // Check if it's in the supported languages list
    const isInList = LANGUAGES.some((lang) => lang.code.toLowerCase() === normalizedCode);

    // Special case for DK (Danish variant)
    if (normalizedCode === 'dk') return true;

    return isInList;
}

/**
 * Normalizes a language code to lowercase format
 * Handles special cases like 'DK' -> 'da'
 * @param code - Language code to normalize
 * @returns Normalized language code
 * @example
 * normalizeLanguageCode('EN') // 'en'
 * normalizeLanguageCode('DK') // 'da'
 * normalizeLanguageCode('Da') // 'da'
 */
export function normalizeLanguageCode(code: string): string {
    if (!code) return 'en';

    const lower = code.toLowerCase();

    // Map DK to da (Danish)
    if (lower === 'dk') return 'da';

    return lower;
}

/**
 * Gets the language name from a code
 * @param code - Language code
 * @returns Language name or the code itself if not found
 * @example
 * getLanguageName('en') // 'English'
 * getLanguageName('da') // 'Danish'
 * getLanguageName('DK') // 'Danish'
 */
export function getLanguageName(code: string): string {
    if (!code) return 'Unknown';

    const normalizedCode = normalizeLanguageCode(code);
    const language = LANGUAGES.find((lang) => lang.code === normalizedCode);

    return language ? language.name : code.toUpperCase();
}

/**
 * Formats a language code for display (uppercase)
 * @param code - Language code
 * @returns Uppercase language code
 * @example
 * formatLanguageCode('en') // 'EN'
 * formatLanguageCode('da') // 'DA'
 * formatLanguageCode('dk') // 'DK'
 */
export function formatLanguageCode(code: string): string {
    if (!code) return '';
    return code.toUpperCase();
}

/**
 * Validates and formats a language pair for deck creation
 * @param studyLang - Language to study
 * @param nativeLang - Native language
 * @returns Object with validated codes or error message
 * @example
 * validateLanguagePair('dk', 'en') // { valid: true, studyLang: 'DA', nativeLang: 'EN' }
 * validateLanguagePair('xyz', 'en') // { valid: false, error: 'Invalid study language' }
 */
export function validateLanguagePair(
    studyLang: string,
    nativeLang: string
): { valid: boolean; studyLang?: string; nativeLang?: string; error?: string } {
    if (!studyLang || !nativeLang) {
        return { valid: false, error: 'Both languages are required' };
    }

    if (!isValidLanguageCode(studyLang)) {
        return { valid: false, error: 'Invalid study language code' };
    }

    if (!isValidLanguageCode(nativeLang)) {
        return { valid: false, error: 'Invalid native language code' };
    }

    if (studyLang.toLowerCase() === nativeLang.toLowerCase()) {
        return { valid: false, error: 'Study and native language cannot be the same' };
    }

    return {
        valid: true,
        studyLang: formatLanguageCode(studyLang),
        nativeLang: formatLanguageCode(nativeLang),
    };
}

// Re-export mapping functions for convenience
export { mapToDeeplCode, mapToPixabayCode };
