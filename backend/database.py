from pymongo import MongoClient
from config import MONGO_URI

# Inisialisasi koneksi MongoDB
mongo_client = MongoClient(MONGO_URI)
db = mongo_client['smartdrobe']     
koleksi_baju = db['baju']