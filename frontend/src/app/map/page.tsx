'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Map,
  Info,
  Plus,
  X,
  MapPin,
  Layers,
  ArrowLeft,
  Zap,
  Network,
  CheckCircle2,
  Cable,
  AlertTriangle,
  Server,
  GitBranch,
  Eye,
  EyeOff,
  RefreshCw,
  Menu,
} from 'lucide-react';
import { api } from '@/lib/api';
import MapWrapper from '@/components/map/MapWrapper';
import Sidebar from '@/components/layout/Sidebar';

// ─── NODE LEGEND CONFIG ────────────────────────────────────────────────────
const LEGEND_ITEMS = [
  { color: '#f97316', bg: '#7c1014', label: 'OLT CORE TERMINAL' },
  { color: '#fbbf24', bg: '#78350f', label: 'ODC CORE SPLITTER' },
  { color: '#34d399', bg: '#064e3b', label: 'ODP Perum Bunga' },
  { color: '#4ade80', bg: '#052e16', label: 'ODP Perum Indah' },
  { color: '#fb923c', bg: '#7c2d12', label: 'SIGNAL LOSS WARNING' },
];

const CABLE_LEGEND = [
  { color: '#3b82f6', label: 'Backbone FO (OLT → ODC)', speed: '0.8s (Fast Flow)', className: 'flow-cable-backbone' },
  { color: '#10b981', label: 'Distribution FO (ODC → ODP)', speed: '1.2s (Normal Flow)', className: 'flow-cable-distribution' },
];

const LAYER_COUNTS = [
  { icon: '⚡', label: 'OLT',         count: 1,   color: 'text-orange-500' },
  { icon: '◈',  label: 'ODC',         count: 2,   color: 'text-amber-500'  },
  { icon: '📦', label: 'ODP',         count: 10,  color: 'text-emerald-600'},
  { icon: '👥', label: 'PPPoE Client',count: 520, color: 'text-sky-600'    },
];

