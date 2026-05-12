import { desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertUser, users, accounts, transactions, journalEntries, activities,
  InsertAccount, InsertTransaction, InsertJournalEntry, InsertActivity
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL, {
        max: 5,              // cap at 5 — well under the pool_size: 15 limit
        idle_timeout: 20,    // release idle connections after 20s
        connect_timeout: 10, // fail fast instead of hanging
        prepare: false,      // required for pgbouncer Transaction Mode
      });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ ACCOUNTS ============

export async function getAccountsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(accounts).where(eq(accounts.userId, userId));
}

export async function getAccountById(accountId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(accounts).where(eq(accounts.id, accountId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAccount(account: InsertAccount) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(accounts).values(account).returning();
  return result[0];
}

export async function updateAccount(accountId: number, updates: Partial<InsertAccount>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(accounts).set(updates).where(eq(accounts.id, accountId));
}

export async function deleteAccount(accountId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(accounts).where(eq(accounts.id, accountId));
}

// ============ TRANSACTIONS ============

export async function getTransactionsByUserId(userId: number, limit?: number) {
  const db = await getDb();
  if (!db) return [];
  let query: any = db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.date));
  if (limit) query = query.limit(limit);
  return query;
}

export async function getTransactionsWithEntries(userId: number, limit?: number) {
  const db = await getDb();
  if (!db) return [];

  let txQuery: any = db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.date));
  if (limit) txQuery = txQuery.limit(limit);
  const txList = await txQuery;

  if (txList.length === 0) return [];

  // Fetch all journal entries for these transactions in one query
  const txIds = txList.map((t: any) => t.id);
  const allEntries = await db.select().from(journalEntries).where(
    txIds.length === 1
      ? eq(journalEntries.transactionId, txIds[0])
      : inArray(journalEntries.transactionId, txIds)
  );

  // Fetch all unique accounts referenced by those entries
  const accountIds = [...new Set(allEntries.map((e: any) => e.accountId))];
  const allAccounts = accountIds.length > 0
    ? await db.select().from(accounts).where(
        accountIds.length === 1
          ? eq(accounts.id, accountIds[0])
          : inArray(accounts.id, accountIds)
      )
    : [];

  const accountMap = new Map(allAccounts.map((a: any) => [a.id, a]));

  // Assemble
  return txList.map((tx: any) => ({
    ...tx,
    journalEntries: allEntries
      .filter((e: any) => e.transactionId === tx.id)
      .map((e: any) => ({ ...e, account: accountMap.get(e.accountId) ?? null })),
  }));
}

export async function getTransactionById(transactionId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(transactions).where(eq(transactions.id, transactionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createTransaction(transaction: InsertTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(transactions).values(transaction).returning();
  return result[0];
}

export async function updateTransaction(transactionId: number, updates: Partial<InsertTransaction>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(transactions).set(updates).where(eq(transactions.id, transactionId));
}

export async function deleteTransaction(transactionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(transactions).where(eq(transactions.id, transactionId));
}

// ============ JOURNAL ENTRIES ============

export async function getJournalEntriesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  // Join through transactions to filter by userId in one query
  const result = await db
    .select({ journalEntry: journalEntries })
    .from(journalEntries)
    .innerJoin(transactions, eq(journalEntries.transactionId, transactions.id))
    .where(eq(transactions.userId, userId));
  return result.map((r: any) => r.journalEntry);
}

export async function deleteJournalEntriesByTransactionId(transactionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(journalEntries).where(eq(journalEntries.transactionId, transactionId));
}

export async function getJournalEntriesByTransactionId(transactionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(journalEntries).where(eq(journalEntries.transactionId, transactionId));
}

export async function getJournalEntriesByAccountId(accountId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(journalEntries).where(eq(journalEntries.accountId, accountId)).orderBy(desc(journalEntries.createdAt));
}

export async function createJournalEntry(entry: InsertJournalEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(journalEntries).values(entry).returning();
  return result[0];
}

export async function deleteJournalEntry(entryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(journalEntries).where(eq(journalEntries.id, entryId));
}

// ============ ACTIVITIES ============

export async function getActivitiesByUserId(userId: number, limit?: number) {
  const db = await getDb();
  if (!db) return [];
  let query: any = db.select().from(activities).where(eq(activities.userId, userId)).orderBy(desc(activities.createdAt));
  if (limit) query = query.limit(limit);
  return query;
}

export async function createActivity(activity: InsertActivity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(activities).values(activity).returning();
  return result[0];
}

// ============ COMPANY IDENTITY ============

export async function getUserCompanyInfo(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select({ companyName: users.companyName, companyLogo: users.companyLogo })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateUserCompanyInfo(
  userId: number,
  data: { companyName?: string; companyLogo?: string | null }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, userId));
}
