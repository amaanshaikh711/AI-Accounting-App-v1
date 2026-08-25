import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Calendar,
  Lock,
  UserCheck
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { formatDate } from '../../utils/formatters';

interface AuditLogViewProps {
  navigate: (route: string) => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ navigate }) => {
  const { currentOrg, currentUser } = useAccounting();

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const auditEvents = [
    {
      id: 'aud_101',
      timestamp: '2026-08-08 11:45:22',
      actor: 'Rajesh Sharma, FCA',
      role: 'Owner / CA',
      action: 'VOUCHER_POSTED',
      details: 'Created and posted Sales Tax Invoice #INV-2026-001 for Tata Motors Limited (₹3,45,000)',
      ip: '103.21.14.88 (Mumbai)',
      hash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    },
    {
      id: 'aud_102',
      timestamp: '2026-08-08 10:30:15',
      actor: 'AI Audit Engine',
      role: 'System Automated',
      action: 'ANOMALY_FLAGGED',
      details: 'Flagged potential duplicate transaction for Kulkarni Steel Works (₹1,20,000)',
      ip: 'Internal Host',
      hash: 'sha256:9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72',
    },
    {
      id: 'aud_103',
      timestamp: '2026-08-08 09:12:04',
      actor: 'Rajesh Sharma, FCA',
      role: 'Owner / CA',
      action: 'BANK_RECONCILED',
      details: 'Matched HDFC Current Account statement line #STMT-9901 to Ledger #TX-001',
      ip: '103.21.14.88 (Mumbai)',
      hash: 'sha256:2c624232cdd221771294dfbb310aca000a0df6ac9b66b0d199bf41e340f9fce1',
    },
    {
      id: 'aud_104',
      timestamp: '2026-08-07 18:40:10',
      actor: 'Rajesh Sharma, FCA',
      role: 'Owner / CA',
      action: 'GST_RETURN_VERIFIED',
      details: 'Exported GSTR-1 JSON schema for return period July 2026',
      ip: '103.21.14.88 (Mumbai)',
      hash: 'sha256:48b0a969b7bb69cb84f676451e041db9392e2193b2a537f848981e4b3e510ec4',
    },
    {
      id: 'aud_105',
      timestamp: '2026-08-07 14:15:33',
      actor: 'Rajesh Sharma, FCA',
      role: 'Owner / CA',
      action: 'OCR_DOCUMENT_INWARD',
      details: 'Ingested and extracted vendor bill #INV-PC-2026-904 from Precision Components Pvt Ltd',
      ip: '103.21.14.88 (Mumbai)',
      hash: 'sha256:1a84f339ec0f8a614450ffbf0d07ac4f0293281ec454d87896f6041c900ed9a3',
    },
  ];

  const filteredLogs = auditEvents.filter((item) => {
    if (actionFilter !== 'ALL' && item.action !== actionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.details.toLowerCase().includes(q) ||
        item.actor.toLowerCase().includes(q) ||
        item.action.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 p-6 rounded-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-700" />
            <h1 className="text-xl font-bold text-slate-950 tracking-tight">
              Statutory Audit Trail & Cryptographic Log
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Immutable Ministry of Corporate Affairs (MCA) compliant activity log for {currentOrg?.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const element = document.createElement('a');
              const file = new Blob([JSON.stringify(auditEvents, null, 2)], { type: 'application/json' });
              element.href = URL.createObjectURL(file);
              element.download = `AuditTrail_${currentOrg?.gstin}_${Date.now()}.json`;
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            }}
            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold px-3.5 py-2 rounded-xs flex items-center gap-1.5 transition-colors"
          >
            <Download size={13} />
            <span>Export Audit Trail (JSON)</span>
          </button>
        </div>
      </div>

      {/* MCA Compliance Badge */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xs flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <Lock size={15} className="text-emerald-700" />
          <span>
            <strong>MCA Audit Trail Rules Enforced:</strong> Edit log feature is permanently enabled. No retrospective entries permitted without audit record.
          </span>
        </div>
        <span className="font-bold">Compliant with Companies (Accounts) Rules 2014</span>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 relative max-w-md">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit trail by actor, voucher, or action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xs focus:outline-none focus:border-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500">Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-xs bg-white text-slate-800 focus:outline-none"
          >
            <option value="ALL">All Actions</option>
            <option value="VOUCHER_POSTED">VOUCHER_POSTED</option>
            <option value="BANK_RECONCILED">BANK_RECONCILED</option>
            <option value="ANOMALY_FLAGGED">ANOMALY_FLAGGED</option>
            <option value="GST_RETURN_VERIFIED">GST_RETURN_VERIFIED</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left swiss-table border-collapse">
            <thead>
              <tr>
                <th className="w-40">Timestamp</th>
                <th>Actor / User</th>
                <th className="w-36">Action Code</th>
                <th>Event Description & Entity Particulars</th>
                <th>IP & Provenance</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="font-mono text-slate-700 whitespace-nowrap text-xs">
                    {log.timestamp}
                  </td>
                  <td className="text-xs">
                    <div className="font-semibold text-slate-900">{log.actor}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{log.role}</div>
                  </td>
                  <td>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-900 text-white rounded-xs">
                      {log.action}
                    </span>
                  </td>
                  <td className="text-xs text-slate-800">
                    <div className="font-medium">{log.details}</div>
                    <div className="text-[9px] text-slate-400 font-mono mt-0.5 truncate max-w-md">
                      {log.hash}
                    </div>
                  </td>
                  <td className="text-xs font-mono text-slate-600 whitespace-nowrap">
                    {log.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
