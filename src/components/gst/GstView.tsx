import React, { useState } from 'react';
import {
  FileCheck2,
  Download,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { formatINR, formatDate } from '../../utils/formatters';

interface GstViewProps {
  navigate: (route: string) => void;
}

export const GstView: React.FC<GstViewProps> = ({ navigate }) => {
  const { invoices, purchaseBills, currentOrg } = useAccounting();

  const [activeReturnTab, setActiveReturnTab] = useState<'GSTR-1' | 'GSTR-3B' | 'GSTR-2B' | 'HSN-Summary'>('GSTR-1');
  const [selectedMonth, setSelectedMonth] = useState('July 2026');
  const [isExporting, setIsExporting] = useState(false);
  const [isReturnFiled, setIsReturnFiled] = useState(false);

  // Computations
  const outputCgst = invoices.reduce((sum, i) => sum + i.cgst, 0);
  const outputSgst = invoices.reduce((sum, i) => sum + i.sgst, 0);
  const outputIgst = invoices.reduce((sum, i) => sum + i.igst, 0);
  const totalOutputLiability = outputCgst + outputSgst + outputIgst;

  const itcCgst = purchaseBills.filter((b) => b.itcEligible).reduce((sum, b) => sum + b.cgst, 0) + 4000; // plus expense ITC
  const itcSgst = purchaseBills.filter((b) => b.itcEligible).reduce((sum, b) => sum + b.sgst, 0) + 4000;
  const itcIgst = purchaseBills.filter((b) => b.itcEligible).reduce((sum, b) => sum + b.igst, 0);
  const totalItcAvailable = itcCgst + itcSgst + itcIgst;

  const netGstPayable = Math.max(0, totalOutputLiability - totalItcAvailable);

  const handleExportJson = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      // create simulated download
      const element = document.createElement('a');
      const file = new Blob([JSON.stringify({ gstin: currentOrg?.gstin, fp: '072026', b2b: invoices }, null, 2)], {
        type: 'application/json',
      });
      element.href = URL.createObjectURL(file);
      element.download = `GSTR1_${currentOrg?.gstin}_072026.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 p-6 rounded-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-950 tracking-tight">
              GST Compliance & Statutory Returns Hub
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 rounded-xs">
              Portal Synced
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-1">
            GSTIN: <span className="font-bold text-slate-900">{currentOrg?.gstin}</span> • State: {currentOrg?.state}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xs text-xs font-mono bg-white text-slate-900 focus:outline-none"
          >
            <option value="July 2026">Return Period: July 2026</option>
            <option value="June 2026">Return Period: June 2026</option>
            <option value="May 2026">Return Period: May 2026</option>
          </select>

          <button
            onClick={handleExportJson}
            id="export-gstr-json-btn"
            className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xs flex items-center gap-2 transition-colors"
          >
            <Download size={14} />
            <span>{isExporting ? 'Generating JSON...' : 'Export GSTR-1 JSON'}</span>
          </button>
        </div>
      </div>

      {/* Tax Liability & ITC Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Output Liability */}
        <div className="bg-white border border-slate-200 p-5 rounded-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase text-slate-500">
              Total Output Tax Liability
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded-xs">
              Table 3.1 (a)
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-950">
            {formatINR(totalOutputLiability)}
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>CGST (Central):</span>
              <span>{formatINR(outputCgst)}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST (State):</span>
              <span>{formatINR(outputSgst)}</span>
            </div>
            <div className="flex justify-between">
              <span>IGST (Integrated):</span>
              <span>{formatINR(outputIgst)}</span>
            </div>
          </div>
        </div>

        {/* Input Tax Credit */}
        <div className="bg-white border border-slate-200 p-5 rounded-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase text-slate-500">
              Eligible Input Tax Credit (ITC)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xs">
              Table 4 (A) (5)
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">
            {formatINR(totalItcAvailable)}
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>CGST Credit:</span>
              <span>{formatINR(itcCgst)}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST Credit:</span>
              <span>{formatINR(itcSgst)}</span>
            </div>
            <div className="flex justify-between">
              <span>IGST Credit:</span>
              <span>{formatINR(itcIgst)}</span>
            </div>
          </div>
        </div>

        {/* Net GST Payable */}
        <div className="bg-white border border-slate-200 p-5 rounded-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase text-slate-500">
                Net GST Cash Liability
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-900 text-white rounded-xs">
                GSTR-3B Table 6.1
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-950 mt-2">
              {formatINR(netGstPayable)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-1">
              Due Date: <span className="font-bold text-slate-900">20th August 2026</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            {!isReturnFiled ? (
              <button
                onClick={() => setIsReturnFiled(true)}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xs transition-colors"
              >
                Mark Return as Filed with GSTN
              </button>
            ) : (
              <div className="p-2 bg-emerald-50 text-emerald-800 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 rounded-xs">
                <CheckCircle2 size={14} />
                <span>Return Filed & ARN Generated</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Return Tabs */}
      <div className="bg-white border border-slate-200 rounded-xs overflow-hidden">
        <div className="border-b border-slate-200 p-3 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {(['GSTR-1', 'GSTR-3B', 'GSTR-2B', 'HSN-Summary'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveReturnTab(tab)}
                className={`px-3 py-1.5 text-xs font-mono rounded-xs transition-colors ${
                  activeReturnTab === tab
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-950 bg-white border border-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-slate-500 hidden sm:block">
            Standard Schedule III Schema
          </div>
        </div>

        {/* Tab 1: GSTR-1 View */}
        {activeReturnTab === 'GSTR-1' && (
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Table 4A, 4B, 4C, 6B, 6C — B2B Taxable Outward Invoices
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Taxable supplies made to registered business entities in {selectedMonth}
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xs">
              <table className="w-full swiss-table">
                <thead>
                  <tr>
                    <th>Invoice No</th>
                    <th>Invoice Date</th>
                    <th>Customer Name</th>
                    <th>Customer GSTIN</th>
                    <th>Place of Supply</th>
                    <th className="text-right">Taxable Value</th>
                    <th className="text-right">CGST</th>
                    <th className="text-right">SGST</th>
                    <th className="text-right">IGST</th>
                    <th className="text-right">Invoice Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                      <td className="font-mono text-slate-600">{formatDate(inv.date)}</td>
                      <td className="font-medium text-slate-900">{inv.customerName}</td>
                      <td className="font-mono text-slate-700">{inv.customerGstin}</td>
                      <td className="font-mono text-slate-600">27-Maharashtra</td>
                      <td className="font-mono text-right">{formatINR(inv.taxableAmount)}</td>
                      <td className="font-mono text-right">{formatINR(inv.cgst)}</td>
                      <td className="font-mono text-right">{formatINR(inv.sgst)}</td>
                      <td className="font-mono text-right">{formatINR(inv.igst)}</td>
                      <td className="font-mono text-right font-bold text-slate-950">
                        {formatINR(inv.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: GSTR-3B View */}
        {activeReturnTab === 'GSTR-3B' && (
          <div className="p-6 space-y-6 text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Form GSTR-3B Monthly Return Computation
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Summary return of outward supplies and input tax credit claimed
              </p>
            </div>

            {/* Table 3.1 */}
            <div className="border border-slate-200 rounded-xs overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 font-mono font-bold text-slate-800 border-b border-slate-200">
                3.1 Details of Outward Supplies and inward supplies liable to reverse charge
              </div>
              <table className="w-full swiss-table">
                <thead>
                  <tr>
                    <th>Nature of Supplies</th>
                    <th className="text-right">Total Taxable Value</th>
                    <th className="text-right">IGST</th>
                    <th className="text-right">CGST</th>
                    <th className="text-right">SGST</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-medium text-slate-900">
                      (a) Outward taxable supplies (other than zero rated, nil rated and exempted)
                    </td>
                    <td className="text-right font-mono font-bold">
                      {formatINR(invoices.reduce((s, i) => s + i.taxableAmount, 0))}
                    </td>
                    <td className="text-right font-mono">{formatINR(outputIgst)}</td>
                    <td className="text-right font-mono">{formatINR(outputCgst)}</td>
                    <td className="text-right font-mono">{formatINR(outputSgst)}</td>
                  </tr>
                  <tr>
                    <td className="text-slate-600">(b) Outward taxable supplies (zero rated)</td>
                    <td className="text-right font-mono">₹0</td>
                    <td className="text-right font-mono">₹0</td>
                    <td className="text-right font-mono">₹0</td>
                    <td className="text-right font-mono">₹0</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Table 4 Eligible ITC */}
            <div className="border border-slate-200 rounded-xs overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 font-mono font-bold text-slate-800 border-b border-slate-200">
                4. Eligible Input Tax Credit (ITC)
              </div>
              <table className="w-full swiss-table">
                <thead>
                  <tr>
                    <th>Details</th>
                    <th className="text-right">IGST</th>
                    <th className="text-right">CGST</th>
                    <th className="text-right">SGST</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-medium text-slate-900">
                      (A) (5) All other ITC (Inward supplies from registered persons)
                    </td>
                    <td className="text-right font-mono text-emerald-700 font-bold">{formatINR(itcIgst)}</td>
                    <td className="text-right font-mono text-emerald-700 font-bold">{formatINR(itcCgst)}</td>
                    <td className="text-right font-mono text-emerald-700 font-bold">{formatINR(itcSgst)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: GSTR-2B View */}
        {activeReturnTab === 'GSTR-2B' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  GSTR-2B Auto-Drafted Input Tax Credit Statement
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Static ITC statement generated on the 14th of the month by GST Portal
                </p>
              </div>
              <span className="px-2.5 py-1 text-xs font-mono font-bold bg-emerald-100 text-emerald-900 rounded-xs">
                100% ITC Matched (0 Discrepancies)
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xs">
              <table className="w-full swiss-table">
                <thead>
                  <tr>
                    <th>Supplier GSTIN</th>
                    <th>Supplier Trade Name</th>
                    <th>Bill Number</th>
                    <th>Bill Date</th>
                    <th className="text-right">Taxable Value</th>
                    <th className="text-right">ITC Available</th>
                    <th className="text-center">GSTR-1 Filed by Vendor</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseBills.map((b) => (
                    <tr key={b.id}>
                      <td className="font-mono text-slate-900">{b.vendorGstin}</td>
                      <td className="font-medium text-slate-900">{b.vendorName}</td>
                      <td className="font-mono text-slate-700">{b.billNumber}</td>
                      <td className="font-mono text-slate-600">{formatDate(b.date)}</td>
                      <td className="font-mono text-right">{formatINR(b.taxableAmount)}</td>
                      <td className="font-mono text-right text-emerald-700 font-bold">
                        {formatINR(b.cgst + b.sgst + b.igst)}
                      </td>
                      <td className="text-center font-mono text-emerald-800 text-xs font-semibold">
                        Yes (Filed)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: HSN Summary */}
        {activeReturnTab === 'HSN-Summary' && (
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Table 12 — HSN-Wise Summary of Outward Supplies
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Mandatory 4-digit / 6-digit Harmonized System of Nomenclature reporting
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xs">
              <table className="w-full swiss-table">
                <thead>
                  <tr>
                    <th>HSN Code</th>
                    <th>Description</th>
                    <th>UQC (Unit)</th>
                    <th className="text-center">Total Quantity</th>
                    <th className="text-right">Total Taxable Value</th>
                    <th className="text-right">Rate</th>
                    <th className="text-right">Total Tax Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-mono font-bold text-slate-900">8466</td>
                    <td className="font-medium text-slate-900">Parts & Accessories for Machine Tools</td>
                    <td className="font-mono">NOS</td>
                    <td className="text-center font-mono">14</td>
                    <td className="text-right font-mono">₹12,40,000</td>
                    <td className="text-right font-mono">18%</td>
                    <td className="text-right font-mono font-bold">₹2,23,200</td>
                  </tr>
                  <tr>
                    <td className="font-mono font-bold text-slate-900">7208</td>
                    <td className="font-medium text-slate-900">Flat-rolled products of iron/steel</td>
                    <td className="font-mono">SET</td>
                    <td className="text-center font-mono">8</td>
                    <td className="text-right font-mono">₹8,65,000</td>
                    <td className="text-right font-mono">18%</td>
                    <td className="text-right font-mono font-bold">₹1,55,700</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
