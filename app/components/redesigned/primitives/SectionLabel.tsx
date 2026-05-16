import { Typography } from "@mui/material";

interface SectionLabelProps {
  children: string;
  sx?: object;
}

export default function SectionLabel({ children, sx }: SectionLabelProps) {
  return (
    <Typography
      sx={{
        px: 3,
        pb: 1.25,
        color: "text.secondary",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
}