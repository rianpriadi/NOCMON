'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Filter,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Terminal,
  RefreshCw,
  Pause,
  Play,
  Download,
  Check,
  Radio,
} from 'lucide-react';

// ── DEMO SYSLOG DATA ──────────────────────────────────────────────────────────
type LogSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'ERROR' | 'DEBUG';

interface LogEntry {
  id: number;
  time: string;
  severity: LogSeverity;
  source: string;
  topic: string;
  message: string;
}

const DEMO_LOGS: LogEntry[] = [
  { id: 1,  time: '14:25:05', severity: 'INFO',     source: 'Core-01',     topic: 'system.info',      message: 'SNMP poll request processed successfully from 10.10.0.4' },
  { id: 2,  time: '14:25:12', severity: 'WARNING',  source: 'BNG-01',      topic: 'pppoe.warn',       message: 'Customer demo-eth1 disconnected, line attenuation high' },
  { id: 3,  time: '14:25:19', severity: 'INFO',     source: 'Transit-01',  topic: 'system.info',      message: 'SNMP poll request processed successfully from 10.101.2.5' },
  { id: 4,  time: '14:25:24', severity: 'CRITICAL', source: 'Transit-01',  topic: 'firewall.info',    message: 'Interface.info: Metro-Link-A traffic reached 90% maximum threshold!' },
  { id: 5,  time: '14:25:31', severity: 'INFO',     source: 'Core-01',     topic: 'routing.info',     message: 'Interface Metro-Link-A traffic reached 80% maximum threshold' },
  { id: 6,  time: '14:25:38', severity: 'INFO',     source: 'BNG-01',      topic: 'dhcp.alert',       message: 'DHCP client lease updated for 10.50.20.39' },
  { id: 7,  time: '14:25:43', severity: 'INFO',     source: 'Core-01',     topic: 'dhcp.warning',     message: 'DHCP alert: client lease updated for 192.168.1.31' },
  { id: 8,  time: '14:25:50', severity: 'WARNING',  source: 'BNG-01',      topic: 'ospf.info',        message: 'OSPF neighbor 10.20.0.5 state changed: FULL → 2-WAY, check cabling' },
  { id: 9,  time: '14:25:57', severity: 'CRITICAL', source: 'Core-01',     topic: 'bgp.warn',         message: 'BGP session 103.10.5.1 dropped: HOLD timer expired, peer unreachable' },
  { id: 10, time: '14:26:02', severity: 'INFO',     source: 'Transit-01',  topic: 'snmp.info',        message: 'SNMP trap received from 10.101.2.5: linkUp ifIndex 3' },
  { id: 11, time: '14:26:08', severity: 'ERROR',    source: 'BNG-01',      topic: 'pppoe.error',      message: 'PPPoE AC table full: max 4096 sessions reached, new sessions rejected!' },
  { id: 12, time: '14:26:15', severity: 'INFO',     source: 'Core-01',     topic: 'system.info',      message: 'NTP sync successful from pool.ntp.org offset +0.002s' },
  { id: 13, time: '14:26:21', severity: 'WARNING',  source: 'OLT-C300',    topic: 'olt.alarm',        message: 'ONU ZTEG0182C341 LOS alarm detected on PON port 1/1/2' },
  { id: 14, time: '14:26:27', severity: 'WARNING',  source: 'OLT-C300',    topic: 'olt.alarm',        message: 'ONU ZTEG0182D990 DyingGasp alarm: power loss event on PON 1/1/3' },
  { id: 15, time: '14:26:33', severity: 'INFO',     source: 'Transit-01',  topic: 'firewall.info',    message: 'Firewall rule #42 matched: dropped 127 packets from 45.142.120.8 (blacklist)' },
  { id: 16, time: '14:26:40', severity: 'DEBUG',    source: 'Core-01',     topic: 'debug.info',       message: 'CPU utilization: 6%, Memory: 2.8 GB / 8.0 GB used' },
  { id: 17, time: '14:26:47', severity: 'CRITICAL', source: 'BNG-01',      topic: 'pppoe.critical',   message: 'BNG-01 CPU spike 94%! PPPoE session authentication queue overflow' },
  { id: 18, time: '14:26:53', severity: 'INFO',     source: 'Core-01',     topic: 'routing.info',     message: 'Static route 0.0.0.0/0 via 103.10.5.1 active on ether1-transit' },
  { id: 19, time: '14:26:58', severity: 'ERROR',    source: 'OLT-C300',    topic: 'olt.error',        message: 'Fan Module 2 speed drop detected: 1200 RPM (normal: 2100 RPM), check hardware' },
  { id: 20, time: '14:27:04', severity: 'INFO',     source: 'BNG-01',      topic: 'system.info',      message: 'System uptime: 45 days 12 hours 33 minutes, all services running normally' },
];

