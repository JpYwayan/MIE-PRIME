import { trpc } from "@/lib/trpc";
import { useMemo } from "react";
import {
  TrendingUp, RefreshCw, AlertCircle,
  ArrowUpRight, Wallet, PiggyBank, Scale,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

/* ─── palette ──────────────────────────────────────────────────────── */
const PALETTE = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4", "#f97316", "#ef4444"];

/* ─── CSS ───────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
  @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:.4; } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes shimmer { to { background-position:-200% 0; } }

  .sl {
    font-family: 'Outfit', sans-serif;
    --green:#10b981; --green2:#059669; --green3:rgba(16,185,129,0.09);
    --blue:#4F63D2; --blue2:#6B7FE3;
    --red:#dc2626; --amber:#d97706; --purple:#7c3aed;
    --ink:#111827; --ink2:#1f2937; --ink3:#4B5563; --ink4:#9CA3AF;
    --surface:#ffffff; --surface2:#F9FAFB; --surface3:#F3F4F6;
    --border:rgba(17,24,39,0.09); --border2:rgba(17,24,39,0.05);
    min-height:100vh; background:transparent; color:var(--ink);
  }

  /* ── HEADER ── */
  .sl-header {
    display:flex; align-items:flex-start; justify-content:space-between;
    padding:24px 28px 0; flex-wrap:wrap; gap:12px;
  }
  .sl-live-pill {
    display:inline-flex; align-items:center; gap:6px;
    padding:3px 10px; background:rgba(255,255,255,0.30);
    border:1px solid rgba(255,255,255,0.45); border-radius:20px;
    font-size:9px; font-weight:700; color:#fff;
    font-family:'Space Mono',monospace; letter-spacing:.12em;
    text-transform:uppercase; margin-bottom:6px; width:fit-content;
  }
  .sl-live-dot { width:5px; height:5px; background:#6ee7b7; border-radius:50%; animation:pulse 2s ease infinite; }
  .sl-title { font-size:27px; font-weight:800; color:#fff; letter-spacing:-.04em; margin:0 0 2px; }
  .sl-sub   { font-size:12px; color:rgba(255,255,255,.65); margin:0; font-weight:300; }
  .sl-header-actions { display:flex; gap:8px; align-items:center; }
  .sl-btn-ghost {
    display:inline-flex; align-items:center; gap:6px;
    padding:8px 14px; background:rgba(255,255,255,.15);
    border:1px solid rgba(255,255,255,.3); border-radius:9px;
    font-size:12px; font-weight:600; color:#fff;
    cursor:pointer; transition:all .15s; font-family:'Outfit',sans-serif;
  }
  .sl-btn-ghost:hover { background:rgba(255,255,255,.25); }

  /* ── KPI ROW ── */
  .sl-kpi-row { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; padding:20px 28px 0; }
  .sl-kpi {
    background:#fff; border:1px solid var(--border);
    border-radius:16px; padding:20px 20px 16px;
    box-shadow:0 1px 4px rgba(0,0,0,0.05), 0 4px 18px rgba(0,0,0,0.07);
    animation:fadeUp .4s ease both; position:relative; overflow:hidden;
  }
  .sl-kpi:nth-child(1) { animation-delay:.05s; }
  .sl-kpi:nth-child(2) { animation-delay:.10s; }
  .sl-kpi:nth-child(3) { animation-delay:.15s; }
  .sl-kpi:nth-child(4) { animation-delay:.20s; }
  .sl-kpi-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
  .sl-kpi-label { font-size:10.5px; font-weight:700; color:var(--ink3); letter-spacing:.09em; text-transform:uppercase; }
  .sl-kpi-icon { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; }
  .sl-kpi-val { font-family:'Space Mono',monospace; font-size:21px; font-weight:700; letter-spacing:-.03em; margin-bottom:5px; line-height:1; }
  .sl-kpi-meta { font-size:11.5px; color:var(--ink4); font-weight:400; }
  .sl-kpi-bar { position:absolute; bottom:0; left:0; right:0; height:3px; }

  /* ── BODY ── */
  .sl-body { padding:20px 28px 32px; display:flex; flex-direction:column; gap:18px; }

  /* ── CARD ── */
  .sl-card {
    background:#fff; border:1px solid var(--border);
    border-radius:16px;
    box-shadow:0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05);
    overflow:hidden; animation:fadeUp .5s ease both;
  }
  .sl-card-hd {
    padding:20px 22px 0;
    display:flex; align-items:flex-start; justify-content:space-between;
    margin-bottom:16px;
  }
  .sl-card-title { font-size:15px; font-weight:800; color:var(--ink); letter-spacing:-.03em; }
  .sl-card-sub   { font-size:12px; color:var(--ink4); margin-top:3px; font-weight:400; }

  /* ── GRID ── */
  .sl-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
  .sl-grid3 { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }

  /* ── PROFIT/LOSS METER ── */
  .sl-meter-wrap { padding:0 22px 22px; }
  .sl-meter-labels { display:flex; justify-content:space-between; margin-bottom:8px; }
  .sl-meter-lbl { font-size:10.5px; font-weight:700; color:var(--ink4); letter-spacing:.08em; text-transform:uppercase; font-family:'Space Mono',monospace; }
  .sl-meter-track { height:10px; border-radius:99px; background:var(--surface3); overflow:hidden; position:relative; }
  .sl-meter-fill-rev { height:100%; border-radius:99px; transition:width 1s cubic-bezier(.22,1,.36,1); }
  .sl-meter-fill-exp { position:absolute; top:0; height:100%; border-radius:99px; transition:width 1s cubic-bezier(.22,1,.36,1); background:rgba(220,38,38,0.45); }
  .sl-meter-vals { display:flex; justify-content:space-between; margin-top:8px; }
  .sl-meter-val { font-family:'Space Mono',monospace; font-size:12px; font-weight:700; }

  /* ── REVENUE LEGEND ── */
  .sl-rev-legend { display:flex; flex-direction:column; gap:10px; padding:0 22px 22px; }
  .sl-rev-item {
    display:flex; align-items:center; gap:10px;
    padding:10px 14px; border-radius:11px;
    background:var(--surface2); border:1.5px solid var(--border2);
    transition:all .15s;
  }
  .sl-rev-item:hover { border-color:rgba(16,185,129,0.25); background:#fff; box-shadow:0 2px 10px rgba(0,0,0,0.06); }
  .sl-rev-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
  .sl-rev-name { font-size:13px; font-weight:700; color:var(--ink); flex:1; letter-spacing:-.02em; }
  .sl-rev-pct { font-family:'Space Mono',monospace; font-size:10px; font-weight:700; padding:2px 8px; border-radius:20px; background:var(--green3); color:var(--green2); }
  .sl-rev-val { font-family:'Space Mono',monospace; font-size:13px; font-weight:700; color:var(--ink2); }

  /* ── BAR ROWS ── */
  .sl-bar-list { display:flex; flex-direction:column; gap:14px; padding:0 22px 22px; }
  .sl-bar-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
  .sl-bar-name { font-size:13px; font-weight:700; color:var(--ink); letter-spacing:-.02em; }
  .sl-bar-val { font-family:'Space Mono',monospace; font-size:12px; font-weight:700; color:var(--ink2); }
  .sl-bar-track { height:6px; border-radius:99px; background:var(--surface3); overflow:hidden; }
  .sl-bar-fill { height:100%; border-radius:99px; transition:width .8s cubic-bezier(.22,1,.36,1); }

  /* ── TABLE ── */
  .sl-table-wrap { overflow-x:auto; }
  .sl-table { width:100%; border-collapse:collapse; font-size:12.5px; }
  .sl-table thead tr { background:var(--surface2); border-bottom:2px solid var(--border); }
  .sl-table th { padding:11px 18px; text-align:left; font-size:10.5px; font-weight:700; color:var(--ink3); letter-spacing:.08em; text-transform:uppercase; white-space:nowrap; }
  .sl-table th.right { text-align:right; }
  .sl-table td { padding:14px 18px; border-bottom:1px solid var(--border2); vertical-align:middle; }
  .sl-table tbody tr:last-child td { border-bottom:none; }
  .sl-table tbody tr { transition:background .12s; }
  .sl-table tbody tr:nth-child(even) { background:rgba(249,250,251,0.8); }
  .sl-table tbody tr:hover { background:rgba(16,185,129,0.03) !important; }
  .sl-table td.right { text-align:right; font-family:'Space Mono',monospace; }
  .sl-table tfoot tr { border-top:2px solid var(--border); background:rgba(16,185,129,0.04); }
  .sl-table tfoot td { padding:13px 18px; font-weight:700; font-size:13px; }
  .sl-table tfoot td.right { text-align:right; font-family:'Space Mono',monospace; color:var(--green2); }

  .sl-rank { width:22px; height:22px; border-radius:6px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:800; font-family:'Space Mono',monospace; background:var(--surface2); color:var(--ink3); }
  .sl-rank.top { background:rgba(16,185,129,0.12); color:var(--green2); }

  .sl-badge { display:inline-flex; align-items:center; gap:5px; padding:3px 9px; border-radius:20px; font-size:10px; font-weight:700; font-family:'Space Mono',monospace; letter-spacing:.03em; white-space:nowrap; }

  /* net income indicator */
  .sl-net-positive { color:var(--green2); }
  .sl-net-negative { color:var(--red); }

  /* ── SHIMMER ── */
  .sl-shimmer { height:16px; border-radius:5px; background:linear-gradient(90deg,#ececec 25%,#f5f5f5 50%,#ececec 75%); background-size:200% 100%; animation:shimmer 1.2s infinite; margin-bottom:8px; }

  /* ── EMPTY ── */
  .sl-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:56px 20px; gap:10px; }
  .sl-empty-icon { width:48px; height:48px; border-radius:14px; background:var(--green3); display:flex; align-items:center; justify-content:center; margin-bottom:4px; }
  .sl-empty p { font-size:12px; color:var(--ink4); margin:0; text-align:center; }
  .sl-empty strong { font-size:14px; font-weight:700; color:var(--ink3); }

  /* ── RESPONSIVE ── */
  @media (max-width:1100px) { .sl-kpi-row { grid-template-columns:repeat(2,1fr); } .sl-grid2,.sl-grid3 { grid-template-columns:1fr; } }
  @media (max-width:640px) {
    .sl-header { padding:16px 16px 0; }
    .sl-kpi-row { padding:16px 16px 0; grid-template-columns:repeat(2,1fr); }
    .sl-body { padding:14px 16px 24px; }
  }
`;

const TIP = {
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
      {[80, 55, 70, 45].map((w, i) => (
        <div key={i} className="sl-shimmer" style={{ width: `${w}%`, animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="sl-empty">
      <div className="sl-empty-icon">
        <AlertCircle size={22} color="#10b981" />
      </div>
      <strong>No data yet</strong>
      <p>{message}</p>
    </div>
  );
}

export default function Sales() {
  const { data: incomeStatement, isLoading, refetch } = trpc.reports.incomeStatement.useQuery({});
  const { data: transactions, isLoading: txLoading } = trpc.transactions.list.useQuery({ limit: 500 });

  const totalRevenue  = incomeStatement?.totalRevenue  ?? 0;
  const totalExpenses = incomeStatement?.totalExpenses ?? 0;
  const netIncome     = incomeStatement?.netIncome     ?? 0;

  const revenueData = useMemo(() => {
    return (incomeStatement?.revenues || [])
      .map((r: any, i: number) => ({
        name: r.accountName,
        value: typeof r.amount === "string" ? parseFloat(r.amount) : (r.amount ?? 0),
        color: PALETTE[i % PALETTE.length],
      }))
      .filter((r: any) => r.value > 0)
      .sort((a: any, b: any) => b.value - a.value);
  }, [incomeStatement]);

  const topRevenue   = revenueData[0];
  const sourceCount  = revenueData.length;
  const margin       = totalRevenue > 0 ? ((netIncome / totalRevenue) * 100) : 0;

  // Monthly trend: revenue vs expenses per month
  const trendData = useMemo(() => {
    const allTx: any[] = Array.isArray(transactions) ? transactions : [];
    const rev: Record<string, number> = {};
    const exp: Record<string, number> = {};

    for (const tx of allTx) {
      const entries: any[] = tx.journalEntries ?? [];
      const d   = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const amt = typeof tx.amount === "string" ? parseFloat(tx.amount) : (tx.amount ?? 0);

      const hasRevenue = entries.some((e: any) => e.account?.type === "REVENUE");
      const hasExpense = entries.some((e: any) => e.account?.type === "EXPENSE");
      if (hasRevenue) rev[key] = (rev[key] ?? 0) + amt;
      if (hasExpense) exp[key] = (exp[key] ?? 0) + amt;
    }

    const allKeys = [...new Set([...Object.keys(rev), ...Object.keys(exp)])].sort().slice(-6);
    return allKeys.map(k => ({
      month: new Date(k + "-01").toLocaleDateString("en-PH", { month: "short", year: "2-digit" }),
      revenue: rev[k] ?? 0,
      expenses: exp[k] ?? 0,
      net: (rev[k] ?? 0) - (exp[k] ?? 0),
    }));
  }, [transactions]);

  const isLoadingAll = isLoading || txLoading;
  const revPct  = totalRevenue + totalExpenses > 0 ? (totalRevenue / (totalRevenue + totalExpenses)) * 100 : 0;
  const expPct  = totalRevenue + totalExpenses > 0 ? (totalExpenses / (totalRevenue + totalExpenses)) * 100 : 0;

  return (
    <div className="sl">
      <style>{css}</style>

      {/* ── HEADER ── */}
      <div className="sl-header">
        <div>
          <div className="sl-live-pill">
            <span className="sl-live-dot" />
            Revenue Intelligence
          </div>
          <h1 className="sl-title">Sales</h1>
          <p className="sl-sub">Track income sources and revenue performance</p>
        </div>
        <div className="sl-header-actions">
          <button className="sl-btn-ghost" onClick={() => refetch()}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* ── KPI ROW ── */}
      <div className="sl-kpi-row">
        <div className="sl-kpi">
          <div className="sl-kpi-top">
            <span className="sl-kpi-label">Total Revenue</span>
            <div className="sl-kpi-icon" style={{ background: "rgba(16,185,129,0.10)" }}>
              <TrendingUp size={16} color="#10b981" />
            </div>
          </div>
          {isLoading ? <div className="sl-shimmer" style={{ width: "70%" }} />
            : <div className="sl-kpi-val" style={{ color: "#10b981" }}>{fmtCurrency(totalRevenue)}</div>}
          <div className="sl-kpi-meta">All income sources</div>
          <div className="sl-kpi-bar" style={{ background: "linear-gradient(90deg,#6ee7b7,#10b981)" }} />
        </div>

        <div className="sl-kpi">
          <div className="sl-kpi-top">
            <span className="sl-kpi-label">Net Income</span>
            <div className="sl-kpi-icon" style={{ background: netIncome >= 0 ? "rgba(79,99,210,0.10)" : "rgba(220,38,38,0.10)" }}>
              <Wallet size={16} color={netIncome >= 0 ? "#4F63D2" : "#dc2626"} />
            </div>
          </div>
          {isLoading ? <div className="sl-shimmer" style={{ width: "60%" }} />
            : <div className={`sl-kpi-val ${netIncome >= 0 ? "sl-net-positive" : "sl-net-negative"}`}>
                {fmtCurrency(netIncome)}
              </div>}
          <div className="sl-kpi-meta">Revenue minus expenses</div>
          <div className="sl-kpi-bar" style={{ background: netIncome >= 0 ? "linear-gradient(90deg,#a5b4fc,#4F63D2)" : "linear-gradient(90deg,#fca5a5,#dc2626)" }} />
        </div>

        <div className="sl-kpi">
          <div className="sl-kpi-top">
            <span className="sl-kpi-label">Profit Margin</span>
            <div className="sl-kpi-icon" style={{ background: "rgba(245,158,11,0.10)" }}>
              <PiggyBank size={16} color="#d97706" />
            </div>
          </div>
          {isLoading ? <div className="sl-shimmer" style={{ width: "45%" }} />
            : <div className="sl-kpi-val" style={{ color: margin >= 0 ? "#d97706" : "#dc2626" }}>
                {margin.toFixed(1)}%
              </div>}
          <div className="sl-kpi-meta">Of total revenue</div>
          <div className="sl-kpi-bar" style={{ background: "linear-gradient(90deg,#fde68a,#d97706)" }} />
        </div>

        <div className="sl-kpi">
          <div className="sl-kpi-top">
            <span className="sl-kpi-label">Revenue Sources</span>
            <div className="sl-kpi-icon" style={{ background: "rgba(139,92,246,0.10)" }}>
              <Scale size={16} color="#7c3aed" />
            </div>
          </div>
          {isLoading ? <div className="sl-shimmer" style={{ width: "35%" }} />
            : <div className="sl-kpi-val" style={{ color: "#7c3aed" }}>{sourceCount}</div>}
          <div className="sl-kpi-meta">Active revenue accounts</div>
          <div className="sl-kpi-bar" style={{ background: "linear-gradient(90deg,#c4b5fd,#7c3aed)" }} />
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="sl-body">

        {/* ── ROW 1: Revenue vs Expenses meter + Sources ── */}
        <div className="sl-grid2">

          {/* Revenue vs Expenses */}
          <div className="sl-card" style={{ animationDelay: ".08s" }}>
            <div className="sl-card-hd">
              <div>
                <div className="sl-card-title">Revenue vs Expenses</div>
                <div className="sl-card-sub">Proportional comparison</div>
              </div>
            </div>
            {isLoading ? <Shimmer /> : (
              <div className="sl-meter-wrap">
                {/* Revenue bar */}
                <div style={{ marginBottom: 14 }}>
                  <div className="sl-meter-labels">
                    <span className="sl-meter-lbl" style={{ color: "#10b981" }}>Revenue</span>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 700, color: "#10b981" }}>{revPct.toFixed(1)}%</span>
                  </div>
                  <div className="sl-meter-track">
                    <div className="sl-meter-fill-rev" style={{ width: `${revPct}%`, background: "linear-gradient(90deg,#6ee7b7,#10b981)" }} />
                  </div>
                  <div className="sl-meter-vals">
                    <span className="sl-meter-val" style={{ color: "#10b981" }}>{fmtCurrency(totalRevenue)}</span>
                  </div>
                </div>

                {/* Expenses bar */}
                <div style={{ marginBottom: 20 }}>
                  <div className="sl-meter-labels">
                    <span className="sl-meter-lbl" style={{ color: "#dc2626" }}>Expenses</span>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 700, color: "#dc2626" }}>{expPct.toFixed(1)}%</span>
                  </div>
                  <div className="sl-meter-track">
                    <div className="sl-meter-fill-rev" style={{ width: `${expPct}%`, background: "linear-gradient(90deg,#fca5a5,#dc2626)" }} />
                  </div>
                  <div className="sl-meter-vals">
                    <span className="sl-meter-val" style={{ color: "#dc2626" }}>{fmtCurrency(totalExpenses)}</span>
                  </div>
                </div>

                {/* Net income summary */}
                <div style={{
                  padding: "14px 16px", borderRadius: 11,
                  background: netIncome >= 0 ? "rgba(16,185,129,0.07)" : "rgba(220,38,38,0.07)",
                  border: `1.5px solid ${netIncome >= 0 ? "rgba(16,185,129,0.18)" : "rgba(220,38,38,0.18)"}`,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink3)", letterSpacing: ".06em", textTransform: "uppercase" }}>
                    Net Income
                  </span>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 16, fontWeight: 700, color: netIncome >= 0 ? "#059669" : "#dc2626" }}>
                    {fmtCurrency(netIncome)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Revenue Sources */}
          <div className="sl-card" style={{ animationDelay: ".12s" }}>
            <div className="sl-card-hd">
              <div>
                <div className="sl-card-title">Revenue Sources</div>
                <div className="sl-card-sub">Income by account — ranked by amount</div>
              </div>
            </div>
            {isLoading ? <Shimmer /> : revenueData.length === 0
              ? <EmptyState message="Add revenue transactions to see income sources." />
              : (
                <div className="sl-rev-legend">
                  {revenueData.map((item: any, i: number) => {
                    const pct = totalRevenue > 0 ? ((item.value / totalRevenue) * 100).toFixed(1) : "0.0";
                    return (
                      <div key={i} className="sl-rev-item">
                        <span className="sl-rev-dot" style={{ background: item.color }} />
                        <span className="sl-rev-name">{item.name}</span>
                        <span className="sl-rev-pct">{pct}%</span>
                        <span className="sl-rev-val">{fmtCurrency(item.value)}</span>
                      </div>
                    );
                  })}
                </div>
              )
            }
          </div>
        </div>

        {/* ── ROW 2: Monthly trend ── */}
        <div className="sl-card" style={{ animationDelay: ".16s" }}>
          <div className="sl-card-hd">
            <div>
              <div className="sl-card-title">Monthly Performance</div>
              <div className="sl-card-sub">Revenue vs expenses — last 6 months</div>
            </div>
          </div>
          {isLoadingAll ? <Shimmer /> : trendData.length === 0
            ? <EmptyState message="Not enough transactions to show a trend." />
            : (
              <div style={{ padding: "0 22px 22px" }}>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={trendData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.01} />
                      </linearGradient>
                      <linearGradient id="expGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#dc2626" stopOpacity={0.14} />
                        <stop offset="100%" stopColor="#dc2626" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(17,24,39,0.06)" strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "'Space Mono',monospace", fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fontFamily: "'Space Mono',monospace", fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={52} />
                    <Tooltip contentStyle={TIP} formatter={(v: any, name: string) => [fmtCurrency(v), name.charAt(0).toUpperCase() + name.slice(1)]} />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }} activeDot={{ r: 6 }} name="revenue" />
                    <Area type="monotone" dataKey="expenses" stroke="#dc2626" strokeWidth={2} fill="url(#expGrad2)" strokeDasharray="5 3" dot={{ r: 3, fill: "#dc2626", strokeWidth: 0 }} activeDot={{ r: 5 }} name="expenses" />
                  </AreaChart>
                </ResponsiveContainer>

                {/* legend */}
                <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 10 }}>
                  {[{ color: "#10b981", label: "Revenue", dash: false }, { color: "#dc2626", label: "Expenses", dash: true }].map(l => (
                    <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 20, height: 2.5, borderRadius: 2, borderTop: l.dash ? `2px dashed ${l.color}` : "none", background: l.dash ? "none" : l.color }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#4B5563" }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        </div>

        {/* ── ROW 3: Bar chart + Table ── */}
        <div className="sl-grid2">

          {/* Bar chart */}
          <div className="sl-card" style={{ animationDelay: ".20s" }}>
            <div className="sl-card-hd">
              <div>
                <div className="sl-card-title">Revenue by Account</div>
                <div className="sl-card-sub">Visual comparison of income sources</div>
              </div>
            </div>
            {isLoading ? <Shimmer /> : revenueData.length === 0
              ? <EmptyState message="No revenue accounts found." />
              : (
                <div style={{ padding: "0 22px 22px" }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={revenueData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={28}>
                      <CartesianGrid stroke="rgba(17,24,39,0.06)" strokeDasharray="4 4" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: "'Space Mono',monospace", fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fontFamily: "'Space Mono',monospace", fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={52} />
                      <Tooltip contentStyle={TIP} formatter={(v: any) => [fmtCurrency(v), "Revenue"]} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {revenueData.map((entry: any, i: number) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )
            }
          </div>

          {/* Table */}
          <div className="sl-card" style={{ animationDelay: ".24s" }}>
            <div className="sl-card-hd">
              <div>
                <div className="sl-card-title">Revenue Accounts</div>
                <div className="sl-card-sub">Detailed breakdown</div>
              </div>
              <span className="sl-badge" style={{ background: "rgba(16,185,129,0.09)", color: "#059669" }}>
                {sourceCount} {sourceCount === 1 ? "source" : "sources"}
              </span>
            </div>
            {isLoading ? <Shimmer /> : revenueData.length === 0
              ? <EmptyState message="No revenue data available." />
              : (
                <div className="sl-table-wrap">
                  <table className="sl-table">
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>#</th>
                        <th>Account</th>
                        <th className="right">Amount</th>
                        <th className="right">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueData.map((item: any, i: number) => {
                        const share = totalRevenue > 0 ? ((item.value / totalRevenue) * 100).toFixed(1) : "0.0";
                        return (
                          <tr key={i}>
                            <td><span className={`sl-rank ${i === 0 ? "top" : ""}`}>#{i + 1}</span></td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, display: "inline-block", flexShrink: 0 }} />
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{item.name}</span>
                              </div>
                            </td>
                            <td className="right">
                              <span style={{ fontFamily: "'Space Mono',monospace", fontWeight: 700, color: "#059669" }}>
                                {fmtCurrency(item.value)}
                              </span>
                            </td>
                            <td className="right">
                              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#4B5563" }}>
                                {share}%
                              </span>
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
                        <td className="right">{fmtCurrency(totalRevenue)}</td>
                        <td className="right" style={{ color: "#9CA3AF", fontSize: 11 }}>100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )
            }
          </div>
        </div>

      </div>
    </div>
  );
}
