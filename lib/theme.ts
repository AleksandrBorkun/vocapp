'use client';
import { createTheme } from '@mui/material/styles';
import { colors } from './constants/colors';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: colors.mediumBlue,
            dark: colors.darkestBlue,
            light: colors.lightBlue,
        },
        secondary: {
            main: colors.slateBlue,
        },
        background: {
            default: colors.darkestBlue,
            paper: colors.darkBlue,
        },
        text: {
            primary: colors.lightBlue,
            secondary: colors.mediumBlue,
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
