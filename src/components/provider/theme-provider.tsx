'use client';

import React, {createContext, ReactNode, useContext, useState} from 'react';


type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    isDark: () => boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);


export const useTheme = () => {
    const content = useContext(ThemeContext);
    if (content === undefined) {
        throw new Error('useTheme 必须在 ThemeProvider 使用');
    }
    return content;
}



/**
 * 主题 Provider
 *
 * @param children
 * @constructor
 */
export const ThemeProvider = (
    {children}: {children: ReactNode}
) => {

    const [theme, setTheme] = useState<Theme>('light')
    const isDark = () =>  theme === 'dark'
    const toggleTheme = () => setTheme((prev) => prev === 'light' ? 'dark' : 'light')

    return (
        <ThemeContext.Provider value={{theme, isDark, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;