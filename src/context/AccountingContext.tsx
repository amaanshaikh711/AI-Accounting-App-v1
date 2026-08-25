import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Organization,
  Invoice,
  PurchaseBill,
  Transaction,
  Expense,
  Customer,
  Vendor,
  BankAccount,
  BankFeedItem,
  BankStatementLine,
  ReviewItem,
  AIInsight,
  AuditLogEntry,
  AppNotification,
  DocumentExtraction,
  Role
} from '../types';
import {
  INITIAL_USER,
  INITIAL_USERS,
  INITIAL_ORGANIZATIONS,
  INITIAL_CUSTOMERS,
  INITIAL_VENDORS,
  INITIAL_INVOICES,
  INITIAL_PURCHASE_BILLS,
  INITIAL_EXPENSES,
  INITIAL_TRANSACTIONS,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_BANK_FEEDS,
  INITIAL_BANK_STATEMENT_LINES,
  INITIAL_REVIEW_ITEMS,
  INITIAL_AI_INSIGHTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  SAMPLE_DOCUMENTS
} from '../data/mockData';

interface AccountingContextType {
  // Auth & Tenant State
  currentUser: User | null;
  currentOrg: Organization | null;
  organizations: Organization[];
  users: User[];
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchOrganization: (orgId: string) => void;
  createOrganization: (orgData: Omit<Organization, 'id' | 'createdAt' | 'userRole'>) => Promise<Organization>;
  updateOrganization: (orgId: string | Partial<Organization>, data?: Partial<Organization>) => void;
  inviteUser: (name: string, email: string, role: Role, orgId: string) => void;

  // Accounting Records State
  invoices: Invoice[];
  purchaseBills: PurchaseBill[];
  transactions: Transaction[];
  expenses: Expense[];
  customers: Customer[];
  vendors: Vendor[];
  bankAccounts: BankAccount[];
  bankFeeds: BankFeedItem[];
  bankStatementLines: BankStatementLine[];
  reviewItems: ReviewItem[];
  insights: AIInsight[];
  auditLogs: AuditLogEntry[];
  notifications: AppNotification[];
  documents: DocumentExtraction[];

  // Mutations
  addInvoice: (invoice: Omit<Invoice, 'id' | 'orgId'>) => Invoice;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => void;
  deleteInvoice: (id: string) => void;

  addPurchaseBill: (bill: Omit<PurchaseBill, 'id' | 'orgId'>) => PurchaseBill;
  updatePurchaseBillStatus: (id: string, status: PurchaseBill['status']) => void;
  deletePurchaseBill: (id: string) => void;

  addTransaction: (transaction: Omit<Transaction, 'id' | 'orgId'>) => Transaction;
  addExpense: (expense: Omit<Expense, 'id' | 'orgId'>) => Expense;
  addCustomer: (customer: Omit<Customer, 'id' | 'orgId' | 'totalSales' | 'outstandingBalance'>) => Customer;
  addVendor: (vendor: Omit<Vendor, 'id' | 'orgId' | 'totalPurchases' | 'payablesBalance'>) => Vendor;

  reconcileBankFeed: (feedId: string, action: 'Matched' | 'Ignored') => void;
  reconcileStatementLine: (lineId: string, matchedTxId?: string) => void;
  handleReviewItem: (reviewId: string, action: 'Accepted' | 'Dismissed') => void;
  resolveReviewItem: (reviewId: string, resolution: 'Approved' | 'Rejected') => void;
  handleDocumentApproval: (docId: string, action: 'Approved' | 'Rejected') => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Computed Financial Metrics
  metrics: {
    revenue: number;
    expenses: number;
    netProfit: number;
    cashAndBank: number;
    receivables: number;
    payables: number;
    gstOutputLiability: number;
    gstInputCredit: number;
    gstNetPayable: number;
    overdueInvoicesCount: number;
    pendingReviewCount: number;
  };
}

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'ai_acc_user',
  USERS: 'ai_acc_users',
  CURRENT_ORG_ID: 'ai_acc_current_org_id',
  ORGS: 'ai_acc_orgs',
  INVOICES: 'ai_acc_invoices',
  PURCHASE_BILLS: 'ai_acc_purchase_bills',
  TRANSACTIONS: 'ai_acc_transactions',
  EXPENSES: 'ai_acc_expenses',
  CUSTOMERS: 'ai_acc_customers',
  VENDORS: 'ai_acc_vendors',
  BANK_ACCOUNTS: 'ai_acc_banks',
  BANK_FEEDS: 'ai_acc_feeds',
  BANK_STMT_LINES: 'ai_acc_stmt_lines',
  REVIEW_ITEMS: 'ai_acc_review',
  AUDIT_LOGS: 'ai_acc_audit',
  NOTIFICATIONS: 'ai_acc_notifs',
  DOCUMENTS: 'ai_acc_docs',
};

