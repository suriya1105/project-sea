"""
Kaggle AIS Dataset Configuration
Configure which Kaggle datasets to use for AIS data
"""

# Popular Kaggle AIS datasets - update with your preferred dataset
KAGGLE_DATASETS = {
    # Example: AIS vessel tracking dataset
    # Format: 'username/dataset-name'
    'default': 'cwwang/ais-data',  # Example - replace with actual dataset
    
    # Alternative datasets (uncomment to use):
    # 'maritime': 'username/maritime-ais-data',
    # 'vessel_tracking': 'username/vessel-tracking-ais',
}

# Region filter for Indian Ocean (adjust as needed)
REGION_FILTER = {
    'lat_min': 5.0,   # Southern boundary
    'lat_max': 25.0,  # Northern boundary
    'lon_min': 65.0,  # Western boundary
    'lon_max': 100.0  # Eastern boundary
}

# Data update settings
UPDATE_INTERVAL_HOURS = 24  # How often to check for updates
MAX_VESSELS = 200  # Maximum number of vessels to process

