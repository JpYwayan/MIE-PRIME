import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useMemo, useState } from "react";
import {
  TrendingUp, TrendingDown, CheckCircle2, XCircle,
  Plus, Search, ChevronUp, ChevronDown,
  Layers, RefreshCw, ChevronRight, ChevronLeft,
  ArrowUpRight, ArrowDownLeft, BookOpen,
} from "lucide-react";

/* ─── colour maps (identical to Journal) ──────────────────────────── */
const TYPE_META: Record<string, { bg: string; text: string; dot: string; bar: string }> = {
  ASSET:     { bg: "rgba(59,130,246,0.10)",  text: "#1d4ed8", dot: "#3b82f6", bar: "#3b82f6" },
  LIABILITY: { bg: "rgba(236,72,153,0.10)",  text: "#be185d", dot: "#ec4899", bar: "#ec4899" },
  EQUITY:    { bg: "rgba(139,92,246,0.10)",  text: "#6d28d9", dot: "#8b5cf6", bar: "#8b5cf6" },
  REVENUE:   { bg: "rgba(16,185,129,0.10)",  text: "#065f46", dot: "#10b981", bar: "#10b981" },
  EXPENSE:   { bg: "rgba(239,68,68,0.10)",   text: "#991b1b", dot: "#ef4444", bar: "#ef4444" },
};

const TIP = {
  background: "#fff", border: "1px solid rgba(79,99,210,0.12)",
  borderRadius: 10, fontSize: 11,
  fontFamily: "'Space Mono', monospace",
  color: "#1E2340", padding: "8px 12px",
  boxShadow: "0 4px 16px rgba(79,99,210,0.10)",
};

