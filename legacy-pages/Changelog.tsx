import React from 'react';
import { useTranslation } from 'react-i18next';
import { changelogData } from '../data/changelog';

// 更新日志页：读取静态数据并按时间分组展示。
// Changelog page: renders static changelog data in chronological sections.

interface ChangelogProps {
    onBack: () => void;
}

export const Changelog: React.FC<ChangelogProps> = ({ onBack }) => {
    const { t } = useTranslation();

    return (
        <div className="themed-page min-h-[calc(100vh-3.5rem)] pb-10">
            <div className="max-w-4xl mx-auto py-6 px-2 sm:px-4">
                {/* Header matched to BBS style */}
                <div className="mb-2 flex items-center gap-3 text-xl font-bold text-foreground">
                    <button onClick={onBack} className="themed-inline-action flex items-center gap-1 text-sm font-normal">
                        ← Back to 7ch
                    </button>
                    <span className="themed-meta">/</span>
                    <span className="themed-heading text-xl">Changelog</span>
                </div>
                <p className="themed-meta mb-6 px-1 text-sm">All major updates and releases.</p>

                {/* List */}
                <div className="space-y-4">
                    {changelogData.map((entry, index) => (
                        <div key={index} className="themed-list-card p-5 md:p-6">
                            <div className="mb-4 flex flex-col gap-2 border-b border-border pb-3 md:flex-row md:items-baseline md:gap-4">
                                <h2 className="themed-heading-sm text-lg">
                                    {entry.title}
                                </h2>
                                <div className="themed-meta font-mono text-xs">
                                    {entry.version}
                                </div>
                                <div className="themed-kicker md:ml-auto">
                                    {entry.date}
                                </div>
                            </div>

                            <ul className="space-y-2">
                                {entry.changes.map((change, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-foreground">
                                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[hsl(var(--brand))]" />
                                        <span>{change}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
