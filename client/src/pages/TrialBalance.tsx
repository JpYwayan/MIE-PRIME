import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useMemo, useState } from "react";
import {
  CheckCircle2, XCircle, RefreshCw, Plus,
  Search, ChevronUp, ChevronDown, Download,
  Scale, TrendingUp, TrendingDown, BookOpen,
} from "lucide-react";

/* ─── colour maps ──────────────────────────────────────────────────── */
const TYPE_META: Record<string, { bg: string; text: string; dot: string; bar: string }> = {
  ASSET:     { bg: "#dbeafe", text: "#1d4ed8", dot: "#3b82f6", bar: "#3b82f6" },
  LIABILITY: { bg: "#fce7f3", text: "#be185d", dot: "#ec4899", bar: "#ec4899" },
  EQUITY:    { bg: "#ede9fe", text: "#6d28d9", dot: "#8b5cf6", bar: "#8b5cf6" },
  REVENUE:   { bg: "#d1fae5", text: "#065f46", dot: "#10b981", bar: "#10b981" },
  EXPENSE:   { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444", bar: "#ef4444" },
};

const TYPE_ORDER = ["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"];

/* ─── CSS ──────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.45} }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes shimmer { to { background-position:-200% 0; } }

  .tb {
    font-family:'Outfit',sans-serif;
    --blue:#4F63D2; --blue2:#6B7FE3;
    --green:#15803d; --red:#dc2626;
    --purple:#7c3aed; --amber:#d97706;
    --ink:#111827; --ink2:#1f2937; --ink3:#4B5563; --ink4:#9CA3AF;
    --surface:#ffffff; --surface2:#F9FAFB;
    --border:rgba(17,24,39,0.09); --border2:rgba(17,24,39,0.05);
    min-height:100vh; background:transparent; color:var(--ink);
  }

  /* ── HEADER ── */
  .tb-header {
    display:flex; align-items:flex-start; justify-content:space-between;
    padding:24px 28px 0; flex-wrap:wrap; gap:14px;
  }
  .tb-live-pill {
    display:inline-flex; align-items:center; gap:6px;
    padding:3px 10px; background:rgba(255,255,255,0.35);
    border:1px solid rgba(255,255,255,0.5); border-radius:20px;
    font-size:9px; font-weight:700; color:#fff;
    font-family:'Space Mono',monospace; letter-spacing:.12em;
    text-transform:uppercase; margin-bottom:6px; width:fit-content;
  }
  .tb-live-dot { width:5px; height:5px; background:#4ade80; border-radius:50%; animation:pulse 2s ease infinite; }
  .tb-title { font-size:27px; font-weight:800; color:#fff; letter-spacing:-.04em; margin:0 0 2px; }
  .tb-sub   { font-size:12px; color:rgba(255,255,255,.65); margin:0; font-weight:300; }
  .tb-header-actions { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }

  .tb-btn-ghost {
    display:inline-flex; align-items:center; gap:6px; padding:8px 14px;
    background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.3);
    border-radius:9px; font-size:12px; font-weight:600; color:#fff;
    cursor:pointer; transition:all .15s; font-family:'Outfit',sans-serif;
  }
  .tb-btn-ghost:hover { background:rgba(255,255,255,.25); }
  .tb-btn-primary {
    display:inline-flex; align-items:center; gap:6px; padding:8px 16px;
    background:#fff; border:none; border-radius:9px;
    font-size:12px; font-weight:700; color:var(--blue);
    cursor:pointer; transition:all .15s; font-family:'Outfit',sans-serif;
    box-shadow:0 2px 12px rgba(0,0,0,.15);
  }
  .tb-btn-primary:hover { transform:translateY(-1px); box-shadow:0 4px 18px rgba(0,0,0,.2); }

  /* ── KPI ROW ── */
  .tb-kpi-row { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; padding:20px 28px 0; }
  @media(max-width:900px) { .tb-kpi-row { grid-template-columns:repeat(2,1fr); } }

  .tb-kpi {
    background:#fff; border:1px solid var(--border);
    border-radius:16px; padding:20px 20px 16px;
    box-shadow:0 1px 4px rgba(0,0,0,0.05), 0 4px 18px rgba(0,0,0,0.07);
    animation:fadeUp .4s ease both; position:relative; overflow:hidden;
  }
  .tb-kpi-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
  .tb-kpi-label { font-size:10.5px; font-weight:700; color:var(--ink3); letter-spacing:.09em; text-transform:uppercase; }
  .tb-kpi-icon { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; }
  .tb-kpi-val  { font-family:'Space Mono',monospace; font-size:22px; font-weight:700; letter-spacing:-.03em; margin-bottom:5px; line-height:1; }
  .tb-kpi-meta { font-size:12px; color:var(--ink4); font-weight:400; }
  .tb-kpi-bar  { position:absolute; bottom:0; left:0; right:0; height:3.5px; }

  /* ── BODY ── */
  .tb-body { padding:20px 28px 28px; display:flex; flex-direction:column; gap:16px; }
  @media(max-width:640px) {
    .tb-header { padding:16px 16px 0; }
    .tb-kpi-row { padding:16px 16px 0; }
    .tb-body    { padding:14px 16px 20px; }
  }

  /* ── CARD ── */
  .tb-card {
    background:#fff; border:1px solid var(--border); border-radius:16px;
    box-shadow:0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05);
    overflow:hidden; animation:fadeUp .5s ease both;
  }
  .tb-card-hd {
    padding:20px 22px 0;
    display:flex; align-items:flex-start; justify-content:space-between;
    margin-bottom:16px;
  }
  .tb-card-title { font-size:15px; font-weight:800; color:var(--ink); letter-spacing:-.03em; }
  .tb-card-sub   { font-size:12px; color:var(--ink4); margin-top:3px; }
  .tb-badge {
    font-size:10px; font-weight:700; padding:4px 10px; border-radius:20px;
    font-family:'Space Mono',monospace; letter-spacing:.05em; text-transform:uppercase;
    white-space:nowrap; flex-shrink:0;
  }

  /* ── TOOLBAR ── */
  .tb-toolbar { display:flex; align-items:center; gap:8px; padding:0 22px 16px; flex-wrap:wrap; }
  .tb-search-wrap { position:relative; flex:1; min-width:160px; max-width:280px; }
  .tb-search-icon { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--ink4); line-height:0; }
  .tb-search {
    width:100%; padding:8px 12px 8px 32px;
    background:var(--surface2); border:1.5px solid var(--border);
    border-radius:9px; font-size:12.5px; font-family:'Outfit',sans-serif;
    color:var(--ink); outline:none; transition:all .15s;
  }
  .tb-search::placeholder { color:var(--ink4); }
  .tb-search:focus { border-color:var(--blue); background:#fff; box-shadow:0 0 0 3px rgba(79,99,210,0.10); }

  .tb-filter-btn {
    display:inline-flex; align-items:center; gap:5px;
    padding:7px 13px; border:1.5px solid; border-radius:9px;
    font-size:11.5px; font-weight:700; cursor:pointer;
    transition:all .15s; font-family:'Outfit',sans-serif; white-space:nowrap;
  }
  .tb-filter-btn:hover { filter:brightness(0.93); }
  .tb-filter-btn.active { color:#fff !important; border-color:var(--blue) !important; background:var(--blue) !important; }

  /* ── BALANCE STATUS BANNER ── */
  .tb-banner {
    margin:0 22px 18px;
    border-radius:12px; padding:14px 18px;
    display:flex; align-items:center; gap:12px;
    border:1.5px solid;
  }
  .tb-banner.balanced   { background:#f0fdf4; border-color:#86efac; }
  .tb-banner.unbalanced { background:#fef2f2; border-color:#fca5a5; }
  .tb-banner-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .tb-banner.balanced   .tb-banner-icon { background:#dcfce7; }
  .tb-banner.unbalanced .tb-banner-icon { background:#fee2e2; }
  .tb-banner-title { font-size:13.5px; font-weight:800; letter-spacing:-.02em; }
  .tb-banner.balanced   .tb-banner-title { color:#15803d; }
  .tb-banner.unbalanced .tb-banner-title { color:#dc2626; }
  .tb-banner-sub { font-size:11.5px; color:var(--ink3); margin-top:2px; }
  .tb-banner-diff {
    margin-left:auto; font-family:'Space Mono',monospace;
    font-size:13px; font-weight:700;
  }
  .tb-banner.balanced   .tb-banner-diff { color:#15803d; }
  .tb-banner.unbalanced .tb-banner-diff { color:#dc2626; }

  /* ── MAIN TABLE ── */
  .tb-table-wrap { overflow-x:auto; }
  .tb-table { width:100%; border-collapse:collapse; font-size:12.5px; }

  /* Section group header */
  .tb-table .tb-group-row td {
    padding:10px 18px 6px;
    font-size:10px; font-weight:700; color:var(--ink4);
    letter-spacing:.13em; text-transform:uppercase;
    font-family:'Space Mono',monospace;
    background:var(--surface2);
    border-top:1px solid var(--border);
    border-bottom:1px solid var(--border2);
  }
  .tb-table .tb-group-row:first-child td { border-top:none; }

  .tb-table thead tr {
    background:var(--surface2);
    border-bottom:2px solid var(--border);
  }
  .tb-table th {
    padding:11px 18px; text-align:left;
    font-size:10.5px; font-weight:700; color:var(--ink3);
    letter-spacing:.08em; text-transform:uppercase; white-space:nowrap;
    cursor:pointer; user-select:none; transition:color .12s;
  }
  .tb-table th:hover { color:var(--blue); }
  .tb-table th.right { text-align:right; }

  .tb-table td { padding:13px 18px; border-bottom:1px solid var(--border2); vertical-align:middle; }
  .tb-table tbody tr:last-child td { border-bottom:none; }
  .tb-table tbody tr { transition:background .12s; }
  .tb-table tbody tr:nth-child(even) { background:rgba(249,250,251,0.7); }
  .tb-table tbody tr:hover { background:rgba(79,99,210,0.04) !important; }
  .tb-table td.right { text-align:right; }

  /* Subtotal rows per type */
  .tb-table .tb-subtotal-row td {
    padding:10px 18px; font-weight:700; font-size:12px;
    background:rgba(79,99,210,0.03);
    border-top:1.5px solid var(--border); border-bottom:1px solid var(--border);
    color:var(--ink2);
  }
  .tb-table .tb-subtotal-row td.right {
    text-align:right; font-family:'Space Mono',monospace;
  }

  /* Grand total row */
  .tb-table tfoot tr {
    border-top:3px double var(--border);
    background:rgba(79,99,210,0.05);
  }
  .tb-table tfoot td {
    padding:14px 18px; font-weight:800; font-size:13.5px; color:var(--ink);
  }
  .tb-table tfoot td.right { text-align:right; font-family:'Space Mono',monospace; }

  /* Cell helpers */
  .tb-acct-name { font-size:13px; font-weight:600; color:var(--ink); }
  .tb-acct-code { font-size:10px; color:var(--ink4); font-family:'Space Mono',monospace; display:block; margin-top:1px; }
  .tb-acct-badge {
    display:inline-flex; align-items:center; gap:5px;
    padding:3px 9px; border-radius:20px;
    font-size:10px; font-weight:700; white-space:nowrap;
    font-family:'Space Mono',monospace; letter-spacing:.03em;
  }
  .tb-acct-dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }

  .tb-amt-dr   { font-family:'Space Mono',monospace; font-size:13px; font-weight:700; color:#1d4ed8; }
  .tb-amt-cr   { font-family:'Space Mono',monospace; font-size:13px; font-weight:700; color:#6d28d9; }
  .tb-amt-zero { font-family:'Space Mono',monospace; font-size:13px; color:var(--ink4); }
  .tb-amt-dash { color:var(--ink4); font-size:13px; }

  /* SORT ICON */
  .tb-sort { display:inline-flex; flex-direction:column; margin-left:4px; opacity:.4; }
  .tb-sort.asc .tb-sort-up, .tb-sort.desc .tb-sort-dn { opacity:1; color:var(--blue); }

  /* SHIMMER */
  .tb-shimmer { height:18px; border-radius:5px; background:linear-gradient(90deg,#ececec 25%,#f5f5f5 50%,#ececec 75%); background-size:200% 100%; animation:shimmer 1.2s infinite; }

  /* EMPTY */
  .tb-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 20px; gap:10px; }
  .tb-empty p { font-size:12px; color:var(--ink4); margin:0; }

  /* SPINNER */
  .tb-spinner { width:18px; height:18px; border-radius:50%; border:2px solid #E5E7EB; border-top-color:var(--blue); animation:spin .7s linear infinite; }
  .tb-spinner-wrap { display:flex; justify-content:center; padding:48px; }

  /* DIVIDER */
  .tb-divider { height:1px; background:var(--border); margin:0 22px; }

  /* TYPE BREAKDOWN — small cards at bottom */
  .tb-breakdown-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:10px; padding:0 22px 20px; }
  @media(max-width:900px)  { .tb-breakdown-grid { grid-template-columns:repeat(3,1fr); } }
  @media(max-width:560px)  { .tb-breakdown-grid { grid-template-columns:repeat(2,1fr); } }
  .tb-breakdown-card {
    border-radius:12px; padding:14px 16px; border:1.5px solid var(--border);
    background:var(--surface2); transition:all .18s;
  }
  .tb-breakdown-card:hover { background:#fff; transform:translateY(-2px); box-shadow:0 4px 16px rgba(0,0,0,0.07); }
  .tb-breakdown-icon { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; margin-bottom:10px; }
  .tb-breakdown-type { font-size:9.5px; font-weight:700; color:var(--ink4); text-transform:uppercase; letter-spacing:.12em; font-family:'Space Mono',monospace; margin-bottom:4px; }
  .tb-breakdown-count { font-size:11px; color:var(--ink4); margin-bottom:8px; }
  .tb-breakdown-dr { font-family:'Space Mono',monospace; font-size:12px; font-weight:700; color:#1d4ed8; margin-bottom:3px; }
  .tb-breakdown-cr { font-family:'Space Mono',monospace; font-size:12px; font-weight:700; color:#6d28d9; }

  /* PAGINATION */
  .tb-pagination {
    display:flex; align-items:center; justify-content:space-between;
    padding:12px 22px; border-top:1px solid var(--border2);
  }
  .tb-pagination-info { font-size:11px; color:var(--ink3); font-family:'Space Mono',monospace; }
  .tb-pg-btn {
    padding:5px 12px; border-radius:7px; border:1px solid var(--border);
    background:var(--surface2); color:var(--blue);
    font-size:11px; font-weight:600; cursor:pointer; font-family:'Outfit',sans-serif;
    transition:all .12s;
  }
  .tb-pg-btn:disabled { color:var(--ink4); cursor:default; background:transparent; border-color:transparent; }
  .tb-pg-btn.active   { background:var(--blue); color:#fff; border-color:var(--blue); }
  .tb-pg-btn:not(:disabled):not(.active):hover { background:rgba(79,99,210,0.10); }
`;

/* ─── helpers ──────────────────────────────────────────────────────── */
const fmt = (v: number | string) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(
    typeof v === "string" ? parseFloat(v) : v
  );

const PAGE_SIZE = 30;
type SortKey = "name" | "type" | "debit" | "credit";
type SortDir = "asc" | "desc";

export default function TrialBalance() {
  const [, setLocation] = useLocation();
  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [sortKey,    setSortKey]    = useState<SortKey>("type");
  const [sortDir,    setSortDir]    = useState<SortDir>("asc");
  const [page,       setPage]       = useState(1);

  const { data, isLoading, refetch } = trpc.reports.trialBalance.useQuery();

  /* ── raw balances ── */
  const rawBalances: any[] = data?.balances ?? [];

  const totalDebits  = parseFloat(data?.totalDebits  ?? "0");
  const totalCredits = parseFloat(data?.totalCredits ?? "0");
  const isBalanced   = data?.isBalanced ?? false;
  const difference   = Math.abs(totalDebits - totalCredits);

  /* ── normalise: split balance into Dr / Cr columns ── */
  const normalisedRows = useMemo(() =>
    rawBalances.map((b: any) => {
      const bal = parseFloat(b.balance ?? "0");
      // Debit-normal: ASSET, EXPENSE → positive = Dr
      // Credit-normal: LIABILITY, EQUITY, REVENUE → positive = Cr
      const drNormal = ["ASSET", "EXPENSE"].includes(b.accountType);
      const drAmt = drNormal ? Math.max(0, bal)  : Math.max(0, -bal);
      const crAmt = drNormal ? Math.max(0, -bal) : Math.max(0, bal);
      return { ...b, drAmt, crAmt };
    }),
  [rawBalances]);

  /* ── filter + sort ── */
  const filtered = useMemo(() => {
    let list = [...normalisedRows];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.accountName?.toLowerCase().includes(q) ||
        (r.accountCode ?? "").toLowerCase().includes(q)
      );
    }
    if (typeFilter) list = list.filter(r => r.accountType === typeFilter);
    list.sort((a, b) => {
      let av: any, bv: any;
      if      (sortKey === "name")   { av = a.accountName;  bv = b.accountName; }
      else if (sortKey === "type")   { av = TYPE_ORDER.indexOf(a.accountType); bv = TYPE_ORDER.indexOf(b.accountType); }
      else if (sortKey === "debit")  { av = a.drAmt; bv = b.drAmt; }
      else                           { av = a.crAmt; bv = b.crAmt; }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ?  1 : -1;
      return 0;
    });
    return list;
  }, [normalisedRows, search, typeFilter, sortKey, sortDir]);

  const totalPages    = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedRows     = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ── per-type breakdown ── */
  const breakdown = useMemo(() =>
    TYPE_ORDER.map(type => {
      const rows = normalisedRows.filter(r => r.accountType === type);
      return {
        type,
        count:    rows.length,
        totalDr:  rows.reduce((s, r) => s + r.drAmt, 0),
        totalCr:  rows.reduce((s, r) => s + r.crAmt, 0),
      };
    }),
  [normalisedRows]);

  /* ── subtotals per type (for grouped view) ── */
  const subtotals = useMemo(() => {
    const map: Record<string, { dr: number; cr: number }> = {};
    for (const r of filtered) {
      if (!map[r.accountType]) map[r.accountType] = { dr: 0, cr: 0 };
      map[r.accountType].dr += r.drAmt;
      map[r.accountType].cr += r.crAmt;
    }
    return map;
  }, [filtered]);

  /* ── sort handler ── */
  const handleSort = (key: SortKey) => {
    setPage(1);
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => (
    <span className={`tb-sort ${sortKey === k ? sortDir : ""}`} style={{ verticalAlign: "middle" }}>
      <ChevronUp   size={10} className="tb-sort-up" style={{ display:"block", marginBottom:-2 }} />
      <ChevronDown size={10} className="tb-sort-dn" style={{ display:"block" }} />
    </span>
  );

  /* ── grand totals of filtered set ── */
  const filteredDrTotal = filtered.reduce((s, r) => s + r.drAmt, 0);
  const filteredCrTotal = filtered.reduce((s, r) => s + r.crAmt, 0);

  /* ── render rows grouped by type ── */
  const renderGroupedRows = () => {
    const groups: Record<string, any[]> = {};
    for (const r of pagedRows) {
      if (!groups[r.accountType]) groups[r.accountType] = [];
      groups[r.accountType].push(r);
    }

    const els: React.ReactNode[] = [];

    for (const type of TYPE_ORDER) {
      if (!groups[type]) continue;
      const m = TYPE_META[type];
      const sub = subtotals[type] ?? { dr: 0, cr: 0 };

      // Group header
      els.push(
        <tr key={`grp-${type}`} className="tb-group-row">
          <td colSpan={4}>
            <span style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:m.dot }} />
              {type}
              <span style={{ fontSize:9, color:m.text, background:m.bg, padding:"1px 7px", borderRadius:20, marginLeft:2 }}>
                {groups[type].length} account{groups[type].length !== 1 ? "s" : ""}
              </span>
            </span>
          </td>
        </tr>
      );

      // Account rows
      for (const r of groups[type]) {
        els.push(
          <tr key={r.accountId ?? r.accountName}>
            <td>
              <div className="tb-acct-name">{r.accountName}</div>
              {r.accountCode && <span className="tb-acct-code">{r.accountCode}</span>}
            </td>
            <td>
              <span className="tb-acct-badge" style={{ background:m.bg, color:m.text }}>
                <span className="tb-acct-dot" style={{ background:m.dot }} />
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </span>
            </td>
            <td className="right">
              {r.drAmt > 0
                ? <span className="tb-amt-dr">{fmt(r.drAmt)}</span>
                : <span className="tb-amt-dash">—</span>}
            </td>
            <td className="right">
              {r.crAmt > 0
                ? <span className="tb-amt-cr">{fmt(r.crAmt)}</span>
                : <span className="tb-amt-dash">—</span>}
            </td>
          </tr>
        );
      }

      // Subtotal row
      els.push(
        <tr key={`sub-${type}`} className="tb-subtotal-row">
          <td colSpan={2} style={{ color:m.text }}>
            {type.charAt(0) + type.slice(1).toLowerCase()} Subtotal
          </td>
          <td className="right">
            {sub.dr > 0 ? <span className="tb-amt-dr">{fmt(sub.dr)}</span> : <span className="tb-amt-dash">—</span>}
          </td>
          <td className="right">
            {sub.cr > 0 ? <span className="tb-amt-cr">{fmt(sub.cr)}</span> : <span className="tb-amt-dash">—</span>}
          </td>
        </tr>
      );
    }

    return els;
  };

  /* ── print / export CSV ── */
  const exportCsv = () => {
    const header = ["Account Name", "Account Code", "Type", "Debit (Dr)", "Credit (Cr)"];
    const rows = normalisedRows.map(r => [
      r.accountName, r.accountCode ?? "", r.accountType,
      r.drAmt.toFixed(2), r.crAmt.toFixed(2),
    ]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `trial-balance-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  return (
    <div className="tb">
      <style>{css}</style>

      {/* ── HEADER ── */}
      <div className="tb-header">
        <div>
          <div className="tb-live-pill"><span className="tb-live-dot" /> Live</div>
          <h1 className="tb-title">Trial Balance</h1>
          <p className="tb-sub">Debit and credit totals across all accounts</p>
        </div>
        <div className="tb-header-actions">
          <button className="tb-btn-ghost" onClick={exportCsv}><Download size={12} /> Export CSV</button>
          <button className="tb-btn-ghost" onClick={() => refetch()}><RefreshCw size={12} /> Refresh</button>
          <button className="tb-btn-primary" onClick={() => setLocation("/transaction")}><Plus size={13} /> New Entry</button>
        </div>
      </div>

      {/* ── KPI ROW ── */}
      <div className="tb-kpi-row">
        {/* Accounts */}
        <div className="tb-kpi" style={{ animationDelay:"0s" }}>
          <div className="tb-kpi-top">
            <span className="tb-kpi-label">Accounts</span>
            <div className="tb-kpi-icon" style={{ background:"#eef2ff" }}>
              <Scale size={15} color="#4F63D2" />
            </div>
          </div>
          {isLoading
            ? <div className="tb-shimmer" style={{ width:"50%", marginBottom:6 }} />
            : <div className="tb-kpi-val" style={{ color:"#4F63D2" }}>{rawBalances.length}</div>}
          <div className="tb-kpi-meta">{filtered.length} matching filter</div>
          <div className="tb-kpi-bar" style={{ background:"linear-gradient(90deg,#4F63D2,#6B7FE3)" }} />
        </div>

        {/* Total Debits */}
        <div className="tb-kpi" style={{ animationDelay:"0.07s" }}>
          <div className="tb-kpi-top">
            <span className="tb-kpi-label">Total Debits</span>
            <div className="tb-kpi-icon" style={{ background:"#dbeafe" }}>
              <TrendingDown size={15} color="#1d4ed8" />
            </div>
          </div>
          {isLoading
            ? <div className="tb-shimmer" style={{ width:"70%", marginBottom:6 }} />
            : <div className="tb-kpi-val" style={{ color:"#1d4ed8" }}>{fmt(totalDebits)}</div>}
          <div className="tb-kpi-meta">Sum of all Dr balances</div>
          <div className="tb-kpi-bar" style={{ background:"linear-gradient(90deg,#1d4ed8,#3b82f6)" }} />
        </div>

        {/* Total Credits */}
        <div className="tb-kpi" style={{ animationDelay:"0.14s" }}>
          <div className="tb-kpi-top">
            <span className="tb-kpi-label">Total Credits</span>
            <div className="tb-kpi-icon" style={{ background:"#ede9fe" }}>
              <TrendingUp size={15} color="#6d28d9" />
            </div>
          </div>
          {isLoading
            ? <div className="tb-shimmer" style={{ width:"70%", marginBottom:6 }} />
            : <div className="tb-kpi-val" style={{ color:"#6d28d9" }}>{fmt(totalCredits)}</div>}
          <div className="tb-kpi-meta">Sum of all Cr balances</div>
          <div className="tb-kpi-bar" style={{ background:"linear-gradient(90deg,#6d28d9,#8b5cf6)" }} />
        </div>

        {/* Balance Status */}
        <div className="tb-kpi" style={{ animationDelay:"0.21s" }}>
          <div className="tb-kpi-top">
            <span className="tb-kpi-label">Status</span>
            <div className="tb-kpi-icon" style={{ background: isBalanced ? "#dcfce7" : "#fee2e2" }}>
              {isBalanced
                ? <CheckCircle2 size={15} color="#15803d" />
                : <XCircle     size={15} color="#dc2626" />}
            </div>
          </div>
          {isLoading
            ? <div className="tb-shimmer" style={{ width:"60%", marginBottom:6 }} />
            : <div className="tb-kpi-val" style={{ color: isBalanced ? "#15803d" : "#dc2626" }}>
                {isBalanced ? "✓ Balanced" : "✗ Off"}
              </div>}
          <div className="tb-kpi-meta">
            {isBalanced ? "Debits = Credits" : `Δ ${fmt(difference)}`}
          </div>
          <div className="tb-kpi-bar" style={{ background: isBalanced
            ? "linear-gradient(90deg,#15803d,#22c55e)"
            : "linear-gradient(90deg,#dc2626,#ef4444)" }} />
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="tb-body">

        {/* ── MAIN TABLE CARD ── */}
        <div className="tb-card" style={{ animationDelay:"0.05s" }}>
          <div className="tb-card-hd">
            <div>
              <div className="tb-card-title">Trial Balance</div>
              <div className="tb-card-sub">
                All accounts grouped by type · debit and credit columns
              </div>
            </div>
            <span
              className="tb-badge"
              style={isBalanced
                ? { background:"#dcfce7", color:"#15803d", border:"1px solid #86efac" }
                : { background:"#fee2e2", color:"#dc2626", border:"1px solid #fca5a5" }}
            >
              {isBalanced ? "✓ BALANCED" : "✗ UNBALANCED"}
            </span>
          </div>

          {/* Balance status banner */}
          {!isLoading && (
            <div className={`tb-banner ${isBalanced ? "balanced" : "unbalanced"}`}>
              <div className="tb-banner-icon">
                {isBalanced
                  ? <CheckCircle2 size={18} color="#15803d" />
                  : <XCircle     size={18} color="#dc2626" />}
              </div>
              <div>
                <div className="tb-banner-title">
                  {isBalanced ? "Books are balanced" : "Discrepancy detected"}
                </div>
                <div className="tb-banner-sub">
                  {isBalanced
                    ? "Total debits equal total credits — double-entry is intact."
                    : `Debits and credits are out of balance by ${fmt(difference)}.`}
                </div>
              </div>
              <div className="tb-banner-diff">
                {isBalanced ? fmt(totalDebits) : `Δ ${fmt(difference)}`}
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="tb-toolbar">
            <div className="tb-search-wrap">
              <span className="tb-search-icon"><Search size={12} /></span>
              <input
                className="tb-search"
                placeholder="Search accounts…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            {(["ASSET","LIABILITY","EQUITY","REVENUE","EXPENSE"] as const).map(t => {
              const m = TYPE_META[t];
              return (
                <button
                  key={t}
                  className={`tb-filter-btn ${typeFilter === t ? "active" : ""}`}
                  onClick={() => { setTypeFilter(typeFilter === t ? null : t); setPage(1); }}
                  style={typeFilter === t ? {} : { color:m.text, borderColor:m.dot, background:m.bg }}
                >
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              );
            })}
          </div>

          <div className="tb-divider" />

          {isLoading ? (
            <div className="tb-spinner-wrap"><div className="tb-spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="tb-empty">
              <BookOpen size={28} color="#E5E7EB" />
              <p>{search || typeFilter ? "No accounts match your filter." : "No accounts found."}</p>
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
              <div className="tb-table-wrap">
                <table className="tb-table">
                  <thead>
                    <tr>
                      <th style={{ width:"38%" }} onClick={() => handleSort("name")}>
                        Account Name <SortIcon k="name" />
                      </th>
                      <th onClick={() => handleSort("type")}>
                        Type <SortIcon k="type" />
                      </th>
                      <th className="right" onClick={() => handleSort("debit")}>
                        Debit (Dr) <SortIcon k="debit" />
                      </th>
                      <th className="right" onClick={() => handleSort("credit")}>
                        Credit (Cr) <SortIcon k="credit" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderGroupedRows()}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={2}>Grand Total</td>
                      <td className="right">
                        <span style={{ color:"#1d4ed8", fontFamily:"'Space Mono',monospace" }}>
                          {fmt(filteredDrTotal)}
                        </span>
                      </td>
                      <td className="right">
                        <span style={{ color:"#6d28d9", fontFamily:"'Space Mono',monospace" }}>
                          {fmt(filteredCrTotal)}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="tb-pagination">
                  <span className="tb-pagination-info">
                    {((page-1)*PAGE_SIZE)+1}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}
                  </span>
                  <div style={{ display:"flex", gap:4 }}>
                    <button className="tb-pg-btn" disabled={page===1} onClick={() => setPage(p=>p-1)}>← Prev</button>
                    {Array.from({ length: Math.min(totalPages,5) }, (_,i) => {
                      const pg = totalPages<=5 ? i+1 : page<=3 ? i+1 : page>=totalPages-2 ? totalPages-4+i : page-2+i;
                      return (
                        <button key={pg} className={`tb-pg-btn ${pg===page?"active":""}`} onClick={()=>setPage(pg)}>{pg}</button>
                      );
                    })}
                    <button className="tb-pg-btn" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>Next →</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── TYPE BREAKDOWN CARDS ── */}
        {!isLoading && breakdown.some(b => b.count > 0) && (
          <div className="tb-card" style={{ animationDelay:"0.15s" }}>
            <div className="tb-card-hd">
              <div>
                <div className="tb-card-title">By Account Type</div>
                <div className="tb-card-sub">Debit and credit totals per category</div>
              </div>
            </div>
            <div className="tb-breakdown-grid">
              {breakdown.filter(b => b.count > 0).map(b => {
                const m = TYPE_META[b.type];
                return (
                  <div
                    key={b.type}
                    className="tb-breakdown-card"
                    style={{ borderColor: typeFilter === b.type ? m.dot : undefined }}
                    onClick={() => { setTypeFilter(typeFilter === b.type ? null : b.type); setPage(1); }}
                  >
                    <div className="tb-breakdown-icon" style={{ background:m.bg }}>
                      <span style={{ width:10, height:10, borderRadius:"50%", background:m.dot, display:"block" }} />
                    </div>
                    <div className="tb-breakdown-type">{b.type}</div>
                    <div className="tb-breakdown-count">{b.count} account{b.count!==1?"s":""}</div>
                    <div className="tb-breakdown-dr">Dr: {fmt(b.totalDr)}</div>
                    <div className="tb-breakdown-cr">Cr: {fmt(b.totalCr)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
