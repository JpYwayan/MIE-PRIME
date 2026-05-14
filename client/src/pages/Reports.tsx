import { trpc } from "@/lib/trpc";
import { useState, useRef, useEffect } from "react";
import {
  TrendingUp, Scale, RefreshCw, CheckCircle2, XCircle, Printer, DollarSign,
  Users, ArrowRightLeft, Download, FileText, Share2, ChevronDown,
} from "lucide-react";

const TYPE_META = {
  REVENUE:   { text: "#059669", dot: "#10b981", light: "#ecfdf5", mid: "#a7f3d0" },
  EXPENSE:   { text: "#dc2626", dot: "#ef4444", light: "#fff5f5", mid: "#fecaca" },
  ASSET:     { text: "#1d4ed8", dot: "#3b82f6", light: "#eff6ff", mid: "#bfdbfe" },
  LIABILITY: { text: "#be185d", dot: "#ec4899", light: "#fdf2f8", mid: "#fbcfe8" },
  EQUITY:    { text: "#6d28d9", dot: "#8b5cf6", light: "#f5f3ff", mid: "#ddd6fe" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse    { 0%,100% { opacity:1; } 50% { opacity:.35; } }
  @keyframes shimmer  { to { background-position:-200% 0; } }
  @keyframes slideIn  { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:none; } }
  @keyframes dropDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:none; } }

  .rp {
    font-family: 'DM Sans', sans-serif;
    --blue: #4F63D2;
    --ink: #0f172a; --ink2: #1e293b; --ink3: #475569; --ink4: #94a3b8;
    --surface: #ffffff; --surface2: #f8fafc; --surface3: #f1f5f9;
    --border: rgba(15,23,42,0.08); --border2: rgba(15,23,42,0.04);
    min-height: 100vh; background: transparent; color: var(--ink);
  }

  /* ── HEADER ── */
  .rp-header {
    display: flex; align-items: flex-end; justify-content: space-between;
    padding: 28px 32px 0;
    animation: fadeIn .4s ease both;
    position: relative; z-index: 200;
  }
  .rp-eyebrow {
    font-size: 10px; font-weight: 600; color: var(--ink4);
    letter-spacing: .14em; text-transform: uppercase;
    font-family: 'DM Mono', monospace;
    display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
    color: rgba(255,255,255,.45);
  }
  .rp-eyebrow-dot {
    width: 6px; height: 6px; background: #4ade80; border-radius: 50%;
    animation: pulse 2s ease infinite;
  }
  .rp-title {
    font-family: 'DM Serif Display', serif;
    font-size: 36px; font-weight: 400; color: rgba(255,255,255,.95);
    letter-spacing: -.02em; margin: 0 0 4px; line-height: 1.1;
  }
  .rp-sub { font-size: 13px; color: rgba(255,255,255,.4); margin: 0; font-weight: 400; }
  .rp-actions { display: flex; gap: 8px; padding-bottom: 4px; align-items: center; }
  .rp-btn {
    display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px;
    background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.18);
    border-radius: 8px; font-size: 12px; font-weight: 500; color: rgba(255,255,255,.75);
    cursor: pointer; transition: all .15s; font-family: 'DM Sans', sans-serif;
    letter-spacing: .01em;
  }
  .rp-btn:hover { background: rgba(255,255,255,.18); color: #fff; }

  /* ── EXPORT DROPDOWN ── */
  .rp-export-wrap { position: relative; }
  .rp-export-btn {
    display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px;
    background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.25);
    border-radius: 8px; font-size: 12px; font-weight: 600; color: rgba(255,255,255,.9);
    cursor: pointer; transition: all .15s; font-family: 'DM Sans', sans-serif;
    letter-spacing: .01em;
  }
  .rp-export-btn:hover { background: rgba(255,255,255,.22); color: #fff; }
  .rp-export-menu {
    position: absolute; top: calc(100% + 6px); right: 0; z-index: 100;
    background: #fff; border: 1px solid rgba(15,23,42,.1);
    border-radius: 12px; padding: 6px;
    box-shadow: 0 8px 32px rgba(15,23,42,.16), 0 2px 8px rgba(15,23,42,.08);
    min-width: 200px;
    animation: dropDown .18s ease both;
  }
  .rp-export-section-label {
    font-size: 9px; font-weight: 700; color: #94a3b8; letter-spacing: .14em;
    text-transform: uppercase; font-family: 'DM Mono', monospace;
    padding: 8px 10px 4px;
  }
  .rp-export-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 10px; border-radius: 7px; cursor: pointer;
    transition: background .1s; border: none; background: transparent;
    width: 100%; text-align: left; font-family: 'DM Sans', sans-serif;
  }
  .rp-export-item:hover { background: #f1f5f9; }
  .rp-export-icon {
    width: 28px; height: 28px; border-radius: 7px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .rp-export-item-text { display: flex; flex-direction: column; }
  .rp-export-item-name { font-size: 12.5px; font-weight: 600; color: #0f172a; }
  .rp-export-item-desc { font-size: 10.5px; color: #94a3b8; margin-top: 1px; }
  .rp-export-divider { height: 1px; background: rgba(15,23,42,.06); margin: 4px 0; }

  /* ── TABS ── */
  .rp-tabs-wrap {
    padding: 20px 32px 0;
    display: flex; align-items: center;
    animation: fadeIn .5s ease both;
  }
  .rp-tab-track {
    display: inline-flex; gap: 2px;
    background: rgba(255,255,255,.08);
    border: 1px solid rgba(255,255,255,.14);
    border-radius: 10px; padding: 3px;
  }
  .rp-tab {
    display: inline-flex; align-items: center; gap: 7px; padding: 8px 18px;
    border-radius: 7px; border: none;
    font-size: 12.5px; font-weight: 500; cursor: pointer; transition: all .18s;
    font-family: 'DM Sans', sans-serif; color: rgba(255,255,255,.55);
    background: transparent; letter-spacing: .005em;
  }
  .rp-tab:hover { color: rgba(255,255,255,.85); }
  .rp-tab.active {
    background: #fff; color: var(--blue);
    box-shadow: 0 1px 6px rgba(0,0,0,.12), 0 0 0 .5px rgba(0,0,0,.06);
    font-weight: 600;
  }

  /* ── BODY ── */
  .rp-body { padding: 20px 32px 40px; }

  /* ══════════════════════════
     PAPER
  ══════════════════════════ */
  .rp-paper-wrap {
    display: flex; justify-content: center;
    animation: slideIn .45s cubic-bezier(.22,.68,0,1.1) both;
  }
  .rp-paper {
    width: 100%; max-width: 640px;
    background: #fff;
    border-radius: 24px;
    position: relative;
    box-shadow:
      0 0 0 1px rgba(0,0,0,.05),
      0 4px 8px rgba(0,0,0,.04),
      0 16px 40px rgba(0,0,0,.10),
      0 56px 120px rgba(0,0,0,.13);
  }

  /* Stacked paper layers */
  .rp-paper::before, .rp-paper::after {
    content:''; position:absolute; left:6px; right:-6px; bottom:-6px;
    height:100%; background:#edf1f7;
    border:1px solid rgba(0,0,0,.05); border-radius:24px; z-index:-1;
  }
  .rp-paper::after { left:12px; right:-12px; bottom:-12px; background:#e2e8f0; z-index:-2; }

  /* Header band */
  .rp-paper-band {
    padding: 36px 48px 32px;
    position: relative; overflow: hidden;
    border-radius: 24px 24px 0 0;
  }
  .rp-paper-band-bg {
    position: absolute; inset: 0;
    background: linear-gradient(145deg, #1a2b4a 0%, #243b6e 45%, #1e3460 75%, #162850 100%);
  }
  .rp-paper-band-noise {
    position: absolute; inset: 0; opacity: .04;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 160px 160px;
  }
  .rp-paper-band-orb {
    position: absolute; width: 320px; height: 320px; border-radius: 50%;
    background: radial-gradient(circle, rgba(99,130,255,0.35) 0%, transparent 65%);
    top: -100px; right: -80px; pointer-events: none;
  }
  .rp-paper-band-orb2 {
    position: absolute; width: 220px; height: 220px; border-radius: 50%;
    background: radial-gradient(circle, rgba(56,211,159,0.22) 0%, transparent 65%);
    bottom: -50px; left: -30px; pointer-events: none;
  }
  .rp-paper-band-orb3 {
    position: absolute; width: 160px; height: 160px; border-radius: 50%;
    background: radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 65%);
    top: 10px; left: 40%; pointer-events: none;
  }
  .rp-paper-band-content { position: relative; z-index: 1; }

  .rp-paper-icon-wrap {
    width: 52px; height: 52px; border-radius: 16px;
    background: rgba(255,255,255,.14); border: 1.5px solid rgba(255,255,255,.22);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 16px; backdrop-filter: blur(6px);
  }
  .rp-paper-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 12px; border-radius: 20px;
    background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2);
    font-size: 9.5px; font-weight: 600; color: rgba(255,255,255,.65);
    font-family: 'DM Mono', monospace; letter-spacing: .13em; text-transform: uppercase;
    margin-bottom: 14px;
  }
  .rp-paper-heading {
    font-family: 'DM Serif Display', serif;
    font-size: 30px; font-weight: 400; color: #fff;
    letter-spacing: -.01em; margin: 0 0 8px; line-height: 1.15;
  }
  .rp-paper-period {
    font-size: 10.5px; color: rgba(255,255,255,.45);
    font-family: 'DM Mono', monospace; letter-spacing: .15em; text-transform: uppercase;
    margin: 0;
  }

  /* Divider between band and body */
  .rp-band-divider {
    height: 1px; background: rgba(0,0,0,.06); margin: 0;
  }

  /* Body */
  .rp-paper-body { padding: 6px 0 0; border-radius: 0 0 24px 24px; overflow: hidden; }

  /* Section label */
  .rp-sec-hd {
    display: flex; align-items: center; gap: 8px;
    padding: 22px 48px 12px;
  }
  .rp-sec-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .rp-sec-lbl {
    font-size: 9.5px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase;
    font-family: 'DM Mono', monospace;
  }
  .rp-sec-line { flex: 1; height: 1px; background: var(--border); }

  /* Line items */
  .rp-item {
    display: flex; align-items: baseline; justify-content: space-between;
    padding: 9px 48px; transition: background .1s;
  }
  .rp-item:hover { background: rgba(79,99,210,.025); }
  .rp-item-name { font-size: 14px; color: var(--ink3); font-weight: 400; flex: 1; }
  .rp-item-dots {
    flex: 1; margin: 0 12px; border-bottom: 1.5px dotted #cbd5e1;
    align-self: center; min-width: 20px;
  }
  .rp-item-amt {
    font-family: 'DM Mono', monospace; font-size: 14px; font-weight: 500; color: var(--ink2);
    white-space: nowrap;
  }
  .rp-item-empty { font-size: 13px; color: var(--ink4); font-style: italic; padding: 9px 48px; }

  /* Subtotal */
  .rp-subtotal {
    display: flex; justify-content: space-between; align-items: center;
    padding: 13px 48px; margin: 6px 0;
    background: var(--surface2);
    border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
  }
  .rp-subtotal-lbl { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; font-family: 'DM Mono', monospace; }
  .rp-subtotal-val { font-family: 'DM Mono', monospace; font-size: 17px; font-weight: 500; }

  /* Grand total */
  .rp-grand {
    margin: 18px 32px 24px;
    border-radius: 14px; overflow: hidden;
    border: 1.5px solid;
  }
  .rp-grand-inner {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 22px;
  }
  .rp-grand-left  { display: flex; align-items: center; gap: 12px; }
  .rp-grand-icon  { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
  .rp-grand-lbl   { font-size: 14px; font-weight: 600; letter-spacing: -.01em; }
  .rp-grand-sub   { font-size: 10.5px; font-weight: 400; margin-top: 2px; opacity: .65; font-family: 'DM Mono', monospace; }
  .rp-grand-val   { font-family: 'DM Mono', monospace; font-size: 22px; font-weight: 500; }
  .rp-grand.pos   { border-color: #a7f3d0; background: linear-gradient(135deg, #ecfdf5, #d1fae5); color: #065f46; }
  .rp-grand.neg   { border-color: #fecaca; background: linear-gradient(135deg, #fff5f5, #fee2e2); color: #991b1b; }
  .rp-grand.ok    { border-color: #a7f3d0; background: linear-gradient(135deg, #ecfdf5, #d1fae5); color: #065f46; }
  .rp-grand.bad   { border-color: #fecaca; background: linear-gradient(135deg, #fff5f5, #fee2e2); color: #991b1b; }

  /* Footer */
  .rp-paper-foot {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 48px 26px;
    border-top: 1px dashed rgba(0,0,0,.09);
    margin-top: 4px;
  }
  .rp-foot-col { display: flex; flex-direction: column; gap: 3px; }
  .rp-foot-label { font-size: 9.5px; color: var(--ink4); font-family: 'DM Mono', monospace; letter-spacing: .1em; text-transform: uppercase; }
  .rp-foot-val   { font-size: 11px; color: var(--ink3); font-family: 'DM Mono', monospace; font-weight: 500; }
  .rp-foot-barcode { display: flex; align-items: flex-end; gap: 1.5px; height: 28px; }
  .rp-foot-barcode span { display: inline-block; background: var(--ink3); width: 2px; border-radius: 1px; }

  /* Divider */
  .rp-dashed-hr { border: none; border-top: 1px dashed rgba(0,0,0,.09); margin: 0 48px; }

  /* Balance sheet 2-col */
  .rp-bs-grid { display: grid; grid-template-columns: 1fr 1fr; }
  .rp-bs-col:first-child { border-right: 1px dashed rgba(0,0,0,.09); }

  /* Shimmer */
  .rp-shimmer {
    height: 13px; border-radius: 5px; margin: 9px 48px;
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%; animation: shimmer 1.2s infinite;
  }

  /* Toast notification */
  .rp-toast {
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    display: flex; align-items: center; gap: 10px;
    padding: 12px 18px; border-radius: 12px;
    background: #0f172a; color: #fff;
    font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif;
    box-shadow: 0 8px 32px rgba(0,0,0,.3);
    animation: fadeUp .25s ease both;
  }
  .rp-toast-icon {
    width: 24px; height: 24px; border-radius: 6px;
    background: rgba(255,255,255,.12);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }

  @media (max-width: 768px) {
    .rp-bs-grid { grid-template-columns: 1fr; }
    .rp-bs-col:first-child { border-right: none; border-bottom: 1px dashed rgba(0,0,0,.09); }
    .rp-header { padding: 20px 20px 0; flex-direction: column; gap: 12px; align-items: flex-start; }
    .rp-tabs-wrap { padding: 16px 20px 0; }
    .rp-body { padding: 16px 20px 32px; }
    .rp-paper { max-width: 100%; border-radius: 18px; }
    .rp-paper-band { border-radius: 18px 18px 0 0; }
    .rp-grand { margin: 16px 20px 18px; }
    .rp-item, .rp-sec-hd, .rp-item-empty, .rp-paper-foot, .rp-dashed-hr { padding-left: 24px; padding-right: 24px; }
    .rp-subtotal { padding-left: 24px; padding-right: 24px; }
    .rp-shimmer { margin-left: 24px; margin-right: 24px; }
    .rp-export-menu { right: auto; left: 0; }
  }

  /* ── PHONE: 600px ── */
  @media (max-width: 600px) {
    /* Header — title + actions stacked */
    .rp-header { padding: 16px 16px 0; gap: 10px; }
    .rp-title { font-size: 26px; }
    .rp-actions { flex-wrap: wrap; gap: 6px; }
    .rp-btn { padding: 7px 12px; font-size: 11.5px; }

    /* Tab strip — allow horizontal scroll on very small screens */
    .rp-tabs-wrap { padding: 14px 16px 0; overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .rp-tab-track { flex-shrink: 0; }
    .rp-tab { padding: 7px 13px; font-size: 11.5px; gap: 5px; }

    /* Body */
    .rp-body { padding: 14px 16px 28px; }

    /* Paper card */
    .rp-paper { border-radius: 14px; }
    .rp-paper::before { left: 4px; right: -4px; bottom: -4px; border-radius: 14px; }
    .rp-paper::after  { left: 8px; right: -8px; bottom: -8px; border-radius: 14px; }

    /* Band */
    .rp-paper-band { padding: 24px 20px 20px; border-radius: 14px 14px 0 0; }
    .rp-paper-icon-wrap { width: 42px; height: 42px; border-radius: 12px; margin-bottom: 12px; }
    .rp-paper-heading { font-size: 22px; margin-bottom: 6px; }
    .rp-paper-period  { font-size: 9.5px; }
    .rp-paper-badge   { font-size: 8.5px; padding: 3px 10px; margin-bottom: 10px; }

    /* Line items — tighter horizontal padding */
    .rp-item, .rp-sec-hd, .rp-item-empty, .rp-dashed-hr { padding-left: 16px; padding-right: 16px; }
    .rp-item { padding-top: 8px; padding-bottom: 8px; }
    .rp-item-name { font-size: 13px; }
    .rp-item-amt  { font-size: 13px; }
    .rp-subtotal  { padding-left: 16px; padding-right: 16px; padding-top: 11px; padding-bottom: 11px; }
    .rp-subtotal-lbl { font-size: 10px; }
    .rp-subtotal-val { font-size: 15px; }
    .rp-shimmer { margin-left: 16px; margin-right: 16px; }

    /* Grand total */
    .rp-grand { margin: 14px 12px 16px; border-radius: 12px; }
    .rp-grand-inner { padding: 14px 16px; flex-wrap: wrap; gap: 10px; }
    .rp-grand-lbl { font-size: 13px; }
    .rp-grand-sub { font-size: 9.5px; }
    .rp-grand-val { font-size: 19px; }
    .rp-grand-icon { width: 34px; height: 34px; border-radius: 10px; }

    /* Footer */
    .rp-paper-foot { padding: 12px 16px 20px; flex-wrap: wrap; gap: 10px; }
    .rp-foot-barcode { display: none; } /* barcode decorative only — hide on phones */

    /* Toast */
    .rp-toast { left: 12px; right: 12px; bottom: 16px; }
  }

  /* ── PHONE: 480px ── */
  @media (max-width: 480px) {
    .rp-header { padding: 14px 14px 0; }
    .rp-body   { padding: 12px 12px 24px; }
    .rp-tabs-wrap { padding: 12px 14px 0; }
    .rp-tab { padding: 6px 11px; font-size: 11px; }
    .rp-paper-band { padding: 20px 16px 16px; }
    .rp-paper-heading { font-size: 19px; }
    .rp-title { font-size: 22px; }
    .rp-sec-hd { padding-top: 16px; padding-bottom: 8px; }
    .rp-grand-inner { flex-direction: column; align-items: flex-start; }
    .rp-grand-val { font-size: 22px; }      /* larger when on its own line */
    .rp-grand-left { width: 100%; }
    .rp-export-menu { min-width: 180px; }
    .rp-export-item-desc { display: none; } /* too small at 480 — hide sub-labels */
  }

  /* ── PHONE: 380px ── */
  @media (max-width: 380px) {
    .rp-header { padding: 12px 12px 0; }
    .rp-body   { padding: 10px 10px 20px; }
    .rp-actions { width: 100%; }
    .rp-btn, .rp-export-btn { flex: 1; justify-content: center; font-size: 11px; padding: 7px 8px; }
    .rp-paper-heading { font-size: 17px; }
    .rp-title { font-size: 20px; }
    .rp-tab { padding: 6px 9px; gap: 4px; }
    .rp-item-name { font-size: 12px; }
    .rp-item-amt  { font-size: 12px; }
    .rp-subtotal-val { font-size: 14px; }
    .rp-grand { margin: 10px 8px 14px; }
  }

  @media print {
    .rp-header, .rp-tabs-wrap { display: none !important; }
    .rp-body { padding: 0 !important; }
    .rp-paper { box-shadow: none !important; }
    .rp-paper::before, .rp-paper::after { display: none !important; }
  }
`;

/* ── helpers ── */
function fmt(val: number | string) {
  const n = typeof val === "string" ? parseFloat(val) : val;
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(n || 0);
}
const period  = () => new Date().toLocaleDateString("en-PH", { month: "long", year: "numeric" });
const dateLbl = () => new Date().toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" });
const refNo   = (sfx: string) => `RPT-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,"0")}-${sfx}`;

function barcodeHeights(seed: string) {
  return Array.from({ length: 26 }, (_, i) => {
    const c = seed.charCodeAt(i % seed.length);
    return 8 + ((c * (i + 7)) % 18);
  });
}

function Shimmer({ n = 4 }: { n?: number }) {
  return <>{Array.from({ length: n }).map((_, i) => (
    <div key={i} className="rp-shimmer" style={{ width:`${52+(i%3)*15}%`, animationDelay:`${i*.07}s` }} />
  ))}</>;
}

function SecHd({ label, dot, color }: { label:string; dot:string; color:string }) {
  return (
    <div className="rp-sec-hd">
      <span className="rp-sec-dot" style={{ background:dot }} />
      <span className="rp-sec-lbl" style={{ color }}>{label}</span>
      <span className="rp-sec-line" />
    </div>
  );
}

function Item({ name, amount }: { name:string; amount:number|string }) {
  return (
    <div className="rp-item">
      <span className="rp-item-name">{name}</span>
      <span className="rp-item-dots" />
      <span className="rp-item-amt">{fmt(amount)}</span>
    </div>
  );
}

function Subtotal({ label, value, color }: { label:string; value:number; color:string }) {
  return (
    <div className="rp-subtotal">
      <span className="rp-subtotal-lbl" style={{ color }}>{label}</span>
      <span className="rp-subtotal-val" style={{ color }}>{fmt(value)}</span>
    </div>
  );
}

/* ── CSV Export Utilities ── */
function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows
    .map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── PDF Export via browser print with print-specific layout ── */
function printAsPDF(reportTitle: string) {
  const originalTitle = document.title;
  document.title = reportTitle;
  window.print();
  document.title = originalTitle;
}

/* ── Share / copy link ── */
async function copyShareLink(tab: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("report", tab);
  await navigator.clipboard.writeText(url.toString());
}

/* ─────────────────────────────────────
   EXPORT DROPDOWN
───────────────────────────────────── */
interface ExportDropdownProps {
  tab: string;
  onCsvIncome:   () => void;
  onCsvBalance:  () => void;
  onCsvEquity:   () => void;
  onCsvCashflow: () => void;
  onPdf:         () => void;
  onShare:       () => void;
}

function ExportDropdown({
  tab, onCsvIncome, onCsvBalance, onCsvEquity, onCsvCashflow, onPdf, onShare,
}: ExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on any click outside the dropdown wrapper
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const close = () => setOpen(false);

  const currentCsv: Record<string, () => void> = {
    income:   onCsvIncome,
    balance:  onCsvBalance,
    equity:   onCsvEquity,
    cashflow: onCsvCashflow,
  };

  const handleCsvCurrent = () => { currentCsv[tab]?.(); close(); };
  const handleCsvAll     = () => { onCsvIncome(); onCsvBalance(); onCsvEquity(); onCsvCashflow(); close(); };
  const handlePdf        = () => { onPdf(); close(); };
  const handleShare      = () => { onShare(); close(); };

  const tabLabels: Record<string, string> = {
    income: "Income Statement", balance: "Balance Sheet",
    equity: "Owner's Equity",  cashflow: "Cash Flow",
  };

  return (
    <div className="rp-export-wrap" ref={wrapRef}>
      <button className="rp-export-btn" onClick={() => setOpen(v => !v)}>
        <Download size={12} />
        Export
        <ChevronDown size={11} style={{ opacity: .65, marginLeft: 2 }} />
      </button>

      {open && (
        <div className="rp-export-menu">
            {/* CSV section */}
            <div className="rp-export-section-label">CSV Download</div>
            <button className="rp-export-item" onClick={handleCsvCurrent}>
              <div className="rp-export-icon" style={{ background:"#f0fdf4" }}>
                <FileText size={13} color="#16a34a" />
              </div>
              <div className="rp-export-item-text">
                <span className="rp-export-item-name">Current Report</span>
                <span className="rp-export-item-desc">{tabLabels[tab]}</span>
              </div>
            </button>
            <button className="rp-export-item" onClick={handleCsvAll}>
              <div className="rp-export-icon" style={{ background:"#eff6ff" }}>
                <FileText size={13} color="#2563eb" />
              </div>
              <div className="rp-export-item-text">
                <span className="rp-export-item-name">All Reports</span>
                <span className="rp-export-item-desc">4 CSV files at once</span>
              </div>
            </button>

            <div className="rp-export-divider" />

            {/* PDF section */}
            <div className="rp-export-section-label">PDF / Print</div>
            <button className="rp-export-item" onClick={handlePdf}>
              <div className="rp-export-icon" style={{ background:"#fff7ed" }}>
                <Printer size={13} color="#ea580c" />
              </div>
              <div className="rp-export-item-text">
                <span className="rp-export-item-name">Save as PDF</span>
                <span className="rp-export-item-desc">Print-optimised layout</span>
              </div>
            </button>

            <div className="rp-export-divider" />

            {/* Share section */}
            <div className="rp-export-section-label">Share</div>
            <button className="rp-export-item" onClick={handleShare}>
              <div className="rp-export-icon" style={{ background:"#fdf4ff" }}>
                <Share2 size={13} color="#9333ea" />
              </div>
              <div className="rp-export-item-text">
                <span className="rp-export-item-name">Copy Link</span>
                <span className="rp-export-item-desc">Share direct report URL</span>
              </div>
            </button>
          </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────
   TOAST
───────────────────────────────────── */
function Toast({ message, icon }: { message: string; icon: React.ReactNode }) {
  return (
    <div className="rp-toast">
      <div className="rp-toast-icon">{icon}</div>
      {message}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function Reports() {
  const [tab, setTab] = useState<"income"|"balance"|"equity"|"cashflow">("income");
  const [toast, setToast] = useState<{ msg: string; icon: React.ReactNode } | null>(null);

  const { data: inc, isLoading: incLoad, refetch: refInc } = trpc.reports.incomeStatement.useQuery({});
  const { data: bs,  isLoading: bsLoad,  refetch: refBs  } = trpc.reports.balanceSheet.useQuery({});
  const { data: eq,  isLoading: eqLoad,  refetch: refEq  } = trpc.reports.ownerEquity.useQuery(
    {}, { enabled: tab === "equity" }
  );
  const { data: cf,  isLoading: cfLoad,  refetch: refCf  } = trpc.reports.cashFlow.useQuery(
    {}, { enabled: tab === "cashflow" }
  );

  const refetchAll = () => {
    refInc(); refBs();
    if (tab === "equity")   refEq();
    if (tab === "cashflow") refCf();
  };

  const totalRev  = Number(inc?.totalRevenue    ?? 0);
  const totalExp  = Number(inc?.totalExpenses   ?? 0);
  const netInc    = Number(inc?.netIncome       ?? 0);
  const totalAst  = Number(bs?.totalAssets      ?? 0);
  const totalLib  = Number(bs?.totalLiabilities ?? 0);
  const totalEq   = Number(bs?.totalEquity      ?? 0);
  const balanced  = Math.abs(totalAst - (totalLib + totalEq)) < 0.01;

  const beginEq   = Number(eq?.beginningEquity  ?? 0);
  const addInvest = Number(eq?.additionalInvestments ?? 0);
  const withdrawals = Number(eq?.withdrawals    ?? 0);
  const endEq     = Number(eq?.endingEquity     ?? beginEq + addInvest + netInc - withdrawals);

  const cfOps   = Number(cf?.netCashFromOperations  ?? 0);
  const cfInv   = Number(cf?.netCashFromInvesting   ?? 0);
  const cfFin   = Number(cf?.netCashFromFinancing   ?? 0);
  const netCash = cfOps + cfInv + cfFin;
  const begCash = Number(cf?.beginningCash ?? 0);
  const endCash = Number(cf?.endingCash   ?? begCash + netCash);

  const refSfx: Record<string,string> = { income:"IS", balance:"BS", equity:"OE", cashflow:"CF" };
  const ref  = refNo(refSfx[tab] ?? "RPT");
  const bars = barcodeHeights(ref);

  /* ── Toast helper ── */
  const showToast = (msg: string, icon: React.ReactNode) => {
    setToast({ msg, icon });
    setTimeout(() => setToast(null), 2800);
  };

  /* ── CSV Export builders ── */
  const csvIncome = () => {
    const header = ["Category", "Account", "Amount (PHP)"];
    const rows: string[][] = [header];
    (inc?.revenues ?? []).forEach((r: any) =>
      rows.push(["Revenue", r.accountName, String(r.amount)]));
    rows.push(["", "Total Revenue", String(totalRev)]);
    rows.push(["", "", ""]);
    (inc?.expenses ?? []).forEach((e: any) =>
      rows.push(["Expense", e.accountName, String(e.amount)]));
    rows.push(["", "Total Expenses", String(totalExp)]);
    rows.push(["", "", ""]);
    rows.push(["", "Net Income", String(netInc)]);
    rows.push(["", "Period", dateLbl()]);
    rows.push(["", "Reference", refNo("IS")]);
    downloadCSV(`income-statement-${new Date().toISOString().slice(0,10)}.csv`, rows);
    showToast("Income Statement CSV downloaded", <FileText size={13} color="#4ade80" />);
  };

  const csvBalance = () => {
    const rows: string[][] = [["Section", "Account", "Balance (PHP)"]];
    (bs?.assets ?? []).forEach((a: any) =>
      rows.push(["Asset", a.accountName, String(a.balance)]));
    rows.push(["", "Total Assets", String(totalAst)]);
    rows.push(["", "", ""]);
    (bs?.liabilities ?? []).forEach((l: any) =>
      rows.push(["Liability", l.accountName, String(l.balance)]));
    rows.push(["", "Total Liabilities", String(totalLib)]);
    rows.push(["", "", ""]);
    (bs?.equity ?? []).forEach((e: any) =>
      rows.push(["Equity", e.accountName, String(e.balance)]));
    rows.push(["", "Total Equity", String(totalEq)]);
    rows.push(["", "", ""]);
    rows.push(["", "Balanced?", balanced ? "Yes" : "No"]);
    rows.push(["", "As of", dateLbl()]);
    rows.push(["", "Reference", refNo("BS")]);
    downloadCSV(`balance-sheet-${new Date().toISOString().slice(0,10)}.csv`, rows);
    showToast("Balance Sheet CSV downloaded", <FileText size={13} color="#4ade80" />);
  };

  const csvEquity = () => {
    const rows: string[][] = [
      ["Item", "Amount (PHP)"],
      ["Beginning Capital / Equity", String(beginEq)],
      ["Add: Additional Investments", String(addInvest)],
      ["Add: Net Income", String(netInc)],
      ["Capital Before Withdrawals", String(beginEq + addInvest + netInc)],
      ["Less: Withdrawals / Drawings", String(withdrawals)],
      ["Ending Owner's Equity", String(endEq)],
      ["", ""],
      ["Period", dateLbl()],
      ["Reference", refNo("OE")],
    ];
    downloadCSV(`owners-equity-${new Date().toISOString().slice(0,10)}.csv`, rows);
    showToast("Owner's Equity CSV downloaded", <FileText size={13} color="#4ade80" />);
  };

  const csvCashflow = () => {
    const rows: string[][] = [["Section", "Description", "Amount (PHP)"]];
    if (cf?.operatingItems?.length > 0) {
      cf.operatingItems.forEach((o: any) =>
        rows.push(["Operating", o.description, String(o.amount)]));
    } else {
      rows.push(["Operating", "Net Income (base of operations)", String(netInc)]);
    }
    rows.push(["", "Net Cash from Operations", String(cfOps || netInc)]);
    rows.push(["", "", ""]);
    (cf?.investingItems ?? []).forEach((o: any) =>
      rows.push(["Investing", o.description, String(o.amount)]));
    rows.push(["", "Net Cash from Investing", String(cfInv)]);
    rows.push(["", "", ""]);
    (cf?.financingItems ?? []).forEach((o: any) =>
      rows.push(["Financing", o.description, String(o.amount)]));
    rows.push(["", "Net Cash from Financing", String(cfFin)]);
    rows.push(["", "", ""]);
    rows.push(["", "Beginning Cash Balance", String(begCash)]);
    rows.push(["", "Ending Cash Balance", String(endCash)]);
    rows.push(["", "Period", dateLbl()]);
    rows.push(["", "Reference", refNo("CF")]);
    downloadCSV(`cash-flow-${new Date().toISOString().slice(0,10)}.csv`, rows);
    showToast("Cash Flow CSV downloaded", <FileText size={13} color="#4ade80" />);
  };

  const tabTitles: Record<string, string> = {
    income: "Income Statement", balance: "Balance Sheet",
    equity: "Statement of Owner's Equity", cashflow: "Statement of Cash Flow",
  };

  const handlePdf = () => {
    printAsPDF(tabTitles[tab] ?? "Financial Report");
    showToast("Print dialog opened — Save as PDF", <Printer size={13} color="#fb923c" />);
  };

  const handleShare = () => {
    copyShareLink(tab).then(() =>
      showToast("Report link copied to clipboard", <Share2 size={13} color="#c084fc" />)
    );
  };

  return (
    <div className="rp">
      <style>{css}</style>

      {/* HEADER */}
      <div className="rp-header">
        <div>
          <div className="rp-eyebrow">
            <span className="rp-eyebrow-dot" />
            Financial Reports
          </div>
          <h1 className="rp-title">Reports</h1>
          <p className="rp-sub">Four Financial Statements — {period()}</p>
        </div>
        <div className="rp-actions">
          <ExportDropdown
            tab={tab}
            onCsvIncome={csvIncome}
            onCsvBalance={csvBalance}
            onCsvEquity={csvEquity}
            onCsvCashflow={csvCashflow}
            onPdf={handlePdf}
            onShare={handleShare}
          />
          <button className="rp-btn" onClick={refetchAll}><RefreshCw size={12}/> Refresh</button>
        </div>
      </div>

      {/* TABS */}
      <div className="rp-tabs-wrap">
        <div className="rp-tab-track">
          <button className={`rp-tab ${tab==="income"?"active":""}`} onClick={()=>setTab("income")}>
            <TrendingUp size={13}/> Income Statement
          </button>
          <button className={`rp-tab ${tab==="balance"?"active":""}`} onClick={()=>setTab("balance")}>
            <Scale size={13}/> Balance Sheet
          </button>
          <button className={`rp-tab ${tab==="equity"?"active":""}`} onClick={()=>setTab("equity")}>
            <Users size={13}/> Owner's Equity
          </button>
          <button className={`rp-tab ${tab==="cashflow"?"active":""}`} onClick={()=>setTab("cashflow")}>
            <ArrowRightLeft size={13}/> Cash Flow
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="rp-body">

        {/* ══ INCOME STATEMENT ══ */}
        {tab === "income" && (
          <div className="rp-paper-wrap">
            <div className="rp-paper">
              <div className="rp-paper-band">
                <div className="rp-paper-band-bg" />
                <div className="rp-paper-band-noise" />
                <div className="rp-paper-band-orb" />
                <div className="rp-paper-band-orb2" />
                <div className="rp-paper-band-orb3" />
                <div className="rp-paper-band-content">
                  <div className="rp-paper-icon-wrap"><TrendingUp size={22} color="#fff" /></div>
                  <div className="rp-paper-badge">Income Statement</div>
                  <h2 className="rp-paper-heading">Income Statement</h2>
                  <p className="rp-paper-period">Period ended {dateLbl()}</p>
                </div>
              </div>
              <div className="rp-band-divider" />
              <div className="rp-paper-body">
                {incLoad ? <Shimmer n={5} /> : (
                  <>
                    <SecHd label="Revenue" dot={TYPE_META.REVENUE.dot} color={TYPE_META.REVENUE.text} />
                    {inc?.revenues?.length > 0
                      ? inc.revenues.map((r:any, i:number) => <Item key={i} name={r.accountName} amount={r.amount} />)
                      : <p className="rp-item-empty">No revenue entries recorded</p>}
                    <Subtotal label="Total Revenue" value={totalRev} color={TYPE_META.REVENUE.text} />
                    <div style={{ height: 8 }} />
                    <SecHd label="Expenses" dot={TYPE_META.EXPENSE.dot} color={TYPE_META.EXPENSE.text} />
                    {inc?.expenses?.length > 0
                      ? inc.expenses.map((e:any, i:number) => <Item key={i} name={e.accountName} amount={e.amount} />)
                      : <p className="rp-item-empty">No expense entries recorded</p>}
                    <Subtotal label="Total Expenses" value={totalExp} color={TYPE_META.EXPENSE.text} />
                    <div style={{ height: 4 }} />
                    <div className={`rp-grand ${netInc>=0?"pos":"neg"}`}>
                      <div className="rp-grand-inner">
                        <div className="rp-grand-left">
                          <div className="rp-grand-icon" style={{ background: netInc>=0 ? "rgba(5,150,105,.15)" : "rgba(220,38,38,.15)" }}>
                            <DollarSign size={15} />
                          </div>
                          <div>
                            <div className="rp-grand-lbl">Net Income</div>
                            <div className="rp-grand-sub">Revenue − Expenses</div>
                          </div>
                        </div>
                        <div className="rp-grand-val">{fmt(netInc)}</div>
                      </div>
                    </div>
                  </>
                )}
                <hr className="rp-dashed-hr" />
                <div className="rp-paper-foot">
                  <div className="rp-foot-col">
                    <span className="rp-foot-label">Generated</span>
                    <span className="rp-foot-val">{dateLbl()}</span>
                  </div>
                  <div className="rp-foot-barcode">
                    {bars.map((h,i) => <span key={i} style={{ height:`${h}px` }} />)}
                  </div>
                  <div className="rp-foot-col" style={{ alignItems:"flex-end" }}>
                    <span className="rp-foot-label">Reference</span>
                    <span className="rp-foot-val">{ref}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ BALANCE SHEET ══ */}
        {tab === "balance" && (
          <div className="rp-paper-wrap">
            <div className="rp-paper" style={{ maxWidth:700 }}>
              <div className="rp-paper-band">
                <div className="rp-paper-band-bg" style={{ background:"linear-gradient(145deg,#1a1a3e 0%,#2d2060 45%,#1e1a50 75%,#160e3a 100%)" }} />
                <div className="rp-paper-band-noise" />
                <div className="rp-paper-band-orb" style={{ background:"radial-gradient(circle,rgba(139,92,246,0.35) 0%,transparent 65%)" }} />
                <div className="rp-paper-band-orb2" style={{ background:"radial-gradient(circle,rgba(59,130,246,0.25) 0%,transparent 65%)" }} />
                <div className="rp-paper-band-orb3" style={{ background:"radial-gradient(circle,rgba(236,72,153,0.12) 0%,transparent 65%)" }} />
                <div className="rp-paper-band-content">
                  <div className="rp-paper-icon-wrap"><Scale size={22} color="#fff" /></div>
                  <div className="rp-paper-badge">Balance Sheet</div>
                  <h2 className="rp-paper-heading">Balance Sheet</h2>
                  <p className="rp-paper-period">As of {dateLbl()}</p>
                </div>
              </div>
              <div className="rp-band-divider" />
              <div className="rp-paper-body">
                {bsLoad ? <Shimmer n={6} /> : (
                  <>
                    <div className="rp-bs-grid">
                      <div className="rp-bs-col">
                        <SecHd label="Assets" dot={TYPE_META.ASSET.dot} color={TYPE_META.ASSET.text} />
                        {bs?.assets?.length > 0
                          ? bs.assets.map((a:any, i:number) => <Item key={i} name={a.accountName} amount={a.balance} />)
                          : <p className="rp-item-empty">No asset accounts</p>}
                        <Subtotal label="Total Assets" value={totalAst} color={TYPE_META.ASSET.text} />
                      </div>
                      <div className="rp-bs-col">
                        <SecHd label="Liabilities" dot={TYPE_META.LIABILITY.dot} color={TYPE_META.LIABILITY.text} />
                        {bs?.liabilities?.length > 0
                          ? bs.liabilities.map((l:any, i:number) => <Item key={i} name={l.accountName} amount={l.balance} />)
                          : <p className="rp-item-empty">No liability accounts</p>}
                        <Subtotal label="Total Liabilities" value={totalLib} color={TYPE_META.LIABILITY.text} />
                        <div style={{ height: 10 }} />
                        <SecHd label="Equity" dot={TYPE_META.EQUITY.dot} color={TYPE_META.EQUITY.text} />
                        {bs?.equity?.length > 0
                          ? bs.equity.map((e:any, i:number) => <Item key={i} name={e.accountName} amount={e.balance} />)
                          : <p className="rp-item-empty">No equity accounts</p>}
                        <Subtotal label="Total Equity" value={totalEq} color={TYPE_META.EQUITY.text} />
                      </div>
                    </div>
                    <div style={{ height: 4 }} />
                    <div className={`rp-grand ${balanced?"ok":"bad"}`}>
                      <div className="rp-grand-inner">
                        <div className="rp-grand-left">
                          <div className="rp-grand-icon" style={{ background: balanced?"rgba(5,150,105,.15)":"rgba(220,38,38,.15)" }}>
                            {balanced ? <CheckCircle2 size={15}/> : <XCircle size={15}/>}
                          </div>
                          <div>
                            <div className="rp-grand-lbl">{balanced ? "Equation Balanced" : "Equation Unbalanced"}</div>
                            <div className="rp-grand-sub">Assets = Liabilities + Equity</div>
                          </div>
                        </div>
                        <div className="rp-grand-val">{fmt(totalLib + totalEq)}</div>
                      </div>
                    </div>
                  </>
                )}
                <hr className="rp-dashed-hr" />
                <div className="rp-paper-foot">
                  <div className="rp-foot-col">
                    <span className="rp-foot-label">Generated</span>
                    <span className="rp-foot-val">{dateLbl()}</span>
                  </div>
                  <div className="rp-foot-barcode">
                    {bars.map((h,i) => <span key={i} style={{ height:`${h}px` }} />)}
                  </div>
                  <div className="rp-foot-col" style={{ alignItems:"flex-end" }}>
                    <span className="rp-foot-label">Reference</span>
                    <span className="rp-foot-val">{ref}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ OWNER'S EQUITY ══ */}
        {tab === "equity" && (
          <div className="rp-paper-wrap">
            <div className="rp-paper">
              <div className="rp-paper-band">
                <div className="rp-paper-band-bg" style={{ background:"linear-gradient(145deg,#064e3b 0%,#065f46 45%,#047857 75%,#065f46 100%)" }} />
                <div className="rp-paper-band-noise" />
                <div className="rp-paper-band-orb" style={{ background:"radial-gradient(circle,rgba(52,211,153,0.35) 0%,transparent 65%)" }} />
                <div className="rp-paper-band-orb2" style={{ background:"radial-gradient(circle,rgba(16,185,129,0.25) 0%,transparent 65%)" }} />
                <div className="rp-paper-band-orb3" style={{ background:"radial-gradient(circle,rgba(251,191,36,0.12) 0%,transparent 65%)" }} />
                <div className="rp-paper-band-content">
                  <div className="rp-paper-icon-wrap"><Users size={22} color="#fff" /></div>
                  <div className="rp-paper-badge">Owner's Equity</div>
                  <h2 className="rp-paper-heading">Statement of Owner's Equity</h2>
                  <p className="rp-paper-period">For the period ended {dateLbl()}</p>
                </div>
              </div>
              <div className="rp-band-divider" />
              <div className="rp-paper-body">
                {eqLoad ? <Shimmer n={5} /> : (
                  <>
                    <SecHd label="Owner's Equity" dot={TYPE_META.EQUITY.dot} color={TYPE_META.EQUITY.text} />
                    <Item name="Beginning Capital / Equity" amount={beginEq} />
                    <Item name="Add: Additional Investments" amount={addInvest} />
                    <Item name="Add: Net Income" amount={netInc} />
                    <Subtotal label="Capital Before Withdrawals" value={beginEq + addInvest + netInc} color={TYPE_META.EQUITY.text} />
                    <div style={{ height: 8 }} />
                    <SecHd label="Deductions" dot={TYPE_META.EXPENSE.dot} color={TYPE_META.EXPENSE.text} />
                    <Item name="Less: Withdrawals / Drawings" amount={withdrawals} />
                    <Subtotal label="Total Deductions" value={withdrawals} color={TYPE_META.EXPENSE.text} />
                    <div style={{ height: 4 }} />
                    <div className={`rp-grand ${endEq >= beginEq ? "pos" : "neg"}`}>
                      <div className="rp-grand-inner">
                        <div className="rp-grand-left">
                          <div className="rp-grand-icon" style={{ background: endEq >= beginEq ? "rgba(5,150,105,.15)" : "rgba(220,38,38,.15)" }}>
                            <Users size={15} />
                          </div>
                          <div>
                            <div className="rp-grand-lbl">Ending Owner's Equity</div>
                            <div className="rp-grand-sub">Beginning + Investments + Net Income − Withdrawals</div>
                          </div>
                        </div>
                        <div className="rp-grand-val">{fmt(endEq)}</div>
                      </div>
                    </div>
                  </>
                )}
                <hr className="rp-dashed-hr" />
                <div className="rp-paper-foot">
                  <div className="rp-foot-col">
                    <span className="rp-foot-label">Generated</span>
                    <span className="rp-foot-val">{dateLbl()}</span>
                  </div>
                  <div className="rp-foot-barcode">
                    {bars.map((h,i) => <span key={i} style={{ height:`${h}px` }} />)}
                  </div>
                  <div className="rp-foot-col" style={{ alignItems:"flex-end" }}>
                    <span className="rp-foot-label">Reference</span>
                    <span className="rp-foot-val">{ref}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ CASH FLOW ══ */}
        {tab === "cashflow" && (
          <div className="rp-paper-wrap">
            <div className="rp-paper">
              <div className="rp-paper-band">
                <div className="rp-paper-band-bg" style={{ background:"linear-gradient(145deg,#1e3a5f 0%,#1a4971 45%,#155e8a 75%,#1a4971 100%)" }} />
                <div className="rp-paper-band-noise" />
                <div className="rp-paper-band-orb" style={{ background:"radial-gradient(circle,rgba(56,189,248,0.35) 0%,transparent 65%)" }} />
                <div className="rp-paper-band-orb2" style={{ background:"radial-gradient(circle,rgba(14,165,233,0.25) 0%,transparent 65%)" }} />
                <div className="rp-paper-band-orb3" style={{ background:"radial-gradient(circle,rgba(251,191,36,0.12) 0%,transparent 65%)" }} />
                <div className="rp-paper-band-content">
                  <div className="rp-paper-icon-wrap"><ArrowRightLeft size={22} color="#fff" /></div>
                  <div className="rp-paper-badge">Cash Flow</div>
                  <h2 className="rp-paper-heading">Statement of Cash Flow</h2>
                  <p className="rp-paper-period">For the period ended {dateLbl()}</p>
                </div>
              </div>
              <div className="rp-band-divider" />
              <div className="rp-paper-body">
                {cfLoad ? <Shimmer n={7} /> : (
                  <>
                    <SecHd label="Operating Activities" dot={TYPE_META.REVENUE.dot} color={TYPE_META.REVENUE.text} />
                    {cf?.operatingItems?.length > 0
                      ? cf.operatingItems.map((o:any, i:number) => <Item key={i} name={o.description} amount={o.amount} />)
                      : <Item name="Net Income (base of operations)" amount={netInc} />}
                    <Subtotal label="Net Cash from Operations" value={cfOps || netInc} color={TYPE_META.REVENUE.text} />
                    <div style={{ height: 8 }} />
                    <SecHd label="Investing Activities" dot={TYPE_META.ASSET.dot} color={TYPE_META.ASSET.text} />
                    {cf?.investingItems?.length > 0
                      ? cf.investingItems.map((o:any, i:number) => <Item key={i} name={o.description} amount={o.amount} />)
                      : <p className="rp-item-empty">No investing activities recorded</p>}
                    <Subtotal label="Net Cash from Investing" value={cfInv} color={TYPE_META.ASSET.text} />
                    <div style={{ height: 8 }} />
                    <SecHd label="Financing Activities" dot={TYPE_META.LIABILITY.dot} color={TYPE_META.LIABILITY.text} />
                    {cf?.financingItems?.length > 0
                      ? cf.financingItems.map((o:any, i:number) => <Item key={i} name={o.description} amount={o.amount} />)
                      : <p className="rp-item-empty">No financing activities recorded</p>}
                    <Subtotal label="Net Cash from Financing" value={cfFin} color={TYPE_META.LIABILITY.text} />
                    <div style={{ height: 4 }} />
                    <Item name="Beginning Cash Balance" amount={begCash} />
                    <div className={`rp-grand ${netCash >= 0 ? "pos" : "neg"}`}>
                      <div className="rp-grand-inner">
                        <div className="rp-grand-left">
                          <div className="rp-grand-icon" style={{ background: netCash >= 0 ? "rgba(5,150,105,.15)" : "rgba(220,38,38,.15)" }}>
                            <ArrowRightLeft size={15} />
                          </div>
                          <div>
                            <div className="rp-grand-lbl">Ending Cash Balance</div>
                            <div className="rp-grand-sub">Beginning Cash + Net Cash Change</div>
                          </div>
                        </div>
                        <div className="rp-grand-val">{fmt(endCash)}</div>
                      </div>
                    </div>
                  </>
                )}
                <hr className="rp-dashed-hr" />
                <div className="rp-paper-foot">
                  <div className="rp-foot-col">
                    <span className="rp-foot-label">Generated</span>
                    <span className="rp-foot-val">{dateLbl()}</span>
                  </div>
                  <div className="rp-foot-barcode">
                    {bars.map((h,i) => <span key={i} style={{ height:`${h}px` }} />)}
                  </div>
                  <div className="rp-foot-col" style={{ alignItems:"flex-end" }}>
                    <span className="rp-foot-label">Reference</span>
                    <span className="rp-foot-val">{ref}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TOAST */}
      {toast && <Toast message={toast.msg} icon={toast.icon} />}
    </div>
  );
}
