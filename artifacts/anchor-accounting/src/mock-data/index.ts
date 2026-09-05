export const contacts = [
  { id: 'C-1042', name: 'Morrow & Finch Studio', type: 'Customer', email: 'hello@morrowfinch.co', phone: '+1 415 555 0184', city: 'San Francisco', balance: '$18,420.00' },
  { id: 'C-1038', name: 'Northline Materials', type: 'Vendor', email: 'accounts@northline.co', phone: '+1 206 555 0142', city: 'Seattle', balance: '$7,890.50' },
  { id: 'C-1031', name: 'Juniper House', type: 'Customer', email: 'studio@juniperhouse.io', phone: '+1 503 555 0127', city: 'Portland', balance: '$4,218.00' },
  { id: 'C-1024', name: 'Fieldwork Office Supply', type: 'Vendor', email: 'payables@fieldwork.com', phone: '+1 312 555 0196', city: 'Chicago', balance: '$2,064.70' },
  { id: 'C-1017', name: 'Sonder & Co.', type: 'Customer', email: 'finance@sonderandco.com', phone: '+1 212 555 0179', city: 'New York', balance: '$9,640.00' },
];
export const products = [
  { id: 'PR-0024', name: 'Brand strategy sprint', type: 'Service', category: 'Consulting', sales: '$4,800.00', cost: '$1,920.00' },
  { id: 'PR-0021', name: 'Design system retainer', type: 'Service', category: 'Design', sales: '$2,400.00', cost: '$960.00' },
  { id: 'PR-0018', name: 'Printed field guide', type: 'Goods', category: 'Merchandise', sales: '$38.00', cost: '$14.80' },
  { id: 'PR-0014', name: 'Workshop day', type: 'Service', category: 'Education', sales: '$1,250.00', cost: '$340.00' },
  { id: 'PR-0009', name: 'Launch toolkit', type: 'Combo', category: 'Packages', sales: '$6,750.00', cost: '$2,820.00' },
];
export const accounts = [
  { id: '1000', name: 'Operating Bank — Mercury', type: 'Bank', balance: '$84,219.42' },
  { id: '1010', name: 'Petty Cash', type: 'Cash', balance: '$1,280.00' },
  { id: '1200', name: 'Accounts Receivable', type: 'Asset', balance: '$32,278.00' },
  { id: '2000', name: 'Accounts Payable', type: 'Liability', balance: '$9,955.20' },
  { id: '2300', name: 'Accrued Contractor Costs', type: 'Liability', balance: '$6,140.00' },
  { id: '3000', name: 'Owner Capital', type: 'Capital', balance: '$51,400.00' },
  { id: '4100', name: 'Professional Services', type: 'Income', balance: '$164,820.00' },
  { id: '5100', name: 'Contractor Expense', type: 'Expense', balance: '$48,210.50' },
  { id: '5200', name: 'Software & Subscriptions', type: 'Expense', balance: '$8,942.16' },
];
export const journals = [
  { id: 'J-01', name: 'Sales Journal', type: 'Sales', account: '1200 · Accounts Receivable' },
  { id: 'J-02', name: 'Purchase Journal', type: 'Purchase', account: '2000 · Accounts Payable' },
  { id: 'J-03', name: 'Bank Journal', type: 'Bank', account: '1000 · Operating Bank — Mercury' },
  { id: 'J-04', name: 'Cash Journal', type: 'Cash', account: '1010 · Petty Cash' },
];
export const journalEntries = [
  { id: 'JE-2026-018', date: 'Mar 18, 2026', journal: 'Sales Journal', memo: 'Morrow & Finch — March retainer', amount: '$4,800.00', status: 'Posted' },
  { id: 'JE-2026-017', date: 'Mar 17, 2026', journal: 'Purchase Journal', memo: 'Northline materials delivery', amount: '$2,420.50', status: 'Draft' },
  { id: 'JE-2026-016', date: 'Mar 15, 2026', journal: 'Bank Journal', memo: 'Contractor payout batch', amount: '$8,214.00', status: 'Posted' },
  { id: 'JE-2026-015', date: 'Mar 14, 2026', journal: 'Sales Journal', memo: 'Juniper House workshop', amount: '$1,250.00', status: 'Posted' },
];
export const purchaseOrders = [
  { id: 'P00042', partner: 'Northline Materials', date: 'Mar 18, 2026', total: '$2,420.50', status: 'Confirmed', items: 'Printed field guide · 120 units' },
  { id: 'P00041', partner: 'Fieldwork Office Supply', date: 'Mar 12, 2026', total: '$860.00', status: 'Billed', items: 'Office supplies · 1 lot' },
  { id: 'P00040', partner: 'Northline Materials', date: 'Mar 06, 2026', total: '$4,610.00', status: 'Draft', items: 'Workshop materials · 4 lines' },
];
export const vendorBills = [
  { id: 'Bill/2026/0007', no: 'NORTH-26-019', partner: 'Northline Materials', date: 'Mar 19, 2026', due: 'Apr 18, 2026', total: '$2,420.50', paid: '$0.00', status: 'Not Paid' },
  { id: 'Bill/2026/0006', no: 'FIELD-26-018', partner: 'Fieldwork Office Supply', date: 'Mar 12, 2026', due: 'Apr 11, 2026', total: '$860.00', paid: '$860.00', status: 'Paid' },
  { id: 'Bill/2026/0005', no: 'NORTH-26-014', partner: 'Northline Materials', date: 'Mar 06, 2026', due: 'Apr 05, 2026', total: '$4,610.00', paid: '$2,000.00', status: 'Partial' },
];
export const salesOrders = [
  { id: 'S00038', partner: 'Morrow & Finch Studio', date: 'Mar 18, 2026', total: '$4,800.00', status: 'Confirmed', items: 'Brand strategy sprint' },
  { id: 'S00037', partner: 'Juniper House', date: 'Mar 15, 2026', total: '$1,250.00', status: 'Billed', items: 'Workshop day' },
  { id: 'S00036', partner: 'Sonder & Co.', date: 'Mar 10, 2026', total: '$9,600.00', status: 'Draft', items: 'Design system retainer · 4 mo' },
];
export const customerInvoices = [
  { id: 'INV/2026/0012', no: 'MORROW-26-009', partner: 'Morrow & Finch Studio', date: 'Mar 18, 2026', due: 'Apr 17, 2026', total: '$4,800.00', paid: '$0.00', status: 'Not Paid' },
  { id: 'INV/2026/0011', no: 'JUNIPER-26-006', partner: 'Juniper House', date: 'Mar 15, 2026', due: 'Apr 14, 2026', total: '$1,250.00', paid: '$1,250.00', status: 'Paid' },
  { id: 'INV/2026/0010', no: 'SONDER-26-004', partner: 'Sonder & Co.', date: 'Mar 10, 2026', due: 'Apr 09, 2026', total: '$9,600.00', paid: '$4,800.00', status: 'Partial' },
];
export const budgets = [
  { id: 'B-2026-01', name: 'FY26 Studio Operations', period: 'Jan 01 — Dec 31, 2026', owner: 'Mara Chen', analytic: 'Operations', type: 'Expense', committed: '$68,420', achieved: '$42,180', target: '$96,000', pct: 44, status: 'Confirmed', linked: null },
  { id: 'B-2026-02', name: 'FY26 Growth & Brand', period: 'Jan 01 — Dec 31, 2026', owner: 'Mara Chen', analytic: 'Growth', type: 'Expense', committed: '$38,200', achieved: '$26,740', target: '$54,000', pct: 49, status: 'Confirmed', linked: null },
  { id: 'B-2026-03', name: 'Q2 Field Program', period: 'Apr 01 — Jun 30, 2026', owner: 'Eli Brooks', analytic: 'Programs', type: 'Income', committed: '$24,800', achieved: '$8,620', target: '$44,000', pct: 20, status: 'Draft', linked: null },
];