const SEVERITY_CONFIG: Record<LogSeverity, { label: string; bg: string; text: string; border: string; termBg: string; icon: React.ReactNode }> = {
  INFO:     { label: 'INFO',     bg: 'bg-sky-50',     text: 'text-sky-700',    border: 'border-sky-200',    termBg: 'text-sky-400',    icon: <Info className="w-3 h-3" /> },
  DEBUG:    { label: 'DEBUG',    bg: 'bg-slate-100',  text: 'text-slate-600',  border: 'border-slate-200',  termBg: 'text-slate-400',  icon: <CheckCircle2 className="w-3 h-3" /> },
  WARNING:  { label: 'WARNING',  bg: 'bg-amber-50',   text: 'text-amber-700',  border: 'border-amber-200',  termBg: 'text-amber-400',  icon: <AlertTriangle className="w-3 h-3" /> },
  ERROR:    { label: 'ERROR',    bg: 'bg-rose-50',    text: 'text-rose-700',   border: 'border-rose-200',   termBg: 'text-rose-400',   icon: <XCircle className="w-3 h-3" /> },
  CRITICAL: { label: 'CRITICAL', bg: 'bg-red-50',     text: 'text-red-800',    border: 'border-red-300',    termBg: 'text-red-400',    icon: <AlertTriangle className="w-3 h-3" /> },
};

