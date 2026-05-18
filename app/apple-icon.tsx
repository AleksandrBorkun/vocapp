import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

const containerStyle = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative" as const,
  backgroundColor: "#0f0d0a",
  borderRadius: "38px",
};

const centeredEllipseStyle = {
  position: "absolute" as const,
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  borderRadius: "50%",
};

export default function AppleIcon() {
  return new ImageResponse(
    <div style={containerStyle}>
      <div
        style={{
          ...centeredEllipseStyle,
          width: 124,
          height: 146,
          backgroundColor: "#2a5535",
        }}
      />
      <div
        style={{
          ...centeredEllipseStyle,
          width: 90,
          height: 112,
          backgroundColor: "#c8d97a",
        }}
      />
      <div
        style={{
          ...centeredEllipseStyle,
          width: 45,
          height: 50,
          top: "54%",
          backgroundColor: "#c87c3b",
        }}
      />
    </div>,
    size,
  );
}
