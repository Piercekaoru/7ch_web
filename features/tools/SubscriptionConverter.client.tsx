'use client';

import { useState } from 'react';
import { Clipboard, Download, Link2, Loader2, RefreshCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type {
  CreateSubscriptionLinkResponse,
  SubscriptionConvertResponse,
} from '@/types';

export interface SubscriptionConverterLabels {
  title: string;
  subtitle: string;
  sourceLabel: string;
  sourcePlaceholder: string;
  sourceHelp: string;
  sourceFormat: string;
  targetFormat: string;
  convert: string;
  converting: string;
  createLink: string;
  creatingLink: string;
  resultTitle: string;
  warningsTitle: string;
  copy: string;
  copied: string;
  download: string;
  linkTitle: string;
  linkHelp: string;
  emptyTitle: string;
  emptyBody: string;
  invalidUrl: string;
  genericError: string;
  metaPrefix: string;
}

interface SubscriptionConverterProps {
  labels: SubscriptionConverterLabels;
}

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const readErrorMessage = async (response: Response, fallback: string) => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      const body = await response.json() as { message?: string; error?: string };
      return body.message || body.error || fallback;
    } catch {
      return fallback;
    }
  }

  const text = await response.text().catch(() => '');
  return text || fallback;
};

export function SubscriptionConverter({ labels }: SubscriptionConverterProps) {
  const [sourceUrl, setSourceUrl] = useState('');
  const [result, setResult] = useState<SubscriptionConvertResponse | null>(null);
  const [linkResult, setLinkResult] = useState<CreateSubscriptionLinkResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState<'content' | 'link' | null>(null);

  const trimmedSourceUrl = sourceUrl.trim();
  const canSubmit = trimmedSourceUrl.length > 0 && !isConverting && !isCreatingLink;

  const assertValidUrl = () => {
    if (!isHttpUrl(trimmedSourceUrl)) {
      throw new Error(labels.invalidUrl);
    }
  };

  const convertSubscription = async () => {
    setError(null);
    setCopiedTarget(null);

    try {
      assertValidUrl();
      setIsConverting(true);
      setLinkResult(null);

      const response = await fetch('/api/subscriptions/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          sourceUrl: trimmedSourceUrl,
          sourceFormat: 'clash',
          targetFormat: 'sing-box',
        }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, labels.genericError));
      }

      const payload = await response.json() as SubscriptionConvertResponse;
      setResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.genericError);
    } finally {
      setIsConverting(false);
    }
  };

  const createSubscriptionLink = async () => {
    setError(null);
    setCopiedTarget(null);

    try {
      assertValidUrl();
      setIsCreatingLink(true);

      const response = await fetch('/api/subscriptions/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          sourceUrl: trimmedSourceUrl,
          sourceFormat: 'clash',
          targetFormat: 'sing-box',
        }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, labels.genericError));
      }

      const payload = await response.json() as CreateSubscriptionLinkResponse;
      setLinkResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.genericError);
    } finally {
      setIsCreatingLink(false);
    }
  };

  const copyText = async (value: string, target: 'content' | 'link') => {
    await navigator.clipboard.writeText(value);
    setCopiedTarget(target);
    window.setTimeout(() => setCopiedTarget(null), 1800);
  };

  const downloadResult = () => {
    if (!result?.content) return;

    const blob = new Blob([result.content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'sing-box-subscription.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const displayLink = linkResult?.displayUrl || linkResult?.url;

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4">
      <section className="themed-card themed-card-featured p-6">
        <div className="mb-6 border-b border-border pb-4">
          <div className="themed-kicker mb-2">Subscribe</div>
          <h1 className="themed-heading text-2xl">{labels.title}</h1>
          <p className="themed-meta mt-2 text-sm leading-6">{labels.subtitle}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <label className="block">
              <span className="themed-heading-sm mb-2 block text-sm">{labels.sourceLabel}</span>
              <input
                type="url"
                value={sourceUrl}
                onChange={(event) => setSourceUrl(event.target.value)}
                placeholder={labels.sourcePlaceholder}
                className="themed-search-field w-full rounded-md px-3 py-2 text-sm transition-colors focus:border-[hsl(var(--ring))] focus:outline-none"
              />
            </label>
            <p className="themed-meta text-xs leading-5">{labels.sourceHelp}</p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="themed-card-muted p-3">
                <div className="themed-kicker mb-1">Source</div>
                <div className="themed-heading-sm">{labels.sourceFormat}</div>
              </div>
              <div className="themed-card-muted p-3">
                <div className="themed-kicker mb-1">Target</div>
                <div className="themed-heading-sm">{labels.targetFormat}</div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" onClick={convertSubscription} disabled={!canSubmit}>
                {isConverting ? <Loader2 className="animate-spin" /> : <RefreshCcw />}
                {isConverting ? labels.converting : labels.convert}
              </Button>
              <Button type="button" variant="outline" onClick={createSubscriptionLink} disabled={!canSubmit}>
                {isCreatingLink ? <Loader2 className="animate-spin" /> : <Link2 />}
                {isCreatingLink ? labels.creatingLink : labels.createLink}
              </Button>
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <aside className="themed-card-muted p-4">
            <h2 className="themed-heading-sm mb-2">{labels.emptyTitle}</h2>
            <p className="themed-meta text-sm leading-6">{labels.emptyBody}</p>
          </aside>
        </div>
      </section>

      {displayLink && (
        <section className="themed-card themed-card-featured p-5">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="themed-heading text-lg">{labels.linkTitle}</h2>
              <p className="themed-meta mt-1 text-xs">{labels.linkHelp}</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => copyText(displayLink, 'link')}>
              <Clipboard />
              {copiedTarget === 'link' ? labels.copied : labels.copy}
            </Button>
          </div>
          <code className="block overflow-x-auto rounded-md border border-border bg-background p-3 text-xs">
            {displayLink}
          </code>
          {linkResult.expiresAt && (
            <p className="themed-meta mt-2 text-xs">expires: {linkResult.expiresAt}</p>
          )}
        </section>
      )}

      {result && (
        <section className="themed-card themed-card-featured overflow-hidden p-5">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="themed-heading text-lg">{labels.resultTitle}</h2>
              <p className="themed-meta mt-1 text-xs">
                {labels.metaPrefix} {result.meta.sourceFormat} → {result.meta.targetFormat}
                {' · '}{result.meta.contentBytes} bytes
                {' · '}{result.meta.elapsedMs}ms
                {typeof result.meta.nodeCount === 'number' ? ` · ${result.meta.nodeCount} nodes` : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => copyText(result.content, 'content')}>
                <Clipboard />
                {copiedTarget === 'content' ? labels.copied : labels.copy}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={downloadResult}>
                <Download />
                {labels.download}
              </Button>
            </div>
          </div>

          {result.warnings.length > 0 && (
            <div className="mb-3 rounded-md border border-border bg-secondary/40 p-3 text-sm">
              <div className="themed-heading-sm mb-1">{labels.warningsTitle}</div>
              <ul className="list-disc space-y-1 pl-5">
                {result.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          <pre className="max-h-[560px] overflow-auto rounded-md border border-border bg-background p-4 text-xs leading-5">
            <code>{result.content}</code>
          </pre>
        </section>
      )}
    </div>
  );
}
