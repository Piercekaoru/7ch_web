import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// 常见问题页：按主题分组的 Q&A，支持目录导航。
// FAQ page: topic-based Q&A with table of contents navigation.

interface QAProps {
  onBack: () => void;
}

// 章节容器：提供锚点与统一排版。
// Section container: provides anchor and unified layout.
const Section: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
  <section id={id} className="themed-static-section mb-10">
    <h3 className="themed-static-section-title mb-4 pb-3 text-lg font-bold md:text-xl">
      {title}
    </h3>
    <div className="space-y-4 text-sm leading-relaxed text-foreground md:text-base">
      {children}
    </div>
  </section>
);

export const QA: React.FC<QAProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('access');

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navItems = [
    { id: 'access', label: t('qa.toc.access') },
    { id: 'anonymity', label: t('qa.toc.anonymity') },
    { id: 'identity', label: t('qa.toc.identity') },
    { id: 'privacy', label: t('qa.toc.privacy') },
    { id: 'opensource', label: t('qa.toc.opensource') },
    { id: 'deletion', label: t('qa.toc.deletion') },
    { id: 'report', label: t('qa.toc.report') },
    { id: 'legal', label: t('qa.toc.legal') },
  ];

  return (
    <div className="themed-page min-h-screen pb-10">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <section className="themed-static-hero mb-6 p-6 md:p-8">
          <div className="themed-kicker mb-3">{t('footer.QA')}</div>
          <button onClick={onBack} className="themed-inline-action mb-3 text-sm">
            &larr; {t('nav.home')}
          </button>
          <h1 className="themed-heading mb-3 text-3xl md:text-4xl">{t('qa.title')}</h1>
          <p className="max-w-3xl text-sm leading-7 themed-meta md:text-base">{t('qa.subtitle')}</p>
        </section>

        <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar Nav (Desktop) */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="themed-static-sidebar sticky top-20 p-4">
            <div className="themed-kicker mb-4 px-2">{t('qa.toc.title')}</div>
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
          
          <Section id="access" title={t('qa.q1.question')}>
            <p>
              {t('qa.q1.answer1')}
            </p>
            <p>
              {t('qa.q1.answer2')}
            </p>
          </Section>

          <Section id="anonymity" title={t('qa.q2.question')}>
            <p>
              {t('qa.q2.answer1')}
            </p>
            <p>
              {t('qa.q2.answer2')}
            </p>
          </Section>

          <Section id="identity" title={t('qa.q3.question')}>
            <p>
              {t('qa.q3.answer1')}
            </p>
            <div className="themed-callout-warn p-4">
              <p className="text-sm">
                <strong>{t('qa.q3.note')}</strong> {t('qa.q3.note-text')}
              </p>
            </div>
          </Section>

          <Section id="privacy" title={t('qa.q4.question')}>
            <p>
              {t('qa.q4.answer1')}
            </p>
            <p>
              {t('qa.q4.answer2')}
            </p>
          </Section>

          <Section id="opensource" title={t('qa.q5.question')}>
            <p>
              {t('qa.q5.answer1')}
            </p>
            <p>
              {t('qa.q5.answer2')}
            </p>
          </Section>

          <Section id="deletion" title={t('qa.q6.question')}>
            <p>
              {t('qa.q6.answer1')}
            </p>
            <p>
              {t('qa.q6.answer2')}
            </p>
          </Section>

          <Section id="report" title={t('qa.q7.question')}>
            <p>
              {t('qa.q7.answer1')} <a href="mailto:Piercekaoru@proton.me" className="themed-inline-action">Piercekaoru@proton.me</a>。
            </p>
            <p>
              {t('qa.q7.answer2')}
            </p>
          </Section>

          <Section id="legal" title={t('qa.q8.question')}>
            <p>
              {t('qa.q8.answer1')}
            </p>
            <p>
              {t('qa.q8.answer2')}
            </p>
            <p>
              {t('qa.q8.answer3')}
            </p>
          </Section>

        </main>
      </div>
      </div>
    </div>
  );
};
