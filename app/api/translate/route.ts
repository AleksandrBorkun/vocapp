import { NextRequest, NextResponse } from "next/server";

// Language code mapping from your app codes to DeepL API codes
const languageMap: Record<string, string> = {
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

    // Danish
    DK: "DA",
    dk: "DA",
};

function mapLanguageCode(code: string): string {
    return languageMap[code] || code.toUpperCase();
}

export async function POST(request: NextRequest) {
    try {
        const { text, sourceLang, targetLang } = await request.json();

        // Validation
        if (!text || typeof text !== "string" || text.trim() === "") {
            return NextResponse.json(
                { error: "Text is required and must be a non-empty string" },
                { status: 400 }
            );
        }

        if (!targetLang || typeof targetLang !== "string") {
            return NextResponse.json(
                { error: "Target language is required" },
                { status: 400 }
            );
        }

        // Check for API key
        const apiKey = process.env.DEEPL_API_KEY;
        if (!apiKey) {
            console.error("DEEPL_API_KEY is not configured");
            return NextResponse.json(
                { error: "Translation service is not configured. Please add DEEPL_API_KEY to environment variables." },
                { status: 500 }
            );
        }

        // Map language codes to DeepL format
        const mappedSourceLang = sourceLang ? mapLanguageCode(sourceLang) : undefined;
        const mappedTargetLang = mapLanguageCode(targetLang);

        // Build request body using JSON (header-based authentication)
        const requestBody: Record<string, any> = {
            text: [text.trim()],
            target_lang: mappedTargetLang,
        };

        // Only add source_lang if provided (DeepL can auto-detect)
        if (mappedSourceLang) {
            requestBody.source_lang = mappedSourceLang;
        }

        // Call DeepL API with header-based authentication
        const response = await fetch("https://api-free.deepl.com/v2/translate", {
            method: "POST",
            headers: {
                "Authorization": `DeepL-Auth-Key ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("DeepL API error:", response.status, errorText);

            // Handle specific errors
            if (response.status === 403) {
                return NextResponse.json(
                    { error: "Invalid API key. Please check your DEEPL_API_KEY." },
                    { status: 500 }
                );
            } else if (response.status === 456) {
                return NextResponse.json(
                    { error: "Quota exceeded. You have reached your DeepL API usage limit." },
                    { status: 429 }
                );
            } else if (response.status === 400) {
                return NextResponse.json(
                    { error: "Invalid language code or unsupported language pair." },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { error: "Translation service error. Please try again later." },
                { status: 500 }
            );
        }

        const data = await response.json();

        // Extract translated text
        if (data.translations && data.translations.length > 0) {
            const translation = data.translations[0];
            return NextResponse.json({
                translatedText: translation.text,
                detectedSourceLang: translation.detected_source_language,
            });
        }

        return NextResponse.json(
            { error: "No translation returned from service" },
            { status: 500 }
        );
    } catch (error) {
        console.error("Translation API error:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred during translation" },
            { status: 500 }
        );
    }
}
