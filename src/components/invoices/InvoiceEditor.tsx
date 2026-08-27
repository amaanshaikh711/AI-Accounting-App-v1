import React, { useState } from 'react';
import {
  InvoiceFormData,
  InvoiceItemForm,
  InvoiceCalculations,
  InvoiceTemplateId,
} from './types';
import {
  INVOICE_PRESET_SAMPLES,
  recalculateInvoice,
} from './mockInvoiceData';
import { formatINR } from '../../utils/formatters';
import { useAccounting } from '../../context/AccountingContext';
import {
  Plus,
  Trash2,
  Building,
  User,
  Calendar,
  FileText,
  Percent,
  Truck,
  CreditCard,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
} from 'lucide-react';

interface InvoiceEditorProps {
  formData: InvoiceFormData;
  calculations: InvoiceCalculations;
  onChange: (updated: InvoiceFormData) => void;
  onOpenTemplateSelector: () => void;
}

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({
  formData,
  calculations,
  onChange,
  onOpenTemplateSelector,
}) => {
  const { customers, currentOrg } = useAccounting();

  const [showEditCompany, setShowEditCompany] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<'all' | 'meta' | 'client' | 'items' | 'terms'>('all');

  // Helper updater for nested business fields
  const updateBusiness = (field: keyof typeof formData.business, val: string) => {
    onChange({
      ...formData,
      business: { ...formData.business, [field]: val },
    });
  };

  // Helper updater for customer fields
  const updateCustomer = (field: keyof typeof formData.customer, val: string) => {
    onChange({
      ...formData,
      customer: { ...formData.customer, [field]: val },
    });
  };

  // Helper updater for metadata
  const updateMeta = (field: keyof typeof formData.metadata, val: any) => {
    onChange({
      ...formData,
      metadata: { ...formData.metadata, [field]: val },
    });
  };

  // Select customer from list & auto-fill
  const handleSelectCustomer = (customerId: string) => {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return;

    const isCustomerInterstate =
      !cust.state.toLowerCase().includes('maharashtra') &&
      !cust.state.startsWith('27');

    onChange({
      ...formData,
      customer: {
        ...formData.customer,
        id: cust.id,
        name: cust.name,
        tradeName: cust.tradeName || '',
        gstin: cust.gstin,
        pan: cust.pan || '',
        billingAddress: cust.address,
        shippingAddress: cust.address,
        city: cust.city,
        state: cust.state,
        pincode: '',
        email: cust.email,
        phone: cust.phone,
        contactPerson: cust.contactPerson || '',
        placeOfSupply: cust.state,
      },
      metadata: {
        ...formData.metadata,
        isInterstate: isCustomerInterstate,
      },
    });
  };

  // Line item manipulation
  const updateItem = (index: number, field: keyof InvoiceItemForm, value: any) => {
    const updatedItems = [...formData.items];
    const item = { ...updatedItems[index], [field]: value };

    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const discount = Number(item.discountPct) || 0;
    const gstRate = Number(item.gstRate) || 0;

    const base = qty * rate;
    const lineDiscount = (base * discount) / 100;
    const taxable = base - lineDiscount;
    const taxAmt = (taxable * gstRate) / 100;

    item.amount = taxable;
    item.total = taxable + taxAmt;

    if (formData.metadata.isInterstate) {
      item.cgst = 0;
      item.sgst = 0;
      item.igst = taxAmt;
    } else {
      item.cgst = taxAmt / 2;
      item.sgst = taxAmt / 2;
      item.igst = 0;
    }

    updatedItems[index] = item;
    onChange({ ...formData, items: updatedItems });
  };

  const addItem = () => {
    const newItem: InvoiceItemForm = {
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
      total: 0,
    };
    onChange({ ...formData, items: [...formData.items, newItem] });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const updated = formData.items.filter((_, i) => i !== index);
      onChange({ ...formData, items: updated });
    }
  };

  // Load sample preset
  const handleLoadPreset = (presetIndex: number) => {
    const preset = INVOICE_PRESET_SAMPLES[presetIndex];
    if (preset) {
      onChange({
        ...formData,
        ...preset.data,
        customer: { ...formData.customer, ...preset.data.customer },
        metadata: { ...formData.metadata, ...preset.data.metadata },
        items: preset.data.items || formData.items,
      });
    }
  };

  return (
    <div className="space-y-6 text-xs text-neutral-900">
      {/* Sample Presets Ribbon */}
      <div className="bg-neutral-100/80 border border-neutral-200 p-3 rounded-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-neutral-700 font-medium">
          <Sparkles size={14} className="text-neutral-900" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Quick Presets:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {INVOICE_PRESET_SAMPLES.map((preset, idx) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleLoadPreset(idx)}
              className="px-2.5 py-1 bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-800 text-[11px] font-medium rounded-xs transition-colors shadow-2xs"
            >
              {preset.name}
            </button>
          ))}
          <button
            type="button"
            onClick={onOpenTemplateSelector}
            className="px-2.5 py-1 bg-neutral-900 text-white hover:bg-neutral-800 text-[11px] font-mono rounded-xs transition-colors flex items-center gap-1"
          >
            <Layers size={12} />
            <span>Switch Template</span>
          </button>
        </div>
      </div>

      {/* PRE-FILLED COMPANY INFORMATION (Organisation Profile) */}
      <div className="bg-white border border-neutral-200 rounded-xs p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Building size={15} className="text-neutral-900" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-900 font-mono">
              Seller / Company Information
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold">
              ✓ Pre-filled
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowEditCompany(!showEditCompany)}
            className="text-[11px] font-mono text-neutral-600 hover:text-neutral-950 font-medium underline flex items-center gap-1"
          >
            <span>{showEditCompany ? 'Hide Details' : 'View / Edit Company Info'}</span>
            {showEditCompany ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>

        {/* Compact Summary when collapsed */}
        {!showEditCompany && (
          <div className="p-3 bg-neutral-50 rounded-xs border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
            <div>
              <span className="font-bold text-neutral-950">{formData.business.name || 'ACME INDUSTRIES PVT LTD'}</span>
              <span className="text-neutral-500 font-mono ml-2">GSTIN: {formData.business.gstin || '27AABCA1234F1Z5'}</span>
            </div>
            <div className="text-neutral-500 text-[10.5px]">
              <span>{formData.business.city || 'Mumbai'}, {formData.business.state || 'Maharashtra (27)'}</span>
              <span className="mx-1.5">•</span>
              <span className="font-mono">{formData.business.bankName || 'HDFC Bank'} (A/C: ****{(formData.business.accountNumber || '5678').slice(-4)})</span>
            </div>
          </div>
        )}

        {/* Detailed editable form when expanded */}
        {showEditCompany && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                  Legal Entity / Business Name
                </label>
                <input
                  type="text"
                  value={formData.business.name}
                  onChange={(e) => updateBusiness('name', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs font-semibold text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                  Trade Name / Brand Name
                </label>
                <input
                  type="text"
                  value={formData.business.tradeName || ''}
                  onChange={(e) => updateBusiness('tradeName', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                  Registered GSTIN (15 Digits)
                </label>
                <input
                  type="text"
                  value={formData.business.gstin}
                  onChange={(e) => updateBusiness('gstin', e.target.value.toUpperCase())}
                  className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs font-mono font-bold text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                  PAN
                </label>
                <input
                  type="text"
                  value={formData.business.pan}
                  onChange={(e) => updateBusiness('pan', e.target.value.toUpperCase())}
                  className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.business.address}
                  onChange={(e) => updateBusiness('address', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                  City & State
                </label>
                <input
                  type="text"
                  value={`${formData.business.city}, ${formData.business.state}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(',');
                    updateBusiness('city', parts[0]?.trim() || '');
                    if (parts[1]) updateBusiness('state', parts[1]?.trim());
                  }}
                  className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                  Email & Phone
                </label>
                <input
                  type="text"
                  value={`${formData.business.email} | ${formData.business.phone}`}
                  onChange={(e) => {
                    const parts = e.target.value.split('|');
                    updateBusiness('email', parts[0]?.trim() || '');
                    if (parts[1]) updateBusiness('phone', parts[1]?.trim());
                  }}
                  className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 1: Invoice Header & Meta */}
      <div className="bg-white border border-neutral-200 rounded-xs p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-neutral-900" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-900 font-mono">
              1. Invoice Identification & GST Regime
            </h3>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">Required</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div>
            <label className="block text-[11px] font-medium text-neutral-700 mb-1">
              Invoice Serial No. *
            </label>
            <input
              type="text"
              value={formData.metadata.invoiceNumber}
              onChange={(e) => updateMeta('invoiceNumber', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs font-mono font-bold text-neutral-900 focus:outline-none focus:border-neutral-900"
              placeholder="INV/2026/001"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-700 mb-1">
              Invoice Date *
            </label>
            <input
              type="date"
              value={formData.metadata.invoiceDate}
              onChange={(e) => updateMeta('invoiceDate', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-700 mb-1">
              Payment Due Date *
            </label>
            <input
              type="date"
              value={formData.metadata.dueDate}
              onChange={(e) => updateMeta('dueDate', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-700 mb-1">
              Payment Terms
            </label>
            <select
              value={formData.metadata.paymentTerms}
              onChange={(e) => updateMeta('paymentTerms', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs bg-white text-neutral-900 focus:outline-none focus:border-neutral-900"
            >
              <option value="Due on Receipt">Due on Receipt</option>
              <option value="Net 15 Days">Net 15 Days</option>
              <option value="Net 30 Days">Net 30 Days</option>
              <option value="Net 45 Days">Net 45 Days</option>
              <option value="Net 60 Days">Net 60 Days</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          <div>
            <label className="block text-[11px] font-medium text-neutral-700 mb-1">
              Purchase Order (PO) / Ref No.
            </label>
            <input
              type="text"
              value={formData.metadata.poNumber || ''}
              onChange={(e) => updateMeta('poNumber', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-900"
              placeholder="e.g. PO-2026-904"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-700 mb-1">
              Place of Supply (POS)
            </label>
            <input
              type="text"
              value={formData.customer.placeOfSupply}
              onChange={(e) => updateCustomer('placeOfSupply', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
              placeholder="e.g. Maharashtra (27)"
            />
          </div>

          <div className="flex flex-col justify-end">
            <div className="flex items-center gap-3 p-2 bg-neutral-50 border border-neutral-200 rounded-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[11px]">
                <input
                  type="checkbox"
                  checked={formData.metadata.isInterstate}
                  onChange={(e) => {
                    const isInter = e.target.checked;
                    // Recalculate tax type
                    const updatedItems = formData.items.map((item) => {
                      const taxable = item.amount;
                      const gstRate = item.gstRate;
                      const taxAmt = (taxable * gstRate) / 100;
                      return {
                        ...item,
                        cgst: isInter ? 0 : taxAmt / 2,
                        sgst: isInter ? 0 : taxAmt / 2,
                        igst: isInter ? taxAmt : 0,
                      };
                    });
                    onChange({
                      ...formData,
                      metadata: { ...formData.metadata, isInterstate: isInter },
                      items: updatedItems,
                    });
                  }}
                  className="rounded-2xs text-neutral-900 focus:ring-0 w-3.5 h-3.5"
                />
                <span className="font-medium text-neutral-800">
                  Inter-State Supply ({formData.metadata.isInterstate ? 'IGST Applicable' : 'CGST + SGST'})
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Billed To / Customer Details */}
      <div className="bg-white border border-neutral-200 rounded-xs p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
          <div className="flex items-center gap-2">
            <User size={15} className="text-neutral-900" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-900 font-mono">
              2. Customer (Buyer / Consignee) Details
            </h3>
          </div>

          {customers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-500 font-medium hidden sm:inline">Select Customer:</span>
              <select
                onChange={(e) => handleSelectCustomer(e.target.value)}
                className="px-2 py-1 border border-neutral-300 rounded-xs bg-neutral-50 text-[11px] font-medium text-neutral-800 focus:outline-none focus:border-neutral-900"
              >
                <option value="">-- Choose from Contacts --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.gstin})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[11px] font-medium text-neutral-700 mb-1">
              Customer Business Name *
            </label>
            <input
              type="text"
              value={formData.customer.name}
              onChange={(e) => updateCustomer('name', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs font-semibold text-neutral-900 focus:outline-none focus:border-neutral-900"
              placeholder="e.g. XYZ Private Limited"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-700 mb-1">
              Customer GSTIN (15 Digits)
            </label>
            <input
              type="text"
              value={formData.customer.gstin}
              onChange={(e) => updateCustomer('gstin', e.target.value.toUpperCase())}
              className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs font-mono font-bold text-neutral-900 focus:outline-none focus:border-neutral-900"
              placeholder="27AABCP8890K1ZV"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[11px] font-medium text-neutral-700 mb-1">
              Billing Address *
            </label>
            <textarea
              rows={2}
              value={formData.customer.billingAddress}
              onChange={(e) => updateCustomer('billingAddress', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
              placeholder="Street, Tower, Area"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-700 mb-1">
              Shipping Address (Consignee)
            </label>
            <textarea
              rows={2}
              value={formData.customer.shippingAddress || ''}
              onChange={(e) => updateCustomer('shippingAddress', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
              placeholder="Leave blank if same as billing"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
          <div>
            <label className="block text-[11px] font-medium text-neutral-700 mb-1">
              City
            </label>
            <input
              type="text"
              value={formData.customer.city}
              onChange={(e) => updateCustomer('city', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-700 mb-1">
              State
            </label>
            <input
              type="text"
              value={formData.customer.state}
              onChange={(e) => updateCustomer('state', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.customer.email || ''}
              onChange={(e) => updateCustomer('email', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
              placeholder="client@company.com"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-700 mb-1">
              Phone / Mobile
            </label>
            <input
              type="text"
              value={formData.customer.phone || ''}
              onChange={(e) => updateCustomer('phone', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-900"
              placeholder="+91 98200 00000"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: Line Items Table */}
      <div className="bg-white border border-neutral-200 rounded-xs p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-neutral-900" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-900 font-mono">
              3. Goods & Service Line Items ({formData.items.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={addItem}
            className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xs font-mono text-[11px] flex items-center gap-1 transition-colors"
          >
            <Plus size={13} />
            <span>Add Item</span>
          </button>
        </div>

        {/* Desktop / Tablet Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[700px]">
            <thead>
              <tr className="bg-neutral-100 border-b border-neutral-200 font-mono text-[10px] text-neutral-600 uppercase">
                <th className="p-2 text-left w-8">#</th>
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-center w-20">HSN/SAC</th>
                <th className="p-2 text-right w-16">Qty</th>
                <th className="p-2 text-center w-20">Unit</th>
                <th className="p-2 text-right w-24">Rate (₹)</th>
                <th className="p-2 text-right w-16">Disc %</th>
                <th className="p-2 text-center w-20">GST Rate</th>
                <th className="p-2 text-right w-24">Taxable</th>
                <th className="p-2 text-center w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {formData.items.map((item, idx) => {
                const qty = Number(item.quantity) || 0;
                const rate = Number(item.rate) || 0;
                const disc = Number(item.discountPct) || 0;
                const taxable = qty * rate * (1 - disc / 100);

                return (
                  <tr key={item.id || idx} className="hover:bg-neutral-50/60">
                    <td className="p-2 text-neutral-400 font-mono text-center">{idx + 1}</td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(idx, 'description', e.target.value)}
                        placeholder="Item or service description..."
                        className="w-full px-2 py-1 border border-neutral-300 rounded-xs text-neutral-900 font-medium focus:outline-none focus:border-neutral-900"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.hsn}
                        onChange={(e) => updateItem(idx, 'hsn', e.target.value)}
                        placeholder="8466"
                        className="w-full px-1.5 py-1 border border-neutral-300 rounded-xs font-mono text-center text-neutral-900 focus:outline-none focus:border-neutral-900"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full px-1.5 py-1 border border-neutral-300 rounded-xs font-mono text-right font-bold text-neutral-900 focus:outline-none focus:border-neutral-900"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={item.unit}
                        onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                        className="w-full px-1 py-1 border border-neutral-300 rounded-xs font-mono text-neutral-800 bg-white focus:outline-none focus:border-neutral-900 text-[11px]"
                      >
                        <option value="NOS">NOS</option>
                        <option value="PCS">PCS</option>
                        <option value="SET">SET</option>
                        <option value="KGS">KGS</option>
                        <option value="MTR">MTR</option>
                        <option value="HRS">HRS</option>
                        <option value="MONTH">MONTH</option>
                        <option value="JOB">JOB</option>
                        <option value="SUB">SUB</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.rate}
                        onChange={(e) => updateItem(idx, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full px-1.5 py-1 border border-neutral-300 rounded-xs font-mono text-right text-neutral-900 focus:outline-none focus:border-neutral-900"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discountPct}
                        onChange={(e) => updateItem(idx, 'discountPct', parseFloat(e.target.value) || 0)}
                        className="w-full px-1.5 py-1 border border-neutral-300 rounded-xs font-mono text-right text-neutral-700 focus:outline-none focus:border-neutral-900"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={item.gstRate}
                        onChange={(e) => updateItem(idx, 'gstRate', parseFloat(e.target.value) || 0)}
                        className="w-full px-1 py-1 border border-neutral-300 rounded-xs font-mono text-center text-neutral-900 bg-white focus:outline-none focus:border-neutral-900 font-semibold"
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </td>
                    <td className="p-2 text-right font-mono font-bold text-neutral-900 whitespace-nowrap">
                      {formatINR(taxable)}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        disabled={formData.items.length <= 1}
                        className="p-1 text-neutral-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Delete item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Additional Charges & Discounts */}
        <div className="pt-3 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Truck size={14} className="text-neutral-500 shrink-0" />
            <label className="text-[11px] font-medium text-neutral-700 whitespace-nowrap">
              Shipping / Freight (₹):
            </label>
            <input
              type="number"
              min="0"
              value={formData.shippingCharges}
              onChange={(e) => onChange({ ...formData, shippingCharges: parseFloat(e.target.value) || 0 })}
              className="w-28 px-2 py-1 border border-neutral-300 rounded-xs font-mono text-right text-neutral-900 focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div className="flex items-center gap-2 sm:justify-end">
            <Percent size={14} className="text-neutral-500 shrink-0" />
            <label className="text-[11px] font-medium text-neutral-700 whitespace-nowrap">
              Special Discount (₹):
            </label>
            <input
              type="number"
              min="0"
              value={formData.additionalDiscount}
              onChange={(e) => onChange({ ...formData, additionalDiscount: parseFloat(e.target.value) || 0 })}
              className="w-28 px-2 py-1 border border-neutral-300 rounded-xs font-mono text-right text-neutral-900 focus:outline-none focus:border-neutral-900"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: Bank Details, Terms & Signatory */}
      <div className="bg-white border border-neutral-200 rounded-xs p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
          <div className="flex items-center gap-2">
            <CreditCard size={15} className="text-neutral-900" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-900 font-mono">
              4. Bank Remittance, Terms & Authorized Signatory
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
          <div>
            <label className="block text-[11px] font-medium text-neutral-700 mb-1">
              Bank Name
            </label>
            <input
              type="text"
              value={formData.business.bankName}
              onChange={(e) => updateBusiness('bankName', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-700 mb-1">
              Account Number
            </label>
            <input
              type="text"
              value={formData.business.accountNumber}
              onChange={(e) => updateBusiness('accountNumber', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs font-mono font-bold text-neutral-900 focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-700 mb-1">
              IFSC Code
            </label>
            <input
              type="text"
              value={formData.business.ifscCode}
              onChange={(e) => updateBusiness('ifscCode', e.target.value.toUpperCase())}
              className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs font-mono font-bold text-neutral-900 focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-700 mb-1">
              UPI VPA / ID
            </label>
            <input
              type="text"
              value={formData.business.upiId || ''}
              onChange={(e) => updateBusiness('upiId', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-900"
              placeholder="company@bank"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[11px] font-medium text-neutral-700 mb-1">
              Terms & Conditions
            </label>
            <textarea
              rows={3}
              value={formData.termsAndConditions}
              onChange={(e) => onChange({ ...formData, termsAndConditions: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs text-neutral-900 text-[11px] focus:outline-none focus:border-neutral-900 font-mono"
            />
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                Authorized Signatory Name
              </label>
              <input
                type="text"
                value={formData.authorizedSignatory}
                onChange={(e) => onChange({ ...formData, authorizedSignatory: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs font-semibold text-neutral-900 focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                Signatory Title
              </label>
              <input
                type="text"
                value={formData.signatoryTitle}
                onChange={(e) => onChange({ ...formData, signatoryTitle: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-xs text-neutral-700 focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
