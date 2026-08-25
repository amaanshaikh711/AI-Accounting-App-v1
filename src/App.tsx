import React, { useState } from 'react';
import { AccountingProvider, useAccounting } from './context/AccountingContext';
import { LandingPage } from './components/public/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { CreateOrganizationPage } from './components/onboarding/CreateOrganizationPage';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { NotificationDrawer } from './components/layout/NotificationDrawer';

// Main Views
import { DashboardView } from './components/dashboard/DashboardView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { SalesView } from './components/sales/SalesView';
import { PurchasesView } from './components/purchases/PurchasesView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { BankingView } from './components/banking/BankingView';
import { CustomersView } from './components/customers/CustomersView';
import { VendorsView } from './components/vendors/VendorsView';
import { GstView } from './components/gst/GstView';
import { ReportsView } from './components/reports/ReportsView';
import { AiAssistantView } from './components/ai/AiAssistantView';
import { DocumentScannerView } from './components/ai/DocumentScannerView';
import { ReviewQueueView } from './components/review/ReviewQueueView';
import { SettingsView } from './components/settings/SettingsView';
import { AuditLogView } from './components/audit/AuditLogView';

const AppContent: React.FC = () => {
  const { isAuthenticated, currentUser, currentOrg } = useAccounting();

  const [currentRoute, setCurrentRoute] = useState<string>('/dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  // Navigation Handler
  const navigate = (route: string) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Public / Auth routing if not authenticated
  if (!isAuthenticated) {
    if (currentRoute === '/login') {
      return <LoginPage navigate={navigate} />;
    }
    if (currentRoute === '/signup') {
      return <SignupPage navigate={navigate} />;
    }
    if (currentRoute === '/forgot-password') {
      return <ForgotPasswordPage navigate={navigate} />;
    }
    return <LandingPage navigate={navigate} />;
  }

  // If user is authenticated but has no active organization or explicitly creating new business, show onboarding wizard
  if (!currentOrg || currentRoute === '/onboarding' || currentRoute === '/create-organization' || currentRoute === '/new-business') {
    return <CreateOrganizationPage navigate={navigate} />;
  }

  // Render view based on route
  const renderCurrentView = () => {
    switch (currentRoute) {
      case '/dashboard':
      case '/insights':
        return <DashboardView navigate={navigate} />;
      case '/transactions':
        return <TransactionsView navigate={navigate} />;
      case '/sales':
        return <SalesView navigate={navigate} />;
      case '/purchases':
        return <PurchasesView navigate={navigate} />;
      case '/expenses':
        return <ExpensesView navigate={navigate} />;
      case '/banking':
        return <BankingView navigate={navigate} />;
      case '/customers':
        return <CustomersView navigate={navigate} />;
      case '/vendors':
        return <VendorsView navigate={navigate} />;
      case '/gst':
        return <GstView navigate={navigate} />;
      case '/reports':
        return <ReportsView navigate={navigate} />;
      case '/ai-assistant':
        return <AiAssistantView navigate={navigate} />;
      case '/ai-assistant/documents':
        return <DocumentScannerView navigate={navigate} />;
      case '/review':
        return <ReviewQueueView navigate={navigate} />;
      case '/settings':
      case '/settings/business':
      case '/settings/users':
        return <SettingsView navigate={navigate} />;
      case '/audit-log':
        return <AuditLogView navigate={navigate} />;
      default:
        return <DashboardView navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex font-sans antialiased">
      {/* App Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        navigate={navigate}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Workspace Layout */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          sidebarCollapsed ? 'pl-16' : 'pl-60'
        }`}
      >
        {/* Top Header Navigation */}
        <TopNav
          currentRoute={currentRoute}
          navigate={navigate}
          openSearch={() => setIsSearchOpen(true)}
          openNotifications={() => setIsNotificationsOpen(true)}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {renderCurrentView()}
        </main>
      </div>

      {/* Modals & Drawers */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        navigate={navigate}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        navigate={navigate}
      />
    </div>
  );
};

export default function App() {
  return (
    <AccountingProvider>
      <AppContent />
    </AccountingProvider>
  );
}
