import React from 'react';
import { Brush, Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Theme, ThemeVariant, useTheme } from './theme-provider';
import { useTranslation } from 'react-i18next';

const modeOptions: Array<{
  value: Theme;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
}> = [
  { value: 'light', icon: Sun, labelKey: 'theme.light' },
  { value: 'dark', icon: Moon, labelKey: 'theme.dark' },
  { value: 'system', icon: Monitor, labelKey: 'theme.system' },
];

const variantOptions: Array<{
  value: ThemeVariant;
  labelKey: string;
}> = [
  { value: 'classic', labelKey: 'theme.variant.classic' },
  { value: 'claude', labelKey: 'theme.variant.claude' },
  { value: 'scheme1', labelKey: 'theme.variant.scheme1' },
];

interface ThemeSwitcherProps {
  compact?: boolean;
  fullWidth?: boolean;
  onSelect?: () => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ compact = false, fullWidth = false, onSelect }) => {
  const { t } = useTranslation();
  const { theme, themeVariant, setTheme, setThemeVariant } = useTheme();

  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card/90 p-1.5 shadow-[var(--card-shadow-subtle)] backdrop-blur transition-all',
        fullWidth ? 'flex w-full' : 'inline-flex',
        compact && !fullWidth ? 'items-center gap-2' : 'flex-col items-stretch gap-2'
      )}
      aria-label={t('theme.title')}
    >
      <div className={cn('flex items-center gap-2', compact && !fullWidth ? 'shrink-0' : 'justify-between')}>
        {!compact && (
          <span className="inline-flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <Brush className="h-3.5 w-3.5" />
            {t('theme.variant.title')}
          </span>
        )}
        <div
          className={cn(
            'flex items-center rounded-xl bg-secondary/80 p-1',
            compact ? 'gap-1' : 'gap-1.5',
            fullWidth && 'w-full'
          )}
          role="group"
          aria-label={t('theme.variant.title')}
        >
          {variantOptions.map(({ value, labelKey }) => {
            const active = themeVariant === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setThemeVariant(value);
                  onSelect?.();
                }}
                aria-pressed={active}
                className={cn(
                  'inline-flex items-center justify-center rounded-[0.85rem] px-3 py-1.5 text-xs font-medium transition-all',
                  compact && 'px-2.5',
                  fullWidth && 'flex-1',
                  active
                    ? 'bg-background text-foreground shadow-[var(--card-shadow-subtle)]'
                    : 'text-muted-foreground hover:bg-background/70 hover:text-foreground'
                )}
              >
                {t(labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      <div className={cn('flex items-center gap-2', compact && !fullWidth ? 'shrink-0' : 'justify-between')}>
        {!compact && (
          <span className="px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {t('theme.mode.title')}
          </span>
        )}
        <div
          className={cn(
            'flex items-center rounded-xl bg-secondary/80 p-1',
            compact ? 'gap-1' : 'gap-1.5',
            fullWidth && 'w-full'
          )}
          role="group"
          aria-label={t('theme.mode.title')}
        >
          {modeOptions.map(({ value, icon: Icon, labelKey }) => {
            const active = theme === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setTheme(value);
                  onSelect?.();
                }}
                aria-pressed={active}
                title={t(labelKey)}
                className={cn(
                  'inline-flex h-8 items-center justify-center rounded-[0.85rem] transition-all',
                  compact && !fullWidth ? 'w-8' : '',
                  !compact ? 'gap-1.5 px-3 text-xs font-medium' : '',
                  fullWidth ? 'flex-1' : '',
                  active
                    ? 'bg-background text-foreground shadow-[var(--card-shadow-subtle)]'
                    : 'text-muted-foreground hover:bg-background/70 hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {!compact && <span>{t(labelKey)}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
