/**
 * Common style patterns and reusable sx props
 * Reduces duplication across components
 */

import { SxProps, Theme } from '@mui/material';

/**
 * Responsive font sizes for consistent typography
 */
export const responsiveFontSizes = {
    hero: { xs: "2.5rem", sm: "3rem", md: "3.75rem" },
    h1: { xs: "2rem", sm: "2.5rem" },
    h2: { xs: "1.75rem", sm: "2rem" },
    h3: { xs: "1.5rem", sm: "1.875rem" },
    h4: { xs: "1.25rem", sm: "1.5rem" },
    h5: { xs: "1.125rem", sm: "1.25rem" },
    body: { xs: "0.875rem", sm: "1rem" },
};

/**
 * Common container styles
 */
export const containerStyles = {
    fullPage: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
    } as SxProps<Theme>,

    centeredColumn: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    } as SxProps<Theme>,
};

/**
 * Common card styles
 */
export const cardStyles = {
    base: {
        bgcolor: "background.paper",
        borderRadius: 2,
        border: 1,
        borderColor: "secondary.main",
    } as SxProps<Theme>,

    hoverable: {
        bgcolor: "background.paper",
        borderRadius: 2,
        border: 1,
        borderColor: "secondary.main",
        "&:hover": {
            borderColor: "primary.main",
        },
    } as SxProps<Theme>,

    dashed: {
        border: 2,
        borderStyle: "dashed",
        borderColor: "grey.300",
        borderRadius: 2,
        "&:hover": {
            borderColor: "primary.main",
        },
    } as SxProps<Theme>,
};

/**
 * Common modal/dialog styles
 */
export const dialogStyles = {
    paper: {
        bgcolor: "background.paper",
        borderRadius: 2,
        border: 1,
        borderColor: "secondary.main",
    } as SxProps<Theme>,

    mobileFullScreen: {
        bgcolor: "background.paper",
        borderRadius: { xs: 0, sm: 2 },
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        border: 1,
        borderColor: "secondary.main",
        m: 0,
        position: { xs: "fixed", sm: "relative" },
        top: { xs: 0, sm: "auto" },
    } as SxProps<Theme>,
};

/**
 * Common button patterns
 */
export const buttonStyles = {
    flexFull: {
        flex: 1,
    } as SxProps<Theme>,

    createCard: {
        bgcolor: "white",
        p: { xs: 3, sm: 4 },
        borderRadius: 2,
        boxShadow: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        border: 2,
        borderStyle: "dashed",
        borderColor: "grey.300",
        "&:hover": {
            boxShadow: 6,
            borderColor: "primary.main",
        },
    } as SxProps<Theme>,
};

/**
 * Header/Navigation styles
 */
export const headerStyles = {
    base: {
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "secondary.main",
        p: { xs: 2, sm: 3 },
    } as SxProps<Theme>,

    container: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    } as SxProps<Theme>,
};

/**
 * Spacing presets
 */
export const spacing = {
    section: { xs: 2, sm: 3 },
    card: { xs: 2, sm: 3 },
    small: { xs: 1, sm: 1.5 },
};
