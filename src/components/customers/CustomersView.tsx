import React, { useState } from 'react';
import {
  Plus,
  Search,
  Users,
  Building,
  Mail,
  Phone,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { formatINR, validateGSTIN, validatePAN } from '../../utils/formatters';
import { Customer } from '../../types';

interface CustomersViewProps {
  navigate: (route: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({ navigate }) => {
  const { customers, addCustomer, currentOrg } = useAccounting();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form
  const [name, setName] = useState('');
  const [gstin, setGstin] = useState('27AABCT9981F1Z2');
  const [pan, setPan] = useState('AABCT9981F');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra (27)');
  const [creditLimit, setCreditLimit] = useState('500000');
  const [paymentTermsDays, setPaymentTermsDays] = useState('30');
  const [error, setError] = useState('');

  const gstinValidation = validateGSTIN(gstin);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a legal customer company name.');
      return;
    }
    if (gstin && !gstinValidation.isValid) {
      setError('Invalid GSTIN format.');
      return;
    }

    addCustomer({
      name: name.trim(),
      gstin: gstin.toUpperCase().trim(),
      pan: pan.toUpperCase().trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      creditLimit: parseFloat(creditLimit) || 0,
      outstandingBalance: 0,
      paymentTermsDays: parseInt(paymentTermsDays) || 30,
    });

    setIsAddModalOpen(false);
    setName('');
    setEmail('');
    setPhone('');
  };

  const filteredCustomers = customers.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.gstin.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 p-6 rounded-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-950 tracking-tight">
            Customer Directory & Accounts Receivable
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Client master registry, GST state classification, credit terms & ledger tracking
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          id="add-customer-btn"
          className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xs flex items-center gap-2 transition-colors"
        >
          <Plus size={14} />
          <span>Add Customer Master</span>
        </button>
      </div>

      {/* Summary metric */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xs">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Active Accounts
          </div>
          <div className="text-xl font-bold font-mono text-slate-950 mt-1.5">
            {customers.length} Companies
          </div>
          <div className="mt-1 text-[10px] font-mono text-slate-500">
            All registered for B2B GST e-invoicing
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xs">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Total Receivables
          </div>
          <div className="text-xl font-bold font-mono text-amber-700 mt-1.5">
            {formatINR(totalOutstanding, false)}
          </div>
          <div className="mt-1 text-[10px] font-mono text-slate-500">
            Across active commercial accounts
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xs">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Average Credit Terms
          </div>
          <div className="text-xl font-bold font-mono text-slate-950 mt-1.5">
            30 Days
          </div>
          <div className="mt-1 text-[10px] font-mono text-emerald-700">
            92% on-time settlement index
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 relative max-w-md">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers by name, GSTIN, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900"
          />
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Showing {filteredCustomers.length} of {customers.length} parties
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white border border-slate-200 rounded-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left swiss-table border-collapse">
            <thead>
              <tr>
                <th>Customer Legal Name</th>
                <th>GSTIN & State</th>
                <th>Contact Details</th>
                <th className="text-right w-28">Credit Limit</th>
                <th className="text-right w-32">Receivable Due</th>
                <th className="text-center w-24">Terms</th>
                <th className="text-right w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((cust) => (
                <tr
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <td>
                    <div className="font-semibold text-slate-950 text-xs">{cust.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {cust.city}, {cust.state}
                    </div>
                  </td>
                  <td className="text-xs font-mono text-slate-800">
                    <div>{cust.gstin}</div>
                    <div className="text-[10px] text-slate-500">PAN: {cust.pan}</div>
                  </td>
                  <td className="text-xs text-slate-600">
                    <div>{cust.email}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{cust.phone}</div>
                  </td>
                  <td className="text-right font-mono text-slate-700 text-xs">
                    {formatINR(cust.creditLimit, false)}
                  </td>
                  <td
                    className={`text-right font-mono font-bold whitespace-nowrap ${
                      cust.outstandingBalance > 0 ? 'text-amber-700' : 'text-slate-900'
                    }`}
                  >
                    {formatINR(cust.outstandingBalance)}
                  </td>
                  <td className="text-center whitespace-nowrap">
                    <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-800 rounded-xs">
                      Net {cust.paymentTermsDays}d
                    </span>
                  </td>
                  <td className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate('/sales')}
                      className="text-[11px] font-semibold text-slate-900 hover:underline"
                    >
                      New Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-xs shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-950 tracking-tight">
                  Add Customer Master Record
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Master registry for GST B2B invoicing
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

            <form onSubmit={handleAddCustomer} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Customer Legal Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tata Motors Limited"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900 uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    GSTIN (15-characters)
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="27AABCT9981F1Z2"
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
                    PAN Number
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="AABCT9981F"
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase().replace(/\s/g, ''))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xs font-mono uppercase focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Finance / Accounts Email
                  </label>
                  <input
                    type="email"
                    placeholder="billing@tatamotors.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Phone / Contact
                  </label>
                  <input
                    type="text"
                    placeholder="+91 22 6656 1234"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Billing Address
                </label>
                <input
                  type="text"
                  placeholder="Plot 10, Industrial Estate"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    State & Code
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Credit Limit (INR ₹)
                  </label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xs font-mono focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Payment Terms (Days)
                  </label>
                  <select
                    value={paymentTermsDays}
                    onChange={(e) => setPaymentTermsDays(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xs font-mono focus:outline-none focus:border-slate-900 bg-white"
                  >
                    <option value="0">Immediate / Advance</option>
                    <option value="15">Net 15 Days</option>
                    <option value="30">Net 30 Days</option>
                    <option value="45">Net 45 Days</option>
                    <option value="60">Net 60 Days</option>
                  </select>
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
                  Save Customer Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
