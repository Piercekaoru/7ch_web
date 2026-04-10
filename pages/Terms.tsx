import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// 用户协议页：展示条款并支持目录导航。
// Terms page: renders policies with table of contents navigation.

interface TermsProps {
  onBack: () => void;
}

// 章节容器：保持一致的标题与正文样式。
// Section container: consistent heading/body styles.
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

export const Terms: React.FC<TermsProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('acceptance');

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navItems = [
    { id: 'acceptance', label: t('terms.nav.acceptance') },
    { id: 'conduct', label: t('terms.nav.conduct') },
    { id: 'content', label: t('terms.nav.content') },
    { id: 'moderation', label: t('terms.nav.moderation') },
    { id: 'disclaimer', label: t('terms.nav.disclaimer') },
  ];

  return (
    <div className="themed-page min-h-screen pb-10">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <section className="themed-static-hero mb-6 p-6 md:p-8">
          <div className="themed-kicker mb-3">{t('footer.terms')}</div>
          <button onClick={onBack} className="themed-inline-action mb-3 text-sm">
            &larr; {t('nav.home')}
          </button>
          <h1 className="themed-heading mb-3 text-3xl md:text-4xl">{t('terms.title')}</h1>
          <p className="themed-meta text-sm leading-7">Effective Date: February 3, 2026</p>
        </section>

        <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar Nav (Desktop) */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="themed-static-sidebar sticky top-20 p-4">
            <div className="themed-kicker mb-4 px-2">{t('terms.contents')}</div>
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
          
          <Section id="acceptance" title={t('terms.section.acceptance')}>
            <p>
              {t('terms.acceptance.text1')}
            </p>
            <p>
              {t('terms.acceptance.text2')}
            </p>
          </Section>

          <Section id="conduct" title={t('terms.section.conduct')}>
            <p>
              {t('terms.conduct.intro')}
            </p>
            <ul className="themed-metric-card mt-2 list-inside list-disc space-y-2 p-4 pl-2">
              <li><strong>{t('terms.conduct.illegal')}</strong></li>
              <li><strong>{t('terms.conduct.harassment')}</strong></li>
              <li><strong>{t('terms.conduct.spam')}</strong></li>
              <li><strong>{t('terms.conduct.malware')}</strong></li>
            </ul>
          </Section>

          <Section id="content" title={t('terms.section.content')}>
            <p>
              <strong>{t('terms.content.anonymity')}</strong>
            </p>
            <p>
              <strong>{t('terms.content.no-screening')}</strong>
            </p>
            <p>
              <strong>{t('terms.content.persistence')}</strong>
            </p>
          </Section>

          <Section id="moderation" title={t('terms.section.moderation')}>
            <p>
              {t('terms.moderation.intro')}
            </p>
            <ol className="list-decimal list-inside pl-2 space-y-1 mt-2">
              <li>{t('terms.moderation.right1')}</li>
              <li>{t('terms.moderation.right2')}</li>
              <li>{t('terms.moderation.right3')}</li>
            </ol>
            <p className="themed-meta mt-2 text-sm italic">
              {t('terms.moderation.note')}
            </p>
          </Section>

          <Section id="disclaimer" title={t('terms.section.disclaimer')}>
            <p className="themed-kicker mb-2 text-xs">{t('terms.disclaimer.warning')}</p>
            <p>
              {t('terms.disclaimer.text1')}
            </p>
            <p>
              {t('terms.disclaimer.text2')}
            </p>
          </Section>

        </main>
      </div>
      </div>
    </div>
  );
};
