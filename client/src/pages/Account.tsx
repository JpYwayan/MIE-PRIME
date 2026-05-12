import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import {
  User, Lock, Shield, Bell, Copy,
  Eye, EyeOff, Check, AlertTriangle,
  Trash2, LogOut,
} from "lucide-react";

/* ─── CSS ─────────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
  @keyframes pulse  { 0%,100% { opacity:1; } 50% { opacity:.4; } }
  @keyframes popIn  { from { opacity:0; transform:scale(.94) translateY(6px); } to { opacity:1; transform:none; } }

  .pg {
    font-family:'Outfit',sans-serif;
    --blue:#4F63D2; --blue3:rgba(79,99,210,0.08); --blue4:rgba(79,99,210,0.12);
    --green:#15803d; --green2:#dcfce7;
    --amber:#d97706; --amber2:#fef3c7;
    --red:#dc2626; --red2:#fef2f2; --red3:#fca5a5;
    --purple:#7c3aed; --purple2:rgba(124,58,237,0.08);
    --ink:#111827; --ink2:#1f2937; --ink3:#4B5563; --ink4:#9CA3AF;
    --surface:#ffffff; --surface2:#F9FAFB; --surface3:#F3F4F6;
    --border:rgba(17,24,39,0.09); --border2:rgba(17,24,39,0.05);
    min-height:100vh; background:transparent; color:var(--ink);
  }

  /* HEADER */
  .pg-header { padding:24px 28px 0; }
  .pg-pill {
    display:inline-flex; align-items:center; gap:6px;
    padding:3px 10px; background:rgba(255,255,255,0.28);
    border:1px solid rgba(255,255,255,0.42); border-radius:20px;
    font-size:9px; font-weight:700; color:#fff;
    font-family:'Space Mono',monospace; letter-spacing:.12em;
    text-transform:uppercase; margin-bottom:6px; width:fit-content;
  }
  .pg-pill-dot { width:5px; height:5px; background:#a5f3fc; border-radius:50%; animation:pulse 2s ease infinite; }
  .pg-title { font-size:27px; font-weight:800; color:#fff; letter-spacing:-.04em; margin:0 0 2px; }
  .pg-sub   { font-size:12px; color:rgba(255,255,255,.65); margin:0; font-weight:300; }

  /* BODY */
  .pg-body { padding:20px 28px 32px; display:flex; flex-direction:column; gap:18px; }

  /* TWO-COL */
  .pg-cols { display:grid; grid-template-columns:1fr 340px; gap:18px; align-items:start; }

  /* CARD */
  .pg-card {
    background:#fff; border:1px solid var(--border); border-radius:16px;
    box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 18px rgba(0,0,0,0.06);
    overflow:hidden; animation:fadeUp .45s ease both;
  }
  .pg-card-hd {
    padding:16px 22px;
    display:flex; align-items:center; gap:12px;
    border-bottom:1px solid var(--border2);
  }
  .pg-card-icon { width:32px; height:32px; border-radius:9px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .pg-card-eyebrow { font-size:9px; font-weight:700; color:var(--ink4); letter-spacing:.14em; text-transform:uppercase; font-family:'Space Mono',monospace; margin-bottom:2px; }
  .pg-card-title   { font-size:14px; font-weight:800; color:var(--ink); letter-spacing:-.03em; }

  /* PROFILE ROW */
  .pg-profile-row {
    display:flex; align-items:center; gap:14px;
    padding:18px 22px; border-bottom:1px solid var(--border2);
  }
  .pg-avatar {
    width:48px; height:48px; border-radius:13px; flex-shrink:0;
    background:linear-gradient(135deg,#818cf8,#4f46e5);
    display:flex; align-items:center; justify-content:center;
    font-size:20px; font-weight:800; color:#fff;
    box-shadow:0 4px 14px rgba(79,70,229,0.32);
  }
  .pg-profile-name  { font-size:15px; font-weight:800; color:var(--ink); letter-spacing:-.03em; }
  .pg-profile-email { font-size:12px; color:var(--ink4); margin-top:2px; }
  .pg-profile-meta  { display:flex; align-items:center; gap:6px; margin-top:6px; }
  .pg-dot { width:5px; height:5px; border-radius:50%; background:#10b981; animation:pulse 2s ease infinite; flex-shrink:0; }
  .pg-meta-label { font-size:10.5px; color:var(--ink4); font-weight:500; }
  .pg-meta-sep   { font-size:10.5px; color:var(--border); }
  .pg-meta-plan  { font-size:10.5px; font-weight:700; color:var(--blue); }

  /* FORM FIELDS */
  .pg-section-label {
    padding:14px 22px 8px;
    font-size:10px; font-weight:700; color:var(--ink4);
    letter-spacing:.14em; text-transform:uppercase; font-family:'Space Mono',monospace;
  }
  .pg-field-wrap { padding:0 22px 16px; display:flex; flex-direction:column; gap:4px; }
  .pg-field-wrap + .pg-field-wrap { padding-top:0; }
  .pg-label { font-size:12px; font-weight:600; color:var(--ink3); margin-bottom:6px; display:block; }
  .pg-input-wrap { position:relative; }
  .pg-input {
    width:100%; padding:10px 14px; border:1.5px solid var(--border); border-radius:10px;
    font-family:'Outfit',sans-serif; font-size:13.5px; font-weight:500;
    color:var(--ink); background:var(--surface2); outline:none;
    transition:border-color .15s,box-shadow .15s,background .15s;
  }
  .pg-input:focus { border-color:var(--blue); box-shadow:0 0 0 3px rgba(79,99,210,0.1); background:#fff; }
  .pg-input:read-only { color:var(--ink3); cursor:default; }
  .pg-input::placeholder { color:var(--ink4); font-weight:400; }
  .pg-input.has-icon { padding-right:82px; }
  .pg-input-actions {
    position:absolute; right:10px; top:50%; transform:translateY(-50%);
    display:flex; gap:4px;
  }
  .pg-icon-btn {
    width:28px; height:28px; border-radius:7px; border:none;
    background:var(--surface3); color:var(--ink4);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:all .15s;
  }
  .pg-icon-btn:hover { background:var(--blue3); color:var(--blue); }
  .pg-hint { font-size:11px; color:var(--ink4); margin-top:5px; }
  .pg-divider { height:1px; background:var(--border2); margin:8px 22px; }

  /* SUBMIT BTN */
  .pg-submit {
    margin:4px 22px 20px; padding:11px;
    background:var(--blue); color:#fff; border:none; border-radius:11px;
    font-family:'Outfit',sans-serif; font-size:13.5px; font-weight:700;
    cursor:pointer; transition:all .18s; display:flex; align-items:center; justify-content:center; gap:7px;
    box-shadow:0 4px 14px rgba(79,99,210,0.32);
  }
  .pg-submit:hover { background:var(--blue2); transform:translateY(-1px); box-shadow:0 6px 20px rgba(79,99,210,0.38); }
  .pg-submit:active { transform:none; }
  .pg-submit:disabled { opacity:.5; cursor:not-allowed; transform:none; }

  /* RIGHT COLUMN CARDS */
  .pg-right { display:flex; flex-direction:column; gap:14px; }

  /* TOGGLE ROW */
  .pg-toggle-row {
    display:flex; align-items:flex-start; justify-content:space-between;
    padding:14px 22px; border-bottom:1px solid var(--border2); gap:14px;
  }
  .pg-toggle-row:last-child { border-bottom:none; }
  .pg-toggle-label { font-size:13px; font-weight:700; color:var(--ink); letter-spacing:-.01em; }
  .pg-toggle-sub   { font-size:11.5px; color:var(--ink4); margin-top:2px; line-height:1.4; }
  .pg-toggle {
    width:42px; height:24px; border-radius:12px; border:none; flex-shrink:0;
    background:var(--surface3); cursor:pointer; position:relative; transition:background .2s; margin-top:2px;
  }
  .pg-toggle.on { background:var(--blue); }
  .pg-toggle::after {
    content:''; position:absolute; top:4px; left:4px;
    width:16px; height:16px; border-radius:50%; background:#fff;
    box-shadow:0 1px 3px rgba(0,0,0,0.25); transition:left .2s;
  }
  .pg-toggle.on::after { left:22px; }

  /* SESSION INFO */
  .pg-session-row {
    display:flex; align-items:center; justify-content:space-between;
    padding:12px 22px; border-bottom:1px solid var(--border2);
  }
  .pg-session-row:last-child { border-bottom:none; }
  .pg-session-key { font-size:12px; font-weight:600; color:var(--ink3); }
  .pg-session-val { font-size:12.5px; font-weight:700; }
  .pg-val-green  { color:var(--green); }
  .pg-val-blue   { color:var(--blue); }
  .pg-val-secure { color:var(--purple); }

  /* SAVE PREFS BTN */
  .pg-prefs-btn {
    margin:4px 22px 18px; padding:11px;
    background:var(--blue); color:#fff; border:none; border-radius:11px;
    font-family:'Outfit',sans-serif; font-size:13px; font-weight:700;
    cursor:pointer; transition:all .18s;
    box-shadow:0 4px 14px rgba(79,99,210,0.28);
  }
  .pg-prefs-btn:hover { background:var(--blue2); }

  /* SIGN OUT BTN */
  .pg-signout-btn {
    margin:0 22px 18px; padding:11px;
    background:#fff; color:var(--red); border:1.5px solid var(--red3); border-radius:11px;
    font-family:'Outfit',sans-serif; font-size:13px; font-weight:700;
    cursor:pointer; transition:all .18s; display:flex; align-items:center; justify-content:center; gap:7px;
  }
  .pg-signout-btn:hover { background:var(--red2); border-color:var(--red); }

  /* DANGER ZONE */
  .pg-danger-card {
    background:#fff; border:1.5px solid var(--red3); border-radius:16px;
    overflow:hidden; animation:fadeUp .55s ease both;
  }
  .pg-danger-hd {
    padding:14px 22px; background:#fff8f8; border-bottom:1px solid #fecaca;
    display:flex; align-items:center; gap:10px;
  }
  .pg-danger-eyebrow { font-size:9px; font-weight:700; color:var(--red); letter-spacing:.14em; text-transform:uppercase; font-family:'Space Mono',monospace; margin-bottom:2px; }
  .pg-danger-title   { font-size:14px; font-weight:800; color:var(--red); }
  .pg-danger-row {
    display:flex; align-items:center; justify-content:space-between;
    padding:16px 22px; border-bottom:1px solid #fef2f2; gap:16px;
  }
  .pg-danger-row:last-child { border-bottom:none; }
  .pg-danger-row-title { font-size:13px; font-weight:700; color:var(--ink); }
  .pg-danger-row-sub   { font-size:11.5px; color:var(--ink4); margin-top:2px; line-height:1.4; }
  .pg-danger-btn {
    padding:8px 16px; border-radius:9px; border:1.5px solid var(--red3);
    background:#fff; color:var(--red); font-family:'Outfit',sans-serif;
    font-size:12px; font-weight:700; cursor:pointer; transition:all .15s;
    display:flex; align-items:center; gap:6px; flex-shrink:0; white-space:nowrap;
  }
  .pg-danger-btn:hover { background:var(--red2); border-color:var(--red); }

  /* TOAST */
  .pg-toast {
    position:fixed; bottom:24px; right:28px; z-index:9999;
    display:flex; align-items:center; gap:10px;
    padding:12px 18px; border-radius:12px;
    font-size:13px; font-weight:600; font-family:'Outfit',sans-serif;
    box-shadow:0 8px 32px rgba(0,0,0,0.2);
    animation:popIn .25s ease both;
  }
  .pg-toast.success { background:#15803d; color:#fff; }
  .pg-toast.error   { background:#dc2626; color:#fff; }
  .pg-toast.info    { background:#111827; color:#fff; }
`;

/* ─── Toast ── */
function Toast({ msg, type, onDone }: { msg:string; type:"success"|"error"|"info"; onDone:()=>void }) {
  useEffect(()=>{ const t=setTimeout(onDone,2800); return ()=>clearTimeout(t); },[]);
  return <div className={`pg-toast ${type}`}><Check size={14}/>{msg}</div>;
}

/* ─── Toggle ── */
function Toggle({ on, onChange }: { on:boolean; onChange:(v:boolean)=>void }) {
  return <button className={`pg-toggle${on?" on":""}`} onClick={()=>onChange(!on)}/>;
}

/* ─── MAIN ── */
export default function Account() {
  const { user, logout } = useAuth();

  /* company info */
  const { data: companyInfo } = trpc.user.getCompanyInfo.useQuery(undefined, { enabled:!!user });
  const updateCompanyInfo = trpc.user.updateCompanyInfo.useMutation();

  /* toast */
  const [toast, setToast] = useState<{msg:string;type:"success"|"error"|"info"}|null>(null);
  const showToast = (msg:string, type:"success"|"error"|"info"="success") => setToast({msg,type});

  /* password form */
  const [newPw, setNewPw]           = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [showNew, setShowNew]       = useState(false);
  const [showConf, setShowConf]     = useState(false);
  const [savingPw, setSavingPw]     = useState(false);

  /* user ID masked */
  const [showId, setShowId]   = useState(false);
  const [copied, setCopied]   = useState(false);
  const userId = user?.id != null ? String(user.id) : "—";
  const maskedId = userId === "—" ? "—" : userId.length > 8 ? "••••••••••••••••••••••••-" + userId.slice(-8) : "••••••••";

  /* notifications */
  const [emailAlerts,  setEmailAlerts]  = useState(true);
  const [reportRemind, setReportRemind] = useState(false);
  const [secAlerts,    setSecAlerts]    = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(userId).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),1800); });
  };

  const handleChangePassword = async () => {
    if (!newPw || !confirmPw) { showToast("Please fill all password fields", "error"); return; }
    if (newPw !== confirmPw)  { showToast("New passwords do not match", "error"); return; }
    if (newPw.length < 8)    { showToast("Password must be at least 8 characters", "error"); return; }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setSavingPw(false);
    if (error) {
      showToast(error.message || "Failed to change password", "error");
    } else {
      setNewPw(""); setConfirmPw("");
      showToast("Password changed successfully");
    }
  };

  const handleSavePrefs = () => {
    showToast("Preferences saved");
  };

  const initials = (user?.name || user?.email || "U")[0].toUpperCase();

  return (
    <div className="pg">
      <style>{css}</style>

      {/* HEADER */}
      <div className="pg-header">
        <div className="pg-pill"><span className="pg-pill-dot"/>ACCOUNT SETTINGS</div>
        <h1 className="pg-title">Account Settings</h1>
        <p className="pg-sub">Manage your profile, security &amp; preferences</p>
      </div>

      <div className="pg-body">
        <div className="pg-cols">

          {/* ── LEFT COLUMN ── */}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>

            {/* Profile + Account Info */}
            <div className="pg-card" style={{animationDelay:".05s"}}>
              <div className="pg-card-hd">
                <div className="pg-card-icon" style={{background:"rgba(79,99,210,0.08)"}}>
                  <User size={15} color="#4F63D2"/>
                </div>
                <div>
                  <div className="pg-card-eyebrow">Profile</div>
                  <div className="pg-card-title">Account Information</div>
                </div>
              </div>

              {/* profile row */}
              <div className="pg-profile-row">
                <div className="pg-avatar">{initials}</div>
                <div>
                  <div className="pg-profile-name">{user?.email || "User"}</div>
                  <div className="pg-profile-meta">
                    <span className="pg-dot"/>
                    <span className="pg-meta-label">Active</span>
                    <span className="pg-meta-sep">·</span>
                    <span className="pg-meta-plan">MIE Prime Member</span>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="pg-section-label">Email Address</div>
              <div className="pg-field-wrap">
                <div className="pg-input-wrap">
                  <input className="pg-input" value={user?.email || ""} readOnly/>
                </div>
              </div>

              {/* User ID */}
              <div className="pg-section-label">User ID</div>
              <div className="pg-field-wrap">
                <div className="pg-input-wrap">
                  <input
                    className="pg-input has-icon"
                    value={showId ? userId : maskedId}
                    readOnly
                    style={{fontFamily:"'Space Mono',monospace",fontSize:12}}
                  />
                  <div className="pg-input-actions">
                    <button className="pg-icon-btn" onClick={()=>setShowId(s=>!s)} title={showId?"Hide":"Reveal"}>
                      {showId ? <EyeOff size={13}/> : <Eye size={13}/>}
                    </button>
                    <button className="pg-icon-btn" onClick={handleCopy} title="Copy ID">
                      {copied ? <Check size={13} color="#15803d"/> : <Copy size={13}/>}
                    </button>
                  </div>
                </div>
                <div className="pg-hint">Click the eye icon to reveal your full ID</div>
              </div>
            </div>

            {/* Change Password */}
            <div className="pg-card" style={{animationDelay:".10s"}}>
              <div className="pg-card-hd">
                <div className="pg-card-icon" style={{background:"rgba(124,58,237,0.08)"}}>
                  <Lock size={15} color="#7c3aed"/>
                </div>
                <div>
                  <div className="pg-card-eyebrow">Security</div>
                  <div className="pg-card-title">Change Password</div>
                </div>
              </div>

              <div className="pg-section-label">New Password</div>
              <div className="pg-field-wrap">
                <div className="pg-input-wrap">
                  <input
                    className="pg-input has-icon"
                    type={showNew?"text":"password"}
                    placeholder="Min. 8 characters"
                    value={newPw}
                    onChange={e=>setNewPw(e.target.value)}
                  />
                  <div className="pg-input-actions">
                    <button className="pg-icon-btn" onClick={()=>setShowNew(s=>!s)}>
                      {showNew?<EyeOff size={13}/>:<Eye size={13}/>}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pg-section-label">Confirm Password</div>
              <div className="pg-field-wrap">
                <div className="pg-input-wrap">
                  <input
                    className="pg-input has-icon"
                    type={showConf?"text":"password"}
                    placeholder="Repeat new password"
                    value={confirmPw}
                    onChange={e=>setConfirmPw(e.target.value)}
                    onKeyDown={e=>{ if(e.key==="Enter") handleChangePassword(); }}
                  />
                  <div className="pg-input-actions">
                    <button className="pg-icon-btn" onClick={()=>setShowConf(s=>!s)}>
                      {showConf?<EyeOff size={13}/>:<Eye size={13}/>}
                    </button>
                  </div>
                </div>
              </div>

              <button className="pg-submit" onClick={handleChangePassword} disabled={savingPw}>
                {savingPw ? "Saving…" : <><Lock size={13}/>Change Password</>}
              </button>
            </div>

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="pg-right">

            {/* Notifications */}
            <div className="pg-card" style={{animationDelay:".08s"}}>
              <div className="pg-card-hd">
                <div className="pg-card-icon" style={{background:"rgba(217,119,6,0.08)"}}>
                  <Bell size={15} color="#d97706"/>
                </div>
                <div>
                  <div className="pg-card-eyebrow">Preferences</div>
                  <div className="pg-card-title">Notifications</div>
                </div>
              </div>

              <div className="pg-toggle-row">
                <div>
                  <div className="pg-toggle-label">Email Alerts</div>
                  <div className="pg-toggle-sub">Transaction confirmations &amp; alerts</div>
                </div>
                <Toggle on={emailAlerts} onChange={setEmailAlerts}/>
              </div>
              <div className="pg-toggle-row">
                <div>
                  <div className="pg-toggle-label">Report Reminders</div>
                  <div className="pg-toggle-sub">Month-end financial summaries</div>
                </div>
                <Toggle on={reportRemind} onChange={setReportRemind}/>
              </div>
              <div className="pg-toggle-row">
                <div>
                  <div className="pg-toggle-label">Security Alerts</div>
                  <div className="pg-toggle-sub">Sign-in and account activity</div>
                </div>
                <Toggle on={secAlerts} onChange={setSecAlerts}/>
              </div>

              <div style={{height:8}}/>
              <button className="pg-prefs-btn" onClick={handleSavePrefs}>Save Preferences</button>
            </div>

            {/* Session Info */}
            <div className="pg-card" style={{animationDelay:".13s"}}>
              <div className="pg-card-hd">
                <div className="pg-card-icon" style={{background:"rgba(21,128,61,0.08)"}}>
                  <Shield size={15} color="#15803d"/>
                </div>
                <div>
                  <div className="pg-card-eyebrow">Session</div>
                  <div className="pg-card-title">Session Info</div>
                </div>
              </div>

              <div className="pg-session-row">
                <span className="pg-session-key">Status</span>
                <span className="pg-session-val pg-val-green">Active</span>
              </div>
              <div className="pg-session-row">
                <span className="pg-session-key">Auth Provider</span>
                <span className="pg-session-val pg-val-blue">Supabase</span>
              </div>
              <div className="pg-session-row">
                <span className="pg-session-key">Security</span>
                <span className="pg-session-val pg-val-secure">Secure</span>
              </div>

              <div style={{height:8}}/>
              <button className="pg-signout-btn" onClick={logout}>
                <LogOut size={13}/>Sign Out
              </button>
            </div>

            {/* Danger Zone */}
            <div className="pg-danger-card" style={{animationDelay:".18s" as any}}>
              <div className="pg-danger-hd">
                <div className="pg-card-icon" style={{background:"rgba(220,38,38,0.08)",flexShrink:0}}>
                  <AlertTriangle size={14} color="#dc2626"/>
                </div>
                <div>
                  <div className="pg-danger-eyebrow">Danger Zone</div>
                  <div className="pg-danger-title">Delete Account</div>
                </div>
              </div>
              <div className="pg-danger-row">
                <div>
                  <div className="pg-danger-row-title">Permanently delete account</div>
                  <div className="pg-danger-row-sub">All data will be removed. This cannot be undone.</div>
                </div>
                <button
                  className="pg-danger-btn"
                  onClick={()=>showToast("Contact support to delete your account","info")}
                >
                  <Trash2 size={12}/>Delete
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    </div>
  );
}
