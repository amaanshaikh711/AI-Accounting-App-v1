import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  CreditCard,
  Building,
  Sparkles,
  FileCheck2,
  ChevronRight,
  Filter,
  CheckCircle2,
  X,
  ExternalLink,
  Plus
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { formatINR, formatDate } from '../../utils/formatters';
import { Transaction } from '../../types';

interface DashboardViewProps {
  navigate: (route: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ navigate }) => {
  const { currentUser, currentOrg, metrics, transactions, invoices, reviewItems } = useAccounting();
  const [chartPeriod, setChartPeriod] = useState<'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Time formatted
  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Recent transactions
  const recentTransactions = transactions.slice(0, 6);

  // Action required items
  const actionItems = [
    {
      id: 'act_1',
      title: '4 overdue customer invoices',
      impact: '₹3,27,450 pending past payment credit terms',
      severity: 'high',
      route: '/sales',
      tag: 'Receivables',
    },
    {
      id: 'act_2',
      title: `${metrics.pendingReviewCount} transactions require AI audit review`,
      impact: 'Potential duplicate NEFT & missing GSTIN vendor payment',
      severity: 'high',
      route: '/review',
      tag: 'Review Queue',
    },
    {
      id: 'act_3',
      title: 'GSTR-3B Input Tax Credit (ITC) reconciliation pending',
      impact: '₹78,420 claimable ITC ready for monthly return filing',
      severity: 'medium',
      route: '/gst',
      tag: 'GST Compliance',
    },
    {
      id: 'act_4',
      title: '1 bank statement feed line unreconciled',
      impact: 'HDFC Bank Current Account #0060 (Credit ₹65,000)',
      severity: 'medium',
      route: '/banking',
      tag: 'Banking',
    },
    {
      id: 'act_5',
      title: '2 draft expenses awaiting manager approval',
      impact: 'Professional CA retainer fees & logistics invoices',
      severity: 'low',
      route: '/expenses',
      tag: 'Expenses',
    },
  ];

  // Cash flow chart data (Swiss Minimalist clean bars / lines)
  const monthlyData = [
    { label: 'Apr 26', revenue: 1840000, expense: 720000 },
    { label: 'May 26', revenue: 2100000, expense: 790000 },
    { label: 'Jun 26', revenue: 1950000, expense: 810000 },
    { label: 'Jul 26', revenue: 2320000, expense: 805000 },
    { label: 'Aug 26', revenue: 2482400, expense: 842100 },
  ];

  const quarterlyData = [
    { label: 'Q1 (Apr-Jun)', revenue: 5890000, expense: 2320000 },
    { label: 'Q2 (Jul-Sep)', revenue: 4802400, expense: 1647100 },
  ];

  const chartData = chartPeriod === 'Monthly' ? monthlyData : quarterlyData;
  const maxVal = Math.max(...chartData.map((d) => Math.max(d.revenue, d.expense))) * 1.15;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Row with Greetings & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Overview
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {todayFormatted} • FY {currentOrg?.financialYear || '2026-27'}
          </p>
        </div>

        {/* Quick Voucher Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/sales')}
            id="quick-new-invoice-btn"
            className="px-4 py-2 border border-neutral-900 bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest transition-colors hover:bg-neutral-800 flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>New Invoice</span>
          </button>
          <button
            onClick={() => navigate('/expenses')}
            id="quick-new-expense-btn"
            className="px-4 py-2 border border-neutral-300 bg-white text-neutral-900 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-neutral-50 flex items-center gap-1.5"
          >
            <CreditCard size={14} className="text-neutral-500" />
            <span>Create Expense</span>
          </button>
          <button
            onClick={() => navigate('/ai-assistant/documents')}
            id="quick-scan-ocr-btn"
            className="px-4 py-2 border border-neutral-300 bg-white text-neutral-900 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-neutral-50 flex items-center gap-1.5"
          >
            <Sparkles size={14} className="text-neutral-700" />
            <span>Scan Bill (OCR)</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Grid (Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-6 border border-neutral-200">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
            Total Revenue (YTD)
          </p>
          <h3 className="text-2xl font-light text-neutral-900 font-mono-nums">
            {formatINR(metrics.revenue, false)}
          </h3>
          <p className="mt-2 text-[10px] font-bold text-green-600 uppercase tracking-tighter flex items-center gap-1">
            <TrendingUp size={11} />
            <span>+12.4% vs prev period</span>
          </p>
        </div>

        {/* Operating Expenses */}
        <div className="bg-white p-6 border border-neutral-200">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
            Operating Expenses
          </p>
          <h3 className="text-2xl font-light text-neutral-900 font-mono-nums">
            {formatINR(metrics.expenses, false)}
          </h3>
          <p className="mt-2 text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">
            ₹5.4L Payroll incl.
          </p>
        </div>

        {/* Accounts Receivable */}
        <div
          onClick={() => navigate('/sales')}
          className="bg-white p-6 border border-neutral-200 cursor-pointer hover:border-neutral-400 transition-colors"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
              Accounts Receivable
            </p>
            <ChevronRight size={12} className="text-neutral-400" />
          </div>
          <h3 className="text-2xl font-light text-blue-700 font-mono-nums">
            {formatINR(metrics.receivables, false)}
          </h3>
          <p className="mt-2 text-[10px] font-bold text-amber-600 uppercase tracking-tighter">
            4 Invoices Pending
          </p>
        </div>

        {/* Cash & Bank Balance */}
        <div className="bg-white p-6 border border-neutral-200">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
            Cash & Liquid Funds
          </p>
          <h3 className="text-2xl font-light text-neutral-900 font-mono-nums">
            {formatINR(metrics.cashAndBank, false)}
          </h3>
          <p className="mt-2 text-[10px] font-bold text-green-600 uppercase tracking-tighter flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            <span>3 Bank A/cs Reconciled</span>
          </p>
        </div>
      </div>

      {/* Main Content Grid: Transactions Table (Left 2 cols) & Action / AI Box (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Recent Transactions Table */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500">
              Recent Transactions
            </h2>
            <button
              onClick={() => navigate('/transactions')}
              className="text-[10px] text-blue-600 font-bold uppercase tracking-widest cursor-pointer hover:underline"
            >
              View Ledger
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {recentTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTransaction(tx)}
                    className="hover:bg-neutral-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-neutral-500 whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-4 py-3 font-medium text-neutral-900 max-w-xs truncate">
                      <div className="truncate">{tx.description}</div>
                      {tx.partyName && (
                        <div className="text-[10px] text-neutral-400 font-normal">
                          {tx.partyName}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-mono text-neutral-600">
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-neutral-900 whitespace-nowrap">
                      {formatINR(tx.amount)}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 font-bold uppercase text-[9px] tracking-tight ${
                          tx.status === 'Paid' || tx.status === 'Reconciled'
                            ? 'bg-green-100 text-green-700'
                            : tx.status === 'Pending Review'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cash Flow Sparkline Bar at bottom of table card */}
          <div className="p-4 border-t border-neutral-100 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                Monthly Operating Cash Trend
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">
                FY {currentOrg?.financialYear}
              </span>
            </div>
            <div className="h-16 flex items-end justify-between gap-3 pt-2">
              {chartData.map((item, idx) => {
                const revHeight = Math.max(15, (item.revenue / maxVal) * 100);
                const expHeight = Math.max(10, (item.expense / maxVal) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div className="w-full flex items-end justify-center gap-1 h-12">
                      <div
                        className="w-1/2 max-w-[12px] bg-neutral-900 transition-all rounded-none"
                        style={{ height: `${revHeight}%` }}
                        title={`Revenue: ${formatINR(item.revenue, false)}`}
                      />
                      <div
                        className="w-1/2 max-w-[12px] bg-neutral-300 transition-all rounded-none"
                        style={{ height: `${expHeight}%` }}
                        title={`Expense: ${formatINR(item.expense, false)}`}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-neutral-400 truncate">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 col: Action Required & AI Box */}
        <div className="flex flex-col space-y-6">
          {/* Action Required Card */}
          <div className="bg-white p-5 border border-neutral-200 flex-1 flex flex-col">
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4 flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Action Required ({actionItems.length})
            </h2>

            <div className="space-y-4 flex-1">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between border-b border-neutral-100 pb-3 last:border-0 last:pb-0"
                >
                  <div className="pr-3">
                    <p className="text-xs font-bold text-neutral-900">{item.title}</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">{item.impact}</p>
                  </div>
                  <button
                    onClick={() => navigate(item.route)}
                    className="text-[10px] font-bold text-blue-600 uppercase hover:underline shrink-0"
                  >
                    Resolve
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 mt-3 border-t border-neutral-100">
              <button
                onClick={() => navigate('/review')}
                className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-900 w-full text-center"
              >
                Open Compliance Queue →
              </button>
            </div>
          </div>

          {/* AI Insights Dark Accent Block */}
          <div className="bg-neutral-900 p-5 text-white flex-shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
              AI Financial Insight
            </p>
            <p className="text-xs italic leading-relaxed text-neutral-300">
              "Accounts receivable increased 14% this month. Invoices for CloudTech and Beta Labs are approaching 30 days overdue. Recommended action: send automated WhatsApp reminders."
            </p>
            <button
              onClick={() => navigate('/insights')}
              className="mt-3 text-[9px] font-bold uppercase tracking-widest border border-neutral-700 px-3 py-1 hover:bg-neutral-800 transition-colors inline-block"
            >
              View Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Detail Slide-out Drawer */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-2xs transition-opacity"
            onClick={() => setSelectedTransaction(null)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl border-l border-neutral-200 flex flex-col">
              <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 font-mono">
                    Voucher Detail • {selectedTransaction.id}
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono">
                    Posted on {formatDate(selectedTransaction.date)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="p-1 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-5 text-xs">
                <div className="bg-neutral-50 border border-neutral-200 p-4">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    Total Amount
                  </div>
                  <div className="text-2xl font-light font-mono-nums text-neutral-900 mt-1">
                    {formatINR(selectedTransaction.amount)}
                  </div>
                  <div className="mt-1 text-neutral-500 text-xs">
                    {selectedTransaction.description}
                  </div>
                </div>

                {selectedTransaction.isAiFlagged && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900">
                    <div className="font-bold flex items-center gap-1.5 text-xs">
                      <AlertCircle size={14} className="text-amber-700" />
                      <span>AI Review Notification</span>
                    </div>
                    <p className="text-[11px] mt-1 font-sans">
                      {selectedTransaction.aiFlagReason}
                    </p>
                  </div>
                )}

                <div className="space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between border-b border-neutral-100 pb-1.5">
                    <span className="text-neutral-500 font-sans">Voucher Type:</span>
                    <span className="font-bold text-neutral-900">{selectedTransaction.type}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-100 pb-1.5">
                    <span className="text-neutral-500 font-sans">Counterparty:</span>
                    <span className="text-neutral-900 font-semibold">{selectedTransaction.partyName}</span>
                  </div>
                  {selectedTransaction.partyGstin && (
                    <div className="flex justify-between border-b border-neutral-100 pb-1.5">
                      <span className="text-neutral-500 font-sans">Party GSTIN:</span>
                      <span className="text-neutral-900">{selectedTransaction.partyGstin}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-neutral-100 pb-1.5">
                    <span className="text-neutral-500 font-sans">Taxable Base Value:</span>
                    <span className="text-neutral-900">{formatINR(selectedTransaction.taxableAmount)}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-100 pb-1.5">
                    <span className="text-neutral-500 font-sans">GST Rate & Tax:</span>
                    <span className="text-neutral-900">
                      {selectedTransaction.gstRate}% ({formatINR(selectedTransaction.gstAmount)})
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-100 pb-1.5">
                    <span className="text-neutral-500 font-sans">Account Debited/Credited:</span>
                    <span className="text-neutral-900">{selectedTransaction.account}</span>
                  </div>
                  {selectedTransaction.referenceNo && (
                    <div className="flex justify-between border-b border-neutral-100 pb-1.5">
                      <span className="text-neutral-500 font-sans">Reference / Bill No:</span>
                      <span className="text-neutral-900">{selectedTransaction.referenceNo}</span>
                    </div>
                  )}
                </div>

                {/* Double-Entry Journal Posting */}
                <div className="mt-4 pt-4 border-t border-neutral-200">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
                    Double-Entry Journal Posting
                  </div>
                  <div className="bg-neutral-900 text-neutral-200 p-3 font-mono text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span>Dr. {selectedTransaction.partyName} Ledger</span>
                      <span>{formatINR(selectedTransaction.amount)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400 pl-4">
                      <span>Cr. {selectedTransaction.account}</span>
                      <span>{formatINR(selectedTransaction.amount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-widest w-full transition-colors"
                >
                  Close Voucher View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
