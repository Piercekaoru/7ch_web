import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// 技术文档页：侧边目录 + 内容分区，支持平滑滚动定位。
// Docs page: table of contents + sections with smooth scroll navigation.

interface DocsProps {
    onBack: () => void;
}

// 内容分区：统一标题样式与锚点偏移。
// Section block: consistent headings with anchor offset.
const Section: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
    <section id={id} className="themed-static-section mb-12">
        <h3 className="themed-static-section-title mb-4 flex items-center gap-2 pb-3 text-2xl font-bold">
            <span className="text-[hsl(var(--brand))]">#</span> {title}
        </h3>
        <div className="space-y-4 leading-relaxed text-foreground">
            {children}
        </div>
    </section>
);

// 代码块：可选标签 + 滚动容器，便于展示命令/示例。
// Code block: optional label with scrollable container for examples.
const CodeBlock: React.FC<{ children: React.ReactNode; label?: string }> = ({ children, label }) => (
    <div className="themed-codeblock my-4">
        {label && <div className="themed-codeblock-label px-3 py-1 text-xs font-bold">{label}</div>}
        <pre className="overflow-x-auto whitespace-pre p-3 text-sm font-mono text-foreground">
            {children}
        </pre>
    </div>
);

export const Docs: React.FC<DocsProps> = ({ onBack }) => {
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState('overview');

    const scrollTo = (id: string) => {
        setActiveSection(id);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    const navItems = [
        { id: 'overview', label: t('docs.toc.overview') },
        { id: 'architecture', label: t('docs.toc.architecture') },
        { id: 'data-model', label: t('docs.toc.data-model') },
        { id: 'features', label: t('docs.toc.features') },
        { id: 'i18n', label: t('docs.toc.i18n') },
    ];

    return (
        <div className="themed-page min-h-screen pb-10">
            <div className="max-w-6xl mx-auto px-4 py-6">
                <section className="themed-static-hero mb-6 p-6 md:p-8">
                    <div className="themed-kicker mb-3">{t('footer.tech')}</div>
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                        <button onClick={onBack} className="themed-inline-action text-sm">
                            &larr; {t('nav.home', { defaultValue: 'Back to App' })}
                        </button>
                    </div>
                    <h1 className="themed-heading mb-3 text-3xl md:text-4xl">{t('docs.banner.title', { defaultValue: '7ch Technical Documentation' })}</h1>
                    <p className="max-w-3xl text-sm leading-7 themed-meta md:text-base">
                        {t('docs.banner.subtitle', { defaultValue: 'Architecture, Specifications, and Implementation Details' })}
                    </p>
                </section>

                <div className="flex flex-col gap-8 md:flex-row">
                {/* Sidebar Nav (Desktop) */}
                <aside className="hidden md:block w-64 flex-shrink-0">
                    <div className="themed-static-sidebar sticky top-20 p-4">
                        <div className="themed-kicker mb-4 px-2">{t('docs.toc.title', { defaultValue: 'Table of Contents' })}</div>
                        <nav className="space-y-1">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollTo(item.id)}
                                    className={`themed-static-nav w-full px-3 py-2 text-left text-sm ${activeSection === item.id
                                        ? 'themed-static-nav-active'
                                        : ''
                                        }`}
                                >
                                    {t(`docs.toc.${item.id}`, { defaultValue: item.label })}
                                </button>
                            ))}
                        </nav>
                        <div className="mt-6 border-t border-border pt-4">
                            <button onClick={onBack} className="themed-inline-action flex items-center gap-1 px-2 text-sm">
                                &larr; {t('nav.home', { defaultValue: 'Back to App' })}
                            </button>
                        </div>
                    </div>
                </aside>



                {/* Main Content */}
                <main className="themed-static-main min-h-[500px] flex-1 p-6 md:p-10">

                    <Section id="overview" title={t('docs.overview.title')}>
                        <p>
                            <strong>7ch</strong> {t('docs.overview.intro')}
                        </p>
                        <p>
                            {t('docs.overview.description')}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            <div className="themed-metric-card p-4">
                                <div className="mb-1 font-bold text-foreground">{t('docs.overview.frontend')}</div>
                                <ul className="themed-meta list-inside list-disc text-sm">
                                    <li>{t('docs.overview.frontend.react')}</li>
                                    <li>{t('docs.overview.frontend.typescript')}</li>
                                    <li>{t('docs.overview.frontend.tailwind')}</li>
                                    <li>{t('docs.overview.frontend.i18n')}</li>
                                </ul>
                            </div>
                            <div className="themed-metric-card p-4">
                                <div className="mb-1 font-bold text-foreground">{t('docs.overview.concepts')}</div>
                                <ul className="themed-meta list-inside list-disc text-sm">
                                    <li>{t('docs.overview.concepts.no-router')}</li>
                                    <li>{t('docs.overview.concepts.mock-api')}</li>
                                    <li>{t('docs.overview.concepts.identity')}</li>
                                    <li>{t('docs.overview.concepts.persistence')}</li>
                                </ul>
                            </div>
                        </div>
                        <div className="themed-callout-info mt-4 p-4 text-sm">
                            {t('docs.overview.transparency')}
                        </div>
                    </Section>

                    <Section id="architecture" title={t('docs.architecture.title')}>
                        <p>
                            {t('docs.architecture.intro')}
                        </p>
                        <h4 className="themed-heading-sm mt-4 text-lg">{t('docs.architecture.view-state')}</h4>
                        <p>
                            {t('docs.architecture.view-state.desc')}
                        </p>
                        <CodeBlock label={t('docs.architecture.routes.label')}>
                            {`/                       -> Home (Boards)
/board/:boardId         -> Board
/board/:boardId/thread/:threadId -> Thread
/favorites              -> Favorites
/docs | /help | /terms | /privacy | /QA -> Static Pages`}
                        </CodeBlock>
                        <p>
                            {t('docs.architecture.view-state.desc2')}
                        </p>
                    </Section>

                    <Section id="data-model" title={t('docs.data-model.title')}>
                        <p>
                            {t('docs.data-model.intro')}
                        </p>
                        <h4 className="themed-heading-sm mt-4 text-lg">{t('docs.data-model.entities')}</h4>
                        <ul className="list-disc list-inside pl-2 space-y-1">
                            <li><strong>Board</strong>: {t('docs.data-model.entities.board')}</li>
                            <li><strong>Thread</strong>: {t('docs.data-model.entities.thread')}</li>
                            <li><strong>Post</strong>: {t('docs.data-model.entities.post')}</li>
                        </ul>
                        <p className="themed-meta text-sm">{t('docs.data-model.note')}</p>
                        <CodeBlock label={t('docs.data-model.codeLabel')}>
                            {`{
  "id": 12,
  "threadId": "<uuid>",
  "name": "Anonymous",
  "tripcode": "◆abcd1234ef",
  "content": "...",
  "createdAt": "2026-02-03T12:00:00Z",
  "uid": "A1b2C3d4",
  "isOp": false
}`}
                        </CodeBlock>
                    </Section>

                    <Section id="features" title={t('docs.features.title')}>

                        <h4 className="themed-heading-sm mt-4 text-lg">{t('docs.features.daily-id.title')}</h4>
                        <p>
                            {t('docs.features.daily-id.intro')}
                        </p>
                        <ul className="list-disc list-inside pl-2 space-y-1">
                            <li>{t('docs.features.daily-id.points.input')}</li>
                            <li>{t('docs.features.daily-id.points.hash')}</li>
                            <li>{t('docs.features.daily-id.points.output')}</li>
                        </ul>
                        <p>
                            {t('docs.features.daily-id.behavior')}
                        </p>
                        <CodeBlock label={t('docs.features.daily-id.codeLabel')}>
                            {`Raw = IP + Date(UTC: YYYY-MM-DD) + BoardId + SecretSalt
Hash = SHA256(Raw)
Encoded = Base64UrlSafeNoPad(Hash)
DailyId = Encoded.substring(0, 8)`}
                        </CodeBlock>
                        <p className="themed-meta text-sm">{t('docs.features.daily-id.note')}</p>

                        <h4 className="themed-heading-sm mt-6 text-lg">{t('docs.features.tripcode.title')}</h4>
                        <p>
                            {t('docs.features.tripcode.intro')}
                        </p>
                        <CodeBlock>
                            {`Input: "Name#password"
Name = "Name"
Tripcode = "◆" + hex(SHA256(password + SecretSalt)).slice(0, 10)`}
                        </CodeBlock>

                        <h4 className="themed-heading-sm mt-6 text-lg">{t('docs.features.sage.title')}</h4>
                        <p>
                            {t('docs.features.sage.intro')}
                        </p>
                        <CodeBlock>
                            {`const isSage = email?.toLowerCase().includes('sage');
if (!isSage) {
  thread.updatedAt = now; // bump only when NOT sage
}`}
                        </CodeBlock>

                        <h4 className="themed-heading-sm mt-6 text-lg">{t('docs.features.anchor.title')}</h4>
                        <p>
                            {t('docs.features.anchor.intro')}
                        </p>

                        <h4 className="themed-heading-sm mt-6 text-lg">{t('docs.features.moderation.title')}</h4>
                        <p>
                            {t('docs.features.moderation.intro')}
                        </p>
                    </Section>

                    <Section id="i18n" title={t('docs.i18n.title')}>
                        <p>
                            {t('docs.i18n.intro')}
                        </p>
                        <p>
                            {t('docs.i18n.technology')}
                        </p>
                        <ul className="list-disc list-inside pl-2 space-y-1 mt-2">
                            <li><strong>{t('docs.i18n.era')}</strong></li>
                            <li><strong>{t('docs.i18n.weekday')}</strong></li>
                        </ul>
                        <CodeBlock label={t('docs.i18n.codeLabel')}>
                            {`if (d.getFullYear() >= 2019) y = 'R' + (d.getFullYear() - 2018); // Reiwa
else if (d.getFullYear() >= 1989) y = 'H' + (d.getFullYear() - 1988); // Heisei`}
                        </CodeBlock>
                    </Section>

                </main>
            </div>
            </div>
        </div>
    );
};

export default Docs;
