import fs from "fs";
import path from "path";

export const isDbConnected = !!process.env.DATABASE_URL;

const DB_FILE = path.resolve(process.cwd(), "db-store.json");

const initialData = {
  users: [
    { id: 1, loginId: "mara.chen", name: "Mara Chen", email: "mara@hearthandform.co", role: "User", companyName: "Hearth & Form Studio", billingAddress: "123 Main St, Suite 400, New York, NY 10001" },
    { id: 2, loginId: "admin", name: "Workspace Admin", email: "admin@company.com", role: "Admin", companyName: "Anchor Workspace", billingAddress: "456 Corporate Blvd, SF, CA" }
  ],
  contacts: [
    { id: 1, name: "Morrow Architecture", type: "Customer", email: "contact@morrow.com", phone: "+1 555-0192", address: "742 Evergreen Terr", status: "Active" },
    { id: 2, name: "Juniper & Co", type: "Customer", email: "hello@juniper.co", phone: "+1 555-0143", address: "100 Market St", status: "Active" },
    { id: 3, name: "Sonder Crafts", type: "Vendor", email: "orders@sonder.io", phone: "+1 555-0812", address: "55 Industrial Pkwy", status: "Active" }
  ],
  products: [
    { id: 1, code: "PRD-001", name: "Architectural Consultation", category: "Services", unitPrice: "2400.00", costPrice: "1200.00", stockQuantity: 99, status: "In Stock" },
    { id: 2, code: "PRD-002", name: "Custom Joinery Package", category: "Goods", unitPrice: "4800.00", costPrice: "3100.00", stockQuantity: 12, status: "In Stock" },
    { id: 3, code: "PRD-003", name: "Site Inspection & Report", category: "Services", unitPrice: "1600.00", costPrice: "800.00", stockQuantity: 50, status: "In Stock" }
  ],
  salesOrders: [
    { id: 1, orderNo: "SO-0042", customerName: "Morrow Architecture", orderDate: "Mar 18, 2026", expectedDate: "Apr 17, 2026", totalAmount: "4800.00", status: "Confirmed" },
    { id: 2, orderNo: "SO-0041", customerName: "Juniper & Co", orderDate: "Mar 15, 2026", expectedDate: "Apr 14, 2026", totalAmount: "9600.00", status: "Confirmed" }
  ],
  customerInvoices: [
    { id: 1, invoiceId: "INV/2026/0012", refNo: "MORROW-26-009", customerName: "Morrow Architecture", date: "Mar 18, 2026", dueDate: "Apr 17, 2026", totalAmount: "4800.00", paidAmount: "0.00", status: "Not Paid" },
    { id: 2, invoiceId: "INV/2026/0011", refNo: "JUNIPER-26-006", customerName: "Juniper & Co", date: "Mar 15, 2026", dueDate: "Apr 14, 2026", totalAmount: "4800.00", paidAmount: "4800.00", status: "Paid" },
    { id: 3, invoiceId: "INV/2026/0010", refNo: "SONDER-26-004", customerName: "Sonder Crafts", date: "Mar 10, 2026", dueDate: "Apr 09, 2026", totalAmount: "9600.00", paidAmount: "0.00", status: "Not Paid" }
  ],
  purchaseOrders: [
    { id: 1, orderNo: "PO-0018", vendorName: "Sonder Crafts", orderDate: "Mar 12, 2026", expectedDate: "Mar 28, 2026", totalAmount: "3600.00", status: "Confirmed" }
  ],
  vendorBills: [
    { id: 1, billId: "BILL/2026/0004", refNo: "SDR-9921", vendorName: "Sonder Crafts", date: "Mar 12, 2026", dueDate: "Apr 11, 2026", totalAmount: "3600.00", paidAmount: "0.00", status: "Not Paid" },
    { id: 2, billId: "BILL/2026/0003", refNo: "MAT-8812", vendorName: "Timber & Iron Co", date: "Feb 28, 2026", dueDate: "Mar 30, 2026", totalAmount: "2410.00", paidAmount: "2410.00", status: "Paid" }
  ],
  payments: [
    { id: 1, paymentNo: "PAY-0032", type: "Receive", partnerName: "Juniper & Co", docId: "INV/2026/0011", amount: "4800.00", paymentDate: "Mar 15, 2026", method: "Credit Card (...4242)", note: "Invoice payment", status: "Confirmed" }
  ],
  accounts: [
    { id: 1, code: "1000", name: "Operating Bank — Mercury", type: "Asset", balance: "84219.42" },
    { id: 2, code: "1100", name: "Accounts Receivable", type: "Asset", balance: "32278.00" },
    { id: 3, code: "2000", name: "Accounts Payable", type: "Liability", balance: "9955.20" },
    { id: 4, code: "4000", name: "Professional Services", type: "Income", balance: "164820.00" },
    { id: 5, code: "5000", name: "Contractor Expense", type: "Expense", balance: "48210.50" }
  ],
  journals: [
    { id: 1, code: "GEN", name: "General Journal", type: "General" },
    { id: 2, code: "SLS", name: "Sales Journal", type: "Sales" },
    { id: 3, code: "PUR", name: "Purchase Journal", type: "Purchase" },
    { id: 4, code: "BNK", name: "Bank Journal", type: "Bank" }
  ],
  journalEntries: [
    { id: 1, entryNo: "JRN/2026/0048", journalName: "Sales Journal", date: "Mar 18, 2026", reference: "INV/2026/0012", partner: "Morrow Architecture", debitTotal: "4800.00", creditTotal: "4800.00", status: "Posted", lines: [{ accountCode: "1100", accountName: "Accounts Receivable", debit: "4800.00", credit: "0.00" }, { accountCode: "4000", accountName: "Professional Services", debit: "0.00", credit: "4800.00" }] }
  ],
  budgets: [
    { id: 1, budgetId: "BDG-2026-01", name: "Studio Operations Q1", period: "Jan – Mar 2026", owner: "Mara Chen", analytic: "ANC-001 Operations", type: "Expense", target: "$96,000.00", committed: "$57,960.00", achieved: "$42,180.00", pct: 44, status: "Confirmed" },
    { id: 2, budgetId: "BDG-2026-02", name: "Client Growth & Marketing", period: "Jan – Jun 2026", owner: "Eli Brooks", analytic: "ANC-002 Marketing", type: "Expense", target: "$45,000.00", committed: "$28,000.00", achieved: "$16,220.00", pct: 36, status: "Confirmed" }
  ]
};

function loadStore() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error loading store file:", err);
  }
  return initialData;
}

export const memoryStore = loadStore();

export function saveStore() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryStore, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving store file:", err);
  }
}
