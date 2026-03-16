import React from 'react';
import { ArrowLeft, Download, ExternalLink, Link2, Lock, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { commonLinks } from '../data/commonLinks';

interface CommonLinksProps {
  onBack: () => void;
}

const featureIconMap = {
  link: Link2,
  shield: Shield,
  download: Download,
} as const;

export const CommonLinks: React.FC<CommonLinksProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const cobalt = commonLinks.find((item) => item.id === 'cobalt');

  if (!cobalt) return null;

  const featureCards: Array<{
    icon: keyof typeof featureIconMap;
    title: string;
    body: string;
  }> = [
    {
      icon: 'link',
      title: t('commonLinks.cobalt.featurePasteTitle'),
      body: t('commonLinks.cobalt.featurePasteBody'),
    },
    {
      icon: 'shield',
      title: t('commonLinks.cobalt.featureCleanTitle'),
      body: t('commonLinks.cobalt.featureCleanBody'),
    },
    {
      icon: 'download',
      title: t('commonLinks.cobalt.featurePrivacyTitle'),
      body: t('commonLinks.cobalt.featurePrivacyBody'),
    },
  ];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#f0f0f0] pb-10 dark:bg-background">
      <div className="mx-auto max-w-5xl px-2 py-6 sm:px-4">
        <div className="mb-2 flex flex-wrap items-center gap-3 text-xl font-bold text-gray-700 dark:text-gray-100">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-sm font-normal text-[#0056b3] hover:underline dark:text-sky-300"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('commonLinks.back')}
          </button>
          <span className="text-gray-400 dark:text-gray-600">/</span>
          <span>{t('commonLinks.title')}</span>
          <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-700 dark:border-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
            {t('commonLinks.staticBadge')}
          </span>
        </div>
        <p className="mb-6 px-1 text-sm text-gray-600 dark:text-gray-400">{t('commonLinks.subtitle')}</p>

        <section className="mb-6 rounded-sm border border-sky-200 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-950/40">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-sky-900 dark:text-sky-100">
            <Lock className="h-4 w-4" />
            {t('commonLinks.readOnlyTitle')}
          </div>
          <p className="text-sm leading-relaxed text-sky-800 dark:text-sky-200">
            {t('commonLinks.readOnlyBody')}
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                    {t('commonLinks.featured')}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {t('commonLinks.external')}
                  </span>
                </div>
                <h1 className="mb-2 text-2xl font-bold text-gray-800 dark:text-gray-100">{cobalt.title}</h1>
                <p className="max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {t('commonLinks.cobalt.description')}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href={cobalt.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-sm bg-[#2da0b3] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#238a9b]"
                >
                  {t('commonLinks.openSite')}
                  <ExternalLink className="h-4 w-4" />
                </a>
                {cobalt.repoHref && (
                  <a
                    href={cobalt.repoHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                  >
                    {t('commonLinks.viewSource')}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {featureCards.map((feature) => {
                const Icon = featureIconMap[feature.icon];
                return (
                  <div
                    key={feature.title}
                    className="rounded-sm border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70"
                  >
                    <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100">
                      <Icon className="h-4 w-4 text-[#2da0b3] dark:text-cyan-300" />
                      {feature.title}
                    </div>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{feature.body}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-sm border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/40">
              <div className="mb-1 text-sm font-bold text-amber-900 dark:text-amber-100">
                {t('commonLinks.cobalt.bestForTitle')}
              </div>
              <p className="text-sm leading-relaxed text-amber-800 dark:text-amber-200">
                {t('commonLinks.cobalt.bestForBody')}
              </p>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-sm border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-2 text-sm font-bold text-gray-800 dark:text-gray-100">
                {t('commonLinks.aboutTitle')}
              </div>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {t('commonLinks.aboutBody')}
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-2 text-sm font-bold text-gray-800 dark:text-gray-100">
                {t('commonLinks.disclaimerTitle')}
              </div>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {t('commonLinks.disclaimerBody')}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CommonLinks;
