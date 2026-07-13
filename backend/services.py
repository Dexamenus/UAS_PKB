# ==========================================
# services.py
# ==========================================
import requests
from google import genai
from config import GEMINI_API_KEY, WEATHER_API_KEY

# 1. Konfigurasi Gemini AI
gemini_client = genai.Client(api_key=GEMINI_API_KEY)

# 2. Fungsi Ambil Cuaca OpenWeather
def get_cuaca(kota):
    try:
        url = (
            f"https://api.openweathermap.org/data/2.5/weather"
            f"?q={kota}&appid={WEATHER_API_KEY}&units=metric"
        )
        response = requests.get(url, timeout=10)

        if response.status_code != 200:
            return None, None

        data = response.json()
        suhu = data["main"]["temp"]
        cuaca = data["weather"][0]["main"]

        return suhu, cuaca

    except Exception as e:
        print("Error Cuaca:", e)
        return None, None