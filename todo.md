# MIE Prime - Development TODO

## Phase 1: Foundation & Database Schema
- [x] Set up Drizzle schema with all tables (accounts, transactions, journal_entries, activities)
- [x] Create database migrations and apply schema
- [ ] Seed default chart of accounts for new users

## Phase 2: Core Layout & Authentication
- [x] Build DashboardLayout component with sidebar navigation
- [x] Implement responsive mobile menu
- [x] Create auth pages (login redirect, logout)
- [x] Add breadcrumb navigation
- [x] Style sidebar with deep navy/indigo and accent colors

## Phase 3: Dashboard Page
- [x] Build financial summary cards (Total Assets, Liabilities, Equity, Net Income)
- [x] Create recent transactions overview
- [x] Add cashflow line chart (Income, Expenses, Profit over time)
- [x] Display current month label
- [x] Add "New Transaction" button and shortcuts

## Phase 4: New Transaction Wizard
- [x] Build 4-step wizard UI with progress indicator
- [x] Step 1: Account selection (From/To dropdowns)
- [x] Step 2: Transaction details (amount, date, description, quantity)
- [x] Step 3: Review summary before saving
- [x] Step 4: Confirmation screen
- [x] Implement double-entry enforcement (debit = credit)
- [x] Create tRPC procedures for transaction creation

## Phase 5: Journal Page
- [x] Build journal entries table (Date, Account, Type, Description, Debit, Credit)
- [x] Add summary cards (Total Debits, Total Credits, Balance Status)
- [ ] Implement search/filter by description
- [ ] Add edit and delete functionality
- [ ] Display each transaction as two rows (debit + credit lines)

## Phase 6: Chart of Accounts Management
- [ ] Build accounts list page with categories (Assets, Liabilities, Equity, Revenue, Expenses)
- [ ] Create account creation form
- [ ] Implement account editing functionality
- [ ] Add account deletion with validation
- [ ] Display account type badges

## Phase 7: General Ledger Page
- [x] Group journal entries by account
- [x] Display running balance per account
- [x] Implement account name filter
- [x] Show transaction details within each account section

## Phase 8: Trial Balance Report
- [ ] Build trial balance table (Account, Debits, Credits, Balance)
- [ ] Add totals row at bottom
- [ ] Display balance status (Equal ✓ or Unbalanced ✗)
- [ ] Implement date range filter

## Phase 9: Financial Reports Page
- [ ] Build Income Statement report (Revenue - Expenses = Net Income)
- [ ] Build Balance Sheet report (Assets = Liabilities + Equity)
- [ ] Add date range selector
- [ ] Implement report generation logic
- [ ] Add export functionality (placeholder)

## Phase 10: Expenses Tracking Page
- [ ] List expense-type journal entries
- [ ] Create category breakdown chart (pie or bar)
- [ ] Add expense filtering and search

## Phase 11: Activities Log Page
- [ ] Build audit log table (Action, Description, Timestamp)
- [ ] Implement activity logging in all mutation procedures
- [ ] Add filtering by action type

## Phase 12: Account Settings Page
- [ ] Display user profile information
- [ ] Show subscription plan badge (Basic/Premium)
- [ ] Add display name update option
- [ ] Add logout button

## Phase 13: UI Polish & Refinement
- [ ] Implement loading skeletons for all pages
- [ ] Add smooth page transitions
- [ ] Refine color palette and typography
- [ ] Ensure responsive design across all breakpoints
- [ ] Add status badges (INCOME, EXPENSE, ASSET, LIABILITY)
- [ ] Implement error handling and validation messages

## Phase 14: Testing & Deployment
- [ ] Write vitest tests for core procedures
- [ ] Test double-entry enforcement
- [ ] Test financial calculations (Net Income, Balance Sheet)
- [ ] Write README with setup instructions
- [ ] Final QA and polish

## Completed Features
- [x] Database schema with double-entry bookkeeping
- [x] Backend tRPC procedures for all operations
- [x] Elegant UI design system with professional color palette
- [x] 12 routed pages with protected authentication
- [x] Dashboard with live financial data
- [x] 4-step Transaction Wizard with validation
- [x] Journal page with trial balance display