function SeverityBadge({ severity }: { severity: LogSeverity }) {
  const cfg = SEVERITY_CONFIG[severity];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-black border ${cfg.bg} ${cfg.text} ${cfg.border} shrink-0`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

export default function SyslogPage() {
  const [logs, setLogs] = useState<LogEntry[]>(DEMO_LOGS);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<LogSeverity | 'ALL'>('ALL');
  const [paused, setPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<HTMLDivElement>(null);

  // Simulate live incoming logs
  useEffect(() => {
    if (paused) return;
    const extraLogs: LogEntry[] = [
      { id: 100, time: '', severity: 'INFO',     source: 'Core-01',    topic: 'system.info',   message: 'SNMP poll cycle completed, 3 devices responded' },
      { id: 101, time: '', severity: 'WARNING',  source: 'OLT-C300',   topic: 'olt.alarm',     message: 'ONU ZTEG0182A90F Rx power weak: -24.3 dBm (threshold: -25 dBm)' },
      { id: 102, time: '', severity: 'INFO',     source: 'Transit-01', topic: 'routing.info',  message: 'BGP route 103.20.0.0/16 received from peer 10.101.2.1' },
      { id: 103, time: '', severity: 'CRITICAL', source: 'BNG-01',     topic: 'pppoe.critical',message: 'PPPoE session drop spike: 43 sessions dropped in last 60 seconds' },
      { id: 104, time: '', severity: 'INFO',     source: 'Core-01',    topic: 'dhcp.info',     message: 'DHCP lease pool 192.168.1.0/24: 312 / 500 leases active' },
    ];

    let idx = 0;
    const timer = setInterval(() => {
      if (idx >= extraLogs.length) { clearInterval(timer); return; }
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
      const newLog = { ...extraLogs[idx], id: Date.now() + idx, time: timeStr };
      setLogs(prev => [...prev, newLog]);
      setNewCount(c => c + 1);
      idx++;
    }, 4500);
    return () => clearInterval(timer);
  }, [paused]);

  // Auto-scroll terminal
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filtered = logs.filter(l => {
    const matchSearch =
      search === '' ||
      l.message.toLowerCase().includes(search.toLowerCase()) ||
      l.source.toLowerCase().includes(search.toLowerCase()) ||
      l.topic.toLowerCase().includes(search.toLowerCase());
    const matchSev = severityFilter === 'ALL' || l.severity === severityFilter;
    return matchSearch && matchSev;
  });

  const counts = {
    CRITICAL: logs.filter(l => l.severity === 'CRITICAL').length,
    ERROR:    logs.filter(l => l.severity === 'ERROR').length,
    WARNING:  logs.filter(l => l.severity === 'WARNING').length,
    INFO:     logs.filter(l => l.severity === 'INFO').length,
    DEBUG:    logs.filter(l => l.severity === 'DEBUG').length,
  };

  const handleDownload = () => {
    const text = filtered.map(l => `[${l.time}] [${l.severity}] [${l.source}] ${l.topic}: ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'syslog-export.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 p-4 sm:p-6 md:p-8 space-y-6" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>

      {/* ── TOP NAV BAR ── */}
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl shadow-2xs transition-all">
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          Kembali ke Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Server UDP:514 · TCP:1152
          </span>
          <button onClick={handleDownload} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl shadow-2xs transition-all">
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Log
          </button>
        </div>
      </div>

      {/* ── SEVERITY SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(['CRITICAL','ERROR','WARNING','INFO','DEBUG'] as LogSeverity[]).map(sev => {
          const cfg = SEVERITY_CONFIG[sev];
          const active = severityFilter === sev;
          return (
            <button
              key={sev}
              onClick={() => setSeverityFilter(active ? 'ALL' : sev)}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all shadow-2xs cursor-pointer text-left ${
                active ? `${cfg.bg} ${cfg.border} ring-2 ring-offset-1 ring-current` : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div>
                <span className={`font-mono text-[10px] font-black uppercase tracking-wider ${active ? cfg.text : 'text-slate-400'}`}>{sev}</span>
                <p className={`font-mono text-xl font-black mt-0.5 ${active ? cfg.text : 'text-slate-800'}`}>{counts[sev]}</p>
              </div>
              <span className={`${active ? cfg.text : 'text-slate-300'}`}>{cfg.icon}</span>
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MAIN CARD: SYSLOG RECEIVER STREAM
      ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white border border-slate-200/90 rounded-3xl border-t-[4px] border-t-orange-500 overflow-hidden shadow-xs">

        {/* Card Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="font-mono text-[11px] font-black text-orange-500 tracking-wider uppercase">
              SYSLOG RECEIVER STREAM (LIVE LOGGER)
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 flex-wrap">
            <span>Server Port: UDP:514 · TCP:1152</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-600">
              {filtered.length} baris ditampilkan
            </span>
          </div>
        </div>

        {/* Search + Filter Toolbar */}
        <div className="px-6 py-3 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari log keyword, router, server, IP..."
              value={search}
              onChange={e => { setSearch(e.target.value); setNewCount(0); }}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 font-sans transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value as LogSeverity | 'ALL')}
                className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none"
              >
                <option value="ALL">Semua Level</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="ERROR">ERROR</option>
                <option value="WARNING">WARNING</option>
                <option value="INFO">INFO</option>
                <option value="DEBUG">DEBUG</option>
              </select>
            </div>

            <button
              onClick={() => setPaused(p => !p)}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition-all ${
                paused
                  ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              {paused ? 'Resume' : 'Pause'}
            </button>

            <button
              onClick={() => setAutoScroll(a => !a)}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition-all ${
                autoScroll
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${autoScroll ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
              Auto-Scroll
            </button>
          </div>
        </div>

        {/* ── DARK TERMINAL LOG VIEWER ── */}
        <div
          ref={termRef}
          className="bg-[#0f1117] font-mono text-xs overflow-y-auto"
          style={{ height: 340 }}
        >
          {/* Terminal Header Bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1d27] border-b border-slate-700/50 sticky top-0 z-10">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 opacity-80" />
              <span className="w-3 h-3 rounded-full bg-amber-500 opacity-80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 opacity-80" />
            </div>
            <span className="text-slate-500 text-[10px] ml-2 flex items-center gap-1.5">
              <Terminal className="w-3 h-3" /> nocmon-syslog-stream —
              {paused
                ? <span className="text-amber-400 font-bold ml-1">⏸ PAUSED</span>
                : <span className="text-emerald-400 font-bold ml-1 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE</span>}
              {newCount > 0 && !paused && (
                <span className="ml-2 text-orange-400 font-bold">+{newCount} baris baru</span>
              )}
            </span>
          </div>

          {/* Log Lines */}
          <div className="p-4 space-y-1">
            {filtered.length === 0 ? (
              <p className="text-slate-500 italic text-center py-10">Tidak ada log yang cocok dengan filter.</p>
            ) : (
              filtered.map((log, i) => {
                const cfg = SEVERITY_CONFIG[log.severity];
                const rowBg = log.severity === 'CRITICAL' ? 'bg-red-500/10' : log.severity === 'ERROR' ? 'bg-rose-500/5' : '';
                return (
                  <div
                    key={log.id}
                    className={`flex flex-wrap gap-x-2 gap-y-0.5 py-1 px-2 rounded-md transition-colors hover:bg-white/5 ${rowBg} ${i >= filtered.length - 5 && !paused ? 'animate-[fadeIn_0.4s_ease]' : ''}`}
                  >
                    {/* Timestamp */}
                    <span className="text-slate-500 shrink-0">{log.time}</span>

                    {/* Severity Badge */}
                    <span className={`font-black shrink-0 ${cfg.termBg} text-[10px] uppercase`}>
                      [{log.severity}]
                    </span>

                    {/* Source */}
                    <span className="text-violet-400 font-bold shrink-0">[{log.source}]</span>

                    {/* Topic */}
                    <span className="text-slate-500 shrink-0">{log.topic}:</span>

                    {/* Message */}
                    <span className={
                      log.severity === 'CRITICAL' ? 'text-red-300' :
                      log.severity === 'ERROR'    ? 'text-rose-300' :
                      log.severity === 'WARNING'  ? 'text-amber-300' :
                      log.severity === 'DEBUG'    ? 'text-slate-500' :
                      'text-slate-200'
                    }>
                      {log.message}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Status Bar */}
        <div className="px-5 py-2.5 bg-[#1a1d27] text-[10px] font-mono text-slate-500 flex items-center justify-between">
          <span>Total log: <span className="text-slate-300 font-bold">{logs.length}</span> baris  ·  Ditampilkan: <span className="text-slate-300 font-bold">{filtered.length}</span></span>
          <span>
            {counts.CRITICAL > 0 && <span className="text-red-400 font-black mr-3">⚠ {counts.CRITICAL} CRITICAL</span>}
            {counts.ERROR > 0    && <span className="text-rose-400 font-black mr-3">✖ {counts.ERROR} ERROR</span>}
            {counts.WARNING > 0  && <span className="text-amber-400 font-black mr-3">△ {counts.WARNING} WARNING</span>}
            <span className="text-emerald-400">✓ {counts.INFO} INFO</span>
          </span>
        </div>
      </div>

      {/* ── PANDUAN AWAM ── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <Radio className="w-4 h-4 text-orange-500" />
            Panduan Membaca Log (Untuk Pengguna Awam)
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { sev: 'CRITICAL' as LogSeverity, title: 'CRITICAL — Darurat!',      desc: 'Masalah sangat serius. Jaringan terganggu parah. Perlu penanganan segera oleh teknisi!', color: 'border-red-300 bg-red-50' },
            { sev: 'ERROR'    as LogSeverity, title: 'ERROR — Ada Kesalahan',     desc: 'Terjadi galat yang mempengaruhi layanan. Perlu ditindaklanjuti dalam waktu dekat.', color: 'border-rose-200 bg-rose-50' },
            { sev: 'WARNING'  as LogSeverity, title: 'WARNING — Perlu Perhatian', desc: 'Ada kondisi abnormal (misal: batas kapasitas). Pantau agar tidak menjadi ERROR.', color: 'border-amber-200 bg-amber-50' },
            { sev: 'INFO'     as LogSeverity, title: 'INFO — Normal',             desc: 'Aktivitas jaringan berjalan normal. Tidak memerlukan tindakan apapun dari operator.', color: 'border-sky-200 bg-sky-50' },
          ].map(item => {
            const cfg = SEVERITY_CONFIG[item.sev];
            return (
              <div key={item.sev} className={`border rounded-2xl p-4 space-y-2 ${item.color}`}>
                <div className="flex items-center gap-2">
                  <span className={`${cfg.text}`}>{cfg.icon}</span>
                  <span className={`text-xs font-black ${cfg.text}`}>{item.title}</span>
                </div>
                <p className="text-xs text-slate-600 leading-snug">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          INFO CARD BAWAH
      ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-br from-orange-50/20 via-white to-slate-50 border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-xs space-y-4">
        <div>
          <span className="bg-orange-100/70 border border-orange-200 text-orange-600 font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-2">
            REAL-TIME NOC LOGGER
          </span>
          <div className="flex items-center gap-2.5 text-lg md:text-xl font-extrabold text-slate-900">
            <Terminal className="w-5 h-5 text-orange-500 shrink-0" />
            <h2>Syslog Aggregator &amp; Receiver Analisis</h2>
          </div>
          <p className="text-xs md:text-sm text-slate-500 leading-relaxed max-w-4xl mt-2">
            Menerima dan mencatat setiap baris log krusial yang terpancar dari{' '}
            <span className="font-semibold text-slate-700">Mikrotik RouterOS</span> dan{' '}
            <span className="font-semibold text-slate-700">OLT</span>. Menampilkan visualisasi kategori tingkat ancaman{' '}
            <span className="text-orange-500 font-semibold">severity log</span> (Info, Warning, Error) untuk gerak cepat mitigasi masalah NOC.
          </p>
        </div>

        <div>
          <span className="font-mono text-[10px] font-bold text-slate-400 tracking-wider uppercase block mt-4 mb-3">
            KELEBIHAN FITUR PADA HALAMAN INI:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              'Server penerima port UDP:514 langsung berlatar web',
              'Pencarian kata kunci regex log hardware instan',
              'Mitigasi alarm firewatch dan perubahan status rute BGP',
            ].map(feat => (
              <div key={feat} className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
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
