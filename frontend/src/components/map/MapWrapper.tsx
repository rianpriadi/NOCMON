'use client';

import dynamic from 'next/dynamic';

const NocMap = dynamic(() => import('./NocMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 rounded-xl">
      <div className="flex flex-col items-center space-y-3 text-slate-500">
        <svg
          className="w-10 h-10 animate-spin text-emerald-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <p className="text-sm font-semibold text-slate-500">Memuat Peta GIS Interaktif…</p>
        <p className="text-xs text-slate-400 font-mono">OpenStreetMap · Leaflet</p>
      </div>
    </div>
  ),
});

export default function MapWrapper() {
  return <NocMap />;
}
