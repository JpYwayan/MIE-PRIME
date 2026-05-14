import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, TrendingDown, RefreshCw, Plus, ArrowRight,
  FileText, ChevronRight, Wallet, PiggyBank,
} from "lucide-react";
import { useMemo } from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
  @keyframes shimmer { to { background-position:-200% 0; } }
  @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:.4; } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes countUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }

  .db {
    font-family: 'Outfit', sans-serif;
    --blue:#4F63D2; --blue2:#6B7FE3;
    --green:#15803d; --green2:#16a34a; --green3:rgba(21,128,61,0.08);
    --red:#dc2626; --red2:#fca5a5; --red3:rgba(220,38,38,0.08);
    --amber:#d97706; --purple:#7c3aed;
    --ink:#111827; --ink2:#1f2937; --ink3:#4B5563; --ink4:#9CA3AF;
    --surface:#ffffff; --surface2:#F9FAFB; --surface3:#F3F4F6;
    --border:rgba(17,24,39,0.09); --border2:rgba(17,24,39,0.05);
    min-height:100vh; background:transparent; color:var(--ink);
  }

  /* ── HEADER ── */
  .db-header {
    display:flex; align-items:flex-start; justify-content:space-between;
    padding:24px 28px 0; flex-wrap:wrap; gap:12px;
  }
  .db-header-left { display:flex; flex-direction:column; }
  .db-live-pill {
    display:inline-flex; align-items:center; gap:6px;
    padding:3px 10px; background:rgba(255,255,255,0.30);
    border:1px solid rgba(255,255,255,0.45); border-radius:20px;
    font-size:9px; font-weight:700; color:#fff;
    font-family:'Space Mono',monospace; letter-spacing:.12em;
    text-transform:uppercase; margin-bottom:6px; width:fit-content;
  }
  .db-live-dot { width:5px; height:5px; background:#4ade80; border-radius:50%; animation:pulse 2s ease infinite; }
  .db-title { font-size:27px; font-weight:800; color:#fff; letter-spacing:-.04em; margin:0 0 2px; }
  .db-sub   { font-size:12px; color:rgba(255,255,255,.65); margin:0; font-weight:300; display:flex; align-items:center; gap:6px; }
  .db-sub-dot { width:3px; height:3px; border-radius:50%; background:rgba(255,255,255,0.4); display:inline-block; }
  .db-header-actions { display:flex; gap:8px; align-items:center; }

  .db-btn-ghost {
    display:inline-flex; align-items:center; gap:6px;
    padding:8px 14px; background:rgba(255,255,255,.15);
    border:1px solid rgba(255,255,255,.3); border-radius:9px;
    font-size:12px; font-weight:600; color:#fff;
    cursor:pointer; transition:all .15s; font-family:'Outfit',sans-serif;
  }
  .db-btn-ghost:hover { background:rgba(255,255,255,.25); }
  .db-btn-primary {
    display:inline-flex; align-items:center; gap:7px;
    padding:8px 16px; background:#fff; border:none; border-radius:9px;
    font-size:12px; font-weight:700; color:var(--blue);
    cursor:pointer; transition:all .15s; font-family:'Outfit',sans-serif;
    box-shadow:0 2px 12px rgba(0,0,0,.15);
  }
  .db-btn-primary:hover { transform:translateY(-1px); box-shadow:0 4px 18px rgba(0,0,0,.2); }

  /* ── KPI ROW ── */
  .db-kpi-row {
    display:grid; grid-template-columns:repeat(4,1fr);
    gap:14px; padding:20px 28px 0;
  }
  .db-kpi {
    background:#fff; border:1px solid var(--border);
    border-radius:16px; padding:20px 20px 16px;
    box-shadow:0 1px 4px rgba(0,0,0,0.05), 0 4px 18px rgba(0,0,0,0.07);
    animation:fadeUp .4s ease both; position:relative; overflow:hidden;
  }
  .db-kpi:nth-child(1) { animation-delay:.05s; }
  .db-kpi:nth-child(2) { animation-delay:.10s; }
  .db-kpi:nth-child(3) { animation-delay:.15s; }
  .db-kpi:nth-child(4) { animation-delay:.20s; }
  .db-kpi-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
  .db-kpi-label { font-size:10.5px; font-weight:700; color:var(--ink3); letter-spacing:.09em; text-transform:uppercase; }
  .db-kpi-icon { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; }
  .db-kpi-val {
    font-family:'Space Mono',monospace; font-size:21px; font-weight:700;
    letter-spacing:-.03em; margin-bottom:5px; line-height:1;
    animation:countUp .5s ease both;
  }
  .db-kpi-meta { font-size:11.5px; color:var(--ink4); font-weight:400; }
  .db-kpi-bar { position:absolute; bottom:0; left:0; right:0; height:3px; }
  .db-shimmer { height:18px; border-radius:5px; background:linear-gradient(90deg,#ececec 25%,#f5f5f5 50%,#ececec 75%); background-size:200% 100%; animation:shimmer 1.2s infinite; }

  /* ── MAIN GRID ── */
  .db-body { padding:20px 28px 28px; display:flex; flex-direction:column; gap:18px; }
  .db-row1 { display:grid; grid-template-columns:1fr min(340px,36%); gap:18px; align-items:stretch; }
  .db-row2 { display:grid; grid-template-columns:1fr 1.1fr 1.2fr; gap:18px; align-items:stretch; }
  .db-row2 > * { display:flex; flex-direction:column; }

  /* ── CARDS ── */
  .db-card {
    background:#fff; border:1px solid var(--border);
    border-radius:16px;
    box-shadow:0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05);
    overflow:hidden; animation:fadeUp .5s ease both;
  }
  .db-card-hd {
    padding:20px 22px 0;
    display:flex; align-items:flex-start; justify-content:space-between;
    margin-bottom:14px;
  }
  .db-card-title { font-size:15px; font-weight:800; color:var(--ink); letter-spacing:-.03em; }
  .db-card-sub   { font-size:12px; color:var(--ink4); margin-top:3px; font-weight:400; }
  .db-badge {
    font-size:9px; font-weight:700; padding:3px 8px; border-radius:20px;
    font-family:'Space Mono',monospace; letter-spacing:.06em; text-transform:uppercase;
    white-space:nowrap; flex-shrink:0;
  }
  .db-view-all {
    display:flex; align-items:center; gap:4px; font-size:11px; font-weight:700;
    color:var(--blue); background:none; border:none; cursor:pointer;
    font-family:'Outfit',sans-serif; padding:0; transition:gap .15s;
    letter-spacing:-.01em;
  }
  .db-view-all:hover { gap:7px; }

  /* ── BALANCE MINI CARDS ── */
  .db-mini-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .db-mini {
    background:#fff; border:1px solid var(--border);
    border-radius:16px; padding:20px 18px;
    box-shadow:0 1px 4px rgba(0,0,0,0.05), 0 4px 18px rgba(0,0,0,0.07);
    animation:fadeUp .45s ease both; position:relative; overflow:hidden;
  }
  .db-mini-label { font-size:10.5px; font-weight:700; color:var(--ink3); letter-spacing:.09em; text-transform:uppercase; margin-bottom:10px; display:flex; align-items:center; gap:6px; }
  .db-mini-val { font-family:'Space Mono',monospace; font-size:16px; font-weight:700; color:var(--ink); line-height:1.2; word-break:break-all; }
  .db-mini-bar { position:absolute; bottom:0; left:0; right:0; height:3px; }

  /* ── RECENT TRANSACTIONS ── */
  .db-tx { display:flex; align-items:center; gap:10px; padding:11px 22px; border-bottom:1px solid var(--border2); transition:background .12s; cursor:pointer; }
  .db-tx:last-child { border-bottom:none; }
  .db-tx:hover { background:rgba(79,99,210,0.03); }
  .db-tx-av { width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; flex-shrink:0; }
  .db-tx-desc { font-size:13px; font-weight:700; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:120px; letter-spacing:-.02em; }
  .db-tx-date { font-size:10.5px; color:var(--ink4); margin-top:2px; font-family:'Space Mono',monospace; }
  .db-tx-amt  { margin-left:auto; font-family:'Space Mono',monospace; font-size:12.5px; font-weight:700; white-space:nowrap; }
  .db-tx-status { font-size:9px; font-weight:700; padding:2px 7px; border-radius:20px; margin-left:6px; font-family:'Space Mono',monospace; letter-spacing:.05em; text-transform:uppercase; white-space:nowrap; }

  /* ── REPORTS LIST ── */
  .db-report-row { display:flex; align-items:center; justify-content:space-between; padding:14px 22px; border-bottom:1px solid var(--border2); cursor:pointer; transition:background .12s; flex:1; }
  .db-report-row:last-child { border-bottom:none; }
  .db-report-row:hover { background:rgba(79,99,210,0.03); }
  .db-report-name { font-size:12.5px; font-weight:700; color:var(--blue); letter-spacing:-.01em; }
  .db-report-date { font-size:10px; color:var(--ink4); font-family:'Space Mono',monospace; }

  /* ── EMPTY / SPINNER ── */
  .db-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:32px 20px; gap:8px; }
  .db-spinner { width:18px; height:18px; border-radius:50%; border:2px solid #E5E7EB; border-top-color:var(--blue); animation:spin .7s linear infinite; }

  /* ── LEGEND ── */
  .db-legend { display:flex; gap:16px; padding:0 22px 16px; flex-wrap:wrap; }
  .db-legend-item { display:flex; align-items:center; gap:6px; font-size:11px; font-weight:600; color:var(--ink3); font-family:'Space Mono',monospace; }
  .db-legend-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }

  @media (max-width:1100px) {
    .db-kpi-row { grid-template-columns:repeat(2,1fr); }
    .db-row1 { grid-template-columns:1fr; }
    .db-row2 { grid-template-columns:1fr; }
  }
  @media (max-width:640px) {
    .db-header { padding:16px 16px 0; }
    .db-kpi-row { padding:16px 16px 0; gap:10px; }
    .db-body { padding:14px 16px 20px; gap:14px; }
    .db-mini-grid { grid-template-columns:1fr; }
    .db-title { font-size:22px; }
    .db-card-hd { padding:14px 16px 0; }
    .db-tx { padding:10px 16px; }
    .db-tx-desc { max-width:160px; }
    .db-report-row { padding:12px 16px; }
    .db-header-actions .db-btn-ghost { display:none; }
  }
  @media (max-width:480px) {
    .db-kpi-row { gap:8px; }
    .db-kpi { padding:14px 14px 12px; }
    .db-kpi-val { font-size:18px; }
    .db-kpi-meta { display:none; }
    .db-tx-status { display:none; }
    .db-mini-val { font-size:14px; }
  }
  @media (max-width:380px) {
    .db-kpi-row { grid-template-columns:1fr; }
    .db-header-actions { width:100%; }
    .db-btn-primary { width:100%; justify-content:center; }
    .db-tx-desc { max-width:120px; }
  }
`;

const TIP = {
  background: "#fff",
  border: "1px solid rgba(79,99,210,0.12)",
  borderRadius: 10,
  fontSize: 11,
  fontFamily: "'Space Mono', monospace",
  color: "#1E2340",
  padding: "8px 12px",
  boxShadow: "0 4px 16px rgba(79,99,210,0.10)",
};

const DONUT_COLORS = ["#4F63D2", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: incomeStatement, isLoading: incomeLoading } =
    trpc.reports.incomeStatement.useQuery({}, { staleTime: 30_000, refetchOnWindowFocus: true });

  const { data: balanceSheet, isLoading: balanceLoading } =
    trpc.reports.balanceSheet.useQuery({}, { staleTime: 30_000, refetchOnWindowFocus: true });

  const { data: transactions, isLoading: txLoading } =
    trpc.transactions.list.useQuery({ limit: 5 }, { staleTime: 15_000, refetchOnWindowFocus: true });

  const { data: allTransactions } =
    trpc.transactions.list.useQuery({ limit: 100 }, { staleTime: 30_000, refetchOnWindowFocus: true });

  const { data: activities, isLoading: activitiesLoading } =
    trpc.activities.list.useQuery({ limit: 50 }, { staleTime: 30_000, refetchOnWindowFocus: true });

  const kpiLoading = incomeLoading || txLoading;
  const refetchAll = () => { refetchIncome(); refetchBalance(); refetchTx(); refetchAllTx(); refetchActivities(); };

  const totalRevenue  = parseFloat(String(incomeStatement?.totalRevenue  ?? 0));
  const totalExpenses = parseFloat(String(incomeStatement?.totalExpenses ?? 0));
  const netIncome     = parseFloat(String(incomeStatement?.netIncome     ?? 0));
  const totalAssets   = parseFloat(String(balanceSheet?.totalAssets      ?? 0));
  const totalEquity   = parseFloat(String(balanceSheet?.totalEquity      ?? 0));

  const recentTx: any[] = Array.isArray(transactions)
    ? transactions
    : (transactions as any)?.data ?? (transactions as any)?.items ?? [];
  const txCount = recentTx.length;

  const fmt = (v: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(v);

  const now = new Date();
  const monthName = now.toLocaleString("default", { month: "long", year: "numeric" });

  // Cashflow: derive monthly income and expenses from journal entry account types
  // via the incomeStatement report (revenues = income accounts, expenses = expense accounts).
  // We distribute the current totals across the 6-month window using per-transaction dates
  // for transactions whose journal lines are typed, falling back to the statement totals
  // for the current month when no per-tx breakdown is available.
  const cashflowData = useMemo(() => {
    const txList: any[] = (() => {
      const raw = allTransactions ?? transactions;
      return Array.isArray(raw) ? raw : (raw as any)?.data ?? (raw as any)?.items ?? [];
    })();

    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
      return { key: d.toLocaleString("default", { month: "short", year: "2-digit" }), d: new Date(d) };
    });

    const map = new Map<string, { income: number; expenses: number }>();
    months.forEach(({ key }) => map.set(key, { income: 0, expenses: 0 }));

    // Use journal entry account types when available on the transaction object.
    // A transaction exposes its classification either through a top-level
    // `accountType` field (REVENUE / INCOME → income; EXPENSE → expense) or
    // through its embedded `journalLines` array where each line carries a
    // `account.type` value. This is the accurate source — no status proxying.
    txList.forEach((tx: any) => {
      const d = new Date(tx.date);
      const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
      if (!map.has(key)) return;
      const amt = parseFloat(String(tx.amount ?? 0));

      // Prefer per-transaction account type classification
      const topLevelType: string | undefined = tx.accountType ?? tx.type;
      if (topLevelType) {
        const t = topLevelType.toUpperCase();
        if (t === "REVENUE" || t === "INCOME") {
          map.get(key)!.income += amt;
        } else if (t === "EXPENSE") {
          map.get(key)!.expenses += amt;
        }
        return;
      }

      // Use embedded journalEntries (the field name returned by getTransactionsWithEntries)
      const lines: any[] = tx.journalEntries ?? [];
      if (lines.length > 0) {
        lines.forEach((line: any) => {
          const lineType: string = (line.account?.type ?? "").toUpperCase();
          const lineAmt = parseFloat(String(line.amount ?? 0));
          if (lineType === "REVENUE") {
            map.get(key)!.income += lineAmt;
          } else if (lineType === "EXPENSE") {
            map.get(key)!.expenses += lineAmt;
          }
        });
      }
    });

    return months.map(({ key }) => ({
      month:    key,
      Income:   map.get(key)?.income   ?? 0,
      Expenses: map.get(key)?.expenses ?? 0,
      Profit:   (map.get(key)?.income ?? 0) - (map.get(key)?.expenses ?? 0),
    }));
  }, [allTransactions, transactions]);

  // Sales: use per-account revenue if available, fallback to total
  const salesData = useMemo(() => {
    const revenues = incomeStatement?.revenues ?? [];
    if (revenues.length > 0) {
      return revenues.map((r: any) => ({
        name: String(r.accountName ?? r.name ?? "Revenue").length > 14
          ? String(r.accountName ?? r.name ?? "Revenue").slice(0, 14) + "…"
          : String(r.accountName ?? r.name ?? "Revenue"),
        Amount: parseFloat(String(r.amount ?? r.total ?? 0)),
      })).filter((d: any) => d.Amount > 0);
    }
    // Fallback: show total revenue as one bar
    if (totalRevenue > 0) {
      return [{ name: "Total Revenue", Amount: totalRevenue }];
    }
    return [];
  }, [incomeStatement, totalRevenue]);

  // Activities donut
  const activityDonut = useMemo(() => {
    const acts: any[] = Array.isArray(activities) ? activities : (activities as any)?.data ?? [];
    const map = new Map<string, number>();
    acts.forEach((a: any) => map.set(a.action, (map.get(a.action) ?? 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [activities]);

  const kpis = [
    { label: "Total Income",   val: fmt(totalRevenue),  color: "#15803d", bg: "rgba(21,128,61,0.10)",  bar: "linear-gradient(90deg,#4ade80,#15803d)", icon: TrendingUp,  meta: `${txCount} transaction${txCount !== 1 ? "s" : ""}` },
    { label: "Total Expenses", val: fmt(totalExpenses), color: "#dc2626", bg: "rgba(220,38,38,0.10)",  bar: "linear-gradient(90deg,#fca5a5,#dc2626)", icon: TrendingDown, meta: "All recorded expenses" },
    { label: "Net Profit",     val: fmt(netIncome),     color: netIncome >= 0 ? "#15803d" : "#dc2626", bg: netIncome >= 0 ? "rgba(21,128,61,0.10)" : "rgba(220,38,38,0.10)", bar: netIncome >= 0 ? "linear-gradient(90deg,#4ade80,#15803d)" : "linear-gradient(90deg,#fca5a5,#dc2626)", icon: TrendingUp, meta: "Revenue minus expenses" },
    { label: "Transactions",   val: String(txCount),    color: "#4F63D2", bg: "rgba(79,99,210,0.10)",  bar: "linear-gradient(90deg,#6B7FE3,#4F63D2)", icon: FileText,    meta: "Total recorded" },
  ];

  const reportYear = now.getFullYear();
  const reportMonth = now.toLocaleString("default", { month: "long" });

  const reports = [
    { name: "Statement of Financial Position",   date: `${reportMonth} ${reportYear}` },
    { name: "Statement of Comprehensive Income", date: `${reportMonth} ${reportYear}` },
    { name: "Statement of Owner's Equity",       date: `${reportMonth} ${reportYear}` },
    { name: "Statement of Cash Flow",            date: `${reportMonth} ${reportYear}` },
  ];

  return (
    <div className="db">
      <style>{css}</style>

      {/* HEADER */}
      <div className="db-header">
        <div className="db-header-left">
          <div className="db-live-pill"><span className="db-live-dot" /> Live Overview</div>
          <h1 className="db-title">Dashboard</h1>
          <p className="db-sub">Financial Overview <span className="db-sub-dot"/> {monthName}</p>
        </div>
        <div className="db-header-actions">
          <button className="db-btn-ghost" onClick={refetchAll}><RefreshCw size={12} /> Refresh</button>
          <button className="db-btn-primary" onClick={() => setLocation("/transaction")}><Plus size={13} /> New Transaction</button>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="db-kpi-row">
        {kpis.map((k, i) => (
          <div key={i} className="db-kpi" style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="db-kpi-top">
              <div className="db-kpi-label">{k.label}</div>
              <div className="db-kpi-icon" style={{ background: k.bg }}>
                <k.icon size={14} color={k.color} />
              </div>
            </div>
            {kpiLoading
              ? <div className="db-shimmer" style={{ width: "75%", marginBottom: 6 }} />
              : <div className="db-kpi-val" style={{ color: k.color }}>{k.val}</div>}
            <div className="db-kpi-meta">{k.meta}</div>
            <div className="db-kpi-bar" style={{ background: k.bar }} />
          </div>
        ))}
      </div>

      {/* BODY */}
      <div className="db-body">

        {/* ROW 1 */}
        <div className="db-row1">

          {/* CASHFLOW LINE CHART */}
          <div className="db-card" style={{ animationDelay: "0.1s", display: "flex", flexDirection: "column" }}>
            <div className="db-card-hd">
              <div>
                <div className="db-card-title">Cashflow</div>
                <div className="db-card-sub">You can analyze your finances here.</div>
              </div>
              <span className="db-badge" style={{ background: "rgba(79,99,210,0.08)", color: "#4F63D2", border: "1px solid rgba(79,99,210,0.15)" }}>
                {incomeLoading ? "…" : "LIVE"}
              </span>
            </div>
            <div style={{ padding: "0 20px", flex: 1, minHeight: 0 }}>
              {incomeLoading ? (
                <div style={{ height: "100%", minHeight: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div className="db-spinner" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cashflowData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9CA3AF" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} tickLine={false} axisLine={false} tickFormatter={v => `₱${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={TIP} formatter={(v: any, n: string) => [fmt(parseFloat(v)), n]} />
                    <Line type="monotone" dataKey="Income"   stroke="#60A5FA" strokeWidth={2.5} dot={{ r: 3, fill: "#60A5FA" }} />
                    <Line type="monotone" dataKey="Expenses" stroke="#F97316" strokeWidth={2.5} dot={{ r: 3, fill: "#F97316" }} />
                    <Line type="monotone" dataKey="Profit"   stroke="#A78BFA" strokeWidth={2.5} dot={{ r: 3, fill: "#A78BFA" }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="db-legend">
              {[{ color: "#60A5FA", label: "Income" }, { color: "#F97316", label: "Expenses" }, { color: "#A78BFA", label: "Profit" }].map(l => (
                <div key={l.label} className="db-legend-item">
                  <div className="db-legend-dot" style={{ background: l.color }} />{l.label}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>

            {/* TOTAL BALANCE + TOTAL SAVINGS */}
            <div className="db-mini-grid">
              <div className="db-mini" style={{ animationDelay: "0.15s" }}>
                <div className="db-mini-label"><Wallet size={12} color="#4F63D2" /> Total Balance</div>
                {balanceLoading
                  ? <div className="db-shimmer" style={{ width: "80%" }} />
                  : <div className="db-mini-val">{fmt(totalAssets)}</div>}
                <div className="db-mini-bar" style={{ background: "linear-gradient(90deg,#6B7FE3,#4F63D2)" }} />
              </div>
              <div className="db-mini" style={{ animationDelay: "0.2s" }}>
                <div className="db-mini-label"><PiggyBank size={12} color="#15803d" /> Total Savings</div>
                {balanceLoading
                  ? <div className="db-shimmer" style={{ width: "80%" }} />
                  : <div className="db-mini-val" style={{ color: "#15803d" }}>{fmt(totalEquity)}</div>}
                <div className="db-mini-bar" style={{ background: "linear-gradient(90deg,#4ade80,#15803d)" }} />
              </div>
            </div>

            {/* RECENT TRANSACTIONS */}
            <div className="db-card" style={{ flex: 1, animationDelay: "0.2s", display: "flex", flexDirection: "column" }}>
              <div className="db-card-hd">
                <div>
                  <div className="db-card-title">Recent Transactions</div>
                  <div className="db-card-sub">Track your most recent transactions here.</div>
                </div>
                <span className="db-badge" style={{ background: "rgba(79,99,210,0.08)", color: "#4F63D2", border: "1px solid rgba(79,99,210,0.15)" }}>
                  LAST {txCount}
                </span>
              </div>
              {txLoading ? (
                <div style={{ padding: 20, display: "flex", justifyContent: "center" }}><div className="db-spinner" /></div>
              ) : recentTx.length > 0 ? (
                <>
                  {recentTx.map((tx: any, i: number) => {
                    const letter = (tx.description || "T")[0].toUpperCase();
                    const colors = ["#4F63D2", "#22C55E", "#EF4444", "#8B5CF6", "#F59E0B"];
                    const c = colors[i % colors.length];
                    const date = tx.date ? new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";
                    const sc = tx.status === "COMPLETED"
                      ? { bg: "rgba(21,128,61,0.10)", color: "#15803d" }
                      : tx.status === "PENDING"
                        ? { bg: "rgba(217,119,6,0.10)", color: "#d97706" }
                        : { bg: "rgba(220,38,38,0.10)", color: "#dc2626" };
                    return (
                      <div key={tx.id} className="db-tx">
                        <div className="db-tx-av" style={{ background: `${c}18`, color: c }}>{letter}</div>
                        <div style={{ minWidth: 0 }}>
                          <div className="db-tx-desc">{tx.description || "Transaction"}</div>
                          <div className="db-tx-date">{date}</div>
                        </div>
                        <div className="db-tx-amt" style={{ color: "#15803d" }}>+{fmt(parseFloat(String(tx.amount ?? 0)))}</div>
                        <span className="db-tx-status" style={{ background: sc.bg, color: sc.color }}>{tx.status ?? "Done"}</span>
                      </div>
                    );
                  })}
                  <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                    <button className="db-view-all" onClick={() => setLocation("/journal")}>
                      View full journal <ArrowRight size={11} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="db-empty">
                  <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>No transactions yet.</p>
                  <button
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", background: "rgba(79,99,210,0.08)", border: "1px solid rgba(79,99,210,0.2)", borderRadius: 8, color: "#4F63D2", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}
                    onClick={() => setLocation("/transaction")}
                  >
                    <Plus size={11} /> Create one
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ROW 2 */}
        <div className="db-row2">

          {/* ACTIVITIES DONUT */}
          <div className="db-card" style={{ animationDelay: "0.25s", display: "flex", flexDirection: "column" }}>
            <div className="db-card-hd">
              <div>
                <div className="db-card-title">Activities</div>
                <div className="db-card-sub">Manage your activities here.</div>
              </div>
              <span className="db-badge" style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.2)" }}>DEMO</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px 20px", flex: 1, justifyContent: "center" }}>
              {activitiesLoading ? (
                <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}><div className="db-spinner" /></div>
              ) : activityDonut.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={activityDonut} cx="50%" cy="50%" innerRadius={46} outerRadius={68} paddingAngle={3} dataKey="value">
                        {activityDonut.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={TIP} formatter={(v: any, n: string) => [v, n.replace(/_/g, " ")]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 10px", justifyContent: "center", marginTop: 4 }}>
                    {activityDonut.slice(0, 4).map((a, i) => (
                      <div key={i} className="db-legend-item" style={{ fontSize: 9 }}>
                        <div className="db-legend-dot" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length], width: 6, height: 6 }} />
                        <span>{a.name.replace(/_/g, " ")}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="db-empty" style={{ padding: "24px 0" }}>
                  <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>No activities yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* REPORTS */}
          <div className="db-card" style={{ animationDelay: "0.3s", display: "flex", flexDirection: "column" }}>
            <div className="db-card-hd">
              <div>
                <div className="db-card-title">Reports</div>
                <div className="db-card-sub">View the generated financial reports here.</div>
              </div>
              <button style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(79,99,210,0.08)", border: "1px solid rgba(79,99,210,0.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={() => setLocation("/reports")}>
                <FileText size={13} color="#4F63D2" />
              </button>
            </div>
            {reports.map((r, i) => (
              <div key={i} className="db-report-row" onClick={() => setLocation("/reports")}>
                <span className="db-report-name">{r.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <span className="db-report-date">{r.date}</span>
                  <ChevronRight size={12} color="#9CA3AF" />
                </div>
              </div>
            ))}
          </div>

          {/* SALES */}
          <div className="db-card" style={{ animationDelay: "0.35s", display: "flex", flexDirection: "column" }}>
            <div className="db-card-hd">
              <div>
                <div className="db-card-title">Sales</div>
                <div className="db-card-sub">View your sales progress here.</div>
              </div>
              <button className="db-view-all" onClick={() => setLocation("/sales")}><ArrowRight size={11} /></button>
            </div>
            <div style={{ padding: "0 20px 20px", flex: 1, display: "flex", alignItems: "center" }}>
              {incomeLoading ? (
                <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}><div className="db-spinner" /></div>
              ) : salesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={salesData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                    <XAxis type="number" tick={{ fontSize: 9, fill: "#9CA3AF" }} tickLine={false} axisLine={false} tickFormatter={v => `₱${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#6B7280" }} tickLine={false} axisLine={false} width={90} />
                    <Tooltip contentStyle={TIP} formatter={(v: any) => [fmt(parseFloat(v)), "Amount"]} />
                    <Bar dataKey="Amount" fill="#4F63D2" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="db-empty" style={{ padding: "24px 0", width: "100%" }}>
                  <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>No sales data yet.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
