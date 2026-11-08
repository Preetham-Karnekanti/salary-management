
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1E3A5F',
            dark: '#152C48',
            light: '#3B5D82',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#64748B',
        },
        background: {
            default: '#F5F7FA',
            paper: '#FFFFFF',
        },
        success: {
            main: '#16A34A',
        },
        warning: {
            main: '#D97706',
        },
        error: {
            main: '#DC2626',
        },
        text: {
            primary: '#1E293B',
            secondary: '#64748B',
        },
        divider: '#E2E8F0',
    },

    typography: {
        fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
        h4: {
            fontWeight: 700,
            fontSize: '1.75rem',
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },

    shape: {
        borderRadius: 10,
    },

    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 2px 8px rgba(15, 23, 42, 0.05)',
                    border: '1px solid #E2E8F0',
                },
            },
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 600,
                    color: '#475569',
                    backgroundColor: '#F8FAFC',
                },
            },
        },
    },
});

export default theme;
