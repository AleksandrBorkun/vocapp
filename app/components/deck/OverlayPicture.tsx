import { Box, Dialog } from "@mui/material";
import { createWorker } from "tesseract.js";
import { useEffect, useState, useCallback } from "react";

type WordBox = {
  word: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type PageSize = { width: number; height: number };

type OverlayPictureProps = {
  file: File | undefined;
  onClose: (file?: File) => void;
};

const parseHocr = (
  hocr: string,
): { words: WordBox[]; pageSize: PageSize | null } => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(hocr, "text/html");

  let pageSize: PageSize | null = null;
  const page = doc.querySelector(".ocr_page");
  if (page) {
    const pageTitle = page.getAttribute("title") || "";
    const pageMatch = pageTitle.match(/bbox\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);
    if (pageMatch) {
      pageSize = { width: Number(pageMatch[3]), height: Number(pageMatch[4]) };
    }
  }

  const spans = doc.querySelectorAll(".ocrx_word");
  const words: WordBox[] = [];

  spans.forEach((span) => {
    const title = span.getAttribute("title") || "";
    const match = title.match(/bbox\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);
    const text = span.textContent?.trim();
    if (match && text) {
      words.push({
        word: text,
        x1: Number(match[1]),
        y1: Number(match[2]),
        x2: Number(match[3]),
        y2: Number(match[4]),
      });
    }
  });

  return { words, pageSize };
};

const parseImage = async (file: File): Promise<string> => {
  const worker = await createWorker("dan");
  const result = await worker.recognize(file, {}, { hocr: true });
  await worker.terminate();
  return result.data.hocr ?? "";
};

export const OverlayPicture = ({ file, onClose }: OverlayPictureProps) => {
  const [base64, setBase64] = useState("");
  const [wordBoxes, setWordBoxes] = useState<WordBox[]>([]);
  const [pageSize, setPageSize] = useState<PageSize | null>(null);

  useEffect(() => {
    const processFile = async (_file: File) => {
      const binString = Array.from(await _file.bytes(), (byte) =>
        String.fromCodePoint(byte),
      ).join("");
      setBase64(btoa(binString));

      const hocr = await parseImage(_file);
      const { words, pageSize: size } = parseHocr(hocr);
      setWordBoxes(words);
      setPageSize(size);
    };

    if (file) {
      processFile(file);
    } else {
      setWordBoxes([]);
      setPageSize(null);
      setBase64("");
    }
  }, [file]);

  const handleClose = () => {
    onClose();
  };

  const handleSvgClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const target = e.target as SVGElement;
    const word = target.getAttribute("data-word");
    if (word) {
      console.log("Clicked word:", word);
    }
  }, []);

  return (
    <Dialog open={!!file} onClose={handleClose}>
      {!!base64 && pageSize && (
        <Box sx={{ position: "relative", lineHeight: 0 }}>
          <img
            src={`data:image/png;base64,${base64}`}
            alt="OCR source"
            style={{ width: "100%", display: "block" }}
          />
          <svg
            viewBox={`0 0 ${pageSize.width} ${pageSize.height}`}
            preserveAspectRatio="xMidYMid meet"
            onClick={handleSvgClick}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              cursor: "default",
            }}
          >
            {wordBoxes.map((wb, i) => (
              <rect
                key={i}
                x={wb.x1}
                y={wb.y1}
                width={wb.x2 - wb.x1}
                height={wb.y2 - wb.y1}
                fill="transparent"
                data-word={wb.word}
                style={{ cursor: "pointer" }}
              />
            ))}
            <style>{`rect:hover { fill: rgba(88,116,140,0.3); }`}</style>
          </svg>
        </Box>
      )}
    </Dialog>
  );
};
