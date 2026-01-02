
import json
import random
import os
from pathlib import Path
from datetime import datetime, timedelta


# Realistic Vessel Names and Real IMOs (Indian Ocean / Global Fleet sample)
# Enhanced with Kattegat Strait & FMCG Cargo Profiles
REAL_VESSELS = [
    # Global / Indian Ocean Fleet
    {"name": "EVER GIVEN", "type": "Container Ship", "flag": "Panama", "imo": "9811000", "length": 400, "width": 59, "cargo_type": "FMCG", "cargo_owner": "Walmart/IKEA"},
    {"name": "MAERSK ALABAMA", "type": "Container Ship", "flag": "USA", "imo": "9164263", "length": 155, "width": 25, "cargo_type": "FMCG", "cargo_owner": "Procter & Gamble"},
    {"name": "MSC GULSUN", "type": "Container Ship", "flag": "Panama", "imo": "9839430", "length": 400, "width": 62, "cargo_type": "Electronics", "cargo_owner": "Samsung"},
    {"name": "FRONTIER JACARANDA", "type": "Bulk Carrier", "flag": "Panama", "imo": "9451666", "length": 292, "width": 45, "cargo_type": "Raw Materials", "cargo_owner": "Tata Steel"},
    {"name": "OIL INDIA 1", "type": "Tanker", "flag": "India", "imo": "9211111", "length": 180, "width": 32, "cargo_type": "Crude Oil", "cargo_owner": "ONGC"},
    {"name": "JAG LEELA", "type": "Tanker", "flag": "India", "imo": "9173666", "length": 244, "width": 42, "cargo_type": "Crude Oil", "cargo_owner": "Reliance"},

    # Kattegat Strait / North Sea Profiles (Integrated from AIS Dataset)
    {"name": "STENA DANICA", "type": "Passenger", "flag": "Sweden", "imo": "7907245", "length": 154, "width": 28, "cargo_type": "Passengers/Cars", "cargo_owner": "Stena Line"},
    {"name": "PEARL SEAWAYS", "type": "Passenger", "flag": "Denmark", "imo": "8701480", "length": 178, "width": 33, "cargo_type": "Passengers", "cargo_owner": "DFDS"},
    {"name": "COLOR MAGIC", "type": "Passenger", "flag": "Norway", "imo": "9349863", "length": 223, "width": 35, "cargo_type": "Passengers", "cargo_owner": "Color Line"},
    {"name": "MAERSK MC-KINNEY MOLLER", "type": "Container Ship", "flag": "Denmark", "imo": "9619907", "length": 399, "width": 59, "cargo_type": "FMCG", "cargo_owner": "Nestle/Unilever"},
]

# FMCG Dataset Simulation
FMCG_BRANDS = ["Nestle", "Procter & Gamble", "Unilever", "Coca-Cola", "PepsiCo", "Danone", "Mars", "Mondelez", "L'Oreal", "Colgate-Palmolive"]
FMCG_PRODUCTS = ["Food Stuffs", "Personal Care", "Beverages", "Dairy Products", "Confectionery", "Household Goods", "Cosmetics"]

# Generate more synthetic vessels to fill the map
TYPES = ["Container Ship", "Tanker", "Bulk Carrier", "Fishing", "Cargo"]
FLAGS = ["India", "Panama", "Liberia", "Marshall Islands", "Singapore", "China", "Denmark", "Norway"]
COMPANIES = ["Maersk", "MSC", "COSCO", "Evergreen", "Hapag-Lloyd", "ONE", "Stena Bulk"]

