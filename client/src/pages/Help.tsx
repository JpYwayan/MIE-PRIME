import { useState } from "react";
import {
  HelpCircle, Mail, MessageCircle, BookOpen,
  ChevronDown, Search, ArrowRight,
  FileText, BarChart2, RefreshCw, ShieldCheck, X,
} from "lucide-react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
  @keyframes pulse  { 0%,100% { opacity:1; } 50% { opacity:.4; } }
  @keyframes expand { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:none; } }

  .hp {
    font-family:'Outfit',sans-serif;
    --blue:#4F63D2; --blue3:rgba(79,99,210,0.08);
    --green:#15803d; --amber:#d97706;
    --ink:#111827; --ink3:#4B5563; --ink4:#9CA3AF;
    --surface2:#F9FAFB; --surface3:#F3F4F6;
    --border:rgba(17,24,39,0.09); --border2:rgba(17,24,39,0.05);
    min-height:100vh; background:transparent; color:var(--ink);
  }

  /* HEADER */
  .hp-header { padding:24px 28px 0; }
  .hp-live-pill {
    display:inline-flex; align-items:center; gap:6px;
    padding:3px 10px; background:rgba(255,255,255,0.30);
    border:1px solid rgba(255,255,255,0.45); border-radius:20px;
    font-size:9px; font-weight:700; color:#fff;
    font-family:'Space Mono',monospace; letter-spacing:.12em;
    text-transform:uppercase; margin-bottom:6px; width:fit-content;
  }
  .hp-live-dot { width:5px; height:5px; background:#86efac; border-radius:50%; animation:pulse 2s ease infinite; }
  .hp-title { font-size:27px; font-weight:800; color:#fff; letter-spacing:-.04em; margin:0 0 2px; }
  .hp-sub   { font-size:12px; color:rgba(255,255,255,.65); margin:0; font-weight:300; }

  /* BODY */
  .hp-body { padding:20px 28px 32px; display:flex; flex-direction:column; gap:18px; }

  /* SEARCH HERO */
  .hp-search-hero {
    background:#fff; border:1px solid var(--border);
    border-radius:16px; padding:28px 28px 24px;
    box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 16px rgba(0,0,0,0.05);
    animation:fadeUp .4s ease both;
    display:flex; flex-direction:column; align-items:center; gap:14px; text-align:center;
  }
  .hp-search-eyebrow {
    font-size:10px; font-weight:700; color:var(--blue);
    letter-spacing:.14em; text-transform:uppercase; font-family:'Space Mono',monospace;
  }
  .hp-search-heading { font-size:20px; font-weight:800; color:var(--ink); letter-spacing:-.04em; margin:0; }
  .hp-search-wrap { position:relative; width:100%; max-width:460px; }
  .hp-search-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:var(--ink4); pointer-events:none; }
  .hp-search {
    width:100%; padding:11px 16px 11px 42px;
    border:1.5px solid var(--border); border-radius:12px;
    font-family:'Outfit',sans-serif; font-size:13.5px; font-weight:500;
    color:var(--ink); background:#fff; outline:none;
    transition:border-color .15s,box-shadow .15s;
  }
  .hp-search::placeholder { color:var(--ink4); }
  .hp-search:focus { border-color:var(--blue); box-shadow:0 0 0 3px rgba(79,99,210,0.1); }

  /* QUICK LINKS */
  .hp-quick-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
  .hp-quick-card {
    background:#fff; border:1.5px solid var(--border); border-radius:14px; padding:18px 18px 16px;
    box-shadow:0 1px 3px rgba(0,0,0,0.04); cursor:pointer; transition:all .18s;
    display:flex; flex-direction:column; gap:10px; animation:fadeUp .45s ease both;
  }
  .hp-quick-card:nth-child(1){animation-delay:.05s}
  .hp-quick-card:nth-child(2){animation-delay:.09s}
  .hp-quick-card:nth-child(3){animation-delay:.13s}
  .hp-quick-card:nth-child(4){animation-delay:.17s}
  .hp-quick-card:hover { border-color:rgba(79,99,210,0.4); box-shadow:0 4px 20px rgba(79,99,210,0.12); transform:translateY(-2px); }
  .hp-quick-icon  { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; }
  .hp-quick-label { font-size:13px; font-weight:700; color:var(--ink); letter-spacing:-.02em; }
  .hp-quick-desc  { font-size:11.5px; color:var(--ink4); line-height:1.5; margin-top:1px; }
  .hp-quick-arrow { margin-top:auto; display:flex; align-items:center; gap:4px; font-size:11px; font-weight:700; color:var(--blue); }

  /* TWO-COL — stretch so both cards match height */
  .hp-cols { display:grid; grid-template-columns:1fr min(360px,36%); gap:18px; align-items:stretch; }

  /* CARD BASE */
  .hp-card {
    background:#fff; border:1px solid var(--border); border-radius:16px;
    box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 16px rgba(0,0,0,0.05);
    overflow:hidden; animation:fadeUp .5s ease both;
    display:flex; flex-direction:column;
  }
  .hp-card-hd {
    padding:18px 22px; flex-shrink:0;
    display:flex; align-items:center; justify-content:space-between;
    border-bottom:1px solid var(--border2);
  }
  .hp-card-title { font-size:15px; font-weight:800; color:var(--ink); letter-spacing:-.03em; }
  .hp-card-sub   { font-size:12px; color:var(--ink4); margin-top:2px; }
  .hp-badge {
    display:inline-flex; align-items:center; padding:4px 10px; border-radius:20px;
    font-size:11px; font-weight:700; font-family:'Space Mono',monospace;
  }

  /* FAQ TOOLBAR */
  .hp-faq-toolbar { padding:12px 22px; border-bottom:1px solid var(--border2); background:var(--surface2); flex-shrink:0; }
  .hp-faq-search-wrap { position:relative; }
  .hp-faq-search-icon { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:var(--ink4); pointer-events:none; }
  .hp-faq-search {
    width:100%; padding:8px 14px 8px 34px; border:1.5px solid var(--border); border-radius:10px;
    font-family:'Outfit',sans-serif; font-size:13px; color:var(--ink); background:#fff; outline:none;
    transition:border-color .15s,box-shadow .15s;
  }
  .hp-faq-search::placeholder { color:var(--ink4); }
  .hp-faq-search:focus { border-color:var(--blue); box-shadow:0 0 0 3px rgba(79,99,210,0.1); }

  /* FAQ ITEMS */
  .hp-faq-list { display:flex; flex-direction:column; flex:1; }
  .hp-faq-item { border-bottom:1px solid var(--border2); }
  .hp-faq-item:last-child { border-bottom:none; }
  .hp-faq-trigger {
    width:100%; display:flex; align-items:center; justify-content:space-between;
    padding:15px 22px; background:none; border:none; cursor:pointer;
    text-align:left; gap:12px; transition:background .12s; font-family:'Outfit',sans-serif;
  }
  .hp-faq-trigger:hover { background:rgba(79,99,210,0.025); }
  .hp-faq-trigger.open  { background:rgba(79,99,210,0.03); }
  .hp-faq-q { font-size:13.5px; font-weight:700; color:var(--ink); letter-spacing:-.02em; line-height:1.4; }
  .hp-faq-q mark { background:rgba(79,99,210,0.15); color:var(--blue); border-radius:3px; padding:0 2px; font-style:normal; }
  .hp-faq-chevron {
    width:22px; height:22px; border-radius:6px; background:var(--surface3); border:1px solid var(--border);
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
    transition:transform .2s,background .15s,border-color .15s;
  }
  .hp-faq-chevron.open { transform:rotate(180deg); background:var(--blue3); border-color:rgba(79,99,210,0.2); }
  .hp-faq-body { padding:0 22px 16px; font-size:13px; color:var(--ink3); line-height:1.75; animation:expand .2s ease both; }
  .hp-faq-tag {
    display:inline-block; margin-bottom:10px; padding:2px 8px; border-radius:6px;
    font-size:9.5px; font-weight:700; color:var(--blue); background:var(--blue3);
    letter-spacing:.06em; text-transform:uppercase; font-family:'Space Mono',monospace;
  }
  .hp-faq-empty { display:flex; flex-direction:column; align-items:center; padding:40px 24px; gap:8px; text-align:center; }
  .hp-faq-empty-msg { font-size:13px; color:var(--ink4); font-weight:500; line-height:1.6; }

  /* CONTACT ITEMS */
  .hp-contact-item {
    display:flex; align-items:flex-start; gap:14px;
    padding:16px 22px; border-bottom:1px solid var(--border2); transition:background .12s;
  }
  .hp-contact-item:last-child { border-bottom:none; }
  .hp-contact-item:hover { background:rgba(79,99,210,0.025); }
  .hp-contact-icon { width:38px; height:38px; border-radius:11px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .hp-contact-label { font-size:13px; font-weight:700; color:var(--ink); letter-spacing:-.02em; }
  .hp-contact-val   { font-size:12px; color:var(--ink4); margin-top:3px; }
  .hp-contact-pill  {
    display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:20px; margin-top:6px;
    font-size:9.5px; font-weight:700; font-family:'Space Mono',monospace; text-transform:uppercase; letter-spacing:.04em;
  }
  /* GUIDE MODAL */
  .hp-overlay {
    position:fixed; inset:0; z-index:1000;
    background:rgba(10,15,30,0.55); backdrop-filter:blur(4px);
    display:flex; align-items:center; justify-content:center; padding:24px;
    animation:fadeUp .18s ease both;
  }
  .hp-modal {
    background:#fff; border-radius:20px; width:100%; max-width:680px;
    max-height:88vh; display:flex; flex-direction:column;
    box-shadow:0 24px 80px rgba(0,0,0,0.28),0 0 0 1px rgba(0,0,0,0.06);
    animation:fadeUp .22s cubic-bezier(.22,.68,0,1.1) both;
  }
  .hp-modal-hd {
    padding:24px 28px 20px; border-bottom:1px solid var(--border2);
    display:flex; align-items:flex-start; justify-content:space-between; gap:16px; flex-shrink:0;
  }
  .hp-modal-icon { width:44px; height:44px; border-radius:13px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .hp-modal-eyebrow { font-size:9.5px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; font-family:'Space Mono',monospace; color:var(--ink4); margin-bottom:4px; }
  .hp-modal-title { font-size:19px; font-weight:800; color:var(--ink); letter-spacing:-.03em; }
  .hp-modal-close {
    width:32px; height:32px; border-radius:9px; border:1.5px solid var(--border);
    background:var(--surface2); color:var(--ink4);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:all .15s; flex-shrink:0;
  }
  .hp-modal-close:hover { background:var(--surface3); color:var(--ink); border-color:var(--border); }
  .hp-modal-body { padding:24px 28px 28px; overflow-y:auto; display:flex; flex-direction:column; gap:20px; }
  .hp-guide-section-title {
    font-size:11px; font-weight:700; color:var(--blue); letter-spacing:.12em;
    text-transform:uppercase; font-family:'Space Mono',monospace;
    margin-bottom:8px;
  }
  .hp-guide-p { font-size:13.5px; color:var(--ink3); line-height:1.75; margin:0; }
  .hp-guide-steps { display:flex; flex-direction:column; gap:10px; }
  .hp-guide-step {
    display:flex; gap:13px; align-items:flex-start;
    padding:13px 16px; background:var(--surface2); border-radius:11px;
    border:1px solid var(--border2);
  }
  .hp-guide-step-num {
    width:24px; height:24px; border-radius:7px; flex-shrink:0;
    background:var(--blue); color:#fff;
    display:flex; align-items:center; justify-content:center;
    font-size:11px; font-weight:800; font-family:'Space Mono',monospace;
  }
  .hp-guide-step-text { font-size:13px; color:var(--ink3); line-height:1.6; padding-top:3px; }
  .hp-guide-step-text strong { color:var(--ink); font-weight:700; }
  .hp-guide-tip {
    padding:13px 16px; background:rgba(79,99,210,0.05);
    border:1px solid rgba(79,99,210,0.14); border-radius:11px;
    font-size:12.5px; color:var(--ink3); line-height:1.6;
  }
  .hp-guide-tip strong { color:var(--blue); }

  /* ── RESPONSIVE ── */
  @media (max-width:900px) {
    .hp-cols { grid-template-columns:1fr; }
    .hp-quick-grid { grid-template-columns:repeat(2,1fr); }
  }
  @media (max-width:640px) {
    .hp-header { padding:16px 16px 0; }
    .hp-body   { padding:14px 16px 24px; gap:14px; }
    .hp-title  { font-size:22px; }
    .hp-search-hero { padding:20px 18px 18px; }
    .hp-search-heading { font-size:17px; }
    .hp-card-hd { padding:14px 16px; }
    .hp-faq-toolbar { padding:10px 16px; }
    .hp-faq-trigger { padding:13px 16px; }
    .hp-faq-body { padding:0 16px 14px; }
    .hp-contact-item { padding:14px 16px; }
    .hp-modal-hd  { padding:18px 20px 14px; }
    .hp-modal-body{ padding:18px 20px 20px; }
    .hp-modal-title { font-size:16px; }
  }
  @media (max-width:480px) {
    .hp-quick-grid { grid-template-columns:1fr 1fr; }
    .hp-quick-card { padding:14px 14px 12px; gap:8px; }
    .hp-quick-desc { display:none; }
    .hp-overlay { padding:12px; align-items:flex-end; }
    .hp-modal { border-radius:16px 16px 0 0; max-height:92vh; }
  }
  @media (max-width:380px) {
    .hp-quick-grid { grid-template-columns:1fr; }
    .hp-search-hero { padding:16px 14px 14px; }
  }
`;

const GUIDE_CONTENT: Record<string, { sections: { title: string; content: React.ReactNode }[] }> = {
  "Journal Guide": {
    sections: [
      {
        title: "What is a Journal Entry?",
        content: <p className="hp-guide-p">Every financial transaction in MIE Prime is recorded as a journal entry using <strong>double-entry bookkeeping</strong> — every entry has at least one debit and one credit, and the two sides always balance. The journal is the chronological record of all your transactions before they're posted to individual account ledgers.</p>,
      },
      {
        title: "How to Create a Journal Entry",
        content: (
          <div className="hp-guide-steps">
            {[
              { n:"1", t:<><strong>Click "New Transaction"</strong> in the sidebar to open the transaction wizard.</> },
              { n:"2", t:<><strong>Select the debit account</strong> — the account that receives value (e.g. Cash, Equipment).</> },
              { n:"3", t:<><strong>Select the credit account</strong> — the account that gives value (e.g. Revenue, Loans Payable).</> },
              { n:"4", t:<><strong>Enter the amount, date, and description</strong> — be specific so your audit trail is clear.</> },
              { n:"5", t:<><strong>Submit</strong> — the entry instantly appears in your Journal, Ledger, and Trial Balance.</> },
            ].map(s => (
              <div className="hp-guide-step" key={s.n}>
                <span className="hp-guide-step-num">{s.n}</span>
                <span className="hp-guide-step-text">{s.t}</span>
              </div>
            ))}
          </div>
        ),
      },
      {
        title: "Common Account Pairings",
        content: (
          <div className="hp-guide-steps">
            {[
              { n:"→", t:<><strong>Cash sale:</strong> Debit Cash · Credit Sales Revenue</> },
              { n:"→", t:<><strong>Purchase on credit:</strong> Debit Supplies/Equipment · Credit Accounts Payable</> },
              { n:"→", t:<><strong>Owner investment:</strong> Debit Cash · Credit Owner's Equity/Capital</> },
              { n:"→", t:<><strong>Pay an expense:</strong> Debit Expense Account · Credit Cash</> },
            ].map((s, i) => (
              <div className="hp-guide-step" key={i}>
                <span className="hp-guide-step-num" style={{background:"var(--blue3)",color:"var(--blue)"}}>{s.n}</span>
                <span className="hp-guide-step-text">{s.t}</span>
              </div>
            ))}
          </div>
        ),
      },
      {
        title: "💡 Pro Tip",
        content: <div className="hp-guide-tip"><strong>Tip:</strong> Transactions cannot be deleted after posting — this protects your audit trail. To correct a mistake, create a reversing entry with the same accounts and amount, then record the correct entry.</div>,
      },
    ],
  },
  "Reports Explainer": {
    sections: [
      {
        title: "Your Four Financial Statements",
        content: <p className="hp-guide-p">MIE Prime generates four standard financial statements required for any business. Together they give a complete picture of your financial health — profitability, position, equity changes, and cash movement.</p>,
      },
      {
        title: "Income Statement",
        content: (
          <div className="hp-guide-steps">
            {[
              { n:"₱", t:<><strong>What it shows:</strong> Revenue earned minus expenses incurred over a period — your net income or net loss.</> },
              { n:"→", t:<><strong>Formula:</strong> Net Income = Total Revenue − Total Expenses</> },
              { n:"→", t:<><strong>Use it to:</strong> See if your business is profitable and which expenses are eating into margins.</> },
            ].map((s, i) => (
              <div className="hp-guide-step" key={i}>
                <span className="hp-guide-step-num" style={{background:"rgba(5,150,105,.12)",color:"#065f46"}}>{s.n}</span>
                <span className="hp-guide-step-text">{s.t}</span>
              </div>
            ))}
          </div>
        ),
      },
      {
        title: "Balance Sheet",
        content: (
          <div className="hp-guide-steps">
            {[
              { n:"=", t:<><strong>What it shows:</strong> A snapshot of what you own (assets), what you owe (liabilities), and owner's equity at a specific date.</> },
              { n:"→", t:<><strong>Formula:</strong> Assets = Liabilities + Equity (must always balance)</> },
              { n:"→", t:<><strong>Use it to:</strong> Assess your net worth and ability to meet obligations.</> },
            ].map((s, i) => (
              <div className="hp-guide-step" key={i}>
                <span className="hp-guide-step-num" style={{background:"rgba(79,99,210,.1)",color:"var(--blue)"}}>{s.n}</span>
                <span className="hp-guide-step-text">{s.t}</span>
              </div>
            ))}
          </div>
        ),
      },
      {
        title: "Owner's Equity & Cash Flow",
        content: <p className="hp-guide-p">The <strong>Statement of Owner's Equity</strong> tracks changes in capital — investments added, net income earned, and withdrawals taken. The <strong>Statement of Cash Flow</strong> shows where cash actually came from and went (operating, investing, and financing activities) — separate from paper profit.</p>,
      },
      {
        title: "💡 Pro Tip",
        content: <div className="hp-guide-tip"><strong>Tip:</strong> Use the <strong>Print</strong> button on each report to generate a clean PDF with a reference number, suitable for sharing with your accountant or submitting to the BIR.</div>,
      },
    ],
  },
  "Reconciliation": {
    sections: [
      {
        title: "What is Reconciliation?",
        content: <p className="hp-guide-p">Reconciliation is the process of matching your MIE Prime records against an external statement (bank statement, GCash history, cash register) to confirm they agree. Differences reveal missing entries, duplicate records, or bank errors.</p>,
      },
      {
        title: "Step-by-Step Reconciliation",
        content: (
          <div className="hp-guide-steps">
            {[
              { n:"1", t:<><strong>Download your bank or GCash statement</strong> for the period you want to reconcile.</> },
              { n:"2", t:<><strong>Go to Ledger in MIE Prime</strong> and open the account you're reconciling (e.g. Cash).</> },
              { n:"3", t:<><strong>Compare each line item</strong> — check off transactions that appear in both your ledger and the statement.</> },
              { n:"4", t:<><strong>Identify differences</strong> — outstanding checks, deposits in transit, bank fees not yet recorded.</> },
              { n:"5", t:<><strong>Record missing entries</strong> — add any transactions that appear on the bank statement but not in MIE Prime.</> },
              { n:"6", t:<><strong>Confirm balances match</strong> — your adjusted ledger balance should equal the statement ending balance.</> },
            ].map(s => (
              <div className="hp-guide-step" key={s.n}>
                <span className="hp-guide-step-num">{s.n}</span>
                <span className="hp-guide-step-text">{s.t}</span>
              </div>
            ))}
          </div>
        ),
      },
      {
        title: "Common Reconciling Items",
        content: (
          <div className="hp-guide-steps">
            {[
              { n:"!", t:<><strong>Outstanding checks:</strong> Issued in MIE Prime but not yet cleared the bank</> },
              { n:"!", t:<><strong>Deposits in transit:</strong> Recorded in MIE Prime but not yet posted by the bank</> },
              { n:"!", t:<><strong>Bank charges:</strong> Fees deducted by the bank not yet entered in MIE Prime</> },
              { n:"!", t:<><strong>Interest earned:</strong> Credited by the bank but not yet recorded</> },
            ].map((s, i) => (
              <div className="hp-guide-step" key={i}>
                <span className="hp-guide-step-num" style={{background:"rgba(217,119,6,.1)",color:"#92400e"}}>{s.n}</span>
                <span className="hp-guide-step-text">{s.t}</span>
              </div>
            ))}
          </div>
        ),
      },
      {
        title: "💡 Pro Tip",
        content: <div className="hp-guide-tip"><strong>Tip:</strong> Reconcile monthly — it's much easier to catch errors when they're fresh. A 3-month backlog of unreconciled transactions can take hours to untangle.</div>,
      },
    ],
  },
  "Data & Security": {
    sections: [
      {
        title: "How Your Data is Stored",
        content: <p className="hp-guide-p">MIE Prime stores all your financial data in a <strong>PostgreSQL database hosted on Supabase</strong> — a SOC 2 Type II certified platform with encryption at rest and in transit. Your data is never shared with third parties or used for advertising.</p>,
      },
      {
        title: "Authentication & Access",
        content: (
          <div className="hp-guide-steps">
            {[
              { n:"🔐", t:<><strong>Supabase Auth</strong> handles all sign-in. Passwords are hashed with bcrypt and never stored in plain text.</> },
              { n:"🔐", t:<><strong>Session tokens</strong> are stored in secure, httpOnly cookies — not localStorage — protecting against XSS attacks.</> },
              { n:"🔐", t:<><strong>All data is scoped to your user ID</strong> — no other user can access your accounts, transactions, or reports.</> },
            ].map((s, i) => (
              <div className="hp-guide-step" key={i}>
                <span className="hp-guide-step-num" style={{background:"rgba(124,58,237,.1)",color:"#6d28d9",fontSize:14}}>{s.n}</span>
                <span className="hp-guide-step-text">{s.t}</span>
              </div>
            ))}
          </div>
        ),
      },
      {
        title: "Backups & Data Retention",
        content: <p className="hp-guide-p">Supabase performs <strong>daily automated backups</strong> of all project data. Your financial records are retained for the life of your account. If you delete your account, all data is permanently removed within 30 days in accordance with data privacy regulations.</p>,
      },
      {
        title: "What You Can Do to Stay Safe",
        content: (
          <div className="hp-guide-steps">
            {[
              { n:"✓", t:<><strong>Use a strong, unique password</strong> — change it regularly in Account Settings.</> },
              { n:"✓", t:<><strong>Sign out after each session</strong> on shared or public computers.</> },
              { n:"✓", t:<><strong>Never share your login credentials</strong> — each team member should have their own account.</> },
            ].map((s, i) => (
              <div className="hp-guide-step" key={i}>
                <span className="hp-guide-step-num" style={{background:"rgba(21,128,61,.1)",color:"#15803d"}}>{s.n}</span>
                <span className="hp-guide-step-text">{s.t}</span>
              </div>
            ))}
          </div>
        ),
      },
      {
        title: "💡 Pro Tip",
        content: <div className="hp-guide-tip"><strong>Tip:</strong> Your company logo is stored as a base64 data URL in the database. Avoid uploading logos larger than 500 KB to keep page load times fast.</div>,
      },
    ],
  },
};

const FAQS = [
  { category:"Accounting",   question:"What is double-entry bookkeeping?",                answer:"Double-entry bookkeeping is a system where every financial transaction is recorded in at least two accounts — one debit and one credit. The total debits always equal total credits, keeping your books balanced. For example, when you receive cash from a client, you debit Cash and credit Accounts Receivable." },
  { category:"Transactions", question:"How do I create a new transaction?",               answer:"Click the 'New Transaction' button in the sidebar. You'll be guided through a 4-step wizard: choose the transaction type, select the accounts involved, enter the amount and date, and add an optional description. Once submitted, the transaction is immediately reflected across your Journal, Ledger, and Trial Balance." },
  { category:"Reports",      question:"What is a trial balance?",                          answer:"A trial balance is a report that lists every account in your chart of accounts along with its current debit or credit balance. Its primary purpose is to verify that total debits equal total credits — a prerequisite before generating financial statements like an income statement or balance sheet." },
  { category:"Accounting",   question:"What is the difference between a debit and a credit?", answer:"In double-entry accounting, debits increase asset and expense accounts while decreasing liability, equity, and revenue accounts. Credits do the opposite. The mnemonic DEAD CLIC (Debit: Expenses, Assets, Drawings; Credit: Liabilities, Income, Capital) can help you remember which direction each account moves." },
  { category:"Reports",      question:"How do I generate a financial report?",             answer:"Navigate to the Reports section in the sidebar. Select the report type (Income Statement, Balance Sheet, or Cash Flow), set the date range, and click Generate. Reports can be exported as PDF or CSV for sharing with stakeholders or your accountant." },
  { category:"Transactions", question:"Can I edit or delete a posted transaction?",        answer:"Posted transactions cannot be deleted — this preserves your audit trail. However, you can reverse a transaction by creating a counter-entry. Navigate to the transaction in the Journal, click the three-dot menu, and select 'Reverse Entry'. This keeps your books accurate while maintaining a complete history." },
];

const QUICK_LINKS = [
  { icon:<FileText size={17} color="#4F63D2"/>,   bg:"rgba(79,99,210,0.08)",  label:"Journal Guide",     desc:"Learn how journal entries work" },
  { icon:<BarChart2 size={17} color="#15803d"/>,  bg:"rgba(21,128,61,0.08)",  label:"Reports Explainer", desc:"Understand your financial reports" },
  { icon:<RefreshCw size={17} color="#d97706"/>,  bg:"rgba(217,119,6,0.08)",  label:"Reconciliation",    desc:"Match transactions to statements" },
  { icon:<ShieldCheck size={17} color="#7c3aed"/>,bg:"rgba(124,58,237,0.08)", label:"Data & Security",   desc:"How your data is kept safe" },
];

function highlight(text: string, q: string) {
  if (!q) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return <>{text.slice(0, idx)}<mark>{text.slice(idx, idx + q.length)}</mark>{text.slice(idx + q.length)}</>;
}

export default function Help() {
  const [open, setOpen] = useState<number | null>(null);
  const [faqQ, setFaqQ] = useState("");
  const [activeGuide, setActiveGuide] = useState<string | null>(null);

  const filtered = FAQS.filter(f =>
    !faqQ ||
    f.question.toLowerCase().includes(faqQ.toLowerCase()) ||
    f.answer.toLowerCase().includes(faqQ.toLowerCase()) ||
    f.category.toLowerCase().includes(faqQ.toLowerCase())
  );

  const handleSearch = (v: string) => { setFaqQ(v); setOpen(null); };

  return (
    <div className="hp">
      <style>{css}</style>

      {/* HEADER */}
      <div className="hp-header">
        <div className="hp-live-pill"><span className="hp-live-dot"/>SUPPORT CENTER</div>
        <h1 className="hp-title">Help & Support</h1>
        <p className="hp-sub">Frequently asked questions and support resources</p>
      </div>

      <div className="hp-body">

        {/* SEARCH HERO */}
        <div className="hp-search-hero">
          <div>
            <div className="hp-search-eyebrow">How can we help?</div>
            <h2 className="hp-search-heading">Search the knowledge base</h2>
          </div>
          <div className="hp-search-wrap">
            <Search size={16} className="hp-search-icon"/>
            <input
              className="hp-search"
              placeholder="e.g. how to create a transaction, what is a ledger…"
              value={faqQ}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
        </div>

        {/* QUICK LINKS */}
        <div className="hp-quick-grid">
          {QUICK_LINKS.map((q, i) => (
            <div className="hp-quick-card" key={i} onClick={() => setActiveGuide(q.label)}>
              <div className="hp-quick-icon" style={{background:q.bg}}>{q.icon}</div>
              <div>
                <div className="hp-quick-label">{q.label}</div>
                <div className="hp-quick-desc">{q.desc}</div>
              </div>
              <div className="hp-quick-arrow">Read guide <ArrowRight size={11}/></div>
            </div>
          ))}
        </div>

        {/* TWO COLUMNS */}
        <div className="hp-cols">

          {/* LEFT — FAQ */}
          <div className="hp-card" style={{animationDelay:".15s"}}>
            <div className="hp-card-hd">
              <div>
                <div className="hp-card-title">Frequently Asked Questions</div>
                <div className="hp-card-sub">Common questions about MIE Prime Accounting</div>
              </div>
              <span className="hp-badge" style={{background:"rgba(79,99,210,0.08)",color:"#4F63D2"}}>
                {filtered.length} {filtered.length===1?"result":"results"}
              </span>
            </div>

            <div className="hp-faq-toolbar">
              <div className="hp-faq-search-wrap">
                <Search size={13} className="hp-faq-search-icon"/>
                <input
                  className="hp-faq-search"
                  placeholder="Filter questions…"
                  value={faqQ}
                  onChange={e => handleSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="hp-faq-list">
              {filtered.length === 0 ? (
                <div className="hp-faq-empty">
                  <HelpCircle size={28} color="#9CA3AF"/>
                  <p className="hp-faq-empty-msg">No questions match "{faqQ}".<br/>Try a different search term.</p>
                </div>
              ) : filtered.map((faq, i) => {
                const isOpen = open === i;
                return (
                  <div className="hp-faq-item" key={i}>
                    <button
                      className={`hp-faq-trigger${isOpen?" open":""}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                    >
                      <span className="hp-faq-q">{highlight(faq.question, faqQ)}</span>
                      <span className={`hp-faq-chevron${isOpen?" open":""}`}>
                        <ChevronDown size={13} color={isOpen?"#4F63D2":"#9CA3AF"}/>
                      </span>
                    </button>
                    {isOpen && (
                      <div className="hp-faq-body">
                        <span className="hp-faq-tag">{faq.category}</span><br/>
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT — Contact Support, same height as FAQ */}
          <div className="hp-card" style={{animationDelay:".2s"}}>
            <div className="hp-card-hd">
              <div>
                <div className="hp-card-title">Contact Support</div>
                <div className="hp-card-sub">Get in touch with our team</div>
              </div>
            </div>

            <div className="hp-contact-item">
              <div className="hp-contact-icon" style={{background:"rgba(79,99,210,0.08)"}}>
                <Mail size={16} color="#4F63D2"/>
              </div>
              <div>
                <div className="hp-contact-label">Email Support</div>
                <div className="hp-contact-val">support@mieprime.com</div>
                <span className="hp-contact-pill online"><span className="hp-pill-dot"/>Responds in &lt;24h</span>
              </div>
            </div>

            <div className="hp-contact-item">
              <div className="hp-contact-icon" style={{background:"rgba(217,119,6,0.08)"}}>
                <MessageCircle size={16} color="#d97706"/>
              </div>
              <div>
                <div className="hp-contact-label">Live Chat</div>
                <div className="hp-contact-val">In-app chat support</div>
                <span className="hp-contact-pill soon"><span className="hp-pill-dot"/>Coming soon</span>
              </div>
            </div>

            <div className="hp-contact-item">
              <div className="hp-contact-icon" style={{background:"rgba(21,128,61,0.08)"}}>
                <BookOpen size={16} color="#15803d"/>
              </div>
              <div>
                <div className="hp-contact-label">Documentation</div>
                <div className="hp-contact-val">Full user manual &amp; guides</div>
                <span className="hp-contact-pill online"><span className="hp-pill-dot"/>Available now</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* GUIDE MODAL */}
      {activeGuide && (() => {
        const guide = GUIDE_CONTENT[activeGuide];
        const link  = QUICK_LINKS.find(q => q.label === activeGuide)!;
        return (
          <div className="hp-overlay" onClick={() => setActiveGuide(null)}>
            <div className="hp-modal" onClick={e => e.stopPropagation()}>
              <div className="hp-modal-hd">
                <div style={{display:"flex", gap:14, alignItems:"flex-start"}}>
                  <div className="hp-modal-icon" style={{background:link.bg}}>{link.icon}</div>
                  <div>
                    <div className="hp-modal-eyebrow">Guide</div>
                    <div className="hp-modal-title">{activeGuide}</div>
                  </div>
                </div>
                <button className="hp-modal-close" onClick={() => setActiveGuide(null)}>
                  <X size={14}/>
                </button>
              </div>
              <div className="hp-modal-body">
                {guide.sections.map((sec, i) => (
                  <div key={i}>
                    <div className="hp-guide-section-title">{sec.title}</div>
                    {sec.content}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
