import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Building,
  Plus,
  Check,
  LogOut,
  User as UserIcon,
  Settings,
  Calendar,
  AlertCircle,
  Shield,
  Briefcase
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';

interface TopNavProps {
  currentRoute: string;
  navigate: (route: string) => void;
  openSearch: () => void;
  openNotifications: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentRoute,
  navigate,
  openSearch,
  openNotifications,
}) => {
  const {
    currentUser,
    currentOrg,
    organizations,
    switchOrganization,
    logout,
    notifications,
    metrics,
  } = useAccounting();

  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const orgRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (orgRef.current && !orgRef.current.contains(event.target as Node)) {
        setOrgDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = (route: string) => {
    switch (route) {
      case '/dashboard':
        return { title: 'Dashboard', category: 'Overview' };
      case '/transactions':
        return { title: 'General Ledger & Transactions', category: 'Workspace' };
      case '/sales':
        return { title: 'Sales & Invoicing', category: 'Receivables' };
      case '/purchases':
        return { title: 'Purchases & Bills', category: 'Payables' };
      case '/expenses':
        return { title: 'Operating Expenses', category: 'Workspace' };
      case '/banking':
        return { title: 'Banking & Reconciliation', category: 'Treasury' };
      case '/customers':
        return { title: 'Customers Directory', category: 'Contacts' };
      case '/vendors':
        return { title: 'Vendors Directory', category: 'Contacts' };
      case '/gst':
        return { title: 'GST Compliance & Filing Summary', category: 'Statutory' };
      case '/reports':
        return { title: 'Financial Reports', category: 'Accounting' };
      case '/ai-assistant':
        return { title: 'AI Accounting Assistant', category: 'Intelligence' };
      case '/ai-assistant/documents':
        return { title: 'AI Document Extraction (OCR)', category: 'Intelligence' };
      case '/review':
        return { title: 'AI Review Queue & Anomalies', category: 'Quality Control' };
      case '/insights':
        return { title: 'Financial Intelligence & Insights', category: 'Analytics' };
      case '/settings/business':
        return { title: 'Business Profile & Tax Settings', category: 'System' };
      case '/settings/users':
        return { title: 'User Management & Roles', category: 'System' };
      case '/audit-log':
        return { title: 'Audit Trail & Event Log', category: 'Governance' };
      default:
        return { title: 'AI Accounting', category: 'Workspace' };
    }
  };

  const { title, category } = getPageTitle(currentRoute);

  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 shrink-0">
      {/* Left: Organization / FY Context & Breadcrumbs */}
      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
        {/* Organization Switcher Dropdown */}
        <div className="relative" ref={orgRef}>
          <button
            onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
            id="org-switcher-btn"
            className="flex items-center px-3 py-1.5 border border-neutral-200 bg-neutral-50 text-xs font-medium text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <span className="mr-2 uppercase tracking-tight truncate max-w-[140px] sm:max-w-[200px]">
              {currentOrg ? currentOrg.name : 'Select Business'}
            </span>
            <ChevronDown size={12} className="text-neutral-500" />
          </button>

          {orgDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-72 bg-white border border-neutral-200 shadow-xl py-1.5 z-50 text-xs">
              <div className="px-3 py-1.5 border-b border-neutral-100 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                Organizations & Tenants
              </div>

              <div className="max-h-60 overflow-y-auto py-1">
                {organizations.map((org) => {
                  const isSelected = org.id === currentOrg?.id;
                  return (
                    <button
                      key={org.id}
                      onClick={() => {
                        switchOrganization(org.id);
                        setOrgDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-start justify-between hover:bg-neutral-50 transition-colors ${
                        isSelected ? 'bg-neutral-100 font-semibold' : ''
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-neutral-900 truncate font-mono text-xs">
                          {org.name}
                        </div>
                        <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                          GSTIN: {org.gstin} • {org.businessType}
                        </div>
                        <div className="text-[10px] text-neutral-700 font-mono">
                          FY {org.financialYear}
                        </div>
                      </div>
                      {isSelected && <Check size={14} className="text-neutral-900 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-neutral-100 pt-1 px-1">
                <button
                  onClick={() => {
                    setOrgDropdownOpen(false);
                    navigate('/new-business');
                  }}
                  id="add-organization-btn"
                  className="w-full text-left px-3 py-2 text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 font-medium"
                >
                  <Plus size={14} className="text-neutral-600" />
                  <span>Add New Business Tenant</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <span className="text-neutral-300">|</span>
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-widest hidden sm:inline">
          FY {currentOrg?.financialYear || '2026-27'}
        </span>
      </div>

      {/* Right Tools: Search, Action Badge, Notifications, Date, Profile */}
      <div className="flex items-center space-x-4 sm:space-x-6">
        {/* Global Search input trigger */}
        <div className="relative">
          <input
            type="text"
            readOnly
            onClick={openSearch}
            placeholder="Search records..."
            className="bg-neutral-100 border-none px-4 py-1.5 text-xs w-36 sm:w-48 focus:ring-1 focus:ring-neutral-400 outline-none cursor-pointer placeholder:text-neutral-400"
          />
        </div>

        {/* Action Required Badge */}
        {metrics.pendingReviewCount > 0 && (
          <button
            onClick={() => navigate('/review')}
            id="action-required-header-btn"
            className="hidden md:flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs px-2.5 py-1 transition-colors font-medium border border-neutral-300"
          >
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            <span>{metrics.pendingReviewCount} Issues</span>
          </button>
        )}

        {/* Notifications */}
        <button
          onClick={openNotifications}
          id="notifications-btn"
          className="relative text-neutral-400 hover:text-neutral-900 cursor-pointer transition-colors p-1"
          title="Notifications"
        >
          <Bell size={18} />
          {unreadNotifs > 0 && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          )}
        </button>

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            id="user-profile-menu-btn"
            className="flex items-center cursor-pointer focus:outline-none"
          >
            <div className="w-8 h-8 bg-neutral-900 flex items-center justify-center text-white text-xs font-bold font-mono">
              {currentUser?.avatar || 'AM'}
            </div>
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-60 bg-white border border-neutral-200 shadow-xl py-1.5 z-50 text-xs">
              <div className="px-3 py-2 border-b border-neutral-100">
                <div className="font-semibold text-neutral-900">{currentUser?.name || 'Amaan Sharma'}</div>
                <div className="text-neutral-500 text-[11px] font-mono truncate">{currentUser?.email}</div>
                <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono bg-neutral-100 text-neutral-700 px-1.5 py-0.5">
                  <Shield size={10} />
                  <span>{currentUser?.role || 'Owner'} Role</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/settings/business');
                  }}
                  className="w-full text-left px-3 py-2 text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                >
                  <Settings size={14} className="text-neutral-500" />
                  <span>Business Settings</span>
                </button>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/settings/users');
                  }}
                  className="w-full text-left px-3 py-2 text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                >
                  <UserIcon size={14} className="text-neutral-500" />
                  <span>Users & Permissions</span>
                </button>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/audit-log');
                  }}
                  className="w-full text-left px-3 py-2 text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                >
                  <Briefcase size={14} className="text-neutral-500" />
                  <span>Audit Trail</span>
                </button>
              </div>

              <div className="border-t border-neutral-100 pt-1">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  id="user-logout-btn"
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
