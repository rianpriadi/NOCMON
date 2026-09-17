'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Map, Server, Users, Cpu, Radio, Activity, FileText, Terminal } from 'lucide-react';

const menuItems = [
  {
    label: 'Dashboard Overview',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'GIS Map',
    href: '/map',
    icon: Map,
  },
  {
    label: 'Manajemen ZTE OLT',
    href: '/devices/olt',
    icon: Server,
  },
  {
    label: 'Telemetri SFP POP',
    href: '/telemetri',
    icon: Activity,
  },
  {
    label: 'Syslog Real-Time',
    href: '/syslog',
    icon: FileText,
  },
  {
    label: 'Remote CLI OLT',
    href: '/cli',
    icon: Terminal,
  },
  {
    label: 'Customer ONU',
    href: '/customers',
    icon: Users,
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between select-none transform lg:transform-none transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 flex items-center space-x-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Radio className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100 tracking-wider">NOCMON V1.1</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">PostGIS Monitor</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/5'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center space-x-2 text-xs text-slate-300 font-semibold mb-1">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>NOC Infrastructure</span>
            </div>
            <p className="text-[11px] text-slate-400">
              FastAPI + PostGIS Backend
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
