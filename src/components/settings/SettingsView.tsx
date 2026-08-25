import React, { useState } from 'react';
import {
  Building2,
  Users,
  Shield,
  Layers,
  Key,
  CheckCircle2,
  Plus,
  Save,
  Trash2,
  AlertCircle,
  FileCheck2,
  Lock
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { UserRole } from '../../types';

interface SettingsViewProps {
  navigate: (route: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ navigate }) => {
  const { currentOrg, currentUser, updateOrganization, users, inviteUser } = useAccounting();

  const [activeTab, setActiveTab] = useState<'profile' | 'users' | 'coa' | 'integrations'>('profile');

  // Org Profile State
  const [name, setName] = useState(currentOrg?.name || '');
  const [tradeName, setTradeName] = useState(currentOrg?.tradeName || '');
  const [gstin, setGstin] = useState(currentOrg?.gstin || '');
  const [pan, setPan] = useState(currentOrg?.pan || '');
  const [address, setAddress] = useState(currentOrg?.address || '');
  const [city, setCity] = useState(currentOrg?.city || '');
  const [state, setState] = useState(currentOrg?.state || '');
  const [pincode, setPincode] = useState(currentOrg?.pincode || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Invite user state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('Accountant');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentOrg) {
      updateOrganization(currentOrg.id, {
        name,
        tradeName,
        gstin,
        pan,
        address,
        city,
        state,
        pincode,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail && currentOrg) {
      inviteUser(inviteName, inviteEmail, inviteRole, currentOrg.id);
      setIsInviteModalOpen(false);
      setInviteName('');
      setInviteEmail('');
    }
  };

  // Sample standard Chart of Accounts
  const chartOfAccounts = [
    { code: '1000', name: 'Current Assets', type: 'Asset', items: ['Cash on Hand', 'HDFC Bank #0060', 'ICICI Bank Operating', 'Trade Debtors (Receivables)', 'Input Tax Credit (GST Asset)'] },
    { code: '1500', name: 'Fixed Assets', type: 'Asset', items: ['Plant & Machinery', 'Computer Hardware & Office Tech', 'Furniture & Fixtures'] },
    { code: '2000', name: 'Current Liabilities', type: 'Liability', items: ['Trade Creditors (Payables)', 'Output GST Liability (CGST/SGST/IGST)', 'TDS Payable', 'Salaries Payable'] },
    { code: '3000', name: 'Shareholders Equity', type: 'Equity', items: ['Paid-up Capital', 'Retained Earnings / General Reserves'] },
    { code: '4000', name: 'Direct & Indirect Income', type: 'Income', items: ['Domestic Product Sales', 'Consulting & Engineering Fees', 'Interest on Fixed Deposits'] },
    { code: '5000', name: 'Operating Expenditures', type: 'Expense', items: ['Raw Material Purchases (COGS)', 'Salaries & Wages', 'Rent & Facilities', 'Electricity & Utilities', 'Professional & Legal Fees', 'Freight & Forwarding'] },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 p-6 rounded-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-950 tracking-tight">
            Organization Settings & Tenant Administration
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Configure {currentOrg?.name}, statutory identifiers, RBAC permissions, and chart of accounts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xs border border-slate-200">
            Tenant ID: {currentOrg?.id}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-xs p-4">
        <div className="flex items-center gap-1 border-b border-slate-200 pb-3 overflow-x-auto">
          {[
            { id: 'profile', label: 'Organization Profile' },
            { id: 'users', label: 'Team & RBAC Roles' },
            { id: 'coa', label: 'Chart of Accounts' },
            { id: 'integrations', label: 'Banking & GST APIs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-mono rounded-xs transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Organization Profile */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="pt-6 max-w-2xl space-y-4 text-xs">
            {savedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-700" />
                <span>Organization master parameters updated successfully.</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Legal Entity Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xs font-mono uppercase focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Trade / Brand Name
                </label>
                <input
                  type="text"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  GSTIN *
                </label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xs font-mono uppercase focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  PAN *
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xs font-mono uppercase focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Registered Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xs font-mono focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                type="submit"
                className="bg-slate-950 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-xs transition-colors flex items-center gap-2"
              >
                <Save size={14} />
                <span>Update Master Profile</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Users & Roles */}
        {activeTab === 'users' && (
          <div className="pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Tenant Users & Access Privileges
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Role-based access control (RBAC): Owner, Admin, Accountant, Viewer
                </p>
              </div>

              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus size={14} />
                <span>Invite Team Member</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xs overflow-hidden">
              <table className="w-full swiss-table">
                <thead>
                  <tr>
                    <th>User / Name</th>
                    <th>Email Address</th>
                    <th>Assigned Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="font-semibold text-slate-900 text-xs">{u.name}</td>
                      <td className="text-xs font-mono text-slate-600">{u.email}</td>
                      <td>
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-slate-900 text-white rounded-xs">
                          {u.role}
                        </span>
                      </td>
                      <td className="text-emerald-700 text-xs font-mono font-medium">
                        Active
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Chart of Accounts */}
        {activeTab === 'coa' && (
          <div className="pt-6 space-y-6 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Standard Chart of Accounts (Tally & Schedule III compliant)
                </h3>
                <p className="text-slate-500 font-mono text-[11px]">
                  Hierarchical double-entry ledger grouping
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {chartOfAccounts.map((grp) => (
                <div key={grp.code} className="border border-slate-200 rounded-xs overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{grp.code} — {grp.name}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-white border border-slate-300 rounded-xs font-semibold text-slate-700">
                      {grp.type}
                    </span>
                  </div>
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono">
                    {grp.items.map((item, idx) => (
                      <div key={idx} className="p-2 bg-slate-50/50 border border-slate-100 rounded-xs text-slate-800">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Banking & GST APIs */}
        {activeTab === 'integrations' && (
          <div className="pt-6 space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Connected Financial APIs & Webhooks
              </h3>
              <p className="text-slate-500 font-mono text-[11px]">
                Real-time statutory portal connections and banking protocol feeds
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200 rounded-xs bg-slate-50 flex items-start justify-between">
                <div>
                  <div className="font-bold text-slate-900">GSTN e-Invoice & e-Way Bill API</div>
                  <div className="text-[11px] text-slate-500 mt-1">Direct GST portal return filing & 2B statement sync</div>
                  <div className="mt-3 text-[10px] font-mono text-emerald-700 flex items-center gap-1 font-bold">
                    <CheckCircle2 size={12} />
                    <span>Connected (GSP Token Active)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded-xs bg-slate-50 flex items-start justify-between">
                <div>
                  <div className="font-bold text-slate-900">HDFC Corporate Banking Feed API</div>
                  <div className="text-[11px] text-slate-500 mt-1">Direct ISO 20022 statement ingestion & automated reconciliation</div>
                  <div className="mt-3 text-[10px] font-mono text-emerald-700 flex items-center gap-1 font-bold">
                    <CheckCircle2 size={12} />
                    <span>Connected (Daily Sync)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-xs shadow-2xl w-full max-w-md p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-950">
              Invite Team Member to Organization
            </h3>

            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. S. Venkatraman"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="venkat@ca-audit.in"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Role & Permissions</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900 bg-white font-mono"
                >
                  <option value="Accountant">Accountant (Vouchers, Ledger & GST filing)</option>
                  <option value="Admin">Admin (Full settings, users & accounts)</option>
                  <option value="Viewer">Viewer (Read-only reports access)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-3 py-2 border border-slate-300 rounded-xs text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-950 text-white rounded-xs font-semibold hover:bg-slate-800"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
