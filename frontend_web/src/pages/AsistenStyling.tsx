import React, { useState, useEffect } from 'react';
import axios from 'axios';
import type { Baju } from '../types';

interface Props {
  lemari: Baju[];
  refreshData: () => void;
}

export const AsistenStyling: React.FC<Props> = ({ lemari, refreshData }) => {
  const [jadwal, setJadwal] = useState('');
  const [lokasi, setLokasi] = useState('Semarang');
  const [rekomendasi, setRekomendasi] = useState<Baju[]>([]);
  
  const [suhuInfo, setSuhuInfo] = useState<number | null>(null);
  const [cuacaInfo, setCuacaInfo] = useState<string>('');
  const [loadingCuaca, setLoadingCuaca] = useState(false);
  const [loadingOOTD, setLoadingOOTD] = useState(false);


  const isWardrobeReady = lemari.filter(b => b.status === 'Bersih').length >= 2;

  const getCuacaRealtime = async (namaKota: string) => {
    setLoadingCuaca(true);
    try {
      const res = await axios.post('http://localhost:5000/api/cuaca', { kota: namaKota });
      setSuhuInfo(res.data.suhu);
      setCuacaInfo(res.data.cuaca);
    } catch (error) {
      setSuhuInfo(null);
      setCuacaInfo('');
    }
    setLoadingCuaca(false);
  };

  const detectLocation = () => {
    setLokasi('Mendeteksi lokasi...');
    setSuhuInfo(null);
    setCuacaInfo('');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await axios.get(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=id`
            );
            const namaKota = res.data.city || res.data.locality || 'Tegal';
            setLokasi(namaKota);
            getCuacaRealtime(namaKota);
          } catch (error) {
            setLokasi('Tegal'); 
            getCuacaRealtime('Tegal');
          }
        },
        () => {
          setLokasi('Tegal'); 
          getCuacaRealtime('Tegal');
        }
      );
    }
  };

  useEffect(() => {
    detectLocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerateOOTD = async () => {
    setLoadingOOTD(true);
    setRekomendasi([]); 
    try {
      const res = await axios.post('http://localhost:5000/api/generate-ootd', {
        kota: lokasi,
        jadwal,
      });
      setRekomendasi(res.data.ootd);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingOOTD(false);
    }
  };

  const handlePakaiOOTD = async () => {
    const ids = rekomendasi.map((b) => b._id);
    try {
      await axios.post('http://localhost:5000/api/pakai-baju', { id_baju_list: ids });
      setRekomendasi([]); 
      refreshData();
    } catch (error) {
      console.error(error);
    }
  };



  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 w-full">
      {/* Kiri: Asisten Styling Form */}
      <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100 h-fit">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Asisten Styling</h2>
        
        <div className="space-y-6">
          <div>
            <label className="flex justify-between items-center text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <span>Lokasi & Cuaca</span>
              {loadingCuaca && <span className="text-indigo-500 animate-pulse normal-case text-[10px]">Memuat data cuaca...</span>}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  onBlur={() => getCuacaRealtime(lokasi)} 
                  className="w-full p-4 text-base border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  style={{ paddingRight: suhuInfo !== null ? '120px' : '16px' }}
                  placeholder="Masukkan kota..."
                />
                {suhuInfo !== null && !loadingCuaca && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none text-xs font-bold text-slate-600 bg-slate-200/60 px-3 py-1.5 rounded-md border border-slate-200">
                    <span>{Math.round(suhuInfo)}°C</span>
                    <div className="w-px h-3 bg-slate-400"></div>
                    <span>{cuacaInfo}</span>
                  </div>
                )}
              </div>
              <button
                onClick={detectLocation}
                className="px-4 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition flex-shrink-0 flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Konteks Acara</label>
            <input
              type="text"
              value={jadwal}
              onChange={(e) => setJadwal(e.target.value)}
              placeholder="Contoh: Kuliah Biasa, Pesta, Hangout santai..."
              className="w-full p-4 text-base border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>


          <button
            onClick={handleGenerateOOTD}
            disabled={loadingOOTD || !isWardrobeReady || !jadwal}
            className={`w-full font-bold py-4 text-base rounded-xl transition flex justify-center items-center gap-2 shadow-sm
              ${loadingOOTD ? "bg-slate-200 text-slate-500 cursor-wait" 
              : !isWardrobeReady ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow"}`}
          >
            {loadingOOTD ? 'Menganalisis Kombinasi...' : 'Kalkulasi Rekomendasi'}
          </button>
        </div>
      </div>

      {/* Kanan: Hasil Rekomendasi AI */}
      <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100 h-fit">
        <h3 className="font-bold text-slate-900 text-2xl mb-8">Hasil Rekomendasi AI</h3>
        
        {rekomendasi.length > 0 ? (
          <>
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Rekomendasi Pakaian</h4>
            <div className="space-y-3 mb-6">
              {rekomendasi.map((b) => (
                <div key={b._id} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="font-medium text-slate-800 text-sm">{b.nama}</span>
                  <span className="text-xs font-medium text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-md">{b.jenis}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handlePakaiOOTD}
              className="w-full bg-slate-900 text-white font-semibold text-sm py-3 rounded-lg hover:bg-slate-800 transition shadow-sm"
            >
              Konfirmasi Penggunaan Set
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 h-64">
            <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <p className="text-slate-500 font-medium text-sm">Belum ada aktivitas.<br/>Silakan isi form dan kalkulasi rekomendasi.</p>
          </div>
        )}
      </div>
    </div>
  );
};
