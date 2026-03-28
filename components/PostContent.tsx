import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '../lib/utils';
import { Post } from '../types';
import { useTheme } from './theme-provider';

const QUOTE_PROTOCOL = 'quote://';
const quoteTokenPattern = />>(\d{1,7})/g;

const parseQuoteId = (href?: string): number | null => {
  if (!href?.startsWith(QUOTE_PROTOCOL)) return null;
  const id = Number.parseInt(href.slice(QUOTE_PROTOCOL.length), 10);
  return Number.isFinite(id) ? id : null;
};

const transformQuoteSyntax = (source: string): string => {
  let inFence = false;
  let fenceChar: '`' | '~' | null = null;
  const lines = source.split('\n');

  return lines.map((line) => {
    const trimmed = line.trimStart();
    const fenceMatch = trimmed.match(/^(```+|~~~+)/);

    if (fenceMatch) {
      const currentFenceChar = fenceMatch[1][0] as '`' | '~';
      if (!inFence) {
        inFence = true;
        fenceChar = currentFenceChar;
      } else if (fenceChar === currentFenceChar) {
        inFence = false;
        fenceChar = null;
      }
      return line;
    }

    if (inFence) return line;

    // 避免改写 inline code 内的文本，只处理正文中的 >>123。
    // Avoid rewriting inline code text; only transform plain text >>123 tokens.
    return line
      .split(/(`+[^`]*`+)/g)
      .map((segment) => {
        if (segment.startsWith('`') && segment.endsWith('`')) {
          return segment;
        }
        return segment.replace(quoteTokenPattern, (_match, id) => `[>>${id}](${QUOTE_PROTOCOL}${id})`);
      })
      .join('');
  }).join('\n');
};

interface QuoteAnchorProps {
  targetId: number;
  allPosts: Post[];
  onQuoteClick?: (id: number) => void;
  className?: string;
}

const QuoteAnchor: React.FC<QuoteAnchorProps> = ({ targetId, allPosts, onQuoteClick, className }) => {
  const [hoveredPost, setHoveredPost] = useState<Post | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const post = allPosts.find((item) => item.id === targetId);
    if (!post) return;

    setHoveredPost(post);
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({ x: rect.left, y: rect.bottom + 5 });
  };

  return (
    <span className="relative inline-block">
      <button
        type="button"
        className={cn('cursor-pointer border-none bg-transparent p-0 text-[#0056b3] hover:underline dark:text-sky-300', className)}
        onClick={() => onQuoteClick?.(targetId)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setHoveredPost(null)}
      >
        {`>>${targetId}`}
      </button>
      {hoveredPost && hoveredPost.id === targetId && (
        <span
          className="pointer-events-none fixed z-50 max-w-md rounded border border-gray-400 bg-white p-3 text-left text-xs shadow-xl dark:border-gray-700 dark:bg-gray-900"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <span className="mb-2 flex justify-between border-b pb-1 font-bold text-gray-500 dark:border-gray-700 dark:text-gray-400">
            <span>{hoveredPost.id} : <span className="text-[#117743] dark:text-emerald-300">{hoveredPost.name}</span></span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">{hoveredPost.createdAt.split('T')[0]}</span>
          </span>
          <span className="block max-h-40 overflow-hidden leading-snug text-gray-800 dark:text-gray-200">
            {hoveredPost.content}
          </span>
        </span>
      )}
    </span>
  );
};

interface PostContentProps {
  content: string;
  allPosts?: Post[];
  onQuoteClick?: (id: number) => void;
  className?: string;
}

export const PostContent: React.FC<PostContentProps> = ({
  content,
  allPosts = [],
  onQuoteClick,
  className,
}) => {
  const markdown = useMemo(() => transformQuoteSyntax(content), [content]);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className={cn('break-words text-[15px] leading-relaxed text-[#333] dark:text-gray-200', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        skipHtml
        components={{
          a: ({ href, children, ...props }) => {
            const targetId = parseQuoteId(href);
            if (targetId !== null) {
              if (allPosts.length > 0) {
                return (
                  <QuoteAnchor
                    targetId={targetId}
                    allPosts={allPosts}
                    onQuoteClick={onQuoteClick}
                  />
                );
              }

              return (
                <span className="text-[#0056b3] dark:text-sky-300">
                  {children}
                </span>
              );
            }

            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-[#0056b3] hover:underline dark:text-sky-300"
                {...props}
              >
                {children}
              </a>
            );
          },
          p: ({ children }) => <p className="mb-2 whitespace-pre-wrap last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-2 border-l-4 border-gray-300 pl-3 text-gray-700 dark:border-gray-600 dark:text-gray-300">{children}</blockquote>
          ),
          pre: ({ children }) => <div className="my-2">{children}</div>,
          code: ({ inline, className: codeClassName, children, ...props }) => {
            if (inline) {
              return (
                <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.92em] dark:bg-gray-800 dark:text-gray-100" {...props}>
                  {children}
                </code>
              );
            }

            const match = /language-([a-zA-Z0-9_-]+)/.exec(codeClassName || '');
            const code = String(children).replace(/\n$/, '');

            return (
              <SyntaxHighlighter
                style={isDark ? oneDark : oneLight}
                language={match?.[1] ?? 'text'}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  border: isDark ? '1px solid #364152' : '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  padding: '0.75rem',
                  background: isDark ? '#111827' : '#f8fafc',
                  fontSize: '0.85rem',
                }}
              >
                {code}
              </SyntaxHighlighter>
            );
          },
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300 text-sm dark:border-gray-700">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>,
          tr: ({ children }) => <tr className="border-b border-gray-300 dark:border-gray-700">{children}</tr>,
          th: ({ children }) => <th className="border border-gray-300 px-2 py-1 text-left font-bold dark:border-gray-700">{children}</th>,
          td: ({ children }) => <td className="border border-gray-300 px-2 py-1 align-top dark:border-gray-700">{children}</td>,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};
