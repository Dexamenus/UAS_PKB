import React, { useState } from 'react';
import type { ChangeEvent } from 'react';
import axios from 'axios';
import type { Baju } from '../types';

interface Props {
  lemari: Baju[];
  refreshData: () => void;
}

export const Dashboard: React.FC<Props> = ({ lemari, refreshData }) => {
  const [loadingAI, setLoadingAI] = useState(false);
  const [addMode, setAddMode] = useState<'ai' | 'manual'>('ai');
  const [manualData, setManualData] = useState({ nama: '', jenis: 'Atasan', kategori: 'Santai' });
  const [loadingManual, setLoadingManual] = useState(false);
  
  const bajuKotorCount = lemari.filter((b) => b.status === 'Kotor').length;

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualData.nama) return;
    setLoadingManual(true);
    try {
      await axios.post('http://localhost:5000/api/tambah-manual', manualData);
      refreshData();
      setManualData({ nama: '', jenis: 'Atasan', kategori: 'Santai' });
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingManual(false);
    }
  };

  const handleCuciBaju = async () => {
    if (!window.confirm('Proses pencucian untuk semua pakaian kotor akan dimulai. Lanjutkan?')) return;
    try {
      await axios.post('http://localhost:5000/api/cuci-baju', { id_baju_list: [] });
      refreshData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleScanBaju = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const formData = new FormData();
    const jumlahFile = e.target.files.length;
    for (let i = 0; i < jumlahFile; i++) {
      formData.append('foto', e.target.files[i]);
    }
    setLoadingAI(true);
    try {
      await axios.post('http://localhost:5000/api/scan-baju', formData);
      refreshData();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAI(false);
      e.target.value = ''; 
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
      {/* Kolom Kiri: Tambah Pakaian */}
      <div className="lg:col-span-4">
        <div className="bg-white p-5 md:p-7 rounded-3xl shadow-sm border border-slate-100 h-fit">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Tambah Pakaian Baru</h2>
          
          <div className="flex bg-slate-100 p-1.5 rounded-xl mb-6">
            <button 
              onClick={() => setAddMode('ai')} 
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${addMode === 'ai' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Scan AI
            </button>
            <button 
              onClick={() => setAddMode('manual')} 
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${addMode === 'manual' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Input Manual
            </button>
          </div>

          {addMode === 'ai' ? (
            <>
              <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-5 md:p-8 text-center hover:bg-slate-50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleScanBaju}
                  disabled={loadingAI}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="space-y-3 pointer-events-none">
                  <div className="text-indigo-600 bg-indigo-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  </div>
                  <p className="text-base font-semibold text-slate-800">Pilih berkas gambar</p>
                  <p className="text-sm text-slate-500">Proses identifikasi AI otomatis</p>
                </div>
              </div>

              {loadingAI && (
                <div className="mt-6 flex items-center justify-center gap-3 text-sm font-medium text-indigo-700 bg-indigo-50 p-4 rounded-xl animate-pulse">
                  <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Menganalisis Pakaian...
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleAddManual} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Pakaian</label>
                <input 
                  type="text" 
                  required
                  value={manualData.nama} 
                  onChange={(e) => setManualData({...manualData, nama: e.target.value})}
                  placeholder="Contoh: Kemeja Flanel Merah"
                  className="w-full p-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Jenis Pakaian</label>
                <select 
                  value={manualData.jenis} 
                  onChange={(e) => setManualData({...manualData, jenis: e.target.value})}
                  className="w-full p-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition appearance-none"
                >
                  <option value="Atasan">Atasan</option>
                  <option value="Bawahan">Bawahan</option>
                  <option value="Outer">Outer</option>
                  <option value="Sepatu">Sepatu</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kategori Style</label>
                <select 
                  value={manualData.kategori} 
                  onChange={(e) => setManualData({...manualData, kategori: e.target.value})}
                  className="w-full p-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition appearance-none"
                >
                  <option value="Santai">Santai</option>
                  <option value="Formal">Formal</option>
                  <option value="Bebas">Bebas</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={loadingManual || !manualData.nama}
                className="w-full font-bold py-3.5 mt-2 rounded-xl transition flex justify-center items-center bg-slate-900 text-white hover:bg-slate-800 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingManual ? 'Menyimpan Data...' : 'Simpan Pakaian Manual'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Kolom Kanan: Data Inventaris */}
      <div className="lg:col-span-8">
        <div className="bg-white p-5 md:p-7 rounded-3xl shadow-sm border border-slate-100 h-full flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-slate-900">Data Inventaris Pakaian</h2>
            
            {bajuKotorCount > 0 && (
              <button
                onClick={handleCuciBaju}
                className="bg-slate-900 text-white hover:bg-slate-800 px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm"
              >
                Proses Cuci ({bajuKotorCount} Item)
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto max-h-[600px] rounded-xl border border-slate-100 relative">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10 shadow-sm">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Deskripsi Item</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Kategori</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Status Terkini</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {lemari.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-400 text-sm">
                      Basis data inventaris kosong. Silakan tambah pakaian.
                    </td>
                  </tr>
                ) : (
                  lemari.map((baju) => (
                    <tr key={baju._id} className="hover:bg-slate-50 transition">
                      <td className="p-4 text-sm font-medium text-slate-900">{baju.nama}</td>
                      <td className="p-4 text-sm text-slate-500">
                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-xs font-medium">
                          {baju.jenis}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1.5 text-xs rounded-md font-semibold inline-flex items-center gap-1.5 
                            ${baju.status === "Bersih" 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                              : "bg-amber-50 text-amber-700 border border-amber-100"}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${baju.status === "Bersih" ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                          {baju.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
