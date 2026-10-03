import React, { useState } from 'react';
import { X, Send, Copy, Check, MessageSquare, Phone } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const WhatsAppShareModal = ({ isOpen, onClose, shareData, title = 'Share on WhatsApp' }) => {
  const [copied, setCopied] = useState(false);
  const [phone, setPhone] = useState(shareData?.targetPhone || '');
  const toast = useToast();

  if (!isOpen || !shareData) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareData.messageText);
    setCopied(true);
    toast.success('Message text copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    let url = '';
    if (cleanPhone) {
      url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(shareData.messageText)}`;
    } else {
      url = `https://wa.me/?text=${encodeURIComponent(shareData.messageText)}`;
    }
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="text-xs text-emerald-100">Live preview & direct WhatsApp message link</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Recipient Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Recipient WhatsApp Number (Optional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 923001234567 (with country code)"
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              If left blank, WhatsApp will open allowing you to pick any contact or group.
            </p>
          </div>

          {/* Formatted Message Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Formatted Message Preview
            </label>
            <div className="bg-[#0b141a] text-[#e9edef] p-4 rounded-xl border border-slate-700/50 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto selection:bg-emerald-600 shadow-inner">
              {shareData.messageText}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-surface-950 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-surface-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-surface-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <button
            type="button"
            onClick={handleSend}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-xl shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Open in WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
