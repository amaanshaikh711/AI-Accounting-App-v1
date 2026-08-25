import React, { useState } from 'react';
import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldAlert,
  Layers,
  Check,
  X
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { formatINR } from '../../utils/formatters';
import { ReviewItem } from '../../types';

interface ReviewQueueViewProps {
  navigate: (route: string) => void;
}

export const ReviewQueueView: React.FC<ReviewQueueViewProps> = ({ navigate }) => {
  const { reviewItems, resolveReviewItem, currentOrg } = useAccounting();

  const [filter, setFilter] = useState<'All' | 'Pending' | 'Resolved'>('Pending');
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null);

  const filteredItems = reviewItems.filter((item) => {
    if (filter === 'Pending' && item.status !== 'Pending') return false;
    if (filter === 'Resolved' && item.status === 'Pending') return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 p-6 rounded-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-500 text-white rounded-xs flex items-center justify-center font-bold text-xs">
              !
            </div>
            <h1 className="text-xl font-bold text-slate-950 tracking-tight">
              AI Anomaly Detection & Audit Review Queue
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Human-in-the-loop review center for potential duplicate payments, missing GSTINs, and classification anomalies
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['All', 'Pending', 'Resolved'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 text-xs font-mono rounded-xs transition-colors ${
                filter === tab
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-950'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Review Queue Items */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="bg-white border border-slate-200 p-12 text-center rounded-xs">
            <CheckCircle2 size={32} className="text-emerald-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">
              Audit Review Queue Clear
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-1">
              No outstanding anomalies or classification discrepancies flagged.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white border p-6 rounded-xs transition-all ${
                item.status === 'Pending'
                  ? item.severity === 'high'
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : 'border-slate-300'
                  : 'border-slate-200 opacity-70'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-xs ${
                        item.severity === 'high'
                          ? 'bg-red-100 text-red-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {item.severity} Severity Anomaly
                    </span>
                    <span className="text-xs font-bold text-slate-900">{item.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Voucher #{item.transactionId}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    {item.reason}
                  </p>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs flex items-start gap-2 text-xs">
                    <Sparkles size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-900">AI Suggested Action: </span>
                      <span className="text-slate-600">{item.suggestedAction}</span>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        Confidence: {item.confidence}% • Deterministic rule engine match
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accountant Action Controls */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 shrink-0">
                  {item.status === 'Pending' ? (
                    <>
                      <button
                        onClick={() => resolveReviewItem(item.id, 'Approved')}
                        className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold rounded-xs flex items-center gap-1.5 transition-colors w-full sm:w-auto"
                      >
                        <Check size={14} />
                        <span>Accept Suggestion</span>
                      </button>
                      <button
                        onClick={() => resolveReviewItem(item.id, 'Rejected')}
                        className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-xs flex items-center gap-1.5 transition-colors w-full sm:w-auto"
                      >
                        <X size={14} />
                        <span>Dismiss / Keep As Is</span>
                      </button>
                    </>
                  ) : (
                    <div className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-mono font-semibold rounded-xs flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      <span>{item.status} by Accountant</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