// ─── COMPONENT ─────────────────────────────────────────────────────────────
export default function GisMapPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal,  setShowModal]  = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [showLayers, setShowLayers] = useState(true);
  const [loading,    setLoading]    = useState(false);
  const [errorMsg,   setErrorMsg]   = useState('');
  const [formData, setFormData] = useState({
    code: '', latitude: -7.4073, longitude: 109.3673, total_ports: 8, status: 'active',
  });

  const handleAddOdp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await api.post('/gis/odp', {
        code:        formData.code,
        latitude:    parseFloat(formData.latitude  as any),
        longitude:   parseFloat(formData.longitude as any),
        total_ports: parseInt(formData.total_ports  as any),
        used_ports:  0,
        status:      formData.status,
      });
      setShowModal(false);
      setFormData({ code: '', latitude: -7.4073, longitude: 109.3673, total_ports: 8, status: 'active' });
      window.location.reload();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Gagal menambahkan titik ODP baru');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8]" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <style>{`
        @keyframes lineFlow {
          0% {
            stroke-dashoffset: 24;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        
        .flow-cable-backbone {
          stroke-dasharray: 8, 8;
          animation: lineFlow 0.8s linear infinite;
        }
        
        .flow-cable-distribution {
          stroke-dasharray: 6, 6;
          animation: lineFlow 1.2s linear infinite;
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════════
          STICKY TOP HEADER
      ════════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm px-4 sm:px-5 py-3">
        <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">

          {/* Left: back + title */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors lg:hidden shrink-0"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </Link>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm shrink-0">
                <Map className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xs sm:text-sm font-black text-slate-800 leading-tight">
                  Service Area GIS Map
                </h1>
                <p className="text-[10px] text-slate-400 leading-tight hidden sm:block">Peta Spasial Fiber Optik · Purbalingga, Jawa Tengah</p>
              </div>
            </div>
          </div>

          {/* Right: badge + buttons */}
          <div className="flex items-center gap-2 justify-end flex-wrap sm:flex-nowrap">
            <span className="hidden md:inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-emerald-400 text-emerald-700 bg-emerald-50 rounded-lg">
              GPON Topology Layer
            </span>
            <button
              onClick={() => setShowLegend(v => !v)}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
              title="Toggle Legend"
            >
              {showLegend ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>Legend</span>
            </button>
            <button
              onClick={() => setShowLayers(v => !v)}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
              title="Toggle Layers"
            >
              {showLayers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>Layers</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-sm shadow-emerald-500/20 transition-all text-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah ODP</span>
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════
          MAIN CONTENT
      ════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-screen-2xl mx-auto px-5 py-5 space-y-5">

        {/* ── INFO BANNER ── */}
        <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-xs font-medium shadow-sm">
          <Info className="w-4 h-4 shrink-0 text-blue-500" />
          <span>
            Klik marker pada peta untuk melihat detail node. Gunakan <kbd className="px-1.5 py-0.5 bg-white border border-blue-200 rounded text-[10px] font-mono">scroll</kbd> atau tombol <kbd className="px-1.5 py-0.5 bg-white border border-blue-200 rounded text-[10px] font-mono">+/-</kbd> untuk zoom. Seret peta untuk navigasi area layanan.
          </span>
        </div>

        {/* ── MAP CANVAS CARD ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          {/* Map sub-header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Topologi GPON · OpenStreetMap · Purbalingga −7.407°, 109.367°</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <svg className="w-5 h-2 overflow-visible" viewBox="0 0 20 4">
                  <line x1="0" y1="2" x2="20" y2="2" stroke="#3b82f6" strokeWidth="3" className="flow-cable-backbone" />
                </svg>
                Backbone (Fast Flow)
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-5 h-2 overflow-visible" viewBox="0 0 20 4">
                  <line x1="0" y1="2" x2="20" y2="2" stroke="#10b981" strokeWidth="2.5" className="flow-cable-distribution" />
                </svg>
                Distribution (Normal Flow)
              </span>
            </div>
          </div>

          {/* Map viewport – RELATIVE wrapper for overlays */}
          <div className="relative h-[420px] sm:h-[520px]">
            <MapWrapper />

            {/* ── LEGEND OVERLAY – bottom left z-[1000] ── */}
            {showLegend && (
              <div
                className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-xl p-2.5 sm:p-3.5 max-w-[calc(100%-1rem)] sm:max-w-xs max-h-[50vh] overflow-y-auto"
                style={{ zIndex: 1000 }}
              >
                <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Layers className="w-3 h-3" /> Node Map Legend
                  </p>
                  <span className="flex items-center gap-1 text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full shadow-xs">
                    <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500 animate-pulse" />
                    Flowing
                  </span>
                </div>
                <div className="space-y-1.5">
                  {LEGEND_ITEMS.map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 border-2"
                        style={{ background: item.bg, borderColor: item.color }}
                      />
                      <span className="text-[10px] font-semibold text-slate-700">{item.label}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-100 pt-2 mt-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Jalur Cable Flow</span>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Flowing (Sinyal Aktif)
                      </span>
                    </div>
                    {CABLE_LEGEND.map(c => (
                      <div key={c.label} className="flex items-center justify-between gap-2 bg-slate-50/80 p-1.5 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2">
                          <svg className="w-6 h-2 shrink-0 overflow-visible" viewBox="0 0 24 4">
                            <line
                              x1="0" y1="2" x2="24" y2="2"
                              stroke={c.color}
                              strokeWidth="3"
                              className={c.className}
                            />
                          </svg>
                          <div>
                            <p className="text-[10px] font-bold text-slate-700 leading-none">{c.label}</p>
                            <p className="text-[9px] text-slate-400 font-mono mt-0.5">{c.speed}</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-700 bg-emerald-100/80 border border-emerald-300/60 px-1.5 py-0.5 rounded-md shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          Flowing
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── LAYERS OVERLAY – bottom right z-[1000] ── */}
            {showLayers && (
              <div
                className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-xl p-3.5"
                style={{ zIndex: 1000, minWidth: 185 }}
              >
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Network className="w-3 h-3" /> Layers &amp; Count
                </p>
                <div className="space-y-1.5">
                  {LAYER_COUNTS.map(item => (
                    <div key={item.label} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                      <span className={`font-black tabular-nums ${item.color}`}>
                        {item.count.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-slate-100 pt-1.5 mt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-slate-500 font-semibold">
                        <Cable className="w-3 h-3" />
                        Total FO Cable
                      </span>
                      <span className="font-black text-amber-600 tabular-nums">8.2 km</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            DOKUMENTASI GEOGRAFIS GIS CARD
        ════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">

          {/* Gradient header strip */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
                <Map className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="inline-block mb-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-white/20 text-white/90 border border-white/30">
                  DOKUMENTASI GEOGRAFIS GIS
                </span>
                <h2 className="text-base font-black text-white leading-tight">
                  Peta Topologi GIS &amp; Kabel Fiber Optik
                </h2>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-2 text-[11px] text-white/80 font-semibold bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg">
              <Server className="w-3.5 h-3.5" />
              PostGIS Backend · FastAPI v1
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Description */}
            <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
              Solusi visualisasi geografis untuk menginventarisir{' '}
              <strong className="text-slate-800">tiang jalur FO</strong>,{' '}
              <strong className="text-slate-800">sasis ODC</strong>, dan{' '}
              <strong className="text-slate-800">kotak splitter ODP</strong>.
              Dapat secara cerdas <em>mengestimasi jarak drop kabel</em> ke rumah pelanggan
              sekaligus menghitung{' '}
              <strong className="text-amber-600">estimasi optical loss (redaman dBm)</strong>{' '}
              berdasarkan topologi jaringan GPON aktual.
            </p>

            {/* ── 3 Feature Boxes ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: <Zap className="w-5 h-5 text-amber-500" />,
                  bg: 'bg-amber-50 border-amber-200',
                  accent: 'text-amber-700',
                  iconBg: 'bg-amber-100',
                  title: 'Auto-Attenuation Loss',
                  desc: 'Perhitungan redaman otomatis berdasarkan panjang tarikan kabel drop FO dari ODP ke lokasi pelanggan akhir.',
                },
                {
                  icon: <MapPin className="w-5 h-5 text-emerald-500" />,
                  bg: 'bg-emerald-50 border-emerald-200',
                  accent: 'text-emerald-700',
                  iconBg: 'bg-emerald-100',
                  title: 'Penempatan Marker ODP',
                  desc: 'Penempatan marker tiang ODP secara intuitif di peta interaktif dengan klik langsung pada koordinat area layanan.',
                },
                {
                  icon: <GitBranch className="w-5 h-5 text-sky-500" />,
                  bg: 'bg-sky-50 border-sky-200',
                  accent: 'text-sky-700',
                  iconBg: 'bg-sky-100',
                  title: 'Hubungan Core Terpadu',
                  desc: 'Visualisasi jalur core terpadu dari sasis OLT pusat melewati ODC splitter hingga ke setiap ODP dan pelanggan aktif.',
                },
              ].map(feat => (
                <div key={feat.title} className={`border rounded-xl p-4 space-y-3 ${feat.bg}`}>
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl ${feat.iconBg} flex items-center justify-center shadow-sm`}>
                      {feat.icon}
                    </div>
                    <CheckCircle2 className={`w-4 h-4 ${feat.accent}`} />
                  </div>
                  <div>
                    <h4 className={`text-sm font-black ${feat.accent} mb-1`}>{feat.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── 5 Stats Metric Badges ── */}
            <div className="flex flex-wrap items-stretch gap-3 pt-1 border-t border-slate-100">
              {[
                { label: 'Coverage Area',      value: '12.4 km²',  color: 'text-emerald-600', border: 'border-emerald-200', bg: 'bg-emerald-50' },
                { label: 'Total Tiang FO',      value: '248 Tiang', color: 'text-amber-600',   border: 'border-amber-200',   bg: 'bg-amber-50'  },
                { label: 'Avg Loss / km',        value: '0.35 dB',   color: 'text-sky-600',     border: 'border-sky-200',     bg: 'bg-sky-50'    },
                { label: 'Max Drop Distance',    value: '320 m',     color: 'text-violet-600',  border: 'border-violet-200',  bg: 'bg-violet-50' },
                { label: 'Redundant Path',       value: '3 Ring',    color: 'text-rose-500',    border: 'border-rose-200',    bg: 'bg-rose-50'   },
              ].map(s => (
                <div key={s.label}
                  className={`flex flex-col items-center ${s.bg} border ${s.border} rounded-xl px-5 py-3 flex-1 min-w-[110px]`}
                >
                  <span className={`text-lg font-black ${s.color} leading-none`}>{s.value}</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-1 text-center">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>{/* /max-w wrapper */}

      {/* ══════════════════════════════════════════════════════════════════
          MODAL: TAMBAH ODP
      ════════════════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-[2000] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl relative">

            {/* Modal Header */}
            <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">Tambah Titik ODP Baru</h3>
                <p className="text-[11px] text-slate-400">Optical Distribution Point – GPON Layer</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="ml-auto text-slate-300 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              {errorMsg && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleAddOdp} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1.5 font-bold">Kode ODP <span className="text-rose-400">*</span></label>
                  <input
                    type="text" required
                    placeholder="Contoh: ODP-PBG-011"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 placeholder:text-slate-400 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1.5 font-bold">Latitude</label>
                    <input
                      type="number" step="any" required
                      value={formData.latitude}
                      onChange={e => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 font-mono transition"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1.5 font-bold">Longitude</label>
                    <input
                      type="number" step="any" required
                      value={formData.longitude}
                      onChange={e => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 font-mono transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1.5 font-bold">Total Port</label>
                    <input
                      type="number" min="1" max="64" required
                      value={formData.total_ports}
                      onChange={e => setFormData({ ...formData, total_ports: parseInt(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1.5 font-bold">Status Awal</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
                    >
                      <option value="active">Active</option>
                      <option value="full">Full</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold transition-colors text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold shadow-sm shadow-emerald-500/20 transition-all disabled:opacity-60 text-xs"
                  >
                    {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    {loading ? 'Menyimpan…' : 'Simpan ODP'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
