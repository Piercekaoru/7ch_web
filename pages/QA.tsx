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
  <section id={id} className="mb-10 scroll-mt-20">
    <h3 className="mb-4 border-b border-gray-200 pb-2 text-lg font-bold text-gray-800 dark:border-gray-700 dark:text-gray-100 md:text-xl">
      {title}
    </h3>
    <div className="space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300 md:text-base">
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
    <div className="min-h-screen bg-[#f0f0f0] pb-10 dark:bg-background">
      {/* Header Banner */}
      <div className="bg-[#006064] text-white py-10 px-4 mb-6 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('qa.title')}</h1>
          <p className="opacity-90">{t('qa.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav (Desktop) */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-20 rounded border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-4 px-2 font-bold text-gray-900 dark:text-gray-100">{t('qa.toc.title')}</div>
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
            <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 dark:bg-amber-950/40 dark:text-amber-100">
              <p className="text-sm text-yellow-800 dark:text-amber-200">
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
              {t('qa.q7.answer1')} <a href="mailto:Piercekaoru@proton.me" className="text-[#0056b3] hover:underline dark:text-sky-300">Piercekaoru@proton.me</a>。
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
  );
};
