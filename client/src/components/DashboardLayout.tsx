import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { trpc } from "@/lib/trpc"; // adjust path if your client trpc export lives elsewhere
import {
  LayoutDashboard, LogOut, BookOpen, Scale,
  BarChart2, TrendingDown, TrendingUp, Activity,
  User, HelpCircle, Plus, Menu, X, ChevronRight,
  Layers, FileText, Bell, Building2, Pencil, Check, Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pulse   { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
  @keyframes slideIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }

  .dl-root {
    display: flex;
    min-height: 100vh;
    font-family: 'Plus Jakarta Sans', sans-serif;
    background:
      radial-gradient(ellipse at 50% 0%, #A5B4F5 0%, #7D91E8 30%, #5F74C9 60%, #2D3585 100%);
    background-attachment: fixed;
  }

  /* ── SIDEBAR ── */
  .dl-sidebar {
    width: 210px;
    min-height: 100vh;
    background: #fff;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    position: sticky;
    top: 0;
    height: 100vh;
    transition: width 0.22s cubic-bezier(.4,0,.2,1);
    z-index: 40;
    border-right: 1px solid rgba(99,102,241,0.10);
    box-shadow: 2px 0 16px rgba(79,70,229,0.06);
  }
  .dl-sidebar.collapsed { width: 64px; }
  .dl-sidebar-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.35);
    z-index: 39; animation: fadeIn 0.15s ease;
  }

  /* SIDEBAR HEADER */
  .dl-sidebar-header {
    height: 70px;
    display: flex;
    align-items: center;
    padding: 0 14px;
    border-bottom: 1px solid rgba(99,102,241,0.08);
    gap: 10px;
    flex-shrink: 0;
  }
  .dl-logo-icon {
    width: 34px; height: 34px; flex-shrink: 0;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 12px rgba(99,102,241,0.3);
  }
  .dl-logo-text {
    display: flex; flex-direction: column; overflow: hidden;
    transition: opacity 0.15s;
  }
  .dl-logo-name {
    font-size: 14px; font-weight: 800; color: #1e1b4b;
    letter-spacing: -0.02em; line-height: 1; white-space: nowrap;
  }
  .dl-logo-name span { color: #4f46e5; }
  .dl-logo-sub {
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px; color: #a5b4fc; letter-spacing: 0.14em;
    text-transform: uppercase; margin-top: 3px; white-space: nowrap;
  }
  .dl-toggle-btn {
    margin-left: auto; flex-shrink: 0;
    width: 26px; height: 26px; border-radius: 7px;
    background: #f1f5f9; border: none;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.15s; color: #94a3b8;
  }
  .dl-toggle-btn:hover { background: #e0e7ff; color: #4f46e5; }

  /* NEW TRANSACTION BUTTON */
  .dl-new-tx-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    margin: 14px 10px 0; padding: 11px 14px;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 60%, #4338ca 100%);
    border: none; border-radius: 11px;
    color: #fff; font-size: 12.5px; font-weight: 700; letter-spacing: -0.01em;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; transition: all 0.20s cubic-bezier(0.22,1,0.36,1);
    box-shadow:
      0 1px 0 rgba(255,255,255,0.20) inset,
      0 6px 18px rgba(79,70,229,0.42),
      0 2px 4px rgba(79,70,229,0.25);
    white-space: nowrap; overflow: hidden; width: calc(100% - 20px);
    position: relative;
  }
  /* subtle top-edge highlight for a 3-D pill feel */
  .dl-new-tx-btn::before {
    content: ''; position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent);
    border-radius: 100%;
  }
  .dl-new-tx-btn:hover {
    background: linear-gradient(135deg, #818cf8 0%, #6366f1 60%, #4f46e5 100%);
    transform: translateY(-2px);
    box-shadow:
      0 1px 0 rgba(255,255,255,0.22) inset,
      0 10px 28px rgba(79,70,229,0.50),
      0 3px 8px rgba(79,70,229,0.28);
  }
  .dl-new-tx-btn:active { transform: translateY(0); box-shadow: 0 3px 10px rgba(79,70,229,0.35); }
  /* icon pip — small rounded square behind the + */
  .dl-new-tx-icon-pip {
    width: 18px; height: 18px; border-radius: 5px; flex-shrink: 0;
    background: rgba(255,255,255,0.20);
    display: flex; align-items: center; justify-content: center;
  }
  .dl-new-tx-icon { flex-shrink: 0; }

  /* SIDEBAR NAV */
  .dl-nav { flex: 1; padding: 10px 8px; overflow-y: auto; overflow-x: hidden; }
  .dl-nav-section { margin-bottom: 4px; }
  .dl-nav-label {
    font-size: 8.5px; font-weight: 700; color: #cbd5e1;
    letter-spacing: 0.18em; text-transform: uppercase;
    padding: 10px 10px 4px; white-space: nowrap;
  }
  .dl-nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 11px; border-radius: 10px;
    cursor: pointer; transition: all 0.16s cubic-bezier(0.22,1,0.36,1);
    color: #64748b;
    text-decoration: none; margin-bottom: 2px;
    position: relative; overflow: hidden;
    white-space: nowrap; font-size: 13px; font-weight: 500;
  }
  .dl-nav-item:hover {
    background: #eef2ff; color: #4338ca;
    transform: translateX(2px);
  }
  .dl-nav-item:hover .dl-nav-icon-wrap { background: #e0e7ff; }

  /* Active state — solid filled pill */
  .dl-nav-item.active {
    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
    color: #4338ca; font-weight: 700;
    box-shadow: 0 1px 4px rgba(99,102,241,0.12), 0 2px 8px rgba(99,102,241,0.08);
  }
  .dl-nav-item.active::before {
    content: ''; position: absolute; left: 0; top: 18%; bottom: 18%;
    width: 3.5px; background: linear-gradient(180deg, #818cf8, #4f46e5);
    border-radius: 0 3px 3px 0;
  }
  .dl-nav-item.active .dl-nav-icon-wrap { background: #c7d2fe; }

  /* Icon wrapper — adds a subtle tinted bg behind each icon */
  .dl-nav-icon-wrap {
    width: 28px; height: 28px; border-radius: 7px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: transparent;
    transition: background 0.16s;
  }
  .dl-nav-icon { width: 15px; height: 15px; flex-shrink: 0; }
  .dl-nav-label-text { transition: opacity 0.15s; }

  /* SIDEBAR FOOTER */
  .dl-sidebar-footer {
    padding: 10px 10px 14px;
    border-top: 1px solid rgba(99,102,241,0.10);
    flex-shrink: 0;
  }
  /* User card */
  .dl-user-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 11px; border-radius: 11px;
    cursor: default; width: 100%; background: #f8f9ff;
    border: 1px solid rgba(99,102,241,0.12);
    text-align: left; overflow: hidden; white-space: nowrap;
    box-shadow: 0 1px 3px rgba(99,102,241,0.06);
  }
  .dl-user-avatar {
    width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
    background: linear-gradient(140deg, #818cf8 0%, #4f46e5 100%);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 800; color: #fff;
    box-shadow: 0 2px 8px rgba(79,70,229,0.38);
  }
  .dl-user-name { font-size: 11.5px; font-weight: 600; color: #1e1b4b; line-height: 1; margin-bottom: 3px; }
  .dl-user-status { display: flex; align-items: center; gap: 4px; }
  .dl-status-dot { width: 5px; height: 5px; border-radius: 50%; background: #10b981; animation: pulse 2s ease infinite; flex-shrink: 0; }
  .dl-status-text { font-size: 9px; color: #94a3b8; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.06em; }

  /* Sign out */
  .dl-signout-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 11px; border-radius: 10px; width: 100%;
    background: #fff; border: 1.5px solid #fecaca;
    color: #ef4444; font-size: 12px; font-weight: 600;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer;
    transition: all 0.16s; margin-top: 8px; white-space: nowrap; overflow: hidden;
    box-shadow: 0 1px 3px rgba(239,68,68,0.08);
  }
  .dl-signout-btn:hover {
    background: #fef2f2; border-color: #fca5a5; color: #dc2626;
    box-shadow: 0 3px 10px rgba(239,68,68,0.14);
    transform: translateY(-1px);
  }
  .dl-signout-btn:active { transform: translateY(0); }

  /* ── MAIN CONTENT ── */
  .dl-main { flex: 1; display: flex; flex-direction: column; min-width: 0; height: 100vh; overflow: hidden; }

  /* TOP BAR */
  .dl-topbar {
    height: 64px; flex-shrink: 0;
    display: flex; align-items: center; gap: 12px;
    padding: 0 20px;
    background: rgba(255,255,255,0.18);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255,255,255,0.25);
    z-index: 30;
  }

  /* LOGO UPLOAD AREA */
  .dl-logo-upload {
    width: 42px; height: 42px; border-radius: 11px;
    border: 2px dashed rgba(255,255,255,0.5);
    background: rgba(255,255,255,0.15);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; cursor: pointer;
    transition: all 0.15s; overflow: hidden; position: relative;
  }
  .dl-logo-upload:hover { border-color: #fff; background: rgba(255,255,255,0.25); }
  .dl-logo-upload img { width: 100%; height: 100%; object-fit: cover; }
  .dl-logo-upload-overlay {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.15s;
  }
  .dl-logo-upload:hover .dl-logo-upload-overlay { opacity: 1; }

  /* COMPANY TITLE EDIT */
  .dl-company-wrap { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
  .dl-company-name {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(16px, 2vw, 22px);
    font-weight: 400; color: #fff;
    letter-spacing: -0.02em; white-space: nowrap;
    font-style: italic;
  }
  .dl-company-input {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(16px, 2vw, 22px);
    font-weight: 400; color: #fff;
    font-style: italic; letter-spacing: -0.02em;
    background: rgba(255,255,255,0.15);
    border: 1.5px solid rgba(255,255,255,0.5);
    border-radius: 8px; padding: 3px 10px;
    outline: none; width: 200px;
    animation: slideIn 0.15s ease;
  }
  .dl-company-input::placeholder { color: rgba(255,255,255,0.5); }
  .dl-company-input:focus { border-color: #fff; background: rgba(255,255,255,0.22); }
  .dl-edit-btn {
    width: 28px; height: 28px; border-radius: 7px;
    background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: rgba(255,255,255,0.8); transition: all 0.15s; flex-shrink: 0;
  }
  .dl-edit-btn:hover { background: rgba(255,255,255,0.28); color: #fff; }

  /* TOPBAR RIGHT */
  .dl-topbar-right {
    margin-left: auto; display: flex; align-items: center; gap: 8px;
  }
  .dl-topbar-user {
    display: flex; align-items: center; gap: 8px;
    padding: 5px 10px 5px 5px;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 22px; cursor: default;
  }
  .dl-topbar-avatar {
    width: 28px; height: 28px; border-radius: 50%;
    background: linear-gradient(135deg, #818cf8, #4f46e5);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 800; color: #fff; flex-shrink: 0;
  }
  .dl-topbar-email {
    font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.9);
    max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .dl-bell-btn {
    flex-shrink: 0; width: 36px; height: 36px;
    border-radius: 10px;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.25);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.15s; color: rgba(255,255,255,0.85);
  }
  .dl-bell-btn:hover { background: rgba(255,255,255,0.28); color: #fff; }

  /* PAGE CONTENT */
  .dl-content { flex: 1; overflow-y: auto; overflow-x: hidden; }

  /* MOBILE TOPBAR */
  .dl-mobile-bar {
    height: 60px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 16px;
    background: rgba(255,255,255,0.15); backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(255,255,255,0.2);
    position: sticky; top: 0; z-index: 40;
  }
  .dl-mobile-logo { display: flex; align-items: center; gap: 8px; }
  .dl-mobile-logo-name { font-size: 14px; font-weight: 800; color: #fff; letter-spacing: -0.02em; }
  .dl-mobile-menu-btn {
    width: 36px; height: 36px; border-radius: 9px;
    background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #fff;
  }

  /* COLLAPSED STATES */
  .dl-sidebar.collapsed .dl-logo-text,
  .dl-sidebar.collapsed .dl-nav-label,
  .dl-sidebar.collapsed .dl-nav-label-text,
  .dl-sidebar.collapsed .dl-user-name,
  .dl-sidebar.collapsed .dl-user-status,
  .dl-sidebar.collapsed .dl-signout-btn span,
  .dl-sidebar.collapsed .dl-new-tx-label {
    display: none;
  }
  .dl-sidebar.collapsed .dl-new-tx-btn {
    justify-content: center; padding: 10px; margin: 14px 10px 0; width: calc(100% - 20px);
  }
  .dl-sidebar.collapsed .dl-user-btn { justify-content: center; padding: 9px; background: transparent; border-color: transparent; box-shadow: none; }
  .dl-sidebar.collapsed .dl-nav-item { justify-content: center; padding: 9px; }
  .dl-sidebar.collapsed .dl-nav-item .dl-nav-icon-wrap { width: 32px; height: 32px; }
  .dl-sidebar.collapsed .dl-nav-item.active::before { display: none; }
  .dl-sidebar.collapsed .dl-signout-btn { justify-content: center; padding: 9px; }
  .dl-sidebar.collapsed .dl-new-tx-icon-pip { display: none; }
`;

const MAIN_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
];
const RECORD_ITEMS = [
  { icon: BookOpen, label: "Journal", path: "/journal" },
  { icon: Layers, label: "Ledger", path: "/ledger" },
  { icon: Scale, label: "Trial Balance", path: "/trial-balance" },
  { icon: FileText, label: "Reports", path: "/reports" },
];
const ANALYTICS_ITEMS = [
  { icon: TrendingDown, label: "Expenses", path: "/expenses" },
  { icon: TrendingUp, label: "Sales", path: "/sales" },
  { icon: Activity, label: "Activities", path: "/activities" },
];
const SUPPORT_ITEMS = [
  { icon: HelpCircle, label: "Help", path: "/help" },
  { icon: User, label: "Account", path: "/account" },
];

// Per-user localStorage cache keys — avoids flicker while DB fetch loads
const cacheKeys = (email?: string) => ({
  logo:  `mie_logo__${email ?? "guest"}`,
  title: `mie_title__${email ?? "guest"}`,
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const isMobile = useIsMobile();

  const cache = cacheKeys(user?.email ?? undefined);

  // Seed from cache immediately so there's no flash of "Company Name"
  const [companyTitle, setCompanyTitle] = useState<string>(
    () => localStorage.getItem(cache.title) || "Company Name"
  );
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(companyTitle);
  const [logoSrc, setLogoSrc] = useState<string | null>(
    () => localStorage.getItem(cache.logo)
  );
  const logoInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // tRPC: fetch company info from DB (runs when user is authenticated)
  const { data: companyInfo } = trpc.user.getCompanyInfo.useQuery(undefined, {
    enabled: !!user,
  });

  // tRPC: mutations to save back to DB
  const updateCompanyInfo = trpc.user.updateCompanyInfo.useMutation();

  // Sync DB values into state + cache when they arrive
  useEffect(() => {
    if (!companyInfo) return;
    const keys = cacheKeys(user?.email ?? undefined);
    if (companyInfo.companyName) {
      setCompanyTitle(companyInfo.companyName);
      setTitleDraft(companyInfo.companyName);
      localStorage.setItem(keys.title, companyInfo.companyName);
    }
    if (companyInfo.companyLogo !== undefined) {
      setLogoSrc(companyInfo.companyLogo ?? null);
      if (companyInfo.companyLogo) localStorage.setItem(keys.logo, companyInfo.companyLogo);
      else localStorage.removeItem(keys.logo);
    }
  }, [companyInfo]);

  useEffect(() => {
    if (editingTitle && titleInputRef.current) titleInputRef.current.focus();
  }, [editingTitle]);

  const saveTitle = () => {
    const val = titleDraft.trim() || "Company Name";
    setCompanyTitle(val);
    localStorage.setItem(cache.title, val);
    setEditingTitle(false);
    updateCompanyInfo.mutate({ companyName: val });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setLogoSrc(src);
      localStorage.setItem(cache.logo, src);
      updateCompanyInfo.mutate({ companyLogo: src });
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <DashboardLayoutSkeleton />;

  const isDev = import.meta.env.DEV;
  if (!user && !isDev) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(ellipse at 50% 0%, #A5B4F5 0%, #7D91E8 30%, #5F74C9 60%, #2D3585 100%)", backgroundAttachment: "fixed", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <style>{css}</style>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: 40, background: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", maxWidth: 360, width: "100%" }}>
          <div style={{ width: 48, height: 48, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LayoutDashboard size={22} color="#fff" />
          </div>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1e1b4b", margin: "0 0 6px" }}>Sign in to continue</h1>
            <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>Access to this dashboard requires authentication.</p>
          </div>
          <button onClick={() => { window.location.href = getLoginUrl(); }} style={{ width: "100%", padding: "11px", background: "linear-gradient(135deg,#4F46E5,#7C3AED)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const NavSection = ({ label, items }: { label: string; items: typeof MAIN_ITEMS }) => (
    <div className="dl-nav-section">
      {!collapsed && <div className="dl-nav-label">{label}</div>}
      {items.map(item => {
        const isActive = location === item.path;
        return (
          <div key={item.path} className={`dl-nav-item ${isActive ? "active" : ""}`}
            onClick={() => { setLocation(item.path); if (isMobile) setMobileOpen(false); }}>
            <div className="dl-nav-icon-wrap">
              <item.icon size={15} className="dl-nav-icon" />
            </div>
            <span className="dl-nav-label-text">{item.label}</span>
          </div>
        );
      })}
    </div>
  );

  const SidebarContent = () => (
    <>
      <div className="dl-sidebar-header">
        <div className="dl-logo-icon">
          <BarChart2 size={15} color="#fff" />
        </div>
        <div className="dl-logo-text">
          <span className="dl-logo-name">MIE <span>Prime</span></span>
          <span className="dl-logo-sub">Accounting</span>
        </div>
        {!isMobile && (
          <button className="dl-toggle-btn" onClick={() => setCollapsed(c => !c)}>
            {collapsed ? <ChevronRight size={13} /> : <Menu size={13} />}
          </button>
        )}
        {isMobile && (
          <button className="dl-toggle-btn" style={{ marginLeft: "auto" }} onClick={() => setMobileOpen(false)}>
            <X size={14} />
          </button>
        )}
      </div>

      <div style={{ padding: "12px 0 0" }}>
        <button className="dl-new-tx-btn" onClick={() => { setLocation("/transaction"); if (isMobile) setMobileOpen(false); }}>
          <div className="dl-new-tx-icon-pip"><Plus size={13} className="dl-new-tx-icon" /></div>
          <span className="dl-new-tx-label">New Transaction</span>
        </button>
      </div>

      <div className="dl-nav">
        <NavSection label="Main" items={MAIN_ITEMS} />
        <NavSection label="Records" items={RECORD_ITEMS} />
        <NavSection label="Analytics" items={ANALYTICS_ITEMS} />
        <NavSection label="Support" items={SUPPORT_ITEMS} />
      </div>

      <div className="dl-sidebar-footer">
        <div className="dl-user-btn">
          <div className="dl-user-avatar">{(user?.name || user?.email || "U")[0].toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="dl-user-name">{user?.email || "User"}</div>
            <div className="dl-user-status">
              <span className="dl-status-dot" />
              <span className="dl-status-text">Active · session</span>
            </div>
          </div>
        </div>
        <button className="dl-signout-btn" onClick={logout}>
          <LogOut size={12} />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  // Hidden file input for logo
  const LogoInput = () => (
    <input
      ref={logoInputRef}
      type="file"
      accept="image/*"
      style={{ display: "none" }}
      onChange={handleLogoChange}
    />
  );

  if (isMobile) {
    return (
      <div className="dl-root" style={{ flexDirection: "column" }}>
        <style>{css}</style>
        <LogoInput />
        <div className="dl-mobile-bar">
          <div className="dl-mobile-logo">
            <div className="dl-logo-icon" style={{ width: 28, height: 28, borderRadius: 7 }}><BarChart2 size={13} color="#fff" /></div>
            <span className="dl-mobile-logo-name">MIE Prime</span>
          </div>
          <button className="dl-mobile-menu-btn" onClick={() => setMobileOpen(true)}><Menu size={18} /></button>
        </div>
        {mobileOpen && (
          <>
            <div className="dl-sidebar-overlay" onClick={() => setMobileOpen(false)} />
            <div className="dl-sidebar" style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 260, zIndex: 50 }}>
              <SidebarContent />
            </div>
          </>
        )}
        <div className="dl-content" style={{ flex: 1 }}>{children}</div>
      </div>
    );
  }

  return (
    <div className="dl-root">
      <style>{css}</style>
      <LogoInput />

      {/* SIDEBAR */}
      <div className={`dl-sidebar ${collapsed ? "collapsed" : ""}`}>
        <SidebarContent />
      </div>

      {/* MAIN */}
      <div className="dl-main">
        {/* TOPBAR */}
        <div className="dl-topbar">

          {/* Logo upload */}
          <div
            className="dl-logo-upload"
            title="Click to upload company logo"
            onClick={() => logoInputRef.current?.click()}
          >
            {logoSrc
              ? <img src={logoSrc} alt="Company logo" />
              : <Building2 size={18} color="rgba(255,255,255,0.7)" />
            }
            <div className="dl-logo-upload-overlay">
              <Upload size={13} color="#fff" />
            </div>
          </div>

          {/* Company title */}
          <div className="dl-company-wrap">
            {editingTitle ? (
              <>
                <input
                  ref={titleInputRef}
                  className="dl-company-input"
                  value={titleDraft}
                  onChange={e => setTitleDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") setEditingTitle(false); }}
                  placeholder="Company name…"
                />
                <button className="dl-edit-btn" onClick={saveTitle} title="Save">
                  <Check size={13} />
                </button>
              </>
            ) : (
              <>
                <span className="dl-company-name">{companyTitle}</span>
                <button
                  className="dl-edit-btn"
                  onClick={() => { setTitleDraft(companyTitle); setEditingTitle(true); }}
                  title="Edit company name"
                >
                  <Pencil size={12} />
                </button>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="dl-topbar-right">
            <button className="dl-bell-btn" aria-label="Notifications">
              <Bell size={15} />
            </button>
            <div className="dl-topbar-user">
              <div className="dl-topbar-avatar">
                {(user?.name || user?.email || "U")[0].toUpperCase()}
              </div>
              <span className="dl-topbar-email">{user?.email || "User"}</span>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="dl-content">{children}</div>
      </div>
    </div>
  );
}
