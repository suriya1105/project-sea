"""
Standalone script to sync Kaggle AIS data
Run this script to download and process AIS data from Kaggle
"""

import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from kaggle_ais_processor import KaggleAISProcessor
from kaggle_config import KAGGLE_DATASETS, REGION_FILTER

def main():
    """Main function to sync Kaggle data"""
    print("=" * 60)
    print("SeaTrace - Kaggle AIS Data Sync")
    print("=" * 60)
    
    # Check if Kaggle API is configured
    kaggle_json = Path.home() / ".kaggle" / "kaggle.json"
    if not kaggle_json.exists():
        print("\n⚠️  Warning: Kaggle API credentials not found!")
        print("Please set up Kaggle API:")
        print("1. Go to https://www.kaggle.com/settings")
        print("2. Click 'Create New API Token'")
        print("3. Save kaggle.json to ~/.kaggle/kaggle.json")
        print("4. Run: chmod 600 ~/.kaggle/kaggle.json")
        print("\nAlternatively, you can manually download AIS data and place CSV files in kaggle_data/")
        # return # Proceed to allow mock generation
    
    # Determine backend directory (where this script is)
    backend_dir = Path(__file__).parent
    data_dir = backend_dir / "data"
    
    # Initialize processor
    processor = KaggleAISProcessor(data_dir=data_dir)
    
    # Get dataset name
    dataset_name = KAGGLE_DATASETS.get('default')
    
    if not dataset_name:
        print("\n❌ No dataset configured in kaggle_config.py")
        print("Please update KAGGLE_DATASETS with a valid Kaggle dataset name")
        return
    
    # Process and save AIS
    print(f"\n📦 Dataset (AIS): {dataset_name}")
    processor.process_and_save(dataset_name=dataset_name, output_file="vessels.json", region_filter=REGION_FILTER)

    # Process and save Marine Strikes
    from marine_strike_processor import MarineStrikeProcessor
    strike_processor = MarineStrikeProcessor(data_dir=data_dir)
    strike_dataset = KAGGLE_DATASETS.get('marine_strike')
    
    if strike_dataset:
        print(f"\n📦 Dataset (Strikes): {strike_dataset}")
        strike_processor.process_and_save(dataset_name=strike_dataset, output_file="marine_strikes.json")
    
    print("\n✅ Sync complete! Data updated in data/ directory.")

if __name__ == "__main__":
    main()

