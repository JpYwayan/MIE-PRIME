import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { getLoginUrl, getSignupUrl } from "@/const";
import {
  ArrowRight, BarChart3, BookOpen, TrendingUp, Lock,
  CheckCircle2, ChevronRight, Sparkles, LogIn, Menu, X,
  ShieldCheck, Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #f8f7f4;
    --surface:   #ffffff;
    --surface-2: #f4f3f0;
    --surface-3: #eeedea;
    --ink:       #1a1a2e;
    --ink-2:     #475569;
    --ink-3:     #94a3b8;
    --accent:    #4f46e5;
    --accent-dk: #4338ca;
    --accent-lt: #eef2ff;
    --accent-bd: #c7d2fe;
    --green:     #10b981;
    --amber:     #f59e0b;
    --violet:    #7c3aed;
    --bd:        rgba(0,0,0,0.07);
    --bd-lt:     rgba(0,0,0,0.04);
    --sh-xs: 0 1px 3px rgba(0,0,0,0.05);
    --sh-sm: 0 2px 10px rgba(0,0,0,0.06);
    --sh-md: 0 8px 28px rgba(0,0,0,0.08);
    --sh-lg: 0 20px 56px rgba(0,0,0,0.10);
    --sh-xl: 0 40px 100px rgba(0,0,0,0.12);
    --r-xs: 8px; --r-sm: 11px; --r-md: 16px; --r-lg: 20px; --r-xl: 28px;
    --sans:  'Plus Jakarta Sans', system-ui, sans-serif;
    --serif: 'Instrument Serif', Georgia, serif;
    --mw:    1180px;
    --px:    52px; --px-sm: 28px; --px-xs: 20px;
  }

  html { scroll-behavior: smooth; }

  .home {
    font-family: var(--sans); background: var(--bg); color: var(--ink);
    min-height: 100vh; overflow-x: hidden;
    -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
  }

  /* Same background blobs as Login */
  .home-bg {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 70% 50% at 10% 0%,   rgba(99,102,241,0.10) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 88% 5%,   rgba(16,185,129,0.07) 0%, transparent 55%),
      radial-gradient(ellipse 40% 50% at 50% 100%,  rgba(245,158,11,0.05) 0%, transparent 60%);
  }

  /* ── NAV — mirrors Login nav exactly ── */
  .home-nav {
    position: sticky; top: 0; z-index: 100; height: 68px; padding: 0 var(--px);
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(248,247,244,0.88); backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border-bottom: 1px solid rgba(0,0,0,0.06);
    transition: box-shadow 0.2s, background 0.2s;
  }
  .home-nav.scrolled {
    box-shadow: 0 4px 24px rgba(0,0,0,0.07);
    background: rgba(248,247,244,0.97);
  }
  .home-logo {
    display: flex; align-items: center; gap: 10px; font-size: 17px; font-weight: 700;
    color: var(--ink); letter-spacing: -0.03em; text-decoration: none; flex-shrink: 0;
  }
  /* Logo mark — exactly like Login's lp-logo-mark */
  .home-logo-mark {
    width: 34px; height: 34px;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    border-radius: 9px; display: flex; align-items: center; justify-content: center;
    font-size: 15px; font-weight: 800; color: #fff; flex-shrink: 0;
    box-shadow: 0 2px 10px rgba(79,70,229,0.28);
  }
  .home-nav-links {
    display: flex; align-items: center; gap: 0;
    position: absolute; left: 50%; transform: translateX(-50%);
  }
  .home-nav-link {
    font-size: 14px; font-weight: 500; color: var(--ink-2); text-decoration: none;
    padding: 7px 18px; border-radius: 100px;
    transition: color 0.15s, background 0.15s; white-space: nowrap;
  }
  .home-nav-link:hover { color: var(--ink); background: rgba(0,0,0,0.04); }
  .home-nav-right { display: flex; align-items: center; gap: 8px; }
  /* Login link — lp-nav-back style */
  .home-nav-login {
    display: inline-flex; align-items: center; gap: 7px; padding: 9px 18px;
    background: transparent; border: 1.5px solid #e2e8f0; border-radius: 10px;
    color: var(--ink-2); font-size: 14px; font-weight: 600; font-family: var(--sans);
    cursor: pointer; text-decoration: none; letter-spacing: -0.01em; transition: all 0.2s;
  }
  .home-nav-login:hover { border-color: #cbd5e1; color: var(--ink); background: var(--surface); }
  /* CTA — lp-submit style */
  .home-nav-cta {
    display: inline-flex; align-items: center; gap: 6px; padding: 9px 20px;
    background: var(--accent); border: none; border-radius: 10px; color: #fff;
    font-size: 14px; font-weight: 700; font-family: var(--sans); cursor: pointer;
    text-decoration: none; letter-spacing: -0.02em; transition: all 0.2s;
    box-shadow: 0 4px 16px rgba(79,70,229,0.28);
  }
  .home-nav-cta:hover { background: var(--accent-dk); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(79,70,229,0.36); }
  .home-nav-hamburger {
    display: none; align-items: center; justify-content: center;
    width: 36px; height: 36px; border: 1.5px solid #e2e8f0; border-radius: 10px;
    background: var(--surface); cursor: pointer; color: var(--ink-2); transition: all 0.18s;
  }
  .home-nav-hamburger:hover { color: var(--ink); border-color: #cbd5e1; }

  /* Mobile menu */
  .home-mobile-menu {
    display: none; position: fixed; inset: 0; z-index: 200;
    background: rgba(248,247,244,0.97); backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px); flex-direction: column; padding: 20px var(--px-sm);
  }
  .home-mobile-menu.open { display: flex; }
  .home-mobile-menu-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 48px; }
  .home-mobile-menu-close {
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; border: 1.5px solid #e2e8f0; border-radius: 10px;
    background: transparent; cursor: pointer; color: var(--ink-2);
  }
  .home-mobile-nav-link {
    display: block; font-family: var(--serif); font-size: 34px; color: var(--ink);
    text-decoration: none; letter-spacing: -0.02em; padding: 18px 0;
    border-bottom: 1px solid rgba(0,0,0,0.06); transition: color 0.15s; line-height: 1;
  }
  .home-mobile-nav-link:hover { color: var(--accent); }
  .home-mobile-cta-group { margin-top: 40px; display: flex; flex-direction: column; gap: 10px; }
  .home-mobile-btn-primary {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 15px; background: var(--accent); border-radius: var(--r-sm);
    color: #fff; font-size: 15px; font-weight: 700; text-decoration: none;
    box-shadow: 0 4px 16px rgba(79,70,229,0.28);
  }
  .home-mobile-btn-secondary {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 15px; background: var(--surface); border: 1.5px solid #e2e8f0;
    border-radius: var(--r-sm); color: var(--ink-2); font-size: 15px;
    font-weight: 600; text-decoration: none;
  }

  @media (max-width: 860px)  { .home-nav-links { display: none; } }
  @media (max-width: 700px)  {
    .home-nav { padding: 0 var(--px-xs); }
    .home-nav-login, .home-nav-cta { display: none; }
    .home-nav-hamburger { display: flex; }
  }

  /* ── HERO ── */
  .home-hero {
    position: relative; z-index: 1;
    max-width: var(--mw); margin: 0 auto;
    padding: 80px var(--px) 72px;
    display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1.12fr);
    gap: 64px; align-items: center;
    min-height: calc(100vh - 68px);
  }
  @media (max-width: 1020px) {
    .home-hero { grid-template-columns: 1fr; min-height: unset; padding: 60px var(--px-sm) 52px; gap: 52px; }
  }
  @media (max-width: 600px) { .home-hero { padding: 48px var(--px-xs) 44px; gap: 40px; } }

  .home-hero-copy { display: flex; flex-direction: column; }

  /* Eyebrow — matches lp-card-eyebrow */
  .home-eyebrow {
    display: inline-flex; align-items: center; gap: 8px; align-self: flex-start;
    padding: 5px 14px 5px 8px;
    background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 100px;
    font-size: 12px; font-weight: 600; color: var(--accent); margin-bottom: 24px;
  }
  .home-eyebrow-pip {
    width: 20px; height: 20px; background: var(--accent); border-radius: 50%;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }

  /* H1 — Instrument Serif like lp-card-heading */
  .home-h1 {
    font-family: var(--serif);
    font-size: clamp(48px, 5.5vw, 76px);
    font-weight: 400; line-height: 1.02; letter-spacing: -0.02em;
    color: var(--ink); margin-bottom: 22px;
  }
  .home-h1 em { font-style: italic; color: var(--accent); }

  .home-sub {
    font-size: 16px; line-height: 1.76; color: var(--ink-2);
    margin-bottom: 36px; font-weight: 400; max-width: 400px;
  }
  .home-cta-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

  /* Primary — lp-submit */
  .home-btn-primary {
    display: inline-flex; align-items: center; gap: 8px; padding: 13px 24px;
    background: var(--accent); border: none; border-radius: 12px;
    color: #fff; font-size: 15px; font-weight: 700; font-family: var(--sans);
    cursor: pointer; text-decoration: none; transition: all 0.2s;
    box-shadow: 0 4px 16px rgba(79,70,229,0.28); letter-spacing: -0.02em;
  }
  .home-btn-primary:hover { background: var(--accent-dk); transform: translateY(-2px); box-shadow: 0 10px 28px rgba(79,70,229,0.38); }

  /* Ghost — lp-nav-back */
  .home-btn-ghost {
    display: inline-flex; align-items: center; gap: 7px; padding: 13px 22px;
    background: transparent; border: 1.5px solid #e2e8f0; border-radius: 12px;
    color: var(--ink-2); font-size: 15px; font-weight: 600; font-family: var(--sans);
    cursor: pointer; text-decoration: none; transition: all 0.18s;
  }
  .home-btn-ghost:hover { border-color: #cbd5e1; color: var(--ink); background: var(--surface); box-shadow: var(--sh-xs); }

  .home-trust { display: flex; align-items: center; gap: 18px; margin-top: 26px; flex-wrap: wrap; }
  .home-trust-item { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--ink-3); font-weight: 500; }
  .home-trust-sep { width: 3px; height: 3px; border-radius: 50%; background: var(--ink-3); opacity: 0.4; }

  /* ── HERO VISUAL ── */
  .home-hero-visual { position: relative; z-index: 1; padding: 40px 20px 40px 0; }
  @media (max-width: 1020px) { .home-hero-visual { padding: 28px 0; } }
  @media (max-width: 480px)  { .home-hero-visual { padding: 16px 0; } }

  /* Mockup — lp-card look */
  .home-mockup {
    background: var(--surface); border: 1px solid rgba(0,0,0,0.07); border-radius: 22px;
    overflow: hidden;
    box-shadow: 0 4px 32px rgba(0,0,0,0.07), 0 0 0 1px rgba(255,255,255,0.7) inset;
    position: relative; z-index: 1;
  }
  .home-mockup-bar {
    padding: 11px 16px; background: var(--surface-2); border-bottom: 1px solid var(--bd);
    display: flex; align-items: center; gap: 10px;
  }
  .home-mockup-dots { display: flex; gap: 5px; }
  .home-mockup-dot { width: 8px; height: 8px; border-radius: 50%; }
  .home-mockup-url-bar {
    flex: 1; height: 20px; background: rgba(0,0,0,0.05); border-radius: 6px;
    display: flex; align-items: center; padding: 0 10px;
    font-size: 9.5px; font-family: monospace; color: var(--ink-3);
  }
  .home-mockup-body { padding: 18px 16px 15px; }
  .home-mockup-toprow { display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; }
  .home-mockup-title { font-size: 13px; font-weight: 700; color: var(--ink); letter-spacing: -0.03em; }
  .home-mockup-subtitle { font-size: 9px; color: var(--ink-3); margin-top: 2px; font-family: monospace; }
  .home-mockup-action {
    display: flex; align-items: center; gap: 5px; padding: 6px 10px;
    background: var(--accent); border-radius: 7px; font-size: 10px; font-weight: 700; color: #fff;
  }
  .home-mockup-action-dot { width: 7px; height: 7px; background: rgba(255,255,255,0.35); border-radius: 2px; }
  .home-mockup-kpis { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-bottom: 14px; }
  .home-mockup-kpi { border: 1px solid var(--bd); border-radius: 11px; padding: 11px 10px 9px; background: var(--surface-2); position: relative; overflow: hidden; }
  .home-mockup-kpi-stripe { position: absolute; top: 0; left: 0; right: 0; height: 2px; }
  .home-mockup-kpi-badge { width: 21px; height: 21px; border-radius: 6px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; }
  .home-mockup-kpi-label { font-size: 7.5px; color: var(--ink-3); font-weight: 600; text-transform: uppercase; letter-spacing: 0.09em; margin-bottom: 5px; font-family: monospace; }
  .home-mockup-kpi-track { height: 3px; background: rgba(0,0,0,0.07); border-radius: 3px; overflow: hidden; margin-bottom: 5px; }
  .home-mockup-kpi-fill  { height: 100%; border-radius: 3px; }
  .home-mockup-kpi-value { font-size: 10.5px; font-weight: 700; color: var(--ink); font-family: monospace; }
  .home-mockup-chart { background: var(--surface-2); border: 1px solid var(--bd); border-radius: 11px; padding: 12px; margin-bottom: 12px; }
  .home-mockup-chart-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 11px; }
  .home-mockup-chart-title { font-size: 10px; font-weight: 700; color: var(--ink); }
  .home-mockup-chart-legend { display: flex; gap: 8px; }
  .home-mockup-chart-leg { display: flex; align-items: center; gap: 4px; font-size: 8px; color: var(--ink-3); }
  .home-mockup-chart-leg-dot { width: 5px; height: 5px; border-radius: 50%; }
  .home-mockup-bars { height: 64px; display: flex; align-items: flex-end; gap: 5px; }
  .home-mockup-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; }
  .home-mockup-bar-pair { display: flex; align-items: flex-end; gap: 2px; width: 100%; }
  .home-mockup-bar { flex: 1; border-radius: 3px 3px 0 0; min-height: 4px; }
  .home-mockup-bar-label { font-size: 7px; color: var(--ink-3); font-family: monospace; }
  .home-mockup-tx-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .home-mockup-tx-label { font-size: 10px; font-weight: 700; color: var(--ink); }
  .home-mockup-tx-more  { font-size: 8px; color: #818cf8; font-weight: 600; cursor: pointer; }
  .home-mockup-rows { display: flex; flex-direction: column; gap: 5px; }
  .home-mockup-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: var(--surface-2); border-radius: 8px; border: 1px solid var(--bd); }
  .home-mockup-row-l { display: flex; align-items: center; gap: 7px; }
  .home-mockup-row-avatar { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 800; flex-shrink: 0; }
  .home-mockup-row-name { height: 7px; border-radius: 3px; background: #dde3ed; margin-bottom: 4px; }
  .home-mockup-row-date { height: 5px; border-radius: 3px; background: #eaeff5; }
  .home-mockup-row-r { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
  .home-mockup-row-amt { height: 7px; border-radius: 3px; opacity: 0.6; }
  .home-mockup-row-tag { height: 5px; width: 22px; border-radius: 3px; background: #eaeff5; }

  /* Float cards */
  .home-float {
    position: absolute; background: var(--surface); border: 1px solid var(--bd);
    border-radius: var(--r-md); padding: 12px 16px;
    display: flex; align-items: center; gap: 12px;
    box-shadow: var(--sh-lg); z-index: 3; min-width: 172px;
    animation: floatY 5s ease-in-out infinite;
  }
  .home-float-1 { top: -4px; right: -6px; animation-delay: 0s; }
  .home-float-2 { bottom: -4px; left: -6px; animation-delay: 2.5s; }
  @media (max-width: 560px) { .home-float { display: none; } }
  @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
  .home-float-icon { width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
  .home-float-lbl  { font-size: 10px; color: var(--ink-3); font-weight: 500; margin-bottom: 4px; }
  .home-float-val  { font-size: 14px; font-weight: 800; color: var(--ink); letter-spacing: -0.03em; font-family: monospace; }
  .home-float-bar  { height: 4px; border-radius: 4px; background: rgba(0,0,0,0.08); overflow: hidden; width: 80px; }
  .home-float-fill { height: 100%; border-radius: 4px; }

  /* ── SHARED LAYOUT ── */
  .home-wrap { position: relative; z-index: 1; max-width: var(--mw); margin: 0 auto; padding: 0 var(--px); }
  @media (max-width: 768px) { .home-wrap { padding: 0 var(--px-sm); } }
  @media (max-width: 480px) { .home-wrap { padding: 0 var(--px-xs); } }
  .home-rule { height: 1px; background: linear-gradient(90deg, transparent 0%, var(--bd) 30%, var(--bd) 70%, transparent 100%); }
  .home-section { padding: 88px 0; }
  @media (max-width: 768px) { .home-section { padding: 64px 0; } }

  .home-label {
    display: inline-flex; align-items: center; gap: 8px; margin-bottom: 14px;
    font-size: 11px; font-weight: 700; color: var(--accent);
    letter-spacing: 0.12em; text-transform: uppercase;
  }
  .home-label::before { content:''; display:block; width:18px; height:2px; background:var(--accent); border-radius:2px; }

  /* Section headings — Instrument Serif */
  .home-section-h { font-family: var(--serif); font-size: clamp(32px,4vw,50px); font-weight: 400; color: var(--ink); line-height: 1.06; letter-spacing: -0.02em; margin-bottom: 14px; }
  .home-section-sub { font-size: 15.5px; color: var(--ink-2); line-height: 1.72; max-width: 450px; margin-bottom: 40px; }

  /* ── FEATURES ── */
  .home-feat-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
  @media (max-width: 960px) { .home-feat-grid { grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 480px) { .home-feat-grid { grid-template-columns: 1fr; } }

  .home-feat-card {
    background: var(--surface); border: 1px solid var(--bd); border-radius: var(--r-lg);
    padding: 28px 24px 26px; display: flex; flex-direction: column;
    transition: transform 0.24s cubic-bezier(0.22,1,0.36,1), border-color 0.22s, box-shadow 0.22s;
    cursor: default; position: relative; overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }
  .home-feat-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    border-radius: var(--r-lg) var(--r-lg) 0 0; opacity: 0; transition: opacity 0.28s;
  }
  .home-feat-card:hover { transform: translateY(-6px); border-color: rgba(0,0,0,0.10); box-shadow: 0 20px 48px rgba(0,0,0,0.10); }
  .home-feat-card:hover::before { opacity: 1; }
  .home-feat-card[data-accent="indigo"]::before { background: linear-gradient(90deg,#4f46e5,#818cf8); }
  .home-feat-card[data-accent="green"]::before  { background: linear-gradient(90deg,#10b981,#34d399); }
  .home-feat-card[data-accent="amber"]::before  { background: linear-gradient(90deg,#f59e0b,#fbbf24); }
  .home-feat-card[data-accent="violet"]::before { background: linear-gradient(90deg,#7c3aed,#a78bfa); }

  .home-feat-icon-wrap {
    width: 52px; height: 52px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 22px; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    transition: transform 0.24s cubic-bezier(0.22,1,0.36,1);
  }
  .home-feat-card:hover .home-feat-icon-wrap { transform: scale(1.08) rotate(-3deg); }
  .home-feat-card h3 { font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 10px; letter-spacing: -0.025em; line-height: 1.2; }
  .home-feat-card p { font-size: 13.5px; color: var(--ink-2); line-height: 1.65; flex: 1; }
  .home-feat-learn {
    display: inline-flex; align-items: center; gap: 4px; margin-top: 20px;
    font-size: 12px; font-weight: 700; color: var(--ink-3);
    transition: color 0.18s, gap 0.18s; text-decoration: none; width: fit-content;
  }
  .home-feat-card:hover .home-feat-learn { color: var(--accent); gap: 6px; }

  /* ── INCLUDED ── */
  .home-two-col { display: grid; grid-template-columns: 1fr 1.08fr; gap: 56px; align-items: stretch; }
  @media (max-width: 860px) { .home-two-col { grid-template-columns: 1fr; gap: 40px; } }
  .home-inc-left { display: flex; flex-direction: column; }
  .home-inc-left .home-section-h { max-width: 11ch; }

  .home-checklist { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  @media (max-width: 440px) { .home-checklist { grid-template-columns: 1fr; } }
  /* Check items — like lp-input */
  .home-check {
    display: flex; align-items: center; gap: 9px;
    font-size: 13px; color: var(--ink-2); font-weight: 500; line-height: 1.4;
    padding: 11px 13px; background: var(--surface);
    border: 1.5px solid #e2e8f0; border-radius: var(--r-xs);
    transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
  }
  .home-check:hover { border-color: #c7d2fe; box-shadow: 0 2px 12px rgba(99,102,241,0.08); background: #eef2ff; }
  .home-check-icon { color: var(--green); flex-shrink: 0; }

  /* Snapshot — dark panel for contrast */
  .home-snap {
    background: var(--ink); border-radius: var(--r-xl); padding: 40px 32px;
    position: relative; overflow: hidden; display: flex; flex-direction: column;
    box-shadow: 0 24px 64px rgba(0,0,0,0.15);
  }
  .home-snap::before {
    content:''; position:absolute; top:-100px; right:-100px; width:340px; height:340px;
    pointer-events:none; background: radial-gradient(ellipse, rgba(124,58,237,0.28), transparent 65%);
  }
  .home-snap::after {
    content:''; position:absolute; bottom:-60px; left:-60px; width:260px; height:260px;
    pointer-events:none; background: radial-gradient(ellipse, rgba(16,185,129,0.18), transparent 65%);
  }
  .home-snap-header { position:relative; z-index:1; margin-bottom: 28px; }
  .home-snap-label {
    display: inline-flex; align-items: center; gap: 6px;
    font-size:10px; font-weight:700; color:rgba(255,255,255,0.38);
    letter-spacing:0.14em; text-transform:uppercase; margin-bottom:12px;
  }
  .home-snap-label::before { content:''; display:block; width:14px; height:2px; background:rgba(255,255,255,0.25); border-radius:2px; }
  .home-snap-title { font-family:var(--serif); font-size:26px; font-weight:400; color:#fff; margin-bottom:8px; letter-spacing:-0.02em; line-height:1.15; }
  .home-snap-sub { font-size:13px; color:rgba(255,255,255,0.40); line-height:1.65; }
  .home-snap-rows { display:flex; flex-direction:column; gap:8px; position:relative; z-index:1; flex:1; justify-content:flex-end; }
  .home-snap-row {
    display:flex; align-items:center; justify-content:space-between; padding:13px 16px;
    background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.09);
    border-radius:var(--r-xs); transition:background 0.18s, border-color 0.18s;
  }
  .home-snap-row:hover { background:rgba(255,255,255,0.12); border-color:rgba(255,255,255,0.18); }
  .home-snap-row-l { display:flex; align-items:center; gap:10px; font-size:12.5px; color:rgba(255,255,255,0.55); font-weight:500; }
  .home-snap-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
  .home-snap-row-r { display:flex; align-items:center; gap:9px; }
  .home-snap-val { font-size:13.5px; font-weight:700; color:#fff; font-family:monospace; letter-spacing:-0.02em; }
  .home-snap-badge { font-size:9.5px; font-weight:700; padding:3px 8px; border-radius:6px; }
  .home-snap-badge.up { color:#34d399; background:rgba(52,211,153,0.14); }
  .home-snap-badge.dn { color:#f87171; background:rgba(248,113,113,0.14); }

  /* ── CTA — matches lp-card look ── */
  .home-cta-wrap { padding: 0 0 88px; }
  .home-cta-box {
    background: var(--surface); border: 1px solid var(--bd); border-radius: var(--r-xl);
    padding: 88px 64px; text-align: center; position: relative; overflow: hidden;
    box-shadow: 0 4px 32px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.7) inset;
  }
  @media (max-width: 600px) { .home-cta-box { padding: 56px 28px; } }
  .home-cta-box::before {
    content:''; position:absolute; top:-160px; left:50%; transform:translateX(-50%);
    width:640px; height:400px; pointer-events:none;
    background: radial-gradient(ellipse, rgba(99,102,241,0.10) 0%, transparent 60%);
  }
  .home-cta-kicker { font-size:11px; font-weight:700; color:var(--accent); opacity:0.7; letter-spacing:0.14em; text-transform:uppercase; margin-bottom:14px; position:relative; z-index:1; }
  .home-cta-title  { font-family:var(--serif); font-size:clamp(30px,4.5vw,54px); font-weight:400; color:var(--ink); margin-bottom:16px; letter-spacing:-0.02em; line-height:1.08; position:relative; z-index:1; }
  .home-cta-title em { font-style:italic; color:var(--accent); }
  .home-cta-sub    { font-size:15.5px; color:var(--ink-2); margin-bottom:44px; max-width:340px; margin-left:auto; margin-right:auto; line-height:1.72; position:relative; z-index:1; }
  .home-cta-btns   { display:flex; align-items:center; justify-content:center; gap:10px; flex-wrap:wrap; position:relative; z-index:1; }
  .home-cta-btn-main {
    display:inline-flex; align-items:center; gap:8px; padding:14px 28px;
    background:var(--accent); border:none; border-radius:12px; color:#fff;
    font-size:15px; font-weight:700; font-family:var(--sans); cursor:pointer;
    text-decoration:none; transition:all 0.2s; box-shadow:0 4px 16px rgba(79,70,229,0.28);
  }
  .home-cta-btn-main:hover { background:var(--accent-dk); transform:translateY(-2px); box-shadow:0 12px 32px rgba(79,70,229,0.38); }
  .home-cta-btn-ghost {
    display:inline-flex; align-items:center; gap:8px; padding:14px 24px;
    background:transparent; border:1.5px solid #e2e8f0; border-radius:12px; color:var(--ink-2);
    font-size:15px; font-weight:600; font-family:var(--sans); cursor:pointer;
    text-decoration:none; transition:all 0.18s;
  }
  .home-cta-btn-ghost:hover { border-color:#cbd5e1; color:var(--ink); background:var(--surface-2); }

  /* ── FOOTER ── */
  .home-footer {
    position:relative; z-index:1; border-top:1px solid var(--bd); padding:26px var(--px);
    display:flex; align-items:center; justify-content:space-between;
    font-size:12.5px; color:var(--ink-3); flex-wrap:wrap; gap:14px;
  }
  @media (max-width:768px) { .home-footer { padding:22px var(--px-sm); flex-direction:column; align-items:flex-start; gap:16px; } }
  @media (max-width:480px) { .home-footer { padding:22px var(--px-xs); } }
  .home-footer-brand { display:flex; align-items:center; gap:9px; font-weight:700; color:var(--ink); font-size:13.5px; letter-spacing:-0.03em; }
  .home-footer-mark  { width:22px; height:22px; background:linear-gradient(135deg,#6366f1,#4f46e5); border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:800; color:#fff; }
  .home-footer-links { display:flex; align-items:center; gap:2px; flex-wrap:wrap; }
  .home-footer-link  { color:var(--ink-3); text-decoration:none; padding:3px 10px; border-radius:6px; transition:color 0.15s, background 0.15s; }
  .home-footer-link:hover { color:var(--ink); background:rgba(0,0,0,0.04); }
  .home-footer-sep   { color:var(--bd); }

  /* ── ANIMATIONS ── */
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  .anim { animation: fadeUp 0.65s cubic-bezier(0.22,1,0.36,1) both; }
  .a1{animation-delay:0.00s} .a2{animation-delay:0.09s} .a3{animation-delay:0.18s}
  .a4{animation-delay:0.28s} .a5{animation-delay:0.40s}
`;

/* ── Data ── */
const months   = ['Jan','Feb','Mar','Apr','May','Jun'];
const incomeH  = [28,38,32,52,44,62];
const expenseH = [20,26,24,34,30,40];
const kpis = [
  { label:'Assets',   color:'#6366f1', bg:'#eef2ff', fill:68, value:'$124.8k' },
  { label:'Income',   color:'#10b981', bg:'#d1fae5', fill:54, value:'$18.3k'  },
  { label:'Expenses', color:'#f59e0b', bg:'#fef3c7', fill:38, value:'$9.2k'   },
];
const txRows = [
  { bg:'#eef2ff', ini:'SA', nameW:70, amtW:40, amtC:'#a5b4fc' },
  { bg:'#d1fae5', ini:'JE', nameW:84, amtW:34, amtC:'#6ee7b7' },
  { bg:'#fef3c7', ini:'EX', nameW:60, amtW:46, amtC:'#fcd34d' },
];
const snapRows = [
  { label:'Total Assets',   dot:'#6366f1', value:'$124,800', change:'+8.2%',  dir:'up' as const },
  { label:'Net Income',     dot:'#10b981', value:'$18,340',  change:'+12.5%', dir:'up' as const },
  { label:'Total Expenses', dot:'#f59e0b', value:'$9,210',   change:'+3.1%',  dir:'dn' as const },
  { label:"Owner's Equity", dot:'#8b5cf6', value:'$97,440',  change:'+6.4%',  dir:'up' as const },
];

/* ── Component ── */
export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !loading) setLocation('/dashboard');
  }, [isAuthenticated, loading, setLocation]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = () => { if (window.innerWidth > 700) setMenuOpen(false); };
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  if (loading)         return <div style={{ minHeight:'100vh', background:'#f8f7f4' }} />;
  if (isAuthenticated) return null;

  const features = [
    { icon: BookOpen,   color:'#4f46e5', bg:'#eef2ff', accent:'indigo', title:'Double-Entry',     desc:'Every transaction balanced. Debit-credit enforced at the core, always.' },
    { icon: BarChart3,  color:'#10b981', bg:'#d1fae5', accent:'green',  title:'Financial Reports', desc:'Income statement and balance sheet generated instantly, on demand.' },
    { icon: TrendingUp, color:'#f59e0b', bg:'#fef3c7', accent:'amber',  title:'Live Analytics',    desc:'Track cashflow, income, and expenses updating in real time.' },
    { icon: Lock,       color:'#7c3aed', bg:'#ede9fe', accent:'violet', title:'Secure & Private',  desc:'Encrypted, access-controlled. Your data stays yours, period.' },
  ];

  const checks = [
    'Financial dashboard','Transaction wizard',
    'Chart of accounts','General ledger',
    'Trial balance','Financial statements',
    'Expense tracking','Audit log',
  ];

  return (
    <div className="home">
      <style>{css}</style>
      <div className="home-bg" />

      {/* Mobile drawer */}
      <div className={`home-mobile-menu${menuOpen ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="Navigation menu">
        <div className="home-mobile-menu-top">
          <div className="home-logo">
            <div className="home-logo-mark" aria-hidden="true">M</div>
            MIE Prime
          </div>
          <button className="home-mobile-menu-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X size={17} />
          </button>
        </div>
        <a href="#features" className="home-mobile-nav-link" onClick={() => setMenuOpen(false)}>Features</a>
        <a href="#included" className="home-mobile-nav-link" onClick={() => setMenuOpen(false)}>What's included</a>
        <div className="home-mobile-cta-group">
          <a href={getSignupUrl()} className="home-mobile-btn-primary">Get started free <ArrowRight size={15} aria-hidden="true" /></a>
          <a href={getLoginUrl()} className="home-mobile-btn-secondary"><LogIn size={14} aria-hidden="true" /> Log in</a>
        </div>
      </div>

      {/* Nav */}
      <nav className={`home-nav${scrolled ? ' scrolled' : ''}`} aria-label="Main navigation">
        <a href="/" className="home-logo">
          <div className="home-logo-mark" aria-hidden="true">M</div>
          MIE Prime
        </a>
        <div className="home-nav-links">
          <a href="#features" className="home-nav-link">Features</a>
          <a href="#included" className="home-nav-link">What's included</a>
        </div>
        <div className="home-nav-right">
          <a href={getLoginUrl()} className="home-nav-login"><LogIn size={13} aria-hidden="true" /> Log in</a>
          <a href={getSignupUrl()} className="home-nav-cta">Get started <ArrowRight size={13} aria-hidden="true" /></a>
          <button className="home-nav-hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}>
            <Menu size={16} />
          </button>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="home-hero" aria-labelledby="hero-h">
        <div className="home-hero-copy">
          <div className="home-eyebrow anim a1" aria-hidden="true">
            <div className="home-eyebrow-pip"><Sparkles size={10} color="#fff" /></div>
            Double-entry accounting, simplified
          </div>
          <h1 className="home-h1 anim a2" id="hero-h">
            Your finances,<br /><em>finally clear.</em>
          </h1>
          <p className="home-sub anim a3">
            MIE Prime is a double-entry bookkeeping system built for small businesses. Precise, clean, and genuinely easy to use.
          </p>
          <div className="home-cta-row anim a4">
            <a href={getSignupUrl()} className="home-btn-primary">Get started free <ArrowRight size={14} aria-hidden="true" /></a>
            <a href={getLoginUrl()}  className="home-btn-ghost"><LogIn size={13} aria-hidden="true" /> Log in</a>
          </div>
          <div className="home-trust anim a5">
            <span className="home-trust-item"><ShieldCheck size={12} color="#10b981" aria-hidden="true" /> No credit card required</span>
            <div className="home-trust-sep" />
            <span className="home-trust-item"><Zap size={12} color="#f59e0b" aria-hidden="true" /> Set up in minutes</span>
            <div className="home-trust-sep" />
            <span className="home-trust-item"><CheckCircle2 size={12} color="#4f46e5" aria-hidden="true" /> Free forever plan</span>
          </div>
        </div>

        <div className="home-hero-visual anim a3" aria-hidden="true">
          <div className="home-float home-float-1">
            <div className="home-float-icon" style={{ background:'#eef2ff' }}><TrendingUp size={15} color="#4f46e5" /></div>
            <div>
              <div className="home-float-lbl">Revenue this month</div>
              <div className="home-float-val">$18,340</div>
            </div>
          </div>

          <div className="home-mockup">
            <div className="home-mockup-bar">
              <div className="home-mockup-dots">
                <div className="home-mockup-dot" style={{ background:'#fca5a5' }} />
                <div className="home-mockup-dot" style={{ background:'#fcd34d' }} />
                <div className="home-mockup-dot" style={{ background:'#6ee7b7' }} />
              </div>
              <div className="home-mockup-url-bar">mie-prime · Dashboard</div>
            </div>
            <div className="home-mockup-body">
              <div className="home-mockup-toprow">
                <div>
                  <div className="home-mockup-title">Dashboard</div>
                  <div className="home-mockup-subtitle">Financial overview · demo data</div>
                </div>
                <div className="home-mockup-action">
                  <div className="home-mockup-action-dot" />
                  New Transaction
                </div>
              </div>
              <div className="home-mockup-kpis">
                {kpis.map(({ label, color, bg, fill, value }) => (
                  <div className="home-mockup-kpi" key={label}>
                    <div className="home-mockup-kpi-stripe" style={{ background: color }} />
                    <div className="home-mockup-kpi-badge" style={{ background: bg }}>
                      <div style={{ width:9, height:9, borderRadius:2, background:color, opacity:0.72 }} />
                    </div>
                    <div className="home-mockup-kpi-label">{label}</div>
                    <div className="home-mockup-kpi-track">
                      <div className="home-mockup-kpi-fill" style={{ width:`${fill}%`, background:color }} />
                    </div>
                    <div className="home-mockup-kpi-value">{value}</div>
                  </div>
                ))}
              </div>
              <div className="home-mockup-chart">
                <div className="home-mockup-chart-head">
                  <div className="home-mockup-chart-title">Cashflow trend <span style={{ color:'#bbbbd8', fontWeight:400 }}>— demo</span></div>
                  <div className="home-mockup-chart-legend">
                    <div className="home-mockup-chart-leg"><div className="home-mockup-chart-leg-dot" style={{ background:'#818cf8' }} />Income</div>
                    <div className="home-mockup-chart-leg"><div className="home-mockup-chart-leg-dot" style={{ background:'#fca5a5' }} />Expenses</div>
                  </div>
                </div>
                <div className="home-mockup-bars">
                  {months.map((m, i) => (
                    <div className="home-mockup-bar-col" key={m}>
                      <div className="home-mockup-bar-pair">
                        <div className="home-mockup-bar" style={{ height:incomeH[i],  background:'#818cf8' }} />
                        <div className="home-mockup-bar" style={{ height:expenseH[i], background:'#fca5a5' }} />
                      </div>
                      <div className="home-mockup-bar-label">{m}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="home-mockup-tx-row">
                <div className="home-mockup-tx-label">Recent transactions</div>
                <div className="home-mockup-tx-more">View all →</div>
              </div>
              <div className="home-mockup-rows">
                {txRows.map((r, i) => (
                  <div className="home-mockup-row" key={i}>
                    <div className="home-mockup-row-l">
                      <div className="home-mockup-row-avatar" style={{ background:r.bg, color:r.amtC }}>{r.ini}</div>
                      <div>
                        <div className="home-mockup-row-name" style={{ width:r.nameW }} />
                        <div className="home-mockup-row-date" style={{ width:r.nameW*0.55 }} />
                      </div>
                    </div>
                    <div className="home-mockup-row-r">
                      <div className="home-mockup-row-amt" style={{ width:r.amtW, background:r.amtC }} />
                      <div className="home-mockup-row-tag" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="home-float home-float-2">
            <div className="home-float-icon" style={{ background:'#d1fae5' }}><CheckCircle2 size={15} color="#10b981" /></div>
            <div>
              <div className="home-float-lbl">Books balanced</div>
              <div className="home-float-bar"><div className="home-float-fill" style={{ width:'100%', background:'#6ee7b7' }} /></div>
            </div>
          </div>
        </div>
      </section>

      <div className="home-wrap"><div className="home-rule" /></div>

      {/* ══ FEATURES ══ */}
      <section className="home-section" id="features" aria-labelledby="feat-h">
        <div className="home-wrap">
          <div className="home-label">Features</div>
          <h2 className="home-section-h" id="feat-h">Built on solid accounting fundamentals.</h2>
          <p className="home-section-sub">No shortcuts. Clean double-entry accounting designed for real businesses.</p>
          <div className="home-feat-grid">
            {features.map(({ icon: Icon, color, bg, title, desc, accent }) => (
              <div className="home-feat-card" key={title} data-accent={accent}>
                <div className="home-feat-icon-wrap" style={{ background: bg }}>
                  <Icon size={22} color={color} aria-hidden="true" />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
                <span className="home-feat-learn" aria-hidden="true">
                  Learn more <ChevronRight size={12} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="home-wrap"><div className="home-rule" /></div>

      {/* ══ INCLUDED ══ */}
      <section className="home-section" id="included" aria-labelledby="inc-h">
        <div className="home-wrap">
          <div className="home-two-col">
            <div className="home-inc-left">
              <div className="home-label">What's included</div>
              <h2 className="home-section-h" id="inc-h">Everything,<br/>from day one.</h2>
              <p className="home-section-sub" style={{ marginBottom:28 }}>
                No add-ons. No upsells. The full accounting suite, out of the box.
              </p>
              <div className="home-checklist">
                {checks.map(c => (
                  <div className="home-check" key={c}>
                    <CheckCircle2 size={13} className="home-check-icon" aria-hidden="true" />
                    {c}
                  </div>
                ))}
              </div>
            </div>
            <div className="home-snap">
              <div className="home-snap-header">
                <div className="home-snap-label">Live snapshot</div>
                <div className="home-snap-title">Your numbers,<br/>at a glance.</div>
                <div className="home-snap-sub">All figures update in real time as you record transactions.</div>
              </div>
              <div className="home-snap-rows">
                {snapRows.map(({ label, dot, value, change, dir }) => (
                  <div className="home-snap-row" key={label}>
                    <div className="home-snap-row-l">
                      <div className="home-snap-dot" style={{ background: dot }} />
                      {label}
                    </div>
                    <div className="home-snap-row-r">
                      <span className="home-snap-val">{value}</span>
                      <span className={`home-snap-badge ${dir}`}>{change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <div className="home-cta-wrap">
        <div className="home-wrap">
          <div className="home-cta-box">
            <div className="home-cta-kicker">Start today — it's free</div>
            <div className="home-cta-title">Ready to take <em>control?</em></div>
            <div className="home-cta-sub">Start managing your finances with clarity and confidence.</div>
            <div className="home-cta-btns">
              <a href={getSignupUrl()} className="home-cta-btn-main">Get started free <ArrowRight size={14} aria-hidden="true" /></a>
              <a href={getLoginUrl()}  className="home-cta-btn-ghost"><LogIn size={13} aria-hidden="true" /> Log in</a>
            </div>
          </div>
        </div>
      </div>

      {/* ══ FOOTER ══ */}
      <footer className="home-footer" aria-label="Site footer">
        <div className="home-footer-brand">
          <div className="home-footer-mark" aria-hidden="true">M</div>
          MIE Prime
        </div>
        <div className="home-footer-links">
          <a href="/privacy" className="home-footer-link">Privacy</a>
          <span className="home-footer-sep">·</span>
          <a href="/terms"   className="home-footer-link">Terms</a>
          <span className="home-footer-sep">·</span>
          <a href="mailto:support@mieprime.com" className="home-footer-link">Contact</a>
        </div>
        <div>© {new Date().getFullYear()} MIE Prime · All rights reserved.</div>
      </footer>
    </div>
  );
}
