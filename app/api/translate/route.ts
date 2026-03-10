/**
 * DeepL Translation API Route
 * Translates text between languages using the DeepL API
 * 
 * @endpoint POST /api/translate
 * @param request.text - Text to translate (required)
 * @param request.sourceLang - Source language code (optional, auto-detected if omitted)
 * @param request.targetLang - Target language code (required)
 * 
 * @returns JSON response with translated text or error
 * @example
 * POST /api/translate
 * Body: { text: "Hello", sourceLang: "en", targetLang: "da" }
 * Response: { translatedText: "Hej" } or { error: "..." }
 */

import { mapToDeeplCode } from "@/lib/constants/languages";
import { NextRequest, NextResponse } from "next/server";

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
        const mappedSourceLang = sourceLang ? mapToDeeplCode(sourceLang) : undefined;
        const mappedTargetLang = mapToDeeplCode(targetLang);

        // Build request body for DeepL API
        interface DeepLRequestBody {
            text: string[];
            target_lang: string;
            source_lang?: string;
        }

        const requestBody: DeepLRequestBody = {
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
