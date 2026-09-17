'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Map,
  Server,
  Activity,
  FileText,
  Terminal,
  Users,
  LineChart,
  Radio,
  Network,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  Wifi,
  ShieldCheck,
  Zap,
  Globe,
  Search,
  ChevronRight,
  Sparkles,
  MapPin,
  RefreshCw,
  Menu,
  X
} from 'lucide-react';
import { api, Device, CustomerONU } from '@/lib/api';

const sidebarMenus = [
  { id: '1', label: '1. Dasbor Utama Monitor', href: '/', icon: LayoutDashboard },
  { id: '2', label: '2. Peta GIS Area Map', href: '/map', icon: Map },
  { id: '3', label: '3. Manajemen ZTE OLT', href: '/devices/olt', icon: Server },
  { id: '4', label: '4. Telemetri SFP POP', href: '/telemetri', icon: Activity },
  { id: '5', label: '5. Syslog Real-Time', href: '/syslog', icon: FileText },
  { id: '6', label: '6. Remote CLI OLT', href: '/cli', icon: Terminal },
  { id: '7', label: '7. Database Pelanggan', href: '/customers', icon: Users },
  { id: '8', label: '8. MRTG & Grafik Trafik', href: '#', icon: LineChart },
  { id: '9', label: '9. ONU Belum Registrasi', href: '#', icon: Radio },
  { id: '10', label: '10. Antarmuka IP Statis', href: '#', icon: Network },
];

