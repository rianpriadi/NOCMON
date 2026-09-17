'use client';

import React, { useEffect, useState } from 'react';
import { Users, Plus, Trash2, RefreshCw, X, Radio, Filter, Wifi } from 'lucide-react';
import { api, CustomerONU, ODP } from '@/lib/api';

export default function CustomersPage() {
  const [onus, setOnus] = useState<CustomerONU[]>([]);
  const [odps, setOdps] = useState<ODP[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    pppoe_username: '',
    odp_id: 0,
    port_number: 1,
    rx_power: -19.5,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCustomersData = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/customers/onu?status=${statusFilter}` : '/customers/onu';
      const [onuRes, odpRes] = await Promise.all([
        api.get<CustomerONU[]>(url),
        api.get('/gis/odps'),
      ]);

      setOnus(Array.isArray(onuRes.data) ? onuRes.data : []);
      
      const odpFeatures = odpRes.data?.features || [];
      const odpList = odpFeatures.map((f: any) => ({
        id: f.properties.id,
        code: f.properties.code,
        total_ports: f.properties.total_ports,
        used_ports: f.properties.used_ports,
      }));
      setOdps(odpList);
      if (odpList.length > 0 && formData.odp_id === 0) {
        setFormData((prev) => ({ ...prev, odp_id: odpList[0].id }));
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomersData();
  }, [statusFilter]);

  const handleCreateOnu = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.post('/customers/onu', {
        ...formData,
        status: 'offline',
      });
      setShowModal(false);
      setFormData({
        name: '',
        pppoe_username: '',
        odp_id: odps[0]?.id || 0,
        port_number: 1,
        rx_power: -19.5,
      });
      fetchCustomersData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Gagal menambahkan pelanggan ONU baru');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOnu = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data pelanggan ini?')) return;
    try {
      await api.delete(`/customers/onu/${id}`);
      fetchCustomersData();
    } catch (err) {
      alert('Gagal menghapus pelanggan ONU');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Users className="w-5 h-5 text-violet-400" />
            <span>Manajemen Pelanggan ONU / PPPoE</span>
          </h1>
          <p className="text-xs text-slate-400">Monitoring status koneksi PPPoE real-time, port ODP, dan rx power optical signal.</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Status Filter Dropdown */}
          <div className="flex items-center space-x-2 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none"
            >
              <option value="">Semua Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="los">LOS (Loss of Signal)</option>
            </select>
          </div>

          <button
            onClick={fetchCustomersData}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-400 hover:to-cyan-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-violet-500/20 transition-all text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pelanggan</span>
          </button>
        </div>
      </div>

      {/* ONU Customers Table */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/80 uppercase text-[10px] text-slate-400 font-semibold border-b border-slate-700">
            <tr>
              <th className="p-4">Nama Pelanggan</th>
              <th className="p-4">PPPoE Username</th>
              <th className="p-4">ODP ID / Port</th>
              <th className="p-4">Rx Power (Optical)</th>
              <th className="p-4">Status Koneksi</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {onus.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  {loading ? 'Memuat data pelanggan...' : 'Belum ada pelanggan ONU terdaftar.'}
                </td>
              </tr>
            ) : (
              onus.map((onu) => (
                <tr key={onu.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-bold text-slate-100">{onu.name}</td>
                  <td className="p-4 font-mono text-cyan-400 font-semibold">{onu.pppoe_username}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      ODP #{onu.odp_id} (Port #{onu.port_number})
                    </span>
                  </td>
                  <td className="p-4 font-mono">
                    {onu.rx_power != null ? (
                      <span className={`${onu.rx_power < -27 ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                        {onu.rx_power} dBm
                      </span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center space-x-1 ${
                      onu.status === 'online'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : onu.status === 'los'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        onu.status === 'online' ? 'bg-emerald-400' : onu.status === 'los' ? 'bg-rose-400 animate-pulse' : 'bg-slate-500'
                      }`}></span>
                      <span>{onu.status}</span>
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteOnu(onu.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Hapus Pelanggan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add Customer ONU */}
      {showModal && (
        <div className="fixed inset-0 z-[2000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative text-xs">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center space-x-2">
              <Users className="w-5 h-5 text-violet-400" />
              <span>Tambah Pelanggan ONU / PPPoE</span>
            </h3>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateOnu} className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Nama Pelanggan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Username PPPoE</label>
                <input
                  type="text"
                  required
                  placeholder="budi_home_01"
                  value={formData.pppoe_username}
                  onChange={(e) => setFormData({ ...formData, pppoe_username: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Pilih ODP</label>
                  <select
                    value={formData.odp_id}
                    onChange={(e) => setFormData({ ...formData, odp_id: parseInt(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-violet-500"
                  >
                    {odps.length === 0 ? (
                      <option value={0}>Tidak ada ODP</option>
                    ) : (
                      odps.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.code} (Used: {o.used_ports}/{o.total_ports})
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Nomor Port</label>
                  <input
                    type="number"
                    min="1"
                    max="64"
                    required
                    value={formData.port_number}
                    onChange={(e) => setFormData({ ...formData, port_number: parseInt(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Rx Power (dBm)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.rx_power}
                  onChange={(e) => setFormData({ ...formData, rx_power: parseFloat(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-slate-950 font-bold shadow-lg shadow-violet-500/20"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Pelanggan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
