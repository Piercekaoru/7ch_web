import React from 'react';

interface InlineErrorNoticeProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const InlineErrorNotice: React.FC<InlineErrorNoticeProps> = ({
  title,
  message,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`rounded border border-red-200 bg-red-50 px-4 py-3 text-sm shadow-sm dark:border-red-900/60 dark:bg-red-950/40 ${className}`.trim()}>
      {title && (
        <div className="mb-1 font-bold text-red-900 dark:text-red-100">
          {title}
        </div>
      )}
      <div className="leading-relaxed text-red-700 dark:text-red-200">
        {message}
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-3 rounded border border-red-300 bg-white px-4 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-transparent dark:text-red-200 dark:hover:bg-red-950/50"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
