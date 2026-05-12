import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ USER / COMPANY IDENTITY ============
  user: router({
    getCompanyInfo: protectedProcedure.query(async ({ ctx }) => {
      const info = await db.getUserCompanyInfo(ctx.user.id);
      return {
        companyName: info?.companyName ?? null,
        companyLogo: info?.companyLogo ?? null,
      };
    }),

    updateCompanyInfo: protectedProcedure
      .input(
        z.object({
          companyName: z.string().max(255).optional(),
          companyLogo: z.string().nullable().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const updates: { companyName?: string; companyLogo?: string | null } = {};
        if (input.companyName !== undefined) updates.companyName = input.companyName;
        if (input.companyLogo !== undefined) updates.companyLogo = input.companyLogo;
        await db.updateUserCompanyInfo(ctx.user.id, updates);
        return { success: true };
      }),
  }),

  // ============ ACCOUNTS ============
  accounts: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getAccountsByUserId(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const account = await db.getAccountById(input.id);
        if (!account) throw new TRPCError({ code: "NOT_FOUND" });
        return account;
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          type: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const account = await db.createAccount({
          userId: ctx.user.id,
          name: input.name,
          type: input.type,
          description: input.description,
          isDefault: 0,
        });
        await db.createActivity({
          userId: ctx.user.id,
          action: "ACCOUNT_CREATED",
          description: `Created account: ${input.name}`,
        });
        return account;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const account = await db.getAccountById(input.id);
        if (!account || account.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.updateAccount(input.id, {
          name: input.name,
          description: input.description,
        });
        await db.createActivity({
          userId: ctx.user.id,
          action: "ACCOUNT_UPDATED",
          description: `Updated account: ${account.name}`,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const account = await db.getAccountById(input.id);
        if (!account || account.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.deleteAccount(input.id);
        await db.createActivity({
          userId: ctx.user.id,
          action: "ACCOUNT_DELETED",
          description: `Deleted account: ${account.name}`,
        });
        return { success: true };
      }),
  }),

  // ============ TRANSACTIONS ============
  transactions: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getTransactionsWithEntries(ctx.user.id, input.limit);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const transaction = await db.getTransactionById(input.id);
        if (!transaction || transaction.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const entries = await db.getJournalEntriesByTransactionId(input.id);
        return { transaction, entries };
      }),

    create: protectedProcedure
      .input(
        z.object({
          date: z.date(),
          description: z.string().min(1),
          amount: z.string(), // decimal as string
          quantity: z.number().optional(),
          debitAccountId: z.number(),
          creditAccountId: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Validate accounts belong to user
        const debitAccount = await db.getAccountById(input.debitAccountId);
        const creditAccount = await db.getAccountById(input.creditAccountId);

        if (
          !debitAccount ||
          debitAccount.userId !== ctx.user.id ||
          !creditAccount ||
          creditAccount.userId !== ctx.user.id
        ) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        if (debitAccount.id === creditAccount.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Debit and credit accounts must be different",
          });
        }

        // Create transaction
        const transactionResult = await db.createTransaction({
          userId: ctx.user.id,
          date: input.date,
          description: input.description,
          amount: input.amount,
          quantity: input.quantity,
          status: "COMPLETED",
        });
        const transactionId = (transactionResult as any)?.insertId || 0;

        // Create journal entries (debit and credit)
        await db.createJournalEntry({
          transactionId: transactionId,
          accountId: input.debitAccountId,
          type: "DEBIT",
          amount: input.amount,
        });

        await db.createJournalEntry({
          transactionId: transactionId,
          accountId: input.creditAccountId,
          type: "CREDIT",
          amount: input.amount,
        });

        // Log activity
        await db.createActivity({
          userId: ctx.user.id,
          action: "TRANSACTION_CREATED",
          description: `Created transaction: ${input.description}`,
        });

        return { success: true, transactionId };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const transaction = await db.getTransactionById(input.id);
        if (!transaction || transaction.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        // Delete journal entries in one query
        await db.deleteJournalEntriesByTransactionId(input.id);

        // Delete transaction
        await db.deleteTransaction(input.id);

        // Log activity
        await db.createActivity({
          userId: ctx.user.id,
          action: "TRANSACTION_DELETED",
          description: `Deleted transaction: ${transaction.description}`,
        });

        return { success: true };
      }),
  }),

  // ============ JOURNAL ENTRIES ============
  journalEntries: router({
    listByAccount: protectedProcedure
      .input(z.object({ accountId: z.number() }))
      .query(async ({ ctx, input }) => {
        const account = await db.getAccountById(input.accountId);
        if (!account || account.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return db.getJournalEntriesByAccountId(input.accountId);
      }),

    listByTransaction: protectedProcedure
      .input(z.object({ transactionId: z.number() }))
      .query(async ({ ctx, input }) => {
        const transaction = await db.getTransactionById(input.transactionId);
        if (!transaction || transaction.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return db.getJournalEntriesByTransactionId(input.transactionId);
      }),
  }),

  // ============ ACTIVITIES ============
  activities: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getActivitiesByUserId(ctx.user.id, input.limit);
      }),
  }),

  // ============ REPORTS ============
  reports: router({
    trialBalance: protectedProcedure.query(async ({ ctx }) => {
      // 2 queries total instead of N+1
      const [accounts, allEntries] = await Promise.all([
        db.getAccountsByUserId(ctx.user.id),
        db.getJournalEntriesByUserId(ctx.user.id),
      ]);

      const balances = accounts.map((account) => {
        const entries = allEntries.filter((e) => e.accountId === account.id);
        const debits = entries
          .filter((e) => e.type === "DEBIT")
          .reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0);
        const credits = entries
          .filter((e) => e.type === "CREDIT")
          .reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0);
        return {
          accountId: account.id,
          accountName: account.name,
          accountType: account.type,
          debits,
          credits,
          balance: debits - credits,
        };
      });

      const totalDebits = balances.reduce((sum, b) => sum + b.debits, 0);
      const totalCredits = balances.reduce((sum, b) => sum + b.credits, 0);

      return {
        balances,
        totalDebits,
        totalCredits,
        isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
      };
    }),

    incomeStatement: protectedProcedure
      .input(
        z.object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
      )
      .query(async ({ ctx }) => {
        // 2 queries total instead of N+1
        const [accounts, allEntries] = await Promise.all([
          db.getAccountsByUserId(ctx.user.id),
          db.getJournalEntriesByUserId(ctx.user.id),
        ]);

        const buildLineItems = (accts: typeof accounts) =>
          accts.map((account) => {
            const amount = allEntries
              .filter((e) => e.accountId === account.id)
              .reduce((s, e) => s + parseFloat(e.amount.toString()), 0);
            return { accountId: account.id, accountName: account.name, amount };
          }).filter((item) => item.amount !== 0);

        const revenueAccounts  = accounts.filter((a) => a.type === "REVENUE");
        const expenseAccounts  = accounts.filter((a) => a.type === "EXPENSE");

        const revenues  = buildLineItems(revenueAccounts);
        const expenses  = buildLineItems(expenseAccounts);

        const totalRevenue  = revenues.reduce((sum, r) => sum + r.amount, 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

        return {
          revenues,
          expenses,
          totalRevenue,
          totalExpenses,
          netIncome: totalRevenue - totalExpenses,
        };
      }),

    balanceSheet: protectedProcedure
      .input(z.object({ asOfDate: z.date().optional() }))
      .query(async ({ ctx }) => {
        // 2 queries total instead of N+1
        const [accounts, allEntries] = await Promise.all([
          db.getAccountsByUserId(ctx.user.id),
          db.getJournalEntriesByUserId(ctx.user.id),
        ]);

        const buildLineItems = (type: string) =>
          accounts
            .filter((a) => a.type === type)
            .map((account) => {
              const balance = allEntries
                .filter((e) => e.accountId === account.id)
                .reduce((s, e) => s + parseFloat(e.amount.toString()), 0);
              return { accountId: account.id, accountName: account.name, balance };
            }).filter((item) => item.balance !== 0);

        const assets      = buildLineItems("ASSET");
        const liabilities = buildLineItems("LIABILITY");
        const equity      = buildLineItems("EQUITY");

        const totalAssets      = assets.reduce((sum, a) => sum + a.balance, 0);
        const totalLiabilities = liabilities.reduce((sum, l) => sum + l.balance, 0);
        const totalEquity      = equity.reduce((sum, e) => sum + e.balance, 0);

        return {
          assets,
          liabilities,
          equity,
          totalAssets,
          totalLiabilities,
          totalEquity,
          isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
