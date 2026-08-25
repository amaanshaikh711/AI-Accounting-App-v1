import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Building,
  Sparkles,
  FileCheck2,
  Lock,
  ArrowUpRight,
  CheckCircle2,
  Cpu,
  Layers
} from 'lucide-react';

interface LandingPageProps {
  navigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111827] flex flex-col selection:bg-slate-900 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tighter rounded-xs font-mono">
              AI
            </div>
            <div>
              <span className="text-sm font-bold tracking-widest text-slate-900 uppercase">
                AI ACCOUNTING
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-xs font-mono border border-slate-200">
                INDIA EDITION
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              id="landing-login-btn"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              id="landing-signup-btn"
              className="text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-xs transition-colors flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="border-b border-slate-200 bg-white py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-mono mb-6 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Engineered for CAs, Bookkeepers & Indian Enterprises
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-950 leading-[1.1]">
                Precision accounting for India. Accelerated by AI.
              </h1>
              <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                You already understand accounting. AI Accounting makes double-entry book-keeping, GST reconciliation, banking feeds, and document extraction 10x faster, safer, and clearer.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => navigate('/signup')}
                  id="hero-start-btn"
                  className="bg-slate-950 text-white hover:bg-slate-800 text-sm font-semibold px-6 py-3.5 rounded-xs transition-colors flex items-center gap-2"
                >
                  <span>Open Free Accounting Workspace</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  id="hero-demo-btn"
                  className="bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 text-sm font-semibold px-6 py-3.5 rounded-xs transition-colors"
                >
                  Explore Interactive Demo
                </button>
              </div>

              {/* Trust badges */}
              <div className="mt-12 pt-8 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-slate-600 font-mono">
                <div>
                  <div className="font-bold text-slate-900 text-sm">GSTR-1 & 3B</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Automated tax classification</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Strict Tenant RLS</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Isolated multi-business data</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Human in Control</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">AI suggests, you approve</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Swiss Grid: Core Capabilities */}
        <section className="py-20 max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <div className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
              System Architecture
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 mt-2">
              Built for speed, compliance, and financial rigor.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1 */}
            <div className="bg-white border border-slate-200 p-8 rounded-xs hover:border-slate-400 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 rounded-xs mb-6">
                  <FileCheck2 size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  India GST Intelligence
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Real-time Input Tax Credit (ITC) vs Output liability tracking. Automatic split of CGST, SGST, and IGST with instant HSN code lookup and reverse charge flagging.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>GSTR-1 / 3B Ready</span>
                <ArrowUpRight size={14} />
              </div>
            </div>

            {/* Box 2 */}
            <div className="bg-white border border-slate-200 p-8 rounded-xs hover:border-slate-400 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 rounded-xs mb-6">
                  <Cpu size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  AI Review Queue & OCR
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Instant invoice extraction and automated ledger classification. AI flags anomalous payments, duplicate entries, and missing GSTINs before you file returns.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>Zero Hallucinations</span>
                <ArrowUpRight size={14} />
              </div>
            </div>

            {/* Box 3 */}
            <div className="bg-white border border-slate-200 p-8 rounded-xs hover:border-slate-400 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 rounded-xs mb-6">
                  <Layers size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Deterministic Multi-Tenant
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Switch seamlessly across multiple firms (Pvt Ltd, LLP, Proprietorship) with isolated financial years, custom chart of accounts, and immutable audit logging.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>Multi-Org Isolation</span>
                <ArrowUpRight size={14} />
              </div>
            </div>
          </div>
        </section>

        {/* Comparison / Philosophy Section */}
        <section className="bg-slate-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
                  Design Philosophy
                </div>
                <h2 className="text-3xl font-bold tracking-tight mt-2 text-white">
                  No childish animations. No toy interfaces. Pure financial clarity.
                </h2>
                <p className="mt-4 text-slate-400 text-sm leading-relaxed">
                  Traditional desktop software is reliable but sluggish and isolated. Modern SaaS tools are frequently over-designed with empty metrics and cartoon dashboards. AI Accounting is designed for speed, dense financial tables, and serious compliance work.
                </p>
                <div className="mt-6 space-y-3 text-xs font-mono text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>Instant keyboard-first workflows and ⌘K search</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>Real Indian numbering (Lakhs & Crores ₹ formatting)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>Role-based access: Owner, Admin, Accountant, Viewer</span>
                  </div>
                </div>
              </div>

              {/* Minimal preview box */}
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-xs shadow-2xl font-mono text-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-slate-400">
                  <span>ACME INDUSTRIES PVT LTD • FY 2026–27</span>
                  <span className="text-emerald-400">GSTR-3B OK</span>
                </div>
                <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-800">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Total Revenue</div>
                    <div className="text-xl font-bold text-white mt-1">₹24,82,400</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Net Profit</div>
                    <div className="text-xl font-bold text-emerald-400 mt-1">₹16,40,300</div>
                  </div>
                </div>
                <div className="pt-4 text-slate-400 text-[11px] flex items-center justify-between">
                  <span>AI Review: 2 anomalies flagged for audit</span>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-white hover:text-emerald-400 font-semibold underline"
                  >
                    View Ledger →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            AI ACCOUNTING © 2026 • SWISS MINIMALIST FINANCIAL ENGINE • INDIA COMPLIANT
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/login')} className="hover:text-slate-900">
              Sign In
            </button>
            <button onClick={() => navigate('/signup')} className="hover:text-slate-900">
              Create Account
            </button>
            <button onClick={() => navigate('/forgot-password')} className="hover:text-slate-900">
              Reset Password
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
