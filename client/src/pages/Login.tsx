import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, LogIn } from "lucide-react";

// ─── password strength ────────────────────────────────────────────────────────
function getStrength(pw: string): 0 | 1 | 2 | 3 {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 3) as 0 | 1 | 2 | 3;
}

const strengthLabel = ["", "Weak", "Fair", "Strong"] as const;
const strengthColor = ["", "#ef4444", "#f59e0b", "#10b981"] as const;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .lp-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #f8f7f4;
    color: #1a1a2e;
    min-height: 100svh;
    display: grid;
    grid-template-rows: auto 1fr auto;
    overflow-x: hidden;
  }

  .lp-bg {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 70% 50% at 15% 0%, rgba(99,102,241,0.10) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 85% 5%, rgba(16,185,129,0.07) 0%, transparent 55%),
      radial-gradient(ellipse 40% 50% at 50% 100%, rgba(245,158,11,0.05) 0%, transparent 60%);
  }

  /* ── Nav ── */
  .lp-nav {
    position: sticky; top: 0; z-index: 100; padding: 0 52px; height: 68px;
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(248,247,244,0.88); backdrop-filter: blur(18px);
    border-bottom: 1px solid rgba(0,0,0,0.06);
    transition: box-shadow 0.2s, background 0.2s;
  }
  .lp-nav.scrolled {
    box-shadow: 0 4px 24px rgba(0,0,0,0.07);
    background: rgba(248,247,244,0.97);
  }
  .lp-logo { display: flex; align-items: center; gap: 10px; font-size: 17px; font-weight: 700; color: #1a1a2e; letter-spacing: -0.03em; text-decoration: none; }
  .lp-logo-mark {
    width: 34px; height: 34px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    border-radius: 9px; display: flex; align-items: center; justify-content: center;
    font-size: 15px; font-weight: 800; color: #fff; flex-shrink: 0;
  }
  .lp-nav-back {
    display: inline-flex; align-items: center; gap: 7px; padding: 9px 18px;
    background: transparent; border: 1.5px solid #e2e8f0; border-radius: 10px;
    color: #475569; font-size: 14px; font-weight: 600;
    font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer;
    text-decoration: none; letter-spacing: -0.01em; transition: all 0.2s;
  }
  .lp-nav-back:hover { border-color: #cbd5e1; color: #1a1a2e; background: #fff; }
  @media (max-width: 768px) { .lp-nav { padding: 0 24px; } }

  /* ── Main ── */
  .lp-main {
    position: relative; z-index: 1;
    display: flex; align-items: center; justify-content: center;
    padding: 64px 24px;
  }

  .lp-card {
    width: 100%; max-width: 440px;
    background: #fff;
    border: 1px solid rgba(0,0,0,0.07);
    border-radius: 22px;
    padding: 40px 36px;
    box-shadow: 0 4px 32px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.6) inset;
    opacity: 0;
    transform: translateY(16px);
    transition: opacity .5s cubic-bezier(.22,1,.36,1), transform .5s cubic-bezier(.22,1,.36,1);
  }
  .lp-card.visible { opacity: 1; transform: translateY(0); }
  @media (max-width: 480px) { .lp-card { padding: 32px 24px; } }

  .lp-card-eyebrow {
    display: inline-flex; align-items: center; gap: 8px; padding: 5px 14px 5px 8px;
    background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 100px;
    font-size: 12px; font-weight: 600; color: #4f46e5; margin-bottom: 20px;
  }
  .lp-card-eyebrow-dot {
    width: 20px; height: 20px; background: #4f46e5; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }

  .lp-card-heading {
    font-family: 'Instrument Serif', serif;
    font-size: clamp(26px, 4vw, 32px);
    font-weight: 400; letter-spacing: -0.02em; line-height: 1.1;
    color: #1a1a2e; margin-bottom: 8px;
  }
  .lp-card-heading em { font-style: italic; color: #4f46e5; }
  .lp-card-sub { font-size: 14px; line-height: 1.65; color: #64748b; margin-bottom: 32px; font-weight: 400; }

  /* ── Fields ── */
  .lp-field { margin-bottom: 16px; }
  .lp-label {
    display: block; font-size: 13px; font-weight: 600; color: #374151;
    margin-bottom: 6px; letter-spacing: -0.01em;
  }
  .lp-input-wrap { position: relative; }
  .lp-input {
    width: 100%;
    background: #f8f7f4;
    border: 1.5px solid #e2e8f0;
    border-radius: 11px;
    padding: 11px 40px 11px 13px;
    font-size: 14px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #1a1a2e;
    outline: none;
    transition: border-color .18s, background .18s, box-shadow .18s;
  }
  .lp-input::placeholder { color: #94a3b8; }
  .lp-input:focus {
    border-color: #6366f1;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
  }
  .lp-input:disabled { opacity: .5; cursor: not-allowed; }

  .lp-eye {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; padding: 0; cursor: pointer;
    color: #94a3b8; line-height: 0; transition: color .15s;
  }
  .lp-eye:hover { color: #475569; }

  /* strength */
  .lp-strength { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
  .lp-strength-bars { display: flex; gap: 4px; flex: 1; }
  .lp-strength-bar {
    flex: 1; height: 3px; border-radius: 2px;
    background: #e2e8f0; transition: background .3s ease;
  }
  .lp-strength-text { font-size: 11px; font-weight: 600; letter-spacing: .03em; min-width: 32px; text-align: right; transition: color .3s; }

  /* ── Submit ── */
  .lp-submit {
    width: 100%; margin-top: 8px;
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 13px 24px;
    background: #4f46e5; border: none; border-radius: 12px; color: #fff;
    font-size: 15px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; letter-spacing: -0.02em;
    transition: all 0.2s;
    box-shadow: 0 4px 16px rgba(79,70,229,0.28);
    position: relative; overflow: hidden;
  }
  .lp-submit:hover:not(:disabled) { background: #4338ca; transform: translateY(-2px); box-shadow: 0 10px 28px rgba(79,70,229,0.38); }
  .lp-submit:active:not(:disabled) { transform: translateY(0); }
  .lp-submit:disabled { opacity: .5; cursor: not-allowed; box-shadow: none; }
  .lp-submit.busy::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.2), transparent);
    transform: translateX(-100%);
    animation: shimmer .85s ease-in-out infinite;
  }
  @keyframes shimmer { to { transform: translateX(100%) } }

  .lp-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 24px 0; color: #cbd5e1; font-size: 12px; font-weight: 500;
  }
  .lp-divider::before, .lp-divider::after {
    content: ''; flex: 1; height: 1px; background: #e2e8f0;
  }

  .lp-switch { text-align: center; font-size: 13px; color: #64748b; }
  .lp-switch button {
    background: none; border: none; padding: 0; cursor: pointer;
    color: #4f46e5; font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px; font-weight: 600; text-decoration: underline;
    text-underline-offset: 3px; transition: color .15s;
  }
  .lp-switch button:hover { color: #4338ca; }

  /* ── Footer ── */
  .lp-footer {
    position: relative; z-index: 1;
    text-align: center; padding: 24px;
    font-size: 12px; color: #94a3b8;
    border-top: 1px solid rgba(0,0,0,0.05);
  }
`;

export default function Login() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  const strength = mode === "signUp" ? getStrength(password) : 0;

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll);
    return () => { clearTimeout(t); window.removeEventListener("scroll", onScroll); };
  }, []);

  useEffect(() => { emailRef.current?.focus(); }, [mode]);

  const switchMode = () => {
    setMode((m) => (m === "signIn" ? "signUp" : "signIn"));
    setPassword("");
    setShowPw(false);
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password) { toast.error("Email and password are required."); return; }
    if (mode === "signUp" && strength < 2) { toast.error("Please use a stronger password."); return; }

    setLoading(true);
    try {
      if (mode === "signUp") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) { toast.error(error.message); return; }
        toast.success("Account created — you can now sign in.");
        setMode("signIn");
        setPassword("");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { toast.error(error.message); return; }

      const accessToken = data.session?.access_token;
      if (!accessToken) { toast.error("Login failed. Please try again."); return; }

      const res = await fetch("/api/auth/supabase-callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err?.message || "Login failed. Please try again.");
        return;
      }

      navigate("/dashboard");
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="lp-root">
        <div className="lp-bg" />

        {/* Nav */}
        <nav className={`lp-nav ${scrolled ? "scrolled" : ""}`}>
          <a href="/" className="lp-logo">
            <div className="lp-logo-mark">M</div>
            MIE Prime
          </a>
          <a href="/" className="lp-nav-back">← Back to home</a>
        </nav>

        {/* Card */}
        <main className="lp-main">
          <div className={`lp-card ${mounted ? "visible" : ""}`}>

            <div className="lp-card-eyebrow">
              <div className="lp-card-eyebrow-dot">
                <LogIn size={11} color="#fff" />
              </div>
              {mode === "signIn" ? "Secure sign-in" : "Create account"}
            </div>

            <h1 className="lp-card-heading">
              {mode === "signIn"
                ? <>Welcome <em>back.</em></>
                : <>Get <em>started.</em></>}
            </h1>
            <p className="lp-card-sub">
              {mode === "signIn"
                ? "Sign in to your MIE Prime workspace."
                : "Create your account — it only takes a moment."}
            </p>

            {/* Email */}
            <div className="lp-field">
              <label className="lp-label" htmlFor="lp-email">Email address</label>
              <div className="lp-input-wrap">
                <input
                  ref={emailRef}
                  id="lp-email"
                  className="lp-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  disabled={loading}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="lp-field">
              <label className="lp-label" htmlFor="lp-pw">Password</label>
              <div className="lp-input-wrap">
                <input
                  id="lp-pw"
                  className="lp-input"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  disabled={loading}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  autoComplete={mode === "signIn" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  className="lp-eye"
                  onClick={() => setShowPw((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {mode === "signUp" && password.length > 0 && (
                <div className="lp-strength">
                  <div className="lp-strength-bars">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className="lp-strength-bar"
                        style={{ background: strength >= n ? strengthColor[strength] : undefined }}
                      />
                    ))}
                  </div>
                  <span className="lp-strength-text" style={{ color: strengthColor[strength] }}>
                    {strengthLabel[strength]}
                  </span>
                </div>
              )}
            </div>

            <button
              className={`lp-submit ${loading ? "busy" : ""}`}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading
                ? mode === "signIn" ? "Signing in…" : "Creating account…"
                : mode === "signIn"
                  ? <><LogIn size={15} /> Sign in</>
                  : <>Get started <ArrowRight size={15} /></>}
            </button>

            <div className="lp-divider">or</div>

            <p className="lp-switch">
              {mode === "signIn" ? (
                <>Don't have an account?{" "}<button onClick={switchMode}>Sign up free</button></>
              ) : (
                <>Already have an account?{" "}<button onClick={switchMode}>Sign in</button></>
              )}
            </p>
          </div>
        </main>

        <footer className="lp-footer">
          © {new Date().getFullYear()} MIE Prime · All rights reserved.
        </footer>
      </div>
    </>
  );
}
