
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Inicialização com valores padrão para evitar undefined
const defaultThemeContext: ThemeContextType = {
  theme: 'dark',
  toggleTheme: () => console.log('ThemeProvider não foi inicializado')
};

// Criação do contexto com valores padrão
const ThemeContext = createContext<ThemeContextType>(defaultThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  // Adicionar logging para debug
  console.log('ThemeProvider inicializado com tema:', theme);

  useEffect(() => {
    try {
      // Set initial theme from localStorage or default to dark
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
        setTheme(savedTheme);
        document.documentElement.className = savedTheme;
        console.log('Tema carregado do localStorage:', savedTheme);
      } else {
        console.log('Usando tema padrão:', theme);
        document.documentElement.className = theme;
      }
    } catch (error) {
      console.error('Erro ao acessar localStorage:', error);
      // Garantir que o tema padrão seja aplicado mesmo com erro
      document.documentElement.className = theme;
    }
  }, []);

  const toggleTheme = () => {
    try {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      console.log('Alternando tema de', theme, 'para', newTheme);
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
      document.documentElement.className = newTheme;
    } catch (error) {
      console.error('Erro ao alternar tema:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  // Não precisamos mais verificar se é undefined pois inicializamos com valores padrão
  return context;
}
