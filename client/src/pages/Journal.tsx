import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useMemo, useState } from "react";
import {
  TrendingUp, TrendingDown, CheckCircle2, XCircle,
  Plus, ArrowRight, Search, Filter, ChevronUp, ChevronDown,
  BookOpen, BarChart2, RefreshCw,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";

/* ─── colour maps ─────────────────────────────────────────────────── */
const TYPE_META: Record<string, { bg: string; text: string; dot: string; bar: string }> = {
  ASSET:     { bg: "rgba(59,130,246,0.10)",  text: "#1d4ed8", dot: "#3b82f6", bar: "#3b82f6" },
  LIABILITY: { bg: "rgba(236,72,153,0.10)",  text: "#be185d", dot: "#ec4899", bar: "#ec4899" },
  EQUITY:    { bg: "rgba(139,92,246,0.10)",  text: "#6d28d9", dot: "#8b5cf6", bar: "#8b5cf6" },
  REVENUE:   { bg: "rgba(16,185,129,0.10)",  text: "#065f46", dot: "#10b981", bar: "#10b981" },
  EXPENSE:   { bg: "rgba(239,68,68,0.10)",   text: "#991b1b", dot: "#ef4444", bar: "#ef4444" },
};
const BAR_COLORS = ["#4F63D2","#22C55E","#F59E0B","#EF4444","#8B5CF6","#06B6D4","#F97316","#14B8A6"];

/* ─── tooltip style (matches Dashboard) ──────────────────────────── */
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

  .jn {
    font-family: 'Outfit', sans-serif;
    --blue:#4F63D2; --blue2:#6B7FE3;
    --green:#22C55E; --red:#EF4444;
    --purple:#8B5CF6; --amber:#F59E0B;
    --ink:#1E2340; --ink2:#3D4466; --ink3:#6B7280; --ink4:#9CA3AF;
    --surface:rgba(255,255,255,0.92); --surface2:rgba(255,255,255,0.6);
    --border:rgba(255,255,255,0.7);
    min-height:100vh; background:transparent; color:var(--ink);
  }

  /* HEADER */
  .jn-header { display:flex; align-items:flex-start; justify-content:space-between; padding:24px 28px 0; }
  .jn-live-pill {
    display:inline-flex; align-items:center; gap:6px;
    padding:3px 10px; background:rgba(255,255,255,0.35);
    border:1px solid rgba(255,255,255,0.5); border-radius:20px;
    font-size:9px; font-weight:700; color:#fff;
    font-family:'Space Mono',monospace; letter-spacing:.12em;
    text-transform:uppercase; margin-bottom:6px; width:fit-content;
  }
  .jn-live-dot { width:5px; height:5px; background:#4ade80; border-radius:50%; animation:pulse 2s ease infinite; }
  .jn-title { font-size:27px; font-weight:800; color:#fff; letter-spacing:-.04em; margin:0 0 2px; }
  .jn-sub   { font-size:12px; color:rgba(255,255,255,.65); margin:0; font-weight:300; }
  .jn-header-actions { display:flex; gap:8px; align-items:center; }
  .jn-btn-ghost {
    display:inline-flex; align-items:center; gap:6px;
    padding:8px 14px; background:rgba(255,255,255,.15);
    border:1px solid rgba(255,255,255,.3); border-radius:9px;
    font-size:12px; font-weight:600; color:#fff;
    cursor:pointer; transition:all .15s; font-family:'Outfit',sans-serif;
  }
  .jn-btn-ghost:hover { background:rgba(255,255,255,.25); }
  .jn-btn-primary {
    display:inline-flex; align-items:center; gap:6px;
    padding:8px 16px; background:#fff; border:none; border-radius:9px;
    font-size:12px; font-weight:700; color:var(--blue);
    cursor:pointer; transition:all .15s; font-family:'Outfit',sans-serif;
    box-shadow:0 2px 12px rgba(0,0,0,.15);
  }
  .jn-btn-primary:hover { transform:translateY(-1px); box-shadow:0 4px 18px rgba(0,0,0,.2); }

  /* KPI */
  .jn-kpi-row { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; padding:20px 28px 0; }
  .jn-kpi {
    background:var(--surface); border:1px solid var(--border);
    border-radius:16px; padding:16px 18px;
    backdrop-filter:blur(12px);
    box-shadow:0 4px 20px rgba(0,0,0,.08);
    animation:fadeUp .4s ease both; position:relative; overflow:hidden;
  }
  .jn-kpi-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
  .jn-kpi-label { font-size:10px; font-weight:700; color:var(--ink3); letter-spacing:.1em; text-transform:uppercase; }
  .jn-kpi-icon { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; }
  .jn-kpi-val { font-family:'Space Mono',monospace; font-size:22px; font-weight:700; letter-spacing:-.02em; margin-bottom:4px; }
  .jn-kpi-meta { font-size:11px; color:var(--ink3); font-weight:400; }
  .jn-kpi-bar { position:absolute; bottom:0; left:0; right:0; height:3px; border-radius:0 0 16px 16px; }

  /* BODY */
  .jn-body { padding:20px 28px 28px; display:flex; flex-direction:column; gap:18px; }

  /* CARDS */
  .jn-card {
    background:var(--surface); border:1px solid var(--border);
    border-radius:16px; backdrop-filter:blur(12px);
    box-shadow:0 4px 20px rgba(0,0,0,.07);
    overflow:hidden; animation:fadeUp .5s ease both;
  }
  .jn-card-hd {
    padding:18px 20px 0;
    display:flex; align-items:flex-start; justify-content:space-between;
    margin-bottom:14px;
  }
  .jn-card-title { font-size:14px; font-weight:700; color:var(--ink); letter-spacing:-.02em; }
  .jn-card-sub   { font-size:11px; color:var(--ink3); margin-top:2px; font-weight:400; }
  .jn-badge {
    font-size:9px; font-weight:700; padding:3px 8px; border-radius:20px;
    font-family:'Space Mono',monospace; letter-spacing:.06em; text-transform:uppercase;
    white-space:nowrap; flex-shrink:0;
  }

  /* TOOLBAR */
  .jn-toolbar {
    display:flex; align-items:center; gap:10px;
    padding:0 20px 14px;
  }
  .jn-search-wrap { position:relative; flex:1; max-width:280px; }
  .jn-search-icon { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--ink4); line-height:0; }
  .jn-search {
    width:100%; padding:7px 12px 7px 30px;
    background:rgba(79,99,210,0.05); border:1px solid rgba(79,99,210,0.12);
    border-radius:8px; font-size:12px; font-family:'Outfit',sans-serif;
    color:var(--ink); outline:none; transition:all .15s;
  }
  .jn-search::placeholder { color:var(--ink4); }
  .jn-search:focus { border-color:rgba(79,99,210,0.35); background:#fff; box-shadow:0 0 0 3px rgba(79,99,210,0.07); }
  .jn-filter-btn {
    display:inline-flex; align-items:center; gap:5px;
    padding:7px 12px; border:1px solid rgba(79,99,210,0.15);
    background:rgba(79,99,210,0.05); border-radius:8px;
    font-size:11px; font-weight:600; color:var(--blue);
    cursor:pointer; transition:all .15s; font-family:'Outfit',sans-serif;
  }
  .jn-filter-btn:hover { background:rgba(79,99,210,0.1); }
  .jn-filter-btn.active { background:var(--blue); color:#fff; border-color:var(--blue); }

  /* TABLE */
  .jn-table-wrap { overflow-x:auto; }
  .jn-table { width:100%; border-collapse:collapse; font-size:12px; }
  .jn-table thead tr { border-bottom:1px solid rgba(0,0,0,0.06); }
  .jn-table th {
    padding:10px 16px; text-align:left;
    font-size:10px; font-weight:700; color:var(--ink3);
    letter-spacing:.08em; text-transform:uppercase; white-space:nowrap;
    cursor:pointer; user-select:none; transition:color .12s;
  }
  .jn-table th:hover { color:var(--blue); }
  .jn-table th.right { text-align:right; }
  .jn-table td { padding:13px 16px; border-bottom:1px solid rgba(0,0,0,0.04); vertical-align:middle; }
  .jn-table tbody tr:last-child td { border-bottom:none; }
  .jn-table tbody tr { transition:background .12s; }
  .jn-table tbody tr:hover { background:rgba(79,99,210,0.03); }
  .jn-table td.right { text-align:right; }
  .jn-table tfoot tr { border-top:2px solid rgba(0,0,0,0.08); background:rgba(79,99,210,0.02); }
  .jn-table tfoot td { padding:12px 16px; font-weight:700; font-size:12px; color:var(--ink); }
  .jn-table tfoot td.right { text-align:right; font-family:'Space Mono',monospace; }

  .jn-date  { font-size:11px; color:var(--ink3); white-space:nowrap; font-family:'Space Mono',monospace; }
  .jn-desc  { font-weight:600; color:var(--ink); max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; display:block; }
  .jn-desc-sub { font-size:10px; color:var(--ink4); margin-top:2px; }

  .jn-acct-badge {
    display:inline-flex; align-items:center; gap:5px;
    padding:3px 8px; border-radius:20px;
    font-size:10px; font-weight:700; white-space:nowrap;
    font-family:'Space Mono',monospace; letter-spacing:.03em;
  }
  .jn-acct-dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }

  .jn-type-badge {
    display:inline-flex; align-items:center; gap:4px;
    padding:3px 8px; border-radius:20px;
    font-size:9px; font-weight:700; letter-spacing:.06em; text-transform:uppercase;
    font-family:'Space Mono',monospace;
  }
  .jn-type-dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }

  .jn-amt-dr  { font-family:'Space Mono',monospace; font-weight:700; color:#4F63D2; }
  .jn-amt-cr  { font-family:'Space Mono',monospace; font-weight:700; color:#8B5CF6; }
  .jn-amt-pos { font-family:'Space Mono',monospace; font-weight:700; color:#22C55E; }
  .jn-amt-neg { font-family:'Space Mono',monospace; font-weight:700; color:#EF4444; }

  /* SORT ICON */
  .jn-sort { display:inline-flex; flex-direction:column; margin-left:4px; opacity:.4; }
  .jn-sort.asc .jn-sort-up, .jn-sort.desc .jn-sort-dn { opacity:1; color:var(--blue); }

  /* BALANCE MINI CARDS */
  /* SHIMMER */
  .jn-shimmer { height:18px; border-radius:5px; background:linear-gradient(90deg,#ececec 25%,#f5f5f5 50%,#ececec 75%); background-size:200% 100%; animation:shimmer 1.2s infinite; }

  /* EMPTY */
  .jn-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:48px 20px; gap:10px; }
  .jn-empty p { font-size:12px; color:var(--ink4); margin:0; }

  /* SPINNER */
  .jn-spinner { width:18px; height:18px; border-radius:50%; border:2px solid #E5E7EB; border-top-color:var(--blue); animation:spin .7s linear infinite; }
  .jn-spinner-wrap { display:flex; justify-content:center; padding:32px; }

  /* VIEW ALL */
  .jn-view-all {
    display:flex; align-items:center; gap:4px; font-size:11px; font-weight:600;
    color:var(--blue); background:none; border:none; cursor:pointer;
    font-family:'Outfit',sans-serif; padding:0; transition:gap .15s;
  }
  .jn-view-all:hover { gap:7px; }

  /* DIVIDER */
  .jn-divider { height:1px; background:rgba(0,0,0,0.05); margin:0 20px; }

  @media (max-width:1100px) {
    .jn-kpi-row { grid-template-columns:repeat(3,1fr); }
    .jn-row2 { grid-template-columns:1fr; }
  }
  @media (max-width:700px) {
    /* Card-style table */
    .jn-table-wrap { overflow-x:hidden; }
    .jn-table thead { display:none; }
    .jn-table, .jn-table tbody, .jn-table tr, .jn-table td { display:block; width:100%; }
    .jn-table tr { padding:12px 16px; border-bottom:1px solid rgba(0,0,0,0.05); }
    .jn-table td { padding:2px 0; border:none; text-align:left !important; }
    .jn-table td::before {
      content:attr(data-label);
      display:inline-block; width:75px;
      font-size:9px; font-weight:700; color:var(--ink4);
      text-transform:uppercase; letter-spacing:.08em;
      font-family:'Space Mono',monospace;
    }
    /* Hide Cr amount col on mobile (redundant with Dr for equal D-E) */
    .jn-table td:nth-child(6) { display:none; }
    .jn-desc { max-width:100%; }
  }
  @media (max-width:640px) {
    .jn-header { padding:16px 16px 0; flex-direction:column; gap:10px; }
    .jn-kpi-row { padding:16px 16px 0; grid-template-columns:repeat(3,1fr); }
    .jn-body { padding:14px 16px 20px; gap:14px; }
    .jn-title { font-size:22px; }
    .jn-card-hd { padding:14px 16px 0; }
    .jn-toolbar { padding:0 16px 12px; flex-wrap:wrap; }
    .jn-search-wrap { max-width:100%; }
    .jn-filter-btn { font-size:10px; padding:5px 9px; }
    .jn-header-actions .jn-btn-ghost { display:none; }
  }
  @media (max-width:480px) {
    .jn-kpi-row { grid-template-columns:1fr 1fr; }
    .jn-kpi-val { font-size:18px; }
  }
  @media (max-width:380px) {
    .jn-kpi-row { grid-template-columns:1fr; }
    .jn-header-actions { width:100%; }
    .jn-btn-primary { width:100%; justify-content:center; }
  }
`;

type SortKey = "date" | "description" | "amount";
type SortDir = "asc" | "desc";

export default function Journal() {
  const [, setLocation] = useLocation();
  const [search, setSearch]       = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [sortKey, setSortKey]     = useState<SortKey>("date");
  const [sortDir, setSortDir]     = useState<SortDir>("desc");
  const [page, setPage]           = useState(1);
  const PAGE_SIZE = 15;

  const { data: trialBalance, isLoading: trialLoading, refetch: refetchTrial } =
    trpc.reports.trialBalance.useQuery();
  const { data: transactions, isLoading: txLoading, refetch: refetchTx } =
    trpc.transactions.list.useQuery({ limit: 100 });

  const fmt = (val: number | string) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(num);
  };

  const refetchAll = () => { refetchTrial(); refetchTx(); };

  /* ── derived data ── */
  const allTx: any[] = Array.isArray(transactions) ? transactions : [];

  const filteredTx = useMemo(() => {
    let list = [...allTx];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(tx => {
        const entries: any[] = tx.journalEntries ?? [];
        return (
          tx.description?.toLowerCase().includes(q) ||
          entries.some((e: any) => e.account?.name?.toLowerCase().includes(q))
        );
      });
    }
    if (typeFilter) {
      list = list.filter(tx => {
        const entries: any[] = tx.journalEntries ?? [];
        return entries.some((e: any) => e.account?.type === typeFilter);
      });
    }
    list.sort((a, b) => {
      let av: any, bv: any;
      if (sortKey === "date")        { av = new Date(a.date).getTime(); bv = new Date(b.date).getTime(); }
      else if (sortKey === "amount") { av = parseFloat(a.amount); bv = parseFloat(b.amount); }
      else                           { av = a.description; bv = b.description; }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [allTx, search, typeFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredTx.length / PAGE_SIZE));
  const paginatedTx = filteredTx.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* bar chart — account type breakdown */
  const balanceChartData = useMemo(() =>
    (trialBalance?.balances ?? [])
      .filter((b: any) => parseFloat(b.balance) !== 0)
      .map((b: any) => ({ name: b.accountName.length > 12 ? b.accountName.slice(0,12)+"…" : b.accountName, Balance: Math.abs(parseFloat(b.balance)), type: b.accountType })),
  [trialBalance]);

  const handleSort = (key: SortKey) => {
    setPage(1);
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => (
    <span className={`jn-sort ${sortKey === k ? sortDir : ""}`} style={{ verticalAlign: "middle" }}>
      <ChevronUp size={10} className="jn-sort-up" style={{ display:"block", marginBottom:-2 }} />
      <ChevronDown size={10} className="jn-sort-dn" style={{ display:"block" }} />
    </span>
  );

  const isBalanced = trialBalance?.isBalanced;

  return (
    <div className="jn">
      <style>{css}</style>

      {/* ── HEADER ── */}
      <div className="jn-header">
        <div>
          <div className="jn-live-pill"><span className="jn-live-dot" /> Live</div>
          <h1 className="jn-title">Journal</h1>
          <p className="jn-sub">All journal entries with debit and credit lines</p>
        </div>
        <div className="jn-header-actions">
          <button className="jn-btn-ghost" onClick={refetchAll}><RefreshCw size={12} /> Refresh</button>
          <button className="jn-btn-primary" onClick={() => setLocation("/transaction")}><Plus size={13} /> New Entry</button>
        </div>
      </div>

      {/* ── KPI ROW ── */}
      <div className="jn-kpi-row">
        <div className="jn-kpi" style={{ animationDelay: "0s" }}>
          <div className="jn-kpi-top">
            <span className="jn-kpi-label">Total Debits</span>
            <div className="jn-kpi-icon" style={{ background: "rgba(79,99,210,0.1)" }}>
              <TrendingDown size={14} color="#4F63D2" />
            </div>
          </div>
          {trialLoading
            ? <div className="jn-shimmer" style={{ width: "70%", marginBottom: 6 }} />
            : <div className="jn-kpi-val" style={{ color: "#4F63D2" }}>{fmt(trialBalance?.totalDebits || 0)}</div>}
          <div className="jn-kpi-meta">{allTx.length} entr{allTx.length !== 1 ? "ies" : "y"}</div>
          <div className="jn-kpi-bar" style={{ background: "linear-gradient(90deg,#4F63D2,#6B7FE3)" }} />
        </div>

        <div className="jn-kpi" style={{ animationDelay: "0.06s" }}>
          <div className="jn-kpi-top">
            <span className="jn-kpi-label">Total Credits</span>
            <div className="jn-kpi-icon" style={{ background: "rgba(139,92,246,0.1)" }}>
              <TrendingUp size={14} color="#8B5CF6" />
            </div>
          </div>
          {trialLoading
            ? <div className="jn-shimmer" style={{ width: "70%", marginBottom: 6 }} />
            : <div className="jn-kpi-val" style={{ color: "#8B5CF6" }}>{fmt(trialBalance?.totalCredits || 0)}</div>}
          <div className="jn-kpi-meta">Double-entry verified</div>
          <div className="jn-kpi-bar" style={{ background: "linear-gradient(90deg,#8B5CF6,#a78bfa)" }} />
        </div>

        <div className="jn-kpi" style={{ animationDelay: "0.12s" }}>
          <div className="jn-kpi-top">
            <span className="jn-kpi-label">Balance Status</span>
            <div className="jn-kpi-icon" style={{ background: isBalanced ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)" }}>
              {isBalanced ? <CheckCircle2 size={14} color="#22C55E" /> : <XCircle size={14} color="#EF4444" />}
            </div>
          </div>
          {trialLoading
            ? <div className="jn-shimmer" style={{ width: "60%", marginBottom: 6 }} />
            : <div className="jn-kpi-val" style={{ color: isBalanced ? "#22C55E" : "#EF4444" }}>{isBalanced ? "✓ Balanced" : "✗ Unbalanced"}</div>}
          <div className="jn-kpi-meta">{isBalanced ? "Debits = Credits" : "Discrepancy found"}</div>
          <div className="jn-kpi-bar" style={{ background: isBalanced ? "linear-gradient(90deg,#22C55E,#4ade80)" : "linear-gradient(90deg,#EF4444,#f87171)" }} />
        </div>
      </div>

      <div className="jn-body">

        {/* JOURNAL ENTRIES */}
          <div className="jn-card">
            <div className="jn-card-hd">
              <div>
                <div className="jn-card-title">Journal Entries</div>
                <div className="jn-card-sub">Complete list of all transactions with debit and credit accounts</div>
              </div>
              <span className="jn-badge" style={{ background: "rgba(79,99,210,0.08)", color: "#4F63D2", border: "1px solid rgba(79,99,210,0.15)" }}>
                {filteredTx.length} / {allTx.length}
              </span>
            </div>

            {/* TOOLBAR */}
            <div className="jn-toolbar">
              <div className="jn-search-wrap">
                <span className="jn-search-icon"><Search size={12} /></span>
                <input
                  className="jn-search"
                  placeholder="Search entries…"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              {(["ASSET","LIABILITY","EQUITY","REVENUE","EXPENSE"] as const).map(t => (
                <button
                  key={t}
                  className={`jn-filter-btn ${typeFilter === t ? "active" : ""}`}
                  onClick={() => { setTypeFilter(typeFilter === t ? null : t); setPage(1); }}
                  style={typeFilter === t ? {} : { color: TYPE_META[t].text, borderColor: TYPE_META[t].dot, background: TYPE_META[t].bg }}
                >
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            <div className="jn-divider" />

            {txLoading ? (
              <div className="jn-spinner-wrap"><div className="jn-spinner" /></div>
            ) : filteredTx.length > 0 ? (
              <>
              <div className="jn-table-wrap">
                <table className="jn-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort("date")}>Date <SortIcon k="date" /></th>
                      <th onClick={() => handleSort("description")}>Description <SortIcon k="description" /></th>
                      <th>Debit Account</th>
                      <th>Credit Account</th>
                      <th className="right" onClick={() => handleSort("amount")}>Amount (Dr) <SortIcon k="amount" /></th>
                      <th className="right">Amount (Cr)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTx.map((tx: any) => {
                      const entries: any[] = tx.journalEntries ?? [];
                      const debitEntry  = entries.find((e: any) => e.type === "DEBIT");
                      const creditEntry = entries.find((e: any) => e.type === "CREDIT");
                      const debitAcct   = debitEntry?.account;
                      const creditAcct  = creditEntry?.account;
                      const dr = TYPE_META[debitAcct?.type]  ?? { bg: "rgba(79,99,210,0.1)",  text: "#4F63D2", dot: "#4F63D2" };
                      const cr = TYPE_META[creditAcct?.type] ?? { bg: "rgba(139,92,246,0.1)", text: "#8B5CF6", dot: "#8B5CF6" };
                      const drAmt = debitEntry?.amount  ?? tx.amount;
                      const crAmt = creditEntry?.amount ?? tx.amount;
                      return (
                        <tr key={tx.id}>
                          <td data-label="Date">
                            <span className="jn-date">
                              {new Date(tx.date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </td>
                          <td data-label="Desc">
                            <span className="jn-desc">{tx.description}</span>
                          </td>
                          <td data-label="Debit">
                            {debitAcct ? (
                              <span className="jn-acct-badge" style={{ background: dr.bg, color: dr.text }}>
                                <span className="jn-acct-dot" style={{ background: dr.dot }} />
                                {debitAcct.name}
                              </span>
                            ) : <span style={{ color:"var(--ink4)", fontSize:11 }}>—</span>}
                          </td>
                          <td data-label="Credit">
                            {creditAcct ? (
                              <span className="jn-acct-badge" style={{ background: cr.bg, color: cr.text }}>
                                <span className="jn-acct-dot" style={{ background: cr.dot }} />
                                {creditAcct.name}
                              </span>
                            ) : <span style={{ color:"var(--ink4)", fontSize:11 }}>—</span>}
                          </td>
                          <td className="right jn-amt-dr" data-label="Dr">{ fmt(drAmt)}</td>
                          <td className="right jn-amt-cr" data-label="Cr">{fmt(crAmt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 20px", borderTop:"1px solid rgba(0,0,0,0.05)" }}>
                  <span style={{ fontSize:11, color:"var(--ink3)", fontFamily:"'Space Mono',monospace" }}>
                    {((page-1)*PAGE_SIZE)+1}–{Math.min(page*PAGE_SIZE, filteredTx.length)} of {filteredTx.length}
                  </span>
                  <div style={{ display:"flex", gap:4 }}>
                    <button
                      onClick={() => setPage(p => Math.max(1, p-1))}
                      disabled={page === 1}
                      style={{ padding:"5px 12px", borderRadius:7, border:"1px solid rgba(79,99,210,0.2)", background: page===1 ? "transparent" : "rgba(79,99,210,0.06)", color: page===1 ? "var(--ink4)" : "var(--blue)", fontSize:11, fontWeight:600, cursor: page===1 ? "default" : "pointer", fontFamily:"'Outfit',sans-serif" }}
                    >← Prev</button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pg = totalPages <= 5 ? i+1 : page <= 3 ? i+1 : page >= totalPages-2 ? totalPages-4+i : page-2+i;
                      return (
                        <button key={pg} onClick={() => setPage(pg)}
                          style={{ width:30, height:30, borderRadius:7, border:"1px solid rgba(79,99,210,0.2)", background: pg===page ? "var(--blue)" : "transparent", color: pg===page ? "#fff" : "var(--ink3)", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}
                        >{pg}</button>
                      );
                    })}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p+1))}
                      disabled={page === totalPages}
                      style={{ padding:"5px 12px", borderRadius:7, border:"1px solid rgba(79,99,210,0.2)", background: page===totalPages ? "transparent" : "rgba(79,99,210,0.06)", color: page===totalPages ? "var(--ink4)" : "var(--blue)", fontSize:11, fontWeight:600, cursor: page===totalPages ? "default" : "pointer", fontFamily:"'Outfit',sans-serif" }}
                    >Next →</button>
                  </div>
                </div>
              )}
              </>
            ) : (
              <div className="jn-empty">
                <BookOpen size={28} color="#E5E7EB" />
                <p>{search || typeFilter ? "No entries match your filter." : "No journal entries yet."}</p>
                {!search && !typeFilter && (
                  <button
                    style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"6px 12px", background:"rgba(79,99,210,0.08)", border:"1px solid rgba(79,99,210,0.2)", borderRadius:8, color:"#4F63D2", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}
                    onClick={() => setLocation("/transaction")}
                  >
                    <Plus size={11} /> Create a transaction
                  </button>
                )}
              </div>
            )}
          </div>

        {/* ACCOUNT BALANCES CHART — full width below */}
        {balanceChartData.length > 0 && (
          <div className="jn-card" style={{ animationDelay: "0.2s" }}>
            <div className="jn-card-hd">
              <div>
                <div className="jn-card-title">Account Balances</div>
                <div className="jn-card-sub">By account · absolute value</div>
              </div>
              <span className="jn-badge" style={{ background:"rgba(245,158,11,0.1)", color:"#F59E0B", border:"1px solid rgba(245,158,11,0.2)" }}>CHART</span>
            </div>
            <div style={{ padding: "0 20px 20px" }}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={balanceChartData} layout="vertical" margin={{ top:0, right:20, left:0, bottom:0 }}>
                  <XAxis type="number" tick={{ fontSize:9, fill:"#9CA3AF" }} tickLine={false} axisLine={false} tickFormatter={v => `₱${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize:11, fill:"#6B7280" }} tickLine={false} axisLine={false} width={100} />
                  <Tooltip contentStyle={TIP} formatter={(v:any) => [fmt(parseFloat(v)), "Balance"]} />
                  <Bar dataKey="Balance" radius={[0,4,4,0]} barSize={14}>
                    {balanceChartData.map((d: any, i: number) => (
                      <Cell key={i} fill={TYPE_META[d.type]?.dot ?? BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
