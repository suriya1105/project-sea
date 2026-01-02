
import json
import random
import os
from pathlib import Path
from datetime import datetime, timedelta
import math

# --- CONFIGURATION ---
TOTAL_VESSELS = 5000

# Realistic Shipping Lanes (Start Lat/Lon -> End Lat/Lon)
# We will interpolate points between these to create "highways"
SHIPPING_LANES = [
    # Route 1: The Great East-West Trade (Rotterdam -> Suez -> Malacca -> Shanghai)
    {"name": "Atlantic-Med", "start": (51.0, 1.0), "end": (36.0, -5.0), "bends": [(45.0, -8.0), (37.0, -9.0)]}, # English Channel -> Gibraltar
    {"name": "Mediterranean", "start": (36.0, -5.0), "end": (32.0, 32.0), "bends": [(37.0, 11.0)]}, # Gibraltar -> Suez
    {"name": "Red Sea", "start": (32.0, 32.0), "end": (12.0, 44.0), "bends": []}, # Suez -> Aden
    {"name": "Indian Ocean North", "start": (12.0, 44.0), "end": (5.0, 95.0), "bends": [(6.0, 80.0)]}, # Aden -> Malacca
    {"name": "South China Sea", "start": (5.0, 95.0), "end": (31.0, 122.0), "bends": [(10.0, 110.0)]}, # Malacca -> Shanghai
    
    # Route 2: Trans-Pacific (Shanghai -> LA)
    {"name": "Pacific North", "start": (31.0, 122.0), "end": (34.0, -118.0), "bends": [(45.0, 160.0), (45.0, -160.0)]}, # Great Circle approx
    
    # Route 3: Trans-Atlantic (NY -> English Channel)
    {"name": "Atlantic Crossing", "start": (40.0, -74.0), "end": (50.0, -4.0), "bends": [(42.0, -50.0)]},

    # Route 4: Cape Route (Good Hope)
    {"name": "Cape Route", "start": (51.0, 1.0), "end": (5.0, 95.0), "bends": [(0.0, -10.0), (-35.0, 18.0), (-30.0, 60.0)]}
]

TYPES = ["Container Ship", "Tanker", "Bulk Carrier", "Cargo", "Fishing"]
FLAGS = ["Panama", "Liberia", "Marshall Islands", "Singapore", "China", "Malta", "Bahamas"]
COMPANIES = ["MAERSK", "MSC", "COSCO", "CMA CGM", "HAPAG-LLOYD", "ONE", "EVERGREEN", "HMM", "YANG MING", "ZIM"]

def interpolate_points(p1, p2, f):
    """Linear interpolation between two points"""
    return p1[0] + (p2[0] - p1[0]) * f, p1[1] + (p2[1] - p1[1]) * f

def get_point_on_route(route, progress):
    """Get a point along a multi-segment route based on progress (0.0 to 1.0)"""
    points = [route["start"]] + route.get("bends", []) + [route["end"]]
    
    # Total segments
    n_segments = len(points) - 1
    segment_idx = int(progress * n_segments)
    if segment_idx >= n_segments: segment_idx = n_segments - 1
    
    # Local progress within segment
    segment_progress = (progress * n_segments) - segment_idx
    
    return interpolate_points(points[segment_idx], points[segment_idx+1], segment_progress)

def generate_vessels(count=TOTAL_VESSELS):
    vessels = {}
    
    print(f"Generating {count} vessels along {len(SHIPPING_LANES)} major shipping lanes...")
    
    for i in range(count):
        # 1. Pick a Lane
        lane = random.choice(SHIPPING_LANES)
        
        # 2. Position along lane (random)
        progress = random.random()
        base_lat, base_lon = get_point_on_route(lane, progress)
        
        # 3. Add "Traffic Jitter" (Ships aren't in a perfect line)
        # 0.5 to 2.0 degrees deviation usually covers a shipping lane width
        lat = base_lat + random.uniform(-0.5, 0.5)
        lon = base_lon + random.uniform(-0.5, 0.5)
        
        # 4. Generate Vessel Identity
        v_type = random.choices(TYPES, weights=[30, 25, 25, 10, 10])[0]
        imo = f"9{random.randint(100000, 999999)}"
        
        company = random.choice(COMPANIES)
        name_suffix = random.choice(['EAGLE', 'HOPE', 'STAR', 'TITAN', 'OCEAN', 'WAVE', 'PEARL', 'SPIRIT', 'VOYAGER', 'PIONEER', 'LEADER', 'ACE'])
        name = f"{company} {name_suffix}" if v_type in ["Container Ship", "Tanker"] else f"{random.choice(['GLORY', 'LUCKY', 'OCEAN', 'SEA'])} {random.randint(100, 999)}"

        # 5. Course/Heading (Approximate direction of lane)
        # Little trick: look slightly ahead to determine course
        next_lat, next_lon = get_point_on_route(lane, min(progress + 0.01, 1.0))
        dy = next_lat - lat
        dx = next_lon - lon
        course = (math.degrees(math.atan2(dx, dy)) + 360) % 360
        
        # Randomize course slightly
        course = (course + random.uniform(-10, 10)) % 360

        # 6. Generate History (Trails behind the vessel)
        history = []
        h_lat, h_lon = lat, lon
        for _ in range(15): # 15 point trail
             # Move backwards opposite to course
             speed_deg = 0.05 # Approx step size
             h_lat -= speed_deg * math.cos(math.radians(course))
             h_lon -= speed_deg * math.sin(math.radians(course))
             # Add slight jitter to trail for realism
             h_lat += random.uniform(-0.01, 0.01)
             h_lon += random.uniform(-0.01, 0.01)
             history.append({'lat': round(h_lat, 4), 'lon': round(h_lon, 4)})

        vessels[imo] = {
            "imo": imo,
            "name": name,
            "type": v_type,
            "flag": random.choice(FLAGS),
            "lat": round(lat, 4),
            "lon": round(lon, 4),
            "speed": round(random.uniform(10.0, 24.0), 1),
            "course": round(course, 1),
            "status": "Underway Using Engine",
            "length": random.randint(150, 400),
            "width": random.randint(20, 60),
            "dwt": random.randint(30000, 250000),
            "company_name": company,
            "destination": random.choice(["ROTTERDAM", "SINGAPORE", "SHANGHAI", "LOS ANGELES", "NEW YORK", "SUEZ"]),
            "eta": (datetime.now() + timedelta(days=random.randint(2, 20))).strftime("%Y-%m-%d %H:%M"),
            "risk_level": "Low",
            "cargo_manifest": {
                "category": "General Cargo",
                "weight_tons": random.randint(10000, 100000)
            },
            "history": history,
            "image": f"https://source.unsplash.com/400x300/?ship,{v_type.replace(' ', '')}"
        }

    return vessels

if __name__ == "__main__":
    data_dir = Path("backend/data")
    data_dir.mkdir(exist_ok=True)
    
    vessels_data = generate_vessels(TOTAL_VESSELS)
    
    with open(data_dir / "vessels.json", "w") as f:
        json.dump(vessels_data, f, indent=2)
        
    print(f"SUCCESS: Generated {len(vessels_data)} realistic AIS records along shipping lanes.")
