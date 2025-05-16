import { createTheme, ThemeProvider } from '@mui/material/styles';

const dataGridTheme = createTheme({
    components: {
        MuiDataGrid: {
            styleOverrides: {
                root: {

                    border: '1px solid var(--fg)',
                    '--DataGrid-rowBorderColor': 'var(--fg)',
                    '--DataGrid-t-color-background-base': 'var(--fg)'
                },
                row: {
                    backgroundColor: 'var(--surface)',
                    '&:hover': {
                        backgroundColor: 'var(--fg)',
                    },
                    '&.Mui-selected': {
                        backgroundColor: 'var(--fg)',
                        '&:hover': {
                            backgroundColor: 'var(--txt-secondary)',
                        },
                    },
                    '& .MuiDataGrid-cell': {
                        borderBottom: '1px solid var(--fg) !important',
                    },
                },
                cell: {
                    color: 'var(--txt-active)',
                    borderBottom: '1px solid var(--fg) !important',
                },
                columnHeader: {
                    backgroundColor: 'var(--surface)',
                    color: 'var(--primary)',
                    borderBottom: '1px solid var(--fg)',
                    '& .MuiDataGrid-columnSeparator': {
                        color: 'var(--fg) !important',
                        borderColor: 'var(--fg) !important',
                    },
                    '--DataGrid-t-color-background-base': "var(--fg)"
                },
                columnHeaders:{
                    backgroundColor: 'var(--surface)',
                },
                footerContainer: {
                    backgroundColor: 'var(--surface)',
                    '& .MuiTablePagination-root': {
                        color: 'var(--txt-active)', // Цвет текста пагинации
                    },
                    '& .MuiTablePagination-selectIcon': {
                        color: 'var(--txt-active) !important', // Цвет стрелочки пагинации
                    },
                    '& .MuiTablePagination-menuItem': {
                        backgroundColor: 'var(--surface)', // Фон выпадающего меню
                        color: 'var(--txt-active)', // Цвет текста в выпадающем меню
                        '&:hover': {
                            backgroundColor: 'var(--fg)', // Цвет фона при наведении
                        },
                    },
                    '--DataGrid-t-color-border-base': 'var(--fg)'
                },
                iconButtonContainer: {
                    '& .MuiSvgIcon-root': {
                        color: 'var(--txt-active)',
                        fill: 'var(--txt-active)',
                    },
                },

            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: 'var(--surface)', // Фон выпадающего меню
                    color: 'var(--txt-active)', // Цвет текста в меню
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    backgroundColor: 'var(--surface)', // Фон пунктов меню
                    color: 'var(--txt-active)', // Цвет текста пунктов меню
                    '&:hover': {
                        backgroundColor: 'var(--fg)', // Цвет фона при наведении
                    },
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: 'var(--fg)', // Цвет разделителей
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    color: 'var(--txt-active)', // Цвет иконок в пунктах меню
                },
            },
        },
    },
});

export default dataGridTheme;