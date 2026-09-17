'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Server,
  Fan,
  Zap,
  Check,
  Cpu,
  RefreshCw,
  Info,
  AlertTriangle,
  CheckCircle2,
  Search,
  ShieldCheck,
  Menu,
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';

export default function ZteOltManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'dying_gasp' | 'los'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Sample data pelanggan ONU untuk kemudahan operasional
  const onuData = [
    { id: 'ZTEG0182D990', name: 'Bpk. Ahmad (Perum Bunga Rt 02)', pon: '1/1/3', status: 'dying_gasp', rx: '0 dBm', note: 'Mati Lampu (Listrik Rumah Padam)', action: 'Tunggu PLN / Konfirmasi Pemilik Rumah' },
    { id: 'ZTEG0182C341', name: 'Ibu SITI (Perum Indah Blok C)', pon: '1/1/2', status: 'los', rx: '-28.4 dBm', note: 'Sinyal Putus (Kabel Drop FO Putus)', action: 'Kirim Teknisi Cek Kabel Drop FO' },
    { id: 'ZTEG0182A90F', name: 'Toko Rejeki (Jl. Ahmad Yani)', pon: '1/1/1', status: 'online', rx: '-18.2 dBm', note: 'Internet Lancar Normal', action: 'Tidak Perlu Tindakan' },
    { id: 'ZTEG0182B102', name: 'Bpk. Bambang (Griya Asri 05)', pon: '1/1/1', status: 'online', rx: '-19.1 dBm', note: 'Internet Lancar Normal', action: 'Tidak Perlu Tindakan' },
    { id: 'ZTEG0182E412', name: 'Klinik Medika (Jl. Jend Sudirman)', pon: '1/1/3', status: 'online', rx: '-17.5 dBm', note: 'Internet Lancar Normal', action: 'Tidak Perlu Tindakan' },
  ];

  const filteredOnu = onuData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || item.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-800 p-4 sm:p-6 md:p-8 space-y-6" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* ── BAR NAVIGASI ATAS & PANDUAN PENGGUNA ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-white text-orange-500 border border-slate-200 hover:bg-slate-50 transition-colors lg:hidden shadow-2xs"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 hover:bg-slate-50 px-3.5 py-2 rounded-xl shadow-2xs transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Kembali ke Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </Link>
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <span className="text-xs font-medium text-slate-500 hidden md:flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            Panduan Awam: Pilih kartu metrik di bawah untuk menyaring status pelanggan mati lampu atau kabel putus.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl shadow-2xs transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-orange-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Memperbarui...' : 'Refresh Status OLT'}</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          1. CARD UTAMA OLT MANAGEMENT PANEL (Sesuai Gambar Referensi 1:1)
      ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xs border-t-[4px] border-t-orange-500 overflow-hidden p-6 md:p-8 space-y-6">
        
        {/* HEADER ATAS PANEL */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 inline-block animate-pulse" />
              <span className="font-mono text-[11px] text-orange-500 font-bold tracking-wider uppercase">
                OLT MANAGEMENT PANEL
              </span>
            </div>
            <h1 className="font-extrabold text-slate-900 text-lg md:text-xl tracking-tight mt-1">
              Real-time monitoring and control for ZTE C300 &amp; C600 Series
            </h1>
          </div>

          <div className="shrink-0">
            <span className="bg-slate-100 border border-slate-200/80 rounded-lg px-3.5 py-1.5 text-xs font-mono font-medium text-slate-700 inline-flex items-center gap-2">
              Host: OLT_DEMO_A (10.20.0.11)
            </span>
          </div>
        </div>

        {/* BARIS METRIK (4 CARDS GRID) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: ONLINE ONUS */}
          <div
            onClick={() => setActiveTab('all')}
            className={`cursor-pointer transition-all bg-white border rounded-2xl p-4 shadow-2xs hover:border-emerald-300 ${activeTab === 'all' ? 'border-emerald-500 ring-2 ring-emerald-50' : 'border-slate-200/80'}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2 block">
                ONLINE ONUS
              </span>
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Aktif</span>
            </div>
            <div className="flex items-baseline">
              <span className="font-mono text-2xl font-bold text-emerald-600">
                1221
              </span>
              <span className="text-xs text-slate-400 ml-2 font-mono">
                94.4% Uptime
              </span>
            </div>
          </div>

          {/* Card 2: DYINGGASP ALARM */}
          <div
            onClick={() => setActiveTab('dying_gasp')}
            className={`cursor-pointer transition-all bg-white border rounded-2xl p-4 shadow-2xs hover:border-amber-300 ${activeTab === 'dying_gasp' ? 'border-amber-500 ring-2 ring-amber-50' : 'border-slate-200/80'}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2 block">
                DYINGGASP ALARM
              </span>
              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Mati Lampu</span>
            </div>
            <div className="flex items-baseline">
              <span className="font-mono text-2xl font-bold text-amber-500">
                51
              </span>
              <span className="text-xs text-slate-400 ml-2">
                Mati Lampu
              </span>
            </div>
          </div>

          {/* Card 3: LOS ALERT */}
          <div
            onClick={() => setActiveTab('los')}
            className={`cursor-pointer transition-all bg-white border rounded-2xl p-4 shadow-2xs hover:border-rose-300 ${activeTab === 'los' ? 'border-rose-500 ring-2 ring-rose-50' : 'border-slate-200/80'}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2 block">
                LOS ALERT
              </span>
              <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">Kabel Putus</span>
            </div>
            <div className="flex items-baseline">
              <span className="font-mono text-2xl font-bold text-rose-600">
                20
              </span>
              <span className="text-xs text-slate-400 ml-2">
                Signal Putus
              </span>
            </div>
          </div>

          {/* Card 4: OFFLINE */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
            <span className="font-mono text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2 block">
              OFFLINE
            </span>
            <div className="flex items-baseline">
              <span className="font-mono text-2xl font-bold text-slate-600">
                1
              </span>
              <span className="text-xs text-slate-400 ml-2">
                Deconfigured
              </span>
            </div>
          </div>
        </div>

        {/* PANEL HARDWARE & POWER (2 KOLOM GRID) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Box Kiri: HARDWARE INTEGRITY: FANS STATUS */}
          <div className="bg-[#f8fafc]/50 border border-slate-200/80 rounded-2xl p-5">
            <div className="font-mono text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3 flex items-center gap-2">
              <Fan className="w-3.5 h-3.5 text-teal-600 animate-spin" style={{ animationDuration: '4s' }} />
              <span>HARDWARE INTEGRITY: FANS STATUS</span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-200/40">
                <span className="text-slate-500">Fan Module 1:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">2080 RPM</span>
                  <span className="text-emerald-600 font-bold">● Online</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200/40">
                <span className="text-slate-500">Fan Module 2:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">2100 RPM</span>
                  <span className="text-emerald-600 font-bold">● Online</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Fan Module 3:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">2100 RPM</span>
                  <span className="text-emerald-600 font-bold">● Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Box Kanan: POWER FEED & ENVIRONMENT */}
          <div className="bg-[#f8fafc]/50 border border-slate-200/80 rounded-2xl p-5">
            <div className="font-mono text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>POWER FEED &amp; ENVIRONMENT</span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-200/40">
                <span className="text-slate-500">Power Supply A (SFP+_1):</span>
                <span className="text-emerald-600 font-bold">OK Dual Active</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200/40">
                <span className="text-slate-500">Power Supply B (SFP+_2):</span>
                <span className="text-emerald-600 font-bold">OK Dual Active</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Main CPU Host Temp:</span>
                <span className="text-amber-500 font-bold">52°C (Maks 110°C)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════
          2. CARD DOKUMENTASI SASIS (CARD BAWAH - Sesuai Gambar Referensi 1:1)
      ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-br from-orange-50/20 via-white to-slate-50 border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-xs space-y-4">
        <div>
          <span className="bg-orange-100/70 border border-orange-200 text-orange-600 font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-2">
            SASIS HARDWARE ZTE GPON
          </span>
          <div className="flex items-center gap-2.5 text-lg md:text-xl font-extrabold text-slate-900">
            <Cpu className="w-5 h-5 text-orange-500 shrink-0" />
            <h2>Manajemen ZTE OLT C300/C600 Series</h2>
          </div>
          <p className="text-xs md:text-sm text-slate-500 leading-relaxed max-w-4xl mt-2">
            Tampilan sasis dashboard berlatar terang yang didesain khusus untuk hardware OLT ZTE. Memberikan informasi penunjang sirkulasi deteksi fan cooling, dual-cabling catu daya listrik ganda, and alarm Dying Gasp saat sasis ONT mati.
          </p>
        </div>

        <div>
          <span className="font-mono text-[10px] font-bold text-slate-400 tracking-wider uppercase block mt-4 mb-3">
            KELEBIHAN FITUR PADA HALAMAN INI:
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Feature Card 1 */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 shadow-2xs hover:border-emerald-200 transition-colors">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-medium text-xs text-slate-700 leading-snug">
                Passive monitoring sirkulasi kecepatan RPM Fan sasis
              </span>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 shadow-2xs hover:border-emerald-200 transition-colors">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-medium text-xs text-slate-700 leading-snug">
                Deteksi alarm Dying Gasp instan (kabel putus / mati lampu)
              </span>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 shadow-2xs hover:border-emerald-200 transition-colors">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-medium text-xs text-slate-700 leading-snug">
                Pengelompokan jenis alarm LOS &amp; status PON card hardware
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          3. PANDUAN PENGOPERASIAN RAMAH AWAM (USER-FRIENDLY ASSISTANT)
      ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h3 className="font-extrabold text-slate-900 text-base">
                Panduan Operasional Awam: Cara Membaca &amp; Menangani Alarm
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tabel di bawah menjelaskan arti setiap status bagi petugas/layanan pelanggan awam.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama pelanggan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 font-sans w-full sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* Tab Penjelasan Awam */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs space-y-1">
            <p className="font-bold text-amber-800 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Dying Gasp Alarm (51)
            </p>
            <p className="text-amber-700 text-[11px] leading-relaxed">
              artinya <strong>Listrik Padam / Mati Lampu</strong> di rumah pelanggan. Kabel optik tidak rusak.
            </p>
          </div>

          <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl text-xs space-y-1">
            <p className="font-bold text-rose-800 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              LOS Alert Signal Putus (20)
            </p>
            <p className="text-rose-700 text-[11px] leading-relaxed">
              artinya <strong>Kabel Drop FO Putus / Terjepit</strong>. Perlu mengirim teknisi ke lapangan.
            </p>
          </div>

          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs space-y-1">
            <p className="font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Online ONUs (1221)
            </p>
            <p className="text-emerald-700 text-[11px] leading-relaxed">
              artinya <strong>Koneksi Lancar Normal</strong> (94.4% Uptime). Pelanggan berinternet normal.
            </p>
          </div>
        </div>

        {/* Tabel Informasi Pelanggan & Langkah Penanganan */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Nama Pelanggan</th>
                <th className="py-3 px-4">Port / Lokasi OLT</th>
                <th className="py-3 px-4">Kondisi Jaringan</th>
                <th className="py-3 px-4">Penjelasan Bahasa Awam</th>
                <th className="py-3 px-4">Rekomendasi Tindakan Sederhana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredOnu.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800">
                    <div>{item.name}</div>
                    <div className="text-[10px] font-mono font-normal text-slate-400">{item.id}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{item.pon}</td>
                  <td className="py-3 px-4">
                    {item.status === 'online' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Lancar Normal
                      </span>
                    )}
                    {item.status === 'dying_gasp' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Zap className="w-3 h-3 text-amber-500" />
                        Listrik Padam
                      </span>
                    )}
                    {item.status === 'los' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                        Kabel Putus
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-600">{item.note}</td>
                  <td className="py-3 px-4 font-bold text-slate-700">
                    <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg inline-block text-[11px]">
                      {item.action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
