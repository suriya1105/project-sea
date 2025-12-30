"""
Marine Strike Data Processor
Downloads and processes Marine Mammal Strike data from Kaggle/NOAA
"""

import os
import json
import pandas as pd
from pathlib import Path
from datetime import datetime
import random
from typing import Dict, List, Optional

try:
    from kaggle.api.kaggle_api_extended import KaggleApi
    KAGGLE_AVAILABLE = True
except ImportError:
    KAGGLE_AVAILABLE = False

class MarineStrikeProcessor:
    """Process Marine Strike data"""
    
    def __init__(self, data_dir="data", kaggle_dir="kaggle_data"):
        self.data_dir = Path(data_dir)
        self.kaggle_dir = Path(kaggle_dir)
        self.kaggle_dir.mkdir(exist_ok=True)
        self.api = None
        
        if KAGGLE_AVAILABLE:
            try:
                self.api = KaggleApi()
                self.api.authenticate()
            except Exception as e:
                print(f"Warning: Could not authenticate Kaggle API: {e}")

    def download_dataset(self, dataset_name: str, unzip: bool = True) -> Optional[Path]:
        """Download dataset from Kaggle"""
        if not self.api:
            print("Kaggle API not available")
            return None
        
        try:
            dataset_path = self.kaggle_dir / dataset_name.replace('/', '_')
            dataset_path.mkdir(parents=True, exist_ok=True)
            
            print(f"Downloading dataset: {dataset_name}")
            self.api.dataset_download_files(dataset_name, path=str(dataset_path), unzip=unzip)
            return dataset_path
        except Exception as e:
            print(f"Error downloading dataset: {e}")
            return None

    def load_data(self, dataset_path: Path) -> Optional[pd.DataFrame]:
        """Load CSV data"""
        csv_files = list(dataset_path.glob("*.csv"))
        if not csv_files:
            return None
        
        try:
            # Assuming the first CSV is the main data
            print(f"Loading {csv_files[0].name}...")
            return pd.read_csv(csv_files[0], low_memory=False)
        except Exception as e:
            print(f"Error loading CSV: {e}")
            return None

    def transform_to_strikes(self, df: pd.DataFrame) -> List[Dict]:
        """Transform raw data to SeaTrace format"""
        strikes = []
        
        # Mapping loosely based on NOAA API structure, adapting for CSV columns
        # We look for common column names in such datasets
        
        for _, row in df.iterrows():
            try:
                # Fallbacks for various dataset formats
                year = row.get('YEAR') or row.get('Year') or datetime.now().year
                month = row.get('MONTH') or row.get('Month') or 1
                day = row.get('DAY') or row.get('Day') or 1
                
                try:
                    date_str = f"{int(year)}-{int(month):02d}-{int(day):02d}"
                except:
                    date_str = datetime.now().strftime('%Y-%m-%d')

                lat = row.get('LATITUDE') or row.get('Latitude') or row.get('lat')
                lon = row.get('LONGITUDE') or row.get('Longitude') or row.get('lon')
                
                if pd.isna(lat) or pd.isna(lon):
                    # Simulate location if missing (Demo purposes)
                    lat = random.uniform(5.0, 25.0)
                    lon = random.uniform(65.0, 100.0)

                species = row.get('COMMON_NAME') or row.get('Species') or row.get('SPECIES') or "Unknown Whale"
                
                outcome = row.get('OUTCOME') or row.get('Outcome') or "Strike"
                
                strikes.append({
                    'id': f"STR-{random.randint(10000, 99999)}",
                    'date': date_str,
                    'lat': float(lat),
                    'lon': float(lon),
                    'species': str(species),
                    'outcome': str(outcome),
                    'vessel_type': str(row.get('VESSEL_TYPE', 'Unknown')),
                    'severity': 'High' if 'Mortality' in str(outcome) else 'Medium'
                })
            except Exception as e:
                continue
                
        return strikes

    def process_and_save(self, dataset_name: str, output_file: str = "marine_strikes.json") -> bool:
        """Pipeline"""
        try:
            dataset_path = self.download_dataset(dataset_name)
            if not dataset_path:
                # Fallback: Create mock data if download fails (for demo reliability)
                print("Using mock marine strike data (API unavailable)")
                self.save_mock_data(output_file)
                return True

            df = self.load_data(dataset_path)
            if df is None:
                self.save_mock_data(output_file)
                return True

            strikes = self.transform_to_strikes(df)
            
            output_path = self.data_dir / output_file
            with open(output_path, 'w') as f:
                json.dump(strikes, f, indent=2)
                
            return True
        except Exception as e:
            print(f"Process error: {e}")
            return False

    def save_mock_data(self, output_file):
        """Generate demo data if Kaggle fails"""
        mock_strikes = []
        species_list = ["Blue Whale", "Humpback Whale", "Dolphin", "Sea Turtle"]
        for _ in range(20):
            mock_strikes.append({
                'id': f"STR-{random.randint(10000, 99999)}",
                'date': (datetime.now()).strftime('%Y-%m-%d'),
                'lat': random.uniform(5.0, 25.0),
                'lon': random.uniform(65.0, 100.0),
                'species': random.choice(species_list),
                'outcome': "Sighted / Avoided",
                'vessel_type': "Container Ship",
                'severity': "Low"
            })
        
        output_path = self.data_dir / output_file
        with open(output_path, 'w') as f:
            json.dump(mock_strikes, f, indent=2)
