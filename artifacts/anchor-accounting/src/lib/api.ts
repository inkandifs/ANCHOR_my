const API_BASE = "/api";

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  // Auth
  login: (loginId: string) => apiFetch<{ success: boolean; user: any }>("/auth/login", { method: "POST", body: JSON.stringify({ loginId }) }),
  signup: (userData: any) => apiFetch<{ success: boolean; user: any }>("/auth/signup", { method: "POST", body: JSON.stringify(userData) }),
  
  // Contacts
  getContacts: () => apiFetch<{ success: boolean; contacts: any[] }>("/contacts"),
  createContact: (data: any) => apiFetch<{ success: boolean; contact: any }>("/contacts", { method: "POST", body: JSON.stringify(data) }),

  // Products
  getProducts: () => apiFetch<{ success: boolean; products: any[] }>("/products"),
  createProduct: (data: any) => apiFetch<{ success: boolean; product: any }>("/products", { method: "POST", body: JSON.stringify(data) }),

  // Sales
  getSalesOrders: () => apiFetch<{ success: boolean; salesOrders: any[] }>("/sales-orders"),
  createSalesOrder: (data: any) => apiFetch<{ success: boolean; salesOrder: any }>("/sales-orders", { method: "POST", body: JSON.stringify(data) }),
  getCustomerInvoices: () => apiFetch<{ success: boolean; customerInvoices: any[] }>("/customer-invoices"),
  createCustomerInvoice: (data: any) => apiFetch<{ success: boolean; customerInvoice: any }>("/customer-invoices", { method: "POST", body: JSON.stringify(data) }),

  // Purchases
  getPurchaseOrders: () => apiFetch<{ success: boolean; purchaseOrders: any[] }>("/purchase-orders"),
  createPurchaseOrder: (data: any) => apiFetch<{ success: boolean; purchaseOrder: any }>("/purchase-orders", { method: "POST", body: JSON.stringify(data) }),
  getVendorBills: () => apiFetch<{ success: boolean; vendorBills: any[] }>("/vendor-bills"),
  createVendorBill: (data: any) => apiFetch<{ success: boolean; vendorBill: any }>("/vendor-bills", { method: "POST", body: JSON.stringify(data) }),

  // Payments
  getPayments: () => apiFetch<{ success: boolean; payments: any[] }>("/payments"),
  createPayment: (data: any) => apiFetch<{ success: boolean; payment: any }>("/payments", { method: "POST", body: JSON.stringify(data) }),

  // Accounting
  getAccounts: () => apiFetch<{ success: boolean; accounts: any[] }>("/chart-of-accounts"),
  getJournals: () => apiFetch<{ success: boolean; journals: any[] }>("/journals"),
  getJournalEntries: () => apiFetch<{ success: boolean; journalEntries: any[] }>("/journal-entries"),
  createJournalEntry: (data: any) => apiFetch<{ success: boolean; journalEntry: any }>("/journal-entries", { method: "POST", body: JSON.stringify(data) }),

  // Budgets
  getBudgets: () => apiFetch<{ success: boolean; budgets: any[] }>("/budgets"),
  createBudget: (data: any) => apiFetch<{ success: boolean; budget: any }>("/budgets", { method: "POST", body: JSON.stringify(data) }),

  // Reports
  getProfitLoss: () => apiFetch<{ success: boolean; report: any }>("/reports/profit-loss"),
  getBalanceSheet: () => apiFetch<{ success: boolean; report: any }>("/reports/balance-sheet")
};
