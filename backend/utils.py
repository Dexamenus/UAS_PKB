import random

def format_mongo_doc(doc):
    """Mengubah ObjectId MongoDB menjadi string agar bisa dibaca React (JSON)"""
    doc['_id'] = str(doc['_id'])
    return doc

def get_simulasi_baju(file_name=None):
    """Fungsi fallback untuk menghasilkan data simulasi jika API Limit tercapai"""
    katalog = [
        {"nama": "Kemeja Flanel", "jenis": "Atasan", "kategori": "Santai"},
        {"nama": "Celana Chino", "jenis": "Bawahan", "kategori": "Formal"},
        {"nama": "Jaket Bomber", "jenis": "Outer", "kategori": "Bebas"},
        {"nama": "Kaos Polos", "jenis": "Atasan", "kategori": "Santai"}
    ]
    data = random.choice(katalog)
    data["nama"] = f"{data['nama']} (Simulasi)"
    return data