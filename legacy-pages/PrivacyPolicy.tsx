import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// 隐私政策页：按章节展示政策内容并支持目录跳转。
// Privacy policy page: sectioned content with table of contents navigation.

interface PrivacyPolicyProps {
  onBack: () => void;
}

// 通用章节组件：统一标题样式与布局。
// Shared section component for consistent layout.
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

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('intro');

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navItems = [
    { id: 'intro', label: t('privacy.nav.intro') },
    { id: 'data-collection', label: t('privacy.nav.data') },
    { id: 'storage', label: t('privacy.nav.storage') },
    { id: 'anonymity', label: t('privacy.nav.anonymity') },
    { id: 'third-party', label: t('privacy.nav.thirdParty') },
    { id: 'contact', label: t('privacy.nav.contact') },
  ];

  return (
    <div className="themed-page min-h-screen pb-10">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <section className="themed-static-hero mb-6 p-6 md:p-8">
          <div className="themed-kicker mb-3">{t('footer.privacy')}</div>
          <button onClick={onBack} className="themed-inline-action mb-3 text-sm">
            &larr; {t('nav.home')}
          </button>
          <h1 className="themed-heading mb-3 text-3xl md:text-4xl">{t('privacy.title')}</h1>
          <p className="themed-meta text-sm leading-7">Last Updated: February 3, 2026</p>
        </section>

        <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar Nav (Desktop) */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="themed-static-sidebar sticky top-20 p-4">
            <div className="themed-kicker mb-4 px-2">{t('privacy.contents')}</div>
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
          
          <Section id="intro" title={t('privacy.section.intro')}>
            <p>
              {t('privacy.intro.text1')}
            </p>
            <p>
              {t('privacy.intro.text2')}
            </p>
          </Section>

          <Section id="data-collection" title={t('privacy.section.data')}>
            <p>
              {t('privacy.data.intro')}
            </p>
            <ul className="list-disc list-inside pl-2 space-y-2 mt-2">
              <li><strong>{t('privacy.data.no-personal')}</strong></li>
              <li><strong>{t('privacy.data.no-account')}</strong></li>
              <li><strong>{t('privacy.data.voluntary')}</strong></li>
            </ul>
          </Section>

          <Section id="storage" title={t('privacy.section.storage')}>
            <p>
              {t('privacy.storage.intro')}
            </p>
            <div className="themed-callout-warn mb-4 mt-2 p-4">
              <p className="text-sm font-bold">{t('privacy.storage.note-title')}</p>
              <p className="mt-1 text-sm">
                {t('privacy.storage.note')}
              </p>
            </div>
            <p>
              {t('privacy.storage.preferences')}
            </p>
            <ul className="list-disc list-inside pl-2 text-sm">
              <li>{t('privacy.storage.lang')}</li>
              <li>{t('privacy.storage.hidden')}</li>
              <li>{t('privacy.storage.followed')}</li>
            </ul>
          </Section>

          <Section id="anonymity" title={t('privacy.section.anonymity')}>
            <p>
              {t('privacy.anonymity.intro')}
            </p>
            <h4 className="themed-heading-sm mb-2 mt-4 text-lg">{t('privacy.anonymity.how')}</h4>
            <p>
              {t('privacy.anonymity.desc')}
            </p>
            <code className="themed-code-inline mb-2 mt-2 block p-2 text-xs font-mono">
              Hash( IP + Date(UTC) + Board_ID + Secret_Salt )
            </code>
            <p>
              {t('privacy.anonymity.ensures')}
            </p>
            <ol className="list-decimal list-inside pl-2 space-y-1 mt-2">
              <li>{t('privacy.anonymity.ensure1')}</li>
              <li>{t('privacy.anonymity.ensure2')}</li>
              <li>{t('privacy.anonymity.ensure3')}</li>
            </ol>
          </Section>

          <Section id="third-party" title={t('privacy.section.thirdParty')}>
            <p>
              {t('privacy.thirdParty.intro')}
            </p>
            <ul className="list-disc list-inside pl-2 space-y-2 mt-2">
              <li><strong>{t('privacy.thirdParty.cdn')}</strong></li>
              <li><strong>{t('privacy.thirdParty.tailwind')}</strong></li>
            </ul>
            <p>
              {t('privacy.thirdParty.no-tracking')}
            </p>
          </Section>

          <Section id="contact" title={t('privacy.section.contact')}>
            <p>
              {t('privacy.contact.intro')}
            </p>
            <p className="mt-2">
              <strong>{t('privacy.contact.delete')}</strong>
            </p>
            <p className="mt-4">
              {t('privacy.contact.tech')}
            </p>
          </Section>

        </main>
      </div>
      </div>
    </div>
  );
};
