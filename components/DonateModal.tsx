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
import { X, Copy, Check, Heart } from 'lucide-react';

// 捐赠弹窗：展示 Solana 地址并提供一键复制。
// Donate modal: shows a Solana address with one-click copy.
interface DonateModalProps {
  open: boolean;
  onClose: () => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  // 地址为只读展示；更换时只需更新此常量。
  // Address is read-only; update here when rotated.
  const solanaAddress = 'BDyEDrsh2KNxVcxhkocgqgJ5Psxy6X7ffsmRPMfAw7G6';

  const copyToClipboard = () => {
    // 复制后短暂展示成功图标，提升反馈感。
    // After copy, show a short success state for feedback.
    navigator.clipboard.writeText(solanaAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-[#ff6600]" />
            {t('donate.title')}
          </DialogTitle>
          <DialogDescription>{t('donate.subtitle')}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <p className="text-sm text-slate-700 leading-relaxed">
            {t('donate.desc')}
          </p>

          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {t('donate.networkLabel')}
            </div>
            <div className="mt-1 font-mono text-sm text-slate-700">
              {t('donate.networkValue')}
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="solana-address" className="text-sm font-medium leading-none text-slate-600">
              {t('donate.addressLabel')}
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="solana-address"
                value={solanaAddress}
                readOnly
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono text-xs bg-slate-50 text-slate-600 select-all"
              />
              <Button
                type="button"
                variant="outline"
                onClick={copyToClipboard}
                className="px-3 shrink-0 w-12"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-100">
            <p className="text-[11px] text-slate-500 italic text-center">
              {t('donate.note')}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            {t('donate.close')}
          </Button>
          <Button variant="blue" onClick={() => window.open('https://solana.com', '_blank')}>
            {t('donate.learn')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
