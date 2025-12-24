import React, { useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeContext } from './ThemeContextCore';

const DEFAULT_THEME = {
    bgColor: '#e3f2fd', // Light Blue default
    cardColor: '#ffffff',
    primaryColor: '#2196f3',
    borderRadius: 24,
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
};

export default function ThemeProvider({ children }) {
    const [themeConfig, setThemeConfig] = useState(() => {
        const saved = localStorage.getItem('app_theme');
        return saved ? JSON.parse(saved) : DEFAULT_THEME;
    });

    useEffect(() => {
        localStorage.setItem('app_theme', JSON.stringify(themeConfig));
    }, [themeConfig]);

    const updateTheme = (updates) => {
        setThemeConfig(prev => ({ ...prev, ...updates }));
    };

    const resetTheme = () => setThemeConfig(DEFAULT_THEME);

    // Create MUI theme based on config
    const muiTheme = createTheme({
        typography: {
            fontFamily: themeConfig.fontFamily,
            h1: { fontWeight: 700 },
            h2: { fontWeight: 700 },
            h3: { fontWeight: 700 },
            h4: { fontWeight: 600 },
            h5: { fontWeight: 600 },
            h6: { fontWeight: 600 },
            button: { textTransform: 'none', fontWeight: 600, borderRadius: themeConfig.borderRadius / 2 },
        },
        shape: {
            borderRadius: themeConfig.borderRadius,
        },
        palette: {
            primary: { main: themeConfig.primaryColor },
            background: {
                default: themeConfig.bgColor,
                paper: themeConfig.cardColor,
            },
        },
        components: {
            MuiPaper: {
                styleOverrides: {
                    root: {
                        borderRadius: themeConfig.borderRadius,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: themeConfig.borderRadius / 2,
                    },
                },
            },
        },
    });

    return (
        <ThemeContext.Provider value={{ themeConfig, updateTheme, resetTheme }}>
            <MuiThemeProvider theme={muiTheme}>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};
