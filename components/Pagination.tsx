import React from 'react';
import { useTranslation } from 'react-i18next';

// 分页组件：简化的大页数折叠显示。
// Pagination component: condensed display for large page counts.
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const { t } = useTranslation();

    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 7;

        // 在可见数量内直接展示全部页码。
        // If total pages are small, show all page numbers.
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // 使用“首尾 + 当前附近 + 省略号”的折叠策略。
            // Use "edges + neighbors + ellipsis" collapsing strategy.
            // Display: 1 ... 4 5 [6] 7 8 ... 20
            if (currentPage <= 4) {
                pages.push(1, 2, 3, 4, 5, '...', totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }

        return pages.map((p, i) =>
            typeof p === 'number' ? (
                <button
                    key={i}
                    onClick={() => onPageChange(p)}
                    className={`px-3 py-1.5 text-sm border transition-colors ${p === currentPage
                            ? 'bg-[#0056b3] text-white border-[#0056b3] font-bold'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800'
                        }`}
                >
                    {p}
                </button>
            ) : (
                <span key={i} className="px-2 text-gray-400 dark:text-gray-500">
                    ...
                </span>
            )
        );
    };

    return (
        <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-1.5 text-sm border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
                {t('pagination.prev')}
            </button>

            {renderPageNumbers()}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-1.5 text-sm border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
                {t('pagination.next')}
            </button>

            <span className="ml-4 hidden text-sm text-gray-600 dark:text-gray-400 sm:inline">
                {t('pagination.info', { current: currentPage, total: totalPages })}
            </span>
        </div>
    );
};
