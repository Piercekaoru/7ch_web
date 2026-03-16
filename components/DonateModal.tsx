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
import { Copy, Check, ArrowRight, Wallet } from 'lucide-react';

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
      <DialogContent className="max-w-md bg-white border-gray-200 text-gray-900 shadow-xl p-0 overflow-hidden sm:rounded-xl">
        <div className="px-6 py-6 md:px-8 md:py-8">
          <DialogHeader className="mb-6 space-y-1.5 flex flex-col items-start text-left">
            <DialogTitle className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#14F195] to-[#9945FF]" />
              {t('donate.title')}
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-[14px]">
              {t('donate.subtitle')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5">
            <p className="text-[14px] text-gray-600 leading-relaxed font-normal">
              {t('donate.desc')}
            </p>

            {/* Network Display */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-3.5">
              <div className="text-[12px] font-bold text-gray-500 mb-1 flex justify-between uppercase tracking-wider">
                <span>{t('donate.networkLabel')}</span>
              </div>
              <div className="font-mono text-[13px] text-gray-800 flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#14F195] shadow-[0_0_4px_rgba(20,241,149,0.4)]" />
                {t('donate.networkValue')}
              </div>
            </div>

            {/* Address Field */}
            <div className="space-y-1.5">
              <label htmlFor="solana-address" className="text-[12px] font-bold text-gray-500 block uppercase tracking-wider">
                {t('donate.addressLabel')}
              </label>
              <div className="flex items-center gap-2 bg-white border border-gray-300 p-1 rounded-lg transition-colors focus-within:border-[#9945FF] focus-within:ring-1 focus-within:ring-[#9945FF]/20">
                <input
                  id="solana-address"
                  value={solanaAddress}
                  readOnly
                  className="bg-transparent w-full text-gray-700 font-mono text-[13px] px-3 focus:outline-none select-all"
                />
                <Button
                  type="button"
                  onClick={copyToClipboard}
                  className="px-3 shrink-0 w-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors border-0 flex items-center justify-center h-8"
                >
                  {copied ? <Check className="h-4 w-4 text-[#14F195]" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Note Section */}
            <div className="pt-2">
              <p className="text-[12px] text-gray-500 text-center font-normal leading-relaxed">
                {t('donate.note')}
              </p>
            </div>
          </div>

          <DialogFooter className="mt-8 pt-5 flex flex-col-reverse sm:flex-row sm:justify-between gap-3 sm:gap-0 border-t border-gray-100">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-medium rounded-lg h-10 px-4 transition-colors text-sm"
            >
              {t('donate.close')}
            </Button>
            <Button
              onClick={() => window.open('https://solana.com', '_blank')}
              className="bg-white text-gray-900 hover:bg-gray-50 border border-gray-200 shadow-sm font-medium h-10 px-5 rounded-lg flex items-center justify-center gap-2 transition-all w-full sm:w-auto text-sm group"
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
