import React, { useState } from 'react';
import { ArrowLeft, Copy, Download, RefreshCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { CreateSubscriptionLinkResponse, SubscriptionConvertResponse } from '../types';

interface SubscriptionConvertProps {
  onBack: () => void;
}

export const SubscriptionConvert: React.FC<SubscriptionConvertProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [sourceUrl, setSourceUrl] = useState('');
  const [result, setResult] = useState<SubscriptionConvertResponse | null>(null);
  const [linkResult, setLinkResult] = useState<CreateSubscriptionLinkResponse | null>(null);
  const [linkTtl, setLinkTtl] = useState<'0' | '86400' | '604800' | '2592000'>('0');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [copyLinkStatus, setCopyLinkStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  const handleConvert = async () => {
    setError(null);
    setResult(null);
    setLinkResult(null);
    setCopyStatus('idle');
    setCopyLinkStatus('idle');
    const url = sourceUrl.trim();
    if (!url) {
      setError(t('tools.convert.input.empty'));
      return;
    }

    setIsSubmitting(true);
    try {
      const converted = await api.convertSubscription({
        sourceUrl: url,
        sourceFormat: 'clash',
        targetFormat: 'sing-box',
      });
      setResult(converted);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('tools.convert.convert.failed');
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateLink = async () => {
    setError(null);
    setCopyLinkStatus('idle');
    const url = sourceUrl.trim();
    if (!url) {
      setError(t('tools.convert.input.empty'));
      return;
    }

    setIsGeneratingLink(true);
    try {
      const expiresInSeconds = Number(linkTtl);
      const link = await api.createSubscriptionLink({
        sourceUrl: url,
        sourceFormat: 'clash',
        targetFormat: 'sing-box',
        expiresInSeconds,
      });
      setLinkResult(link);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('tools.convert.link.failed');
      setError(message);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.content);
      setCopyStatus('success');
    } catch {
      setCopyStatus('failed');
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.content], { type: 'application/json;charset=utf-8' });
    const link = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    link.href = objectUrl;
    link.download = 'sing-box-config.json';
    link.click();
    URL.revokeObjectURL(objectUrl);
  };

  const handleCopyLink = async () => {
    if (!linkResult) return;
    try {
      await navigator.clipboard.writeText(linkResult.url);
      setCopyLinkStatus('success');
    } catch {
      setCopyLinkStatus('failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#f0f0f0] pb-10 dark:bg-background">
      <div className="max-w-4xl mx-auto py-6 px-2 sm:px-4">

        {/* Header matched to BBS style */}
        <div className="mb-2 flex items-center gap-3 text-xl font-bold text-gray-700 dark:text-gray-100">
          <button onClick={onBack} className="flex items-center gap-1 text-sm font-normal text-[#0056b3] hover:underline dark:text-sky-300">
            <ArrowLeft className="w-4 h-4" /> {t('tools.convert.back')}
          </button>
          <span className="text-gray-400 dark:text-gray-600">/</span>
          <span>{t('tools.convert.title')}</span>
        </div>
        <p className="mb-6 px-1 text-sm text-gray-600 dark:text-gray-400">{t('tools.convert.subtitle')}</p>

        {/* Warning Section */}
        <section className="mb-6 rounded border border-[#ffe082] bg-[#fff8e1] p-4 text-[#8d6e63] dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-900 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-900/60 dark:text-amber-100 dark:ring-amber-700/40">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600 mr-1.5" />
              {t('tools.convert.badge')}
            </span>
            <span className="font-bold text-sm">{t('tools.convert.warningTitle')}</span>
          </div>
          <p className="text-sm mb-1 leading-relaxed">{t('tools.convert.warningBody')}</p>
          <p className="text-xs font-bold">{t('tools.convert.warningNote')}</p>
        </section>

        {/* Input Section */}
        <section className="mb-6 rounded-sm border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-2 text-lg font-bold text-gray-800 dark:text-gray-100">{t('tools.convert.input.title')}</h2>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{t('tools.convert.input.desc')}</p>

          <textarea
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            className="mb-4 h-32 w-full rounded border border-gray-300 bg-white p-3 font-mono text-sm text-gray-800 focus:border-gray-400 focus:outline-none dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-gray-500"
            placeholder={t('tools.convert.input.placeholder')}
            spellCheck={false}
          />

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleConvert}
              disabled={isSubmitting}
              className="bg-[#2da0b3] hover:bg-[#238a9b] text-white px-5 py-2.5 rounded-sm text-sm font-bold transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
              {isSubmitting ? t('tools.convert.convert.loading') : t('tools.convert.convert.btn')}
            </button>
            <div className="rounded border border-gray-200 bg-gray-50 px-2 py-1 font-mono text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
              {t('tools.convert.convert.desc')}
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
            <div className="mb-2 text-sm font-bold text-gray-800 dark:text-gray-100">{t('tools.convert.link.title')}</div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={linkTtl}
                onChange={(e) => setLinkTtl(e.target.value as '0' | '86400' | '604800' | '2592000')}
                className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-gray-400 focus:outline-none dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-gray-500"
              >
                <option value="0">{t('tools.convert.link.ttl.0')}</option>
                <option value="86400">{t('tools.convert.link.ttl.1d')}</option>
                <option value="604800">{t('tools.convert.link.ttl.7d')}</option>
                <option value="2592000">{t('tools.convert.link.ttl.30d')}</option>
              </select>
              <button
                onClick={handleCreateLink}
                disabled={isGeneratingLink}
                className="flex items-center gap-2 rounded-sm border border-gray-300 bg-white px-5 py-2 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
              >
                {isGeneratingLink ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                {isGeneratingLink ? t('tools.convert.link.loading') : t('tools.convert.link.btn')}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t('tools.convert.link.desc')}</p>
          </div>
        </section>

        {error && (
          <section className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </section>
        )}

        {/* Conversion Result Section */}
        {result && (
          <section className="mb-6 rounded-sm border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-gray-100">{t('tools.convert.result.title')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-sm mb-4">
              <div className="rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/70">
                <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">{t('tools.convert.result.source')}</div>
                <div className="font-bold text-gray-800 dark:text-gray-100">{result.meta.sourceFormat}</div>
              </div>
              <div className="rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/70">
                <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">{t('tools.convert.result.target')}</div>
                <div className="font-bold text-gray-800 dark:text-gray-100">{result.meta.targetFormat}</div>
              </div>
              <div className="rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/70">
                <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">{t('tools.convert.result.nodes')}</div>
                <div className="font-bold text-gray-800 dark:text-gray-100">{result.meta.nodeCount ?? '-'}</div>
              </div>
              <div className="rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/70">
                <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">{t('tools.convert.result.time')}</div>
                <div className="font-bold text-gray-800 dark:text-gray-100">{result.meta.elapsedMs} ms</div>
              </div>
              <div className="rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/70">
                <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">{t('tools.convert.result.size')}</div>
                <div className="font-bold text-gray-800 dark:text-gray-100">{result.meta.contentBytes} B</div>
              </div>
            </div>

            {result.warnings.length > 0 && (
              <div className="mb-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                <div className="font-bold mb-1">Warnings</div>
                <ul className="list-disc list-inside space-y-1">
                  {result.warnings.map((warning, idx) => (
                    <li key={`${warning}-${idx}`}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-sm border border-gray-300 bg-white px-4 py-1.5 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
              >
                <Copy className="w-4 h-4" />
                {t('tools.convert.result.copy')}
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-sm border border-gray-300 bg-white px-4 py-1.5 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
              >
                <Download className="w-4 h-4" />
                {t('tools.convert.result.download')}
              </button>
              {copyStatus === 'success' && (
                <span className="ml-2 text-xs font-bold text-green-600 dark:text-emerald-300">{t('tools.convert.result.copied')}</span>
              )}
              {copyStatus === 'failed' && (
                <span className="ml-2 text-xs font-bold text-red-600 dark:text-red-300">{t('tools.convert.result.copyFailed')}</span>
              )}
            </div>

            <pre className="max-h-[40vh] w-full overflow-auto rounded border border-gray-200 bg-gray-50 p-4 text-xs leading-normal text-gray-800 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100">
              <code>{result.content}</code>
            </pre>
          </section>
        )}

        {/* Generated Secure Link Section */}
        {linkResult && (
          <section className="mb-6 rounded-sm border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-3 text-lg font-bold text-gray-800 dark:text-gray-100">{t('tools.convert.secureLink.title')}</h3>
            <div className="mb-4 rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/70">
              <a href={linkResult.url} target="_blank" rel="noreferrer" className="break-all text-sm font-mono text-[#0056b3] hover:underline dark:text-sky-300">
                {linkResult.url}
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 rounded-sm border border-gray-300 bg-white px-4 py-1.5 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
              >
                <Copy className="w-4 h-4" />
                {t('tools.convert.secureLink.copy')}
              </button>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                {linkResult.expiresAt ? (
                  <span>{t('tools.convert.secureLink.expires')} {new Date(linkResult.expiresAt).toLocaleString()}</span>
                ) : (
                  <span>{t('tools.convert.secureLink.expires')} {t('tools.convert.secureLink.never')}</span>
                )}
              </div>

              {copyLinkStatus === 'success' && (
                <span className="ml-2 text-xs font-bold text-green-600 dark:text-emerald-300">{t('tools.convert.result.copied')}</span>
              )}
              {copyLinkStatus === 'failed' && (
                <span className="ml-2 text-xs font-bold text-red-600 dark:text-red-300">{t('tools.convert.result.copyFailed')}</span>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default SubscriptionConvert;
