import os
import urllib.request
import urllib.parse
import json

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")

def get_directions(origen_lat, origen_lng, dest_lat, dest_lng, waypoints=None):
    if not GOOGLE_MAPS_API_KEY:
        print("Advertencia: No hay GOOGLE_MAPS_API_KEY configurada. Direcciones vacías.")
        return None
        
    base_url = "https://maps.googleapis.com/maps/api/directions/json"
    origin = f"{origen_lat},{origen_lng}"
    destination = f"{dest_lat},{dest_lng}"
    
    url = f"{base_url}?origin={origin}&destination={destination}"
    
    if waypoints and len(waypoints) > 0:
        # Formato optimizado: waypoints=optimize:true|lat,lng|lat,lng
        wp_str = "|".join([f"{lat},{lng}" for lat, lng in waypoints if lat and lng])
        if wp_str:
            url += f"&waypoints=optimize:true|{wp_str}"
            
    url += f"&key={GOOGLE_MAPS_API_KEY}"
    
    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            if data['status'] == 'OK':
                route = data['routes'][0]
                
                # Calcular distancia total en km
                total_distance_meters = sum([leg['distance']['value'] for leg in route['legs']])
                distancia_km = total_distance_meters / 1000.0
                
                # Obtener la polyline encriptada para dibujar en el frontend
                polyline = route['overview_polyline']['points']
                
                return {
                    "distancia_km": round(distancia_km, 2),
                    "polyline": polyline
                }
            else:
                print(f"Error de Directions API: {data['status']}")
                return None
    except Exception as e:
        print(f"Excepción en directions: {e}")
        return None
