import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  Loader2, ChevronRight, ChevronLeft, CheckCircle2,
  ArrowLeftRight, CalendarDays, FileText, Hash,
  Wallet, CreditCard, CircleDot, ChevronDown
} from "lucide-react";

const TYPE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  ASSET:     { bg: "#dbeafe", text: "#1d4ed8", dot: "#3b82f6" },
  LIABILITY: { bg: "#fce7f3", text: "#be185d", dot: "#ec4899" },
  EQUITY:    { bg: "#ede9fe", text: "#6d28d9", dot: "#8b5cf6" },
  REVENUE:   { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  EXPENSE:   { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

  @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes scaleIn { from { opacity:0; transform:scale(0.97); }      to { opacity:1; transform:scale(1); } }
  @keyframes checkPop { 0% { transform:scale(0); opacity:0; } 60% { transform:scale(1.2); } 100% { transform:scale(1); opacity:1; } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  @keyframes dropIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin { to { transform:rotate(360deg); } }

  .nt-wrap {
    font-family: 'Plus Jakarta Sans', sans-serif;
    padding: 28px 32px;
    animation: fadeUp 0.35s ease both;
  }

  /* PAGE HEADER */
  .nt-page-header { margin-bottom: 20px; }
  .nt-page-title { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.03em; line-height: 1.1; text-shadow: 0 2px 16px rgba(30,27,75,0.3); }
  .nt-page-sub   { font-size: 13px; color: rgba(255,255,255,0.80); margin-top: 4px; font-weight: 500; }

  /* STEPPER */
  .nt-stepper {
    display: flex; align-items: center;
    margin-bottom: 20px;
    background: rgba(10,8,50,0.40);
    backdrop-filter: blur(14px);
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 14px;
    padding: 14px 22px;
  }
  .nt-step-item { display: flex; align-items: center; flex: 1; }
  .nt-step-circle {
    width: 38px; height: 38px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 800; flex-shrink: 0;
    transition: all 0.25s ease; position: relative;
  }
  .nt-step-circle.done   { background: linear-gradient(135deg,#10b981,#059669); color:#fff; box-shadow:0 4px 14px rgba(16,185,129,.45); }
  .nt-step-circle.active { background: linear-gradient(135deg,#818cf8,#4f46e5); color:#fff; box-shadow:0 4px 20px rgba(99,102,241,.65); }
  .nt-step-circle.active::after { content:''; position:absolute; inset:-5px; border-radius:50%; border:2px solid rgba(129,140,248,.6); animation:pulse 2s ease infinite; }
  .nt-step-circle.pending { background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.65); border: 2px solid rgba(255,255,255,0.30); }
  .nt-step-info { margin-left: 10px; flex-shrink: 0; }
  .nt-step-num  { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.10em; line-height: 1; }
  .nt-step-num.active  { color: #c7d2fe; }
  .nt-step-num.done    { color: #6ee7b7; }
  .nt-step-num.pending { color: rgba(255,255,255,0.55); }
  .nt-step-name { font-size: 13px; font-weight: 700; margin-top: 2px; }
  .nt-step-name.active  { color: #fff; }
  .nt-step-name.done    { color: rgba(255,255,255,0.80); }
  .nt-step-name.pending { color: rgba(255,255,255,0.50); }
  .nt-step-line { flex:1; height:2px; margin:0 14px; border-radius:2px; transition:background .35s; }
  .nt-step-line.done    { background: linear-gradient(90deg,#10b981,#6366f1); }
  .nt-step-line.active  { background: linear-gradient(90deg,#6366f1,rgba(99,102,241,.25)); }
  .nt-step-line.pending { background: rgba(255,255,255,0.18); }

  /* CARD */
  .nt-card {
    background: rgba(255,255,255,0.96);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.95);
    box-shadow: 0 10px 48px rgba(30,27,75,0.22), 0 2px 8px rgba(79,70,229,0.10);
    overflow: visible;
    animation: scaleIn 0.3s ease both;
  }
  .nt-card-header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid rgba(99,102,241,0.09);
    background: linear-gradient(135deg,rgba(99,102,241,0.05) 0%,transparent 100%);
    border-radius: 20px 20px 0 0;
  }
  .nt-card-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: linear-gradient(135deg,#eef2ff,#e0e7ff);
    border: 1px solid #c7d2fe; border-radius: 20px;
    padding: 4px 12px; font-size: 11px; font-weight: 700;
    color: #4f46e5; letter-spacing: 0.06em; text-transform: uppercase;
    margin-bottom: 10px;
  }
  .nt-card-title { font-size: 20px; font-weight: 800; color: #1e1b4b; letter-spacing: -0.02em; }
  .nt-card-desc  { font-size: 13px; color: #64748b; margin-top: 4px; font-weight: 500; }
  .nt-card-body  { padding: 22px 24px; }
  .nt-card-footer {
    display: flex; justify-content: space-between; align-items: center;
    padding: 14px 24px;
    border-top: 1px solid rgba(99,102,241,0.08);
    background: rgba(99,102,241,0.02);
    border-radius: 0 0 20px 20px;
  }

  /* LABELS */
  .nt-field { margin-bottom: 18px; }
  .nt-label {
    display: flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 800; color: #4f46e5;
    text-transform: uppercase; letter-spacing: 0.10em; margin-bottom: 8px;
  }
  .nt-label-req { color: #ef4444; }

  /* CUSTOM DROPDOWN */
  .nt-dd { position: relative; }
  .nt-dd-trigger {
    width: 100%; padding: 11px 14px;
    border: 1.5px solid #c7d2fe; border-radius: 11px;
    background: linear-gradient(135deg,#f5f7ff,#eef2ff);
    display: flex; align-items: center; justify-content: space-between;
    cursor: pointer; transition: all .15s; user-select: none;
    font-family: 'Plus Jakarta Sans', sans-serif;
    box-sizing: border-box;
  }
  .nt-dd-trigger:hover  { border-color: #818cf8; background: #fff; }
  .nt-dd-trigger.open   { border-color: #6366f1; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,0.13); border-radius: 11px 11px 0 0; }
  .nt-dd-trigger.filled { background: #fff; border-color: #a5b4fc; }
  .nt-dd-placeholder { font-size: 13px; font-weight: 500; color: #94a3b8; }
  .nt-dd-selected { display: flex; align-items: center; gap: 8px; }
  .nt-dd-selected-name { font-size: 14px; font-weight: 700; color: #1e1b4b; }
  .nt-dd-chevron { color: #6366f1; transition: transform .2s; flex-shrink: 0; }
  .nt-dd-chevron.open { transform: rotate(180deg); }

  .nt-dd-menu {
    position: absolute; left: 0; right: 0; top: 100%;
    background: #fff;
    border: 1.5px solid #6366f1; border-top: none;
    border-radius: 0 0 12px 12px;
    box-shadow: 0 16px 40px rgba(30,27,75,0.18);
    z-index: 200; overflow: hidden;
    animation: dropIn 0.18s ease both;
    max-height: 280px; overflow-y: auto;
  }
  .nt-dd-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; cursor: pointer;
    transition: background .12s;
    border-bottom: 1px solid #f1f5f9;
  }
  .nt-dd-item:last-child { border-bottom: none; }
  .nt-dd-item:hover { background: #eef2ff; }
  .nt-dd-item.selected { background: #eef2ff; }
  .nt-dd-item-name { font-size: 13px; font-weight: 700; color: #1e1b4b; flex: 1; }

  .nt-type-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 8px; border-radius: 20px;
    font-size: 10px; font-weight: 800; letter-spacing: 0.08em;
    flex-shrink: 0; white-space: nowrap;
  }
  .nt-type-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

  /* ACCOUNT PAIR */
  .nt-account-pair { display: grid; grid-template-columns: 1fr auto 1fr; gap: 16px; align-items: end; }
  .nt-pair-arrow {
    display: flex; align-items: center; justify-content: center;
    width: 38px; height: 44px; border-radius: 10px;
    background: linear-gradient(135deg,#6366f1,#4f46e5);
    color: #fff; flex-shrink: 0;
    box-shadow: 0 4px 14px rgba(99,102,241,.35);
  }

  /* INPUTS */
  .nt-input {
    width: 100%; padding: 11px 14px;
    border: 1.5px solid #e2e8f0; border-radius: 11px;
    background: #fff; font-size: 14px; font-weight: 500; color: #1e1b4b;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: border-color .15s, box-shadow .15s; outline: none; box-sizing: border-box;
  }
  .nt-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
  .nt-input:hover { border-color: #a5b4fc; }
  .nt-input::placeholder { color: #cbd5e1; }
  .nt-input-prefix-wrap { position: relative; }
  .nt-input-prefix { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); font-size: 14px; font-weight: 700; color: #6366f1; font-family: 'JetBrains Mono', monospace; }
  .nt-input-prefix-wrap .nt-input { padding-left: 28px; }
  .nt-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  /* REVIEW */
  .nt-review { background: linear-gradient(135deg,#f8faff,#eef2ff); border: 1px solid #e0e7ff; border-radius: 14px; overflow: hidden; }
  .nt-review-header { padding: 12px 20px; background: linear-gradient(135deg,#4f46e5,#6366f1); font-size: 11px; font-weight: 800; color: rgba(255,255,255,0.90); letter-spacing: 0.10em; text-transform: uppercase; }
  .nt-review-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; border-bottom: 1px solid rgba(99,102,241,0.07); }
  .nt-review-row:last-child { border-bottom: none; }
  .nt-review-key { font-size: 12px; font-weight: 600; color: #64748b; display: flex; align-items: center; gap: 7px; }
  .nt-review-key svg { color: #a5b4fc; }
  .nt-review-val { font-size: 13px; font-weight: 700; color: #1e1b4b; font-family: 'JetBrains Mono', monospace; }
  .nt-review-val.amount { color: #4f46e5; font-size: 15px; }
  .nt-double-note { display: flex; align-items: center; gap: 8px; margin-top: 14px; padding: 10px 14px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; font-size: 12px; font-weight: 600; color: #16a34a; }

  /* SUCCESS */
  .nt-success { text-align: center; padding: 20px 0 10px; }
  .nt-success-icon { display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg,#10b981,#059669); box-shadow: 0 8px 28px rgba(16,185,129,.35); margin-bottom: 20px; animation: checkPop 0.5s cubic-bezier(.34,1.56,.64,1) both; }
  .nt-success-title { font-size: 22px; font-weight: 800; color: #1e1b4b; letter-spacing: -0.02em; margin-bottom: 8px; }
  .nt-success-sub { font-size: 13px; color: #64748b; font-weight: 500; max-width: 340px; margin: 0 auto 20px; line-height: 1.6; }
  .nt-success-amount { display: inline-block; font-family: 'JetBrains Mono', monospace; font-size: 32px; font-weight: 700; color: #4f46e5; background: linear-gradient(135deg,#eef2ff,#e0e7ff); border: 1px solid #c7d2fe; padding: 10px 28px; border-radius: 14px; margin-bottom: 24px; }

  /* BUTTONS */
  .nt-btn { display: inline-flex; align-items: center; gap: 7px; padding: 10px 20px; border-radius: 11px; font-size: 13px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; transition: all .15s; border: none; white-space: nowrap; }
  .nt-btn-ghost   { background: #f1f5f9; color: #64748b; border: 1.5px solid #e2e8f0; }
  .nt-btn-ghost:hover:not(:disabled)   { background: #e2e8f0; color: #374151; }
  .nt-btn-primary { background: linear-gradient(135deg,#6366f1,#4f46e5); color: #fff; box-shadow: 0 4px 14px rgba(79,70,229,.32); }
  .nt-btn-primary:hover:not(:disabled) { background: linear-gradient(135deg,#4f46e5,#4338ca); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(79,70,229,.42); }
  .nt-btn-success { background: linear-gradient(135deg,#10b981,#059669); color: #fff; box-shadow: 0 4px 14px rgba(16,185,129,.32); }
  .nt-btn-success:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(16,185,129,.42); }
  .nt-btn:disabled { opacity: .55; cursor: not-allowed; transform: none !important; }
  .nt-spin { animation: spin 1s linear infinite; }
`;

type Step = 1 | 2 | 3 | 4;
const STEPS = [
  { n: 1, name: "Accounts" },
  { n: 2, name: "Details" },
  { n: 3, name: "Review" },
  { n: 4, name: "Done" },
];

function AccountDropdown({ value, onChange, accounts, placeholder, disabled }: {
  value: string; onChange: (v: string) => void;
  accounts: any[]; placeholder: string; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = accounts.find((a: any) => a.id.toString() === value);
  const colors = selected ? (TYPE_COLORS[selected.type] ?? TYPE_COLORS.ASSET) : null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="nt-dd" ref={ref}>
      <div
        className={`nt-dd-trigger ${open ? "open" : ""} ${selected ? "filled" : ""}`}
        onClick={() => !disabled && setOpen(o => !o)}
      >
        {selected ? (
          <div className="nt-dd-selected">
            <span className="nt-type-badge" style={{ background: colors!.bg, color: colors!.text }}>
              <span className="nt-type-dot" style={{ background: colors!.dot }} />
              {selected.type}
            </span>
            <span className="nt-dd-selected-name">{selected.name}</span>
          </div>
        ) : (
          <span className="nt-dd-placeholder">{placeholder}</span>
        )}
        <ChevronDown size={15} className={`nt-dd-chevron ${open ? "open" : ""}`} />
      </div>

      {open && (
        <div className="nt-dd-menu">
          {accounts.map((a: any) => {
            const c = TYPE_COLORS[a.type] ?? TYPE_COLORS.ASSET;
            return (
              <div
                key={a.id}
                className={`nt-dd-item ${value === a.id.toString() ? "selected" : ""}`}
                onClick={() => { onChange(a.id.toString()); setOpen(false); }}
              >
                <span className="nt-type-badge" style={{ background: c.bg, color: c.text }}>
                  <span className="nt-type-dot" style={{ background: c.dot }} />
                  {a.type}
                </span>
                <span className="nt-dd-item-name">{a.name}</span>
                {value === a.id.toString() && <CheckCircle2 size={14} color="#6366f1" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function NewTransaction() {
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState({
    debitAccountId: "", creditAccountId: "",
    amount: "", date: new Date().toISOString().split("T")[0],
    description: "", quantity: "",
  });

  const utils = trpc.useUtils();
  const { data: accounts = [], isLoading: accountsLoading } = trpc.accounts.list.useQuery();
  const createTransaction = trpc.transactions.create.useMutation({
    onSuccess: () => {
      toast.success("Transaction created!");
      setStep(4);
      // Invalidate all dashboard queries so they refetch fresh data automatically
      utils.transactions.list.invalidate();
      utils.reports.trialBalance.invalidate();
      utils.reports.incomeStatement.invalidate();
      utils.reports.balanceSheet.invalidate();
      utils.activities.list.invalidate();
    },
    onError: (error: any) => toast.error(error.message || "Failed to create transaction"),
  });

  const handleNext = () => {
    if (step === 1) {
      if (!formData.debitAccountId || !formData.creditAccountId) { toast.error("Please select both accounts"); return; }
      if (formData.debitAccountId === formData.creditAccountId) { toast.error("Accounts must be different"); return; }
    } else if (step === 2) {
      if (!formData.amount || !formData.description) { toast.error("Please fill in all required fields"); return; }
    }
    setStep((step + 1) as Step);
  };

  const handleSubmit = async () => {
    try {
      await createTransaction.mutateAsync({
        date: new Date(formData.date), description: formData.description,
        amount: formData.amount,
        quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
        debitAccountId: parseInt(formData.debitAccountId),
        creditAccountId: parseInt(formData.creditAccountId),
      });
    } catch {}
  };

  const handleReset = () => {
    setFormData({ debitAccountId: "", creditAccountId: "", amount: "", date: new Date().toISOString().split("T")[0], description: "", quantity: "" });
    setStep(1);
  };

  const debitAccount  = (accounts as any[]).find((a: any) => a.id.toString() === formData.debitAccountId);
  const creditAccount = (accounts as any[]).find((a: any) => a.id.toString() === formData.creditAccountId);

  const stepMeta = [
    { label: "Select Accounts",     desc: "Choose the debit and credit accounts for this transaction" },
    { label: "Transaction Details", desc: "Enter the amount, date, and description" },
    { label: "Review",              desc: "Confirm your transaction before saving" },
    { label: "Confirmation",        desc: "Your transaction has been recorded" },
  ];

  return (
    <div className="nt-wrap">
      <style>{css}</style>

      <div className="nt-page-header">
        <h1 className="nt-page-title">New Transaction</h1>
        <p className="nt-page-sub">Create a new journal entry with debit and credit accounts</p>
      </div>

      {/* Stepper */}
      <div className="nt-stepper">
        {STEPS.map((s, i) => {
          const state = s.n < step ? "done" : s.n === step ? "active" : "pending";
          return (
            <div key={s.n} className="nt-step-item">
              <div className={`nt-step-circle ${state}`}>
                {state === "done" ? <CheckCircle2 size={16} /> : s.n}
              </div>
              <div className="nt-step-info">
                <div className={`nt-step-num ${state}`}>Step {s.n}</div>
                <div className={`nt-step-name ${state}`}>{s.name}</div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`nt-step-line ${s.n < step ? "done" : s.n === step ? "active" : "pending"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Card */}
      <div className="nt-card">
        <div className="nt-card-header">
          <div className="nt-card-badge"><CircleDot size={10} /> Step {step} of 4</div>
          <div className="nt-card-title">{stepMeta[step - 1].label}</div>
          <div className="nt-card-desc">{stepMeta[step - 1].desc}</div>
        </div>

        <div className="nt-card-body">
          {step === 1 && (
            <div className="nt-account-pair">
              <div className="nt-field" style={{ margin: 0 }}>
                <label className="nt-label"><Wallet size={13} /> Debit Account <span className="nt-label-req">*</span></label>
                <AccountDropdown value={formData.debitAccountId} onChange={v => setFormData({ ...formData, debitAccountId: v })} accounts={accounts as any[]} placeholder="Select debit account..." disabled={accountsLoading} />
              </div>
              <div className="nt-pair-arrow"><ArrowLeftRight size={15} /></div>
              <div className="nt-field" style={{ margin: 0 }}>
                <label className="nt-label"><CreditCard size={13} /> Credit Account <span className="nt-label-req">*</span></label>
                <AccountDropdown value={formData.creditAccountId} onChange={v => setFormData({ ...formData, creditAccountId: v })} accounts={accounts as any[]} placeholder="Select credit account..." disabled={accountsLoading} />
              </div>
            </div>
          )}

          {step === 2 && (
            <>
              <div className="nt-field-row">
                <div className="nt-field">
                  <label className="nt-label"><Wallet size={13} /> Amount <span className="nt-label-req">*</span></label>
                  <div className="nt-input-prefix-wrap">
                    <span className="nt-input-prefix">₱</span>
                    <input className="nt-input" type="number" step="0.01" placeholder="0.00" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                  </div>
                </div>
                <div className="nt-field">
                  <label className="nt-label"><Hash size={13} /> Quantity</label>
                  <input className="nt-input" type="number" placeholder="Optional" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                </div>
              </div>
              <div className="nt-field">
                <label className="nt-label"><CalendarDays size={13} /> Date <span className="nt-label-req">*</span></label>
                <input className="nt-input" type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div className="nt-field">
                <label className="nt-label"><FileText size={13} /> Description <span className="nt-label-req">*</span></label>
                <input className="nt-input" placeholder="Enter transaction description..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="nt-review">
                <div className="nt-review-header">Transaction Summary</div>
                {[
                  { icon: <Wallet size={13} />,       key: "Debit Account",  val: debitAccount?.name },
                  { icon: <CreditCard size={13} />,   key: "Credit Account", val: creditAccount?.name },
                  { icon: <Wallet size={13} />,       key: "Amount",         val: `₱${parseFloat(formData.amount||"0").toLocaleString("en-PH",{minimumFractionDigits:2})}`, cls: "amount" },
                  { icon: <CalendarDays size={13} />, key: "Date",           val: new Date(formData.date).toLocaleDateString("en-PH",{year:"numeric",month:"long",day:"numeric"}) },
                  { icon: <FileText size={13} />,     key: "Description",    val: formData.description, plain: true },
                  ...(formData.quantity ? [{ icon: <Hash size={13} />, key: "Quantity", val: formData.quantity }] : []),
                ].map(row => (
                  <div key={row.key} className="nt-review-row">
                    <span className="nt-review-key">{row.icon} {row.key}</span>
                    <span className={`nt-review-val ${row.cls||""}`} style={(row as any).plain ? { fontFamily:"inherit", fontSize:13 } : {}}>{row.val}</span>
                  </div>
                ))}
              </div>
              <div className="nt-double-note"><CheckCircle2 size={14} /> Double-entry enforced — Debit and Credit amounts are equal</div>
            </>
          )}

          {step === 4 && (
            <div className="nt-success">
              <div className="nt-success-icon"><CheckCircle2 size={36} color="#fff" /></div>
              <div className="nt-success-title">Transaction Recorded!</div>
              <p className="nt-success-sub">Your journal entry has been saved with equal debit and credit amounts.</p>
              <div className="nt-success-amount">₱{parseFloat(formData.amount||"0").toLocaleString("en-PH",{minimumFractionDigits:2})}</div>
            </div>
          )}
        </div>

        <div className="nt-card-footer">
          <button className="nt-btn nt-btn-ghost" onClick={() => step > 1 && setStep((step-1) as Step)} disabled={step === 1 || createTransaction.isPending}>
            <ChevronLeft size={15} /> Back
          </button>
          {step < 4 ? (
            <button className={`nt-btn ${step === 3 ? "nt-btn-success" : "nt-btn-primary"}`} onClick={step === 3 ? handleSubmit : handleNext} disabled={createTransaction.isPending}>
              {createTransaction.isPending && <Loader2 size={14} className="nt-spin" />}
              {step === 3 ? "Create Transaction" : "Continue"}
              {step < 3 && <ChevronRight size={15} />}
            </button>
          ) : (
            <button className="nt-btn nt-btn-primary" onClick={handleReset}><CheckCircle2 size={14} /> New Transaction</button>
          )}
        </div>
      </div>
    </div>
  );
}