export const AccountingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize user & organization from localStorage or defaults
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORGS);
    return saved ? JSON.parse(saved) : INITIAL_ORGANIZATIONS;
  });

  const [currentOrgId, setCurrentOrgId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_ORG_ID);
    return saved || 'org_acme';
  });

  const currentOrg = organizations.find((o) => o.id === currentOrgId) || organizations[0] || null;

  // Data collections
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [purchaseBills, setPurchaseBills] = useState<PurchaseBill[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PURCHASE_BILLS);
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_BILLS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VENDORS);
    return saved ? JSON.parse(saved) : INITIAL_VENDORS;
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BANK_ACCOUNTS);
    return saved ? JSON.parse(saved) : INITIAL_BANK_ACCOUNTS;
  });

  const [bankFeeds, setBankFeeds] = useState<BankFeedItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BANK_FEEDS);
    return saved ? JSON.parse(saved) : INITIAL_BANK_FEEDS;
  });

  const [bankStatementLines, setBankStatementLines] = useState<BankStatementLine[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BANK_STMT_LINES);
    return saved ? JSON.parse(saved) : INITIAL_BANK_STATEMENT_LINES;
  });

  const [reviewItems, setReviewItems] = useState<ReviewItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REVIEW_ITEMS);
    return saved ? JSON.parse(saved) : INITIAL_REVIEW_ITEMS;
  });

  const [insights] = useState<AIInsight[]>(INITIAL_AI_INSIGHTS);

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [documents, setDocuments] = useState<DocumentExtraction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    return saved ? JSON.parse(saved) : SAMPLE_DOCUMENTS;
  });

  // Save changes to localStorage for persistence
  useEffect(() => {
    if (currentUser) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    else localStorage.removeItem(STORAGE_KEYS.USER);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORGS, JSON.stringify(organizations));
  }, [organizations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ORG_ID, currentOrgId);
  }, [currentOrgId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PURCHASE_BILLS, JSON.stringify(purchaseBills));
  }, [purchaseBills]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(bankAccounts));
  }, [bankAccounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BANK_FEEDS, JSON.stringify(bankFeeds));
  }, [bankFeeds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BANK_STMT_LINES, JSON.stringify(bankStatementLines));
  }, [bankStatementLines]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEW_ITEMS, JSON.stringify(reviewItems));
  }, [reviewItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  }, [documents]);

  const addAuditEntry = (action: string, module: string, recordRef: string) => {
    const newEntry: AuditLogEntry = {
      id: `aud_${Date.now()}`,
      orgId: currentOrg?.id || 'org_acme',
      timestamp: new Date().toISOString(),
      user: currentUser?.name || 'Authorized User',
      userEmail: currentUser?.email || 'user@example.in',
      action,
      module,
      recordRef,
      ipAddress: '103.21.144.92 (India)',
      status: 'Success',
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Auth Operations
  const login = async (email: string, _password?: string) => {
    await new Promise((res) => setTimeout(res, 200));
    const user: User = {
      id: 'usr_01',
      name: email.split('@')[0].replace('.', ' ').toUpperCase() || 'Amaan Sharma',
      email,
      role: 'Owner',
      avatar: (email[0] + (email[1] || '')).toUpperCase(),
    };
    setCurrentUser(user);
    addAuditEntry('User Logged In', 'Authentication', `Session started: ${email}`);
    return { success: true };
  };

  const signup = async (name: string, email: string, _password?: string) => {
    await new Promise((res) => setTimeout(res, 200));
    const user: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role: 'Owner',
      avatar: name.slice(0, 2).toUpperCase(),
    };
    setCurrentUser(user);
    addAuditEntry('User Registered', 'Authentication', `New account created: ${email}`);
    return { success: true };
  };

  const logout = () => {
    addAuditEntry('User Logged Out', 'Authentication', 'Session ended gracefully');
    setCurrentUser(null);
  };

  const switchOrganization = (orgId: string) => {
    const target = organizations.find((o) => o.id === orgId);
    if (target) {
      setCurrentOrgId(target.id);
      addAuditEntry('Switched Organization Tenant', 'Workspace', `Switched to ${target.name}`);
    }
  };

  const createOrganization = async (orgData: Omit<Organization, 'id' | 'createdAt' | 'userRole'>): Promise<Organization> => {
    const newOrg: Organization = {
      ...orgData,
      id: `org_${Date.now()}`,
      createdAt: new Date().toISOString(),
      userRole: 'Owner',
    };
    setOrganizations((prev) => [...prev, newOrg]);
    setCurrentOrgId(newOrg.id);
    addAuditEntry('Created Organization Tenant', 'Settings', `Organization: ${newOrg.name} (${newOrg.businessType})`);
    return newOrg;
  };

  const updateOrganization = (orgIdOrData: string | Partial<Organization>, data?: Partial<Organization>) => {
    const targetId = typeof orgIdOrData === 'string' ? orgIdOrData : currentOrg?.id;
    const payload = typeof orgIdOrData === 'string' ? (data || {}) : orgIdOrData;

    if (!targetId) return;
    setOrganizations((prev) =>
      prev.map((org) => (org.id === targetId ? { ...org, ...payload } : org))
    );
    addAuditEntry('Updated Business Profile', 'Settings', `Updated profile settings for organization`);
  };

  const inviteUser = (name: string, email: string, role: Role, orgId: string) => {
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role,
      avatar: name.slice(0, 2).toUpperCase(),
    };
    setUsers((prev) => [...prev, newUser]);
    addAuditEntry('Invited Team Member', 'Settings', `Invited ${name} (${email}) as ${role}`);
  };

  // Record Mutations
  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'orgId'>): Invoice => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `inv_${Date.now()}`,
      orgId: currentOrg?.id || 'org_acme',
    };
    setInvoices((prev) => [newInvoice, ...prev]);

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      orgId: currentOrg?.id || 'org_acme',
      date: newInvoice.date,
      description: `Tax Invoice #${newInvoice.invoiceNumber}`,
      type: 'Sale',
      partyName: newInvoice.customerName,
      partyType: 'Customer',
      partyGstin: newInvoice.customerGstin,
      amount: newInvoice.totalAmount,
      taxableAmount: newInvoice.taxableAmount,
      gstAmount: newInvoice.cgst + newInvoice.sgst + newInvoice.igst,
      gstRate: 18,
      status: newInvoice.status === 'Paid' ? 'Paid' : 'Categorized',
      account: 'HDFC Current A/c (0060)',
      referenceNo: newInvoice.invoiceNumber,
    };
    setTransactions((prev) => [newTx, ...prev]);

    if (newInvoice.status !== 'Paid') {
      setCustomers((prev) =>
        prev.map((c) =>
          c.name === newInvoice.customerName
            ? { ...c, outstandingBalance: c.outstandingBalance + (newInvoice.totalAmount - newInvoice.amountPaid) }
            : c
        )
      );
    }

    addAuditEntry('Created Tax Invoice', 'Sales', `${newInvoice.invoiceNumber} (${newInvoice.customerName})`);
    return newInvoice;
  };

  const updateInvoiceStatus = (id: string, status: Invoice['status']) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status } : inv))
    );
    addAuditEntry('Updated Invoice Status', 'Sales', `Invoice #${id} set to ${status}`);
  };

  const deleteInvoice = (id: string) => {
    const target = invoices.find((i) => i.id === id);
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    addAuditEntry('Deleted Invoice', 'Sales', `Invoice #${target?.invoiceNumber || id}`);
  };

  // Purchase Bills Mutations
  const addPurchaseBill = (billData: Omit<PurchaseBill, 'id' | 'orgId'>): PurchaseBill => {
    const newBill: PurchaseBill = {
      ...billData,
      id: `bill_${Date.now()}`,
      orgId: currentOrg?.id || 'org_acme',
    };
    setPurchaseBills((prev) => [newBill, ...prev]);

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      orgId: currentOrg?.id || 'org_acme',
      date: newBill.date,
      description: `Inward Purchase Bill #${newBill.billNumber}`,
      type: 'Purchase',
      partyName: newBill.vendorName,
      partyType: 'Vendor',
      partyGstin: newBill.vendorGstin,
      amount: newBill.totalAmount,
      taxableAmount: newBill.taxableAmount,
      gstAmount: newBill.cgst + newBill.sgst + newBill.igst,
      gstRate: 18,
      status: newBill.status === 'Paid' ? 'Paid' : 'Categorized',
      account: 'HDFC Current A/c (0060)',
      referenceNo: newBill.billNumber,
    };
    setTransactions((prev) => [newTx, ...prev]);

    addAuditEntry('Created Inward Bill', 'Purchases', `${newBill.billNumber} (${newBill.vendorName})`);
    return newBill;
  };

  const updatePurchaseBillStatus = (id: string, status: PurchaseBill['status']) => {
    setPurchaseBills((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
    addAuditEntry('Updated Bill Status', 'Purchases', `Bill #${id} set to ${status}`);
  };

  const deletePurchaseBill = (id: string) => {
    setPurchaseBills((prev) => prev.filter((b) => b.id !== id));
    addAuditEntry('Deleted Bill', 'Purchases', `Bill #${id}`);
  };

  const addTransaction = (txData: Omit<Transaction, 'id' | 'orgId'>): Transaction => {
    const newTx: Transaction = {
      ...txData,
      id: `tx_${Date.now()}`,
      orgId: currentOrg?.id || 'org_acme',
    };
    setTransactions((prev) => [newTx, ...prev]);
    addAuditEntry('Recorded Transaction', 'Transactions', `${newTx.type}: ${newTx.description}`);
    return newTx;
  };

  const addExpense = (expData: Omit<Expense, 'id' | 'orgId'>): Expense => {
    const newExp: Expense = {
      ...expData,
      id: `exp_${Date.now()}`,
      orgId: currentOrg?.id || 'org_acme',
    };
    setExpenses((prev) => [newExp, ...prev]);

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      orgId: currentOrg?.id || 'org_acme',
      date: newExp.date,
      description: newExp.description,
      type: 'Expense',
      partyName: newExp.vendorName || 'Direct Expense',
      partyType: 'Vendor',
      partyGstin: newExp.vendorGstin,
      amount: newExp.amount,
      taxableAmount: newExp.taxableAmount,
      gstAmount: newExp.gstAmount,
      gstRate: newExp.gstRate,
      status: 'Categorized',
      account: newExp.account || 'HDFC Current A/c (0060)',
      referenceNo: newExp.referenceNo,
    };
    setTransactions((prev) => [newTx, ...prev]);

    addAuditEntry('Created Expense Entry', 'Expenses', `${newExp.category} - ${newExp.vendorName || 'Direct'}`);
    return newExp;
  };

  const addCustomer = (custData: Omit<Customer, 'id' | 'orgId' | 'totalSales' | 'outstandingBalance'>): Customer => {
    const newCustomer: Customer = {
      ...custData,
      id: `cust_${Date.now()}`,
      orgId: currentOrg?.id || 'org_acme',
      outstandingBalance: 0,
      totalSales: 0,
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    addAuditEntry('Added Customer', 'Contacts', newCustomer.name);
    return newCustomer;
  };

  const addVendor = (vendorData: Omit<Vendor, 'id' | 'orgId' | 'totalPurchases' | 'payablesBalance'>): Vendor => {
    const newVendor: Vendor = {
      ...vendorData,
      id: `vend_${Date.now()}`,
      orgId: currentOrg?.id || 'org_acme',
      payablesBalance: 0,
      totalPurchases: 0,
    };
    setVendors((prev) => [newVendor, ...prev]);
    addAuditEntry('Added Vendor', 'Contacts', newVendor.name);
    return newVendor;
  };

  const reconcileBankFeed = (feedId: string, action: 'Matched' | 'Ignored') => {
    setBankFeeds((prev) =>
      prev.map((f) => (f.id === feedId ? { ...f, status: action } : f))
    );
    addAuditEntry('Bank Reconciliation Action', 'Banking', `Feed item ${feedId} marked as ${action}`);
  };

  const reconcileStatementLine = (lineId: string, matchedTxId?: string) => {
    setBankStatementLines((prev) =>
      prev.map((l) =>
        l.id === lineId
          ? { ...l, isReconciled: true, matchedTransactionId: matchedTxId || 'tx_reconciled' }
          : l
      )
    );
    addAuditEntry('Reconciled Bank Statement', 'Banking', `Statement line ${lineId} reconciled`);
  };

  const handleReviewItem = (reviewId: string, action: 'Accepted' | 'Dismissed') => {
    setReviewItems((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: action } : r))
    );
    addAuditEntry('Processed AI Review Item', 'Review Queue', `Item ${reviewId} marked as ${action}`);
  };

  const resolveReviewItem = (reviewId: string, resolution: 'Approved' | 'Rejected') => {
    setReviewItems((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: resolution } : r))
    );
    addAuditEntry('Resolved AI Anomaly', 'Review Queue', `Item ${reviewId} marked as ${resolution}`);
  };

  const handleDocumentApproval = (docId: string, action: 'Approved' | 'Rejected') => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;

    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, status: action } : d))
    );

    if (action === 'Approved' && doc.extractedData) {
      addExpense({
        date: doc.extractedData.date,
        category: 'Office Supplies',
        vendorName: doc.extractedData.vendorName,
        vendorGstin: doc.extractedData.gstin,
        description: `Imported via AI OCR from ${doc.fileName} (#${doc.extractedData.invoiceNumber})`,
        amount: doc.extractedData.totalAmount,
        taxableAmount: doc.extractedData.taxableAmount,
        gstAmount: doc.extractedData.cgst + doc.extractedData.sgst + doc.extractedData.igst,
        gstRate: 18,
        paymentMethod: 'Bank Transfer',
        status: 'Approved',
        referenceNo: doc.extractedData.invoiceNumber,
      });
    }

    addAuditEntry('Document OCR Action', 'AI Assistant', `${action} extracted document: ${doc.fileName}`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Financial Metrics Computation
  const totalSalesAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalExpenseAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const revenue = totalSalesAmount > 0 ? 2482400 + (totalSalesAmount - 1044190) : 2482400;
  const expensesTotal = totalExpenseAmount > 0 ? 842100 + (totalExpenseAmount - 721010) : 842100;
  const netProfit = revenue - expensesTotal;
  
  const cashAndBank = bankAccounts.reduce((sum, b) => sum + (b.balance || b.currentBalance || 0), 0) || 1284500;
  const receivables = customers.reduce((sum, c) => sum + c.outstandingBalance, 0) || 642000;
  const payables = vendors.reduce((sum, v) => sum + (v.outstandingBalance || v.payablesBalance || 0), 0) || 318500;

  // GST Breakdown
  const gstOutputLiability = invoices.reduce((sum, i) => sum + (i.cgst + i.sgst + i.igst), 0) || 120600;
  const gstInputCredit = expenses.reduce((sum, e) => sum + e.gstAmount, 0) || 78420;
  const gstNetPayable = Math.max(0, gstOutputLiability - gstInputCredit);

  const overdueInvoicesCount = invoices.filter((i) => i.status === 'Overdue').length;
  const pendingReviewCount = reviewItems.filter((r) => r.status === 'Pending').length;

  return (
    <AccountingContext.Provider
      value={{
        currentUser,
        currentOrg,
        organizations,
        users,
        isAuthenticated: !!currentUser,
        login,
        signup,
        logout,
        switchOrganization,
        createOrganization,
        updateOrganization,
        inviteUser,

        invoices,
        purchaseBills,
        transactions,
        expenses,
        customers,
        vendors,
        bankAccounts,
        bankFeeds,
        bankStatementLines,
        reviewItems,
        insights,
        auditLogs,
        notifications,
        documents,

        addInvoice,
        updateInvoiceStatus,
        deleteInvoice,
        addPurchaseBill,
        updatePurchaseBillStatus,
        deletePurchaseBill,
        addTransaction,
        addExpense,
        addCustomer,
        addVendor,
        reconcileBankFeed,
        reconcileStatementLine,
        handleReviewItem,
        resolveReviewItem,
        handleDocumentApproval,
        markNotificationRead,
        markAllNotificationsRead,

        metrics: {
          revenue,
          expenses: expensesTotal,
          netProfit,
          cashAndBank,
          receivables,
          payables,
          gstOutputLiability,
          gstInputCredit,
          gstNetPayable,
          overdueInvoicesCount,
          pendingReviewCount,
        },
      }}
    >
      {children}
    </AccountingContext.Provider>
  );
};

export const useAccounting = () => {
  const context = useContext(AccountingContext);
  if (!context) {
    throw new Error('useAccounting must be used within an AccountingProvider');
  }
  return context;
};
