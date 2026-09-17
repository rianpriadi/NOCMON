'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Terminal, ChevronRight, Wifi, Copy, Trash2, Menu } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';

// ── DEMO COMMAND RESPONSES ────────────────────────────────────────────────────
const CMD_RESPONSES: Record<string, string[]> = {
  'show card': [
    'OLT-A# show card',
    '-----------------------------------------------------------------------',
    ' SlotNo  CardType       Status     SoftVersion  HardVersion  RegisterTime',
    '-----------------------------------------------------------------------',
    '    1    GTGHF(GPON)    Normal     V2.3.1       V2.0         2026-01-10',
    '    2    GTGHF(GPON)    Normal     V2.3.1       V2.0         2026-01-10',
    '    3    SCXM(MAIN)     Active     V2.3.1       V1.2         2026-01-10',
    '    4    PRWG(POWER)    Normal     --           V1.0         2026-01-10',
    '    5    FAN            Normal     --           V1.0         --',
    '-----------------------------------------------------------------------',
    '[OK] 5 card(s) found.',
  ],
  'show power rx': [
    'OLT-A# show power rx',
    '-----------------------------------------------------------------------',
    ' PON        ONU-ID    SN               Rx-Power(dBm)  Status',
    '-----------------------------------------------------------------------',
    ' 1/1/1      1         ZTEG0182A90F     -18.24         OK',
    ' 1/1/1      2         ZTEG0182B102     -19.10         OK',
    ' 1/1/2      1         ZTEG0182C341     -28.40         WEAK (LOS Risk)',
    ' 1/1/3      1         ZTEG0182D990     0.00           DYING-GASP',
    ' 1/1/3      2         ZTEG0182E412     -17.50         OK',
    ' 1/1/4      1         ZTEG0182F881     --             OFFLINE',
    '-----------------------------------------------------------------------',
    '[OK] 6 ONU(s) scanned.',
  ],
  'show gpon onu unconfigured': [
    'OLT-A# show gpon onu unconfigured',
    '-----------------------------------------------------------------------',
    ' Interface    SN               Password    State',
    '-----------------------------------------------------------------------',
    ' gpon_onu-1/1/1:5   ZTEG0190A123   --    Discovered',
    ' gpon_onu-1/1/2:3   ZTEG0190B456   --    Discovered',
    '-----------------------------------------------------------------------',
    '[INFO] 2 unconfigured ONU(s) found. Use "add" to register.',
  ],
  'show version': [
    'OLT-A# show version',
    '-----------------------------------------------------------------------',
    ' System Version : ZXA10 C300 V2.3.1',
    ' Hardware Ver   : ZTE-GPON-C300-Rev.B',
    ' Uptime         : 45 days, 12:33:01',
    ' CPU Utilization: 18%',
    ' Memory Used    : 1.3 GB / 4.0 GB',
    ' Temperature    : 50°C',
    '-----------------------------------------------------------------------',
    '[OK] System info retrieved.',
  ],
  'show interface gpon-olt_1/1/1': [
    'OLT-A# show interface gpon-olt_1/1/1',
    '-----------------------------------------------------------------------',
    ' Interface   : gpon-olt_1/1/1',
    ' Description : PON-NORTH-BUNGA',
    ' Admin Status: UP',
    ' Link Status : UP',
    ' ONU Online  : 4',
    ' ONU Offline : 1',
    ' Tx Power    : 2.50 dBm',
    ' Rx Power    : -18.24 dBm (ONU avg)',
    '-----------------------------------------------------------------------',
    '[OK] Interface info retrieved.',
  ],
  'show onu state': [
    'OLT-A# show onu state',
    '-----------------------------------------------------------------------',
    ' PON       ONU-ID  SN               State         Uptime',
    '-----------------------------------------------------------------------',
    ' 1/1/1     1       ZTEG0182A90F     Operational   14d 6h',
    ' 1/1/1     2       ZTEG0182B102     Operational   9d 12h',
    ' 1/1/2     1       ZTEG0182C341     LOS           --',
    ' 1/1/3     1       ZTEG0182D990     DyingGasp     --',
    ' 1/1/3     2       ZTEG0182E412     Operational   45d 2h',
    ' 1/1/4     1       ZTEG0182F881     Offline       --',
    '-----------------------------------------------------------------------',
    '[OK] All ONU states retrieved.',
  ],
  'clear': ['[INFO] Terminal cleared.'],
  'help': [
    'OLT-A# help',
    '-----------------------------------------------------------------------',
    ' PERINTAH YANG TERSEDIA (ZTE C300/C600 Series):',
    '-----------------------------------------------------------------------',
    '  show card                         - Status slot kartu sasis',
    '  show power rx                     - Daya optik Rx semua ONU',
    '  show gpon onu unconfigured        - ONU belum terdaftar',
    '  show version                      - Versi sistem & uptime',
    '  show interface gpon-olt_1/1/1     - Detail port PON',
    '  show onu state                    - Status semua ONU',
    '  clear                             - Bersihkan layar terminal',
    '  help                              - Tampilkan daftar perintah ini',
    '-----------------------------------------------------------------------',
    '[INFO] Ketik perintah dan tekan Enter untuk eksekusi.',
  ],
};

