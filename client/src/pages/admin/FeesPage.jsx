import React, { useEffect, useState } from 'react';
import {
  CreditCard, Plus, Search, Filter, Printer, MessageSquare,
  CheckCircle2, AlertCircle, Clock, DollarSign, X, Receipt, Download
} from 'lucide-react';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { WhatsAppShareModal } from '../../components/WhatsAppShareModal';
import { PrintHeader, PrintFooter } from '../../components/PrintHeader';
import { useAcademy } from '../../context/AcademyContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const FeesPage = () => {
  const [fees, setFees] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  // Modals
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    classId: '',
    monthYear: `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    feeType: 'Monthly Tuition Fee'
  });

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activeFeeForPayment, setActiveFeeForPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'cash',
    payment_date: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activeReceiptData, setActiveReceiptData] = useState(null);

  // WhatsApp
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState(null);

  const { academy } = useAcademy();
  const toast = useToast();

  const fetchDropdowns = async () => {
    try {
      const res = await api.get('/classes');
      if (res.data?.success) setClasses(res.data.classes || []);
    } catch (e) {}
  };

  const fetchFees = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (selectedStatus) query.append('status', selectedStatus);
      if (selectedClass) query.append('classId', selectedClass);
      if (selectedMonth) query.append('month', selectedMonth);

      const res = await api.get(`/fees?${query.toString()}`);
      if (res.data?.success) {
        setFees(res.data.fees || []);
      }
    } catch (e) {
      toast.error('Failed to load fee vouchers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchFees();
  }, [search, selectedStatus, selectedClass, selectedMonth]);

  const handleGenerateFees = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/fees/generate-monthly', generateForm);
      toast.success(res.data.message || 'Fee vouchers generated');
      setGenerateModalOpen(false);
      fetchFees();
    } catch (err) {
      toast.error('Failed to generate fees');
    }
  };

  const handleOpenPayment = (fee) => {
    setActiveFeeForPayment(fee);
    setPaymentForm({
      amount: fee.remaining_amount > 0 ? fee.remaining_amount : fee.total_amount,
      payment_method: 'cash',
      payment_date: new Date().toISOString().split('T')[0],
      remarks: ''
    });
    setPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/fees/${activeFeeForPayment.id}/payments`, paymentForm);
      toast.success('Payment recorded successfully!');
      setPaymentModalOpen(false);

      // Open receipt preview right after payment
      handleViewReceipt(activeFeeForPayment.id);
      fetchFees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    }
  };

  const handleViewReceipt = async (feeId) => {
    try {
      const res = await api.get(`/fees/${feeId}`);
      if (res.data?.success) {
        setActiveReceiptData(res.data);
        setReceiptModalOpen(true);
      }
    } catch (e) {
      toast.error('Could not fetch receipt');
    }
  };

  const handleShareWhatsAppReceipt = async (feeId) => {
    try {
      const res = await api.get(`/whatsapp/fee/${feeId}`);
      if (res.data?.success) {
        setShareData(res.data);
        setShareModalOpen(true);
      }
    } catch (e) {
      toast.error('Failed to format WhatsApp receipt');
    }
  };

  const currency = academy.currency_symbol || 'Rs.';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Fee & Revenue Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate monthly fee vouchers, accept partial payments, print invoices, and send WhatsApp receipts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Ledger</span>
          </button>

          <button
            onClick={() => setGenerateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Monthly Fees</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-surface-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between no-print">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student or roll number..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.section})</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Print Document Header */}
      <PrintHeader title="STUDENT FEE REGISTER & OUTSTANDING BALANCES" />

      {/* Fees Table */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden printable-card">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton type="table" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-surface-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Roll No</th>
                  <th className="px-5 py-3.5">Student Details</th>
                  <th className="px-5 py-3.5">Month</th>
                  <th className="px-5 py-3.5 text-right">Total Fee</th>
                  <th className="px-5 py-3.5 text-right text-emerald-600">Paid</th>
                  <th className="px-5 py-3.5 text-right text-rose-600">Remaining</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {fees.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-5 py-10 text-center text-slate-400">
                      No fee records found.
                    </td>
                  </tr>
                ) : (
                  fees.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-surface-800/40">
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                        {f.roll_number}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{f.student_name}</div>
                        <div className="text-[11px] text-slate-400">{f.class_name} ({f.section})</div>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                        {f.month_year}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-800 dark:text-white">
                        {currency} {Number(f.total_amount).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-emerald-600">
                        {currency} {Number(f.paid_amount).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-rose-600">
                        {currency} {Number(f.remaining_amount).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            f.status === 'paid'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                              : f.status === 'partial'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600'
                          }`}
                        >
                          {f.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right no-print">
                        <div className="flex items-center justify-end gap-1.5">
                          {f.status !== 'paid' && (
                            <button
                              onClick={() => handleOpenPayment(f)}
                              title="Record Payment"
                              className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm"
                            >
                              Pay
                            </button>
                          )}
                          <button
                            onClick={() => handleViewReceipt(f.id)}
                            title="Official Receipt"
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleShareWhatsAppReceipt(f.id)}
                            title="Share on WhatsApp"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PrintFooter />

      {/* Generate Monthly Vouchers Modal */}
      {generateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in no-print">
          <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">
              Generate Monthly Fee Vouchers
            </h3>

            <form onSubmit={handleGenerateFees} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Target Class (Leave empty for All Students)
                </label>
                <select
                  value={generateForm.classId}
                  onChange={(e) => setGenerateForm({ ...generateForm, classId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                >
                  <option value="">All Classes (Whole Academy)</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.section})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Fee Billing Month *
                </label>
                <input
                  type="text"
                  required
                  value={generateForm.monthYear}
                  onChange={(e) => setGenerateForm({ ...generateForm, monthYear: e.target.value })}
                  placeholder="e.g. October 2025"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={generateForm.dueDate}
                  onChange={(e) => setGenerateForm({ ...generateForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setGenerateModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md"
                >
                  Generate Vouchers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentModalOpen && activeFeeForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in no-print">
          <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Record Fee Payment</h3>
                <p className="text-xs text-slate-400">{activeFeeForPayment.student_name} ({activeFeeForPayment.roll_number})</p>
              </div>
              <button onClick={() => setPaymentModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-surface-800 rounded-2xl mb-4 text-xs flex justify-between">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Total Fee</span>
                <strong className="text-slate-800 dark:text-white">{currency} {Number(activeFeeForPayment.total_amount).toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Already Paid</span>
                <strong className="text-emerald-600">{currency} {Number(activeFeeForPayment.paid_amount).toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Remaining Due</span>
                <strong className="text-rose-600">{currency} {Number(activeFeeForPayment.remaining_amount).toLocaleString()}</strong>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Payment Amount ({currency}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={activeFeeForPayment.remaining_amount}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-base"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                >
                  <option value="cash">Cash Counter</option>
                  <option value="easypaisa">EasyPaisa</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="bank_transfer">Bank Online Transfer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={paymentForm.payment_date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Remarks / Transaction Ref
                </label>
                <input
                  type="text"
                  value={paymentForm.remarks}
                  onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                  placeholder="e.g. Paid in full / installment"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md"
                >
                  Confirm & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      {receiptModalOpen && activeReceiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 overflow-y-auto space-y-4 printable-card">
              <PrintHeader title="OFFICIAL FEE PAYMENT RECEIPT" />

              {/* In-Modal Receipt Header */}
              <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800 no-print">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white uppercase tracking-wider">
                  {academy.academy_name}
                </h3>
                <p className="text-xs text-slate-400 italic">{academy.tagline}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider rounded">
                  FEE RECEIPT VOUCHER
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-surface-800 p-4 rounded-2xl">
                <div>
                  <span className="text-slate-400 block text-[10px]">Student Name</span>
                  <strong className="text-slate-900 dark:text-white">{activeReceiptData.fee.student_name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Roll Number</span>
                  <strong className="font-mono text-slate-900 dark:text-white">{activeReceiptData.fee.roll_number}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Class & Section</span>
                  <strong className="text-slate-900 dark:text-white">{activeReceiptData.fee.class_name} ({activeReceiptData.fee.section})</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Fee Session</span>
                  <strong className="text-slate-900 dark:text-white">{activeReceiptData.fee.month_year}</strong>
                </div>
              </div>

              {/* Transactions Ledger */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payment Details</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Total Billed Fee:</span>
                    <span className="font-bold text-slate-800 dark:text-white">{currency} {Number(activeReceiptData.fee.total_amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-emerald-600 font-medium">Total Amount Paid:</span>
                    <span className="font-bold text-emerald-600">{currency} {Number(activeReceiptData.fee.paid_amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-rose-600 font-medium">Remaining Balance:</span>
                    <span className="font-bold text-rose-600">{currency} {Number(activeReceiptData.fee.remaining_amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Current Status:</span>
                    <span className="font-bold uppercase text-brand-600">{activeReceiptData.fee.status}</span>
                  </div>
                </div>
              </div>

              {/* Payments History */}
              {activeReceiptData.payments.length > 0 && (
                <div className="text-xs pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Receipt Transaction Record</span>
                  <div className="mt-1 space-y-1">
                    {activeReceiptData.payments.map((p) => (
                      <div key={p.id} className="p-2 bg-slate-50 dark:bg-surface-800 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="font-mono font-bold text-slate-800 dark:text-white">{p.receipt_number}</span>
                          <span className="text-[10px] text-slate-400 block">{new Date(p.payment_date).toLocaleDateString()} via {p.payment_method}</span>
                        </div>
                        <span className="font-bold text-emerald-600">+{currency} {Number(p.amount).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <PrintFooter />
            </div>

            <div className="p-4 bg-slate-50 dark:bg-surface-950 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center no-print">
              <button
                onClick={() => handleShareWhatsAppReceipt(activeReceiptData.fee.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Share WhatsApp</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-surface-800 border rounded-xl"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setReceiptModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold bg-slate-800 text-white rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      <WhatsAppShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareData={shareData}
        title="Share Official Fee Receipt on WhatsApp"
      />
    </div>
  );
};
