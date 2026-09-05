import { execSync } from "child_process";
import fs from "fs";
import net from "net";
import path from "path";

async function isPortOpen(port: number, host: string = "127.0.0.1"): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

function findPgBinDir(): string {
  const rootDir = path.resolve(import.meta.dirname, "../..");
  const nodeModulesDir = path.join(rootDir, "node_modules");

  const searchDirs = [
    path.join(nodeModulesDir, ".pnpm"),
    nodeModulesDir
  ];

  for (const root of searchDirs) {
    if (!fs.existsSync(root)) continue;
    const entries = fs.readdirSync(root, { recursive: true }) as string[];
    const pgCtlRel = entries.find((e) => e.endsWith("/pg_ctl") || e === "pg_ctl");
    if (pgCtlRel) {
      return path.dirname(path.join(root, pgCtlRel));
    }
  }
  throw new Error("pg_ctl binary not found in node_modules");
}

export async function createTablesIfNotExist() {
  const { Client } = await import("pg");
  const connectionString = process.env.DATABASE_URL || "postgres://postgres@127.0.0.1:5432/anchor_db";
  const client = new Client({ connectionString });
  await client.connect();

  const ddl = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      login_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'User',
      company_name TEXT,
      billing_address TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'Customer',
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
      status TEXT NOT NULL DEFAULT 'Active',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      unit_price NUMERIC(12,2) NOT NULL,
      cost_price NUMERIC(12,2),
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'In Stock',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS chart_of_accounts (
      id SERIAL PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS journals (
      id SERIAL PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS sales_orders (
      id SERIAL PRIMARY KEY,
      order_no TEXT NOT NULL UNIQUE,
      customer_id INTEGER REFERENCES contacts(id),
      customer_name TEXT NOT NULL,
      order_date TEXT NOT NULL,
      expected_date TEXT,
      total_amount NUMERIC(12,2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'Confirmed',
      items JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS customer_invoices (
      id SERIAL PRIMARY KEY,
      invoice_id TEXT NOT NULL UNIQUE,
      ref_no TEXT,
      customer_id INTEGER REFERENCES contacts(id),
      customer_name TEXT NOT NULL,
      date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      total_amount NUMERIC(12,2) NOT NULL,
      paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
      status TEXT NOT NULL DEFAULT 'Not Paid',
      items JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id SERIAL PRIMARY KEY,
      order_no TEXT NOT NULL UNIQUE,
      vendor_id INTEGER REFERENCES contacts(id),
      vendor_name TEXT NOT NULL,
      order_date TEXT NOT NULL,
      expected_date TEXT,
      total_amount NUMERIC(12,2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'Confirmed',
      items JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS vendor_bills (
      id SERIAL PRIMARY KEY,
      bill_id TEXT NOT NULL UNIQUE,
      ref_no TEXT,
      vendor_id INTEGER REFERENCES contacts(id),
      vendor_name TEXT NOT NULL,
      date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      total_amount NUMERIC(12,2) NOT NULL,
      paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
      status TEXT NOT NULL DEFAULT 'Not Paid',
      items JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS journal_entries (
      id SERIAL PRIMARY KEY,
      entry_no TEXT NOT NULL UNIQUE,
      journal_name TEXT NOT NULL,
      date TEXT NOT NULL,
      reference TEXT,
      partner TEXT,
      debit_total NUMERIC(12,2) NOT NULL,
      credit_total NUMERIC(12,2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'Posted',
      lines JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS budgets (
      id SERIAL PRIMARY KEY,
      budget_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      period TEXT NOT NULL,
      owner TEXT NOT NULL,
      analytic TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'Expense',
      target NUMERIC(12,2) NOT NULL,
      committed NUMERIC(12,2) NOT NULL,
      achieved NUMERIC(12,2) NOT NULL,
      pct INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Confirmed',
      linked TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      payment_no TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      partner_name TEXT NOT NULL,
      doc_id TEXT,
      amount NUMERIC(12,2) NOT NULL,
      payment_date TEXT NOT NULL,
      method TEXT NOT NULL DEFAULT 'Bank',
      note TEXT,
      status TEXT NOT NULL DEFAULT 'Confirmed',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;
  await client.query(ddl);
  await client.end();
}

export async function ensurePostgresRunning() {
  const isRunning = await isPortOpen(5432);
  if (!isRunning) {
    console.log("Starting native PostgreSQL daemon on port 5432...");
    const dbPath = path.resolve(import.meta.dirname, "../../scripts/postgres-data");
    const binDir = findPgBinDir();
    const initdbBin = path.join(binDir, "initdb");
    const pgCtlBin = path.join(binDir, "pg_ctl");
    const logPath = path.resolve(import.meta.dirname, "../../scripts/postgres.log");

    if (!fs.existsSync(path.join(dbPath, "PG_VERSION"))) {
      fs.mkdirSync(dbPath, { recursive: true });
      execSync(`"${initdbBin}" -D "${dbPath}" -U postgres --auth=trust`, { stdio: "inherit" });
    }

    execSync(`"${pgCtlBin}" -D "${dbPath}" -l "${logPath}" -o "-p 5432" start`, { stdio: "inherit" });

    // Wait for port 5432 to open
    for (let i = 0; i < 10; i++) {
      if (await isPortOpen(5432)) break;
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  // Ensure anchor_db exists and password is set
  try {
    const { Client } = await import("pg");
    const client = new Client({ connectionString: "postgres://postgres@127.0.0.1:5432/postgres" });
    await client.connect();
    await client.query("ALTER USER postgres WITH PASSWORD 'password';");
    const res = await client.query("SELECT datname FROM pg_database WHERE datname='anchor_db'");
    if (res.rows.length === 0) {
      await client.query("CREATE DATABASE anchor_db;");
      console.log("Created database anchor_db.");
    }
    await client.end();
  } catch (err) {
    // Ignore
  }

  await createTablesIfNotExist();
  console.log("PostgreSQL server & tables ready on postgres://postgres:password@127.0.0.1:5432/anchor_db");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  ensurePostgresRunning().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error("Failed to start PostgreSQL daemon:", err);
    process.exit(1);
  });
}
