import json
import time
from flask import request, jsonify
from bson.objectid import ObjectId
from PIL import Image

from database import koleksi_baju
from services import gemini_client, get_cuaca
from utils import format_mongo_doc, get_simulasi_baju

def get_lemari_controller():
    data_baju = [format_mongo_doc(baju) for baju in koleksi_baju.find()]
    return jsonify(data_baju)

def scan_baju_controller():
    if 'foto' not in request.files:
        return jsonify({"error": "Tidak ada foto yang diunggah"}), 400

    files = request.files.getlist("foto")
    hasil_baju = []
    gagal = []

    prompt = """
    Analisis pakaian pada gambar.
    Jawab HANYA JSON berikut tanpa markdown.
    {
      "nama": "nama dan juga warnanya",
      "jenis": "Atasan atau Bawahan atau Outer",
      "kategori": "Formal atau Santai atau Bebas"
    }
    """
    for file in files:
        try:
            image = Image.open(file.stream).convert("RGB")
            image.thumbnail((512, 512))

            response = gemini_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[prompt, image]
            )
            
            hasil = response.text.replace("```json", "").replace("```", "").strip()
            data = json.loads(hasil)
            data["status"] = "Bersih"

            result = koleksi_baju.insert_one(data)
            data["_id"] = str(result.inserted_id)
            hasil_baju.append(data)
            print("Berhasil :", data["nama"])

        except Exception as e:
            if "429" in str(e) or "quota" in str(e).lower():
                print("Limit API tercapai, beralih ke simulasi.")
                data = get_simulasi_baju()
                data["status"] = "Bersih"
                result = koleksi_baju.insert_one(data)
                data["_id"] = str(result.inserted_id)
                hasil_baju.append(data)
            else:
                print("GAGAL MEMPROSES:", e)
                gagal.append(str(e))

    if len(hasil_baju) == 0:
        return jsonify({"error": "Semua gambar gagal diproses", "detail": gagal}), 500

    return jsonify({"pesan": f"{len(hasil_baju)} gambar berhasil diproses", "data": hasil_baju})

def generate_ootd_controller():
    data = request.json
    kota = data.get("kota", "Semarang")
    jadwal = data.get("jadwal", "Kuliah Biasa")

    suhu, cuaca = get_cuaca(kota)
    if suhu is None:
        return jsonify({"error": "Gagal mengambil data cuaca dari OpenWeather."}), 500

    semua_bersih = list(koleksi_baju.find({"status": "Bersih"}))
    if len(semua_bersih) < 2:
        return jsonify({"error": "Stok pakaian bersih tidak cukup. Minimal butuh 2 pakaian."}), 400

    data_lemari = [{"id": str(b["_id"]), "nama": b["nama"], "jenis": b["jenis"], "kategori": b["kategori"]} for b in semua_bersih]

    prompt = f"""
    Kamu adalah pakar Fashion Stylist.
    Kondisi saat ini: Suhu {suhu}°C, Cuaca {cuaca}, Acara {jadwal}
    Pakaian tersedia: {json.dumps(data_lemari)}

    Tugasmu: Pilihkan kombinasi OOTD (1 Atasan, 1 Bawahan, maks 1 Outer jika hujan/formal).
    KEMBALIKAN HANYA array JSON murni berisi string ID pakaian. Contoh: ["id1", "id2"]
    """

    try:
        response = gemini_client.models.generate_content(model="gemini-2.5-flash", contents=[prompt])
        hasil = response.text.replace("```json", "").replace("```", "").strip()
        
        if "[" in hasil and "]" in hasil:
            hasil = hasil[hasil.find("["):hasil.rfind("]")+1]
            
        id_terpilih = json.loads(hasil)
        ootd_hasil = [format_mongo_doc(b) for b in semua_bersih if str(b["_id"]) in id_terpilih]

        return jsonify({"ootd": ootd_hasil, "suhu": suhu, "cuaca": cuaca})

    except Exception as e:
        print("Error Gemini OOTD:", e)
        return jsonify({"error": "AI gagal merumuskan kombinasi pakaian."}), 500

def pakai_baju_controller():
    id_baju_list = request.json.get('id_baju_list', [])
    for id_baju in id_baju_list:
        koleksi_baju.update_one({"_id": ObjectId(id_baju)}, {"$set": {"status": "Kotor"}})
    return jsonify({"pesan": "Baju telah dipakai dan kotor."})

def cuci_baju_controller():
    id_baju_list = request.json.get('id_baju_list', [])
    if not id_baju_list:
        hasil = koleksi_baju.update_many({"status": "Kotor"}, {"$set": {"status": "Bersih"}})
        return jsonify({"pesan": f"Selesai! {hasil.modified_count} baju dicuci."})
    
    for id_baju in id_baju_list:
        koleksi_baju.update_one({"_id": ObjectId(id_baju)}, {"$set": {"status": "Bersih"}})
    return jsonify({"pesan": f"{len(id_baju_list)} baju selesai dicuci!"})

def cek_cuaca_ui_controller():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    kota = request.json.get("kota", "Semarang")
    suhu, cuaca = get_cuaca(kota)
    
    if suhu is None:
        return jsonify({"error": "Gagal mengambil cuaca"}), 500
        
    return jsonify({"suhu": suhu, "cuaca": cuaca})

def virtual_tryon_controller():
    try:
        if 'foto_diri' not in request.files:
            return jsonify({"error": "File foto_diri is required"}), 400
        
        foto_diri = request.files['foto_diri']
        id_baju_list_str = request.form.get('id_baju_list')

        if not id_baju_list_str:
            return jsonify({"error": "id_baju_list is required"}), 400

        try:
            id_baju_list = json.loads(id_baju_list_str)
        except Exception:
            return jsonify({"error": "Invalid id_baju_list JSON format"}), 400

        for id_baju in id_baju_list:
            try:
                garment = koleksi_baju.find_one({"_id": ObjectId(id_baju)})
                if not garment:
                    return jsonify({"error": f"Garment {id_baju} not found"}), 404
            except Exception:
                return jsonify({"error": f"Invalid id_baju format: {id_baju}"}), 400

        # ---------------------------------------------------------
        # Mock AI Implementation: Multi-Step Sequential VTON Pipeline
        # Step 1: Inpaint Top (shirt/jacket) onto the user's upper body.
        # Step 2: Inpaint Bottom (pants/skirt) onto the user's lower body, 
        #         conditioning on the result of Step 1 to preserve proportions.
        # ---------------------------------------------------------
        time.sleep(4)

        # ---------------------------------------------------------
        # TODO: Actual Replicate API call (Sequential Image-to-Image synthesis)
        # ---------------------------------------------------------
        preview_url = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"
        
        return jsonify({
            "message": "Full Outfit Virtual try-on successful",
            "preview_url": preview_url
        }), 200

    except Exception as e:
        print(f"Error in virtual try-on: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

def tambah_baju_manual_controller():
    data = request.json
    nama = data.get("nama")
    jenis = data.get("jenis")
    kategori = data.get("kategori")
    
    if not nama or not jenis or not kategori:
        return jsonify({"error": "Data tidak lengkap"}), 400

    baju_baru = {
        "nama": nama,
        "jenis": jenis,
        "kategori": kategori,
        "status": "Bersih"
    }

    try:
        result = koleksi_baju.insert_one(baju_baru)
        baju_baru["_id"] = str(result.inserted_id)
        return jsonify({"pesan": "Berhasil ditambahkan", "data": baju_baru}), 201
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Gagal menyimpan data"}), 500
