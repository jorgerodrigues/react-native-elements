import React, { useCallback, useContext } from 'react';
import deepmerge from 'deepmerge';
import { lightColors, darkColors } from './colors';
import { defaultSpacing, } from './theme';
export const ThemeContext = React.createContext({});
export const createTheme = (theme = {}) => {
    return {
        ...theme,
        ...deepmerge({ lightColors, darkColors, spacing: defaultSpacing }, {
            lightColors: theme.lightColors || {},
            darkColors: theme.darkColors || {},
            mode: theme.mode || 'light',
            spacing: theme.spacing || {},
        }),
    };
};
const separateColors = (theme, themeMode) => {
    const { darkColors: themeDarkColors = {}, lightColors: themeLightColors = {}, spacing = {}, mode = themeMode, ...restTheme } = theme;
    const themeColors = mode === 'dark' ? themeDarkColors : themeLightColors;
    return {
        colors: themeColors,
        mode,
        spacing: spacing,
        ...restTheme,
    };
};
export const ThemeProvider = ({ theme = createTheme({}), children }) => {
    const [themeState, setThemeState] = React.useState(theme);
    const updateTheme = React.useCallback((updatedTheme) => {
        setThemeState((oldTheme) => {
            const newTheme = typeof updatedTheme === 'function'
                ? updatedTheme(oldTheme)
                : updatedTheme;
            return deepmerge({ ...oldTheme }, newTheme);
        });
    }, []);
    const replaceTheme = React.useCallback((replacedTheme) => {
        setThemeState((oldTheme) => {
            const newTheme = typeof replacedTheme === 'function'
                ? replacedTheme(oldTheme)
                : replacedTheme;
            return deepmerge(createTheme({}), newTheme);
        });
    }, []);
    const ThemeContextValue = React.useMemo(() => ({
        theme: separateColors(themeState, themeState.mode),
        updateTheme,
        replaceTheme,
    }), [themeState, updateTheme, replaceTheme]);
    return (<ThemeContext.Provider value={ThemeContextValue}>
      {children}
    </ThemeContext.Provider>);
};
export const ThemeConsumer = ThemeContext.Consumer;
export const useTheme = () => {
    return useContext(ThemeContext);
};
export const useThemeMode = () => {
    const { updateTheme, theme: { mode }, } = useTheme();
    const setMode = useCallback((colorMode) => {
        updateTheme({ mode: colorMode });
    }, [updateTheme]);
    return { mode, setMode };
};
