import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export interface Device {
  id: number;
  name: string;
  ip_address: string;
  device_type: 'Mikrotik' | 'OLT';
  username: string;
  status: 'online' | 'offline';
  last_seen?: string;
  created_at: string;
  updated_at: string;
}

export interface ODP {
  id: number;
  code: string;
  latitude: number;
  longitude: number;
  total_ports: number;
  used_ports: number;
  status: 'active' | 'full' | 'maintenance';
  created_at: string;
  updated_at: string;
}

export interface FiberCable {
  id: number;
  name: string;
  core_capacity: number;
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
  created_at: string;
  updated_at: string;
}

export interface CustomerONU {
  id: number;
  name: string;
  pppoe_username: string;
  odp_id: number;
  port_number: number;
  rx_power?: number;
  status: 'online' | 'offline' | 'los';
  created_at: string;
  updated_at: string;
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: any;
  };
  properties: Record<string, any>;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}
