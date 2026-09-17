'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Server,
  Check,
  Activity,
  Thermometer,
  Cpu,
  MemoryStick,
  Wifi,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Radio,
  ShieldCheck,
} from 'lucide-react';

// ── SPARKLINE SVG MINI CHART ─────────────────────────────────────────────────
function Sparkline({ color, points }: { color: string; points: number[] }) {
  const width = 160;
  const height = 36;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  });

  const pathD = `M ${coords.join(' L ')}`;
  const fillD = `M ${coords[0]} L ${coords.join(' L ')} L ${width},${height} L 0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-9 mt-2" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#grad-${color.replace('#', '')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── DEMO DATA ─────────────────────────────────────────────────────────────────
const POP_LATENCY = [
  {
    label: 'POP NORTH LATENCY',
    value: '8.40ms',
    uptime: '99.9%',
    color: '#10b981',
    points: [6, 7.5, 8, 6.8, 9, 8.4, 7, 8.4, 9.2, 8.4],
    trend: 'stable',
  },
  {
    label: 'POP CENTRAL LATENCY',
    value: '1.07ms',
    uptime: '99.9%',
    color: '#f59e0b',
    points: [1.4, 1.2, 1.1, 1.0, 1.3, 1.07, 1.1, 1.2, 1.0, 1.07],
    trend: 'down',
  },
  {
    label: 'POP EAST LATENCY',
    value: '1.99ms',
    uptime: '99.9%',
    color: '#06b6d4',
    points: [2.1, 1.9, 2.0, 2.1, 1.8, 1.99, 2.1, 1.9, 2.0, 1.99],
    trend: 'stable',
  },
];

const HOST_NODES = [
  { name: 'Core-01',     temp: 49, cpu: 6,  mem: '2.8 GB', tempColor: 'text-amber-500' },
  { name: 'Transit-01',  temp: 54, cpu: 22, mem: '840 MB',  tempColor: 'text-rose-500'  },
  { name: 'BNG-01',      temp: 50, cpu: 18, mem: '1.3 GB',  tempColor: 'text-amber-500' },
];

const SFP_DDM = [
  { label: 'Metro Link A (Core-01 sfpplus1)',   power: '-3.37 dBm',  status: 'BAGUS', ok: true },
  { label: 'CDN Backbone (Core-01 sfpplus2)',   power: '-14.46 dBm', status: 'BAGUS', ok: true },
  { label: 'Metro Link B (Core-01 sfpplus3)',   power: '-9.85 dBm',  status: 'BAGUS', ok: true },
  { label: 'Peering Link (Core-01 sfpplus4)',   power: '-22.10 dBm', status: 'LEMAH', ok: false },
];

export default function TelemetriPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);

  // Simulate live data ticking
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 4000);
    return () => clearInterval(id);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  return (
    <div
      className="min-h-screen bg-[#f8fafc] text-slate-800 p-4 sm:p-6 md:p-8 space-y-6"
      style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}
    >
      {/* ── TOP NAV ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl shadow-2xs transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          Kembali ke Dashboard
        </Link>

        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl shadow-2xs transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-orange-500 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Memperbarui...' : 'Refresh Telemetri'}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MAIN CARD: POP LATENCY + HOST MONITOR + SFP DDM
      ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white border border-slate-200/90 rounded-3xl border-t-[4px] border-t-orange-500 overflow-hidden shadow-xs p-6 md:p-8 space-y-7">

        {/* ── SECTION HEADER ── */}
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="font-mono text-[11px] font-bold text-orange-500 tracking-wider uppercase">
            POP ACTIVE LATENCY &amp; CORE HARDWARE CPU TELEMETRI
          </span>
          <span className="ml-auto text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live · Auto-refresh 4s
          </span>
        </div>

        {/* ── POP LATENCY CARDS (3 KOLOM) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {POP_LATENCY.map((pop) => (
            <div
              key={pop.label}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  {pop.label}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-mono">
                  UP (24H UPTIME: {pop.uptime})
                </span>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-2xl font-bold" style={{ color: pop.color }}>
                  {pop.value}
                </span>
                {pop.trend === 'down'
                  ? <TrendingDown className="w-4 h-4 text-emerald-500" />
                  : <TrendingUp className="w-4 h-4 text-slate-400" />}
              </div>

              <Sparkline color={pop.color} points={pop.points} />
            </div>
          ))}
        </div>

        {/* ── HOST HARDWARE NODE MONITOR ── */}
        <div>
          <div className="font-mono text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3 flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-teal-600" />
            HOST HARDWARE NODE MONITOR
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {HOST_NODES.map((node) => (
              <div
                key={node.name}
                className="bg-[#f8fafc] border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-black text-slate-800">{node.name}</span>
                  <span className={`font-mono text-sm font-black ${node.tempColor}`}>
                    {node.temp}°C
                  </span>
                </div>

                {/* CPU Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3" /> CPU
                    </span>
                    <span className="font-bold text-slate-700">{node.cpu}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full transition-all duration-700"
                      style={{
                        width: `${node.cpu}%`,
                        background: node.cpu > 50 ? '#f59e0b' : '#10b981',
                      }}
                    />
                  </div>
                </div>

                {/* MEM */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span className="flex items-center gap-1">
                    <MemoryStick className="w-3 h-3" /> MEM
                  </span>
                  <span className="font-bold text-slate-700">{node.mem}</span>
                </div>

                {/* Temp Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="flex items-center gap-1">
                      <Thermometer className="w-3 h-3" /> Temp
                    </span>
                    <span className={`font-bold ${node.tempColor}`}>{node.temp}°C / 100°C</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full transition-all duration-700"
                      style={{
                        width: `${node.temp}%`,
                        background: node.temp >= 55 ? '#f43f5e' : node.temp >= 50 ? '#f59e0b' : '#10b981',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── OPTICAL TRANSCEIVER SFP+ DDM POWER ── */}
        <div>
          <div className="font-mono text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-violet-500" />
            OPTICAL TRANSCEIVER SFP+ DDM POWER
          </div>

          <div className="space-y-2">
            {SFP_DDM.map((sfp) => (
              <div
                key={sfp.label}
                className="flex items-center justify-between bg-[#f8fafc] border border-slate-200/80 rounded-xl px-4 py-3"
              >
                <span className="font-mono text-xs text-slate-600">{sfp.label}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-sm font-bold ${sfp.ok ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {sfp.power}
                  </span>
                  <span
                    className={`font-mono text-[10px] font-black px-2 py-0.5 rounded-md ${
                      sfp.ok
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    ({sfp.status})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════
          REAL-TIME UPTIME STATS (EXTRA SECTION)
      ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Avg POP Latency',    value: '3.82ms',  color: 'text-emerald-600', sub: 'Seluruh POP'         },
          { label: 'Packet Loss',         value: '0.01%',   color: 'text-emerald-600', sub: 'Last 24 Jam'         },
          { label: 'SFP Tx Power',        value: '-3.37dBm',color: 'text-violet-600',  sub: 'Core-01 SFP1 (Best)' },
          { label: 'BNG CPU Peak',        value: '18%',     color: 'text-amber-600',   sub: 'BNG-01 Saat Ini'     },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-1">
            <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {s.label}
            </span>
            <span className={`font-mono text-xl font-black ${s.color}`}>{s.value}</span>
            <span className="text-[10px] text-slate-400 block">{s.sub}</span>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          INFO CARD BAWAH: DIAGNOSTIK CORE POP
      ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-br from-orange-50/20 via-white to-slate-50 border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-xs space-y-4">
        <div>
          <span className="bg-orange-100/70 border border-orange-200 text-orange-600 font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-2">
            DIAGNOSTIK CORE POP
          </span>
          <div className="flex items-center gap-2.5 text-lg md:text-xl font-extrabold text-slate-900">
            <Server className="w-5 h-5 text-orange-500 shrink-0" />
            <h2>POP Latensi &amp; SFP+ Optical DDM Telemetri</h2>
          </div>
          <p className="text-xs md:text-sm text-slate-500 leading-relaxed max-w-4xl mt-2">
            Mengukur kestabilan latency ping antar POP server harian Anda. Melacak daya pancar laser optik (SFP DDM:{' '}
            <span className="text-orange-500 font-semibold">RX/TX Power</span>, temperatur sasis transceiver,
            tegangan voltase) langsung dari modul hardware BNG tepi Anda.
          </p>
        </div>

        <div>
          <span className="font-mono text-[10px] font-bold text-slate-400 tracking-wider uppercase block mt-4 mb-3">
            KELEBIHAN FITUR PADA HALAMAN INI:
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              'Continuous sparkline monitoring kelusuan ping POP',
              'Integritas utilitas CPU/Memory router pusat on-premises',
              'Peta optikal DDM terpusat mendeteksi anomali laser',
            ].map((feat) => (
              <div
                key={feat}
                className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 shadow-2xs"
              >
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-medium text-xs text-slate-700 leading-snug">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
