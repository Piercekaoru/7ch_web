import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { isExternalHttpUrl } from '../lib/externalLinks';

interface PendingExternalLink {
  url: string;
}

const findAnchor = (target: EventTarget | null) => {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLAnchorElement>('a[href]');
};

export const ExternalLinkWarningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const [pendingLink, setPendingLink] = useState<PendingExternalLink | null>(null);

  useEffect(() => {
    const handleExternalLinkClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0 && event.button !== 1) return;

      const anchor = findAnchor(event.target);
      if (!anchor) return;
      if (!isExternalHttpUrl(anchor.href)) return;

      event.preventDefault();
      event.stopPropagation();
      setPendingLink({
        url: anchor.href,
      });
    };

    document.addEventListener('click', handleExternalLinkClick, true);
    document.addEventListener('auxclick', handleExternalLinkClick, true);

    return () => {
      document.removeEventListener('click', handleExternalLinkClick, true);
      document.removeEventListener('auxclick', handleExternalLinkClick, true);
    };
  }, []);

  const handleCancel = () => {
    setPendingLink(null);
  };

  const handleContinue = () => {
    const link = pendingLink;
    setPendingLink(null);
    if (!link) return;

    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {children}
      <AlertDialog open={pendingLink !== null} onOpenChange={(open) => !open && setPendingLink(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[hsl(var(--brand))]" />
              {t('externalLinkWarning.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="themed-meta leading-relaxed">
              {t('externalLinkWarning.body')}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {pendingLink && (
            <div className="themed-card-muted p-3 text-sm">
              <div className="themed-kicker mb-2 flex items-center gap-1.5">
                <ExternalLink className="h-4 w-4 text-[hsl(var(--brand))]" />
                {t('externalLinkWarning.urlLabel')}
              </div>
              <div className="themed-code-inline break-all px-2 py-1.5 font-mono text-xs">
                {pendingLink.url}
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {t('externalLinkWarning.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleContinue}
              className="themed-primary-action"
            >
              {t('externalLinkWarning.continue')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