/* ─── CSS ─────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
  @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:.45; } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes shimmer { to { background-position:-200% 0; } }

  .lg {
    font-family: 'Outfit', sans-serif;
    --blue:#4F63D2; --blue2:#6B7FE3;
    --green:#15803d; --red:#dc2626;
    --purple:#7c3aed; --amber:#F59E0B;
    --ink:#111827; --ink2:#1f2937; --ink3:#4B5563; --ink4:#9CA3AF;
    --surface:#ffffff; --surface2:#F9FAFB;
    --border:rgba(17,24,39,0.09); --border2:rgba(17,24,39,0.05);
    /* Fill exactly the viewport the DashboardLayout gives us */
    height:100vh; overflow:hidden;
    display:flex; flex-direction:column;
    background:transparent; color:var(--ink);
  }

  /* ── STICKY TOP ZONE (header + KPIs) — never scrolls ── */
  .lg-top-zone { flex-shrink:0; }

  /* ── SCROLL ZONE — everything below KPIs scrolls here ── */
  .lg-scroll-zone {
    flex:1; overflow-y:auto; overflow-x:hidden;
    /* Custom scrollbar */
    scrollbar-width:thin; scrollbar-color:rgba(79,99,210,0.25) transparent;
  }
  .lg-scroll-zone::-webkit-scrollbar { width:5px; }
  .lg-scroll-zone::-webkit-scrollbar-track { background:transparent; }
  .lg-scroll-zone::-webkit-scrollbar-thumb { background:rgba(79,99,210,0.22); border-radius:5px; }
  .lg-scroll-zone::-webkit-scrollbar-thumb:hover { background:rgba(79,99,210,0.40); }

  /* ── HEADER ── */
  .lg-header { display:flex; align-items:flex-start; justify-content:space-between; padding:24px 28px 0; }
  .lg-live-pill {
    display:inline-flex; align-items:center; gap:6px;
    padding:3px 10px; background:rgba(255,255,255,0.35);
    border:1px solid rgba(255,255,255,0.5); border-radius:20px;
    font-size:9px; font-weight:700; color:#fff;
    font-family:'Space Mono',monospace; letter-spacing:.12em;
    text-transform:uppercase; margin-bottom:6px; width:fit-content;
  }
  .lg-live-dot { width:5px; height:5px; background:#4ade80; border-radius:50%; animation:pulse 2s ease infinite; }
  .lg-title { font-size:27px; font-weight:800; color:#fff; letter-spacing:-.04em; margin:0 0 2px; }
  .lg-sub   { font-size:12px; color:rgba(255,255,255,.65); margin:0; font-weight:300; }
  .lg-header-actions { display:flex; gap:8px; align-items:center; }
  .lg-btn-ghost {
    display:inline-flex; align-items:center; gap:6px;
    padding:8px 14px; background:rgba(255,255,255,.15);
    border:1px solid rgba(255,255,255,.3); border-radius:9px;
    font-size:12px; font-weight:600; color:#fff;
    cursor:pointer; transition:all .15s; font-family:'Outfit',sans-serif;
  }
  .lg-btn-ghost:hover { background:rgba(255,255,255,.25); }
  .lg-btn-primary {
    display:inline-flex; align-items:center; gap:6px;
    padding:8px 16px; background:#fff; border:none; border-radius:9px;
    font-size:12px; font-weight:700; color:var(--blue);
    cursor:pointer; transition:all .15s; font-family:'Outfit',sans-serif;
    box-shadow:0 2px 12px rgba(0,0,0,.15);
  }
  .lg-btn-primary:hover { transform:translateY(-1px); box-shadow:0 4px 18px rgba(0,0,0,.2); }

  /* ── KPI ── */
  .lg-kpi-row { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; padding:20px 28px 0; }
  .lg-kpi {
    background:#fff; border:1px solid var(--border);
    border-radius:16px; padding:20px 20px 16px;
    box-shadow:0 1px 4px rgba(0,0,0,0.05), 0 4px 18px rgba(0,0,0,0.07);
    animation:fadeUp .4s ease both; position:relative; overflow:hidden;
  }
  .lg-kpi-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
  .lg-kpi-label { font-size:10.5px; font-weight:700; color:var(--ink3); letter-spacing:.09em; text-transform:uppercase; }
  .lg-kpi-icon { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; }
  .lg-kpi-val { font-family:'Space Mono',monospace; font-size:22px; font-weight:700; letter-spacing:-.03em; margin-bottom:5px; line-height:1; }
  .lg-kpi-meta { font-size:12px; color:var(--ink4); font-weight:400; }
  .lg-kpi-bar { position:absolute; bottom:0; left:0; right:0; height:3.5px; }

  /* ── BODY ── */
  .lg-body { padding:20px 28px 28px; display:flex; flex-direction:column; gap:16px; }

  /* ── CARDS ── */
  .lg-card {
    background:#fff; border:1px solid var(--border);
    border-radius:16px;
    box-shadow:0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05);
    overflow:hidden; animation:fadeUp .5s ease both;
  }
  /* The main ledger card gets a fixed max-height so accounts scroll inside */
  .lg-card-main {
    display:flex; flex-direction:column;
    /* Account for header + KPIs + body padding + card header + toolbar */
    max-height:calc(100vh - 280px);
  }
  .lg-card-main .lg-table-wrap {
    flex:1; overflow-y:auto; overflow-x:auto;
    scrollbar-width:thin; scrollbar-color:rgba(79,99,210,0.20) transparent;
  }
  .lg-card-main .lg-table-wrap::-webkit-scrollbar { width:4px; }
  .lg-card-main .lg-table-wrap::-webkit-scrollbar-track { background:transparent; }
  .lg-card-main .lg-table-wrap::-webkit-scrollbar-thumb { background:rgba(79,99,210,0.20); border-radius:4px; }
  /* Sticky thead inside scrollable card */
  .lg-card-main .lg-table thead { position:sticky; top:0; z-index:2; }
  /* Sticky account group header rows */
  .lg-acct-header { position:sticky; top:0; z-index:1; background:#fff; }
  .lg-card-hd {
    padding:20px 22px 0;
    display:flex; align-items:flex-start; justify-content:space-between;
    margin-bottom:14px;
  }
  .lg-card-title { font-size:15px; font-weight:800; color:var(--ink); letter-spacing:-.03em; }
  .lg-card-sub   { font-size:12px; color:var(--ink4); margin-top:3px; font-weight:400; }

  .lg-badge {
    font-size:9px; font-weight:700; padding:3px 8px; border-radius:20px;
    font-family:'Space Mono',monospace; letter-spacing:.06em; text-transform:uppercase;
    white-space:nowrap; flex-shrink:0;
  }

  /* ── TOOLBAR ── */
  .lg-toolbar { display:flex; align-items:center; gap:8px; padding:0 22px 16px; flex-wrap:wrap; }
  .lg-search-wrap { position:relative; flex:1; min-width:160px; max-width:260px; }
  .lg-search-icon { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--ink4); line-height:0; }
  .lg-search {
    width:100%; padding:8px 12px 8px 32px;
    background:var(--surface2); border:1.5px solid var(--border);
    border-radius:9px; font-size:12.5px; font-family:'Outfit',sans-serif;
    color:var(--ink); outline:none; transition:all .15s;
  }
  .lg-search::placeholder { color:var(--ink4); }
  .lg-search:focus { border-color:var(--blue); background:#fff; box-shadow:0 0 0 3px rgba(79,99,210,0.10); }

  .lg-filter-btn {
    display:inline-flex; align-items:center; gap:5px;
    padding:7px 13px; border:1.5px solid; border-radius:9px;
    font-size:11.5px; font-weight:700;
    cursor:pointer; transition:all .15s; font-family:'Outfit',sans-serif;
    white-space:nowrap;
  }
  .lg-filter-btn:hover { filter:brightness(0.95); }
  .lg-filter-btn.active { color:#fff !important; border-color:var(--blue) !important; background:var(--blue) !important; }

  /* Account selector */
  .lg-acct-select {
    padding:7px 12px;
    background:rgba(79,99,210,0.05); border:1px solid rgba(79,99,210,0.12);
    border-radius:8px; font-size:12px; font-family:'Outfit',sans-serif;
    color:var(--ink); outline:none; cursor:pointer; transition:all .15s;
    max-width:220px;
  }
  .lg-acct-select:focus { border-color:rgba(79,99,210,0.35); box-shadow:0 0 0 3px rgba(79,99,210,0.07); }

  /* ── ACCOUNT GROUP HEADER ── */
  .lg-acct-group { margin-bottom:18px; }
  .lg-acct-group:last-child { margin-bottom:0; }

  .lg-acct-header {
    display:flex; align-items:center; justify-content:space-between;
    padding:16px 22px; cursor:pointer;
    transition:background .15s; border-top:1px solid var(--border2);
  }
  .lg-acct-header:hover { background:rgba(79,99,210,0.03); }
  .lg-acct-header-left { display:flex; align-items:center; gap:12px; }
  .lg-acct-header-icon {
    width:38px; height:38px; border-radius:11px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
  }
  .lg-acct-name { font-size:14px; font-weight:800; color:var(--ink); letter-spacing:-.03em; }
  .lg-acct-meta-row { display:flex; align-items:center; gap:8px; margin-top:3px; }
  .lg-acct-code { font-size:10px; color:var(--ink4); font-family:'Space Mono',monospace; }
  .lg-acct-header-right { display:flex; align-items:center; gap:28px; }
  .lg-acct-stat { text-align:right; min-width:90px; }
  .lg-acct-stat-lbl { font-size:9px; font-weight:700; color:var(--ink4); text-transform:uppercase; letter-spacing:.12em; margin-bottom:3px; font-family:'Space Mono',monospace; }
  .lg-acct-stat-val { font-family:'Space Mono',monospace; font-size:13.5px; font-weight:700; }
  .lg-acct-chevron { color:var(--ink4); transition:transform .20s; flex-shrink:0; }
  .lg-acct-chevron.open { transform:rotate(90deg); }

  /* ── LEDGER TABLE ── */
  .lg-table-wrap { overflow-x:auto; }
  .lg-table { width:100%; border-collapse:collapse; font-size:12.5px; }
  .lg-table thead tr { background:var(--surface2); border-top:1px solid var(--border); border-bottom:2px solid var(--border); }
  .lg-table th {
    padding:11px 18px; text-align:left;
    font-size:10.5px; font-weight:700; color:var(--ink3);
    letter-spacing:.08em; text-transform:uppercase; white-space:nowrap;
    cursor:pointer; user-select:none; transition:color .12s;
  }
  .lg-table th:hover { color:var(--blue); }
  .lg-table th.right { text-align:right; }
  .lg-table td { padding:14px 18px; border-bottom:1px solid var(--border2); vertical-align:middle; }
  .lg-table tbody tr:last-child td { border-bottom:none; }
  .lg-table tbody tr { transition:background .12s; }
  .lg-table tbody tr:nth-child(even) { background:rgba(249,250,251,0.8); }
  .lg-table tbody tr:hover { background:rgba(79,99,210,0.04) !important; }
  .lg-table td.right { text-align:right; font-family:'Space Mono',monospace; }

  /* Running balance tfoot */
  .lg-table tfoot tr { border-top:2px solid var(--border); background:rgba(79,99,210,0.04); }
  .lg-table tfoot td { padding:13px 18px; font-weight:700; font-size:13px; color:var(--ink); }
  .lg-table tfoot td.right { text-align:right; font-family:'Space Mono',monospace; }

  /* Cell types — higher contrast, better sizing */
  .lg-date  { font-size:11.5px; color:var(--ink3); white-space:nowrap; font-family:'Space Mono',monospace; }
  .lg-ref   { font-size:11px; color:var(--ink4); font-family:'Space Mono',monospace; background:var(--surface2); padding:2px 7px; border-radius:5px; border:1px solid var(--border2); display:inline-block; }
  .lg-desc  { font-size:13px; font-weight:600; color:var(--ink); max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; display:block; }
  .lg-desc-sub { font-size:10px; color:var(--ink4); margin-top:2px; }

  .lg-dr      { font-family:'Space Mono',monospace; font-size:13px; font-weight:700; color:#1d4ed8; }
  .lg-cr      { font-family:'Space Mono',monospace; font-size:13px; font-weight:700; color:#6d28d9; }
  .lg-bal-pos { font-family:'Space Mono',monospace; font-size:13px; font-weight:700; color:#15803d; }
  .lg-bal-neg { font-family:'Space Mono',monospace; font-size:13px; font-weight:700; color:#dc2626; }
  .lg-bal-zero{ font-family:'Space Mono',monospace; font-size:13px; font-weight:700; color:var(--ink4); }

  /* Dr/Cr pill — solid tinted fill */
  .lg-entry-pill {
    display:inline-flex; align-items:center; gap:4px;
    padding:3px 9px; border-radius:20px; font-size:10px; font-weight:700;
    font-family:'Space Mono',monospace; letter-spacing:.04em; white-space:nowrap;
  }
  .lg-entry-pill.dr { background:#dbeafe; color:#1d4ed8; }
  .lg-entry-pill.cr { background:#ede9fe; color:#6d28d9; }

  .lg-acct-badge {
    display:inline-flex; align-items:center; gap:5px;
    padding:3px 8px; border-radius:20px;
    font-size:10px; font-weight:700; white-space:nowrap;
    font-family:'Space Mono',monospace; letter-spacing:.03em;
  }
  .lg-acct-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }

  /* SORT ICON */
  .lg-sort { display:inline-flex; flex-direction:column; margin-left:4px; opacity:.4; }
  .lg-sort.asc .lg-sort-up, .lg-sort.desc .lg-sort-dn { opacity:1; color:var(--blue); }

  /* DIVIDER */
  .lg-divider { height:1px; background:var(--border); margin:0 22px; }

  /* SHIMMER */
  .lg-shimmer { height:18px; border-radius:5px; background:linear-gradient(90deg,#ececec 25%,#f5f5f5 50%,#ececec 75%); background-size:200% 100%; animation:shimmer 1.2s infinite; }

  /* EMPTY */
  .lg-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:48px 20px; gap:10px; }
  .lg-empty p { font-size:12px; color:var(--ink4); margin:0; }

  /* SPINNER */
  .lg-spinner { width:18px; height:18px; border-radius:50%; border:2px solid #E5E7EB; border-top-color:var(--blue); animation:spin .7s linear infinite; }
  .lg-spinner-wrap { display:flex; justify-content:center; padding:32px; }

  /* PAGINATION */
  .lg-pagination {
    display:flex; align-items:center; justify-content:space-between;
    padding:12px 20px; border-top:1px solid var(--border);
    flex-shrink:0; background:#fff; position:sticky; bottom:0; z-index:2;
  }
  .lg-pagination-info { font-size:11px; color:var(--ink3); font-family:'Space Mono',monospace; }
  .lg-pagination-btns { display:flex; gap:4px; align-items:center; }
  .lg-pg-btn {
    padding:5px 12px; border-radius:7px; border:1px solid rgba(79,99,210,0.2);
    background:rgba(79,99,210,0.06); color:var(--blue);
    font-size:11px; font-weight:600; cursor:pointer; font-family:'Outfit',sans-serif;
    transition:all .12s;
  }
  .lg-pg-btn:disabled { background:transparent; color:var(--ink4); cursor:default; }
  .lg-pg-btn.active { background:var(--blue); color:#fff; border-color:var(--blue); }
  .lg-pg-btn:not(:disabled):not(.active):hover { background:rgba(79,99,210,0.12); }

  /* ACCOUNT SUMMARY GRID */
  .lg-acct-grid {
    display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr));
    gap:10px; padding:0 22px 20px;
    max-height:220px; overflow-y:auto;
    scrollbar-width:thin; scrollbar-color:rgba(79,99,210,0.20) transparent;
  }
  .lg-acct-grid::-webkit-scrollbar { width:4px; }
  .lg-acct-grid::-webkit-scrollbar-track { background:transparent; }
  .lg-acct-grid::-webkit-scrollbar-thumb { background:rgba(79,99,210,0.20); border-radius:4px; }
  .lg-acct-mini {
    background:var(--surface2); border:1.5px solid var(--border);
    border-radius:12px; padding:14px 16px; cursor:pointer; transition:all .18s;
  }
  .lg-acct-mini:hover { border-color:rgba(79,99,210,0.35); background:#fff; box-shadow:0 4px 14px rgba(79,99,210,0.10); transform:translateY(-2px); }
  .lg-acct-mini.selected { border-color:var(--blue); background:rgba(79,99,210,0.06); box-shadow:0 0 0 3px rgba(79,99,210,0.12); }
  .lg-acct-mini-header { display:flex; align-items:center; gap:7px; margin-bottom:5px; }
  .lg-acct-mini-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .lg-acct-mini-name { font-size:13px; font-weight:700; color:var(--ink); letter-spacing:-.02em; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .lg-acct-mini-type { font-size:9.5px; font-weight:700; color:var(--ink4); text-transform:uppercase; letter-spacing:.12em; margin-bottom:10px; font-family:'Space Mono',monospace; }
  .lg-acct-mini-bal  { font-family:'Space Mono',monospace; font-size:14px; font-weight:700; line-height:1; }
  .lg-acct-mini-suffix { font-size:9px; font-weight:400; color:var(--ink4); margin-left:4px; }

  @media (max-width:1100px) { .lg-kpi-row { grid-template-columns:repeat(2,1fr); } }
  @media (max-width:640px) {
    .lg-header { padding:16px 16px 0; flex-direction:column; gap:12px; }
    .lg-kpi-row { padding:16px 16px 0; grid-template-columns:repeat(2,1fr); }
    .lg-body { padding:14px 16px 20px; }
  }
`;

const PAGE_SIZE = 20;
const ENTRIES_PREVIEW = 20; // rows shown per account before "Show all"

type SortKey = "date" | "description" | "amount";
type SortDir = "asc" | "desc";

/* ─── helpers ─────────────────────────────────────────────────────── */
function fmtCurrency(val: number | string) {
  const num = typeof val === "string" ? parseFloat(val) : val;
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(num);
}
function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

export default function Ledger() {
  const [, setLocation] = useLocation();

  /* ── state ── */
  const [search,      setSearch]      = useState("");
  const [typeFilter,  setTypeFilter]  = useState<string | null>(null);
  const [selectedAcct, setSelectedAcct] = useState<string | null>(null);
  const [sortKey,     setSortKey]     = useState<SortKey>("date");
  const [sortDir,     setSortDir]     = useState<SortDir>("desc");
  const [page,        setPage]        = useState(1);
  const [expanded,    setExpanded]    = useState<Record<string, boolean>>({});
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  /* ── data ── */
  const { data: trialBalance, isLoading: trialLoading, refetch: refetchTrial } =
    trpc.reports.trialBalance.useQuery();
  const { data: transactions, isLoading: txLoading, refetch: refetchTx } =
    trpc.transactions.list.useQuery({ limit: 500 });

  const refetchAll = () => { refetchTrial(); refetchTx(); };

  const allTx: any[] = Array.isArray(transactions) ? transactions : [];
  const balances: any[] = trialBalance?.balances ?? [];

  /* ── derive ledger rows per account ── */
  const ledgerByAccount = useMemo(() => {
    const map: Record<string, { account: any; entries: any[] }> = {};

    for (const tx of allTx) {
      const entries: any[] = tx.journalEntries ?? [];
      for (const entry of entries) {
        const acct = entry.account;
        if (!acct) continue;
        if (!map[acct.id]) map[acct.id] = { account: acct, entries: [] };
        map[acct.id].entries.push({ ...entry, tx });
      }
    }

    // Sort entries within each account by date asc for running balance
    for (const id of Object.keys(map)) {
      map[id].entries.sort((a, b) =>
        new Date(a.tx.date).getTime() - new Date(b.tx.date).getTime()
      );
    }

    return map;
  }, [allTx]);

  /* ── accounts list (for sidebar/selector) ── */
  const accountsList = useMemo(() => {
    return Object.values(ledgerByAccount)
      .map(({ account, entries }) => {
        let balance = 0;
        for (const e of entries) {
          const amt = parseFloat(e.amount ?? e.tx?.amount ?? 0);
          if (e.type === "DEBIT")  balance += amt;
          if (e.type === "CREDIT") balance -= amt;
        }
        return { ...account, entryCount: entries.length, balance };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [ledgerByAccount]);

  /* ── filter accounts ── */
  const filteredAccounts = useMemo(() => {
    return accountsList.filter(acct => {
      if (typeFilter && acct.type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!acct.name.toLowerCase().includes(q) && !(acct.code ?? "").toLowerCase().includes(q)) return false;
      }
      if (selectedAcct && acct.id !== selectedAcct) return false;
      return true;
    });
  }, [accountsList, typeFilter, search, selectedAcct]);

  /* ── running balance per account ── */
  function getRunningRows(acctId: string) {
    const data = ledgerByAccount[acctId];
    if (!data) return [];
    let running = 0;
    return data.entries.map(e => {
      const amt = parseFloat(e.amount ?? e.tx?.amount ?? 0);
      if (e.type === "DEBIT")  running += amt;
      if (e.type === "CREDIT") running -= amt;
      return { ...e, running };
    });
  }

  /* ── KPI totals ── */
  const totalDebits  = parseFloat(trialBalance?.totalDebits  ?? "0");
  const totalCredits = parseFloat(trialBalance?.totalCredits ?? "0");
  const isBalanced   = trialBalance?.isBalanced;
  const acctCount    = accountsList.length;

  /* ── sort helper ── */
  const handleSort = (key: SortKey) => {
    setPage(1);
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => (
    <span className={`lg-sort ${sortKey === k ? sortDir : ""}`} style={{ verticalAlign: "middle" }}>
      <ChevronUp size={10} className="lg-sort-up" style={{ display:"block", marginBottom:-2 }} />
      <ChevronDown size={10} className="lg-sort-dn" style={{ display:"block" }} />
    </span>
  );

  /* ── toggle account expand ── */
  const toggleAcct = (id: string) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  /* ── pagination over accounts ── */
  const totalPages   = Math.max(1, Math.ceil(filteredAccounts.length / PAGE_SIZE));
  const pagedAccounts = filteredAccounts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ── balance class ── */
  const balClass = (n: number) => n > 0 ? "lg-bal-pos" : n < 0 ? "lg-bal-neg" : "lg-bal-zero";

  return (
    <div className="lg">
      <style>{css}</style>

      {/* ── STICKY TOP: header + KPIs never scroll ── */}
      <div className="lg-top-zone">
      {/* ── HEADER ── */}
      <div className="lg-header">
        <div>
          <div className="lg-live-pill"><span className="lg-live-dot" /> Live</div>
          <h1 className="lg-title">General Ledger</h1>
          <p className="lg-sub">Account-by-account transaction history with running balances</p>
        </div>
        <div className="lg-header-actions">
          <button className="lg-btn-ghost" onClick={refetchAll}><RefreshCw size={12} /> Refresh</button>
          <button className="lg-btn-primary" onClick={() => setLocation("/transaction")}><Plus size={13} /> New Entry</button>
        </div>
      </div>

      {/* ── KPI ROW ── */}
      <div className="lg-kpi-row">
        {/* Total Accounts */}
        <div className="lg-kpi" style={{ animationDelay:"0s" }}>
          <div className="lg-kpi-top">
            <span className="lg-kpi-label">Accounts</span>
            <div className="lg-kpi-icon" style={{ background:"rgba(79,99,210,0.1)" }}>
              <Layers size={14} color="#4F63D2" />
            </div>
          </div>
          {txLoading
            ? <div className="lg-shimmer" style={{ width:"50%", marginBottom:6 }} />
            : <div className="lg-kpi-val" style={{ color:"#4F63D2" }}>{acctCount}</div>}
          <div className="lg-kpi-meta">{allTx.length} transactions posted</div>
          <div className="lg-kpi-bar" style={{ background:"linear-gradient(90deg,#4F63D2,#6B7FE3)" }} />
        </div>

        {/* Total Debits */}
        <div className="lg-kpi" style={{ animationDelay:"0.06s" }}>
          <div className="lg-kpi-top">
            <span className="lg-kpi-label">Total Debits</span>
            <div className="lg-kpi-icon" style={{ background:"rgba(79,99,210,0.1)" }}>
              <ArrowDownLeft size={14} color="#4F63D2" />
            </div>
          </div>
          {trialLoading
            ? <div className="lg-shimmer" style={{ width:"70%", marginBottom:6 }} />
            : <div className="lg-kpi-val" style={{ color:"#4F63D2" }}>{fmtCurrency(totalDebits)}</div>}
          <div className="lg-kpi-meta">Across all accounts</div>
          <div className="lg-kpi-bar" style={{ background:"linear-gradient(90deg,#4F63D2,#6B7FE3)" }} />
        </div>

        {/* Total Credits */}
        <div className="lg-kpi" style={{ animationDelay:"0.12s" }}>
          <div className="lg-kpi-top">
            <span className="lg-kpi-label">Total Credits</span>
            <div className="lg-kpi-icon" style={{ background:"rgba(139,92,246,0.1)" }}>
              <ArrowUpRight size={14} color="#8B5CF6" />
            </div>
          </div>
          {trialLoading
            ? <div className="lg-shimmer" style={{ width:"70%", marginBottom:6 }} />
            : <div className="lg-kpi-val" style={{ color:"#8B5CF6" }}>{fmtCurrency(totalCredits)}</div>}
          <div className="lg-kpi-meta">Double-entry verified</div>
          <div className="lg-kpi-bar" style={{ background:"linear-gradient(90deg,#8B5CF6,#a78bfa)" }} />
        </div>

        {/* Balance Status */}
        <div className="lg-kpi" style={{ animationDelay:"0.18s" }}>
          <div className="lg-kpi-top">
            <span className="lg-kpi-label">Balance Status</span>
            <div className="lg-kpi-icon" style={{ background: isBalanced ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)" }}>
              {isBalanced ? <CheckCircle2 size={14} color="#22C55E" /> : <XCircle size={14} color="#EF4444" />}
            </div>
          </div>
          {trialLoading
            ? <div className="lg-shimmer" style={{ width:"60%", marginBottom:6 }} />
            : <div className="lg-kpi-val" style={{ color: isBalanced ? "#22C55E" : "#EF4444" }}>
                {isBalanced ? "✓ Balanced" : "✗ Unbalanced"}
              </div>}
          <div className="lg-kpi-meta">{isBalanced ? "Debits = Credits" : "Discrepancy found"}</div>
          <div className="lg-kpi-bar" style={{ background: isBalanced
            ? "linear-gradient(90deg,#22C55E,#4ade80)"
            : "linear-gradient(90deg,#EF4444,#f87171)" }} />
        </div>
      </div>{/* /lg-kpi-row */}
      </div>{/* /lg-top-zone */}

      <div className="lg-scroll-zone">
      <div className="lg-body">

        {/* ── ACCOUNT MINI CARDS (quick jump) ── */}
        {accountsList.length > 0 && (
          <div className="lg-card" style={{ animationDelay:"0.05s" }}>
            <div className="lg-card-hd">
              <div>
                <div className="lg-card-title">Chart of Accounts</div>
                <div className="lg-card-sub">Click an account to filter the ledger below</div>
              </div>
              {selectedAcct && (
                <button
                  className="lg-badge"
                  style={{ background:"rgba(239,68,68,0.08)", color:"#EF4444", border:"1px solid rgba(239,68,68,0.2)", cursor:"pointer" }}
                  onClick={() => setSelectedAcct(null)}
                >
                  ✕ Clear filter
                </button>
              )}
            </div>
            <div className="lg-acct-grid">
              {accountsList.map(acct => {
                const m = TYPE_META[acct.type] ?? TYPE_META.ASSET;
                return (
                  <div
                    key={acct.id}
                    className={`lg-acct-mini ${selectedAcct === acct.id ? "selected" : ""}`}
                    onClick={() => setSelectedAcct(selectedAcct === acct.id ? null : acct.id)}
                  >
                    <div className="lg-acct-mini-header">
                      <span className="lg-acct-mini-dot" style={{ background:m.dot }} />
                      <span className="lg-acct-mini-name">{acct.name}</span>
                    </div>
                    <div className="lg-acct-mini-type">{acct.type} · {acct.entryCount} entr{acct.entryCount!==1?"ies":"y"}</div>
                    <div className={`lg-acct-mini-bal ${balClass(acct.balance)}`}>
                      {fmtCurrency(Math.abs(acct.balance))}
                      <span className="lg-acct-mini-suffix">{acct.balance >= 0 ? "Dr" : "Cr"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── MAIN LEDGER TABLE ── */}
        <div className="lg-card lg-card-main" style={{ animationDelay:"0.10s" }}>
          <div className="lg-card-hd">
            <div>
              <div className="lg-card-title">General Ledger</div>
              <div className="lg-card-sub">
                {selectedAcct
                  ? `Showing: ${accountsList.find(a => a.id === selectedAcct)?.name}`
                  : "All accounts · running balance per account"}
              </div>
            </div>
            <span className="lg-badge" style={{ background:"rgba(79,99,210,0.08)", color:"#4F63D2", border:"1px solid rgba(79,99,210,0.15)" }}>
              {filteredAccounts.length} account{filteredAccounts.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* TOOLBAR */}
          <div className="lg-toolbar">
            <div className="lg-search-wrap">
              <span className="lg-search-icon"><Search size={12} /></span>
              <input
                className="lg-search"
                placeholder="Search accounts…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); setSelectedAcct(null); }}
              />
            </div>

            {(["ASSET","LIABILITY","EQUITY","REVENUE","EXPENSE"] as const).map(t => (
              <button
                key={t}
                className={`lg-filter-btn ${typeFilter === t ? "active" : ""}`}
                onClick={() => { setTypeFilter(typeFilter === t ? null : t); setPage(1); }}
                style={typeFilter === t ? {} : { color: TYPE_META[t].text, borderColor: TYPE_META[t].dot, background: TYPE_META[t].bg }}
              >
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="lg-divider" />

          {txLoading ? (
            <div className="lg-spinner-wrap"><div className="lg-spinner" /></div>
          ) : filteredAccounts.length === 0 ? (
            <div className="lg-empty">
              <BookOpen size={28} color="#E5E7EB" />
              <p>{search || typeFilter || selectedAcct ? "No accounts match your filter." : "No ledger entries yet."}</p>
              {!search && !typeFilter && (
                <button
                  style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"6px 12px", background:"rgba(79,99,210,0.08)", border:"1px solid rgba(79,99,210,0.2)", borderRadius:8, color:"#4F63D2", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}
                  onClick={() => setLocation("/transaction")}
                >
                  <Plus size={11} /> Create a transaction
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Per-account grouped sections */}
              {pagedAccounts.map((acct, idx) => {
                const m = TYPE_META[acct.type] ?? TYPE_META.ASSET;
                const rows = getRunningRows(acct.id);
                const isOpen = expanded[acct.id] !== false; // default open
                const totalDr = rows.reduce((s, r) => s + (r.type === "DEBIT"  ? parseFloat(r.amount ?? r.tx?.amount ?? 0) : 0), 0);
                const totalCr = rows.reduce((s, r) => s + (r.type === "CREDIT" ? parseFloat(r.amount ?? r.tx?.amount ?? 0) : 0), 0);
                const endBal  = rows[rows.length - 1]?.running ?? 0;

                return (
                  <div className="lg-acct-group" key={acct.id}
                    style={idx < pagedAccounts.length - 1 ? { borderBottom:"1px solid rgba(0,0,0,0.05)" } : {}}>

                    {/* Account header row */}
                    <div className="lg-acct-header" onClick={() => toggleAcct(acct.id)}>
                      <div className="lg-acct-header-left">
                        <div className="lg-acct-header-icon" style={{ background: m.bg }}>
                          <span style={{ width:12, height:12, borderRadius:"50%", background:m.dot }} />
                        </div>
                        <div>
                          <div className="lg-acct-name">{acct.name}</div>
                          <div className="lg-acct-meta-row">
                            {acct.code && <span className="lg-acct-code">{acct.code}</span>}
                            <span className="lg-acct-badge" style={{ background:m.bg, color:m.text }}>
                              <span className="lg-acct-dot" style={{ background:m.dot }} />
                              {acct.type}
                            </span>
                            <span style={{ fontSize:11, color:"var(--ink4)" }}>{rows.length} entr{rows.length !== 1 ? "ies" : "y"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="lg-acct-header-right">
                        <div className="lg-acct-stat">
                          <div className="lg-acct-stat-lbl">Debits</div>
                          <div className="lg-acct-stat-val lg-dr">{fmtCurrency(totalDr)}</div>
                        </div>
                        <div className="lg-acct-stat">
                          <div className="lg-acct-stat-lbl">Credits</div>
                          <div className="lg-acct-stat-val lg-cr">{fmtCurrency(totalCr)}</div>
                        </div>
                        <div className="lg-acct-stat">
                          <div className="lg-acct-stat-lbl">Balance</div>
                          <div className={`lg-acct-stat-val ${balClass(endBal)}`}>{fmtCurrency(Math.abs(endBal))}</div>
                        </div>
                        <ChevronRight size={15} className={`lg-acct-chevron ${isOpen ? "open" : ""}`} />
                      </div>
                    </div>

                    {/* Expandable entries table */}
                    {isOpen && (() => {
                      const showAll = expandedRows[acct.id] === true;
                      const visibleRows = showAll ? rows : rows.slice(0, ENTRIES_PREVIEW);
                      return (
                      <div className="lg-table-wrap">
                        <table className="lg-table">
                          <thead>
                            <tr>
                              <th onClick={() => handleSort("date")}>Date <SortIcon k="date" /></th>
                              <th>Ref #</th>
                              <th onClick={() => handleSort("description")}>Description <SortIcon k="description" /></th>
                              <th>Contra Account</th>
                              <th>Type</th>
                              <th className="right" onClick={() => handleSort("amount")}>Debit <SortIcon k="amount" /></th>
                              <th className="right">Credit</th>
                              <th className="right">Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {visibleRows.map((row, i) => {
                              const amt = parseFloat(row.amount ?? row.tx?.amount ?? 0);
                              const isDr = row.type === "DEBIT";

                              // Find the contra entry (the other side of the same transaction)
                              const contraEntries: any[] = row.tx?.journalEntries ?? [];
                              const contra = contraEntries.find((e: any) => e.id !== row.id);
                              const contraMeta = TYPE_META[contra?.account?.type] ?? null;

                              return (
                                <tr key={row.id ?? i}>
                                  <td><span className="lg-date">{fmtDate(row.tx.date)}</span></td>
                                  <td><span className="lg-ref">#{String(row.tx.id ?? "").slice(-6).toUpperCase() || "—"}</span></td>
                                  <td>
                                    <span className="lg-desc">{row.tx.description}</span>
                                  </td>
                                  <td>
                                    {contra?.account ? (
                                      <span className="lg-acct-badge" style={contraMeta ? { background:contraMeta.bg, color:contraMeta.text } : {}}>
                                        {contraMeta && <span className="lg-acct-dot" style={{ background:contraMeta.dot }} />}
                                        {contra.account.name}
                                      </span>
                                    ) : <span style={{ color:"var(--ink4)", fontSize:11 }}>—</span>}
                                  </td>
                                  <td>
                                    <span className={`lg-entry-pill ${isDr ? "dr" : "cr"}`}>
                                      {isDr ? <ArrowDownLeft size={9} /> : <ArrowUpRight size={9} />}
                                      {isDr ? "Dr" : "Cr"}
                                    </span>
                                  </td>
                                  <td className="right">
                                    {isDr ? <span className="lg-dr">{fmtCurrency(amt)}</span>
                                           : <span style={{ color:"var(--ink4)" }}>—</span>}
                                  </td>
                                  <td className="right">
                                    {!isDr ? <span className="lg-cr">{fmtCurrency(amt)}</span>
                                           : <span style={{ color:"var(--ink4)" }}>—</span>}
                                  </td>
                                  <td className="right">
                                    <span className={balClass(row.running)}>{fmtCurrency(Math.abs(row.running))}</span>
                                    <span style={{ fontSize:9, color:"var(--ink4)", marginLeft:4 }}>
                                      {row.running > 0 ? "Dr" : row.running < 0 ? "Cr" : ""}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan={5} style={{ fontWeight:700, fontSize:11, color:"var(--ink3)", letterSpacing:".08em", textTransform:"uppercase" }}>
                                Account Totals
                              </td>
                              <td className="right lg-dr">{fmtCurrency(totalDr)}</td>
                              <td className="right lg-cr">{fmtCurrency(totalCr)}</td>
                              <td className="right">
                                <span className={balClass(endBal)}>{fmtCurrency(Math.abs(endBal))}</span>
                                <span style={{ fontSize:9, color:"var(--ink4)", marginLeft:4 }}>
                                  {endBal > 0 ? "Dr" : endBal < 0 ? "Cr" : ""}
                                </span>
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                        {rows.length > ENTRIES_PREVIEW && (
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 18px", borderTop:"1px solid rgba(0,0,0,0.05)", background:"rgba(79,99,210,0.02)" }}>
                            <span style={{ fontSize:11, color:"var(--ink4)", fontFamily:"'Space Mono',monospace" }}>
                              {showAll ? `All ${rows.length} entries` : `Showing ${ENTRIES_PREVIEW} of ${rows.length} entries`}
                            </span>
                            <button
                              onClick={e => { e.stopPropagation(); setExpandedRows(prev => ({ ...prev, [acct.id]: !showAll })); }}
                              style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 12px", background:"rgba(79,99,210,0.08)", border:"1px solid rgba(79,99,210,0.2)", borderRadius:7, color:"#4F63D2", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}
                            >
                              {showAll ? "Show less" : `Show all ${rows.length}`}
                            </button>
                          </div>
                        )}
                      </div>
                      );
                    })()}
                  </div>
                );
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="lg-pagination">
                  <span className="lg-pagination-info">
                    {((page-1)*PAGE_SIZE)+1}–{Math.min(page*PAGE_SIZE, filteredAccounts.length)} of {filteredAccounts.length} accounts
                  </span>
                  <div className="lg-pagination-btns">
                    <button className="lg-pg-btn" disabled={page===1} onClick={() => setPage(p => p-1)}>
                      <ChevronLeft size={11} />
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pg = totalPages <= 5 ? i+1 : page <= 3 ? i+1 : page >= totalPages-2 ? totalPages-4+i : page-2+i;
                      return (
                        <button key={pg} className={`lg-pg-btn ${pg===page ? "active" : ""}`} onClick={() => setPage(pg)}>
                          {pg}
                        </button>
                      );
                    })}
                    <button className="lg-pg-btn" disabled={page===totalPages} onClick={() => setPage(p => p+1)}>
                      <ChevronRight size={11} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>{/* /lg-body */}
      </div>{/* /lg-scroll-zone */}
    </div>
  );
}
