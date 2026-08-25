import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Link2,
  FileCheck,
  Search,
  Plus
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { formatINR, formatDate } from '../../utils/formatters';
import { BankAccount, BankStatementLine } from '../../types';

interface BankingViewProps {
  navigate: (route: string) => void;
}

export const BankingView: React.FC<BankingViewProps> = ({ navigate }) => {
  const { bankAccounts, bankStatementLines, reconcileStatementLine, currentOrg } = useAccounting();

  const [selectedAccountId, setSelectedAccountId] = useState(bankAccounts[0]?.id || '');
  const [reconcileFilter, setReconcileFilter] = useState<'All' | 'Unreconciled' | 'Reconciled'>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedAccount = bankAccounts.find((b) => b.id === selectedAccountId) || bankAccounts[0];

  const handleRefreshFeed = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const lines = bankStatementLines.filter((l) => {
    if (l.bankAccountId !== selectedAccountId) return false;
    if (reconcileFilter === 'Unreconciled' && l.isReconciled) return false;
    if (reconcileFilter === 'Reconciled' && !l.isReconciled) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 p-6 rounded-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-950 tracking-tight">
            Banking Feeds & Automated Reconciliation
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Real-time multi-bank transaction sync with AI-assisted ledger matching
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshFeed}
            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold px-3.5 py-2 rounded-xs flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Sync Live Bank Feed</span>
          </button>
        </div>
      </div>

      {/* Connected Bank Accounts Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {bankAccounts.map((account) => (
          <div
            key={account.id}
            onClick={() => setSelectedAccountId(account.id)}
            className={`p-5 rounded-xs border cursor-pointer transition-all ${
              selectedAccountId === account.id
                ? 'bg-white border-slate-950 shadow-xs ring-1 ring-slate-950'
                : 'bg-white border-slate-200 hover:border-slate-400'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">{account.bankName}</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {account.accountType} •••• {account.accountNumber.slice(-4)}
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>

            <div className="mt-4">
              <div className="text-[10px] uppercase font-mono text-slate-400">
                Book Balance
              </div>
              <div className="text-xl font-bold font-mono text-slate-950 mt-0.5">
                {formatINR(account.balance)}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>IFSC: {account.ifsc}</span>
              <span>Live Synced</span>
            </div>
          </div>
        ))}
      </div>

      {/* Statement Reconciliation Workspace */}
      <div className="bg-white border border-slate-200 rounded-xs overflow-hidden">
        {/* Workspace Toolbar */}
        <div className="p-4 sm:px-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Statement Feed • {selectedAccount?.bankName} ({selectedAccount?.accountNumber})
            </h2>
            <p className="text-[11px] text-slate-500 font-mono">
              Review and reconcile automated match suggestions against general ledger entries
            </p>
          </div>

          <div className="flex items-center gap-1">
            {(['All', 'Unreconciled', 'Reconciled'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setReconcileFilter(tab)}
                className={`px-3 py-1 text-xs font-mono rounded-xs transition-colors ${
                  reconcileFilter === tab
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Statement Lines Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left swiss-table border-collapse">
            <thead>
              <tr>
                <th className="w-24">Date</th>
                <th>Statement Narration / UTR</th>
                <th className="w-24">Flow</th>
                <th className="text-right w-28">Amount</th>
                <th>AI Suggested Ledger Match</th>
                <th className="text-center w-28">Status</th>
                <th className="text-right w-36">Action</th>
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs font-mono">
                    All bank transactions in this filter are fully reconciled.
                  </td>
                </tr>
              ) : (
                lines.map((line) => (
                  <tr key={line.id} className="hover:bg-slate-50 transition-colors">
                    <td className="font-mono text-slate-600 whitespace-nowrap text-xs">
                      {formatDate(line.date)}
                    </td>
                    <td className="text-xs">
                      <div className="font-medium text-slate-900">{line.narration}</div>
                      {line.reference && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Ref: {line.reference}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded-xs ${
                          line.type === 'Credit'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {line.type}
                      </span>
                    </td>
                    <td
                      className={`text-right font-mono font-bold whitespace-nowrap ${
                        line.type === 'Credit' ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {line.type === 'Credit' ? '+' : '-'} {formatINR(line.amount)}
                    </td>
                    <td className="text-xs">
                      {line.matchedTransactionId ? (
                        <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                          <span>Matched to Ledger #{line.matchedTransactionId}</span>
                        </div>
                      ) : line.suggestedMatch ? (
                        <div className="p-2 bg-amber-50/70 border border-amber-200/80 rounded-xs">
                          <div className="flex items-center gap-1 text-amber-900 font-semibold text-[11px]">
                            <Sparkles size={12} className="text-amber-600" />
                            <span>Match Found: {line.suggestedMatch.partyName}</span>
                          </div>
                          <div className="text-[10px] text-amber-800 font-mono mt-0.5">
                            {line.suggestedMatch.reason} ({line.suggestedMatch.confidence}% confidence)
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">
                          No direct match. Create ledger voucher.
                        </span>
                      )}
                    </td>
                    <td className="text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono rounded-xs font-semibold ${
                          line.isReconciled
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {line.isReconciled ? 'Reconciled' : 'Unreconciled'}
                      </span>
                    </td>
                    <td className="text-right whitespace-nowrap">
                      {!line.isReconciled ? (
                        <button
                          onClick={() => reconcileStatementLine(line.id, 'tx_matched')}
                          className="px-3 py-1 bg-slate-950 hover:bg-slate-800 text-white text-[11px] font-semibold rounded-xs transition-colors"
                        >
                          Confirm Match
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">
                          Locked in Period
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
