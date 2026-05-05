'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // 1. Efecto para inicializar el tema
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Si hay algo guardado o el sistema prefiere oscuro
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  // 2. Función para alternar
  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button 
      onClick={toggleTheme}
      className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left text-muted-foreground hover:bg-muted hover:text-foreground transition-all group"
    >
      <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center shadow-sm group-hover:border-primary/30 transition-all">
        {/* Cambiado: Usamos colores adaptables en lugar de fijos para los iconos */}
        <i className={`bi ${isDark ? 'bi-moon-stars-fill text-primary' : 'bi-sun-fill text-secondary'} text-lg`}></i>
      </div>
      <span className="font-bold text-sm">
        {isDark ? 'Modo Oscuro' : 'Modo Claro'}
      </span>
    </button>
  );
}
