import React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Theme, useTheme } from './theme-provider';
import { useTranslation } from 'react-i18next';

const options: Array<{
  value: Theme;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
}> = [
  { value: 'light', icon: Sun, labelKey: 'theme.light' },
  { value: 'dark', icon: Moon, labelKey: 'theme.dark' },
  { value: 'system', icon: Monitor, labelKey: 'theme.system' },
];

interface ThemeSwitcherProps {
  compact?: boolean;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ compact = false }) => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border border-gray-200 bg-gray-100 p-1 shadow-sm dark:border-gray-700 dark:bg-gray-900/70',
        compact ? 'gap-1' : 'gap-1.5'
      )}
      role="group"
      aria-label={t('theme.title')}
    >
      {options.map(({ value, icon: Icon, labelKey }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={active}
            title={t(labelKey)}
            className={cn(
              'inline-flex items-center justify-center rounded-md transition-colors',
              compact ? 'h-8 w-8' : 'h-8 gap-1.5 px-3 text-xs font-medium',
              active
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-gray-100'
                : 'text-gray-500 hover:bg-white/70 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800/70 dark:hover:text-gray-100'
            )}
          >
            <Icon className="h-4 w-4" />
            {!compact && <span>{t(labelKey)}</span>}
          </button>
        );
      })}
    </div>
  );
};