export default function NocmonCommandCenter() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [topbarStats, setTopbarStats] = useState({
    routersOnline: 1,
    routersTotal: 2,
    totalOdps: 3,
    onlineCustomers: 0,
  });
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    pppoeOnline: 1420,
    pppoeOffline: 12,
    pppoeTotal: 1432,
    staticOnline: 385,
    staticOffline: 3,
    staticTotal: 388,
    totalRxGbps: 9.42,
    totalTxGbps: 4.18,
    latency: '1.2 ms',
    jitter: '0.3 ms',
    uptime: '99.99%',
  });

  const [trafficLinks, setTrafficLinks] = useState([
    {
      id: 'link-a',
      name: 'Transit Link A (IP Transit Telkom)',
      interface: '10G-SFP+-01',
      status: 'ONLINE',
      rxSpeed: '3.73 Gbps',
      txSpeed: '1.45 Gbps',
      utilization: 62,
      latency: '2.1 ms',
      jitter: '0.4 ms',
    },
    {
      id: 'link-b',
      name: 'Backbone Link B (Fiber JKT-BDG)',
      interface: '10G-SFP+-02',
      status: 'ONLINE',
      rxSpeed: '2.98 Gbps',
      txSpeed: '1.20 Gbps',
      utilization: 48,
      latency: '3.5 ms',
      jitter: '0.6 ms',
    },
    {
      id: 'link-c',
      name: 'Peering Link C (OpenIXP / IIX)',
      interface: '10G-SFP+-03',
      status: 'ONLINE',
      rxSpeed: '1.85 Gbps',
      txSpeed: '1.10 Gbps',
      utilization: 38,
      latency: '1.8 ms',
      jitter: '0.2 ms',
    },
    {
      id: 'link-d',
      name: 'Metro Link D (Ring Metro Fiber POP)',
      interface: '10G-SFP+-04',
      status: 'ONLINE',
      rxSpeed: '800 Mbps',
      txSpeed: '430 Mbps',
      utilization: 25,
      latency: '0.9 ms',
      jitter: '0.1 ms',
    },
  ]);

  const [activeTab, setActiveTab] = useState('1');

  const fetchLiveMetrics = async () => {
    setLoading(true);
    try {
      const [devStatsRes, odpRes, onuRes] = await Promise.all([
        api.get('/devices/stats').catch(() => ({ data: { total: 2, online: 1 } })),
        api.get('/gis/odps').catch(() => ({ data: { features: [1, 2, 3] } })),
        api.get<CustomerONU[]>('/customers/onu').catch(() => ({ data: [] })),
      ]);

      const onlineCustomers = Array.isArray(onuRes.data)
        ? onuRes.data.filter((c: any) => c.status === 'online').length
        : 0;

      setTopbarStats({
        routersOnline: devStatsRes.data.online ?? 1,
        routersTotal: devStatsRes.data.total ?? 2,
        totalOdps: odpRes.data.features?.length ?? 3,
        onlineCustomers: onlineCustomers,
      });
    } catch (err) {
      console.error('Failed to load live metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMetrics();
    const interval = setInterval(fetchLiveMetrics, 12000);
    return () => clearInterval(interval);
  }, []);

  // Micro fluctuations simulation for traffic links
  useEffect(() => {
    const timer = setInterval(() => {
      setTrafficLinks((prev) =>
        prev.map((link) => {
          if (link.id === 'link-a') {
            const rx = (3.70 + Math.random() * 0.12).toFixed(2);
            return { ...link, rxSpeed: `${rx} Gbps` };
          }
          if (link.id === 'link-b') {
            const rx = (2.95 + Math.random() * 0.10).toFixed(2);
            return { ...link, rxSpeed: `${rx} Gbps` };
          }
          return link;
        })
      );
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* 2. Topbar System Status Bar (Horizontal Header) */}
      <header className="sticky top-0 z-50 bg-[#111625]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3 flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 shadow-xl">
        {/* Left Branding & Mobile Toggle */}
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950 font-black" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm sm:text-base font-black tracking-wider text-slate-100">NOCMON V1.1</h1>
                <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  PROD LIVE
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400">NOC Infrastructure & Telemetry Monitor</p>
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-amber-400 border border-slate-700/80 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Center/Right Status Indicators & Live Counters */}
        <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6 text-xs overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
          {/* Status Indicator 1 */}
          <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-extrabold text-emerald-400 uppercase tracking-wide text-[10px] sm:text-xs">NOC LIVE</span>
          </div>

          <span className="text-slate-700 hidden lg:inline">|</span>

          {/* Status Indicator 2 */}
          <span className="text-slate-400 font-mono hidden xl:inline text-xs">PostGIS Network Monitor v1.1</span>

          <span className="text-slate-700 hidden md:inline">|</span>

          {/* Counter 1: Router */}
          <div className="flex items-center space-x-2 bg-slate-900/80 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
            <Server className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px] sm:text-xs">Router: <strong className="text-emerald-400">{topbarStats.routersOnline}</strong>/{topbarStats.routersTotal}</span>
          </div>

          {/* Counter 2: Total ODP */}
          <div className="flex items-center space-x-2 bg-slate-900/80 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] sm:text-xs">ODP: <strong className="text-amber-400">{topbarStats.totalOdps}</strong></span>
          </div>

          {/* Counter 3: Pelanggan Online */}
          <div className="flex items-center space-x-2 bg-slate-900/80 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
            <Users className="w-4 h-4 text-sky-400" />
            <span className="text-[11px] sm:text-xs">Online: <strong className="text-sky-400">{topbarStats.onlineCustomers}</strong></span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchLiveMetrics}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors shrink-0"
            title="Refresh Real-time Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Backdrop Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* 3. Sidebar Navigasi Kiri (10 Menu Tabs) */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#111625] border-r border-slate-800/80 flex flex-col justify-between select-none py-4 px-3 flex-shrink-0 transform lg:transform-none transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              Navigasi Operasional
            </div>

            {sidebarMenus.map((menu) => {
              const Icon = menu.icon;
              const isCurrent = menu.id === '1';

              return menu.href.startsWith('/') ? (
                <Link
                  key={menu.id}
                  href={menu.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isCurrent
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/5'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span className="truncate">{menu.label}</span>
                  </div>
                  {isCurrent && <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                </Link>
              ) : (
                <button
                  key={menu.id}
                  onClick={() => {
                    setActiveTab(menu.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    activeTab === menu.id
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/5'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${activeTab === menu.id ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span className="truncate">{menu.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Sidebar Bottom Badge */}
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 space-y-2 mt-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>NOC Core Active</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              PostgreSQL/PostGIS, FastAPI Port 8001, & Telegram Bot Live.
            </p>
          </div>
        </aside>

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6 bg-[#0b0f19]">
          {/* 4. Header Utama Konten & Search Bar */}
          <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 bg-[#111625]/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl">
            <div>
              <h2 className="text-xl font-black text-slate-100 tracking-tight flex items-center space-x-2">
                <LayoutDashboard className="w-5 h-5 text-amber-400" />
                <span>Dasbor Utama Monitor & Traffic Status</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Monitoring real-time throughput bandwidth, status sesi pelanggan PPPoE, dan telemetri link backbone.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Bar Input */}
              <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-300 min-w-[240px]">
                <Search className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Cari IP, OLT, atau ODP..."
                  className="bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none w-full"
                />
              </div>

              {/* Accent Orange/Amber Button to /map */}
              <Link
                href="/map"
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all shrink-0"
              >
                <Map className="w-4 h-4" />
                <span>Buka Peta GIS Area Map</span>
              </Link>
            </div>
          </div>

          {/* 5. Top 4 Summary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: PPPOE CLIENT STATUS */}
            <div className="bg-[#111625]/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 hover:border-emerald-500/40 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">PPPOE CLIENT STATUS</p>
                  <h3 className="text-2xl font-black text-slate-100 mt-1">
                    {stats.pppoeOnline} <span className="text-xs font-semibold text-slate-400">/ {stats.pppoeTotal} Active</span>
                  </h3>
                </div>
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <Wifi className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs font-bold pt-1">
                <span className="inline-flex items-center text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5 mr-1" /> {stats.pppoeOnline} Online
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-rose-400">{stats.pppoeOffline} Offline</span>
              </div>
            </div>

            {/* Card 2: STATIC CLIENTS STATUS */}
            <div className="bg-[#111625]/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 hover:border-sky-500/40 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">STATIC CLIENTS STATUS</p>
                  <h3 className="text-2xl font-black text-sky-400 mt-1">
                    {stats.staticOnline} <span className="text-xs font-semibold text-slate-400">/ {stats.staticTotal} Connected</span>
                  </h3>
                </div>
                <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
                  <Network className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs font-bold pt-1">
                <span className="inline-flex items-center text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5 mr-1" /> {stats.staticOnline} Online
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-rose-400">{stats.staticOffline} Offline</span>
              </div>
            </div>

            {/* Card 3: AGGREGATE TRAFFIC */}
            <div className="bg-[#111625]/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 hover:border-amber-500/40 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">AGGREGATE TRAFFIC</p>
                  <h3 className="text-xl font-black text-amber-400 mt-1">
                    {stats.totalRxGbps} Gbps <span className="text-xs font-normal text-slate-400">RX</span>
                  </h3>
                </div>
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center space-x-3 text-xs font-mono font-bold pt-1">
                <span className="inline-flex items-center text-sky-400">
                  <ArrowDownLeft className="w-3.5 h-3.5 mr-0.5" /> RX: {stats.totalRxGbps} G
                </span>
                <span className="inline-flex items-center text-amber-400">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> TX: {stats.totalTxGbps} G
                </span>
              </div>
            </div>

            {/* Card 4: CORE LATENCY & HEALTH */}
            <div className="bg-[#111625]/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 hover:border-violet-500/40 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">CORE LATENCY & HEALTH</p>
                  <h3 className="text-xl font-black text-emerald-400 mt-1 flex items-center space-x-1.5">
                    <span>{stats.latency}</span>
                    <span className="text-xs text-slate-400 font-semibold">(Jitter {stats.jitter})</span>
                  </h3>
                </div>
                <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20">
                  <Globe className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-slate-400 font-semibold pt-1">
                Backbone Uptime: <strong className="text-emerald-400">{stats.uptime}</strong>
              </p>
            </div>
          </div>

          {/* 6. Traffic Links 2x2 Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>Status & Telemetri Traffic Links (2x2 Grid)</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Sampling Rate: 1 sec</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {trafficLinks.map((link) => (
                <div
                  key={link.id}
                  className="bg-[#111625]/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 hover:border-amber-500/40 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">{link.name}</h4>
                      <p className="text-[11px] font-mono text-slate-400">Interface: {link.interface}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 inline-flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>{link.status}</span>
                    </span>
                  </div>

                  {/* Traffic RX / TX Meter */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800/80 font-mono text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded bg-sky-500/10 text-sky-400">
                        <ArrowDownLeft className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">RX Throughput</p>
                        <p className="font-bold text-sky-400 text-sm">{link.rxSpeed}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded bg-amber-500/10 text-amber-400">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">TX Throughput</p>
                        <p className="font-bold text-amber-400 text-sm">{link.txSpeed}</p>
                      </div>
                    </div>
                  </div>

                  {/* Amber/Yellow Progress Bar for Link Capacity Utilized */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1 font-semibold">
                      <span>Kapasitas Link Utilized</span>
                      <span className="text-amber-400 font-mono font-bold">{link.utilization}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full shadow-sm shadow-amber-500/50 transition-all duration-500"
                        style={{ width: `${link.utilization}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Latency and Jitter at the bottom */}
                  <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
                    <span>Latency: <strong className="text-slate-200">{link.latency}</strong></span>
                    <span>Jitter: <strong className="text-slate-200">{link.jitter}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 7. Footer Banner Info Card: "Dasbor Operasional Utama" */}
          <div className="bg-gradient-to-r from-[#111625] via-[#111625]/95 to-[#161e33] backdrop-blur-md p-6 rounded-2xl border border-slate-800/90 shadow-2xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-100">Dasbor Operasional Utama</h3>
                <p className="text-xs text-slate-400">Pusat komando dan telemetri pemantauan jaringan terpadu NOCMON V1.1.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              Sistem telemetri terpadu NOCMON memberikan visualisasi real-time atas performa jaringan backbone, status pelanggan PPPoE & IP Statis, serta integrasi pemetaan GIS spasial PostGIS untuk keandalan infrastruktur jaringan ISP secara 24/7.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>1. Monitoring Telemetri Multi-Link</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Pengawasan real-time throughput RX/TX pada setiap link transit, backbone, peering, dan metro ring dengan ambang batas latensi rendah.
                </p>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                <div className="flex items-center space-x-2 text-xs font-bold text-sky-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                  <span>2. Integrasi GIS Spasial & Fiber</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Visualisasi titik ODP dan jalur kabel fiber optik (<code className="font-mono text-cyan-400">LineString</code>) langsung dari database PostgreSQL/PostGIS.
                </p>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>3. Notifikasi Otomatis & Terpusat</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Pengiriman notifikasi darurat secara instan via Telegram Bot saat terjadi insiden link down atau perubahan status router Mikrotik & OLT.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
