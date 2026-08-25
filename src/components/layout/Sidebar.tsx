import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Receipt,
  ShoppingBag,
  CreditCard,
  Building2,
  Users,
  Briefcase,
  FileSpreadsheet,
  FileText,
  Sparkles,
  SearchCode,
  ScanText,
  Lightbulb,
  Settings,
  ShieldCheck,
  History,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';

interface SidebarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  navigate,
  collapsed,
  setCollapsed,
}) => {
  const { currentUser, currentOrg, reviewItems } = useAccounting();

  const pendingReviewCount = reviewItems.filter((r) => r.status === 'Pending').length;

  const navGroups = [
    {
      group: 'Workspace',
      items: [
        { label: 'Dashboard', route: '/dashboard', icon: LayoutDashboard },
        { label: 'Transactions', route: '/transactions', icon: ArrowLeftRight },
        { label: 'Sales', route: '/sales', icon: Receipt },
        { label: 'Purchases', route: '/purchases', icon: ShoppingBag },
        { label: 'Expenses', route: '/expenses', icon: CreditCard },
        { label: 'Banking', route: '/banking', icon: Building2 },
      ],
    },
    {
      group: 'Contacts',
      items: [
        { label: 'Customers', route: '/customers', icon: Users },
        { label: 'Vendors', route: '/vendors', icon: Briefcase },
      ],
    },
    {
      group: 'Compliance',
      items: [
        { label: 'GST', route: '/gst', icon: FileSpreadsheet, badge: 'India' },
        { label: 'Reports', route: '/reports', icon: FileText },
      ],
    },
    {
      group: 'Intelligence',
      items: [
        { label: 'AI Assistant', route: '/ai-assistant', icon: Sparkles },
        { label: 'AI Insights', route: '/insights', icon: Lightbulb },
        {
          label: 'Review Queue',
          route: '/review',
          icon: SearchCode,
          count: pendingReviewCount > 0 ? pendingReviewCount : undefined,
        },
        { label: 'Document OCR', route: '/ai-assistant/documents', icon: ScanText },
      ],
    },
    {
      group: 'System',
      items: [
        { label: 'Business Settings', route: '/settings/business', icon: Settings },
        { label: 'Users & Roles', route: '/settings/users', icon: ShieldCheck },
        { label: 'Audit Log', route: '/audit-log', icon: History },
      ],
    },
  ];

  return (
    <aside
      id="app-sidebar"
      className={`fixed top-0 left-0 h-screen bg-white text-neutral-900 border-r border-neutral-200 flex flex-col z-30 transition-all duration-200 select-none ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-neutral-200 shrink-0">
        {!collapsed ? (
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
            id="brand-logo-btn"
          >
            <div className="w-7 h-7 bg-neutral-900 text-white flex items-center justify-center font-bold text-xs tracking-tighter">
              AI
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight uppercase text-neutral-900">
                AI ACCOUNTING
              </h1>
              <div className="text-[9px] text-neutral-400 font-mono tracking-wider uppercase">
                India Financial Suite
              </div>
            </div>
          </button>
        ) : (
          <div className="mx-auto w-8 h-8 bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
            AI
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          id="collapse-sidebar-btn"
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Tenant Context Pill */}
      {!collapsed && currentOrg && (
        <div className="px-5 py-2.5 bg-neutral-50 border-b border-neutral-200 shrink-0">
          <div className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">
            Active Tenant
          </div>
          <div className="text-xs font-semibold text-neutral-900 truncate mt-0.5">
            {currentOrg.name}
          </div>
          <div className="text-[10px] text-neutral-500 font-mono mt-0.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            FY {currentOrg.financialYear}
          </div>
        </div>
      )}

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
        {navGroups.map((group) => (
          <div key={group.group}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                {group.group}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.route;
                return (
                  <li key={item.route}>
                    <button
                      onClick={() => navigate(item.route)}
                      id={`nav-link-${item.route.replace(/[\/]/g, '-')}`}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors text-left ${
                        isActive
                          ? 'bg-neutral-100 border-l-2 border-neutral-900 font-semibold text-neutral-900'
                          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 font-medium'
                      } ${collapsed ? 'justify-center px-0' : ''}`}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon
                        size={15}
                        className={`shrink-0 ${
                          isActive ? 'text-neutral-900' : 'text-neutral-500'
                        }`}
                      />
                      {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                      {!collapsed && item.count !== undefined && (
                        <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">
                          {item.count}
                        </span>
                      )}
                      {!collapsed && item.badge && (
                        <span className="px-1 py-0.2 text-[9px] font-mono uppercase bg-neutral-200 text-neutral-700">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer / User Profile Card */}
      <div className="p-4 border-t border-neutral-200 shrink-0 bg-white">
        {!collapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-neutral-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {currentUser?.avatar || 'AM'}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-semibold truncate text-neutral-900">
                {currentUser?.name || 'Amaan Sharma'}
              </p>
              <p className="text-[10px] text-neutral-400 uppercase tracking-tight">
                {currentUser?.role || 'Owner'}
              </p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 bg-neutral-900 flex items-center justify-center text-white text-xs font-bold mx-auto">
            {currentUser?.avatar || 'AM'}
          </div>
        )}
      </div>
    </aside>
  );
};
