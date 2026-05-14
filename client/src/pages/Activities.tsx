import { trpc } from "@/lib/trpc";
import { useMemo, useState } from "react";
import {
  FileText, ArrowUpRight, ArrowDownLeft,
  Search, Filter, Clock, CheckCircle2,
  ChevronLeft, ChevronRight,
} from "lucide-react";

/* ─── CSS ─────────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
  @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:.4; } }
  @keyframes shimmer { to { background-position:-200% 0; } }
  @keyframes slideIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:none; } }

  .ac {
    font-family:'Outfit',sans-serif;
    --blue:#4F63D2; --blue2:#6B7FE3; --blue3:rgba(79,99,210,0.08);
    --green:#15803d; --amber:#d97706; --red:#dc2626;
    --ink:#111827; --ink2:#1f2937; --ink3:#4B5563; --ink4:#9CA3AF;
    --surface:#ffffff; --surface2:#F9FAFB; --surface3:#F3F4F6;
    --border:rgba(17,24,39,0.09); --border2:rgba(17,24,39,0.05);
    min-height:100vh; background:transparent; color:var(--ink);
  }

  /* ── HEADER ── */
  .ac-header {
    display:flex; align-items:flex-start; justify-content:space-between;
    padding:24px 28px 0; flex-wrap:wrap; gap:12px;
  }
  .ac-live-pill {
    display:inline-flex; align-items:center; gap:6px;
    padding:3px 10px; background:rgba(255,255,255,0.30);
    border:1px solid rgba(255,255,255,0.45); border-radius:20px;
    font-size:9px; font-weight:700; color:#fff;
    font-family:'Space Mono',monospace; letter-spacing:.12em;
    text-transform:uppercase; margin-bottom:6px; width:fit-content;
  }
  .ac-live-dot { width:5px; height:5px; background:#a5f3fc; border-radius:50%; animation:pulse 2s ease infinite; }
  .ac-title { font-size:27px; font-weight:800; color:#fff; letter-spacing:-.04em; margin:0 0 2px; }
  .ac-sub   { font-size:12px; color:rgba(255,255,255,.65); margin:0; font-weight:300; }
  .ac-btn-ghost {
    display:inline-flex; align-items:center; gap:6px;
    padding:8px 14px; background:rgba(255,255,255,.15);
    border:1px solid rgba(255,255,255,.3); border-radius:9px;
    font-size:12px; font-weight:600; color:#fff;
    cursor:pointer; transition:all .15s; font-family:'Outfit',sans-serif;
  }
  .ac-btn-ghost:hover { background:rgba(255,255,255,.25); }

  /* ── KPI ROW ── */
  .ac-kpi-row {
    display:grid; grid-template-columns:repeat(4,1fr);
    gap:14px; padding:20px 28px 0;
  }
  .ac-kpi {
    background:#fff; border:1px solid var(--border);
    border-radius:16px; padding:20px 20px 16px;
    box-shadow:0 1px 4px rgba(0,0,0,0.05),0 4px 18px rgba(0,0,0,0.07);
    animation:fadeUp .4s ease both; position:relative; overflow:hidden;
  }
  .ac-kpi:nth-child(1){animation-delay:.05s}
  .ac-kpi:nth-child(2){animation-delay:.10s}
  .ac-kpi:nth-child(3){animation-delay:.15s}
  .ac-kpi:nth-child(4){animation-delay:.20s}
  .ac-kpi-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
  .ac-kpi-label { font-size:10.5px; font-weight:700; color:var(--ink3); letter-spacing:.09em; text-transform:uppercase; }
  .ac-kpi-icon { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; }
  .ac-kpi-val { font-family:'Space Mono',monospace; font-size:21px; font-weight:700; letter-spacing:-.03em; margin-bottom:5px; line-height:1; }
  .ac-kpi-meta { font-size:11.5px; color:var(--ink4); }
  .ac-kpi-bar { position:absolute; bottom:0; left:0; right:0; height:3px; }

  /* ── BODY ── */
  .ac-body { padding:20px 28px 32px; }

  /* ── CARD ── */
  .ac-card {
    background:#fff; border:1px solid var(--border);
    border-radius:16px;
    box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 16px rgba(0,0,0,0.05);
    overflow:hidden; animation:fadeUp .5s ease both;
    display:flex; flex-direction:column;
  }
  .ac-card-hd {
    padding:18px 22px;
    display:flex; align-items:center; justify-content:space-between;
    border-bottom:1px solid var(--border2); flex-shrink:0;
  }
  .ac-card-title { font-size:15px; font-weight:800; color:var(--ink); letter-spacing:-.03em; }
  .ac-card-sub   { font-size:12px; color:var(--ink4); margin-top:2px; }
  .ac-badge {
    display:inline-flex; align-items:center;
    padding:4px 10px; border-radius:20px;
    font-size:11px; font-weight:700; font-family:'Space Mono',monospace;
  }

  /* ── TOOLBAR ── */
  .ac-toolbar {
    display:flex; gap:10px; align-items:center;
    padding:12px 22px; border-bottom:1px solid var(--border2);
    background:var(--surface2); flex-shrink:0;
  }
  .ac-search-wrap { position:relative; flex:1; }
  .ac-search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--ink4); pointer-events:none; }
  .ac-search {
    width:100%; padding:8px 14px 8px 36px;
    border:1.5px solid var(--border); border-radius:10px;
    font-family:'Outfit',sans-serif; font-size:13px; font-weight:500;
    color:var(--ink); background:#fff; outline:none;
    transition:border-color .15s,box-shadow .15s;
  }
  .ac-search::placeholder { color:var(--ink4); }
  .ac-search:focus { border-color:var(--blue); box-shadow:0 0 0 3px rgba(79,99,210,0.1); }
  .ac-filter-group { display:flex; gap:6px; }
  .ac-filter-btn {
    padding:7px 13px; border-radius:9px;
    font-family:'Outfit',sans-serif; font-size:12px; font-weight:600;
    cursor:pointer; transition:all .15s; border:1.5px solid var(--border);
    background:#fff; color:var(--ink3);
  }
  .ac-filter-btn:hover { border-color:rgba(79,99,210,0.3); color:var(--blue); background:var(--blue3); }
  .ac-filter-btn.on-all  { background:var(--blue);   border-color:var(--blue);   color:#fff; }
  .ac-filter-btn.on-done { background:#15803d;        border-color:#15803d;        color:#fff; }
  .ac-filter-btn.on-pend { background:#d97706;        border-color:#d97706;        color:#fff; }

  /* ── SCROLLABLE FEED ── */
  .ac-scroll-wrap { position:relative; flex:1; overflow:hidden; }
  .ac-scroll-wrap::after {
    content:''; pointer-events:none;
    position:absolute; bottom:0; left:0; right:0; height:36px;
    background:linear-gradient(to top,rgba(255,255,255,.9),transparent);
    z-index:2;
  }
  .ac-scroll {
    overflow-y:auto; max-height:480px; min-height:180px;
  }
  .ac-scroll::-webkit-scrollbar { width:5px; }
  .ac-scroll::-webkit-scrollbar-track { background:transparent; }
  .ac-scroll::-webkit-scrollbar-thumb { background:rgba(79,99,210,0.2); border-radius:99px; }
  .ac-scroll::-webkit-scrollbar-thumb:hover { background:rgba(79,99,210,0.4); }

  /* ── DATE DIVIDER ── */
  .ac-date-divider {
    display:flex; align-items:center; gap:12px;
    padding:8px 22px 6px; position:sticky; top:0; z-index:1;
    background:rgba(249,250,251,0.96);
    backdrop-filter:blur(6px);
    border-bottom:1px solid var(--border2);
  }
  .ac-date-label {
    font-size:9.5px; font-weight:700; color:var(--ink3);
    letter-spacing:.12em; text-transform:uppercase;
    font-family:'Space Mono',monospace; white-space:nowrap;
  }
  .ac-date-line { flex:1; height:1px; background:var(--border); }
  .ac-date-count { font-size:9px; font-weight:700; font-family:'Space Mono',monospace; color:var(--ink4); white-space:nowrap; }

  /* ── TX ROW ── */
  .ac-row {
    display:flex; align-items:center; gap:14px;
    padding:11px 22px;
    border-bottom:1px solid var(--border2);
    transition:background .12s;
    animation:slideIn .22s ease both;
  }
  .ac-row:last-child { border-bottom:none; }
  .ac-row:hover { background:rgba(79,99,210,0.025); }
  .ac-row-icon { width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .ac-row-desc { font-size:13px; font-weight:700; color:var(--ink); letter-spacing:-.02em; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .ac-row-meta { font-size:10.5px; color:var(--ink4); margin-top:1px; }
  .ac-row-amount { font-family:'Space Mono',monospace; font-size:13.5px; font-weight:700; letter-spacing:-.02em; white-space:nowrap; }
  .ac-row-amount.credit { color:var(--green); }
  .ac-row-amount.debit  { color:var(--red); }
  .ac-row-amount.neutral{ color:var(--ink2); }
  .ac-status {
    display:inline-flex; align-items:center; gap:4px;
    padding:2px 8px; border-radius:20px;
    font-size:9.5px; font-weight:700;
    font-family:'Space Mono',monospace; letter-spacing:.04em;
    text-transform:uppercase; white-space:nowrap; margin-top:3px;
  }
  .ac-status.completed { background:#dcfce7; color:#15803d; }
  .ac-status.pending   { background:#fef3c7; color:#b45309; }
  .ac-status.failed    { background:#fef2f2; color:#dc2626; }
  .ac-status-dot { width:4px; height:4px; border-radius:50%; background:currentColor; }
  .ac-type-tag {
    padding:2px 8px; border-radius:6px;
    font-size:9.5px; font-weight:700; color:var(--ink3);
    background:var(--surface3); letter-spacing:.05em;
    text-transform:uppercase; white-space:nowrap;
    font-family:'Space Mono',monospace; flex-shrink:0;
  }
  .ac-row-right { display:flex; flex-direction:column; align-items:flex-end; flex-shrink:0; min-width:105px; }

  /* ── PAGINATION ── */
  .ac-pagination {
    display:flex; align-items:center; justify-content:space-between;
    padding:11px 22px; border-top:1px solid var(--border2);
    background:var(--surface2); flex-shrink:0;
  }
  .ac-page-info { font-size:11px; color:var(--ink4); font-weight:500; }
  .ac-page-info strong { color:var(--ink3); font-weight:700; }
  .ac-page-controls { display:flex; align-items:center; gap:5px; }
  .ac-page-btn {
    width:30px; height:30px; border-radius:8px;
    border:1.5px solid var(--border); background:#fff;
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:all .15s; color:var(--ink3);
  }
  .ac-page-btn:hover:not(:disabled) { border-color:var(--blue); color:var(--blue); background:var(--blue3); }
  .ac-page-btn:disabled { opacity:.35; cursor:default; }
  .ac-page-nums { display:flex; gap:4px; }
  .ac-page-num {
    min-width:30px; height:30px; padding:0 6px; border-radius:8px;
    border:1.5px solid var(--border); background:#fff;
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:all .15s;
    font-size:12px; font-weight:700; color:var(--ink3);
    font-family:'Space Mono',monospace;
  }
  .ac-page-num:hover { border-color:var(--blue); color:var(--blue); background:var(--blue3); }
  .ac-page-num.active { background:var(--blue); border-color:var(--blue); color:#fff; }

  /* ── SHIMMER / EMPTY ── */
  .ac-shimmer {
    background:linear-gradient(90deg,#f3f4f6 0%,#e9eaec 50%,#f3f4f6 100%);
    background-size:200% 100%; animation:shimmer 1.4s ease infinite; border-radius:8px;
  }
  .ac-empty {
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    padding:52px 24px; gap:10px; text-align:center;
  }
  .ac-empty-icon { width:44px; height:44px; border-radius:12px; background:var(--surface2); border:1.5px solid var(--border); display:flex; align-items:center; justify-content:center; }
  .ac-empty-msg { font-size:13px; color:var(--ink4); font-weight:500; max-width:240px; line-height:1.6; }

  /* ── RESPONSIVE ── */
  @media (max-width:900px) {
    .ac-kpi-row { grid-template-columns:repeat(2,1fr); }
  }
  @media (max-width:600px) {
    .ac-header  { padding:16px 16px 0; }
    .ac-kpi-row { padding:14px 16px 0; gap:10px; }
    .ac-body    { padding:14px 16px 24px; }
    .ac-title   { font-size:22px; }
    .ac-kpi     { padding:14px 14px 12px; }
    .ac-kpi-val { font-size:18px; }
    .ac-card-hd { padding:14px 16px; }
    .ac-toolbar { padding:10px 14px; flex-wrap:wrap; }
    .ac-filter-group { flex-wrap:wrap; gap:4px; }
    .ac-filter-btn   { padding:6px 10px; font-size:11px; }
    .ac-row     { padding:10px 14px; gap:10px; }
    .ac-type-tag{ display:none; }
    .ac-row-right { min-width:80px; }
    .ac-row-amount{ font-size:12px; }
    .ac-date-divider { padding:6px 14px 4px; }
    .ac-pagination { padding:10px 14px; flex-wrap:wrap; gap:8px; }
  }
  @media (max-width:400px) {
    .ac-kpi-row { grid-template-columns:1fr; }
    .ac-row-desc { font-size:12px; }
    .ac-page-info { display:none; }
  }
`;

/* ─── constants ── */
const PAGE_SIZE = 10;

/* ─── helpers ── */
const fmt$ = (v: number | string) => {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(n || 0);
};
const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

function labelDate(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const yest = new Date(today); yest.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yest.toDateString())  return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function txDir(tx: any): "credit" | "debit" | "neutral" {
  const d = (tx.description || "").toLowerCase();
  if (/revenue|collected|sales|received|contribution/.test(d)) return "credit";
  if (/salary|salaries|payroll|rent|bill|loan|payable|expense|purchase|restock|utilities/.test(d)) return "debit";
  return "neutral";
}
function txType(tx: any): string {
  const d = (tx.description || "").toLowerCase();
  if (/revenue|sales/.test(d))        return "Revenue";
  if (/salary|payroll/.test(d))       return "Payroll";
  if (/rent/.test(d))                 return "Rent";
  if (/invoice/.test(d))              return "Invoice";
  if (/receivable|collected/.test(d)) return "Receivable";
  if (/payable/.test(d))              return "Payable";
  if (/loan/.test(d))                 return "Loan";
  if (/bill|utilities/.test(d))       return "Utility";
  if (/purchase|restock/.test(d))     return "Purchase";
  if (/contribution/.test(d))         return "Capital";
  if (/consulting|service/.test(d))   return "Service";
  return "Transaction";
}

function groupByDate(txs: any[]) {
  const out: Record<string, any[]> = {};
  txs.forEach((tx) => { const k = new Date(tx.date).toDateString(); (out[k] ??= []).push(tx); });
  return out;
}

/* ─── sub-components ── */
function Shimmer() {
  return (
    <div style={{ padding:"12px 22px", display:"flex", flexDirection:"column", gap:10 }}>
      {[1,2,3,4,5].map(i=>(
        <div key={i} style={{ display:"flex", gap:12, alignItems:"center" }}>
          <div className="ac-shimmer" style={{ width:34,height:34,borderRadius:10,flexShrink:0 }}/>
          <div style={{ flex:1, display:"flex", flexDirection:"column", gap:5 }}>
            <div className="ac-shimmer" style={{ height:12,width:"52%",borderRadius:4 }}/>
            <div className="ac-shimmer" style={{ height:10,width:"28%",borderRadius:4 }}/>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:5,alignItems:"flex-end" }}>
            <div className="ac-shimmer" style={{ height:13,width:72,borderRadius:4 }}/>
            <div className="ac-shimmer" style={{ height:16,width:64,borderRadius:20 }}/>
          </div>
        </div>
      ))}
    </div>
  );
}

function DirIcon({ dir }: { dir:"credit"|"debit"|"neutral" }) {
  if (dir==="credit") return <ArrowDownLeft size={15} color="#15803d"/>;
  if (dir==="debit")  return <ArrowUpRight  size={15} color="#dc2626"/>;
  return <FileText size={15} color="#4F63D2"/>;
}
function StatusPill({ status }: { status:string }) {
  const s = (status||"").toLowerCase();
  const cls = s==="completed"?"completed":s==="pending"?"pending":"failed";
  return <span className={`ac-status ${cls}`}><span className="ac-status-dot"/>{status}</span>;
}

/* ─── MAIN ── */
export default function Activities() {
  const { data: transactions, isLoading } = trpc.transactions.list.useQuery({ limit: 200 });
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<"all"|"completed"|"pending">("all");
  const [page, setPage]                 = useState(1);

  /* stats */
  const stats = useMemo(()=>{
    if (!transactions) return { total:0,completed:0,pending:0,volume:0 };
    const completed = transactions.filter((t:any)=>(t.status||"").toLowerCase()==="completed").length;
    const pending   = transactions.filter((t:any)=>(t.status||"").toLowerCase()==="pending").length;
    const volume    = transactions.reduce((s:number,t:any)=>s+(parseFloat(t.amount)||0),0);
    return { total:transactions.length,completed,pending,volume };
  },[transactions]);

  /* filtered */
  const filtered = useMemo(()=>{
    if (!transactions) return [];
    return transactions.filter((tx:any)=>{
      const ms = !search||(tx.description||"").toLowerCase().includes(search.toLowerCase());
      const mf = statusFilter==="all"||(tx.status||"").toLowerCase()===statusFilter;
      return ms && mf;
    });
  },[transactions,search,statusFilter]);

  /* pagination */
  const totalPages = Math.max(1, Math.ceil(filtered.length/PAGE_SIZE));
  const safePage   = Math.min(page,totalPages);
  const pageSlice  = filtered.slice((safePage-1)*PAGE_SIZE, safePage*PAGE_SIZE);
  const grouped    = useMemo(()=>groupByDate(pageSlice),[pageSlice]);
  const dateKeys   = Object.keys(grouped);

  const handleSearch = (v:string) => { setSearch(v); setPage(1); };
  const handleFilter = (f:"all"|"completed"|"pending") => { setStatusFilter(f); setPage(1); };

  /* page nums (max 5 shown) */
  const pageNums = useMemo(()=>{
    const nums:number[]=[]; let lo=Math.max(1,safePage-2), hi=Math.min(totalPages,safePage+2);
    if(hi-lo<4){lo=Math.max(1,hi-4);hi=Math.min(totalPages,lo+4);}
    for(let i=lo;i<=hi;i++) nums.push(i);
    return nums;
  },[safePage,totalPages]);

  const KPIs = [
    { label:"Total Events", val:stats.total,       meta:"All recorded transactions",
      color:"#4F63D2",bg:"rgba(79,99,210,0.08)",bar:"linear-gradient(90deg,#4F63D2,#6B7FE3)",icon:<FileText size={16} color="#4F63D2"/> },
    { label:"Completed",    val:stats.completed,    meta:`${stats.total?((stats.completed/stats.total)*100).toFixed(0):0}% success rate`,
      color:"#15803d",bg:"rgba(21,128,61,0.08)",bar:"linear-gradient(90deg,#15803d,#22c55e)",icon:<CheckCircle2 size={16} color="#15803d"/> },
    { label:"Pending",      val:stats.pending,      meta:"Awaiting settlement",
      color:"#d97706",bg:"rgba(217,119,6,0.08)",bar:"linear-gradient(90deg,#d97706,#fbbf24)",icon:<Clock size={16} color="#d97706"/> },
    { label:"Total Volume", val:fmt$(stats.volume), meta:"Across all transactions",
      color:"#4F63D2",bg:"rgba(79,99,210,0.08)",bar:"linear-gradient(90deg,#4F63D2,#818cf8)",icon:<ArrowUpRight size={16} color="#4F63D2"/> },
  ];

  const filterBtns = [
    { id:"all" as const,       label:"All",       on:"on-all"  },
    { id:"completed" as const, label:"Completed", on:"on-done" },
    { id:"pending" as const,   label:"Pending",   on:"on-pend" },
  ];

  return (
    <div className="ac">
      <style>{css}</style>

      {/* ── HEADER ── */}
      <div className="ac-header">
        <div>
          <div className="ac-live-pill"><span className="ac-live-dot"/>LIVE FEED</div>
          <h1 className="ac-title">Activities</h1>
          <p className="ac-sub">Audit log of recent actions</p>
        </div>
        <button className="ac-btn-ghost"><Filter size={13}/>Export</button>
      </div>

      {/* ── KPI ROW ── */}
      <div className="ac-kpi-row">
        {KPIs.map((k,i)=>(
          <div className="ac-kpi" key={i}>
            <div className="ac-kpi-top">
              <span className="ac-kpi-label">{k.label}</span>
              <div className="ac-kpi-icon" style={{background:k.bg}}>{k.icon}</div>
            </div>
            <div className="ac-kpi-val" style={{color:k.color,animationDelay:`${0.1+i*0.05}s`}}>
              {isLoading?"—":k.val}
            </div>
            <div className="ac-kpi-meta">{k.meta}</div>
            <div className="ac-kpi-bar" style={{background:k.bar}}/>
          </div>
        ))}
      </div>

      {/* ── BODY ── */}
      <div className="ac-body">
        <div className="ac-card" style={{animationDelay:".15s"}}>

          {/* card header */}
          <div className="ac-card-hd">
            <div>
              <div className="ac-card-title">Activity Log</div>
              <div className="ac-card-sub">
                {isLoading ? "Loading…" : `Page ${safePage} of ${totalPages} · ${filtered.length} entries`}
              </div>
            </div>
            <span className="ac-badge" style={{background:"rgba(79,99,210,0.08)",color:"#4F63D2"}}>
              {isLoading?"—":filtered.length} {filtered.length===1?"entry":"entries"}
            </span>
          </div>

          {/* toolbar */}
          <div className="ac-toolbar">
            <div className="ac-search-wrap">
              <Search size={14} className="ac-search-icon"/>
              <input
                className="ac-search"
                placeholder="Search transactions…"
                value={search}
                onChange={e=>handleSearch(e.target.value)}
              />
            </div>
            <div className="ac-filter-group">
              {filterBtns.map(f=>(
                <button
                  key={f.id}
                  className={`ac-filter-btn${statusFilter===f.id?" "+f.on:""}`}
                  onClick={()=>handleFilter(f.id)}
                >{f.label}</button>
              ))}
            </div>
          </div>

          {/* content */}
          {isLoading ? (
            <Shimmer/>
          ) : filtered.length===0 ? (
            <div className="ac-empty">
              <div className="ac-empty-icon"><FileText size={20} color="#9CA3AF"/></div>
              <p className="ac-empty-msg">No activity matches your filters. Try adjusting your search.</p>
            </div>
          ) : (
            <>
              {/* scrollable feed — capped height, never overflows page */}
              <div className="ac-scroll-wrap">
                <div className="ac-scroll">
                  {dateKeys.map(dateKey=>{
                    const dayTxs = grouped[dateKey];
                    return (
                      <div key={dateKey}>
                        <div className="ac-date-divider">
                          <span className="ac-date-label">{labelDate(dateKey)}</span>
                          <div className="ac-date-line"/>
                          <span className="ac-date-count">{dayTxs.length} {dayTxs.length===1?"event":"events"}</span>
                        </div>
                        {dayTxs.map((tx:any,ri:number)=>{
                          const dir    = txDir(tx);
                          const iconBg = dir==="credit"?"rgba(21,128,61,0.08)":dir==="debit"?"rgba(220,38,38,0.06)":"rgba(79,99,210,0.08)";
                          return (
                            <div className="ac-row" key={tx.id} style={{animationDelay:`${ri*0.025}s`}}>
                              <div className="ac-row-icon" style={{background:iconBg}}><DirIcon dir={dir}/></div>
                              <div style={{flex:1,minWidth:0}}>
                                <div className="ac-row-desc">{tx.description}</div>
                                <div className="ac-row-meta">Transaction created · {fmtDate(tx.date)}</div>
                              </div>
                              <span className="ac-type-tag">{txType(tx)}</span>
                              <div className="ac-row-right">
                                <span className={`ac-row-amount ${dir}`}>
                                  {dir==="credit"?"+":dir==="debit"?"−":""}{fmt$(tx.amount)}
                                </span>
                                <StatusPill status={tx.status}/>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* pagination — always visible, no scroll needed */}
              <div className="ac-pagination">
                <span className="ac-page-info">
                  Showing{" "}
                  <strong>{(safePage-1)*PAGE_SIZE+1}–{Math.min(safePage*PAGE_SIZE,filtered.length)}</strong>
                  {" "}of <strong>{filtered.length}</strong>
                </span>
                <div className="ac-page-controls">
                  <button className="ac-page-btn" disabled={safePage<=1} onClick={()=>setPage(p=>p-1)}>
                    <ChevronLeft size={14}/>
                  </button>
                  <div className="ac-page-nums">
                    {pageNums.map(n=>(
                      <button key={n} className={`ac-page-num${n===safePage?" active":""}`} onClick={()=>setPage(n)}>{n}</button>
                    ))}
                  </div>
                  <button className="ac-page-btn" disabled={safePage>=totalPages} onClick={()=>setPage(p=>p+1)}>
                    <ChevronRight size={14}/>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
