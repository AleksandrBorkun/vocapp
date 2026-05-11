/**
 * VocApp Design System Color Palette
 * Centralized color constants for consistent theming across the application
 */
export const customColors = {
    background: {
        dark: '#161616',
        paper: '#454545',
        light: '#F0EFF7',
    },
    text: {
        primary: '#fefdfe',
        secondary: '#f3f2f9',
    },
}

export const colors = {
    // Primary palette
    darkestBlue: '#00030D',
    darkBlue: '#0C1526',
    mediumBlue: '#58748C',
    slateBlue: '#4F6273',
    lightBlue: '#B8CAD9',

    // Semantic naming for better context
    primary: '#58748C',
    secondary: '#4F6273',
    background: {
        dark: '#00030D',
        paper: '#0C1526',
        light: '#B8CAD9',
    },
    text: {
        primary: '#B8CAD9',
        secondary: '#58748C',
    },
} as const;

export type Colors = typeof colors;
