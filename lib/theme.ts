'use client';
import { createTheme } from '@mui/material/styles';
import { customColors } from './constants/colors';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: customColors.background.dark,
            dark: customColors.background.paper,
            light: customColors.background.light,
        },
        secondary: {
            main: customColors.text.secondary,
        },
        background: {
            default: customColors.background.dark,
            paper: customColors.background.paper,
        },
        text: {
            primary: customColors.text.primary,
            secondary: customColors.text.secondary,
        },
    },
    typography: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                },
            },
        },
    },
});

export default theme;
