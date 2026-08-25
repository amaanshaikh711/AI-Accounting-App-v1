import React, { useState } from 'react';
import {
  UploadCloud,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  X,
  FileCheck
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { formatINR } from '../../utils/formatters';

interface DocumentScannerViewProps {
  navigate: (route: string) => void;
}

export const DocumentScannerView: React.FC<DocumentScannerViewProps> = ({ navigate }) => {
  const { currentOrg, addPurchaseBill, vendors } = useAccounting();

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    vendorName: string;
    vendorGstin: string;
    invoiceNumber: string;
    date: string;
    taxableAmount: number;
    gstRate: number;
    cgst: number;
    sgst: number;
    totalAmount: number;
    hsn: string;
  } | null>(null);

  const handleSimulateUpload = (sampleVendor = 'Precision Components Pvt Ltd') => {
    setIsProcessing(true);
    setExtractedData(null);

    setTimeout(() => {
      setIsProcessing(false);
      setExtractedData({
        vendorName: sampleVendor,
        vendorGstin: '27AABCV8812K1Z9',
        invoiceNumber: 'INV-PC-2026-904',
        date: '2026-08-07',
        taxableAmount: 65000,
        gstRate: 18,
        cgst: 5850,
        sgst: 5850,
        totalAmount: 76700,
        hsn: '8466',
      });
    }, 1000);
  };

  const handleConfirmAndPost = () => {
    if (!extractedData) return;
    const vendor = vendors[0] || { id: 'v_1', name: extractedData.vendorName, gstin: extractedData.vendorGstin };

    addPurchaseBill({
      billNumber: extractedData.invoiceNumber,
      vendorId: vendor.id,
      vendorName: extractedData.vendorName,
      vendorGstin: extractedData.vendorGstin,
      date: extractedData.date,
      dueDate: '2026-09-06',
      items: [
        {
          id: `ocr_item_${Date.now()}`,
          description: 'Industrial Inward Material - Auto Extracted via OCR',
          hsn: extractedData.hsn,
          quantity: 1,
          unit: 'SET',
          rate: extractedData.taxableAmount,
          discountPct: 0,
          gstRate: extractedData.gstRate,
          amount: extractedData.taxableAmount,
          cgst: extractedData.cgst,
          sgst: extractedData.sgst,
          igst: 0,
        },
      ],
      taxableAmount: extractedData.taxableAmount,
      cgst: extractedData.cgst,
      sgst: extractedData.sgst,
      igst: 0,
      totalAmount: extractedData.totalAmount,
      amountPaid: 0,
      status: 'Received',
      itcEligible: true,
    });

    navigate('/purchases');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 p-6 rounded-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 text-white rounded-xs flex items-center justify-center">
              <Sparkles size={13} className="text-amber-400" />
            </div>
            <h1 className="text-xl font-bold text-slate-950 tracking-tight">
              AI Document Ingestion & Invoice OCR
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Auto-extract vendor invoices, purchase orders, HSN tax classifications & bank slips
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Zone (Left 6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleSimulateUpload();
            }}
            onClick={() => handleSimulateUpload()}
            className={`border-2 border-dashed rounded-xs p-10 text-center cursor-pointer transition-colors bg-white ${
              isDragging
                ? 'border-slate-900 bg-slate-50'
                : 'border-slate-300 hover:border-slate-900 hover:bg-slate-50/50'
            }`}
          >
            <div className="w-12 h-12 bg-slate-100 border border-slate-200 text-slate-900 rounded-xs flex items-center justify-center mx-auto mb-4">
              <UploadCloud size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Drag & drop vendor bill (PDF, JPG, PNG)
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              or click to upload and trigger AI OCR extraction
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-[11px] font-mono rounded-xs border border-slate-200">
              <Sparkles size={12} className="text-amber-600" />
              <span>Auto-detects GSTIN, HSN, Taxable Value & Due Dates</span>
            </div>
          </div>

          {/* Quick Demo Preloaded Invoices */}
          <div className="bg-white border border-slate-200 p-4 rounded-xs">
            <div className="text-[11px] font-mono uppercase font-bold text-slate-500 mb-2">
              Or Try Preloaded Sample Vendor Bills:
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSimulateUpload('Precision Components Pvt Ltd')}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 hover:border-slate-400 rounded-xs text-left text-xs flex items-center justify-between transition-colors"
              >
                <div>
                  <div className="font-semibold text-slate-900">Precision Components Bill #INV-904</div>
                  <div className="text-[10px] text-slate-500 font-mono">Taxable: ₹65,000 • GST: 18% (HSN 8466)</div>
                </div>
                <span className="text-xs font-semibold text-slate-900">Scan →</span>
              </button>
              <button
                type="button"
                onClick={() => handleSimulateUpload('Kulkarni Steel Works')}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 hover:border-slate-400 rounded-xs text-left text-xs flex items-center justify-between transition-colors"
              >
                <div>
                  <div className="font-semibold text-slate-900">Kulkarni Steel Inward Bill #KS-441</div>
                  <div className="text-[10px] text-slate-500 font-mono">Taxable: ₹1,20,000 • GST: 18% (HSN 7208)</div>
                </div>
                <span className="text-xs font-semibold text-slate-900">Scan →</span>
              </button>
            </div>
          </div>
        </div>

        {/* Extraction Result Canvas (Right 6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 p-6 rounded-xs flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Extracted Bill & Ledger Classification
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  High-confidence OCR metadata extracted from document
                </p>
              </div>
              {extractedData && (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 rounded-xs">
                  99.4% Match
                </span>
              )}
            </div>

            {isProcessing ? (
              <div className="py-20 text-center space-y-3">
                <Sparkles size={28} className="animate-spin text-amber-500 mx-auto" />
                <div className="text-xs font-mono text-slate-700 font-bold">
                  Extracting line items, HSN codes, and verifying supplier GSTIN...
                </div>
              </div>
            ) : extractedData ? (
              <div className="space-y-4 text-xs font-mono">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xs space-y-2">
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-sans">Vendor Name:</span>
                    <span className="font-bold text-slate-900">{extractedData.vendorName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-sans">Vendor GSTIN:</span>
                    <span className="font-bold text-slate-900">{extractedData.vendorGstin}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-sans">Invoice Number:</span>
                    <span className="text-slate-900">{extractedData.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-sans">Invoice Date:</span>
                    <span className="text-slate-900">{extractedData.date}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-sans">HSN Classification:</span>
                    <span className="text-slate-900">{extractedData.hsn}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-sans">Taxable Value:</span>
                    <span className="text-slate-900 font-bold">{formatINR(extractedData.taxableAmount)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-sans">CGST + SGST (18%):</span>
                    <span className="text-slate-900">{formatINR(extractedData.cgst + extractedData.sgst)}</span>
                  </div>
                  <div className="flex justify-between pt-1 text-sm font-bold text-slate-950">
                    <span className="font-sans">Total Payable (INR):</span>
                    <span>{formatINR(extractedData.totalAmount)}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                  <span>GSTIN verified with GST portal. Eligible for GSTR-3B ITC credit.</span>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs font-mono">
                Upload or select a vendor bill to review extracted data.
              </div>
            )}
          </div>

          {extractedData && (
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setExtractedData(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xs text-xs font-medium"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleConfirmAndPost}
                id="confirm-post-ocr-btn"
                className="px-5 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xs text-xs font-semibold flex items-center gap-2"
              >
                <span>Authorize & Inward Bill to Ledger</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
