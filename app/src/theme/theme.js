import { createTheme } from '@mui/material/styles';

// Design System Colors
const colors = {
    purplePrimary: '#8B5CF6',
    purpleLight: '#EDE9FE',
    greenPrimary: '#059669',
    greenLight: '#D1FAE5',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    backgroundDefault: '#F4F5F7',
    backgroundPaper: '#FFFFFF',
    borderLight: '#E5E7EB',
    sidebarBg: '#F9FAFB',
};

const theme = createTheme({
    palette: {
        primary: {
            main: colors.purplePrimary,
            light: colors.purpleLight,
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: colors.greenPrimary,
            light: colors.greenLight,
            contrastText: '#FFFFFF',
        },
        background: {
            default: colors.backgroundDefault,
            paper: colors.backgroundPaper,
        },
        text: {
            primary: colors.textPrimary,
            secondary: colors.textSecondary,
        },
    },
    typography: {
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        h1: { fontSize: '2rem', fontWeight: 700, color: colors.textPrimary },
        h2: { fontSize: '1.5rem', fontWeight: 600, color: colors.textPrimary },
        h6: { fontSize: '1.1rem', fontWeight: 600 },
    },
    shape: { borderRadius: 6 },
    components: {
        MuiButton: {
            styleOverrides: {
                root: { borderRadius: 6, textTransform: 'none', minHeight: 44 },
            },
        },
        MuiIconButton: {
            styleOverrides: { root: { minWidth: 44, minHeight: 44 } },
        },
        MuiCard: {
            styleOverrides: {
                root: { borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.05)' },
            },
        },
        MuiPaper: {
            styleOverrides: { root: { borderRadius: 8 } },
        },
    },
});

export default theme;
export { colors };
