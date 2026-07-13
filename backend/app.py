from flask import Flask
from flask_cors import CORS
from routes import api

# Inisialisasi Aplikasi Flask
app = Flask(__name__)

# Izinkan React (Frontend) untuk mengambil data
CORS(app) 

# Daftarkan semua rute API yang ada di file routes.py
app.register_blueprint(api, url_prefix='/api')

if __name__ == '__main__':
    # Jalankan server di http://127.0.0.1:5000
    app.run(port=5000, debug=True)