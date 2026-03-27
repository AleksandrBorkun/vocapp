"use client";

import { useRef } from "react";
import { Box, IconButton } from "@mui/material";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";

type UploadPictureParams = {
  onUpload: (image: File) => void;
};

export default function UploadPicture(params: UploadPictureParams) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle the selected file
      params.onUpload(file);
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        hidden
      />
      <IconButton
        id="uploadPictureBtn"
        onClick={handleButtonClick}
        sx={{
          bgcolor: "#B8CAD9",
          width: 48,
          height: 48,
          "&:hover": { bgcolor: "#58748C" },
        }}
      >
        <Box component="span" sx={{ fontSize: "1.5rem" }}>
          <DocumentScannerIcon />
        </Box>
      </IconButton>
    </>
  );
}
