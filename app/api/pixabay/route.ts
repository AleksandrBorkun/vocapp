import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

// Language code mapping from app codes to Pixabay ISO 639-1 codes
const pixabayLanguageMap: Record<string, string> = {
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

function mapLanguageCode(code: string): string {
    return pixabayLanguageMap[code] || "en"; // Default to English if unknown
}

// Cached function to fetch Pixabay image
const getCachedPixabayImage = async (
    searchTerm: string,
    lang: string,
    apiKey: string
): Promise<string | null> => {
    const mappedLang = mapLanguageCode(lang);
    const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(searchTerm)}&lang=${mappedLang}&image_type=photo&per_page=3&safesearch=true`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            console.error("Pixabay API error:", response.status);
            return null;
        }

        const data = await response.json();

        // Return first image URL if available, otherwise null
        if (data.hits && data.hits.length > 0) {
            // Return the previewURL for smaller file size (better for base64 encoding)
            return data.hits[0].webformatURL || data.hits[0].previewURL;
        }

        return null;
    } catch (error) {
        console.error("Pixabay fetch error:", error);
        return null;
    }
};

export async function POST(request: NextRequest) {
    try {
        const { word, lang } = await request.json();

        // Validation
        if (!word || typeof word !== "string" || word.trim() === "") {
            return NextResponse.json(
                { error: "Word is required and must be a non-empty string" },
                { status: 400 }
            );
        }

        if (!lang || typeof lang !== "string") {
            return NextResponse.json(
                { error: "Language code is required" },
                { status: 400 }
            );
        }

        // Check for API key
        const apiKey = process.env.PIXABAY_API_KEY;
        if (!apiKey) {
            console.error("PIXABAY_API_KEY is not configured");
            return NextResponse.json(
                {
                    error:
                        "Image service is not configured. Please add PIXABAY_API_KEY to environment variables.",
                },
                { status: 500 }
            );
        }

        // Create cache key based on word and language
        const cacheKey = `${word.trim().toLowerCase()}-${lang}`;

        // Use Next.js cache with 7 day revalidation
        const cachedFetch = unstable_cache(
            async () => getCachedPixabayImage(word.trim(), lang, apiKey),
            [`pixabay-${cacheKey}`],
            {
                revalidate: 604800, // 7 days in seconds
                tags: [`pixabay-${cacheKey}`],
            }
        );

        const imageUrl = await cachedFetch();

        if (!imageUrl) {
            return NextResponse.json(
                { imageUrl: null, message: "No image found for this word" },
                { status: 200 }
            );
        }

        // Convert image URL to base64
        try {
            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) {
                throw new Error("Failed to fetch image");
            }

            const arrayBuffer = await imageResponse.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Compress and resize image using sharp
            const compressedBuffer = await sharp(buffer)
                .resize({ width: 800, withoutEnlargement: true })
                .jpeg({ quality: 50 })
                .toBuffer();

            const base64 = compressedBuffer.toString("base64");
            const base64Image = `data:image/jpeg;base64,${base64}`;

            return NextResponse.json({
                imageUrl: base64Image,
                message: "Image found and encoded",
            });
        } catch (error) {
            console.error("Error converting image to base64:", error);
            return NextResponse.json(
                {
                    imageUrl: null,
                    message: "Image found but failed to encode",
                },
                { status: 200 }
            );
        }
    } catch (error) {
        console.error("Pixabay API route error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
