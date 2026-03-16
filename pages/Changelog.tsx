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
        <div className="bg-[#f0f0f0] min-h-[calc(100vh-3.5rem)] pb-10">
            <div className="max-w-4xl mx-auto py-6 px-2 sm:px-4">
                {/* Header matched to BBS style */}
                <div className="mb-2 text-xl font-bold text-gray-700 flex items-center gap-3">
                    <button onClick={onBack} className="text-[#0056b3] hover:underline flex items-center gap-1 font-normal text-sm">
                        ← Back to 7ch
                    </button>
                    <span className="text-gray-400">/</span>
                    <span>Changelog</span>
                </div>
                <p className="text-sm text-gray-600 mb-6 px-1">All major updates and releases.</p>

                {/* List */}
                <div className="space-y-4">
                    {changelogData.map((entry, index) => (
                        <div key={index} className="bg-white p-5 md:p-6 rounded-sm shadow-sm border border-gray-200">
                            <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mb-4 pb-3 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-800">
                                    {entry.title}
                                </h2>
                                <div className="text-xs text-gray-500 font-mono">
                                    {entry.version}
                                </div>
                                <div className="md:ml-auto text-xs font-bold text-gray-400">
                                    {entry.date}
                                </div>
                            </div>

                            <ul className="space-y-2">
                                {entry.changes.map((change, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                                        <span className="mt-1.5 w-1 h-1 bg-gray-400 rounded-full flex-shrink-0" />
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
