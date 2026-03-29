import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Copy, Check, ArrowRight } from 'lucide-react';

interface DonateModalProps {
  open: boolean;
  onClose: () => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const solanaAddress = 'BDyEDrsh2KNxVcxhkocgqgJ5Psxy6X7ffsmRPMfAw7G6';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(solanaAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md overflow-hidden border-gray-200 bg-white p-0 text-gray-900 shadow-xl dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 sm:rounded-xl">
        <div className="px-6 py-6 md:px-8 md:py-8">
          <DialogHeader className="mb-6 space-y-1.5 flex flex-col items-start text-left">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#14F195] to-[#9945FF]" />
              {t('donate.title')}
            </DialogTitle>
            <DialogDescription className="text-[14px] text-gray-500 dark:text-gray-400">
              {t('donate.subtitle')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5">
            <p className="text-[14px] font-normal leading-relaxed text-gray-600 dark:text-gray-300">
              {t('donate.desc')}
            </p>

            {/* Network Display */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3.5 dark:border-gray-700 dark:bg-gray-800/80">
              <div className="mb-1 flex justify-between text-[12px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <span>{t('donate.networkLabel')}</span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 font-mono text-[13px] text-gray-800 dark:text-gray-100">
                <span className="w-2 h-2 rounded-full bg-[#14F195] shadow-[0_0_4px_rgba(20,241,149,0.4)]" />
                {t('donate.networkValue')}
              </div>
            </div>

            {/* Address Field */}
            <div className="space-y-1.5">
              <label htmlFor="solana-address" className="block text-[12px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {t('donate.addressLabel')}
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-1 transition-colors focus-within:border-[#9945FF] focus-within:ring-1 focus-within:ring-[#9945FF]/20 dark:border-gray-700 dark:bg-gray-900">
                <input
                  id="solana-address"
                  value={solanaAddress}
                  readOnly
                  className="w-full select-all bg-transparent px-3 font-mono text-[13px] text-gray-700 focus:outline-none dark:text-gray-100"
                />
                <Button
                  type="button"
                  onClick={copyToClipboard}
                  className="flex h-8 w-10 shrink-0 items-center justify-center rounded border-0 bg-gray-100 px-3 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {copied ? <Check className="h-4 w-4 text-[#14F195]" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Note Section */}
            <div className="pt-2">
              <p className="text-center text-[12px] font-normal leading-relaxed text-gray-500 dark:text-gray-400">
                {t('donate.note')}
              </p>
            </div>
          </div>

          <DialogFooter className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 dark:border-gray-800 sm:flex-row sm:justify-between sm:gap-0">
            <Button
              variant="ghost"
              onClick={onClose}
              className="h-10 rounded-lg px-4 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
            >
              {t('donate.close')}
            </Button>
            <Button
              onClick={() => window.open('https://solana.com', '_blank', 'noopener,noreferrer')}
              className="group flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 text-sm font-medium text-gray-900 shadow-sm transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 sm:w-auto"
            >
              <span className="bg-gradient-to-r from-[#14F195] to-[#9945FF] bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
                {t('donate.learn')}
              </span>
              <ArrowRight className="h-4 w-4 text-[#9945FF]/70" />
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
