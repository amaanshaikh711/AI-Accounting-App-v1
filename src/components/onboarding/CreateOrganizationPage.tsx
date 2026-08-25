import React, { useState } from 'react';
import {
  Building2,
  FileCheck,
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { BusinessType } from '../../types';
import { validateGSTIN, validatePAN } from '../../utils/formatters';

interface CreateOrganizationPageProps {
  navigate: (route: string) => void;
}

export const CreateOrganizationPage: React.FC<CreateOrganizationPageProps> = ({ navigate }) => {
  const { createOrganization, currentUser } = useAccounting();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [name, setName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('Private Limited');
  const [gstin, setGstin] = useState('27AABCA1234F1Z5');
  const [pan, setPan] = useState('AABCA1234F');
  const [financialYear, setFinancialYear] = useState('2026–27');
  const [address, setAddress] = useState('Plot 42, MIDC Industrial Area');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra (27)');
  const [pincode, setPincode] = useState('400093');
  const [email, setEmail] = useState(currentUser?.email || 'accounts@business.in');
  const [phone, setPhone] = useState('+91 22 4589 0000');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const businessTypes: BusinessType[] = [
    'Private Limited',
    'Proprietorship',
    'Partnership',
    'LLP',
    'Public Limited',
    'Individual',
    'Trust',
    'Society',
    'Other',
  ];

  const financialYears = ['2026–27', '2025–26', '2024–25'];

  const gstinValidation = validateGSTIN(gstin);
  const panValidation = validatePAN(pan);

  const handleNextStep = () => {
    setError('');
    if (step === 1) {
      if (!name.trim()) {
        setError('Please provide a legal business / organization name.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!gstin.trim() || !gstinValidation.isValid) {
        setError('Please enter a valid 15-character Indian GSTIN.');
        return;
      }
      if (!pan.trim() || !panValidation.isValid) {
        setError('Please enter a valid 10-character PAN number.');
        return;
      }
      setStep(3);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await createOrganization({
        name: name.toUpperCase().trim(),
        tradeName: tradeName.trim() || undefined,
        businessType,
        gstin: gstin.toUpperCase().trim(),
        pan: pan.toUpperCase().trim(),
        financialYear,
        address,
        city,
        state,
        pincode,
        email,
        phone,
      });
      navigate('/dashboard');
    } catch {
      setError('Failed to initialize organization workspace.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between py-10 px-6">
      {/* Brand Header */}
      <div className="max-w-xl mx-auto w-full text-center">
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

        {/* Progress Stepper */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div
            className={`flex items-center gap-2 px-3 py-1 text-xs font-mono border rounded-xs ${
              step >= 1
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-400 border-slate-200'
            }`}
          >
            <span>01</span>
            <span className="font-sans">Business Info</span>
          </div>
          <div className="w-4 h-px bg-slate-300"></div>
          <div
            className={`flex items-center gap-2 px-3 py-1 text-xs font-mono border rounded-xs ${
              step >= 2
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-400 border-slate-200'
            }`}
          >
            <span>02</span>
            <span className="font-sans">GST & Statutory</span>
          </div>
          <div className="w-4 h-px bg-slate-300"></div>
          <div
            className={`flex items-center gap-2 px-3 py-1 text-xs font-mono border rounded-xs ${
              step >= 3
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-400 border-slate-200'
            }`}
          >
            <span>03</span>
            <span className="font-sans">Confirm Tenant</span>
          </div>
        </div>
      </div>

      {/* Wizard Container */}
      <div className="max-w-xl mx-auto w-full bg-white border border-slate-300 p-8 rounded-xs shadow-xs">
        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: General Business Information */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-950 tracking-tight">
                Step 1: Business Identity
              </h2>
              <p className="text-xs text-slate-500">
                Enter the legal entity name as registered with the Ministry of Corporate Affairs or GST portal.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Legal Entity / Organization Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ACME INDUSTRIES PVT LTD"
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Trade / Brand Name (Optional)
              </label>
              <input
                type="text"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                placeholder="e.g. Acme Industrial Solutions"
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Business Constitution Type *
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900 bg-white"
              >
                {businessTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Official Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={handleNextStep}
                className="bg-slate-950 text-white hover:bg-slate-800 text-xs font-semibold px-5 py-2.5 rounded-xs transition-colors flex items-center gap-2"
              >
                <span>Continue to Statutory Info</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Indian Statutory & Financial Year */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-950 tracking-tight">
                Step 2: Indian Statutory & Financial Year
              </h2>
              <p className="text-xs text-slate-500">
                Configure GSTIN, PAN, and active Indian accounting cycle (April to March).
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700">
                  Goods & Services Tax Identification Number (GSTIN) *
                </label>
                <span
                  className={`text-[10px] font-mono ${
                    gstinValidation.isValid ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  {gstinValidation.message}
                </span>
              </div>
              <input
                type="text"
                maxLength={15}
                required
                value={gstin}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase().replace(/\s/g, '');
                  setGstin(val);
                  if (val.length >= 12) {
                    // auto extract PAN from 15-char GSTIN (chars 3 to 12)
                    setPan(val.substring(2, 12));
                  }
                }}
                placeholder="27AABCA1234F1Z5"
                className={`w-full text-xs px-3 py-2.5 border rounded-xs font-mono uppercase focus:outline-none ${
                  gstin && !gstinValidation.isValid
                    ? 'border-amber-400 bg-amber-50/30'
                    : 'border-slate-300 focus:border-slate-900'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Permanent Account Number (PAN) *
                </label>
                <input
                  type="text"
                  maxLength={10}
                  required
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase().replace(/\s/g, ''))}
                  placeholder="AABCA1234F"
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xs font-mono uppercase focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Financial Year *
                </label>
                <select
                  value={financialYear}
                  onChange={(e) => setFinancialYear(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900 bg-white font-mono"
                >
                  {financialYears.map((fy) => (
                    <option key={fy} value={fy}>
                      FY {fy} (1 Apr – 31 Mar)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Registered Office Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address / Industrial estate"
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  State & Code
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  PIN Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-600 hover:text-slate-950 font-medium flex items-center gap-1"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="bg-slate-950 text-white hover:bg-slate-800 text-xs font-semibold px-5 py-2.5 rounded-xs transition-colors flex items-center gap-2"
              >
                <span>Review Business Setup</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Review & Role Assignment */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3 mb-2">
              <h2 className="text-lg font-bold text-slate-950 tracking-tight">
                Step 3: Confirm Business Tenant
              </h2>
              <p className="text-xs text-slate-500">
                You will be assigned the <span className="font-semibold text-slate-900">Owner</span> role with full administrative & ledger permissions.
              </p>
            </div>

            {/* Summary Box */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xs space-y-2.5 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-sans">Organization Name:</span>
                <span className="font-bold text-slate-900">{name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-sans">Constitution:</span>
                <span className="text-slate-800">{businessType}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-sans">GSTIN:</span>
                <span className="font-bold text-slate-900">{gstin}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-sans">PAN:</span>
                <span className="text-slate-800">{pan}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-sans">Active Financial Year:</span>
                <span className="font-bold text-emerald-700">FY {financialYear}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-sans">Location:</span>
                <span className="text-slate-800">{city}, {state} - {pincode}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500 font-sans">Assigned User Role:</span>
                <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded-xs">
                  Owner (Primary Admin)
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
              <span>Default Chart of Accounts (Tally & Schedule III compliant) will be auto-provisioned.</span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-slate-600 hover:text-slate-950 font-medium flex items-center gap-1"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleFinish}
                id="create-business-confirm-btn"
                className="bg-slate-950 text-white hover:bg-slate-800 text-xs font-semibold px-6 py-3 rounded-xs transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <span>Initializing Tenant...</span>
                ) : (
                  <>
                    <span>Create Business & Launch Workspace</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-[11px] text-slate-400 font-mono">
        Sprint 1 Multi-Tenant Tenant Isolation Framework
      </div>
    </div>
  );
};
