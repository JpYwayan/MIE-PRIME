import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { accounts } from "../drizzle/schema";
import dotenv from "dotenv";
dotenv.config();

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

// Replace this with your actual userId from the users table
const USER_ID = 1;

const defaultAccounts = [
  // ASSETS
  { userId: USER_ID, name: "Cash", type: "ASSET" as const, description: "Cash on hand", isDefault: 1 },
  { userId: USER_ID, name: "Accounts Receivable", type: "ASSET" as const, description: "Money owed to the business", isDefault: 1 },
  { userId: USER_ID, name: "Inventory", type: "ASSET" as const, description: "Goods held for sale", isDefault: 1 },

  // LIABILITIES
  { userId: USER_ID, name: "Accounts Payable", type: "LIABILITY" as const, description: "Money owed to suppliers", isDefault: 1 },
  { userId: USER_ID, name: "Loans Payable", type: "LIABILITY" as const, description: "Outstanding loan balances", isDefault: 1 },

  // EQUITY
  { userId: USER_ID, name: "Owner's Equity", type: "EQUITY" as const, description: "Owner's stake in the business", isDefault: 1 },
  { userId: USER_ID, name: "Retained Earnings", type: "EQUITY" as const, description: "Cumulative net earnings", isDefault: 1 },

  // REVENUE
  { userId: USER_ID, name: "Sales Revenue", type: "REVENUE" as const, description: "Income from sales", isDefault: 1 },
  { userId: USER_ID, name: "Service Revenue", type: "REVENUE" as const, description: "Income from services", isDefault: 1 },

  // EXPENSES
  { userId: USER_ID, name: "Rent Expense", type: "EXPENSE" as const, description: "Monthly rent", isDefault: 1 },
  { userId: USER_ID, name: "Utilities Expense", type: "EXPENSE" as const, description: "Electricity, water, etc.", isDefault: 1 },
  { userId: USER_ID, name: "Salaries Expense", type: "EXPENSE" as const, description: "Employee salaries", isDefault: 1 },
];

async function seed() {
  console.log("Seeding accounts...");
  await db.insert(accounts).values(defaultAccounts);
  console.log("Done! Inserted", defaultAccounts.length, "accounts.");
  await client.end();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});