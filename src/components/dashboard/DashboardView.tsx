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
  ScanLine,
  FileSpreadsheet,
  FileCheck2,
  ChevronRight,
  Filter,
  CheckCircle2,
  X,
  ExternalLink,
  Plus,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useAccounting } from '../../context/AccountingContext';
import { formatINR, formatDate } from '../../utils/formatters';
import { Transaction } from '../../types';

interface DashboardViewProps {
  navigate: (route: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ navigate }) => {
  const { currentUser, currentOrg, metrics, transactions, invoices, expenses, reviewItems } = useAccounting();
  const [chartPeriod, setChartPeriod] = useState<'Monthly' | 'Quarterly'>('Monthly');
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
      title: `${metrics.pendingReviewCount} transactions require compliance review`,
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

  // Chart 1 Data: Monthly Operating Cash Trend (Line / Area)
  const monthlyCashTrendData = [
    { month: 'Apr 26', inflow: 1840000, outflow: 720000, netCash: 1120000 },
    { month: 'May 26', inflow: 2100000, outflow: 790000, netCash: 1310000 },
    { month: 'Jun 26', inflow: 1950000, outflow: 810000, netCash: 1140000 },
    { month: 'Jul 26', inflow: 2320000, outflow: 805000, netCash: 1515000 },
    { month: 'Aug 26', inflow: 2482400, outflow: 842100, netCash: 1640300 },
  ];

  const quarterlyCashTrendData = [
    { month: 'Q1 (Apr-Jun)', inflow: 5890000, outflow: 2320000, netCash: 3570000 },
    { month: 'Q2 (Jul-Sep)', inflow: 4802400, outflow: 1647100, netCash: 3155300 },
  ];

  const currentCashTrend = chartPeriod === 'Monthly' ? monthlyCashTrendData : quarterlyCashTrendData;

  // Chart 2 Data: Revenue vs Expenses (Bar Chart)
  const revenueExpensesData = [
    { month: 'Apr 26', revenue: 1840000, expense: 720000 },
    { month: 'May 26', revenue: 2100000, expense: 790000 },
    { month: 'Jun 26', revenue: 1950000, expense: 810000 },
    { month: 'Jul 26', revenue: 2320000, expense: 805000 },
    { month: 'Aug 26', revenue: 2482400, expense: 842100 },
  ];

  // Chart 3 Data: Expense Breakdown (Donut Chart)
  const expenseBreakdownData = [
    { name: 'Payroll & Salaries', value: 450000, color: '#0f172a' },
    { name: 'Raw Materials & COGS', value: 210000, color: '#334155' },
    { name: 'Office & Facilities', value: 85000, color: '#64748b' },
    { name: 'Logistics & Freight', value: 52000, color: '#94a3b8' },
    { name: 'Software & Tech', value: 28000, color: '#cbd5e1' },
    { name: 'Utilities & Other', value: 17100, color: '#e2e8f0' },
  ];

  const totalExpenseVal = expenseBreakdownData.reduce((sum, item) => sum + item.value, 0);

  // Custom Tooltip for Area / Bar Charts
  const CustomCurrencyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 text-white p-3 rounded-xs shadow-xl border border-slate-800 text-xs font-mono">
          <p className="font-bold text-slate-200 mb-1.5 pb-1 border-b border-slate-800 font-sans">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5 text-slate-400 font-sans">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.stroke || entry.fill }}></span>
                {entry.name}:
              </span>
              <span className="font-bold text-white">{formatINR(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Donut Chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const pct = ((data.value / totalExpenseVal) * 100).toFixed(1);
      return (
        <div className="bg-slate-950 text-white p-2.5 rounded-xs shadow-xl border border-slate-800 text-xs font-mono">
          <p className="font-bold text-slate-200 mb-1 font-sans">{data.name}</p>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400 font-sans">Amount:</span>
            <span className="font-bold text-white">{formatINR(data.value)}</span>
          </div>
          <div className="flex justify-between gap-4 text-emerald-400">
            <span className="font-sans">Share:</span>
            <span>{pct}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Row with Greetings & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Overview
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5 font-sans">
            {todayFormatted} • FY {currentOrg?.financialYear || '2026-27'}
          </p>
        </div>

        {/* Quick Voucher Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/sales')}
            id="quick-new-invoice-btn"
            className="px-4 py-2 border border-neutral-900 bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest transition-colors hover:bg-neutral-800 flex items-center gap-1.5 rounded-xs"
          >
            <Plus size={14} />
            <span>New Invoice</span>
          </button>
          <button
            onClick={() => navigate('/expenses')}
            id="quick-new-expense-btn"
            className="px-4 py-2 border border-neutral-300 bg-white text-neutral-900 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-neutral-50 flex items-center gap-1.5 rounded-xs"
          >
            <CreditCard size={14} className="text-neutral-500" />
            <span>Create Expense</span>
          </button>
          <button
            onClick={() => navigate('/ai-assistant/documents')}
            id="quick-scan-ocr-btn"
            className="px-4 py-2 border border-neutral-300 bg-white text-neutral-900 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-neutral-50 flex items-center gap-1.5 rounded-xs"
          >
            <ScanLine size={14} className="text-neutral-700" />
            <span>Scan Bill (OCR)</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Grid (Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-6 border border-neutral-200 rounded-xs">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
            Total Revenue (YTD)
          </p>
          <h3 className="text-2xl font-light text-neutral-900 font-mono">
            {formatINR(metrics.revenue, false)}
          </h3>
          <p className="mt-2 text-[10px] font-bold text-emerald-700 uppercase tracking-tight flex items-center gap-1">
            <TrendingUp size={11} />
            <span>+12.4% vs prev period</span>
          </p>
        </div>

        {/* Operating Expenses */}
        <div className="bg-white p-6 border border-neutral-200 rounded-xs">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
            Operating Expenses
          </p>
          <h3 className="text-2xl font-light text-neutral-900 font-mono">
            {formatINR(metrics.expenses, false)}
          </h3>
          <p className="mt-2 text-[10px] font-bold text-neutral-500 uppercase tracking-tight font-mono">
            ₹4.5L Payroll incl.
          </p>
        </div>

        {/* Accounts Receivable */}
        <div
          onClick={() => navigate('/sales')}
          className="bg-white p-6 border border-neutral-200 rounded-xs cursor-pointer hover:border-neutral-400 transition-colors"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
              Accounts Receivable
            </p>
            <ChevronRight size={12} className="text-neutral-400" />
          </div>
          <h3 className="text-2xl font-light text-blue-700 font-mono">
            {formatINR(metrics.receivables, false)}
          </h3>
          <p className="mt-2 text-[10px] font-bold text-amber-700 uppercase tracking-tight">
            4 Invoices Pending
          </p>
        </div>

        {/* Cash & Bank Balance */}
        <div className="bg-white p-6 border border-neutral-200 rounded-xs">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
            Cash & Liquid Funds
          </p>
          <h3 className="text-2xl font-light text-neutral-900 font-mono">
            {formatINR(metrics.cashAndBank, false)}
          </h3>
          <p className="mt-2 text-[10px] font-bold text-emerald-700 uppercase tracking-tight flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>All Bank A/cs Reconciled</span>
          </p>
        </div>
      </div>

      {/* DASHBOARD CHARTS SECTION (2 Responsive Financial Visualizations) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Monthly Operating Cash Trend (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-neutral-200 rounded-xs p-5 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-neutral-100 gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Activity size={15} className="text-slate-800" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">
                  Monthly Operating Cash Trend
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Inflow vs Outflow & Net Operating Liquidity
              </p>
            </div>

            <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-xs">
              <button
                type="button"
                onClick={() => setChartPeriod('Monthly')}
                className={`px-2.5 py-1 text-[11px] font-mono rounded-xs transition-colors ${
                  chartPeriod === 'Monthly' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setChartPeriod('Quarterly')}
                className={`px-2.5 py-1 text-[11px] font-mono rounded-xs transition-colors ${
                  chartPeriod === 'Quarterly' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Quarterly
              </button>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentCashTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'monospace' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                  width={60}
                />
                <Tooltip content={<CustomCurrencyTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: 11, fontFamily: 'monospace' }}
                  iconType="circle"
                  iconSize={8}
                />
                <Area
                  type="monotone"
                  dataKey="inflow"
                  name="Cash Inflow"
                  stroke="#0f172a"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#inflowGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="outflow"
                  name="Cash Outflow"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#outflowGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Expense Breakdown (Donut Chart - 4 cols) */}
        <div className="lg:col-span-4 bg-white border border-neutral-200 rounded-xs p-5 flex flex-col justify-between">
          <div className="pb-3 border-b border-neutral-100 mb-2">
            <div className="flex items-center gap-2">
              <PieChartIcon size={15} className="text-slate-800" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">
                Expense Breakdown
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Operating cost categorization (FY 2026-27)
            </p>
          </div>

          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {expenseBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={1} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-mono uppercase text-slate-400">Total</span>
              <span className="text-xs font-bold font-mono text-slate-900">{formatINR(totalExpenseVal, false)}</span>
            </div>
          </div>

          {/* Clean minimal legend list */}
          <div className="space-y-1.5 pt-2 border-t border-neutral-100 text-xs">
            {expenseBreakdownData.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-slate-600 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="font-semibold text-slate-900 shrink-0">{formatINR(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Grid: Transactions Table (Left 2 cols) & Action / Compliance Box (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Recent Transactions Table */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-xs flex flex-col overflow-hidden">
          <div className="p-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-600">
              Recent Ledger Transactions
            </h2>
            <button
              onClick={() => navigate('/transactions')}
              className="text-[10px] text-blue-600 font-bold uppercase tracking-widest cursor-pointer hover:underline"
            >
              View Full Ledger →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Description & Party</th>
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
                      <div className="truncate font-semibold">{tx.description}</div>
                      {tx.partyName && (
                        <div className="text-[10px] text-neutral-500 font-normal truncate">
                          {tx.partyName} {tx.partyGstin ? `• ${tx.partyGstin}` : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-mono text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded-xs">
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-neutral-900 whitespace-nowrap">
                      {formatINR(tx.amount)}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 font-bold uppercase text-[9px] tracking-tight rounded-xs ${
                          tx.status === 'Paid' || tx.status === 'Reconciled'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.status === 'Pending Review'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-neutral-100 text-neutral-700'
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

          {/* Chart 2: Revenue vs Expenses Grouped Bar Chart at bottom of table */}
          <div className="p-4 border-t border-neutral-100 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  Monthly Revenue vs Operating Expenses
                </span>
                <span className="text-[10px] text-neutral-500 font-mono ml-2">
                  (FY {currentOrg?.financialYear || '2026-27'})
                </span>
              </div>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueExpensesData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                    width={50}
                  />
                  <Tooltip content={<CustomCurrencyTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: 6, fontSize: 11, fontFamily: 'monospace' }}
                    iconType="rect"
                    iconSize={10}
                  />
                  <Bar dataKey="revenue" name="Revenue" fill="#0f172a" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="expense" name="Expenses" fill="#94a3b8" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right 1 col: Action Required & Compliance Intelligence */}
        <div className="flex flex-col space-y-6">
          {/* Action Required Card */}
          <div className="bg-white p-5 border border-neutral-200 rounded-xs flex-1 flex flex-col">
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-600 mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                <span>Action Required</span>
              </div>
              <span className="text-[10px] font-mono bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full font-bold">
                {actionItems.length}
              </span>
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
                className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 hover:text-neutral-950 w-full text-center"
              >
                Open Compliance Queue →
              </button>
            </div>
          </div>

          {/* Compliance & Audit Insight Accent Block */}
          <div className="bg-neutral-900 p-5 text-white rounded-xs flex-shrink-0 border border-neutral-800">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2 flex items-center gap-1.5">
              <FileSpreadsheet size={12} className="text-emerald-400" />
              <span>Statutory Compliance Intelligence</span>
            </p>
            <p className="text-xs leading-relaxed text-neutral-300 font-sans">
              "Accounts receivable increased 14% this month. Invoices for CloudTech and Beta Labs are approaching 30 days overdue. Recommended action: send payment reminders."
            </p>
            <button
              onClick={() => navigate('/insights')}
              className="mt-3 text-[9px] font-bold uppercase tracking-widest border border-neutral-700 px-3 py-1.5 hover:bg-neutral-800 text-neutral-200 transition-colors inline-block rounded-xs"
            >
              View Financial Analysis →
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
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 xs:pl-6 sm:pl-10">
            <div className="w-screen max-w-full xs:max-w-md bg-white shadow-2xl border-l border-neutral-200 flex flex-col">
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
                  className="p-1 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 transition-colors rounded-xs"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-5 text-xs">
                <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xs">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    Total Amount
                  </div>
                  <div className="text-2xl font-light font-mono text-neutral-900 mt-1">
                    {formatINR(selectedTransaction.amount)}
                  </div>
                  <div className="mt-1 text-neutral-600 text-xs">
                    {selectedTransaction.description}
                  </div>
                </div>

                {selectedTransaction.isAiFlagged && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xs">
                    <div className="font-bold flex items-center gap-1.5 text-xs">
                      <AlertCircle size={14} className="text-amber-700" />
                      <span>Audit Review Flag</span>
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
                  <div className="bg-neutral-900 text-neutral-200 p-3 font-mono text-[11px] space-y-1 rounded-xs">
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
                  className="px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-widest w-full transition-colors rounded-xs"
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
