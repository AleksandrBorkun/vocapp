/**
 * Pixabay Image Search API Route
 * Fetches relevant images for vocabulary words using the Pixabay API
 * 
 * @endpoint POST /api/pixabay
 * @param request.word - The word to search for (required)
 * @param request.lang - Language code for localized results (required)
 * 
 * @returns JSON response with imageUrl or error
 * @example
 * POST /api/pixabay
 * Body: { word: "cat", lang: "en" }
 * Response: { imageUrl: "https://..." } or { error: "..." }
 */

import { mapToPixabayCode } from "@/lib/constants/languages";
import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * Cached function to fetch Pixabay image
 * Reduces API calls by caching results
 * @param searchTerm - The search term
 * @param lang - Language code
 * @param apiKey - Pixabay API key
 * @returns Image URL or null if not found
 */
const getCachedPixabayImage = async (
    searchTerm: string,
    lang: string,
    apiKey: string
): Promise<string | null> => {
    const mappedLang = mapToPixabayCode(lang);
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
            return data.hits[0].previewURL;
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

        // Return the image URL directly
        return NextResponse.json({
            imageUrl: imageUrl,
            message: "Image found",
        });
    } catch (error) {
        console.error("Pixabay API route error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
