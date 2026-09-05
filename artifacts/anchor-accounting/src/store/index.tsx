import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  contacts as mockContacts,
  products as mockProducts,
  accounts as mockAccounts,
  journals as mockJournals,
  purchaseOrders as mockPurchaseOrders,
  vendorBills as mockVendorBills,
  salesOrders as mockSalesOrders,
  customerInvoices as mockCustomerInvoices,
  journalEntries as mockJournalEntries,
  budgets as mockBudgets
} from '@/mock-data';
import { api } from '@/lib/api';

interface StoreState {
  contacts: any[];
  products: any[];
  accounts: any[];
  journals: any[];
  purchaseOrders: any[];
  vendorBills: any[];
  salesOrders: any[];
  customerInvoices: any[];
  journalEntries: any[];
  budgets: any[];

  addContact: (data: any) => Promise<any>;
  updateContact: (id: string | number, data: any) => Promise<void>;
  deleteContact: (id: string | number) => Promise<void>;

  addProduct: (data: any) => Promise<any>;
  deleteProduct: (id: string | number) => Promise<void>;

  addAccount: (data: any) => Promise<any>;
  deleteAccount: (id: string | number) => Promise<void>;

  addJournal: (data: any) => Promise<any>;
  deleteJournal: (id: string | number) => Promise<void>;

  addPurchaseOrder: (data: any) => Promise<any>;
  deletePurchaseOrder: (id: string | number) => Promise<void>;

  addVendorBill: (data: any) => Promise<any>;
  deleteVendorBill: (id: string | number) => Promise<void>;

  addSalesOrder: (data: any) => Promise<any>;
  deleteSalesOrder: (id: string | number) => Promise<void>;

  addCustomerInvoice: (data: any) => Promise<any>;
  deleteCustomerInvoice: (id: string | number) => Promise<void>;

  addJournalEntry: (data: any) => Promise<any>;
  deleteJournalEntry: (id: string | number) => Promise<void>;

  addBudget: (data: any) => Promise<any>;
}

