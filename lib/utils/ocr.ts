import { mapToTesseractCode } from "@/lib/constants/languages";
import { createWorker } from "tesseract.js";

export interface OcrPageSize {
    width: number;
    height: number;
}

export interface OcrWordBox {
    text: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface OcrExtractionResult {
    imageSrc: string;
    pageSize: OcrPageSize | null;
    wordBoxes: OcrWordBox[];
    ocrLanguage: string;
}

function normalizeDetectedText(text: string) {
    const normalized = text
        .replace(/\s+/g, " ")
        .replace(/^[^\p{L}\p{N}'-]+|[^\p{L}\p{N}'-]+$/gu, "")
        .trim();

    if (!normalized || !/\p{L}/u.test(normalized)) {
        return "";
    }

    return normalized;
}

export function parseHocr(hocr: string): {
    pageSize: OcrPageSize | null;
    wordBoxes: OcrWordBox[];
} {
    const parser = new DOMParser();
    const documentNode = parser.parseFromString(hocr, "text/html");
    const page = documentNode.querySelector(".ocr_page");
    const rawPageTitle = page?.getAttribute("title") || "";
    const pageMatch = rawPageTitle.match(/bbox\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);
    const pageSize = pageMatch
        ? {
            width: Number(pageMatch[3]),
            height: Number(pageMatch[4]),
        }
        : null;

    const seenWords = new Set<string>();
    const wordBoxes = Array.from(documentNode.querySelectorAll(".ocrx_word"))
        .map((node) => {
            const title = node.getAttribute("title") || "";
            const match = title.match(/bbox\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);
            const text = normalizeDetectedText(node.textContent || "");

            if (!match || !text) {
                return null;
            }

            const dedupeKey = text.toLocaleLowerCase();
            if (seenWords.has(dedupeKey)) {
                return null;
            }

            seenWords.add(dedupeKey);

            return {
                text,
                x1: Number(match[1]),
                y1: Number(match[2]),
                x2: Number(match[3]),
                y2: Number(match[4]),
            };
        })
        .filter((value): value is OcrWordBox => value !== null);

    return { pageSize, wordBoxes };
}

export function readFileAsDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result === "string") {
                resolve(reader.result);
                return;
            }

            reject(new Error("Failed to read image preview"));
        };

        reader.onerror = () => {
            reject(reader.error || new Error("Failed to read image preview"));
        };

        reader.readAsDataURL(file);
    });
}

export async function extractWordsFromImage(
    file: File,
    languageCode: string,
): Promise<OcrExtractionResult> {
    const ocrLanguage = mapToTesseractCode(languageCode);
    const imageSrc = await readFileAsDataUrl(file);
    const worker = await createWorker(ocrLanguage);

    try {
        const result = await worker.recognize(file, {}, { hocr: true });
        const { pageSize, wordBoxes } = parseHocr(result.data.hocr ?? "");

        return {
            imageSrc,
            pageSize,
            wordBoxes,
            ocrLanguage,
        };
    } finally {
        await worker.terminate();
    }
}