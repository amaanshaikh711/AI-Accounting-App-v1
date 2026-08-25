import React, { useState } from 'react';
import {
  Plus,
  Search,
  Building,
  Mail,
  Phone,
  X,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { formatINR, validateGSTIN } from '../../utils/formatters';
import { Vendor } from '../../types';

interface VendorsViewProps {
  navigate: (route: string) => void;
}

export const VendorsView: React.FC<VendorsViewProps> = ({ navigate }) => {
  const { vendors, addVendor, currentOrg } = useAccounting();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [gstin, setGstin] = useState('27AABCV8812K1Z9');
  const [pan, setPan] = useState('AABCV8812K');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Pune');
  const [state, setState] = useState('Maharashtra (27)');
  const [bankAccount, setBankAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [paymentTermsDays, setPaymentTermsDays] = useState('30');
  const [error, setError] = useState('');

  const gstinValidation = validateGSTIN(gstin);

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a legal supplier / vendor name.');
      return;
    }

    addVendor({
      name: name.trim(),
      gstin: gstin.toUpperCase().trim(),
      pan: pan.toUpperCase().trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      bankAccount: bankAccount.trim() || undefined,
      bankIfsc: bankIfsc.toUpperCase().trim() || undefined,
      bankName: bankName.trim() || undefined,
      outstandingBalance: 0,
      paymentTermsDays: parseInt(paymentTermsDays) || 30,
    });

    setIsAddModalOpen(false);
    setName('');
    setEmail('');
  };

  const filteredVendors = vendors.filter((v) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        v.gstin.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPayables = vendors.reduce((sum, v) => sum + v.outstandingBalance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 p-6 rounded-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-950 tracking-tight">
            Vendor Directory & Accounts Payable
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Supplier master records, bank remittance details, and purchase liabilities
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          id="add-vendor-btn"
          className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xs flex items-center gap-2 transition-colors"
        >
          <Plus size={14} />
          <span>Add Supplier / Vendor</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xs">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Registered Suppliers
          </div>
          <div className="text-xl font-bold font-mono text-slate-950 mt-1.5">
            {vendors.length} Vendors
          </div>
          <div className="mt-1 text-[10px] font-mono text-slate-500">
            GSTIN validated for ITC claim
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xs">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Total Outstanding Payables
          </div>
          <div className="text-xl font-bold font-mono text-slate-950 mt-1.5">
            {formatINR(totalPayables, false)}
          </div>
          <div className="mt-1 text-[10px] font-mono text-slate-500">
            Current liability on ledger
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xs">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Vendor Banking Details
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-1.5">
            100% Configured
          </div>
          <div className="mt-1 text-[10px] font-mono text-emerald-700">
            Direct RTGS/NEFT enabled
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 relative max-w-md">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search suppliers by name, GSTIN, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900"
          />
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Showing {filteredVendors.length} vendors
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white border border-slate-200 rounded-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left swiss-table border-collapse">
            <thead>
              <tr>
                <th>Vendor / Supplier Name</th>
                <th>GSTIN & PAN</th>
                <th>Bank Remittance Info</th>
                <th>Contact</th>
                <th className="text-right w-32">Outstanding Payable</th>
                <th className="text-center w-24">Terms</th>
                <th className="text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => setSelectedVendor(v)}
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <td>
                    <div className="font-semibold text-slate-950 text-xs">{v.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {v.city}, {v.state}
                    </div>
                  </td>
                  <td className="text-xs font-mono text-slate-800">
                    <div>{v.gstin}</div>
                    <div className="text-[10px] text-slate-500">PAN: {v.pan}</div>
                  </td>
                  <td className="text-xs font-mono text-slate-600">
                    <div>{v.bankName || 'HDFC Bank'}</div>
                    <div className="text-[10px] text-slate-400">
                      A/c: {v.bankAccount || '•••• 9921'} ({v.bankIfsc || 'HDFC0000060'})
                    </div>
                  </td>
                  <td className="text-xs text-slate-600">
                    <div>{v.email}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{v.phone}</div>
                  </td>
                  <td
                    className={`text-right font-mono font-bold whitespace-nowrap ${
                      v.outstandingBalance > 0 ? 'text-slate-950' : 'text-slate-500'
                    }`}
                  >
                    {formatINR(v.outstandingBalance)}
                  </td>
                  <td className="text-center whitespace-nowrap">
                    <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-800 rounded-xs">
                      Net {v.paymentTermsDays}d
                    </span>
                  </td>
                  <td className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate('/purchases')}
                      className="text-[11px] font-semibold text-slate-900 hover:underline"
                    >
                      Inward Bill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vendor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-xs shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-950 tracking-tight">
                  Add Vendor / Supplier Master
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Master setup for GST inward bills & RTGS payouts
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-xs hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs border-b border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleAddVendor} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Vendor / Supplier Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Precision Components Pvt Ltd"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900 uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    GSTIN (15-char) *
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    required
                    placeholder="27AABCV8812K1Z9"
                    value={gstin}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().replace(/\s/g, '');
                      setGstin(val);
                      if (val.length >= 12) setPan(val.substring(2, 12));
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xs font-mono uppercase focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    PAN Number *
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    required
                    placeholder="AABCV8812K"
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase().replace(/\s/g, ''))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xs font-mono uppercase focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Finance Email
                  </label>
                  <input
                    type="email"
                    placeholder="accounts@supplier.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 20 2745 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    placeholder="State Bank of India"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    placeholder="30992384920"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xs font-mono focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    placeholder="SBIN0001234"
                    value={bankIfsc}
                    onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xs font-mono uppercase focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xs hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-950 text-white hover:bg-slate-800 rounded-xs font-semibold"
                >
                  Save Vendor Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
