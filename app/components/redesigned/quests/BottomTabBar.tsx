"use client";

import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import { redesignedPalette } from "@/lib/redesigned/tokens";
import { BottomTabItemViewModel } from "./types";

interface BottomTabBarProps {
  items: BottomTabItemViewModel[];
  onSelect?: (tabId: string) => void;
}

export default function BottomTabBar({ items, onSelect }: BottomTabBarProps) {
  return (
    <Box
      component="nav"
      sx={{
        borderTop: `1px solid ${redesignedPalette.border}`,
        backgroundColor: redesignedPalette.surface.primary,
        px: 1,
        pt: 1,
        pb: 2.5,
      }}
    >
      <Stack direction="row" justifyContent="space-between">
        {items.map((item) => {
          const activeColor = item.active
            ? redesignedPalette.accent.warm
            : redesignedPalette.text.secondary;

          return (
            <ButtonBase
              key={item.id}
              onClick={() => onSelect?.(item.id)}
              sx={{
                flex: 1,
                borderRadius: 2,
                py: 0.75,
                color: activeColor,
              }}
            >
              <Stack spacing={0.375} alignItems="center">
                <Typography sx={{ fontSize: 22, lineHeight: 1 }}>{item.icon}</Typography>
                <Typography sx={{ fontSize: 10, fontWeight: 500 }}>
                  {item.label}
                </Typography>
              </Stack>
            </ButtonBase>
          );
        })}
      </Stack>
    </Box>
  );
}