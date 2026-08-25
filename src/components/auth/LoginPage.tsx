import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';

interface LoginPageProps {
  navigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { login } = useAccounting();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.error || 'Invalid credentials.');
      }
    } catch {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('DemoSecret2026!');
    setLoading(true);
    await login(demoEmail);
    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between py-12 px-6">
      {/* Brand Header */}
      <div className="max-w-md mx-auto w-full text-center">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2.5 mb-6 group focus:outline-none"
        >
          <div className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tighter rounded-xs font-mono">
            AI
          </div>
          <span className="text-sm font-bold tracking-widest text-slate-900 uppercase">
            AI ACCOUNTING
          </span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md mx-auto w-full bg-white border border-slate-300 p-8 rounded-xs shadow-xs">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-950 tracking-tight">
            Sign In to Accounting Workspace
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your multi-tenant financial ledgers & GST compliance hub
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.in"
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900 font-sans"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-[11px] text-slate-600 hover:text-slate-900 underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900 pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded-xs border-slate-300 text-slate-900 focus:ring-0"
              />
              <span>Remember session (JWT)</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            id="login-submit-btn"
            className="w-full mt-2 bg-slate-950 text-white hover:bg-slate-800 font-semibold text-xs py-3 rounded-xs transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Logins for Fast Evaluation */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-2.5 text-center">
            One-Click Demo Roles
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('amaan.sharma@acmeindustries.in')}
              type="button"
              className="px-2.5 py-2 border border-slate-200 hover:border-slate-400 text-[11px] font-medium text-slate-800 rounded-xs text-left transition-colors bg-slate-50"
            >
              <div className="font-bold">Amaan Sharma</div>
              <div className="text-[10px] text-slate-500">Owner • Acme Ind.</div>
            </button>
            <button
              onClick={() => handleDemoLogin('ca.mehta@auditindia.in')}
              type="button"
              className="px-2.5 py-2 border border-slate-200 hover:border-slate-400 text-[11px] font-medium text-slate-800 rounded-xs text-left transition-colors bg-slate-50"
            >
              <div className="font-bold">C.A. Mehta</div>
              <div className="text-[10px] text-slate-500">Accountant • CA Firm</div>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          New to AI Accounting?{' '}
          <button
            onClick={() => navigate('/signup')}
            className="font-semibold text-slate-900 hover:underline"
          >
            Create an account
          </button>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-[11px] text-slate-400 font-mono">
        Secured with bcrypt & stateless JWT authorization • India Statutory Standard
      </div>
    </div>
  );
};