def generate_vessels(count=60):
    vessels = {}
    
    # 1. Add Real Vessels
    for v in REAL_VESSELS:
        lat = random.uniform(5.0, 25.0)  # Indian Ocean / Arabian Sea Latitude
        lon = random.uniform(65.0, 95.0) # Longitude
        
        vessels[v['imo']] = {
            "imo": str(v['imo']),
            "name": v['name'],
            "type": v['type'],
            "flag": v['flag'],
            "lat": lat,
            "lon": lon,
            "speed": round(random.uniform(10.0, 22.0), 1),
            "course": round(random.uniform(0, 360), 1),
            "status": "Underway Using Engine",
            "length": v['length'],
            "width": v['width'],
            "dwt": v['length'] * v['width'] * 1.5, # Rough estimate
            "company_name": v.get('cargo_owner') if v.get('cargo_owner') else random.choice(COMPANIES),
            "destination": random.choice(["Colombo", "Mumbai", "Chennai", "Singapore", "Dubai", "Rotterdam", "Gothenburg"]),
            "eta": (datetime.now() + timedelta(days=random.randint(1, 10))).strftime("%Y-%m-%d %H:%M"),
            "risk_level": "Low",
            # New FMCG Data Fields
            "cargo_manifest": {
                "category": v.get('cargo_type', 'General Cargo'),
                "major_brand": v.get('cargo_owner', 'Various'),
                "weight_tons": int(v['length'] * v['width'] * 0.8),
                "value_est_usd": f"${random.randint(1, 100)} Million"
            },
            "image": f"https://source.unsplash.com/400x300/?ship,{v['type'].replace(' ', '')}" # Placeholder dynamic image
        }

    # 2. Fill the rest
    for i in range(count - len(REAL_VESSELS)):
        v_type = random.choice(TYPES)
        # 30% chance of being an FMCG carrier
        is_fmcg = random.random() < 0.3 and v_type == "Container Ship"
        
        imo = f"9{random.randint(100000, 999999)}"
        name_prefix = random.choice(COMPANIES)
        name_suffix = random.choice(['EAGLE', 'HOPE', 'STAR', 'TITAN', 'OCEAN', 'WAVE', 'PEARL', 'SPIRIT', 'VOYAGER', 'PIONEER'])
        name = f"{name_prefix.upper()} {name_suffix}"
        
        # Wider distribution for global feel
        lat = random.uniform(-40.0, 60.0) 
        lon = random.uniform(-180.0, 180.0)
        
        # Generate simple history for trails immediately
        history = []
        hist_lat = lat
        hist_lon = lon
        course_rad = random.uniform(0, 360) * (3.14159 / 180)
        for _ in range(20): # 20 points of history
             hist_lat -= 0.1 * random.uniform(0.5, 1.5) * (1 if random.random() > 0.5 else -1) # Random walk backwards
             hist_lon -= 0.1 * random.uniform(0.5, 1.5) * (1 if random.random() > 0.5 else -1)
             history.insert(0, {'lat': round(hist_lat, 4), 'lon': round(hist_lon, 4)})
        
        vessels[imo] = {
            "imo": imo,
            "name": name,
            "type": v_type,
            "flag": random.choice(FLAGS),
            "lat": lat,
            "lon": lon,
            "speed": round(random.uniform(8.0, 20.0), 1),
            "course": round(random.uniform(0, 360), 1),
            "status": "Underway Using Engine",
            "length": random.randint(100, 350),
            "width": random.randint(20, 50),
            "dwt": random.randint(10000, 150000),
            "company_name": name.split()[0],
            "destination": random.choice(["Colombo", "Mumbai", "Chennai", "Singapore", "Dubai", "Aarhus", "Skagen", "New York", "Shanghai"]),
            "eta": (datetime.now() + timedelta(days=random.randint(1, 10))).strftime("%Y-%m-%d %H:%M"),
             "risk_level": "Low" if random.random() > 0.1 else "Medium",
             "cargo_manifest": {
                "category": random.choice(FMCG_PRODUCTS) if is_fmcg else "Bulk Commodities",
                "major_brand": random.choice(FMCG_BRANDS) if is_fmcg else "Global Trading Co",
                "weight_tons": random.randint(5000, 50000),
                "value_est_usd": f"${random.randint(5, 50)} Million"
            },
            "history": history, # Pre-populating history for trails
            "image": f"https://source.unsplash.com/400x300/?ship,{v_type.replace(' ', '')}"
        }

    return vessels

if __name__ == "__main__":
    data_dir = Path("backend/data")
    data_dir.mkdir(exist_ok=True)
    
    # generate 1500 vessels for 'Satellite Dataset' look
    vessels_data = generate_vessels(1500)
    
    with open(data_dir / "vessels.json", "w") as f:
        json.dump(vessels_data, f, indent=2)
        
    print(f"Generated {len(vessels_data)} realistic AIS records.")
