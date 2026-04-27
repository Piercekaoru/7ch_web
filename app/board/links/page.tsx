import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Lock, Shield } from 'lucide-react';

import { commonLinks } from '../../../data/commonLinks';
import { formatLocalizedCalendarDate } from '../../../lib/date';
import { tServer } from '../../../lib/i18n/dictionaries';
import { getServerLocale } from '../../../lib/i18n/server';

type PageProps = {
  searchParams?: Promise<{ q?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    title: tServer('board.links.name', locale),
    description: tServer('commonLinks.description', locale),
    alternates: { canonical: '/board/links' },
  };
}

export default async function CommonLinksPage({ searchParams }: PageProps) {
  const locale = await getServerLocale();
  const t = (key: string) => tServer(key, locale);
  const query = (await searchParams)?.q?.trim().toLowerCase() ?? '';
  const filteredLinks = query
    ? commonLinks.filter((item) => {
      const text = [
        item.id,
        item.title,
        t(item.descriptionKey),
        ...item.tagKeys.map((tagKey) => t(tagKey)),
      ].join(' ').toLowerCase();
      return text.includes(query);
    })
    : commonLinks;

  return (
    <div className="themed-page min-h-[calc(100vh-3.5rem)] pb-10">
      <div className="mx-auto max-w-4xl px-2 py-6 sm:px-4">
        <div className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
          <Link className="themed-inline-action inline-flex items-center gap-1 text-sm font-normal" href="/">
            <ArrowLeft className="h-4 w-4" />
            {t('commonLinks.back')}
          </Link>
          <span className="themed-meta">/</span>
          <span>/links/</span>
          <span className="themed-meta">/</span>
          <span className="themed-heading text-xl">{t('board.links.name')}</span>
        </div>

        <section className="themed-callout-info mb-6 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold">
            <Lock className="h-4 w-4" />
            {t('commonLinks.readOnlyTitle')}
          </div>
          <p className="text-sm leading-relaxed">{t('commonLinks.readOnlyBody')}</p>
        </section>

        <div className="space-y-4">
          {filteredLinks.map((item) => (
            <Link
              key={item.id}
              href={`/board/${item.boardId}/thread/${item.id}`}
              className="themed-list-card block p-5 transition-colors hover:bg-white/70"
            >
              <div className="themed-meta mb-3 flex flex-wrap items-center gap-2 text-xs font-bold">
                <span>{formatLocalizedCalendarDate(new Date(item.updatedAt), locale)}</span>
                <span className="themed-chip-accent px-2 py-0.5 text-[10px] uppercase tracking-wide">
                  {t('commonLinks.staticBadge')}
                </span>
                {item.tagKeys.map((tagKey) => (
                  <span key={tagKey} className="themed-chip px-2 py-0.5 text-[10px] uppercase tracking-wide">
                    {t(tagKey)}
                  </span>
                ))}
              </div>

              <div className="themed-heading-sm mb-2 text-lg text-[hsl(var(--brand))]">{item.title}</div>
              <div className="mb-3 text-sm leading-relaxed text-foreground">{t(item.descriptionKey)}</div>

              <div className="themed-meta flex items-center gap-4 text-xs font-bold">
                <span className="inline-flex items-center gap-1 text-[hsl(var(--brand))]">
                  <ExternalLink className="h-3.5 w-3.5" />
                  {t('commonLinks.openSite')}
                </span>
                {item.repoHref && (
                  <span className="inline-flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5" />
                    {t('commonLinks.viewSource')}
                  </span>
                )}
                <span className="themed-inline-action ml-auto">{t('commonLinks.viewDetail')}</span>
              </div>
            </Link>
          ))}

          {filteredLinks.length === 0 && (
            <div className="themed-list-card p-10 text-center themed-meta">
              {t('commonLinks.empty')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
