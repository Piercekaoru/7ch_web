import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// 使用须知页：分章节讲解 BBS 规则与操作。
// Help page: sectioned guide for BBS rules and usage.

interface HelpProps {
  onBack: () => void;
}

// 通用章节组件：统一标题与间距。
// Shared section component for consistent spacing and headings.
const Section: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
  <section id={id} className="mb-10 scroll-mt-20">
    <h3 className="mb-4 border-b border-gray-200 pb-2 text-xl font-bold text-gray-800 dark:border-gray-700 dark:text-gray-100 md:text-2xl">
      {title}
    </h3>
    <div className="space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300 md:text-base">
      {children}
    </div>
  </section>
);

// 小键帽样式：用于展示输入示例（如 Name#password）。
// Keycap-like tag for inline input examples.
const KeyTag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="mx-1 inline-block rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
    {children}
  </span>
);

export const Help: React.FC<HelpProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('basics');

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navItems = [
    { id: 'basics', label: t('help.toc.basics') },
    { id: 'tripcodes', label: t('help.toc.tripcodes') },
    { id: 'sage', label: t('help.toc.sage') },
    { id: 'anchors', label: t('help.toc.anchors') },
    { id: 'ids', label: t('help.toc.ids') },
    { id: 'subscription', label: t('help.toc.subscription') },
  ];

  return (
    <div className="min-h-screen bg-[#f0f0f0] pb-10 dark:bg-background">
      {/* Header Banner */}
      <div className="bg-[#5d4037] text-white py-10 px-4 mb-6 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('help.banner.title')}</h1>
          <p className="opacity-90">{t('help.banner.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav (Desktop) */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-20 rounded border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-4 px-2 font-bold text-gray-900 dark:text-gray-100">{t('help.toc.title')}</div>
            <nav className="space-y-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    activeSection === item.id 
                      ? 'border-l-4 border-[#2da0b3] bg-gray-100 font-bold text-black dark:bg-gray-800 dark:text-gray-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="mt-6 border-t border-gray-100 pt-4 dark:border-gray-800">
              <button onClick={onBack} className="flex items-center gap-1 px-2 text-sm text-[#0056b3] hover:underline dark:text-sky-300">
                &larr; {t('nav.home')}
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Nav / Back */}
        <div className="md:hidden mb-4">
          <button onClick={onBack} className="font-bold text-[#0056b3] hover:underline dark:text-sky-300">
            &larr; {t('nav.home')}
          </button>
        </div>

        {/* Main Content */}
        <main className="min-h-[500px] flex-1 rounded border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900 md:p-10">
          
          <Section id="basics" title={t('help.section.basics')}>
            <p>
              {t('help.basics.intro')}
            </p>
            <ul className="list-disc list-inside pl-2 space-y-2 mt-2">
              <li><strong>{t('help.basics.posting')}</strong></li>
              <li><strong>{t('help.basics.anonymity')}</strong></li>
            </ul>
          </Section>

          <Section id="tripcodes" title={t('help.section.tripcodes')}>
            <p>
              {t('help.tripcodes.intro')}
            </p>
            <div className="mt-2 rounded border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
              <h4 className="mb-2 text-sm font-bold text-gray-700 dark:text-gray-200">{t('help.tripcodes.how')}</h4>
              <p className="text-sm">
                {t('help.tripcodes.how-desc')} <KeyTag>Name#password</KeyTag>
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {t('help.tripcodes.example-desc')}
              </p>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t('help.tripcodes.note')}
            </p>
          </Section>

          <Section id="sage" title={t('help.section.sage')}>
            <p>
              {t('help.sage.intro')}
            </p>
            <p>
              {t('help.sage.how')} <KeyTag>sage</KeyTag>
            </p>
            <ul className="list-disc list-inside pl-2 space-y-1 mt-2 text-sm">
              <li><strong>{t('help.sage.normal')}</strong></li>
              <li><strong>{t('help.sage.sage-post')}</strong></li>
            </ul>
          </Section>

          <Section id="anchors" title={t('help.section.anchors')}>
            <p>
              {t('help.anchors.intro')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/70">
                <span className="mb-1 block text-xs font-bold text-gray-500 dark:text-gray-400">{t('help.anchors.input')}</span>
                <code className="text-sm">I agree with &gt;&gt;1 completely.</code>
              </div>
              <div className="rounded border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <span className="mb-1 block text-xs font-bold text-gray-500 dark:text-gray-400">{t('help.anchors.result')}</span>
                <span className="text-sm text-gray-700 dark:text-gray-200">I agree with <span className="cursor-pointer text-[#0056b3] hover:underline dark:text-sky-300">&gt;&gt;1</span> completely.</span>
              </div>
            </div>
            <p className="mt-2">
              {t('help.anchors.hover')}
            </p>
          </Section>

          <Section id="ids" title={t('help.section.ids')}>
            <p>
              {t('help.ids.intro')}
            </p>
            <div className="flex items-center gap-2 mt-2">
               <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{t('help.ids.example')}</span>
               <span className="rounded bg-gray-100 px-2 py-1 font-mono dark:bg-gray-800 dark:text-gray-100">ID:A1b2C3d4</span>
            </div>
            <ul className="list-disc list-inside pl-2 space-y-2 mt-3 text-sm">
              <li><strong>{t('help.ids.scope')}</strong></li>
              <li><strong>{t('help.ids.reset')}</strong></li>
              <li><strong>{t('help.ids.privacy')}</strong></li>
            </ul>
          </Section>

          <Section id="subscription" title={t('help.section.subscription')}>
            <p>
              {t('help.subscription.intro')}
            </p>
            <ul className="list-disc list-inside pl-2 space-y-2 mt-2 text-sm">
              <li>
                <strong>{t('help.subscription.route')}</strong>
              </li>
              <li>
                <strong>{t('help.subscription.support')}</strong>
              </li>
              <li>
                <strong>{t('help.subscription.security')}</strong>
              </li>
              <li>
                <strong>{t('help.subscription.status')}</strong>
              </li>
            </ul>
          </Section>

        </main>
      </div>
    </div>
  );
};
