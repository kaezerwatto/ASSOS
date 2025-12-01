// components/ThemeToggle.tsx
import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Moon, Sun, Monitor, Check } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const themes = [
    { id: 'light', label: 'Clair', icon: Sun },
    { id: 'dark', label: 'Sombre', icon: Moon },
    { id: 'system', label: 'Système', icon: Monitor },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Déterminer l'icône à afficher sur le bouton principal
  const getThemeIcon = () => {
    if (theme === 'dark') {
      return <Moon className="size-5 text-white" />;
    } else if (theme === 'light') {
      return <Sun className="size-5 text-white" />;
    } else {
      return <Monitor className="size-5 text-white" />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40" ref={dropdownRef}>
      {/* Bouton principal */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 w-12 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg transition-all duration-300"
        size="icon"
      >
        {getThemeIcon()}
      </Button>

      {/* Fenêtre flottante */}
      {isOpen && (
        <div className="absolute bottom-6 right-6 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 p-2 animate-in fade-in-0 zoom-in-95">
          <div className="space-y-1">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              const isSelected = theme === themeOption.id;
              
              return (
                <button
                  key={themeOption.id}
                  onClick={() => {
                    setTheme(themeOption.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-4" />
                    <span>{themeOption.label}</span>
                  </div>
                  {isSelected && <Check className="size-4" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}