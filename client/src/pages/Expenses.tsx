import { trpc } from "@/lib/trpc";
import { useMemo, useState } from "react";
import {
  TrendingDown, RefreshCw, AlertCircle,
  ArrowUpRight, ArrowDownRight, Layers,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from "recharts";

/* ─── palette ──────────────────────────────────────────────────────── */
const PALETTE = ["#ef4444", "#f97316", "#eab308", "#8b5cf6", "#3b82f6", "#10b981", "#ec4899", "#06b6d4"];

/* ─── CSS ───────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
  @keyframes pulse    { 0%,100% { opacity:1; } 50% { opacity:.4; } }
  @keyframes spin     { to { transform:rotate(360deg); } }
  @keyframes shimmer  { to { background-position:-200% 0; } }
  @keyframes countUp  { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }

  .ex {
    font-family: 'Outfit', sans-serif;
    --blue:#4F63D2; --blue2:#6B7FE3;
    --red:#dc2626; --red2:#fca5a5; --red3:rgba(220,38,38,0.08);
    --orange:#ea580c; --amber:#d97706;
    --green:#15803d; --purple:#7c3aed;
    --ink:#111827; --ink2:#1f2937; --ink3:#4B5563; --ink4:#9CA3AF;
    --surface:#ffffff; --surface2:#F9FAFB; --surface3:#F3F4F6;
    --border:rgba(17,24,39,0.09); --border2:rgba(17,24,39,0.05);
    min-height:100vh; background:transparent; color:var(--ink);
  }

  /* ── HEADER ── */
  .ex-header {
    display:flex; align-items:flex-start; justify-content:space-between;
    padding:24px 28px 0; flex-wrap:wrap; gap:12px;
  }
  .ex-live-pill {
    display:inline-flex; align-items:center; gap:6px;
    padding:3px 10px; background:rgba(255,255,255,0.30);
    border:1px solid rgba(255,255,255,0.45); border-radius:20px;
    font-size:9px; font-weight:700; color:#fff;
    font-family:'Space Mono',monospace; letter-spacing:.12em;
    text-transform:uppercase; margin-bottom:6px; width:fit-content;
  }
  .ex-live-dot { width:5px; height:5px; background:#fca5a5; border-radius:50%; animation:pulse 2s ease infinite; }
  .ex-title { font-size:27px; font-weight:800; color:#fff; letter-spacing:-.04em; margin:0 0 2px; }
  .ex-sub   { font-size:12px; color:rgba(255,255,255,.65); margin:0; font-weight:300; }

  .ex-header-actions { display:flex; gap:8px; align-items:center; }
  .ex-btn-ghost {
    display:inline-flex; align-items:center; gap:6px;
    padding:8px 14px; background:rgba(255,255,255,.15);
    border:1px solid rgba(255,255,255,.3); border-radius:9px;
    font-size:12px; font-weight:600; color:#fff;
    cursor:pointer; transition:all .15s; font-family:'Outfit',sans-serif;
  }
  .ex-btn-ghost:hover { background:rgba(255,255,255,.25); }

  /* ── KPI ROW ── */
  .ex-kpi-row {
    display:grid; grid-template-columns:repeat(4,1fr);
    gap:14px; padding:20px 28px 0;
  }
  .ex-kpi {
    background:#fff; border:1px solid var(--border);
    border-radius:16px; padding:20px 20px 16px;
    box-shadow:0 1px 4px rgba(0,0,0,0.05), 0 4px 18px rgba(0,0,0,0.07);
    animation:fadeUp .4s ease both; position:relative; overflow:hidden;
  }
  .ex-kpi:nth-child(1) { animation-delay:.05s; }
  .ex-kpi:nth-child(2) { animation-delay:.10s; }
  .ex-kpi:nth-child(3) { animation-delay:.15s; }
  .ex-kpi:nth-child(4) { animation-delay:.20s; }
  .ex-kpi-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
  .ex-kpi-label { font-size:10.5px; font-weight:700; color:var(--ink3); letter-spacing:.09em; text-transform:uppercase; }
  .ex-kpi-icon { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; }
  .ex-kpi-val {
    font-family:'Space Mono',monospace; font-size:21px; font-weight:700;
    letter-spacing:-.03em; margin-bottom:5px; line-height:1;
    animation:countUp .5s ease both;
  }
  .ex-kpi-meta { font-size:11.5px; color:var(--ink4); font-weight:400; display:flex; align-items:center; gap:4px; }
  .ex-kpi-bar { position:absolute; bottom:0; left:0; right:0; height:3px; }
  .ex-kpi-delta {
    display:inline-flex; align-items:center; gap:3px;
    font-size:10px; font-weight:700; padding:2px 7px; border-radius:20px;
    font-family:'Space Mono',monospace;
  }
  .ex-kpi-delta.up   { background:#fef2f2; color:#dc2626; }
  .ex-kpi-delta.down { background:#f0fdf4; color:#15803d; }

  /* ── BODY ── */
  .ex-body { padding:20px 28px 32px; display:flex; flex-direction:column; gap:18px; }

  /* ── CARD ── */
  .ex-card {
    background:#fff; border:1px solid var(--border);
    border-radius:16px;
    box-shadow:0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05);
    overflow:hidden; animation:fadeUp .5s ease both;
  }
  .ex-card-hd {
    padding:20px 22px 0;
    display:flex; align-items:flex-start; justify-content:space-between;
    margin-bottom:16px;
  }
  .ex-card-title { font-size:15px; font-weight:800; color:var(--ink); letter-spacing:-.03em; }
  .ex-card-sub   { font-size:12px; color:var(--ink4); margin-top:3px; font-weight:400; }

  /* ── GRID 2-COL ── */
  .ex-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:18px; }

  /* ── DONUT LEGEND ── */
  .ex-legend { display:flex; flex-direction:column; gap:10px; padding:0 22px 22px; }
  .ex-legend-item {
    display:flex; align-items:center; gap:10px;
    padding:10px 14px; border-radius:11px;
    background:var(--surface2); border:1.5px solid var(--border2);
    transition:all .15s; cursor:default;
  }
  .ex-legend-item:hover { border-color:rgba(79,99,210,0.2); background:#fff; box-shadow:0 2px 10px rgba(0,0,0,0.06); }
  .ex-legend-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
  .ex-legend-name { font-size:13px; font-weight:700; color:var(--ink); flex:1; letter-spacing:-.02em; }
  .ex-legend-pct {
    font-family:'Space Mono',monospace; font-size:10px; font-weight:700;
    padding:2px 8px; border-radius:20px; background:var(--surface3); color:var(--ink3);
  }
  .ex-legend-val { font-family:'Space Mono',monospace; font-size:13px; font-weight:700; color:var(--ink2); }

  /* ── BAR ROWS ── */
  .ex-bar-list { display:flex; flex-direction:column; gap:14px; padding:0 22px 22px; }
  .ex-bar-item {}
  .ex-bar-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
  .ex-bar-name { font-size:13px; font-weight:700; color:var(--ink); letter-spacing:-.02em; }
  .ex-bar-right { display:flex; align-items:center; gap:8px; }
  .ex-bar-val { font-family:'Space Mono',monospace; font-size:12px; font-weight:700; color:var(--ink2); }
  .ex-bar-pct-lbl { font-family:'Space Mono',monospace; font-size:10px; color:var(--ink4); }
  .ex-bar-track { height:6px; border-radius:99px; background:var(--surface3); overflow:hidden; }
  .ex-bar-fill  { height:100%; border-radius:99px; transition:width .8s cubic-bezier(.22,1,.36,1); }

  /* ── TREND CHART ── */
  .ex-trend-wrap { padding:0 22px 22px; }

  /* ── TABLE ── */
  .ex-table-wrap { overflow-x:auto; }
  .ex-table { width:100%; border-collapse:collapse; font-size:12.5px; }
  .ex-table thead tr { background:var(--surface2); border-bottom:2px solid var(--border); }
  .ex-table th {
    padding:11px 18px; text-align:left;
    font-size:10.5px; font-weight:700; color:var(--ink3);
    letter-spacing:.08em; text-transform:uppercase; white-space:nowrap;
  }
  .ex-table th.right { text-align:right; }
  .ex-table td { padding:14px 18px; border-bottom:1px solid var(--border2); vertical-align:middle; }
  .ex-table tbody tr:last-child td { border-bottom:none; }
  .ex-table tbody tr { transition:background .12s; }
  .ex-table tbody tr:nth-child(even) { background:rgba(249,250,251,0.8); }
  .ex-table tbody tr:hover { background:rgba(220,38,38,0.03) !important; }
  .ex-table td.right { text-align:right; font-family:'Space Mono',monospace; }
  .ex-table tfoot tr { border-top:2px solid var(--border); background:rgba(220,38,38,0.03); }
  .ex-table tfoot td { padding:13px 18px; font-weight:700; font-size:13px; }
  .ex-table tfoot td.right { text-align:right; font-family:'Space Mono',monospace; color:var(--red); }

  .ex-badge {
    display:inline-flex; align-items:center; gap:5px;
    padding:3px 9px; border-radius:20px;
    font-size:10px; font-weight:700;
    font-family:'Space Mono',monospace; letter-spacing:.03em; white-space:nowrap;
  }
  .ex-rank {
    width:22px; height:22px; border-radius:6px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    font-size:10px; font-weight:800; font-family:'Space Mono',monospace;
    background:var(--surface2); color:var(--ink3);
  }
  .ex-rank.top { background:#fef2f2; color:#dc2626; }

  /* ── DONUT CENTER ── */
  .ex-donut-wrap { position:relative; }
  .ex-donut-center {
    position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
    text-align:center; pointer-events:none;
  }
  .ex-donut-center-val { font-family:'Space Mono',monospace; font-size:18px; font-weight:700; color:var(--red); line-height:1; }
  .ex-donut-center-lbl { font-size:9px; font-weight:700; color:var(--ink4); letter-spacing:.1em; text-transform:uppercase; margin-top:3px; }

  /* ── SHIMMER ── */
  .ex-shimmer { height:16px; border-radius:5px; background:linear-gradient(90deg,#ececec 25%,#f5f5f5 50%,#ececec 75%); background-size:200% 100%; animation:shimmer 1.2s infinite; margin-bottom:8px; }

  /* ── EMPTY ── */
  .ex-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:56px 20px; gap:10px; }
  .ex-empty-icon { width:48px; height:48px; border-radius:14px; background:var(--red3); display:flex; align-items:center; justify-content:center; margin-bottom:4px; }
  .ex-empty p { font-size:12px; color:var(--ink4); margin:0; text-align:center; }
  .ex-empty strong { font-size:14px; font-weight:700; color:var(--ink3); }

  /* ── SPINNER ── */
  .ex-spinner { width:18px; height:18px; border-radius:50%; border:2px solid #E5E7EB; border-top-color:var(--red); animation:spin .7s linear infinite; }
  .ex-spinner-wrap { display:flex; justify-content:center; padding:48px; }

  /* ── SEGMENT TABS ── */
  .ex-tabs { display:flex; gap:4px; padding:0 22px 16px; }
  .ex-tab {
    padding:6px 14px; border-radius:8px; font-size:12px; font-weight:600;
    cursor:pointer; transition:all .14s; font-family:'Outfit',sans-serif;
    border:1.5px solid var(--border2); color:var(--ink3); background:transparent;
  }
  .ex-tab.active { background:var(--red3); color:var(--red); border-color:rgba(220,38,38,0.2); }
  .ex-tab:not(.active):hover { background:var(--surface2); }

  /* ── RESPONSIVE ── */
  @media (max-width:1100px) { .ex-kpi-row { grid-template-columns:repeat(2,1fr); } .ex-grid2 { grid-template-columns:1fr; } }
  @media (max-width:700px) {
    /* Card-style table for small screens */
    .ex-table-wrap { overflow-x:hidden; }
    .ex-table thead { display:none; }
    .ex-table, .ex-table tbody, .ex-table tr, .ex-table td { display:block; width:100%; }
    .ex-table tr { padding:12px 18px; border-bottom:1px solid var(--border2); position:relative; }
    .ex-table tbody tr:nth-child(even) { background:rgba(249,250,251,0.8); }
    .ex-table td { padding:2px 0; border:none; text-align:left !important; }
    .ex-table td::before {
      content:attr(data-label);
      display:inline-block; width:80px;
      font-size:9px; font-weight:700; color:var(--ink4);
      text-transform:uppercase; letter-spacing:.08em;
      font-family:'Space Mono',monospace;
    }
    .ex-table tfoot { display:block; }
    .ex-table tfoot tr { padding:12px 18px; border-top:2px solid var(--border); background:rgba(220,38,38,0.03); }
    .ex-table tfoot td { padding:2px 0; border:none; }
    /* Hide "vs Largest" bar column on mobile */
    .ex-table td:nth-child(5) { display:none; }
  }
  @media (max-width:640px) {
    .ex-header { padding:16px 16px 0; }
    .ex-kpi-row { padding:16px 16px 0; grid-template-columns:repeat(2,1fr); }
    .ex-body { padding:14px 16px 24px; gap:14px; }
    .ex-title { font-size:22px; }
    .ex-card-hd { padding:14px 16px 0; }
    .ex-tabs { padding:0 16px 12px; flex-wrap:wrap; }
    .ex-legend { padding:0 16px 16px; }
    .ex-bar-list { padding:0 16px 16px; }
    .ex-trend-wrap { padding:0 16px 16px; }
  }
  @media (max-width:400px) {
    .ex-kpi-row { grid-template-columns:1fr; }
    .ex-kpi-meta { display:none; }
    .ex-header-actions .ex-btn-ghost { display:none; }
  }
`;

const TIP_STYLE = {
  background: "#fff", border: "1px solid rgba(79,99,210,0.12)",
  borderRadius: 10, fontSize: 11,
  fontFamily: "'Space Mono', monospace",
  color: "#1E2340", padding: "8px 12px",
  boxShadow: "0 4px 16px rgba(79,99,210,0.10)",
};

function fmtCurrency(val: number | string) {
  const num = typeof val === "string" ? parseFloat(val) : val;
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(num || 0);
}

function Shimmer() {
  return (
    <div style={{ padding: "0 22px 22px" }}>
      {[80, 60, 70, 50].map((w, i) => (
        <div key={i} className="ex-shimmer" style={{ width: `${w}%`, animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="ex-empty">
      <div className="ex-empty-icon">
        <AlertCircle size={22} color="#dc2626" />
      </div>
      <strong>No data yet</strong>
      <p>{message}</p>
    </div>
  );
}

export default function Expenses() {
  const [activeTab, setActiveTab] = useState<"breakdown" | "trend">("breakdown");

  const { data: incomeStatement, isLoading, refetch } = trpc.reports.incomeStatement.useQuery({});
  const { data: transactions, isLoading: txLoading } = trpc.transactions.list.useQuery({ limit: 500 });

  const expenseData = useMemo(() => {
    return (incomeStatement?.expenses || [])
      .map((e: any, i: number) => ({
        name: e.accountName,
        value: typeof e.amount === "string" ? parseFloat(e.amount) : (e.amount ?? 0),
        color: PALETTE[i % PALETTE.length],
      }))
      .filter((e: any) => e.value > 0)
      .sort((a: any, b: any) => b.value - a.value);
  }, [incomeStatement]);

  const totalExpenses = incomeStatement?.totalExpenses ?? 0;
  const categoryCount = expenseData.length;

  // Largest single expense
  const topExpense = expenseData[0];

  // Average expense per category
  const avgExpense = categoryCount > 0 ? (totalExpenses / categoryCount) : 0;

  // Trend data: group transactions by month
  const trendData = useMemo(() => {
    const allTx: any[] = Array.isArray(transactions) ? transactions : [];
    const map: Record<string, number> = {};

    for (const tx of allTx) {
      const entries: any[] = tx.journalEntries ?? [];
      const hasExpense = entries.some((e: any) => e.account?.type === "EXPENSE");
      if (!hasExpense) continue;
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const amt = typeof tx.amount === "string" ? parseFloat(tx.amount) : (tx.amount ?? 0);
      map[key] = (map[key] ?? 0) + amt;
    }

    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, total]) => ({
        month: new Date(month + "-01").toLocaleDateString("en-PH", { month: "short", year: "2-digit" }),
        total,
      }));
  }, [transactions]);

  const isLoadingAll = isLoading || txLoading;

  return (
    <div className="ex">
      <style>{css}</style>

      {/* ── HEADER ── */}
      <div className="ex-header">
        <div>
          <div className="ex-live-pill">
            <span className="ex-live-dot" />
            Expense Tracker
          </div>
          <h1 className="ex-title">Expenses</h1>
          <p className="ex-sub">Track and categorize business expenditures</p>
        </div>
        <div className="ex-header-actions">
          <button className="ex-btn-ghost" onClick={() => refetch()} title="Refresh">
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── KPI ROW ── */}
      <div className="ex-kpi-row">
        {/* Total Expenses */}
        <div className="ex-kpi">
          <div className="ex-kpi-top">
            <span className="ex-kpi-label">Total Expenses</span>
            <div className="ex-kpi-icon" style={{ background: "rgba(220,38,38,0.10)" }}>
              <TrendingDown size={16} color="#dc2626" />
            </div>
          </div>
          {isLoading
            ? <div className="ex-shimmer" style={{ width: "70%" }} />
            : <div className="ex-kpi-val" style={{ color: "#dc2626" }}>{fmtCurrency(totalExpenses)}</div>
          }
          <div className="ex-kpi-meta">All recorded expenses</div>
          <div className="ex-kpi-bar" style={{ background: "linear-gradient(90deg,#fca5a5,#dc2626)" }} />
        </div>

        {/* Categories */}
        <div className="ex-kpi">
          <div className="ex-kpi-top">
            <span className="ex-kpi-label">Categories</span>
            <div className="ex-kpi-icon" style={{ background: "rgba(139,92,246,0.10)" }}>
              <Layers size={16} color="#7c3aed" />
            </div>
          </div>
          {isLoading
            ? <div className="ex-shimmer" style={{ width: "40%" }} />
            : <div className="ex-kpi-val" style={{ color: "#7c3aed" }}>{categoryCount}</div>
          }
          <div className="ex-kpi-meta">Expense account types</div>
          <div className="ex-kpi-bar" style={{ background: "linear-gradient(90deg,#c4b5fd,#7c3aed)" }} />
        </div>

        {/* Largest */}
        <div className="ex-kpi">
          <div className="ex-kpi-top">
            <span className="ex-kpi-label">Largest</span>
            <div className="ex-kpi-icon" style={{ background: "rgba(234,88,12,0.10)" }}>
              <ArrowUpRight size={16} color="#ea580c" />
            </div>
          </div>
          {isLoading
            ? <div className="ex-shimmer" style={{ width: "60%" }} />
            : <div className="ex-kpi-val" style={{ color: "#ea580c" }}>
                {topExpense ? fmtCurrency(topExpense.value) : "—"}
              </div>
          }
          <div className="ex-kpi-meta" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
            {topExpense?.name ?? "No data"}
          </div>
          <div className="ex-kpi-bar" style={{ background: "linear-gradient(90deg,#fdba74,#ea580c)" }} />
        </div>

        {/* Avg per category */}
        <div className="ex-kpi">
          <div className="ex-kpi-top">
            <span className="ex-kpi-label">Avg / Category</span>
            <div className="ex-kpi-icon" style={{ background: "rgba(79,99,210,0.10)" }}>
              <ArrowDownRight size={16} color="#4F63D2" />
            </div>
          </div>
          {isLoading
            ? <div className="ex-shimmer" style={{ width: "55%" }} />
            : <div className="ex-kpi-val" style={{ color: "#4F63D2" }}>{fmtCurrency(avgExpense)}</div>
          }
          <div className="ex-kpi-meta">Per expense account</div>
          <div className="ex-kpi-bar" style={{ background: "linear-gradient(90deg,#a5b4fc,#4F63D2)" }} />
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="ex-body">

        {/* ── ROW 1: Donut + Breakdown ── */}
        <div className="ex-grid2">

          {/* Donut */}
          <div className="ex-card" style={{ animationDelay: ".1s" }}>
            <div className="ex-card-hd">
              <div>
                <div className="ex-card-title">Expense Breakdown</div>
                <div className="ex-card-sub">Proportional distribution by account</div>
              </div>
            </div>

            {isLoading ? <Shimmer /> : expenseData.length === 0
              ? <EmptyState message="Create expense transactions to see the breakdown." />
              : (
                <>
                  <div className="ex-donut-wrap" style={{ position: "relative", padding: "0 22px 16px" }}>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={expenseData}
                          cx="50%" cy="50%"
                          innerRadius={62} outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {expenseData.map((entry: any, i: number) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={TIP_STYLE}
                          formatter={(v: any) => [fmtCurrency(v), ""]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center label */}
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
                      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 14, fontWeight: 700, color: "#dc2626", lineHeight: 1 }}>
                        {fmtCurrency(totalExpenses)}
                      </div>
                      <div style={{ fontSize: 8.5, fontWeight: 700, color: "#9CA3AF", letterSpacing: ".10em", textTransform: "uppercase", marginTop: 3 }}>
                        Total
                      </div>
                    </div>
                  </div>

                  <div className="ex-legend">
                    {expenseData.map((item: any, i: number) => {
                      const pct = totalExpenses > 0 ? ((item.value / totalExpenses) * 100).toFixed(1) : "0.0";
                      return (
                        <div key={i} className="ex-legend-item">
                          <span className="ex-legend-dot" style={{ background: item.color }} />
                          <span className="ex-legend-name">{item.name}</span>
                          <span className="ex-legend-pct">{pct}%</span>
                          <span className="ex-legend-val">{fmtCurrency(item.value)}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )
            }
          </div>

          {/* Category Bars */}
          <div className="ex-card" style={{ animationDelay: ".15s" }}>
            <div className="ex-card-hd">
              <div>
                <div className="ex-card-title">Category Ranking</div>
                <div className="ex-card-sub">Sorted by spend — largest to smallest</div>
              </div>
            </div>

            {isLoading ? <Shimmer /> : expenseData.length === 0
              ? <EmptyState message="No expense categories to rank yet." />
              : (
                <div className="ex-bar-list">
                  {expenseData.map((item: any, i: number) => {
                    const pct = topExpense ? (item.value / topExpense.value) * 100 : 0;
                    const sharePct = totalExpenses > 0 ? ((item.value / totalExpenses) * 100).toFixed(1) : "0.0";
                    return (
                      <div key={i} className="ex-bar-item">
                        <div className="ex-bar-top">
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span className={`ex-rank ${i === 0 ? "top" : ""}`}>#{i + 1}</span>
                            <span className="ex-bar-name">{item.name}</span>
                          </div>
                          <div className="ex-bar-right">
                            <span className="ex-bar-pct-lbl">{sharePct}%</span>
                            <span className="ex-bar-val">{fmtCurrency(item.value)}</span>
                          </div>
                        </div>
                        <div className="ex-bar-track">
                          <div
                            className="ex-bar-fill"
                            style={{ width: `${pct}%`, background: item.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            }
          </div>
        </div>

        {/* ── ROW 2: Trend + Table ── */}
        <div className="ex-card" style={{ animationDelay: ".2s" }}>
          <div className="ex-card-hd">
            <div>
              <div className="ex-card-title">Expense Trend</div>
              <div className="ex-card-sub">Monthly expenditure — last 6 months</div>
            </div>
          </div>

          {isLoadingAll ? (
            <Shimmer />
          ) : trendData.length === 0 ? (
            <EmptyState message="Not enough transactions to show a trend." />
          ) : (
            <div className="ex-trend-wrap">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trendData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#dc2626" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#dc2626" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(17,24,39,0.06)" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "'Space Mono',monospace", fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fontFamily: "'Space Mono',monospace", fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={52} />
                  <Tooltip contentStyle={TIP_STYLE} formatter={(v: any) => [fmtCurrency(v), "Expenses"]} />
                  <Area type="monotone" dataKey="total" stroke="#dc2626" strokeWidth={2.5} fill="url(#expGrad)" dot={{ r: 4, fill: "#dc2626", strokeWidth: 0 }} activeDot={{ r: 6, fill: "#dc2626" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ── ROW 3: Full Table ── */}
        <div className="ex-card" style={{ animationDelay: ".25s" }}>
          <div className="ex-card-hd">
            <div>
              <div className="ex-card-title">Expense Accounts</div>
              <div className="ex-card-sub">Detailed breakdown by account</div>
            </div>
            <span
              className="ex-badge"
              style={{ background: "rgba(220,38,38,0.08)", color: "#dc2626" }}
            >
              {categoryCount} {categoryCount === 1 ? "account" : "accounts"}
            </span>
          </div>

          {isLoading ? (
            <Shimmer />
          ) : expenseData.length === 0 ? (
            <EmptyState message="No expense accounts found. Add expense transactions to populate this table." />
          ) : (
            <div className="ex-table-wrap">
              <table className="ex-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Account</th>
                    <th className="right">Amount</th>
                    <th className="right">Share</th>
                    <th className="right">vs Largest</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseData.map((item: any, i: number) => {
                    const share = totalExpenses > 0 ? (item.value / totalExpenses) * 100 : 0;
                    const vsTop = topExpense ? (item.value / topExpense.value) * 100 : 0;
                    return (
                      <tr key={i}>
                        <td data-label="#">
                          <span className={`ex-rank ${i === 0 ? "top" : ""}`}>#{i + 1}</span>
                        </td>
                        <td data-label="Account">
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0, display: "inline-block" }} />
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{item.name}</span>
                          </div>
                        </td>
                        <td className="right" data-label="Amount">
                          <span style={{ fontFamily: "'Space Mono',monospace", fontWeight: 700, color: "#dc2626" }}>
                            {fmtCurrency(item.value)}
                          </span>
                        </td>
                        <td className="right" data-label="Share">
                          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#4B5563" }}>
                            {share.toFixed(1)}%
                          </span>
                        </td>
                        <td className="right" data-label="vs Top">
                          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                            <div style={{ width: 64, height: 5, borderRadius: 99, background: "#F3F4F6", overflow: "hidden" }}>
                              <div style={{ width: `${vsTop}%`, height: "100%", borderRadius: 99, background: item.color }} />
                            </div>
                            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#9CA3AF", width: 36, textAlign: "right" }}>
                              {vsTop.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2} style={{ fontWeight: 700, fontSize: 11, color: "#4B5563", letterSpacing: ".08em", textTransform: "uppercase" }}>
                      Total
                    </td>
                    <td className="right">{fmtCurrency(totalExpenses)}</td>
                    <td className="right" style={{ color: "#9CA3AF", fontSize: 11 }}>100%</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
