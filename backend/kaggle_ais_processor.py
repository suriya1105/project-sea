"""
Kaggle AIS Data Processor
Downloads and processes AIS (Automatic Identification System) data from Kaggle
and transforms it to match SeaTrace vessel data format.
"""

import os
import json
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import random

try:
    from kaggle.api.kaggle_api_extended import KaggleApi
    KAGGLE_AVAILABLE = True
except ImportError:
    KAGGLE_AVAILABLE = False
    print("Warning: Kaggle API not available. Install with: pip install kaggle")


class KaggleAISProcessor:
    """Process AIS data from Kaggle datasets"""
    
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
                print("Make sure ~/.kaggle/kaggle.json exists with your API credentials")
    
    def download_dataset(self, dataset_name: str, unzip: bool = True) -> Optional[Path]:
        """
        Download a Kaggle dataset
        
        Args:
            dataset_name: Kaggle dataset name (e.g., 'username/dataset-name')
            unzip: Whether to unzip the downloaded files
            
        Returns:
            Path to downloaded dataset directory
        """
        if not self.api:
            print("Kaggle API not available")
            return None
        
        try:
            dataset_path = self.kaggle_dir / dataset_name.replace('/', '_')
            dataset_path.mkdir(parents=True, exist_ok=True)
            
            print(f"Downloading dataset: {dataset_name}")
            self.api.dataset_download_files(
                dataset_name,
                path=str(dataset_path),
                unzip=unzip
            )
            
            print(f"Dataset downloaded to: {dataset_path}")
            return dataset_path
        except Exception as e:
            print(f"Error downloading dataset: {e}")
            return None
    
    def load_ais_data(self, dataset_path: Path, file_pattern: str = "*.csv") -> Optional[pd.DataFrame]:
        """
        Load AIS data from CSV files
        
        Args:
            dataset_path: Path to dataset directory
            file_pattern: File pattern to match (default: *.csv)
            
        Returns:
            Combined DataFrame of AIS data
        """
        csv_files = list(dataset_path.glob(file_pattern))
        
        if not csv_files:
            print(f"No CSV files found in {dataset_path}")
            return None
        
        print(f"Found {len(csv_files)} CSV files")
        
        # Load and combine all CSV files
        dataframes = []
        for csv_file in csv_files[:5]:  # Limit to first 5 files for performance
            try:
                print(f"Loading {csv_file.name}...")
                df = pd.read_csv(csv_file, low_memory=False)
                dataframes.append(df)
            except Exception as e:
                print(f"Error loading {csv_file}: {e}")
        
        if not dataframes:
            return None
        
        combined_df = pd.concat(dataframes, ignore_index=True)
        print(f"Loaded {len(combined_df)} AIS records")
        return combined_df
    
    def transform_ais_to_vessels(self, ais_df: pd.DataFrame, region_filter: Optional[Dict] = None) -> List[Dict]:
        """
        Transform AIS data to SeaTrace vessel format
        
        Args:
            ais_df: DataFrame with AIS data
            region_filter: Optional dict with 'lat_min', 'lat_max', 'lon_min', 'lon_max' for filtering
            
        Returns:
            List of vessel dictionaries in SeaTrace format
        """
        if ais_df.empty:
            return []
        
        # Common AIS column name mappings (adjust based on your dataset)
        column_mappings = {
            'imo': ['IMO', 'imo', 'Imo', 'vessel_imo', 'Vessel_IMO'],
            'mmsi': ['MMSI', 'mmsi', 'Mmsi', 'vessel_mmsi', 'Vessel_MMSI'],
            'name': ['VesselName', 'vessel_name', 'Vessel_Name', 'name', 'Name', 'SHIPNAME'],
            'lat': ['LAT', 'lat', 'Lat', 'latitude', 'Latitude', 'LATITUDE'],
            'lon': ['LON', 'lon', 'Lon', 'longitude', 'Longitude', 'LONGITUDE'],
            'speed': ['SOG', 'sog', 'Speed', 'speed', 'SPEED', 'SpeedOverGround'],
            'course': ['COG', 'cog', 'Course', 'course', 'COURSE', 'CourseOverGround'],
            'heading': ['Heading', 'heading', 'HEADING'],
            'type': ['VesselType', 'vessel_type', 'Vessel_Type', 'Type', 'SHIPTYPE'],
            'flag': ['Flag', 'flag', 'FLAG', 'Country', 'country'],
            'length': ['Length', 'length', 'LENGTH'],
            'width': ['Width', 'width', 'WIDTH'],
            'draft': ['Draft', 'draft', 'DRAFT'],
            'destination': ['Destination', 'destination', 'DEST', 'dest'],
            'eta': ['ETA', 'eta', 'Eta'],
            'timestamp': ['Timestamp', 'timestamp', 'TIMESTAMP', 'BaseDateTime', 'DateTime']
        }
        
        # Find actual column names in the dataframe
        actual_columns = {}
        for key, possible_names in column_mappings.items():
            for name in possible_names:
                if name in ais_df.columns:
                    actual_columns[key] = name
                    break
        
        print(f"Found columns: {actual_columns}")
        
        # Filter by region if specified (default: Indian Ocean region)
        if region_filter:
            lat_col = actual_columns.get('lat')
            lon_col = actual_columns.get('lon')
            if lat_col and lon_col:
                mask = (
                    (ais_df[lat_col] >= region_filter.get('lat_min', 5)) &
                    (ais_df[lat_col] <= region_filter.get('lat_max', 25)) &
                    (ais_df[lon_col] >= region_filter.get('lon_min', 65)) &
                    (ais_df[lon_col] <= region_filter.get('lon_max', 100))
                )
                ais_df = ais_df[mask].copy()
        
        # Get unique vessels (by IMO or MMSI)
        id_col = actual_columns.get('imo') or actual_columns.get('mmsi')
        if not id_col:
            print("No IMO or MMSI column found")
            return []
        
        # Group by vessel ID and get latest position
        vessels_list = []
        vessel_groups = ais_df.groupby(id_col)
        
        vessel_type_mapping = {
            '70': 'Cargo', '71': 'Cargo', '72': 'Cargo', '73': 'Cargo', '74': 'Cargo', '75': 'Cargo',
            '76': 'Cargo', '77': 'Cargo', '78': 'Cargo', '79': 'Cargo',
            '80': 'Tanker', '81': 'Tanker', '82': 'Tanker', '83': 'Tanker',
            '60': 'Passenger', '61': 'Passenger', '62': 'Passenger', '63': 'Passenger',
            '30': 'Fishing', '31': 'Fishing', '32': 'Fishing',
            '50': 'Pilot', '51': 'Pilot', '52': 'Pilot',
            '37': 'Pleasure Craft', '36': 'Pleasure Craft',
            '90': 'Other', '91': 'Other'
        }
        
        for vessel_id, group in list(vessel_groups)[:200]:  # Limit to 200 vessels
            try:
                # Get latest record for this vessel
                latest = group.iloc[-1]
                
                # Extract vessel information
                imo = str(vessel_id) if actual_columns.get('imo') else f"MMSI{str(vessel_id)}"
                mmsi = str(latest.get(actual_columns.get('mmsi', ''), vessel_id))
                name = str(latest.get(actual_columns.get('name', ''), f"Vessel {vessel_id}")).strip()
                
                if not name or name == 'nan' or name == 'None':
                    name = f"Vessel {vessel_id}"
                
                lat = float(latest.get(actual_columns.get('lat', ''), 0))
                lon = float(latest.get(actual_columns.get('lon', ''), 0))
                
                # Skip if invalid coordinates
                if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
                    continue
                
                speed = float(latest.get(actual_columns.get('speed', ''), 0))
                course = float(latest.get(actual_columns.get('course', ''), 0))
                
                # Normalize speed (convert from m/s to knots if needed)
                if speed > 50:  # Likely in m/s, convert to knots
                    speed = speed * 1.944
                
                vessel_type_code = str(latest.get(actual_columns.get('type', ''), '70'))
                vessel_type = vessel_type_mapping.get(vessel_type_code[:2], 'Cargo Ship')
                
                if 'Container' in name or 'CONTAINER' in name.upper():
                    vessel_type = 'Container Ship'
                elif 'Tanker' in name or 'TANKER' in name.upper():
                    vessel_type = 'Tanker'
                elif 'Bulk' in name or 'BULK' in name.upper():
                    vessel_type = 'Bulk Carrier'
                
                flag = str(latest.get(actual_columns.get('flag', ''), 'Unknown')).strip()
                if not flag or flag == 'nan':
                    flag = 'Unknown'
                
                destination = str(latest.get(actual_columns.get('destination', ''), 'Unknown')).strip()
                if not destination or destination == 'nan':
                    destination = 'Unknown'
                
                # Calculate derived fields
                length = float(latest.get(actual_columns.get('length', ''), 0))
                width = float(latest.get(actual_columns.get('width', ''), 0))
                dwt = self._estimate_dwt(length, width, vessel_type)
                
                # Create vessel object
                vessel = {
                    'imo': f"IMO{imo}" if not imo.startswith('IMO') else imo,
                    'name': name,
                    'mmsi': mmsi,
                    'type': vessel_type,
                    'flag': flag,
                    'company_name': self._get_company_name(name),
                    'company_logo': f"https://via.placeholder.com/50x50?text={name[:3].upper()}",
                    'lat': round(lat, 4),
                    'lon': round(lon, 4),
                    'speed': round(speed, 1),
                    'course': round(course % 360, 1),
                    'status': 'Active',
                    'compliance_rating': round(random.uniform(7.0, 9.8), 1),
                    'risk_level': self._calculate_risk_level(speed, compliance_rating=8.5),
                    'last_inspection': (datetime.now() - timedelta(days=random.randint(1, 90))).strftime('%Y-%m-%d'),
                    'violations': random.randint(0, 2),
                    'dwt': int(dwt),
                    'destination': destination[:50],
                    'eta': latest.get(actual_columns.get('eta', ''), ''),
                    'image': self._get_vessel_image_url(vessel_type)
                }
                
                vessels_list.append(vessel)
            except Exception as e:
                print(f"Error processing vessel {vessel_id}: {e}")
                continue
        
        print(f"Processed {len(vessels_list)} vessels from AIS data")
        return vessels_list
    
    def _estimate_dwt(self, length: float, width: float, vessel_type: str) -> int:
        """Estimate deadweight tonnage from vessel dimensions"""
        if length > 0 and width > 0:
            # Rough estimation based on length and width
            base_dwt = (length * width * 2.5) * 0.5
            if vessel_type == 'Tanker':
                base_dwt *= 1.5
            elif vessel_type == 'Container Ship':
                base_dwt *= 1.2
            return int(max(5000, min(base_dwt, 200000)))
        return random.randint(10000, 150000)
    
    def _get_company_name(self, vessel_name: str) -> str:
        """Extract or generate company name from vessel name"""
        # Common shipping company patterns
        name_upper = vessel_name.upper()
        if 'MSC' in name_upper:
            return 'MSC Cruises'
        elif 'EVER' in name_upper or 'EVERGREEN' in name_upper:
            return 'Evergreen Marine'
        elif 'MAERSK' in name_upper:
            return 'Maersk Line'
        elif 'CMA' in name_upper or 'CGM' in name_upper:
            return 'CMA CGM'
        elif 'COSCO' in name_upper:
            return 'COSCO Shipping'
        elif 'HAPAG' in name_upper:
            return 'Hapag-Lloyd'
        else:
            # Extract first word or use generic
            words = vessel_name.split()
            if words:
                return f"{words[0]} Shipping"
            return 'Maritime Company'
    
    def _calculate_risk_level(self, speed: float, compliance_rating: float = 8.5) -> str:
        """Calculate risk level based on speed and compliance"""
        if compliance_rating < 6.0:
            return 'High'
        elif speed > 25:
            return 'High'
        elif compliance_rating < 7.5 or speed > 20:
            return 'Medium'
        else:
            return 'Low'
    
    def _get_vessel_image_url(self, vessel_type: str) -> str:
        """Get placeholder image URL based on vessel type"""
        image_map = {
            'Container Ship': 'https://images.unsplash.com/photo-1587284079863-4a4f6f5c4c0f?w=400&h=300&fit=crop',
            'Tanker': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
            'Bulk Carrier': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
            'Cargo Ship': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
        }
        return image_map.get(vessel_type, 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop')
    
    def process_and_save(self, dataset_name: str, output_file: str = "vessels.json", 
                        region_filter: Optional[Dict] = None) -> bool:
        """
        Complete pipeline: download, process, and save AIS data
        
        Args:
            dataset_name: Kaggle dataset name
            output_file: Output JSON file name
            region_filter: Optional region filter
            
        Returns:
            True if successful
        """
        try:
            # Download dataset
            dataset_path = self.download_dataset(dataset_name)
            if not dataset_path:
                return False
            
            # Load AIS data
            ais_df = self.load_ais_data(dataset_path)
            if ais_df is None or ais_df.empty:
                print("No AIS data loaded")
                return False
            
            # Transform to vessels
            vessels = self.transform_ais_to_vessels(ais_df, region_filter)
            if not vessels:
                print("No vessels processed")
                return False
            
            # Convert to dictionary format (keyed by IMO)
            vessels_dict = {}
            for vessel in vessels:
                vessels_dict[vessel['imo']] = vessel
            
            # Save to JSON
            output_path = self.data_dir / output_file
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(vessels_dict, f, indent=2, ensure_ascii=False)
            
            print(f"Saved {len(vessels_dict)} vessels to {output_path}")
            return True
            
        except Exception as e:
            print(f"Error in process_and_save: {e}")
            import traceback
            traceback.print_exc()
            return False

