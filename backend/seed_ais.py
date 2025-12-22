
import json
import random
import os
from pathlib import Path
from datetime import datetime, timedelta

# Realistic Vessel Names and Real IMOs (Indian Ocean / Global Fleet sample)
REAL_VESSELS = [
    {"name": "EVER GIVEN", "type": "Container Ship", "flag": "Panama", "imo": "9811000", "length": 400, "width": 59},
    {"name": "MAERSK ALABAMA", "type": "Container Ship", "flag": "USA", "imo": "9164263", "length": 155, "width": 25},
    {"name": "MSC GULSUN", "type": "Container Ship", "flag": "Panama", "imo": "9839430", "length": 400, "width": 62},
    {"name": "FRONTIER JACARANDA", "type": "Bulk Carrier", "flag": "Panama", "imo": "9451666", "length": 292, "width": 45},
    {"name": "OIL INDIA 1", "type": "Tanker", "flag": "India", "imo": "9211111", "length": 180, "width": 32},
    {"name": "JAG LEELA", "type": "Tanker", "flag": "India", "imo": "9173666", "length": 244, "width": 42},
    {"name": "INS VIKRANT", "type": "Naval Vessel", "flag": "India", "imo": "0000001", "length": 262, "width": 62},
    {"name": "CHENNAL SELVAM", "type": "Fishing", "flag": "India", "imo": "8888881", "length": 24, "width": 7},
    {"name": "SRI LANKA GLORY", "type": "Cargo", "flag": "Sri Lanka", "imo": "9166666", "length": 120, "width": 20},
    {"name": "GLOBAL MERCURY", "type": "Tanker", "flag": "Liberia", "imo": "9222222", "length": 190, "width": 32},
    {"name": "CMA CGM MARCO POLO", "type": "Container Ship", "flag": "Bahamas", "imo": "9454436", "length": 396, "width": 54},
    {"name": "HMM ALGECIRAS", "type": "Container Ship", "flag": "Panama", "imo": "9863297", "length": 400, "width": 61},
    {"name": "OOCL HONG KONG", "type": "Container Ship", "flag": "Hong Kong", "imo": "9776171", "length": 399, "width": 58},
    {"name": "TI CLASS", "type": "Tanker", "flag": "Marshall Islands", "imo": "9239496", "length": 380, "width": 68},
    {"name": "SEAWISE GIANT", "type": "Tanker", "flag": "India", "imo": "Retired", "length": 458, "width": 69} 
]

# Generate more synthetic vessels to fill the map
TYPES = ["Container Ship", "Tanker", "Bulk Carrier", "Fishing", "Cargo"]
FLAGS = ["India", "Panama", "Liberia", "Marshall Islands", "Singapore", "China"]
COMPANIES = ["Maersk", "MSC", "COSCO", "Evergreen", "Hapag-Lloyd", "ONE"]

def generate_vessels(count=50):
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
            "company_name": random.choice(COMPANIES),
            "destination": random.choice(["Colombo", "Mumbai", "Chennai", "Singapore", "Dubai"]),
            "eta": (datetime.now() + timedelta(days=random.randint(1, 10))).strftime("%Y-%m-%d %H:%M"),
            "risk_level": "Low"
        }

    # 2. Fill the rest
    for i in range(count - len(REAL_VESSELS)):
        v_type = random.choice(TYPES)
        imo = f"9{random.randint(100000, 999999)}"
        name = f"{random.choice(COMPANIES).upper()} {random.choice(['EAGLE', 'HOPE', 'STAR', 'TITAN', 'OCEAN', 'WAVE', 'PEARL'])}"
        
        lat = random.uniform(5.0, 25.0)
        lon = random.uniform(65.0, 95.0)
        
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
            "destination": random.choice(["Colombo", "Mumbai", "Chennai", "Singapore", "Dubai"]),
            "eta": (datetime.now() + timedelta(days=random.randint(1, 10))).strftime("%Y-%m-%d %H:%M"),
             "risk_level": "Low" if random.random() > 0.1 else "Medium"
        }

    return vessels

if __name__ == "__main__":
    data_dir = Path("backend/data")
    data_dir.mkdir(exist_ok=True)
    
    vessels_data = generate_vessels(50)
    
    with open(data_dir / "vessels.json", "w") as f:
        json.dump(vessels_data, f, indent=2)
        
    print(f"Generated {len(vessels_data)} realistic AIS records.")
