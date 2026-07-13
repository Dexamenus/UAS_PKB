import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = "mongodb://localhost:27017/"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "")