import { Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import { TabId, ThemeMode } from '../types/workshop';

interface HeaderProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'inventario', label: 'Inventario' },
  { id: 'compras', label: 'Lista de Compras' },
  { id: 'notas', label: 'Notas e Ideas' },
];

export function Header({
  activeTab,
  onSelectTab,
  theme,
  onToggleTheme,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-md transition-colors duration-200 dark:border-[#2A303A] dark:bg-[#121417]/95">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3 sm:gap-8 sm:px-6">
        {/* Zona 1: Marca */}
        <button
          type="button"
          onClick={() => onSelectTab('inventario')}
          className="group flex shrink-0 items-center gap-2.5 text-left whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F59E0B]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F59E0B] text-[#121417] shadow-sm transition-transform duration-150 group-hover:scale-105">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-[22px] w-[22px]"
            >
              {/* Estructura de nave industrial / hangar */}
              <path d="M2 20H22" />
              <path d="M3 20V11L7.5 6.5L12 4.5L16.5 6.5L21 11V20" />
              {/* Viga / tragaluz superior */}
              <path d="M9.5 8.5H14.5" />
              {/* Portón enrollable del hangar */}
              <path d="M7 20V12.5H17V20" />
              <path d="M7 15H17" />
              <path d="M7 17.5H17" />
            </svg>
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-gray-950 sm:text-xl dark:text-white">
            Taller Multiespacio
          </span>
        </button>

        {/* Zona 2: 3 Pestañas claras (Desktop) */}
        <nav
          aria-label="Navegación principal"
          className="hidden items-center gap-1 md:flex"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`relative px-4 py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F59E0B] ${
                  isActive
                    ? 'text-gray-950 dark:text-white'
                    : 'text-gray-600 hover:text-gray-950 dark:text-gray-400 dark:hover:text-gray-100'
                }`}
              >
                {tab.label}
                {isActive && (
                  <motion.span
                    layoutId="activeTabUnderline"
                    transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                    className="absolute inset-x-3 -bottom-[13px] h-[3px] rounded-t-full bg-[#F59E0B]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zona 3: Botón alternar Modo Oscuro / Claro */}
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={
              theme === 'dark'
                ? 'Cambiar a modo claro'
                : 'Cambiar a modo oscuro'
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-3.5 text-xs font-semibold text-gray-900 whitespace-nowrap shrink-0 transition-all duration-150 hover:border-[#F59E0B] hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F59E0B] dark:border-[#2E3440] dark:bg-[#1E2229] dark:text-gray-100 dark:hover:border-[#F59E0B]/70 dark:hover:bg-[#252A33]"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4 text-[#F59E0B]" />
                <span className="hidden sm:inline">Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-[#D97706]" />
                <span className="hidden sm:inline">Modo Oscuro</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navegación móvil compacta de 3 pestañas */}
      <nav
        aria-label="Navegación móvil"
        className="grid grid-cols-3 border-t border-gray-200 md:hidden dark:border-[#2A303A]"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex min-h-[44px] items-center justify-center px-2 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'text-[#B45309] dark:text-[#F59E0B]'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute inset-x-4 bottom-0 h-[2.5px] rounded-t-full bg-[#F59E0B]" />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
