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
  <section id={id} className="themed-static-section mb-10">
    <h3 className="themed-static-section-title mb-4 pb-3 text-xl font-bold md:text-2xl">
      {title}
    </h3>
    <div className="space-y-4 text-sm leading-relaxed text-foreground md:text-base">
      {children}
    </div>
  </section>
);

// 小键帽样式：用于展示输入示例（如 Name#password）。
// Keycap-like tag for inline input examples.
const KeyTag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="themed-code-inline mx-1 inline-block px-1.5 py-0.5 text-xs font-mono">
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
  ];

  return (
    <div className="themed-page min-h-screen pb-10">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <section className="themed-static-hero mb-6 p-6 md:p-8">
          <div className="themed-kicker mb-3">{t('footer.help')}</div>
          <button onClick={onBack} className="themed-inline-action mb-3 text-sm">
            &larr; {t('nav.home')}
          </button>
          <h1 className="themed-heading mb-3 text-3xl md:text-4xl">{t('help.banner.title')}</h1>
          <p className="max-w-3xl text-sm leading-7 themed-meta md:text-base">{t('help.banner.subtitle')}</p>
        </section>

        <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar Nav (Desktop) */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="themed-static-sidebar sticky top-20 p-4">
            <div className="themed-kicker mb-4 px-2">{t('help.toc.title')}</div>
            <nav className="space-y-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`themed-static-nav w-full px-3 py-2 text-left text-sm ${
                    activeSection === item.id 
                      ? 'themed-static-nav-active'
                      : ''
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="mt-6 border-t border-border pt-4">
              <button onClick={onBack} className="themed-inline-action flex items-center gap-1 px-2 text-sm">
                &larr; {t('nav.home')}
              </button>
            </div>
          </div>
        </aside>



        {/* Main Content */}
        <main className="themed-static-main min-h-[500px] flex-1 p-6 md:p-10">
          
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
            <div className="themed-metric-card mt-2 p-4">
              <h4 className="themed-heading-sm mb-2 text-sm">{t('help.tripcodes.how')}</h4>
              <p className="text-sm">
                {t('help.tripcodes.how-desc')} <KeyTag>Name#password</KeyTag>
              </p>
              <p className="themed-meta mt-2 text-sm">
                {t('help.tripcodes.example-desc')}
              </p>
            </div>
            <p className="themed-meta mt-2 text-sm">
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
              <div className="themed-metric-card p-3">
                <span className="themed-kicker mb-1 block text-xs">{t('help.anchors.input')}</span>
                <code className="text-sm">I agree with &gt;&gt;1 completely.</code>
              </div>
              <div className="themed-list-card p-3">
                <span className="themed-kicker mb-1 block text-xs">{t('help.anchors.result')}</span>
                <span className="text-sm text-foreground">I agree with <span className="cursor-pointer themed-inline-action">&gt;&gt;1</span> completely.</span>
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
               <span className="text-sm font-bold themed-meta">{t('help.ids.example')}</span>
               <span className="themed-code-inline px-2 py-1 font-mono">ID:A1b2C3d4</span>
            </div>
            <ul className="list-disc list-inside pl-2 space-y-2 mt-3 text-sm">
              <li><strong>{t('help.ids.scope')}</strong></li>
              <li><strong>{t('help.ids.reset')}</strong></li>
              <li><strong>{t('help.ids.privacy')}</strong></li>
            </ul>
          </Section>

        </main>
      </div>
      </div>
    </div>
  );
};