interface TermLine {
  id: number;
  type: 'info' | 'ok' | 'error' | 'system' | 'input' | 'output' | 'separator';
  text: string;
}

const BOOT_LINES: TermLine[] = [
  { id: 1,  type: 'system',    text: 'REMOTE CLI OLT TERMINAL' },
  { id: 2,  type: 'output',    text: 'Target: OLT-DEMO-A (ZTE C300)' },
  { id: 3,  type: 'output',    text: 'IP: 10.255.0.10' },
  { id: 4,  type: 'separator', text: '─'.repeat(48) },
  { id: 5,  type: 'info',      text: '[INFO] Initializing Telnet session...' },
  { id: 6,  type: 'info',      text: '[INFO] Connecting to OLT DEMO-A...' },
  { id: 7,  type: 'ok',        text: '[OK]   Connected to OLT DEMO-A (10.255.0.10)' },
  { id: 8,  type: 'output',    text: "OLT-A#_  (Ketik 'help' untuk daftar perintah)" },
];

const INSTANT_CMDS = [
  { label: 'show card',                    desc: 'Status kartu sasis' },
  { label: 'show power rx',                desc: 'Daya optik RX semua ONU' },
  { label: 'show gpon onu unconfigured',   desc: 'ONU belum terdaftar' },
  { label: 'show version',                 desc: 'Versi & uptime sistem' },
  { label: 'show onu state',               desc: 'Status semua ONU' },
  { label: 'help',                         desc: 'Daftar perintah tersedia' },
];

function lineColor(type: TermLine['type']): string {
  switch (type) {
    case 'system':    return 'text-teal-400 font-extrabold tracking-wide';
    case 'ok':        return 'text-emerald-400 font-bold';
    case 'error':     return 'text-rose-400 font-bold';
    case 'info':      return 'text-amber-400';
    case 'input':     return 'text-orange-400 font-bold';
    case 'separator': return 'text-slate-600';
    default:          return 'text-slate-300';
  }
}

