import React, { useEffect, useState } from 'react';
import { CreditCard, DollarSign, Calendar, CheckCircle2, AlertCircle, Clock, Printer, Download, MessageSquare, FileText, ChevronRight } from 'lucide-react';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { PrintHeader, PrintFooter } from '../../components/PrintHeader';
import { WhatsAppShareModal } from '../../components/WhatsAppShareModal';
import { StatCard } from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import { useAcademy } from '../../context/AcademyContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const StudentFees = () => {
  const { user } = useAuth();
  const { academy } = useAcademy();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [fees, setFees] = useState([]);
  const [selectedFee, setSelectedFee] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  // WhatsApp
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState(null);

  const studentId = user?.studentId || user?.student?.id;
  const currency = academy.currency_symbol || 'Rs.';

  const fetchFeeLedger = async () => {
    if (!studentId) return;
    try {
      setLoading(true);
      const res = await api.get(`/fees/student/${studentId}`);
      if (res.data?.success) {
        setFees(res.data.fees || []);
      }
    } catch (e) {
      toast.error('Failed to load fee statement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeLedger();
  }, [studentId]);

  // Aggregates
  const totalBilled = fees.reduce((sum, f) => sum + Number(f.total_amount || 0), 0);
  const totalPaid = fees.reduce((sum, f) => sum + Number(f.paid_amount || 0), 0);
  const totalOutstanding = fees.reduce((sum, f) => sum + Number(f.remaining_amount || 0), 0);
  const pendingCount = fees.filter(f => f.status !== 'paid').length;

  const handleOpenReceipt = (fee) => {
    setSelectedFee(fee);
    setReceiptModalOpen(true);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleDownloadPDF = (fee) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(academy.academy_name, 14, 20);
      doc.setFontSize(12);
      doc.text('OFFICIAL STUDENT FEE RECEIPT & STATEMENT', 14, 28);
      doc.text(`Student: ${user?.student?.full_name || user?.username} | Roll No: ${user?.student?.roll_number || 'N/A'}`, 14, 35);
      doc.text(`Class: ${user?.student?.class_name || 'Enrolled'} | Period: ${fee.month_year}`, 14, 42);

      const tableData = [
        ['Fee Particular', fee.fee_type || 'Tuition Fee'],
        ['Billing Period', fee.month_year],
        ['Due Date', new Date(fee.due_date).toLocaleDateString()],
        ['Total Assessment', `${currency} ${Number(fee.total_amount).toLocaleString()}`],
        ['Amount Paid', `${currency} ${Number(fee.paid_amount).toLocaleString()}`],
        ['Remaining Balance', `${currency} ${Number(fee.remaining_amount).toLocaleString()}`],
        ['Current Status', (fee.status || 'UNPAID').toUpperCase()]
      ];

      doc.autoTable({
        startY: 48,
        head: [['Field', 'Description / Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] }
      });

      doc.save(`FeeReceipt_${user?.username}_${fee.month_year}.pdf`);
      toast.success('Fee receipt PDF downloaded!');
    } catch (e) {
      toast.error('Failed to generate PDF');
    }
  };

  const handleOpenWhatsApp = (fee) => {
    setShareData({
      type: 'fee',
      data: {
        student_name: user?.student?.full_name || user?.username,
        roll_number: user?.student?.roll_number || 'N/A',
        class_name: user?.student?.class_name || 'Assigned Class',
        month_year: fee.month_year,
        total_amount: fee.total_amount,
        paid_amount: fee.paid_amount,
        remaining_amount: fee.remaining_amount,
        status: fee.status,
        guardian_phone: user?.student?.phone || academy.phone
      }
    });
    setShareModalOpen(true);
  };

  if (loading) return <LoadingSkeleton count={3} type="card" />;

  return (
    <div className="space-y-6 animate-in fade-in">
      <PrintHeader
        title="Student Fee Statement"
        subtitle={`Voucher Ledger & Payment History • ${academy.academic_year || '2025-2026'}`}
      />

      {/* Screen Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-emerald-600" />
            Fee Billing & Payment Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access transparent payment records, tuition dues, and official computerized fee vouchers.
          </p>
        </div>

        <button
          onClick={handlePrintReceipt}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 transition-all shadow-sm self-start md:self-auto"
        >
          <Printer className="w-3.5 h-3.5" />
          Print Ledger
        </button>
      </div>

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Billed"
          value={`${currency} ${totalBilled.toLocaleString()}`}
          icon={CreditCard}
          color="indigo"
          subtext="Cumulative academic dues"
        />
        <StatCard
          title="Total Cleared"
          value={`${currency} ${totalPaid.toLocaleString()}`}
          icon={CheckCircle2}
          color="emerald"
          subtext="Verified received payments"
        />
        <StatCard
          title="Outstanding Balance"
          value={`${currency} ${totalOutstanding.toLocaleString()}`}
          icon={DollarSign}
          color={totalOutstanding > 0 ? 'rose' : 'emerald'}
          subtext={totalOutstanding > 0 ? `${pendingCount} voucher(s) pending` : 'All dues cleared'}
        />
        <StatCard
          title="Account Status"
          value={totalOutstanding === 0 ? 'Good Standing' : 'Dues Pending'}
          icon={Clock}
          color={totalOutstanding === 0 ? 'emerald' : 'amber'}
          subtext={academy.academy_name}
        />
      </div>

      {/* Fee Statement Table */}
      <div className="bg-white dark:bg-surface-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden printable-card">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Fee Vouchers & Invoices</h3>
          <p className="text-xs text-slate-400">Chronological history of tuition bills and payment receipts</p>
        </div>

        {fees.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No fee invoices issued yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-surface-800/60 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Fee Type</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Paid Amount</th>
                  <th className="py-3 px-4">Remaining</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {fees.map((f, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-surface-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {f.month_year}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {f.fee_type || 'Tuition Fee'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {currency} {Number(f.total_amount).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {currency} {Number(f.paid_amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                      {currency} {Number(f.remaining_amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(f.due_date).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          f.status === 'paid'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                            : f.status === 'partial'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right no-print">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenReceipt(f)}
                          title="View Receipt"
                          className="p-1.5 text-slate-600 hover:text-brand-600 bg-slate-100 hover:bg-brand-50 rounded-lg transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(f)}
                          title="Download PDF"
                          className="p-1.5 text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenWhatsApp(f)}
                          title="Share on WhatsApp"
                          className="p-1.5 text-slate-600 hover:text-emerald-600 bg-slate-100 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PrintFooter />

      {/* Official Receipt Modal */}
      {receiptModalOpen && selectedFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-surface-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 max-w-lg w-full shadow-2xl relative">
            <PrintHeader
              title="Official Fee Receipt Voucher"
              subtitle={`Receipt No: REC-${selectedFee.id}-${Date.now().toString().slice(-4)}`}
            />

            <div className="space-y-4 my-6 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Student Name:</span>
                <span className="font-bold text-slate-800 dark:text-white">{user?.student?.full_name || user?.username}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Roll Number:</span>
                <span className="font-bold font-mono text-slate-800 dark:text-white">{user?.student?.roll_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Billing Period:</span>
                <span className="font-bold text-slate-800 dark:text-white">{selectedFee.month_year}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Assessment Total:</span>
                <span className="font-black text-slate-900 dark:text-white">{currency} {Number(selectedFee.total_amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="font-black text-emerald-600">{currency} {Number(selectedFee.paid_amount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Balance Remaining:</span>
                <span className="font-black text-rose-600">{currency} {Number(selectedFee.remaining_amount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold uppercase tracking-wider text-brand-600">{selectedFee.status}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 no-print">
              <button
                type="button"
                onClick={() => setReceiptModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-surface-800 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => handleDownloadPDF(selectedFee)}
                className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl"
              >
                PDF
              </button>
              <button
                onClick={handlePrintReceipt}
                className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md shadow-brand-500/20"
              >
                Print Voucher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {shareModalOpen && shareData && (
        <WhatsAppShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          shareType={shareData.type}
          data={shareData.data}
        />
      )}
    </div>
  );
};
