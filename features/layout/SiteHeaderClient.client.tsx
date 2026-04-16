'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ThemeSwitcher } from '../../components/ThemeSwitcher';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog';
import { Button } from '../../components/ui/button';
import { siteName } from '../../lib/constants';
import { supportedLocales, type Locale } from '../../lib/i18n/dictionaries';
import { buildLocalizedStaticPath, isLocalizedStaticPath, stripLocalePrefix } from '../../lib/i18n/routing';

interface SiteHeaderClientProps {
  initialLocale: Locale;
  labels: Record<string, string>;
}

const localeOptions = supportedLocales;

const isLocaleOption = (value: string): value is Locale =>
  (localeOptions as readonly string[]).includes(value);

const getSearchTarget = (pathname: string) => {
  const threadMatch = pathname.match(/^\/board\/([^/]+)\/thread\//);
  if (threadMatch) return `/board/${threadMatch[1]}`;

  const boardMatch = pathname.match(/^\/board\/([^/]+)(?:\/page\/\d+)?\/?$/);
  if (boardMatch) return `/board/${boardMatch[1]}`;

  return '/board/all';
};

export function SiteHeaderClient({ initialLocale, labels }: SiteHeaderClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { i18n, t } = useTranslation();
  const [hasHydrated, setHasHydrated] = useState(false);
  const [activeLocale, setActiveLocale] = useState<Locale>(initialLocale);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const searchTarget = useMemo(() => getSearchTarget(pathname), [pathname]);
  const staticPagePath = useMemo(() => stripLocalePrefix(pathname), [pathname]);
  const isLocaleStaticPage = useMemo(() => isLocalizedStaticPath(pathname), [pathname]);
  const displayLocale = hasHydrated && isLocaleOption(i18n.language) ? i18n.language : activeLocale;
  const docsHref = useMemo(() => buildLocalizedStaticPath('/docs', displayLocale), [displayLocale]);
  const text = (key: string) => (hasHydrated ? t(key) : labels[key] ?? key);

  useEffect(() => {
    setHasHydrated(true);
    if (isLocaleOption(i18n.language)) setActiveLocale(i18n.language);
  }, [i18n.language]);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    if (isLocaleOption(i18n.language)) {
      setActiveLocale(i18n.language);
      document.cookie = `7ch_lang=${encodeURIComponent(i18n.language)}; Path=/; Max-Age=31536000; SameSite=Lax`;
    }
  }, [i18n.language]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const tagName = target instanceof HTMLElement ? target.tagName : '';
      if ((event.key === 'k' && (event.metaKey || event.ctrlKey)) || (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(tagName))) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (mobileMenuRef.current?.contains(target)) return;
      setIsMobileMenuOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isMobileMenuOpen]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    const params = new URLSearchParams();
    if (trimmed) params.set('q', trimmed);
    router.push(params.size > 0 ? `${searchTarget}?${params.toString()}` : searchTarget);
    setIsMobileMenuOpen(false);
  };

  const changeLang = (locale: Locale) => {
    setActiveLocale(locale);
    void i18n.changeLanguage(locale);
    window.localStorage.setItem('7ch_lang', locale);
    document.cookie = `7ch_lang=${encodeURIComponent(locale)}; Path=/; Max-Age=31536000; SameSite=Lax`;

    if (isLocaleStaticPage) {
      router.push(buildLocalizedStaticPath(staticPagePath, locale));
      return;
    }

    router.refresh();
  };

  const renderSearchForm = () => (
    <form className="relative flex items-center" onSubmit={submitSearch}>
      <input
        ref={searchInputRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={text('nav.searchPlaceholder')}
        className="themed-search-field w-full rounded-md px-3 py-1.5 pr-16 text-sm transition-colors focus:border-[hsl(var(--ring))] focus:outline-none md:w-56"
      />
      <div className="pointer-events-none absolute right-2 flex items-center gap-1">
        <kbd className="themed-search-kbd hidden h-5 select-none items-center gap-1 rounded-md px-1.5 font-mono text-[10px] font-medium sm:inline-flex">
          <span className="text-xs">⌘</span>K
        </kbd>
        <Search className="h-4 w-4 text-[hsl(var(--soft-foreground))]" />
      </div>
    </form>
  );

  return (
    <header className="themed-header-shell sticky top-0 z-20">
      <div className="mx-auto flex min-h-14 max-w-7xl items-center justify-between gap-3 px-4 py-2">
        <Link href="/" className="flex items-center">
          <span className="themed-brandmark text-xl sm:text-2xl">{siteName}</span>
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          {renderSearchForm()}
          <nav className="flex items-center gap-3 text-sm font-medium">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">{text('dialog.login.button')}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{text('dialog.login.title')}</AlertDialogTitle>
                  <AlertDialogDescription>{text('dialog.login.description')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{text('dialog.login.close')}</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Link href={docsHref}>{text('dialog.login.link_text')}</Link>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Link className="themed-nav-link hover:underline" href="/">
              {text('nav.boards')}
            </Link>
            <Link className="themed-nav-link hover:underline" href="/favorites">
              {text('nav.favorites')}
            </Link>
          </nav>
          <div className="flex items-center gap-2 border-l border-border pl-3">
            <ThemeSwitcher compact labels={labels} />
            {localeOptions.map((locale) => (
              <button
                key={locale}
                type="button"
                onClick={() => changeLang(locale)}
                className={displayLocale === locale ? 'text-xs font-bold text-foreground' : 'themed-meta text-xs'}
              >
                {locale === 'zh-CN' ? text('lang.zh') : text('lang.ja')}
              </button>
            ))}
          </div>
        </div>

        <div className="relative md:hidden" ref={mobileMenuRef}>
          <button
            type="button"
            className="themed-nav-link rounded-md p-2 text-sm font-bold"
            onClick={() => setIsMobileMenuOpen((value) => !value)}
          >
            {text('nav.menu')}
          </button>
          {isMobileMenuOpen && (
            <div className="themed-card themed-card-featured absolute right-0 z-50 mt-2 w-72 overflow-hidden p-3">
              <div className="mb-3">{renderSearchForm()}</div>
              <nav className="space-y-1 border-t border-border pt-2 text-sm">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="block w-full rounded-md px-3 py-2 text-left hover:bg-secondary"
                      type="button"
                    >
                      {text('dialog.login.button')}
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{text('dialog.login.title')}</AlertDialogTitle>
                      <AlertDialogDescription>{text('dialog.login.description')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{text('dialog.login.close')}</AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Link href={docsHref}>{text('dialog.login.link_text')}</Link>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Link className="block rounded-md px-3 py-2 hover:bg-secondary" href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  {text('nav.boards')}
                </Link>
                <Link className="block rounded-md px-3 py-2 hover:bg-secondary" href="/favorites" onClick={() => setIsMobileMenuOpen(false)}>
                  {text('nav.favorites')}
                </Link>
              </nav>
              <div className="mt-3 border-t border-border pt-3">
                <div className="themed-kicker mb-2">{text('theme.title')}</div>
                <ThemeSwitcher compact fullWidth labels={labels} onSelect={() => setIsMobileMenuOpen(false)} />
              </div>
              <div className="mt-3 border-t border-border pt-2">
                {localeOptions.map((locale) => (
                  <button
                    key={locale}
                    type="button"
                    onClick={() => {
                      changeLang(locale);
                      setIsMobileMenuOpen(false);
                    }}
                    className={displayLocale === locale ? 'block w-full rounded-md px-3 py-2 text-left text-sm font-bold text-foreground' : 'themed-meta block w-full rounded-md px-3 py-2 text-left text-sm'}
                  >
                    {locale === 'zh-CN' ? text('lang.zh') : text('lang.ja')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
