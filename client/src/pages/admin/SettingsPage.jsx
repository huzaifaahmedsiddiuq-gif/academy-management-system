import React, { useState } from 'react';
import { Settings, Save, School, Phone, Mail, MapPin, DollarSign, Calendar, MessageSquare, Sparkles } from 'lucide-react';
import { useAcademy } from '../../context/AcademyContext';
import { useToast } from '../../context/ToastContext';

export const SettingsPage = () => {
  const { academy, updateAcademy } = useAcademy();
  const [form, setForm] = useState({ ...academy });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAcademy(form);
      toast.success('Academy settings & branding updated dynamically across the entire software!');
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Academy Configuration & Identity
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Customize your institution name, contact details, currency, and branding dynamically across all portals, receipts, prints, and WhatsApp messages.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm space-y-6">
        {/* Live Preview Card */}
        <div className="p-4 bg-gradient-to-r from-brand-900 to-indigo-950 rounded-2xl text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-xl">
              <School className="w-6 h-6 text-brand-300" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-300">Live Branding Preview</span>
              <h3 className="font-extrabold text-lg leading-tight">{form.academy_name}</h3>
              <p className="text-xs text-slate-300 italic">{form.tagline}</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-mono font-bold">
            {form.currency_symbol} Currency
          </span>
        </div>

        {/* Core Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Academy Official Name *
            </label>
            <input
              type="text"
              name="academy_name"
              required
              value={form.academy_name}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Motto / Tagline
            </label>
            <input
              type="text"
              name="tagline"
              value={form.tagline}
              onChange={handleChange}
              placeholder="e.g. Empowering Excellence"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Contact Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+92 300 1234567"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Official WhatsApp Number (without +)
            </label>
            <input
              type="text"
              name="whatsapp_number"
              value={form.whatsapp_number}
              onChange={handleChange}
              placeholder="923001234567"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@academy.edu"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Active Academic Session / Year
            </label>
            <input
              type="text"
              name="academic_year"
              value={form.academic_year}
              onChange={handleChange}
              placeholder="2026"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Currency Symbol
            </label>
            <input
              type="text"
              name="currency_symbol"
              value={form.currency_symbol}
              onChange={handleChange}
              placeholder="Rs. or $ or PKR"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Logo Image URL (Transparent PNG recommended)
            </label>
            <input
              type="url"
              name="logo_url"
              value={form.logo_url}
              onChange={handleChange}
              placeholder="https://.../logo.png"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 text-xs">
            Campus Physical Address (Printed on Receipts and Official Documents)
          </label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Plot #, Street, Block, City"
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating System...' : 'Save & Propagate Everywhere'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
