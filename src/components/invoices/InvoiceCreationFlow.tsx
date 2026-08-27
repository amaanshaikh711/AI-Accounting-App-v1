import React, { useState, useEffect } from 'react';
import {
  InvoiceFormData,
  InvoiceTemplateId,
  InvoiceCalculations,
} from './types';
import {
  INITIAL_MOCK_INVOICE,
  recalculateInvoice,
  INVOICE_TEMPLATES,
} from './mockInvoiceData';
import { TemplateSelector } from './TemplateSelector';
import { InvoiceEditor } from './InvoiceEditor';
import { InvoiceLivePreview } from './InvoiceLivePreview';
import { useAccounting } from '../../context/AccountingContext';
import { Invoice, InvoiceItem } from '../../types';
import { formatINR } from '../../utils/formatters';
import {
  ArrowLeft,
  CheckCircle2,
  Printer,
  Sparkles,
  Layers,
  Save,
  RotateCcw,
  X,
  FileCheck,
  Eye,
  Edit3,
  Check,
  Building2,
} from 'lucide-react';

interface InvoiceCreationFlowProps {
  onBackToSales?: () => void;
  onInvoiceCreated?: (invoiceId: string) => void;
}

export type ViewMode = 'split' | 'editor-only' | 'preview-only';

export const InvoiceCreationFlow: React.FC<InvoiceCreationFlowProps> = ({
  onBackToSales,
  onInvoiceCreated,
}) => {
  const { addInvoice, currentOrg, customers } = useAccounting();

  // Navigation step in the creation flow: 'choose-design' -> 'editor'
  const [currentStep, setCurrentStep] = useState<'choose-design' | 'editor'>('choose-design');

  // Invoice form draft state
  const [formData, setFormData] = useState<InvoiceFormData>(() => {
    // Populate business from active currentOrg if available
    const base = { ...INITIAL_MOCK_INVOICE };
    if (currentOrg) {
      base.business = {
        name: currentOrg.name || base.business.name,
        tradeName: currentOrg.tradeName || base.business.tradeName,
        gstin: currentOrg.gstin || base.business.gstin,
        pan: currentOrg.pan || base.business.pan,
        address: currentOrg.address || base.business.address,
        city: currentOrg.city || base.business.city,
        state: currentOrg.state || base.business.state,
        pincode: currentOrg.pincode || base.business.pincode,
        email: currentOrg.email || base.business.email,
        phone: currentOrg.phone || base.business.phone,
        bankName: currentOrg.bankName || base.business.bankName,
        accountNumber: currentOrg.accountNumber || base.business.accountNumber,
        ifscCode: currentOrg.ifscCode || base.business.ifscCode,
        branch: currentOrg.branch || base.business.branch,
        upiId: currentOrg.upiId || base.business.upiId,
      };
    }
    return base;
  });

  // Keep company information synced with currentOrg if it loads or changes
  useEffect(() => {
    if (currentOrg) {
      setFormData((prev) => ({
        ...prev,
        business: {
          name: currentOrg.name || prev.business.name,
          tradeName: currentOrg.tradeName || prev.business.tradeName,
          gstin: currentOrg.gstin || prev.business.gstin,
          pan: currentOrg.pan || prev.business.pan,
          address: currentOrg.address || prev.business.address,
          city: currentOrg.city || prev.business.city,
          state: currentOrg.state || prev.business.state,
          pincode: currentOrg.pincode || prev.business.pincode,
          email: currentOrg.email || prev.business.email,
          phone: currentOrg.phone || prev.business.phone,
          bankName: currentOrg.bankName || prev.business.bankName,
          accountNumber: currentOrg.accountNumber || prev.business.accountNumber,
          ifscCode: currentOrg.ifscCode || prev.business.ifscCode,
          branch: currentOrg.branch || prev.business.branch,
          upiId: currentOrg.upiId || prev.business.upiId,
        },
      }));
    }
  }, [currentOrg]);

  // Template switcher modal / drawer state (when in editor mode)
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);

  // Responsive mobile active tab (editor vs preview)
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  // Desktop view mode (split vs full editor vs full preview)
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  // Success modal state
  const [generatedInvoice, setGeneratedInvoice] = useState<{
    id: string;
    invoiceNumber: string;
    customerName: string;
    grandTotal: number;
    templateId: InvoiceTemplateId;
  } | null>(null);

  // Recalculate calculations live
  const calculations: InvoiceCalculations = recalculateInvoice(formData);

  // Handle template selection from the "Choose an invoice design" screen or modal
  const handleSelectTemplateAndOpenEditor = (
    templateId: InvoiceTemplateId,
    scannedOrCustomData?: Partial<InvoiceFormData>
  ) => {
    setFormData((prev) => {
      let next = { ...prev, templateId };
      if (scannedOrCustomData) {
        next = {
          ...next,
          ...scannedOrCustomData,
          customer: {
            ...next.customer,
            ...(scannedOrCustomData.customer || {}),
          },
          metadata: {
            ...next.metadata,
            ...(scannedOrCustomData.metadata || {}),
          },
          items: scannedOrCustomData.items || next.items,
        };
      }
      return next;
    });

    // Advance to Editor step
    setCurrentStep('editor');
    setShowTemplateModal(false);
  };

  // Handle save & generate invoice
  const handleGenerateInvoice = () => {
    if (!formData.customer.name.trim()) {
      alert('Please enter or select a customer name.');
      return;
    }
    if (formData.items.length === 0) {
      alert('Please add at least one line item.');
      return;
    }

    const newId = `inv_${Date.now()}`;
    const invoiceItems: InvoiceItem[] = formData.items.map((item, idx) => ({
      id: item.id || `item_${idx + 1}`,
      description: item.description || 'General Item / Service',
      hsnSac: item.hsn || '9987',
      quantity: Number(item.quantity) || 1,
      unit: item.unit || 'NOS',
      unitPrice: Number(item.rate) || 0,
      taxRate: Number(item.gstRate) || 18,
      taxAmount: formData.metadata.isInterstate
        ? Number(item.igst) || 0
        : (Number(item.cgst) || 0) + (Number(item.sgst) || 0),
      total: Number(item.total) || 0,
    }));

    const newInvoice: Invoice = {
      id: newId,
      orgId: currentOrg?.id || 'org_acme',
      invoiceNumber: formData.metadata.invoiceNumber || `INV/2026/${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: formData.customer.id || 'cust_custom',
      customerName: formData.customer.name,
      customerGstin: formData.customer.gstin,
      date: formData.metadata.invoiceDate,
      dueDate: formData.metadata.dueDate,
      items: invoiceItems,
      subtotal: calculations.subtotal,
      discount: calculations.itemDiscounts + calculations.additionalDiscount,
      taxableAmount: calculations.taxableAmount,
      cgst: calculations.totalCgst,
      sgst: calculations.totalSgst,
      igst: calculations.totalIgst,
      totalAmount: calculations.grandTotal,
      amountPaid: 0,
      status: 'Sent',
      paymentTerms: formData.metadata.paymentTerms,
      notes: formData.notes,
      termsAndConditions: formData.termsAndConditions,
      placeOfSupply: formData.customer.placeOfSupply || formData.customer.state,
      isInterState: formData.metadata.isInterstate,
      reverseCharge: formData.metadata.reverseCharge,
      templateId: formData.templateId,
    };

    // Save to accounting context
    addInvoice(newInvoice);

    // Show success dialog
    setGeneratedInvoice({
      id: newId,
      invoiceNumber: newInvoice.invoiceNumber,
      customerName: newInvoice.customerName,
      grandTotal: newInvoice.totalAmount,
      templateId: formData.templateId,
    });
  };

  const handleReset = () => {
    if (window.confirm('Reset this invoice draft to default sample values?')) {
      const base = { ...INITIAL_MOCK_INVOICE };
      if (currentOrg) {
        base.business = {
          name: currentOrg.name || base.business.name,
          tradeName: currentOrg.tradeName || base.business.tradeName,
          gstin: currentOrg.gstin || base.business.gstin,
          pan: currentOrg.pan || base.business.pan,
          address: currentOrg.address || base.business.address,
          city: currentOrg.city || base.business.city,
          state: currentOrg.state || base.business.state,
          pincode: currentOrg.pincode || base.business.pincode,
          email: currentOrg.email || base.business.email,
          phone: currentOrg.phone || base.business.phone,
          bankName: currentOrg.bankName || base.business.bankName,
          accountNumber: currentOrg.accountNumber || base.business.accountNumber,
          ifscCode: currentOrg.ifscCode || base.business.ifscCode,
          branch: currentOrg.branch || base.business.branch,
          upiId: currentOrg.upiId || base.business.upiId,
        };
      }
      setFormData(base);
    }
  };

  const selectedTemplateMeta =
    INVOICE_TEMPLATES.find((t) => t.id === formData.templateId) ||
    INVOICE_TEMPLATES[0];

  // ==========================================
  // STEP 1: CHOOSE AN INVOICE DESIGN SCREEN
  // ==========================================
  if (currentStep === 'choose-design') {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col font-sans">
        {/* Navigation Top Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-neutral-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            {onBackToSales && (
              <button
                type="button"
                onClick={onBackToSales}
                id="back-to-sales-btn"
                className="p-1.5 hover:bg-neutral-100 rounded-xs text-neutral-600 hover:text-neutral-950 transition-colors"
                title="Return to Sales"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                  New Tax Invoice
                </span>
                <span className="text-neutral-300">•</span>
                <span className="text-xs font-mono font-semibold text-neutral-800 flex items-center gap-1">
                  <Building2 size={13} className="text-neutral-600" />
                  {currentOrg?.name || 'ACME INDUSTRIES PVT LTD'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentStep('editor')}
              className="px-3 py-1.5 bg-neutral-950 text-white hover:bg-neutral-800 text-xs font-mono font-semibold rounded-xs transition-colors"
            >
              Skip to Editor →
            </button>
          </div>
        </header>

        {/* Main Choose an Invoice Design Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          <TemplateSelector
            selectedTemplateId={formData.templateId}
            onSelectTemplate={handleSelectTemplateAndOpenEditor}
            onClose={onBackToSales}
            isInitialStep={true}
          />
        </main>
      </div>
    );
  }

  // ==========================================
  // STEP 2: INVOICE EDITOR OPENS (Company Pre-filled)
  // ==========================================
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-sans">
      {/* Top Application Header Bar */}
      <header className="sticky top-0 z-20 bg-white border-b border-neutral-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          {/* Back button to return to template picker */}
          <button
            type="button"
            onClick={() => setCurrentStep('choose-design')}
            id="back-to-templates-btn"
            className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-xs text-neutral-800 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
            title="Change Design"
          >
            <ArrowLeft size={14} />
            <span>Choose Design</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-neutral-950 tracking-tight flex items-center gap-2">
                <span>Tax Invoice Editor</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <Check size={11} strokeWidth={3} />
                  Company Info Pre-filled
                </span>
              </h1>
            </div>
            <div className="text-[11px] text-neutral-500 font-mono flex items-center gap-2">
              <span>Template: <strong className="text-neutral-900">{selectedTemplateMeta.number} ({selectedTemplateMeta.name})</strong></span>
              <span>•</span>
              <span>{formData.metadata.invoiceNumber}</span>
            </div>
          </div>
        </div>

        {/* Action Controls Header */}
        <div className="flex items-center gap-2">
          {/* Template Switcher Modal Button */}
          <button
            type="button"
            onClick={() => setShowTemplateModal(true)}
            id="choose-template-btn"
            className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-300 rounded-xs font-mono text-xs flex items-center gap-1.5 transition-colors"
          >
            <Layers size={13} />
            <span>Switch Design ({selectedTemplateMeta.number})</span>
          </button>

          {/* Desktop View Mode Toggles */}
          <div className="hidden lg:flex items-center bg-neutral-100 p-0.5 rounded-xs border border-neutral-200 text-xs font-mono">
            <button
              type="button"
              onClick={() => setViewMode('editor-only')}
              className={`px-2 py-1 rounded-2xs transition-colors ${
                viewMode === 'editor-only'
                  ? 'bg-white font-bold text-neutral-950 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              Form
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-2 py-1 rounded-2xs transition-colors ${
                viewMode === 'split'
                  ? 'bg-white font-bold text-neutral-950 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              Split View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview-only')}
              className={`px-2 py-1 rounded-2xs transition-colors ${
                viewMode === 'preview-only'
                  ? 'bg-white font-bold text-neutral-950 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              Preview
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="p-2 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 rounded-xs transition-colors hidden sm:block"
            title="Reset to sample"
          >
            <RotateCcw size={14} />
          </button>

          {/* Primary Save & Generate Button */}
          <button
            type="button"
            onClick={handleGenerateInvoice}
            id="generate-invoice-btn"
            className="px-4 py-1.5 bg-neutral-950 hover:bg-neutral-900 text-white rounded-xs font-mono text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
          >
            <FileCheck size={14} />
            <span>Generate Invoice ({formatINR(calculations.grandTotal, false)})</span>
          </button>
        </div>
      </header>

      {/* Mobile / Tablet Tab Switcher (Visible on < lg screens) */}
      <div className="lg:hidden bg-white border-b border-neutral-200 px-4 py-2 flex items-center justify-between sticky top-[57px] z-10 shadow-2xs">
        <div className="flex items-center gap-1 w-full max-w-xs mx-auto bg-neutral-100 p-0.5 rounded-xs border border-neutral-200">
          <button
            type="button"
            onClick={() => setMobileTab('editor')}
            className={`flex-1 py-1 text-xs font-mono font-medium rounded-2xs flex items-center justify-center gap-1.5 ${
              mobileTab === 'editor'
                ? 'bg-white font-bold text-neutral-950 shadow-2xs'
                : 'text-neutral-600'
            }`}
          >
            <Edit3 size={13} />
            <span>Invoice Form</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-1 text-xs font-mono font-medium rounded-2xs flex items-center justify-center gap-1.5 ${
              mobileTab === 'preview'
                ? 'bg-white font-bold text-neutral-950 shadow-2xs'
                : 'text-neutral-600'
            }`}
          >
            <Eye size={13} />
            <span>Live Document</span>
          </button>
        </div>
      </div>

      {/* Main Split-Screen Workspace */}
      <main className="flex-1 flex overflow-hidden">
        {/* LEFT PANE: Form Controls & Calculations */}
        <div
          className={`w-full ${
            viewMode === 'split' ? 'lg:w-[50%]' : viewMode === 'editor-only' ? 'w-full' : 'hidden'
          } ${
            mobileTab === 'editor' ? 'block' : 'hidden lg:block'
          } border-r border-neutral-200 bg-neutral-100 overflow-y-auto p-4 sm:p-6 space-y-6`}
        >
          <InvoiceEditor
            formData={formData}
            calculations={calculations}
            onChange={setFormData}
            onOpenTemplateSelector={() => setShowTemplateModal(true)}
          />
        </div>

        {/* RIGHT PANE: Real-time Live Document Render */}
        <div
          className={`w-full ${
            viewMode === 'split' ? 'lg:w-[50%]' : viewMode === 'preview-only' ? 'w-full' : 'hidden'
          } ${
            mobileTab === 'preview' ? 'block' : 'hidden lg:block'
          } bg-neutral-200/70 overflow-y-auto p-4 sm:p-6 flex justify-center`}
        >
          <div className="w-full max-w-3xl">
            <InvoiceLivePreview
              formData={formData}
              data={formData}
              calculations={calculations}
              onSelectTemplate={(templateId) => setFormData((prev) => ({ ...prev, templateId }))}
              onOpenTemplateSelector={() => setShowTemplateModal(true)}
            />
          </div>
        </div>
      </main>

      {/* TEMPLATE PICKER MODAL (From Editor Mode) */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/60 backdrop-blur-2xs flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-xs border border-neutral-300 shadow-2xl max-w-5xl w-full p-6 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-neutral-900" />
                <h2 className="text-lg font-bold text-neutral-950 font-sans">
                  Switch Invoice Template Design
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="p-1 rounded-xs text-neutral-400 hover:text-neutral-800"
              >
                <X size={18} />
              </button>
            </div>

            <TemplateSelector
              selectedTemplateId={formData.templateId}
              onSelectTemplate={(templateId, scannedData) => {
                handleSelectTemplateAndOpenEditor(templateId, scannedData);
              }}
              onClose={() => setShowTemplateModal(false)}
            />
          </div>
        </div>
      )}

      {/* SUCCESS CONFIRMATION MODAL */}
      {generatedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xs border border-neutral-300 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-center font-sans">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 size={24} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-neutral-950">
                Tax Invoice Created & Saved!
              </h3>
              <p className="text-xs text-neutral-500 mt-1 font-mono">
                {generatedInvoice.invoiceNumber} • {generatedInvoice.customerName}
              </p>
            </div>

            <div className="p-3.5 bg-neutral-50 rounded-xs border border-neutral-200 font-mono text-xs space-y-1.5 text-left">
              <div className="flex justify-between">
                <span className="text-neutral-500 font-sans">Grand Total:</span>
                <span className="font-bold text-neutral-950">{formatINR(generatedInvoice.grandTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-sans">Applied Template:</span>
                <span className="font-semibold text-neutral-800 uppercase">{selectedTemplateMeta.number} - {selectedTemplateMeta.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-sans">Status:</span>
                <span className="text-emerald-700 font-bold">SENT (Unpaid)</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 px-3 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 rounded-xs text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer size={13} />
                <span>Print PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setGeneratedInvoice(null);
                  if (onInvoiceCreated) {
                    onInvoiceCreated(generatedInvoice.id);
                  } else if (onBackToSales) {
                    onBackToSales();
                  }
                }}
                className="flex-1 py-2 px-3 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xs text-xs font-mono font-semibold transition-colors"
              >
                View in Sales →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
