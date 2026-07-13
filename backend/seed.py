import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pymongo import MongoClient
import datetime
from config import MONGO_URI

client = MongoClient(MONGO_URI)
db = client['smartdrobe']
koleksi_baju = db['baju']

koleksi_baju.delete_many({}) # Hapus data lama agar bersih

dummy_data = [
    {
        "nama": "Kaos Hitam Polos",
        "jenis": "Atasan",
        "kategori": "Santai",
        "status": "Bersih",
        "terakhir_dipakai": datetime.datetime.now(),
        "created_at": datetime.datetime.now()
    },
    {
        "nama": "Kemeja Flanel Kotak",
        "jenis": "Atasan",
        "kategori": "Santai",
        "status": "Bersih",
        "terakhir_dipakai": datetime.datetime.now(),
        "created_at": datetime.datetime.now()
    },
    {
        "nama": "Kemeja Putih",
        "jenis": "Atasan",
        "kategori": "Formal",
        "status": "Bersih",
        "terakhir_dipakai": datetime.datetime.now(),
        "created_at": datetime.datetime.now()
    },
    {
        "nama": "Celana Jeans Slim",
        "jenis": "Bawahan",
        "kategori": "Santai",
        "status": "Bersih",
        "terakhir_dipakai": datetime.datetime.now(),
        "created_at": datetime.datetime.now()
    },
    {
        "nama": "Celana Chino Cream",
        "jenis": "Bawahan",
        "kategori": "Formal",
        "status": "Bersih",
        "terakhir_dipakai": datetime.datetime.now(),
        "created_at": datetime.datetime.now()
    },
    {
        "nama": "Sneakers Putih",
        "jenis": "Sepatu",
        "kategori": "Bebas",
        "status": "Bersih",
        "terakhir_dipakai": datetime.datetime.now(),
        "created_at": datetime.datetime.now()
    },
    {
        "nama": "Jaket Bomber Hitam",
        "jenis": "Outer",
        "kategori": "Santai",
        "status": "Bersih",
        "terakhir_dipakai": datetime.datetime.now(),
        "created_at": datetime.datetime.now()
    },
    {
        "nama": "Hoodie Abu-abu",
        "jenis": "Atasan",
        "kategori": "Santai",
        "status": "Kotor",
        "terakhir_dipakai": datetime.datetime.now(),
        "created_at": datetime.datetime.now()
    }
]

result = koleksi_baju.insert_many(dummy_data)
print(f"Berhasil menambahkan {len(result.inserted_ids)} data dummy pakaian.")
