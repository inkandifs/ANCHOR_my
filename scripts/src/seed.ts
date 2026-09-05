import bcrypt from "bcryptjs";
import {
  db,
  usersTable,
  contactsTable,
  productsTable,
  accountsTable,
  journalsTable,
  salesOrdersTable,
  customerInvoicesTable,
  purchaseOrdersTable,
  vendorBillsTable,
  journalEntriesTable,
  budgetsTable,
  paymentsTable
} from "@workspace/db";
import { ensurePostgresRunning } from "./start-db";

const FIRST_NAMES = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Peyton", "Dakota", "Reese", "Quinn", "Skyler", "Cameron", "Rowan", "Emerson", "Finley", "Hayden", "Sawyer", "Kai", "Logan"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
const CITIES = ["San Francisco, CA", "New York, NY", "Austin, TX", "Chicago, IL", "Seattle, WA", "Boston, MA", "Denver, CO", "Los Angeles, CA", "Portland, OR", "Miami, FL"];
const COMPANIES = ["Hearth & Form Studio", "Apex Digital", "Vanguard Logistics", "Zenith Labs", "Nimbus Software", "Solaria Energy", "Cascade Media", "Pinnacle Design", "BlueSky Tech", "Horizon Retail"];

export async function seed() {
  process.env.DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres:password@127.0.0.1:5432/anchor_db";
  await ensurePostgresRunning();

  console.log("Seeding PostgreSQL database...");

  // 1. Clear existing table records
  await db.delete(usersTable);
  await db.delete(salesOrdersTable);
  await db.delete(customerInvoicesTable);
  await db.delete(purchaseOrdersTable);
  await db.delete(vendorBillsTable);
  await db.delete(journalEntriesTable);
  await db.delete(budgetsTable);
  await db.delete(paymentsTable);
  await db.delete(contactsTable);
  await db.delete(productsTable);
  await db.delete(accountsTable);
  await db.delete(journalsTable);

  // 2. Seed 200 Dummy Users
  console.log("Seeding 200 dummy users...");
  const usersToInsert = [];

  // Default admin user
  const adminPasswordHash = bcrypt.hashSync("Anchor@001", 10);
  usersToInsert.push({
    loginId: "admin",
    name: "Mara Chen",
    email: "mara@hearthandform.co",
    passwordHash: adminPasswordHash,
    role: "Admin",
    companyName: "Hearth & Form Studio",
    billingAddress: "450 Mission St, San Francisco, CA 94105"
  });

  for (let i = 1; i <= 200; i++) {
    const numStr = String(i).padStart(3, "0");
    const firstName = FIRST_NAMES[(i - 1) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[Math.floor((i - 1) / FIRST_NAMES.length) % LAST_NAMES.length];
    const company = COMPANIES[(i - 1) % COMPANIES.length];
    const role = i === 1 ? "Admin" : i % 5 === 0 ? "Accountant" : "User";
    const passwordHash = bcrypt.hashSync(`Anchor@${numStr}`, 10);

    usersToInsert.push({
      loginId: `user${numStr}`,
      name: `${firstName} ${lastName}`,
      email: `user${numStr}@anchor.local`,
      passwordHash,
      role,
      companyName: company,
      billingAddress: `${100 + i} Main St, Suite ${i}, ${CITIES[i % CITIES.length]}`
    });
  }

  await db.insert(usersTable).values(usersToInsert);
  console.log(`Successfully seeded ${usersToInsert.length} users into PostgreSQL.`);

  // 3. Seed 60 Contacts (Customers & Vendors)
  console.log("Seeding contacts...");
  const contactsToInsert = [
    { name: "Hearth & Form Studio", type: "Customer", email: "client@hearthandform.co", phone: "+1 555 0192", address: "450 Mission St", city: "San Francisco, CA", balance: "14400.00" },
    { name: "Northwind Supply Co.", type: "Vendor", email: "billing@northwind.com", phone: "+1 555 0144", address: "100 Supply Way", city: "Seattle, WA", balance: "7890.50" },
    { name: "Acme Industrial", type: "Customer", email: "accounts@acme.com", phone: "+1 555 0188", address: "200 Factory Rd", city: "Chicago, IL", balance: "3200.00" },
    { name: "Global Freight Systems", type: "Vendor", email: "invoices@globalfreight.com", phone: "+1 555 0177", address: "500 Logistics Hub", city: "Los Angeles, CA", balance: "1420.00" },
    { name: "Komorebi Crafts", type: "Customer", email: "hello@komorebi.jp", phone: "+1 555 0166", address: "77 Sakura Ave", city: "Portland, OR", balance: "8900.00" }
  ];

  for (let c = 6; c <= 60; c++) {
    const fn = FIRST_NAMES[c % FIRST_NAMES.length];
    const ln = LAST_NAMES[c % LAST_NAMES.length];
    const type = c % 3 === 0 ? "Vendor" : "Customer";
    contactsToInsert.push({
      name: `${fn} ${ln} Enterprises`,
      type,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@partner.org`,
      phone: `+1 555 01${String(c).padStart(2, "0")}`,
      address: `${c * 12} Commerce Blvd`,
      city: CITIES[c % CITIES.length],
      balance: `${(c * 250.50).toFixed(2)}`
    });
  }

  const seededContacts = await db.insert(contactsTable).values(contactsToInsert).returning();
  console.log(`Successfully seeded ${seededContacts.length} contacts.`);

  // 4. Seed Products
  console.log("Seeding products...");
  const productsToInsert = [
    { code: "PR-001", name: "Brand strategy sprint", category: "Services", unitPrice: "4800.00", costPrice: "2200.00", stockQuantity: 99, status: "In Stock" },
    { code: "PR-002", name: "Design system retainer", category: "Services", unitPrice: "2400.00", costPrice: "1100.00", stockQuantity: 99, status: "In Stock" },
    { code: "PR-003", name: "Ergonomic Walnut Desk", category: "Goods", unitPrice: "1250.00", costPrice: "650.00", stockQuantity: 24, status: "In Stock" },
    { code: "PR-004", name: "Acoustic Wall Panel (Set)", category: "Goods", unitPrice: "380.00", costPrice: "190.00", stockQuantity: 45, status: "In Stock" },
    { code: "PR-005", name: "Custom Ceramic Light Fixture", category: "Goods", unitPrice: "890.00", costPrice: "410.00", stockQuantity: 12, status: "In Stock" }
  ];
  await db.insert(productsTable).values(productsToInsert);

  // 5. Seed Chart of Accounts & Journals
  console.log("Seeding chart of accounts & journals...");
  const accountsToInsert = [
    { code: "1010", name: "Operating Bank — Mercury", type: "Bank", balance: "84219.42" },
    { code: "1200", name: "Accounts Receivable", type: "Asset", balance: "32278.00" },
    { code: "1050", name: "Petty Cash", type: "Cash", balance: "1280.00" },
    { code: "2000", name: "Accounts Payable", type: "Liability", balance: "9955.20" },
    { code: "4000", name: "Professional Services", type: "Income", balance: "164820.00" },
    { code: "5000", name: "Contractor Expense", type: "Expense", balance: "48210.50" }
  ];
  await db.insert(accountsTable).values(accountsToInsert);

  const journalsToInsert = [
    { code: "J-01", name: "General Journal", type: "General" },
    { code: "J-02", name: "Customer Invoices", type: "Sales" },
    { code: "J-03", name: "Vendor Bills", type: "Purchase" },
    { code: "J-04", name: "Bank Register", type: "Bank" }
  ];
  await db.insert(journalsTable).values(journalsToInsert);

  // 6. Seed Budgets
  console.log("Seeding budgets...");
  const budgetsToInsert = [
    { budgetId: "BDG-01", name: "Studio Operations Q1", period: "Q1 2026", owner: "Mara Chen", analytic: "ANC-001 Operations", type: "Expense", target: "50000.00", committed: "32400.00", achieved: "28900.00", pct: 58, status: "Confirmed" },
    { budgetId: "BDG-02", name: "Brand & Growth Expansion", period: "Q1–Q2 2026", owner: "Eli Brooks", analytic: "ANC-002 Marketing", type: "Expense", target: "25000.00", committed: "18500.00", achieved: "14200.00", pct: 56, status: "Confirmed" },
    { budgetId: "BDG-03", name: "Hardware & Facilities Upgrade", period: "Q2 2026", owner: "Mara Chen", analytic: "ANC-003 Facilities", type: "Expense", target: "15000.00", committed: "4200.00", achieved: "2100.00", pct: 14, status: "Draft" }
  ];
  await db.insert(budgetsTable).values(budgetsToInsert);

  // 7. Seed Sales Orders & Customer Invoices with Customer ID foreign keys
  console.log("Seeding sales orders & customer invoices...");
  const customerContact = seededContacts.find(c => c.type === "Customer") || seededContacts[0];
  const vendorContact = seededContacts.find(c => c.type === "Vendor") || seededContacts[1];

  await db.insert(salesOrdersTable).values([
    { orderNo: "S00039", customerId: customerContact.id, customerName: customerContact.name, orderDate: "Mar 24, 2026", expectedDate: "Apr 15, 2026", totalAmount: "7200.00", status: "Confirmed", items: [{ productName: "Brand strategy sprint", qty: 1, unitPrice: 4800, lineTotal: 4800 }, { productName: "Design system retainer", qty: 1, unitPrice: 2400, lineTotal: 2400 }] },
    { orderNo: "S00038", customerId: customerContact.id, customerName: customerContact.name, orderDate: "Mar 18, 2026", expectedDate: "Apr 01, 2026", totalAmount: "4800.00", status: "Confirmed", items: [{ productName: "Brand strategy sprint", qty: 1, unitPrice: 4800, lineTotal: 4800 }] }
  ]);

  await db.insert(customerInvoicesTable).values([
    { invoiceId: "INV/2026/0012", refNo: "INV-26-12", customerId: customerContact.id, customerName: customerContact.name, date: "Mar 24, 2026", dueDate: "Apr 24, 2026", totalAmount: "4800.00", paidAmount: "0.00", status: "Not Paid" },
    { invoiceId: "INV/2026/0010", refNo: "INV-26-10", customerId: customerContact.id, customerName: customerContact.name, date: "Mar 10, 2026", dueDate: "Apr 09, 2026", totalAmount: "9600.00", paidAmount: "0.00", status: "Not Paid" }
  ]);

  // 8. Seed Purchase Orders & Vendor Bills
  console.log("Seeding purchase orders & vendor bills...");
  await db.insert(purchaseOrdersTable).values([
    { orderNo: "P00043", vendorId: vendorContact.id, vendorName: vendorContact.name, orderDate: "Mar 22, 2026", expectedDate: "Apr 10, 2026", totalAmount: "3450.00", status: "Confirmed", items: [{ productName: "Ergonomic Walnut Desk", qty: 2, unitPrice: 1250, lineTotal: 2500 }] },
    { orderNo: "P00042", vendorId: vendorContact.id, vendorName: vendorContact.name, orderDate: "Mar 15, 2026", expectedDate: "Mar 30, 2026", totalAmount: "4440.50", status: "Confirmed", items: [{ productName: "Acoustic Wall Panel (Set)", qty: 5, unitPrice: 380, lineTotal: 1900 }] }
  ]);

  await db.insert(vendorBillsTable).values([
    { billId: "Bill/2026/0008", refNo: "VB-26-08", vendorId: vendorContact.id, vendorName: vendorContact.name, date: "Mar 22, 2026", dueDate: "Apr 22, 2026", totalAmount: "3450.00", paidAmount: "0.00", status: "Not Paid" },
    { billId: "Bill/2026/0007", refNo: "VB-26-07", vendorId: vendorContact.id, vendorName: vendorContact.name, date: "Mar 15, 2026", dueDate: "Apr 15, 2026", totalAmount: "4440.50", paidAmount: "0.00", status: "Not Paid" }
  ]);

  // 9. Seed Journal Entries
  console.log("Seeding journal entries...");
  await db.insert(journalEntriesTable).values([
    { entryNo: "JE-2026-020", journalName: "General Journal", date: "Mar 24, 2026", reference: "March Retainer & Strategy", partner: customerContact.name, debitTotal: "7200.00", creditTotal: "7200.00", status: "Posted", lines: [{ account: "1200 Accounts Receivable", debit: 7200, credit: 0 }, { account: "4000 Professional Services", debit: 0, credit: 7200 }] },
    { entryNo: "JE-2026-019", journalName: "General Journal", date: "Mar 20, 2026", reference: "Studio Rent & Utilities", partner: "Northwind Supply Co.", debitTotal: "3100.00", creditTotal: "3100.00", status: "Posted", lines: [{ account: "5000 Contractor Expense", debit: 3100, credit: 0 }, { account: "1010 Operating Bank — Mercury", debit: 0, credit: 3100 }] }
  ]);

  console.log("DATABASE SEEDING COMPLETE!");
  console.log("Sample Login Credentials:");
  console.log("  Admin: user001 / Anchor@001  (or admin / Anchor@001)");
  console.log("  Accountant: user005 / Anchor@005");
  console.log("  User: user002 / Anchor@002");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seed().catch((err) => {
    console.error("Database seeding failed:", err);
    process.exit(1);
  });
}
