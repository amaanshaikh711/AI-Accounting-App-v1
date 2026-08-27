import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Receipt,
  FileText,
  Printer,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  Send,
  Building,
  User
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { formatINR, formatDate, numberToWordsIndian } from '../../utils/formatters';
import { Invoice, InvoiceItem, InvoiceStatus } from '../../types';
import { InvoiceRenderer } from '../invoices/templates/InvoiceRenderer';
import { InvoiceTemplateId, InvoiceFormData } from '../invoices/types';
import { INVOICE_TEMPLATES, recalculateInvoice } from '../invoices/mockInvoiceData';

interface SalesViewProps {
  navigate: (route: string) => void;
}

export const SalesView: React.FC<SalesViewProps> = ({ navigate }) => {
  const { invoices, customers, addInvoice, updateInvoiceStatus, currentOrg } = useAccounting();

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [drawerTemplateId, setDrawerTemplateId] = useState<InvoiceTemplateId>('classic');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false);

  // New Invoice Form State
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-2026-${1029 + invoices.length}`);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [invoiceDate, setInvoiceDate] = useState('2026-08-08');
  const [dueDate, setDueDate] = useState('2026-09-07');
  const [isInterstate, setIsInterstate] = useState(false);
  const [notes, setNotes] = useState('Payment terms: Net 30 days. Please remit via RTGS/NEFT to HDFC Bank A/c #0060.');

  const selectedCustomerObj = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'item_1',
      description: 'Industrial Precision Spindle Assembly',
      hsn: '8466',
      quantity: 1,
      unit: 'NOS',
      rate: 45000,
      discountPct: 0,
      gstRate: 18,
      amount: 45000,
      cgst: 4050,
      sgst: 4050,
      igst: 0,
    },
  ]);

  // Recalculate line items
  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const discount = Number(item.discountPct) || 0;
    const gstRate = Number(item.gstRate) || 0;

    const base = qty * rate;
    const discounted = base - (base * discount) / 100;
    item.amount = discounted;

    if (isInterstate) {
      item.cgst = 0;
      item.sgst = 0;
      item.igst = Math.round((discounted * gstRate) / 100);
    } else {
      const tax = (discounted * gstRate) / 100;
      item.cgst = Math.round(tax / 2);
      item.sgst = Math.round(tax / 2);
      item.igst = 0;
    }

    updated[index] = item;
    setItems(updated);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: `item_${Date.now()}`,
        description: '',
        hsn: '9987',
        quantity: 1,
        unit: 'NOS',
        rate: 0,
        discountPct: 0,
        gstRate: 18,
        amount: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Calculations for total invoice
  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.rate)), 0);
  const taxableAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const totalDiscount = subtotal - taxableAmount;
  const totalCgst = items.reduce((sum, item) => sum + item.cgst, 0);
  const totalSgst = items.reduce((sum, item) => sum + item.sgst, 0);
  const totalIgst = items.reduce((sum, item) => sum + item.igst, 0);
  const totalInvoiceAmount = taxableAmount + totalCgst + totalSgst + totalIgst;

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingInvoice) return;
    setIsSubmittingInvoice(true);

    setTimeout(() => {
      const cust = customers.find((c) => c.id === selectedCustomerId) || customers[0];

      addInvoice({
        invoiceNumber,
        customerId: cust.id,
        customerName: cust.name,
        customerGstin: cust.gstin,
        date: invoiceDate,
        dueDate,
        items,
        subtotal,
        discount: totalDiscount,
        taxableAmount,
        cgst: totalCgst,
        sgst: totalSgst,
        igst: totalIgst,
        totalAmount: totalInvoiceAmount,
        amountPaid: 0,
        status: 'Sent',
        notes,
      });

      setIsSubmittingInvoice(false);
      setIsCreateModalOpen(false);
      setInvoiceNumber(`INV-2026-${1030 + invoices.length}`);
    }, 450);
  };

  // Metrics
  const totalSales = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const paidSales = invoices
    .filter((i) => i.status === 'Paid')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);
  const outstandingSales = invoices
    .filter((i) => i.status === 'Sent' || i.status === 'Partially Paid' || i.status === 'Overdue')
    .reduce((sum, inv) => sum + (inv.totalAmount - inv.amountPaid), 0);
  const overdueSales = invoices
    .filter((i) => i.status === 'Overdue')
    .reduce((sum, inv) => sum + (inv.totalAmount - inv.amountPaid), 0);

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter !== 'All' && inv.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.customerGstin.toLowerCase().includes(q)
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
            Sales & Invoicing Workspace
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Generate GST-compliant tax invoices, track credit terms, and manage receivables
          </p>
        </div>

        <button
          onClick={() => navigate('/sales/create-invoice')}
          id="create-invoice-btn"
          className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xs flex items-center gap-2 transition-colors shadow-xs"
        >
          <Plus size={14} />
          <span>Generate Tax Invoice</span>
        </button>
      </div>

      {/* Sales Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xs">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Total Invoiced
          </div>
          <div className="text-xl font-bold font-mono text-slate-950 mt-1.5">
            {formatINR(totalSales, false)}
          </div>
          <div className="mt-1 text-[10px] font-mono text-slate-500">
            {invoices.length} invoices generated
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xs">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Outstanding Balance
          </div>
          <div className="text-xl font-bold font-mono text-slate-950 mt-1.5">
            {formatINR(outstandingSales, false)}
          </div>
          <div className="mt-1 text-[10px] font-mono text-amber-700 font-medium">
            Active credit receivables
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xs">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Paid & Settled
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-1.5">
            {formatINR(paidSales, false)}
          </div>
          <div className="mt-1 text-[10px] font-mono text-emerald-700">
            Bank reconciliations matched
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xs">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Overdue Receivables
          </div>
          <div className="text-xl font-bold font-mono text-red-700 mt-1.5">
            {formatINR(overdueSales, false)}
          </div>
          <div className="mt-1 text-[10px] font-mono text-red-700 font-bold">
            Requires immediate collection
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white border border-slate-200 rounded-xs p-4 space-y-4">
        <div className="flex items-center gap-1 border-b border-slate-200 pb-3 overflow-x-auto">
          {['All', 'Sent', 'Paid', 'Partially Paid', 'Overdue', 'Draft'].map((tab) => (
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
              placeholder="Search invoice number, client name, GSTIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900"
            />
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Showing {filteredInvoices.length} invoices
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-slate-200 rounded-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left swiss-table border-collapse">
            <thead>
              <tr>
                <th className="w-32">Invoice No</th>
                <th>Customer & GSTIN</th>
                <th className="w-24">Date</th>
                <th className="w-24">Due Date</th>
                <th className="text-right w-28">Taxable Amt</th>
                <th className="text-right w-24">GST</th>
                <th className="text-right w-32">Total Amount</th>
                <th className="text-center w-28">Status</th>
                <th className="text-right w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs font-mono">
                    No invoices found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <td className="font-mono font-bold text-slate-900 whitespace-nowrap">
                      {inv.invoiceNumber}
                    </td>
                    <td className="text-xs">
                      <div className="font-semibold text-slate-900">{inv.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        GSTIN: {inv.customerGstin}
                      </div>
                    </td>
                    <td className="font-mono text-slate-600 whitespace-nowrap text-xs">
                      {formatDate(inv.date)}
                    </td>
                    <td className="font-mono text-slate-600 whitespace-nowrap text-xs">
                      {formatDate(inv.dueDate)}
                    </td>
                    <td className="text-right font-mono text-slate-700 whitespace-nowrap">
                      {formatINR(inv.taxableAmount)}
                    </td>
                    <td className="text-right font-mono text-slate-600 whitespace-nowrap text-xs">
                      {formatINR(inv.cgst + inv.sgst + inv.igst)}
                    </td>
                    <td className="text-right font-mono font-bold text-slate-950 whitespace-nowrap">
                      {formatINR(inv.totalAmount)}
                    </td>
                    <td className="text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono rounded-xs font-semibold ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-900'
                            : inv.status === 'Overdue'
                            ? 'bg-red-100 text-red-900'
                            : inv.status === 'Sent'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xs"
                        title="View / Print Tax Invoice"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE INVOICE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-xs shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-slate-950 tracking-tight">
                  Create Tax Invoice (GST Compliant)
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {currentOrg?.name} • GSTIN: {currentOrg?.gstin}
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-xs hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-6 space-y-6 text-xs">
              {/* Header Details */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Invoice Serial No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Select Customer *
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => {
                      setSelectedCustomerId(e.target.value);
                      const target = customers.find((c) => c.id === e.target.value);
                      if (target && target.state.includes('Maharashtra')) {
                        setIsInterstate(false);
                      } else {
                        setIsInterstate(true);
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900 bg-white font-medium"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.gstin})
                      </option>
                    ))}
                  </select>

                  {selectedCustomerObj && (
                    <div className="mt-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xs text-[11px] font-mono text-slate-600 flex flex-wrap items-center justify-between gap-1">
                      <span>State: <strong className="text-slate-900">{selectedCustomerObj.state}</strong></span>
                      <span>GSTIN: <strong className="text-slate-900">{selectedCustomerObj.gstin}</strong></span>
                      <span>Terms: <strong className="text-slate-900">{selectedCustomerObj.paymentTerms}</strong></span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Invoice Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
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

              {/* Interstate GST Toggle */}
              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xs">
                <input
                  type="checkbox"
                  id="interstate-check"
                  checked={isInterstate}
                  onChange={(e) => {
                    setIsInterstate(e.target.checked);
                    // trigger recompute
                    items.forEach((_, idx) => updateItem(idx, 'quantity', items[idx].quantity));
                  }}
                  className="rounded-xs text-slate-900 focus:ring-0"
                />
                <label htmlFor="interstate-check" className="font-mono text-slate-800 cursor-pointer">
                  Interstate Supply (Charge Integrated GST - IGST instead of CGST + SGST)
                </label>
              </div>

              {/* Line Items Table */}
              <div className="border border-slate-200 rounded-xs overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 font-bold uppercase text-[11px] text-slate-700 font-mono">
                  Goods / Service Line Items
                </div>
                <div className="overflow-x-auto">
                <table className="w-full swiss-table min-w-[640px]">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th className="w-20">HSN/SAC</th>
                      <th className="w-16">Qty</th>
                      <th className="w-16">Unit</th>
                      <th className="w-24 text-right">Rate (₹)</th>
                      <th className="w-16 text-right">Disc%</th>
                      <th className="w-20">GST %</th>
                      <th className="w-28 text-right">Taxable (₹)</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={item.id}>
                        <td>
                          <input
                            type="text"
                            required
                            placeholder="Item description / particulars"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className="w-full px-2 py-1 border border-slate-200 rounded-xs focus:outline-none focus:border-slate-900"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="8466"
                            value={item.hsn}
                            onChange={(e) => updateItem(index, 'hsn', e.target.value)}
                            className="w-full px-1.5 py-1 border border-slate-200 rounded-xs font-mono text-center"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                            className="w-full px-1.5 py-1 border border-slate-200 rounded-xs font-mono text-center"
                          />
                        </td>
                        <td>
                          <select
                            value={item.unit}
                            onChange={(e) => updateItem(index, 'unit', e.target.value)}
                            className="w-full px-1 py-1 border border-slate-200 rounded-xs font-mono"
                          >
                            <option value="NOS">NOS</option>
                            <option value="PCS">PCS</option>
                            <option value="SET">SET</option>
                            <option value="JOB">JOB</option>
                            <option value="KGS">KGS</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            step="any"
                            value={item.rate}
                            onChange={(e) => updateItem(index, 'rate', e.target.value)}
                            className="w-full px-2 py-1 border border-slate-200 rounded-xs font-mono text-right"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discountPct}
                            onChange={(e) => updateItem(index, 'discountPct', e.target.value)}
                            className="w-full px-1 py-1 border border-slate-200 rounded-xs font-mono text-right"
                          />
                        </td>
                        <td>
                          <select
                            value={item.gstRate}
                            onChange={(e) => updateItem(index, 'gstRate', e.target.value)}
                            className="w-full px-1 py-1 border border-slate-200 rounded-xs font-mono"
                          >
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18">18%</option>
                            <option value="28">28%</option>
                          </select>
                        </td>
                        <td className="text-right font-mono font-bold text-slate-900">
                          {formatINR(item.amount)}
                        </td>
                        <td className="text-center">
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-slate-400 hover:text-red-600 p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>

                <div className="p-2 bg-slate-50 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={addItem}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xs font-medium text-slate-800 flex items-center gap-1.5"
                  >
                    <Plus size={13} />
                    <span>Add Line Item</span>
                  </button>
                </div>
              </div>

              {/* Tax Summary & Amount In Words */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Invoice Notes & Terms
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900 font-sans"
                  />
                  <div className="mt-2 text-[11px] text-slate-500 font-mono">
                    Amount in Words:{' '}
                    <span className="font-semibold text-slate-900">
                      {numberToWordsIndian(totalInvoiceAmount)}
                    </span>
                  </div>
                </div>

                {/* Calculation breakdown */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xs space-y-2 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Subtotal (Gross):</span>
                    <span>{formatINR(subtotal)}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span className="font-sans">Discount:</span>
                      <span>- {formatINR(totalDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200 pt-1.5 font-semibold">
                    <span className="font-sans">Taxable Value:</span>
                    <span>{formatINR(taxableAmount)}</span>
                  </div>
                  {!isInterstate ? (
                    <>
                      <div className="flex justify-between text-slate-600">
                        <span className="font-sans">CGST (Central Tax 9%):</span>
                        <span>{formatINR(totalCgst)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span className="font-sans">SGST (State Tax 9%):</span>
                        <span>{formatINR(totalSgst)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-slate-600">
                      <span className="font-sans">IGST (Integrated Tax 18%):</span>
                      <span>{formatINR(totalIgst)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-900 pt-2 text-sm font-bold text-slate-950">
                    <span className="font-sans">Total Payable (INR):</span>
                    <span>{formatINR(totalInvoiceAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xs hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingInvoice}
                  id="submit-invoice-btn"
                  className="px-6 py-2.5 bg-slate-950 disabled:opacity-50 text-white hover:bg-slate-800 rounded-xs font-semibold flex items-center gap-2"
                >
                  {isSubmittingInvoice ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Posting & Authorizing Invoice...</span>
                    </>
                  ) : (
                    <span>Save & Authorize Invoice</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE TAX INVOICE PREVIEW DRAWER */}
      {selectedInvoice && (() => {
        const cust = customers.find((c) => c.id === selectedInvoice.customerId);
        const invoiceItems = selectedInvoice.items.map((item: any, idx) => {
          const qty = Number(item.quantity) || 1;
          const rate = Number(item.unitPrice || item.rate) || 0;
          const taxable = Number(item.taxableAmount || item.amount) || qty * rate;
          const gstRate = Number(item.taxRate || item.gstRate) || 18;
          const taxAmt = Number(item.taxAmount) || (taxable * gstRate) / 100;
          return {
            id: item.id || `item_${idx}`,
            description: item.description || 'Line Item',
            hsn: item.hsnSac || item.hsn || '9987',
            quantity: qty,
            unit: item.unit || 'NOS',
            rate: rate,
            discountPct: Number(item.discountPct) || 0,
            gstRate: gstRate,
            amount: taxable,
            cgst: selectedInvoice.isInterState ? 0 : taxAmt / 2,
            sgst: selectedInvoice.isInterState ? 0 : taxAmt / 2,
            igst: selectedInvoice.isInterState ? taxAmt : 0,
            total: taxable + taxAmt,
          };
        });

        const drawerFormData: InvoiceFormData = {
          templateId: drawerTemplateId,
          business: {
            name: currentOrg?.name || 'ACME INDUSTRIES PVT LTD',
            tradeName: currentOrg?.tradeName || '',
            gstin: currentOrg?.gstin || '27AABCA1234F1Z5',
            pan: currentOrg?.pan || 'AABCA1234F',
            address: currentOrg?.address || 'Plot 42, MIDC Industrial Area',
            city: currentOrg?.city || 'Mumbai',
            state: currentOrg?.state || 'Maharashtra (27)',
            pincode: currentOrg?.pincode || '400093',
            email: currentOrg?.email || 'billing@acmeindustries.in',
            phone: currentOrg?.phone || '+91 22 4589 0000',
            bankName: currentOrg?.bankName || 'HDFC Bank Ltd',
            accountNumber: currentOrg?.accountNumber || '50200012345678',
            ifscCode: currentOrg?.ifscCode || 'HDFC0000060',
            branch: currentOrg?.branch || 'MIDC Andheri East',
            upiId: currentOrg?.upiId || 'acme@hdfcbank',
          },
          customer: {
            id: selectedInvoice.customerId,
            name: selectedInvoice.customerName,
            tradeName: cust?.tradeName || '',
            gstin: selectedInvoice.customerGstin || cust?.gstin || 'UNREGISTERED',
            pan: cust?.pan || '',
            billingAddress: cust?.address || 'Corporate Park, Industrial Estate',
            shippingAddress: cust?.address || 'Corporate Park, Industrial Estate',
            city: cust?.city || 'Mumbai',
            state: cust?.state || selectedInvoice.placeOfSupply || 'Maharashtra (27)',
            pincode: '',
            email: cust?.email || '',
            phone: cust?.phone || '',
            placeOfSupply: selectedInvoice.placeOfSupply || cust?.state || 'Maharashtra (27)',
          },
          metadata: {
            invoiceNumber: selectedInvoice.invoiceNumber,
            invoiceDate: selectedInvoice.date,
            dueDate: selectedInvoice.dueDate,
            poNumber: 'PO-' + (selectedInvoice.invoiceNumber.replace(/\D/g, '') || '901'),
            paymentTerms: selectedInvoice.paymentTerms || 'Net 30 Days',
            reverseCharge: !!selectedInvoice.reverseCharge,
            isInterstate: !!selectedInvoice.isInterState,
          },
          items: invoiceItems,
          additionalDiscount: 0,
          shippingCharges: 0,
          notes: selectedInvoice.notes || 'Thank you for your business.',
          termsAndConditions: selectedInvoice.termsAndConditions || '1. Payment within 30 days of invoice date.\n2. Interest @ 18% p.a. on overdue payments.\n3. Subject to Mumbai Jurisdiction.',
          authorizedSignatory: 'Amaan Sharma',
          signatoryTitle: 'Authorized Signatory / Finance Director',
        };

        const drawerCalculations = recalculateInvoice(drawerFormData);

        return (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div
              className="absolute inset-0 bg-neutral-950/40 backdrop-blur-2xs"
              onClick={() => setSelectedInvoice(null)}
            />
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 xs:pl-6 sm:pl-10">
              <div className="w-screen max-w-4xl bg-neutral-100 shadow-2xl border-l border-neutral-200 flex flex-col">
                {/* Drawer Header */}
                <div className="px-5 py-3 border-b border-neutral-200 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase bg-neutral-900 text-white px-2 py-0.5 rounded-xs">
                      TAX INVOICE
                    </span>
                    <span className="font-mono font-bold text-neutral-900">{selectedInvoice.invoiceNumber}</span>
                  </div>

                  {/* Template Switcher Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto">
                    {INVOICE_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setDrawerTemplateId(tpl.id)}
                        className={`px-2 py-0.5 text-[10px] font-mono rounded-xs transition-colors ${
                          drawerTemplateId === tpl.id
                            ? 'bg-neutral-900 text-white font-bold'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {tpl.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="p-1.5 text-neutral-700 hover:text-neutral-900 border border-neutral-300 hover:bg-neutral-50 rounded-xs flex items-center gap-1 text-xs font-mono"
                    >
                      <Printer size={13} />
                      <span>Print</span>
                    </button>
                    <button
                      onClick={() => setSelectedInvoice(null)}
                      className="p-1.5 rounded-xs text-neutral-400 hover:text-neutral-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Printable Invoice Body using InvoiceRenderer */}
                <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
                  <InvoiceRenderer data={drawerFormData} calculations={drawerCalculations} />
                </div>

                {/* Drawer Footer Actions */}
                <div className="p-4 border-t border-neutral-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        updateInvoiceStatus(selectedInvoice.id, 'Paid');
                        setSelectedInvoice({ ...selectedInvoice, status: 'Paid' });
                      }}
                      className="px-3 py-1.5 bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold rounded-xs font-mono"
                    >
                      Mark as Paid
                    </button>
                    <button
                      onClick={() => {
                        updateInvoiceStatus(selectedInvoice.id, 'Sent');
                        setSelectedInvoice({ ...selectedInvoice, status: 'Sent' });
                      }}
                      className="px-3 py-1.5 bg-white border border-neutral-300 text-neutral-800 hover:bg-neutral-100 text-xs font-medium rounded-xs font-mono"
                    >
                      Mark as Sent
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="px-4 py-1.5 bg-neutral-900 text-white rounded-xs text-xs font-semibold font-mono"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