const StoreContext = createContext<StoreState | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<any[]>(mockContacts);
  const [products, setProducts] = useState<any[]>(mockProducts);
  const [accounts, setAccounts] = useState<any[]>(mockAccounts);
  const [journals, setJournals] = useState<any[]>(mockJournals);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>(mockPurchaseOrders);
  const [vendorBills, setVendorBills] = useState<any[]>(mockVendorBills);
  const [salesOrders, setSalesOrders] = useState<any[]>(mockSalesOrders);
  const [customerInvoices, setCustomerInvoices] = useState<any[]>(mockCustomerInvoices);
  const [journalEntries, setJournalEntries] = useState<any[]>(mockJournalEntries);
  const [budgets, setBudgets] = useState<any[]>(mockBudgets);

  useEffect(() => {
    async function initStore() {
      try {
        const resContacts = await api.getContacts();
        if (resContacts.contacts?.length) {
          setContacts(resContacts.contacts.map(c => ({ ...c, city: c.city || c.address || 'Local' })));
        }
      } catch {}

      try {
        const resProducts = await api.getProducts();
        if (resProducts.products?.length) {
          setProducts(resProducts.products.map(p => ({
            ...p,
            sales: p.sales || `$${parseFloat(p.unitPrice || '0').toFixed(2)}`,
            cost: p.cost || `$${parseFloat(p.costPrice || '0').toFixed(2)}`
          })));
        }
      } catch {}

      try {
        const resAccounts = await api.getAccounts();
        if (resAccounts.accounts?.length) {
          setAccounts(resAccounts.accounts.map(a => ({
            ...a,
            balance: a.balance?.startsWith('$') ? a.balance : `$${parseFloat(a.balance || '0').toFixed(2)}`
          })));
        }
      } catch {}

      try {
        const resJournals = await api.getJournals();
        if (resJournals.journals?.length) {
          setJournals(resJournals.journals.map(j => ({ ...j, account: j.account || j.name })));
        }
      } catch {}

      try {
        const resPO = await api.getPurchaseOrders();
        if (resPO.purchaseOrders?.length) {
          setPurchaseOrders(resPO.purchaseOrders.map((p: any) => ({
            ...p,
            partner: p.partner || p.vendorName,
            total: p.total || `$${parseFloat(p.totalAmount || '0').toFixed(2)}`,
            date: p.date || p.orderDate
          })));
        }
      } catch {}

      try {
        const resBills = await api.getVendorBills();
        if (resBills.vendorBills?.length) {
          setVendorBills(resBills.vendorBills.map((b: any) => ({
            ...b,
            partner: b.partner || b.vendorName,
            total: b.total || `$${parseFloat(b.totalAmount || '0').toFixed(2)}`
          })));
        }
      } catch {}

      try {
        const resSO = await api.getSalesOrders();
        if (resSO.salesOrders?.length) {
          setSalesOrders(resSO.salesOrders.map((s: any) => ({
            ...s,
            partner: s.partner || s.customerName,
            total: s.total || `$${parseFloat(s.totalAmount || '0').toFixed(2)}`,
            date: s.date || s.orderDate
          })));
        }
      } catch {}

      try {
        const resInvoices = await api.getCustomerInvoices();
        if (resInvoices.customerInvoices?.length) {
          setCustomerInvoices(resInvoices.customerInvoices.map((i: any) => ({
            ...i,
            partner: i.partner || i.customerName,
            total: i.total || `$${parseFloat(i.totalAmount || '0').toFixed(2)}`
          })));
        }
      } catch {}

      try {
        const resJE = await api.getJournalEntries();
        if (resJE.journalEntries?.length) {
          setJournalEntries(resJE.journalEntries.map((j: any) => ({
            ...j,
            journal: j.journal || j.journalName || 'General Journal',
            amount: j.amount || `$${parseFloat(j.debitTotal || '0').toFixed(2)}`
          })));
        }
      } catch {}

      try {
        const resB = await api.getBudgets();
        if (resB.budgets?.length) setBudgets(resB.budgets);
      } catch {}
    }

    initStore();
  }, []);

  // Contacts
  const addContact = async (data: any) => {
    let created: any;
    try {
      const res = await api.createContact(data);
      created = { ...res.contact, city: res.contact.city || res.contact.address || 'Local' };
    } catch {
      created = {
        id: `C-${Math.floor(1000 + Math.random() * 9000)}`,
        name: data.name || 'New Contact',
        type: data.type || 'Customer',
        email: data.email || 'contact@domain.com',
        phone: data.phone || '+1 555 0100',
        city: data.city || 'Local',
        balance: '$0.00'
      };
    }
    setContacts(prev => [created, ...prev]);
    return created;
  };

  const updateContact = async (id: string | number, data: any) => {
    setContacts(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)));
  };

  const deleteContact = async (id: string | number) => {
    try { await api.deleteContact(id); } catch {}
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  // Products
  const addProduct = async (data: any) => {
    let created: any;
    try {
      const res = await api.createProduct(data);
      created = {
        ...res.product,
        sales: `$${parseFloat(res.product.unitPrice || '0').toFixed(2)}`,
        cost: `$${parseFloat(res.product.costPrice || '0').toFixed(2)}`
      };
    } catch {
      created = {
        id: `PR-${Math.floor(1000 + Math.random() * 9000)}`,
        name: data.name || 'New Product',
        type: data.type || 'Service',
        category: data.category || 'Goods',
        sales: `$${parseFloat(data.unitPrice || '120').toFixed(2)}`,
        cost: `$${parseFloat(data.costPrice || '60').toFixed(2)}`
      };
    }
    setProducts(prev => [created, ...prev]);
    return created;
  };

  const deleteProduct = async (id: string | number) => {
    try { await api.deleteProduct(id); } catch {}
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Accounts
  const addAccount = async (data: any) => {
    let created: any;
    try {
      const res = await api.createAccount(data);
      created = { ...res.account, balance: `$${parseFloat(res.account.balance || '0').toFixed(2)}` };
    } catch {
      created = {
        id: `${Math.floor(1000 + Math.random() * 8000)}`,
        name: data.name || 'New Account',
        type: data.type || 'Asset',
        balance: '$0.00'
      };
    }
    setAccounts(prev => [created, ...prev]);
    return created;
  };

  const deleteAccount = async (id: string | number) => {
    try { await api.deleteAccount(id); } catch {}
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  // Journals
  const addJournal = async (data: any) => {
    let created: any;
    try {
      const res = await api.createJournal(data);
      created = { ...res.journal, account: res.journal.name };
    } catch {
      created = {
        id: `J-0${journals.length + 1}`,
        name: data.name || 'New Journal',
        type: data.type || 'General',
        account: data.name || 'General Journal'
      };
    }
    setJournals(prev => [created, ...prev]);
    return created;
  };

  const deleteJournal = async (id: string | number) => {
    try { await api.deleteJournal(id); } catch {}
    setJournals(prev => prev.filter(j => j.id !== id));
  };

  // Purchase Orders
  const addPurchaseOrder = async (data: any) => {
    let created: any;
    try {
      const res = await api.createPurchaseOrder({
        vendorId: data.vendorId,
        vendorName: data.partner || data.vendorName,
        totalAmount: data.rawTotal || data.totalAmount || '0.00',
        status: data.status || 'Confirmed',
        items: data.items
      });
      created = {
        ...res.purchaseOrder,
        id: res.purchaseOrder.orderNo || res.purchaseOrder.id,
        partner: res.purchaseOrder.vendorName,
        date: res.purchaseOrder.orderDate || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        total: `$${parseFloat(res.purchaseOrder.totalAmount || '0').toFixed(2)}`,
        items: res.purchaseOrder.items || data.items || 'Standard Purchase Order'
      };
    } catch {
      const count = purchaseOrders.length + 43;
      created = {
        id: `P000${count}`,
        partner: data.partner || 'Vendor',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        total: data.total || `$${parseFloat(data.rawTotal || '0').toFixed(2)}`,
        status: data.status || 'Confirmed',
        items: data.items || 'Standard Order'
      };
    }
    setPurchaseOrders(prev => [created, ...prev]);
    return created;
  };

  const deletePurchaseOrder = async (id: string | number) => {
    setPurchaseOrders(prev => prev.filter(p => (p.id || p.orderNo) !== id));
  };

  // Vendor Bills
  const addVendorBill = async (data: any) => {
    let created: any;
    try {
      const res = await api.createVendorBill({
        vendorName: data.partner,
        totalAmount: data.rawTotal || data.totalAmount || '0.00',
        status: data.status || 'Not Paid'
      });
      created = {
        ...res.vendorBill,
        id: res.vendorBill.billId || res.vendorBill.id,
        partner: res.vendorBill.vendorName,
        due: res.vendorBill.dueDate || 'Net 30',
        total: `$${parseFloat(res.vendorBill.totalAmount || '0').toFixed(2)}`,
        paid: '$0.00',
        status: res.vendorBill.status || 'Not Paid'
      };
    } catch {
      const count = vendorBills.length + 8;
      created = {
        id: `Bill/2026/000${count}`,
        no: `VB-26-0${count}`,
        partner: data.partner || 'Vendor',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        due: 'Apr 30, 2026',
        total: data.total || `$${parseFloat(data.rawTotal || '0').toFixed(2)}`,
        paid: '$0.00',
        status: 'Not Paid'
      };
    }
    setVendorBills(prev => [created, ...prev]);
    return created;
  };

  const deleteVendorBill = async (id: string | number) => {
    setVendorBills(prev => prev.filter(b => b.id !== id));
  };

  // Sales Orders
  const addSalesOrder = async (data: any) => {
    let created: any;
    try {
      const res = await api.createSalesOrder({
        customerId: data.customerId,
        customerName: data.partner || data.customerName,
        totalAmount: data.rawTotal || data.totalAmount || '0.00',
        status: data.status || 'Confirmed',
        items: data.items
      });
      created = {
        ...res.salesOrder,
        id: res.salesOrder.orderNo || res.salesOrder.id,
        partner: res.salesOrder.customerName,
        date: res.salesOrder.orderDate || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        total: `$${parseFloat(res.salesOrder.totalAmount || '0').toFixed(2)}`,
        items: res.salesOrder.items || data.items || 'Standard Sales Order'
      };
    } catch {
      const count = salesOrders.length + 39;
      created = {
        id: `S000${count}`,
        partner: data.partner || 'Customer',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        total: data.total || `$${parseFloat(data.rawTotal || '0').toFixed(2)}`,
        status: data.status || 'Confirmed',
        items: data.items || 'Standard Order'
      };
    }
    setSalesOrders(prev => [created, ...prev]);
    return created;
  };

  const deleteSalesOrder = async (id: string | number) => {
    setSalesOrders(prev => prev.filter(s => (s.id || s.orderNo) !== id));
  };

  // Customer Invoices
  const addCustomerInvoice = async (data: any) => {
    let created: any;
    try {
      const res = await api.createCustomerInvoice({
        customerName: data.partner,
        totalAmount: data.rawTotal || data.totalAmount || '0.00',
        status: data.status || 'Not Paid'
      });
      created = {
        ...res.customerInvoice,
        id: res.customerInvoice.invoiceId || res.customerInvoice.id,
        partner: res.customerInvoice.customerName,
        due: res.customerInvoice.dueDate || 'Net 30',
        total: `$${parseFloat(res.customerInvoice.totalAmount || '0').toFixed(2)}`,
        paid: '$0.00',
        status: res.customerInvoice.status || 'Not Paid'
      };
    } catch {
      const count = customerInvoices.length + 13;
      created = {
        id: `INV/2026/00${count}`,
        no: `INV-26-0${count}`,
        partner: data.partner || 'Customer',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        due: 'Apr 30, 2026',
        total: data.total || `$${parseFloat(data.rawTotal || '0').toFixed(2)}`,
        paid: '$0.00',
        status: 'Not Paid'
      };
    }
    setCustomerInvoices(prev => [created, ...prev]);
    return created;
  };

  const deleteCustomerInvoice = async (id: string | number) => {
    setCustomerInvoices(prev => prev.filter(i => i.id !== id));
  };

  // Journal Entries
  const addJournalEntry = async (data: any) => {
    let created: any;
    try {
      const res = await api.createJournalEntry({
        journalName: data.journalName || data.journal || 'General Journal',
        date: data.date,
        reference: data.reference || data.memo,
        partner: data.partner,
        debitTotal: data.rawTotal || data.debitTotal || '0.00',
        creditTotal: data.rawTotal || data.creditTotal || '0.00',
        status: data.status || 'Posted',
        lines: data.lines || []
      });
      created = {
        ...res.journalEntry,
        id: res.journalEntry.entryNo || res.journalEntry.id,
        journal: res.journalEntry.journalName,
        memo: res.journalEntry.reference || res.journalEntry.memo || 'Journal Entry',
        amount: `$${parseFloat(res.journalEntry.debitTotal || '0').toFixed(2)}`
      };
    } catch {
      const count = journalEntries.length + 20;
      created = {
        id: `JE-2026-0${count}`,
        date: data.date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        journal: data.journal || 'General Journal',
        memo: data.reference || data.memo || 'Journal Entry',
        amount: data.amount || `$${parseFloat(data.rawTotal || '0').toFixed(2)}`,
        status: data.status || 'Posted'
      };
    }
    setJournalEntries(prev => [created, ...prev]);
    return created;
  };

  const deleteJournalEntry = async (id: string | number) => {
    try { await api.deleteJournalEntry(id); } catch {}
    setJournalEntries(prev => prev.filter(j => (j.id || j.entryNo) !== id));
  };

  // Budgets
  const addBudget = async (data: any) => {
    let created: any;
    try {
      const res = await api.createBudget(data);
      created = res.budget;
    } catch {
      created = {
        id: `B-2026-0${budgets.length + 1}`,
        budgetId: `BDG-${budgets.length + 10}`,
        name: data.name || 'New Budget',
        period: data.period || 'Q2 2026',
        owner: data.owner || 'Mara Chen',
        analytic: data.analytic || 'Operations',
        type: data.type || 'Expense',
        committed: data.committed || '$0.00',
        achieved: data.achieved || '$0.00',
        target: data.target || '$50,000.00',
        pct: data.pct || 0,
        status: data.status || 'Draft',
        linked: null
      };
    }
    setBudgets(prev => [created, ...prev]);
    return created;
  };

  const value: StoreState = {
    contacts,
    products,
    accounts,
    journals,
    purchaseOrders,
    vendorBills,
    salesOrders,
    customerInvoices,
    journalEntries,
    budgets,

    addContact,
    updateContact,
    deleteContact,

    addProduct,
    deleteProduct,

    addAccount,
    deleteAccount,

    addJournal,
    deleteJournal,

    addPurchaseOrder,
    deletePurchaseOrder,

    addVendorBill,
    deleteVendorBill,

    addSalesOrder,
    deleteSalesOrder,

    addCustomerInvoice,
    deleteCustomerInvoice,

    addJournalEntry,
    deleteJournalEntry,

    addBudget
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export function useContacts() {
  const { contacts, addContact, updateContact, deleteContact } = useStore();
  return { contacts, addContact, updateContact, deleteContact };
}

export function useProducts() {
  const { products, addProduct, deleteProduct } = useStore();
  return { products, addProduct, deleteProduct };
}

export function useAccounts() {
  const { accounts, addAccount, deleteAccount } = useStore();
  return { accounts, addAccount, deleteAccount };
}

export function useJournals() {
  const { journals, addJournal, deleteJournal } = useStore();
  return { journals, addJournal, deleteJournal };
}

export function usePurchaseOrders() {
  const { purchaseOrders, addPurchaseOrder, deletePurchaseOrder } = useStore();
  return { purchaseOrders, addPurchaseOrder, deletePurchaseOrder };
}

export function useVendorBills() {
  const { vendorBills, addVendorBill, deleteVendorBill } = useStore();
  return { vendorBills, addVendorBill, deleteVendorBill };
}

export function useSalesOrders() {
  const { salesOrders, addSalesOrder, deleteSalesOrder } = useStore();
  return { salesOrders, addSalesOrder, deleteSalesOrder };
}

export function useCustomerInvoices() {
  const { customerInvoices, addCustomerInvoice, deleteCustomerInvoice } = useStore();
  return { customerInvoices, addCustomerInvoice, deleteCustomerInvoice };
}

export function useJournalEntries() {
  const { journalEntries, addJournalEntry, deleteJournalEntry } = useStore();
  return { journalEntries, addJournalEntry, deleteJournalEntry };
}

export function useBudgets() {
  const { budgets, addBudget } = useStore();
  return { budgets, addBudget };
}
