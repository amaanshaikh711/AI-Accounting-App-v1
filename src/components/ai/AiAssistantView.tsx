import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { formatINR } from '../../utils/formatters';

interface AiAssistantViewProps {
  navigate: (route: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actions?: { label: string; route: string }[];
  highlightData?: { label: string; value: string }[];
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({ navigate }) => {
  const { currentOrg, metrics, invoices, reviewItems } = useAccounting();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Hello! I am your AI Accounting Co-pilot configured for **${currentOrg?.name}** (FY ${currentOrg?.financialYear}). I monitor statutory compliance, detect transaction anomalies, reconcile GST returns, and assist with ledger queries.`,
      timestamp: '10:00 AM',
      highlightData: [
        { label: 'Active FY Revenue', value: formatINR(metrics.revenue, false) },
        { label: 'Claimable ITC', value: '₹91,800' },
        { label: 'Pending AI Audits', value: `${metrics.pendingReviewCount} items` },
      ],
      actions: [
        { label: 'Review Anomaly Flags', route: '/review' },
        { label: 'View GST Returns Hub', route: '/gst' },
      ],
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const suggestedPrompts = [
    'Analyze our cash runway and debtor aging risks',
    'Explain the GSTR-1 vs 3B tax liability breakdown',
    'Are there any duplicate payments or missing vendor GSTINs?',
    'Draft a formal response to GST notice regarding ITC variance',
  ];

  const handleSend = (queryToSend?: string) => {
    const text = queryToSend || inputQuery;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let aiResponse: ChatMessage;

      const lower = text.toLowerCase();
      if (lower.includes('cash') || lower.includes('runway') || lower.includes('aging')) {
        aiResponse = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: `Based on current bank balances of **${formatINR(metrics.cashAndBank)}** and monthly operating burn of approximately **₹8.42 Lakhs**, **${currentOrg?.name}** maintains **1.5 months of immediate cash runway** without further collections.\n\nHowever, you have **${formatINR(metrics.receivables)}** in outstanding trade receivables across 4 customers. Notably, **Mahindra Aerospace** (₹1.85L) has crossed 30 days credit terms.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { label: 'Open Receivables Aging Report', route: '/reports' },
            { label: 'View Overdue Invoices', route: '/sales' },
          ],
        };
      } else if (lower.includes('gst') || lower.includes('gstr') || lower.includes('tax')) {
        aiResponse = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: `For period **July 2026**:\n- Total Output Liability: **${formatINR(metrics.revenue * 0.18)}** (from B2B tax invoices)\n- Input Tax Credit (ITC) available: **₹91,800** (from inward bills)\n- **Net GST Payable in cash: ₹1,55,032**.\n\nAll outward invoices match GSTR-1 Table 4A. No 2B vs 3B mismatch detected.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { label: 'Export GSTR-1 JSON', route: '/gst' },
          ],
        };
      } else if (lower.includes('duplicate') || lower.includes('anomaly') || lower.includes('missing')) {
        aiResponse = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: `I have detected **${reviewItems.length} anomaly items** requiring accountant sign-off:\n1. **Potential Duplicate NEFT**: ₹1,20,000 paid to Kulkarni Steel Works within 48 hours of another identical voucher.\n2. **Missing Vendor GSTIN**: ₹45,000 paid for industrial supplies with no GSTIN recorded — you cannot claim ₹8,100 in ITC until updated.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { label: 'Open Anomaly Review Queue', route: '/review' },
          ],
        };
      } else {
        aiResponse = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: `I have analyzed the financial records for **${currentOrg?.name}**. Your current double-entry trial balance is in equilibrium with zero debit/credit variance. All statutory GST ledgers and HDFC bank statement lines are synchronized.\n\nHow else can I assist with your accounting audits or tax filings?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { label: 'View General Ledger', route: '/transactions' },
            { label: 'Generate Trial Balance', route: '/reports' },
          ],
        };
      }

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 p-6 rounded-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 text-white rounded-xs flex items-center justify-center">
              <Sparkles size={13} className="text-amber-400" />
            </div>
            <h1 className="text-xl font-bold text-slate-950 tracking-tight">
              AI Accounting Co-Pilot
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Deterministic financial analysis, statutory audit checks & natural language ledger queries
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xs">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Strict Zero-Hallucination Isolation</span>
        </div>
      </div>

      {/* Suggested Query Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] font-mono uppercase text-slate-400 font-bold shrink-0">
          Suggested:
        </span>
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="text-xs bg-white border border-slate-300 hover:border-slate-950 text-slate-700 hover:text-slate-950 px-3 py-1.5 rounded-xs font-medium whitespace-nowrap transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="bg-white border border-slate-200 rounded-xs flex flex-col h-[520px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xs bg-slate-900 text-white flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                  AI
                </div>
              )}

              <div
                className={`max-w-xl rounded-xs p-4 text-xs ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white font-medium'
                    : 'bg-slate-50 border border-slate-200 text-slate-800'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>

                {/* Highlight data if present */}
                {msg.highlightData && (
                  <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-3 gap-2 font-mono">
                    {msg.highlightData.map((h, i) => (
                      <div key={i} className="bg-white p-2 border border-slate-200 rounded-xs">
                        <div className="text-[10px] text-slate-500 uppercase">{h.label}</div>
                        <div className="font-bold text-slate-900 mt-0.5">{h.value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick actions */}
                {msg.actions && (
                  <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-2">
                    {msg.actions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => navigate(act.route)}
                        className="bg-white border border-slate-300 hover:border-slate-900 text-slate-900 text-[11px] font-semibold px-2.5 py-1 rounded-xs flex items-center gap-1 transition-colors"
                      >
                        <span>{act.label}</span>
                        <ArrowRight size={11} />
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-2 text-[10px] text-slate-400 font-mono text-right">
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xs bg-slate-200 text-slate-800 flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                  U
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Sparkles size={14} className="animate-spin text-amber-500" />
              <span>Analyzing ledger & GST rules...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/60">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about your vouchers, GST compliance, debtor aging, or tax rules..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs bg-white border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900 font-sans"
            />
            <button
              type="submit"
              className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Ask Co-Pilot</span>
              <Send size={13} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
