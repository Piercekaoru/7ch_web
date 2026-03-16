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
        <div className="min-h-[calc(100vh-3.5rem)] bg-[#f0f0f0] pb-10 dark:bg-background">
            <div className="max-w-4xl mx-auto py-6 px-2 sm:px-4">
                {/* Header matched to BBS style */}
                <div className="mb-2 flex items-center gap-3 text-xl font-bold text-gray-700 dark:text-gray-100">
                    <button onClick={onBack} className="flex items-center gap-1 text-sm font-normal text-[#0056b3] hover:underline dark:text-sky-300">
                        ← Back to 7ch
                    </button>
                    <span className="text-gray-400 dark:text-gray-600">/</span>
                    <span>Changelog</span>
                </div>
                <p className="mb-6 px-1 text-sm text-gray-600 dark:text-gray-400">All major updates and releases.</p>

                {/* List */}
                <div className="space-y-4">
                    {changelogData.map((entry, index) => (
                        <div key={index} className="rounded-sm border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 md:p-6">
                            <div className="mb-4 flex flex-col gap-2 border-b border-gray-100 pb-3 dark:border-gray-800 md:flex-row md:items-baseline md:gap-4">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                    {entry.title}
                                </h2>
                                <div className="font-mono text-xs text-gray-500 dark:text-gray-400">
                                    {entry.version}
                                </div>
                                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 md:ml-auto">
                                    {entry.date}
                                </div>
                            </div>

                            <ul className="space-y-2">
                                {entry.changes.map((change, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                        <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-gray-400 dark:bg-gray-500" />
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
