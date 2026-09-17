'use client';

import React, { useEffect, useState } from 'react';
import { Server, MapPin, Users, Activity, RefreshCw, Menu } from 'lucide-react';
import { api } from '@/lib/api';

interface TopbarProps {
  onMenuToggle?: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const [stats, setStats] = useState({
    totalRouters: 0,
    onlineRouters: 0,
    totalOdps: 0,
    onlineCustomers: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchQuickStats = async () => {
    setLoading(true);
    try {
      const [devRes, odpRes, onuRes] = await Promise.all([
        api.get('/devices/stats').catch(() => ({ data: { total: 0, online: 0 } })),
        api.get('/gis/odps').catch(() => ({ data: { features: [] } })),
        api.get('/customers/onu').catch(() => ({ data: [] })),
      ]);

      const onlineOnus = Array.isArray(onuRes.data)
        ? onuRes.data.filter((c: any) => c.status === 'online').length
        : 0;

      setStats({
        totalRouters: devRes.data.total || 0,
        onlineRouters: devRes.data.online || 0,
        totalOdps: odpRes.data.features?.length || 0,
        onlineCustomers: onlineOnus,
      });
    } catch (err) {
      console.error('Failed to fetch topbar stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuickStats();
    const interval = setInterval(fetchQuickStats, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 text-slate-100 shadow-lg">
      {/* Title / Status */}
      <div className="flex items-center justify-between w-full lg:w-auto">
        <div className="flex items-center space-x-3">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5 text-cyan-400" />
            </button>
          )}
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-emerald-400">NOC SYSTEM LIVE</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span className="text-[11px] sm:text-xs text-slate-400 font-mono hidden sm:inline">PostGIS Network Monitor v1.1</span>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
        {/* Metric 1: Routers */}
        <div className="flex items-center space-x-2 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50 shrink-0">
          <Server className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
          <div className="text-[11px] sm:text-xs">
            <span className="text-slate-400 hidden sm:inline">Router: </span>
            <span className="font-bold text-slate-200">
              <span className="text-emerald-400">{stats.onlineRouters}</span>/{stats.totalRouters}
            </span>
          </div>
        </div>

        {/* Metric 2: ODP */}
        <div className="flex items-center space-x-2 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50 shrink-0">
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          <div className="text-[11px] sm:text-xs">
            <span className="text-slate-400 hidden sm:inline">ODP: </span>
            <span className="font-bold text-amber-400">{stats.totalOdps}</span>
          </div>
        </div>

        {/* Metric 3: Online Customers */}
        <div className="flex items-center space-x-2 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50 shrink-0">
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400" />
          <div className="text-[11px] sm:text-xs">
            <span className="text-slate-400 hidden sm:inline">Online: </span>
            <span className="font-bold text-violet-400">{stats.onlineCustomers}</span>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={fetchQuickStats}
          disabled={loading}
          className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors shrink-0"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>
    </header>
  );
}
