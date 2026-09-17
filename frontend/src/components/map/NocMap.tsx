'use client';

import React, { useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ─── Fix Leaflet default icon path (Next.js asset issue) ──────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ─── GPON NODE DATA (Purbalingga, Jawa Tengah area) ───────────────────────
export interface GponNode {
  id: string;
  type: 'OLT' | 'ODC' | 'ODP_BUNGA' | 'ODP_INDAH' | 'ODP_WARN';
  label: string;
  sublabel: string;
  lat: number;
  lng: number;
  detail: {
    ports?: string;
    splitter?: string;
    uplink?: string;
    loss?: string;
    clients?: number;
  };
}

export const GPON_NODES: GponNode[] = [
  // ── OLT CORE ──
  {
    id: 'olt-1',
    type: 'OLT',
    label: 'OLT ZTE C300 CORE',
    sublabel: 'Terminal Pusat GPON',
    lat: -7.4073,
    lng: 109.3673,
    detail: { uplink: '10G SFP+ × 4', clients: 520 },
  },
  // ── ODC ──
  {
    id: 'odc-north',
    type: 'ODC',
    label: 'ODC Sektor Utara',
    sublabel: 'Splitter 1:8 – Ring A',
    lat: -7.3920,
    lng: 109.3560,
    detail: { splitter: '1:8', ports: '8 Core', clients: 260 },
  },
  {
    id: 'odc-south',
    type: 'ODC',
    label: 'ODC Sektor Selatan',
    sublabel: 'Splitter 1:8 – Ring B',
    lat: -7.4210,
    lng: 109.3780,
    detail: { splitter: '1:8', ports: '8 Core', clients: 260 },
  },
  // ── ODP Perum Bunga (North) ──
  {
    id: 'odp-b1',
    type: 'ODP_BUNGA',
    label: 'ODP-Perum-Bunga-01',
    sublabel: '6/8 Port Terpakai',
    lat: -7.3810,
    lng: 109.3490,
    detail: { ports: '6/8', loss: '-18.2 dBm', clients: 42 },
  },
  {
    id: 'odp-b2',
    type: 'ODP_BUNGA',
    label: 'ODP-Perum-Bunga-02',
    sublabel: '4/8 Port Terpakai',
    lat: -7.3850,
    lng: 109.3620,
    detail: { ports: '4/8', loss: '-19.1 dBm', clients: 38 },
  },
  {
    id: 'odp-b3',
    type: 'ODP_BUNGA',
    label: 'ODP-Perum-Bunga-03',
    sublabel: '8/8 Port FULL',
    lat: -7.3960,
    lng: 109.3480,
    detail: { ports: '8/8', loss: '-20.4 dBm', clients: 61 },
  },
  {
    id: 'odp-b4',
    type: 'ODP_BUNGA',
    label: 'ODP-Perum-Bunga-04',
    sublabel: '2/8 Port Terpakai',
    lat: -7.3980,
    lng: 109.3590,
    detail: { ports: '2/8', loss: '-17.8 dBm', clients: 29 },
  },
  // ── ODP Perum Indah (South) ──
  {
    id: 'odp-i1',
    type: 'ODP_INDAH',
    label: 'ODP-Perum-Indah-01',
    sublabel: '7/8 Port Terpakai',
    lat: -7.4120,
    lng: 109.3850,
    detail: { ports: '7/8', loss: '-18.9 dBm', clients: 55 },
  },
  {
    id: 'odp-i2',
    type: 'ODP_INDAH',
    label: 'ODP-Perum-Indah-02',
    sublabel: '5/8 Port Terpakai',
    lat: -7.4250,
    lng: 109.3820,
    detail: { ports: '5/8', loss: '-21.2 dBm', clients: 47 },
  },
  {
    id: 'odp-i3',
    type: 'ODP_INDAH',
    label: 'ODP-Perum-Indah-03',
    sublabel: '6/8 Port Terpakai',
    lat: -7.4180,
    lng: 109.3920,
    detail: { ports: '6/8', loss: '-19.7 dBm', clients: 63 },
  },
  {
    id: 'odp-i4',
    type: 'ODP_INDAH',
    label: 'ODP-Perum-Indah-04',
    sublabel: '3/8 Port Terpakai',
    lat: -7.4310,
    lng: 109.3860,
    detail: { ports: '3/8', loss: '-22.1 dBm', clients: 35 },
  },
  // ── ODP Warning HIGH LOSS ──
  {
    id: 'odp-warn1',
    type: 'ODP_WARN',
    label: 'ODP-RD-Warn-01',
    sublabel: '⚠ HIGH LOSS – Periksa Segera',
    lat: -7.4050,
    lng: 109.3700,
    detail: { ports: '5/8', loss: '-28.4 dBm ⚠', clients: 12 },
  },
];

// ─── POLYLINE ROUTES ───────────────────────────────────────────────────────
// Backbone (OLT → ODC): biru navy tebal
// Distribution (ODC → ODP): hijau emerald dash
export const BACKBONE_LINES: [number, number][][] = [
  // OLT → ODC North
  [[-7.4073, 109.3673], [-7.3920, 109.3560]],
  // OLT → ODC South
  [[-7.4073, 109.3673], [-7.4210, 109.3780]],
];

export const DISTRIBUTION_LINES_NORTH: [number, number][][] = [
  [[-7.3920, 109.3560], [-7.3810, 109.3490]],
  [[-7.3920, 109.3560], [-7.3850, 109.3620]],
  [[-7.3920, 109.3560], [-7.3960, 109.3480]],
  [[-7.3920, 109.3560], [-7.3980, 109.3590]],
];

export const DISTRIBUTION_LINES_SOUTH: [number, number][][] = [
  [[-7.4210, 109.3780], [-7.4120, 109.3850]],
  [[-7.4210, 109.3780], [-7.4250, 109.3820]],
  [[-7.4210, 109.3780], [-7.4180, 109.3920]],
  [[-7.4210, 109.3780], [-7.4310, 109.3860]],
];

// ─── ICON FACTORIES ────────────────────────────────────────────────────────
const makeIcon = (bg: string, border: string, emoji: string, size = 36) =>
  L.divIcon({
    className: '',
    iconSize:   [size, size + 16],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2) - 4],
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px;pointer-events:none">
        <div style="
          width:${size}px;height:${size}px;border-radius:50%;
          background:${bg};border:2.5px solid ${border};
          display:flex;align-items:center;justify-content:center;
          font-size:${size * 0.45}px;
          box-shadow:0 2px 10px ${border}66;
        ">${emoji}</div>
      </div>`,
  });

const iconMap: Record<GponNode['type'], L.DivIcon> = {
  OLT:       makeIcon('#7c1014', '#f97316', '⚡', 42),
  ODC:       makeIcon('#78350f', '#fbbf24', '◈', 34),
  ODP_BUNGA: makeIcon('#064e3b', '#34d399', '📦', 28),
  ODP_INDAH: makeIcon('#052e16', '#4ade80', '📦', 28),
  ODP_WARN:  makeIcon('#7c2d12', '#fb923c', '⚠', 30),
};

// ─── POPUP CONTENT ─────────────────────────────────────────────────────────
const typeLabels: Record<GponNode['type'], { label: string; color: string }> = {
  OLT:       { label: 'OLT CORE',  color: '#f97316' },
  ODC:       { label: 'ODC',       color: '#fbbf24' },
  ODP_BUNGA: { label: 'ODP',       color: '#34d399' },
  ODP_INDAH: { label: 'ODP',       color: '#4ade80' },
  ODP_WARN:  { label: '⚠ WARNING', color: '#fb923c' },
};

function NodePopup({ node }: { node: GponNode }) {
  const tl = typeLabels[node.type];
  return (
    <div style={{ minWidth: 210, fontFamily: 'sans-serif' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #e2e8f0', paddingBottom: 6, marginBottom: 8,
      }}>
        <span style={{ fontWeight: 800, fontSize: 13, color: '#1e293b' }}>{node.label}</span>
        <span style={{
          padding: '2px 7px', borderRadius: 6, fontSize: 10, fontWeight: 800,
          background: tl.color + '22', color: tl.color, border: `1px solid ${tl.color}55`,
          textTransform: 'uppercase',
        }}>{tl.label}</span>
      </div>
      <p style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>{node.sublabel}</p>
      <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
        <tbody>
          {node.detail.ports && (
            <tr>
              <td style={{ color: '#94a3b8', paddingBottom: 3 }}>Port</td>
              <td style={{ fontWeight: 700, color: '#1e293b' }}>{node.detail.ports}</td>
            </tr>
          )}
          {node.detail.splitter && (
            <tr>
              <td style={{ color: '#94a3b8', paddingBottom: 3 }}>Splitter</td>
              <td style={{ fontWeight: 700, color: '#1e293b' }}>{node.detail.splitter}</td>
            </tr>
          )}
          {node.detail.uplink && (
            <tr>
              <td style={{ color: '#94a3b8', paddingBottom: 3 }}>Uplink</td>
              <td style={{ fontWeight: 700, color: '#1e293b' }}>{node.detail.uplink}</td>
            </tr>
          )}
          {node.detail.loss && (
            <tr>
              <td style={{ color: '#94a3b8', paddingBottom: 3 }}>Optical Loss</td>
              <td style={{
                fontWeight: 800,
                color: node.type === 'ODP_WARN' ? '#f97316' : '#059669',
              }}>{node.detail.loss}</td>
            </tr>
          )}
          {node.detail.clients !== undefined && (
            <tr>
              <td style={{ color: '#94a3b8', paddingBottom: 3 }}>PPPoE Client</td>
              <td style={{ fontWeight: 700, color: '#0ea5e9' }}>{node.detail.clients} Aktif</td>
            </tr>
          )}
          <tr>
            <td style={{ color: '#94a3b8' }}>Koordinat</td>
            <td style={{ fontFamily: 'monospace', fontSize: 10, color: '#475569' }}>
              {node.lat.toFixed(4)}, {node.lng.toFixed(4)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─── INVALIDATE SIZE HELPER ────────────────────────────────────────────────
function MapInvalidator() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 200);
  }, [map]);
  return null;
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function NocMap() {
  const center: [number, number] = [-7.4073, 109.3673];

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom
      zoomControl
      style={{ width: '100%', height: '100%', borderRadius: '0.75rem', zIndex: 1 }}
    >
      <MapInvalidator />

      {/* OSM Tile Layer */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {/* ── Backbone FO Cables: OLT → ODC (biru, tebal, fast dash flow) ── */}
      {BACKBONE_LINES.map((positions, i) => (
        <Polyline
          key={`backbone-${i}`}
          positions={positions}
          pathOptions={{
            color: '#3b82f6',
            weight: 4,
            opacity: 0.9,
            lineCap: 'round',
            className: 'flow-cable-backbone',
          }}
        />
      ))}

      {/* ── Distribution North: ODC → ODP Bunga (hijau emerald, normal dash flow) ── */}
      {DISTRIBUTION_LINES_NORTH.map((positions, i) => (
        <Polyline
          key={`dist-north-${i}`}
          positions={positions}
          pathOptions={{
            color: '#10b981',
            weight: 2.5,
            opacity: 0.85,
            lineCap: 'round',
            className: 'flow-cable-distribution',
          }}
        />
      ))}

      {/* ── Distribution South: ODC → ODP Indah (hijau muda, normal dash flow) ── */}
      {DISTRIBUTION_LINES_SOUTH.map((positions, i) => (
        <Polyline
          key={`dist-south-${i}`}
          positions={positions}
          pathOptions={{
            color: '#22c55e',
            weight: 2.5,
            opacity: 0.85,
            lineCap: 'round',
            className: 'flow-cable-distribution',
          }}
        />
      ))}

      {/* ── GPON Node Markers ── */}
      {GPON_NODES.map((node) => (
        <Marker
          key={node.id}
          position={[node.lat, node.lng]}
          icon={iconMap[node.type]}
        >
          <Popup minWidth={220} maxWidth={280}>
            <NodePopup node={node} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