export default function CliOltPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lines, setLines] = useState<TermLine[]>(BOOT_LINES);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  let nextId = useRef(100);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const appendLines = (newLines: TermLine[]) => {
    setLines(prev => [...prev, ...newLines]);
  };

  const execCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;

    const newLines: TermLine[] = [
      { id: nextId.current++, type: 'input', text: `OLT-A# ${cmd}` },
    ];

    if (trimmed === 'clear') {
      setLines([
        { id: nextId.current++, type: 'ok', text: '[OK] Terminal cleared.' },
      ]);
      setHistory(prev => [cmd, ...prev]);
      setHistIdx(-1);
      setInput('');
      return;
    }

    const response = CMD_RESPONSES[trimmed];
    if (response) {
      response.forEach(line => {
        let type: TermLine['type'] = 'output';
        if (line.startsWith('[OK]'))    type = 'ok';
        else if (line.startsWith('[INFO]'))  type = 'info';
        else if (line.startsWith('[ERROR]')) type = 'error';
        else if (line.startsWith('---'))     type = 'separator';
        newLines.push({ id: nextId.current++, type, text: line });
      });
    } else {
      newLines.push({ id: nextId.current++, type: 'error', text: `[ERROR] Command not found: '${cmd}'. Ketik 'help' untuk daftar perintah.` });
    }

    appendLines(newLines);
    setHistory(prev => [cmd, ...prev]);
    setHistIdx(-1);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      execCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(idx);
      setInput(history[idx] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(idx === -1 ? '' : (history[idx] ?? ''));
    }
  };

  const handleCopy = () => {
    const text = lines.map(l => l.text).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 p-4 sm:p-6 md:p-8 space-y-6" style={{ fontFamily: 'var(--font-outfit, sans-serif)' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── TOP NAV ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-white text-orange-500 border border-slate-200 hover:bg-slate-50 transition-colors lg:hidden shadow-2xs"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl shadow-2xs transition-all">
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Kembali ke Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </Link>
        </div>

        <span className="inline-flex items-center justify-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-full font-mono shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Connected (ZTE C300 · 10.255.0.10)
        </span>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MAIN TERMINAL CARD
      ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white border border-slate-200/90 rounded-3xl border-t-[4px] border-t-orange-500 overflow-hidden shadow-xs">

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="text-orange-500 font-black text-lg leading-none">{'>'}_</span>
            <div>
              <h1 className="text-xs sm:text-sm font-black text-slate-900">Remote CLI OLT Terminal – Super-fast Connection</h1>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono">Telnet Session · ZTE C300 · OLT-DEMO-A · 10.255.0.10</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-xl transition-all">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Tersalin!' : 'Copy Log'}
            </button>
            <button onClick={() => { setLines(BOOT_LINES); setHistory([]); }} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 px-3 py-1.5 rounded-xl transition-all">
              <Trash2 className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* ── DARK TERMINAL ── */}
        <div
          className="bg-[#0d1117] font-mono text-[12px] overflow-y-auto overflow-x-auto cursor-text"
          style={{ height: 320 }}
          onClick={() => inputRef.current?.focus()}
        >
          {/* macOS-style title bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#161b22] border-b border-slate-700/50 sticky top-0 z-10 select-none">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <span className="text-slate-500 text-[10px] ml-2 flex items-center gap-1.5">
              <Terminal className="w-3 h-3" />
              nocmon — cli@OLT-DEMO-A (ZTE C300)
              <span className="ml-2 text-emerald-400 font-bold hidden sm:inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />CONNECTED
              </span>
            </span>
          </div>

          {/* Log Lines */}
          <div className="p-4 space-y-0.5 leading-5 min-w-[500px]">
            {lines.map(line => (
              <div key={line.id} className={`whitespace-pre ${lineColor(line.type)}`}>
                {line.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* ── INSTANT COMMAND BUTTONS ── */}
        <div className="px-4 sm:px-5 py-3 bg-[#161b22] border-t border-slate-700/50 flex items-center gap-2 overflow-x-auto max-w-full scrollbar-none">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider shrink-0">
            INSTANT:
          </span>
          {INSTANT_CMDS.map(cmd => (
            <button
              key={cmd.label}
              onClick={() => { setInput(cmd.label); execCommand(cmd.label); }}
              title={cmd.desc}
              className="text-[11px] font-mono font-bold text-teal-300 bg-teal-900/30 hover:bg-teal-800/40 border border-teal-700/40 px-3 py-1 rounded-lg transition-all shrink-0 whitespace-nowrap"
            >
              {cmd.label}
            </button>
          ))}
        </div>

        {/* ── COMMAND INPUT BAR ── */}
        <div className="flex items-center gap-0 bg-[#0d1117] border-t border-slate-700/50 px-4 py-3">
          <span className="font-mono font-black text-orange-400 text-sm shrink-0 pr-2">OLT-A#</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik command di sini lalu Enter (contoh: show card)..."
            autoComplete="off"
            spellCheck={false}
            className="flex-1 bg-transparent font-mono text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none caret-orange-400"
          />
          <button
            onClick={() => execCommand(input)}
            className="ml-3 shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 px-3 py-1.5 rounded-lg transition-all font-mono"
          >
            Enter <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── QUICK REFERENCE CARD ── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-orange-500" />
            Panduan Perintah Cepat OLT (Awam Friendly)
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Tekan tombol atau ketik manual</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { cmd: 'show card',                    icon: '🖥️', title: 'Status Kartu Sasis',       desc: 'Melihat kondisi semua kartu hardware di dalam sasis OLT (GPON, POWER, FAN).' },
            { cmd: 'show power rx',                icon: '📡', title: 'Daya Optik Pelanggan',     desc: 'Melihat kekuatan sinyal optik (dBm) masing-masing ONT/modem pelanggan.' },
            { cmd: 'show gpon onu unconfigured',   icon: '🔍', title: 'ONU Belum Terdaftar',      desc: 'Menampilkan modem baru yang terdeteksi tapi belum diregistrasi.' },
            { cmd: 'show version',                 icon: '⚙️', title: 'Info Sistem OLT',          desc: 'Versi firmware, uptime, penggunaan CPU, memori, dan suhu sasis.' },
            { cmd: 'show onu state',               icon: '📊', title: 'Status Semua ONU',         desc: 'Status operasional setiap ONU: Online, LOS, DyingGasp, atau Offline.' },
            { cmd: 'help',                         icon: '❓', title: 'Daftar Semua Perintah',    desc: 'Menampilkan semua perintah yang bisa dieksekusi di terminal ini.' },
          ].map(item => (
            <button
              key={item.cmd}
              onClick={() => execCommand(item.cmd)}
              className="flex items-start gap-3 p-3.5 text-left rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-orange-50/50 hover:border-orange-200 transition-all group shadow-2xs"
            >
              <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
              <div>
                <p className="text-xs font-black text-slate-800 group-hover:text-orange-600 transition-colors">{item.title}</p>
                <p className="text-[10px] font-mono text-orange-500 mb-1">{item.cmd}</p>
                <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* History Bar */}
        {history.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">RIWAYAT PERINTAH:</p>
            <div className="flex flex-wrap gap-2">
              {history.slice(0, 8).map((h, i) => (
                <button
                  key={i}
                  onClick={() => execCommand(h)}
                  className="text-[11px] font-mono text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-all"
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          INFO CARD BAWAH
      ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-br from-orange-50/20 via-white to-slate-50 border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-xs space-y-4">
        <div>
          <span className="bg-orange-100/70 border border-orange-200 text-orange-600 font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-2">
            TELNET AUTOMATION
          </span>
          <div className="flex items-center gap-2.5 text-lg md:text-xl font-extrabold text-slate-900">
            <span className="text-orange-500 font-black text-xl">&gt;_</span>
            <h2>Remote CLI OLT – Otomasi Terminal Telnet</h2>
          </div>
          <p className="text-xs md:text-sm text-slate-500 leading-relaxed max-w-4xl mt-2">
            Terminal aman tanpa VPN yang menghubungkan browser Anda langsung ke command board ZTE OLT. Mendukung{' '}
            <span className="text-orange-500 font-semibold">eksekusi</span> perintah diagnostik mandiri (show card, show gpon onu unconfigured, show power rx) secara seketika.
          </p>
        </div>

        <div>
          <span className="font-mono text-[10px] font-bold text-slate-400 tracking-wider uppercase block mt-4 mb-3">
            KELEBIHAN FITUR PADA HALAMAN INI:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              'Akses shell hardware aman tanpa konfigurasi rumit',
              'Respon responsif terminal dengan auto-logging riwayat',
              'Tombol pintasan cepat instruksi shell sasis utama',
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
