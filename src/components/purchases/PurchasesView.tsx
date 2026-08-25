import React, { useState } from 'react';
import {
  Plus,
  Search,
  ScanLine,
  FileCheck2,
  AlertCircle,
  Eye,
  X,
  UploadCloud,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { formatINR, formatDate } from '../../utils/formatters';
import { PurchaseBill, PurchaseBillStatus } from '../../types';

interface PurchasesViewProps {
  navigate: (route: string) => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({ navigate }) => {
  const { purchaseBills, vendors, addPurchaseBill, updatePurchaseBillStatus, currentOrg } = useAccounting();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedBill, setSelectedBill] = useState<PurchaseBill | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isOcrScanning, setIsOcrScanning] = useState(false);
  const [isSubmittingBill, setIsSubmittingBill] = useState(false);

  // New Purchase Bill form
  const [billNumber, setBillNumber] = useState('BL-9921');
  const [selectedVendorId, setSelectedVendorId] = useState(vendors[0]?.id || '');
  const [date, setDate] = useState('2026-08-07');
  const [dueDate, setDueDate] = useState('2026-09-06');
  const [taxableAmount, setTaxableAmount] = useState('45000');
  const [gstRate, setGstRate] = useState('18');
  const [itcEligible, setItcEligible] = useState(true);

  // Simulated OCR autofill demo
  const handleSimulateOcr = () => {
    setIsOcrScanning(true);
    setTimeout(() => {
      setIsOcrScanning(false);
      setBillNumber('OCR-INV-7712');
      if (vendors.length > 1) {
        setSelectedVendorId(vendors[1].id);
      }
      setTaxableAmount('84500');
      setGstRate('18');
      setDate('2026-08-06');
      setDueDate('2026-09-05');
      setItcEligible(true);
    }, 900);
  };

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingBill) return;
    setIsSubmittingBill(true);

    setTimeout(() => {
      const vendor = vendors.find((v) => v.id === selectedVendorId) || vendors[0];
      const taxable = parseFloat(taxableAmount) || 0;
      const rate = parseFloat(gstRate) || 0;
      const totalGst = (taxable * rate) / 100;
      const cgst = Math.round(totalGst / 2);
      const sgst = Math.round(totalGst / 2);
      const totalAmount = taxable + totalGst;

      addPurchaseBill({
        billNumber,
        vendorId: vendor.id,
        vendorName: vendor.name,
        vendorGstin: vendor.gstin,
        date,
        dueDate,
        items: [
          {
            id: `p_item_${Date.now()}`,
            description: 'Industrial Inward Material Purchase',
            hsn: '7208',
            quantity: 1,
            unit: 'SET',
            rate: taxable,
            discountPct: 0,
            gstRate: rate,
            amount: taxable,
            cgst,
            sgst,
            igst: 0,
          },
        ],
        taxableAmount: taxable,
        cgst,
        sgst,
        igst: 0,
        totalAmount,
        amountPaid: 0,
        status: 'Received',
        itcEligible,
      });

      setIsSubmittingBill(false);
      setIsRecordModalOpen(false);
      setBillNumber(`BL-${Math.floor(1000 + Math.random() * 9000)}`);
    }, 450);
  };

  const totalPurchases = purchaseBills.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalItc = purchaseBills
    .filter((b) => b.itcEligible)
    .reduce((sum, b) => sum + b.cgst + b.sgst + b.igst, 0);

  const filteredBills = purchaseBills.filter((b) => {
    if (statusFilter !== 'All' && b.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.billNumber.toLowerCase().includes(q) ||
        b.vendorName.toLowerCase().includes(q) ||
        b.vendorGstin.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 p-6 rounded-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-950 tracking-tight">
            Purchases & Vendor Inwarding
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Vendor tax invoices, GSTR-2B Input Tax Credit (ITC) reconciliation & Payables
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsRecordModalOpen(true);
              handleSimulateOcr();
            }}
            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold px-3.5 py-2 rounded-xs flex items-center gap-1.5 transition-colors"
          >
            <ScanLine size={14} className="text-slate-700" />
            <span>Bill Ingestion (OCR)</span>
          </button>
          <button
            onClick={() => setIsRecordModalOpen(true)}
            id="record-vendor-bill-btn"
            className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xs flex items-center gap-2 transition-colors"
          >
            <Plus size={14} />
            <span>Record Vendor Bill</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xs">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Total Purchases (FY)
          </div>
          <div className="text-xl font-bold font-mono text-slate-950 mt-1.5">
            {formatINR(totalPurchases, false)}
          </div>
          <div className="mt-1 text-[10px] font-mono text-slate-500">
            {purchaseBills.length} inward bills registered
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xs">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Claimable ITC (Tax Credit)
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-1.5">
            {formatINR(totalItc, false)}
          </div>
          <div className="mt-1 text-[10px] font-mono text-emerald-700 font-semibold">
            Eligible under Sec 16(2)
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xs">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Payables to Settle
          </div>
          <div className="text-xl font-bold font-mono text-slate-950 mt-1.5">
            {formatINR(totalPurchases - 350000, false)}
          </div>
          <div className="mt-1 text-[10px] font-mono text-slate-600">
            Credit period active
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xs">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            GSTR-2B Matching
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-1.5">
            100% Matched
          </div>
          <div className="mt-1 text-[10px] font-mono text-slate-500">
            No 2B discrepancy detected
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white border border-slate-200 rounded-xs p-4 space-y-4">
        <div className="flex items-center gap-1 border-b border-slate-200 pb-3 overflow-x-auto">
          {['All', 'Received', 'Paid', 'Partially Paid', 'Overdue'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-xs font-mono rounded-xs transition-colors whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-slate-900 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 relative max-w-md">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by bill number, vendor, GSTIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900"
            />
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Showing {filteredBills.length} purchase vouchers
          </div>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white border border-slate-200 rounded-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left swiss-table border-collapse">
            <thead>
              <tr>
                <th className="w-28">Bill No</th>
                <th>Vendor & GSTIN</th>
                <th className="w-24">Bill Date</th>
                <th className="w-24">Due Date</th>
                <th className="text-right w-28">Taxable Amt</th>
                <th className="text-right w-24">GST Tax</th>
                <th className="text-right w-32">Total Bill</th>
                <th className="text-center w-28">ITC Status</th>
                <th className="text-center w-24">Status</th>
                <th className="text-right w-16"></th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => setSelectedBill(b)}
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <td className="font-mono font-bold text-slate-900 whitespace-nowrap">
                    {b.billNumber}
                  </td>
                  <td className="text-xs">
                    <div className="font-semibold text-slate-900">{b.vendorName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      GSTIN: {b.vendorGstin}
                    </div>
                  </td>
                  <td className="font-mono text-slate-600 whitespace-nowrap text-xs">
                    {formatDate(b.date)}
                  </td>
                  <td className="font-mono text-slate-600 whitespace-nowrap text-xs">
                    {formatDate(b.dueDate)}
                  </td>
                  <td className="text-right font-mono text-slate-700 whitespace-nowrap">
                    {formatINR(b.taxableAmount)}
                  </td>
                  <td className="text-right font-mono text-slate-600 whitespace-nowrap text-xs">
                    {formatINR(b.cgst + b.sgst + b.igst)}
                  </td>
                  <td className="text-right font-mono font-bold text-slate-950 whitespace-nowrap">
                    {formatINR(b.totalAmount)}
                  </td>
                  <td className="text-center whitespace-nowrap">
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-mono rounded-xs font-semibold ${
                        b.itcEligible
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {b.itcEligible ? 'ITC Eligible' : 'Ineligible'}
                    </span>
                  </td>
                  <td className="text-center whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono rounded-xs font-semibold ${
                        b.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBill(b);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-900"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Purchase Bill Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-xs shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-950 tracking-tight">
                  Inward Vendor Bill & Purchase Voucher
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Record purchase invoice to claim Input Tax Credit (ITC)
                </p>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1 rounded-xs hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* OCR Progress Banner if running */}
            {isOcrScanning && (
              <div className="p-3 bg-slate-100 border-b border-slate-200 text-slate-900 text-xs flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin shrink-0" />
                <span>Reading vendor invoice data & HSN classification...</span>
              </div>
            )}

            <form onSubmit={handleCreateBill} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Vendor Bill / Ref No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={billNumber}
                    onChange={(e) => setBillNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xs font-mono font-bold focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Select Supplier / Vendor *
                  </label>
                  <select
                    value={selectedVendorId}
                    onChange={(e) => setSelectedVendorId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900 bg-white"
                  >
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.gstin})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Bill Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xs font-mono focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Payment Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xs font-mono focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Taxable Material Cost (INR ₹) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={taxableAmount}
                    onChange={(e) => setTaxableAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xs font-mono focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Applicable GST Rate *
                  </label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xs font-mono focus:outline-none focus:border-slate-900 bg-white"
                  >
                    <option value="0">0% (Nil Rated)</option>
                    <option value="5">5% (CGST 2.5% + SGST 2.5%)</option>
                    <option value="12">12% (CGST 6% + SGST 6%)</option>
                    <option value="18">18% (CGST 9% + SGST 9%)</option>
                    <option value="28">28% (CGST 14% + SGST 14%)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xs">
                <input
                  type="checkbox"
                  id="itc-check"
                  checked={itcEligible}
                  onChange={(e) => setItcEligible(e.target.checked)}
                  className="rounded-xs text-slate-900 focus:ring-0"
                />
                <label htmlFor="itc-check" className="font-mono text-slate-800 cursor-pointer">
                  Eligible for GSTR-3B Input Tax Credit (ITC) claim
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xs hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBill}
                  className="px-5 py-2 bg-slate-950 disabled:opacity-50 text-white hover:bg-slate-800 rounded-xs font-semibold flex items-center gap-2"
                >
                  {isSubmittingBill ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Posting Bill...</span>
                    </>
                  ) : (
                    <span>Inward Bill to Ledger</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bill View Drawer */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-2xs"
            onClick={() => setSelectedBill(null)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-mono uppercase">
                    Purchase Bill • {selectedBill.billNumber}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Inwarded on {formatDate(selectedBill.date)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBill(null)}
                  className="p-1 rounded-xs hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-5 text-xs">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xs">
                  <div className="text-[11px] text-slate-400 uppercase font-mono">
                    Total Inward Bill Value
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-950 mt-1">
                    {formatINR(selectedBill.totalAmount)}
                  </div>
                  <div className="mt-1 text-slate-600 text-xs font-semibold">
                    {selectedBill.vendorName}
                  </div>
                </div>

                <div className="space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-sans">Vendor GSTIN:</span>
                    <span className="font-bold text-slate-900">{selectedBill.vendorGstin}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-sans">Taxable Base:</span>
                    <span className="text-slate-900">{formatINR(selectedBill.taxableAmount)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-sans">CGST + SGST:</span>
                    <span className="text-slate-900">{formatINR(selectedBill.cgst + selectedBill.sgst)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-sans">Payment Due Date:</span>
                    <span className="text-slate-900">{formatDate(selectedBill.dueDate)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-sans">ITC Eligibility:</span>
                    <span className="font-bold text-emerald-700">
                      {selectedBill.itcEligible ? 'Eligible for Tax Credit' : 'Ineligible'}
                    </span>
                  </div>
                </div>

                {/* Journal entry representation */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="text-[11px] font-bold uppercase font-mono text-slate-500 mb-2">
                    Ledger Journal Entry
                  </div>
                  <div className="bg-slate-900 text-slate-200 p-3 rounded-xs font-mono text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span>Dr. Purchase Account</span>
                      <span>{formatINR(selectedBill.taxableAmount)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>Dr. Input Tax Credit (ITC) CGST/SGST</span>
                      <span>{formatINR(selectedBill.cgst + selectedBill.sgst)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 pl-4 border-t border-slate-800 pt-1">
                      <span>Cr. {selectedBill.vendorName} Ledger</span>
                      <span>{formatINR(selectedBill.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <button
                  onClick={() => updatePurchaseBillStatus(selectedBill.id, 'Paid')}
                  className="px-3 py-1.5 bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold rounded-xs"
                >
                  Mark as Paid
                </button>
                <button
                  onClick={() => setSelectedBill(null)}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-xs text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
