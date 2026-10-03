import React from 'react';
import { useAcademy } from '../context/AcademyContext';
import { GraduationCap } from 'lucide-react';

export const PrintHeader = ({ title = 'OFFICIAL DOCUMENT', documentNumber = '' }) => {
  const { academy } = useAcademy();

  return (
    <div className="print-only hidden mb-8 border-b-2 border-slate-900 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {academy.logo_url ? (
            <img src={academy.logo_url} alt="Logo" className="w-16 h-16 object-contain" />
          ) : (
            <div className="w-16 h-16 bg-slate-900 text-white rounded-xl flex items-center justify-center">
              <GraduationCap className="w-9 h-9" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold uppercase tracking-wide text-slate-900">{academy.academy_name}</h1>
            <p className="text-xs text-slate-600 italic">{academy.tagline}</p>
            <p className="text-xs text-slate-600 mt-1">{academy.address} | Ph: {academy.phone}</p>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded">
            {title}
          </span>
          {documentNumber && (
            <p className="text-xs font-mono font-semibold text-slate-700 mt-1">Ref: {documentNumber}</p>
          )}
          <p className="text-xs text-slate-500 mt-1">Date: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export const PrintFooter = () => {
  return (
    <div className="print-only hidden mt-16 pt-8 border-t border-slate-300">
      <div className="flex justify-between items-end text-xs text-slate-600">
        <div>
          <p className="font-semibold">System Generated Document</p>
          <p className="text-[10px] text-slate-400">Verified via Academic Management Portal</p>
        </div>
        <div className="text-center">
          <div className="w-48 border-b border-slate-900 mb-1"></div>
          <p className="font-semibold text-slate-800">Authorized Signature & Stamp</p>
        </div>
      </div>
    </div>
  );
};
