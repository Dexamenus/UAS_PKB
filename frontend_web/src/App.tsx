import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";
import type { Baju } from "./types";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { AsistenStyling } from "./pages/AsistenStyling";

function App() {
  const [lemari, setLemari] = useState<Baju[]>([]);

  const fetchLemari = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/lemari");
      setLemari(res.data);
    } catch (error) {
      console.error("Gagal terhubung ke server/database. Memuat data dummy...", error);
      setLemari([
        {
          _id: "dummy1",
          nama: "Kaos Hitam Polos",
          jenis: "Atasan",
          kategori: "Santai",
          status: "Bersih",
          terakhir_dipakai: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
        {
          _id: "dummy2",
          nama: "Celana Jeans Biru",
          jenis: "Bawahan",
          kategori: "Santai",
          status: "Bersih",
          terakhir_dipakai: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
        {
          _id: "dummy3",
          nama: "Kemeja Putih",
          jenis: "Atasan",
          kategori: "Formal",
          status: "Bersih",
          terakhir_dipakai: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
        {
          _id: "dummy4",
          nama: "Sepatu Sneakers",
          jenis: "Sepatu",
          kategori: "Bebas",
          status: "Bersih",
          terakhir_dipakai: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
        {
          _id: "dummy5",
          nama: "Jaket Denim",
          jenis: "Outer",
          kategori: "Santai",
          status: "Kotor",
          terakhir_dipakai: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ]);
    }
  };

  useEffect(() => {
    fetchLemari();
  }, []);

  return (
    <Router>
      <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans text-slate-800">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard lemari={lemari} refreshData={fetchLemari} />} />
            <Route path="/styling" element={<AsistenStyling lemari={lemari} refreshData={fetchLemari} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;