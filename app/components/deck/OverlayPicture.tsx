import { Box, Dialog } from "@mui/material";
import styled from "@emotion/styled";
import { createWorker } from "tesseract.js";
import { useEffect, useState } from "react";

const FullScreenImage = styled.img``;

type OverlayPictureProps = {
  file: File | undefined;
  onClose: (file?: File) => void;
};

const parseImage = async (file: File) => {
  const worker = await createWorker("dan");
  const result = await worker.recognize(file, {}, { hocr: true });
  console.log(result.data.text);

  await worker.terminate();
};

export const OverlayPicture = ({ file, onClose }: OverlayPictureProps) => {
  const [base64, setBase64] = useState("");

  useEffect(() => {
    const bytesToBase64 = async (_file: File) => {
      const binString = Array.from(await _file.bytes(), (byte) =>
        String.fromCodePoint(byte),
      ).join("");
      setBase64(btoa(binString));
    };

    if (file) {
      bytesToBase64(file);
      parseImage(file);
    }
  }, [file]);

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={!!file} onClose={handleClose}>
      {!!base64 && <FullScreenImage src={`data:image/png;base64,${base64}`} />}
    </Dialog>
  );
};
