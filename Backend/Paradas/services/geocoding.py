import os
import urllib.request
import urllib.parse
import json

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")

def get_coordinates(address: str):
    if not GOOGLE_MAPS_API_KEY:
        print("Advertencia: No hay GOOGLE_MAPS_API_KEY configurada. Retornando None.")
        return None, None
        
    base_url = "https://maps.googleapis.com/maps/api/geocode/json"
    encoded_address = urllib.parse.quote(address)
    url = f"{base_url}?address={encoded_address}&key={GOOGLE_MAPS_API_KEY}"
    
    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            if data['status'] == 'OK':
                location = data['results'][0]['geometry']['location']
                return location['lat'], location['lng']
            else:
                print(f"Error de Geocoding API: {data['status']}")
                return None, None
    except Exception as e:
        print(f"Excepción en geocoding: {e}")
        return None, None
