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
      console.error(error);
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