'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#58748C', // primary-light
            dark: '#00030D', // primary-dark
            light: '#B8CAD9', // primary-pale
        },
        secondary: {
            main: '#4F6273', // primary-gray
        },
        background: {
            default: '#00030D', // primary-dark
            paper: '#0C1526', // primary-medium
        },
        text: {
            primary: '#B8CAD9', // primary-pale
            secondary: '#58748C', // primary-light
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
