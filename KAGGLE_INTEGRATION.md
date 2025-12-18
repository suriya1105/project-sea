# Kaggle AIS Data Integration Guide

This guide explains how to connect and use Kaggle AIS (Automatic Identification System) datasets with SeaTrace.

## Overview

The Kaggle integration allows you to:
- Download real AIS vessel tracking data from Kaggle
- Process and transform it to match SeaTrace's vessel format
- Automatically sync vessel positions and data
- Filter by geographic region (default: Indian Ocean)

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This will install:
- `kaggle` - Kaggle API client
- `pandas` - Data processing
- `numpy` - Numerical operations

### 2. Configure Kaggle API

1. Go to [Kaggle Account Settings](https://www.kaggle.com/settings)
2. Scroll to "API" section
3. Click "Create New API Token"
4. This downloads `kaggle.json`

5. Place the file in your home directory:
   ```bash
   # Linux/Mac
   mkdir -p ~/.kaggle
   mv ~/Downloads/kaggle.json ~/.kaggle/kaggle.json
   chmod 600 ~/.kaggle/kaggle.json
   
   # Windows
   # Create folder: C:\Users\<YourUsername>\.kaggle
   # Move kaggle.json there
   ```

### 3. Configure Dataset

Edit `backend/kaggle_config.py`:

```python
KAGGLE_DATASETS = {
    'default': 'username/dataset-name',  # Replace with actual dataset
}
```

**Popular AIS Datasets on Kaggle:**
- Search for "AIS" or "vessel tracking" datasets
- Look for datasets with columns like: IMO, MMSI, LAT, LON, SOG, COG, VesselName

### 4. Run Initial Sync

**Option A: Using the Script**
```bash
cd backend
python sync_kaggle_data.py
```

**Option B: Using the API Endpoint**
```bash
# Make a POST request to /api/kaggle/sync
# Requires admin authentication
curl -X POST http://localhost:5000/api/kaggle/sync \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"dataset": "username/dataset-name"}'
```

## Usage

### Manual Sync via Script

```bash
cd backend
python sync_kaggle_data.py
```

### API Endpoints

#### 1. Sync Kaggle Data
```http
POST /api/kaggle/sync
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "dataset": "username/dataset-name"  // Optional, uses default if not provided
}
```

**Response:**
```json
{
  "message": "Kaggle data sync started in background",
  "dataset": "username/dataset-name",
  "status": "processing"
}
```

#### 2. Check Status
```http
GET /api/kaggle/status
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "enabled": true,
  "datasets": {
    "default": "username/dataset-name"
  },
  "region_filter": {
    "lat_min": 5.0,
    "lat_max": 25.0,
    "lon_min": 65.0,
    "lon_max": 100.0
  }
}
```

## Data Processing

The integration automatically:

1. **Downloads** the Kaggle dataset
2. **Loads** CSV files (supports multiple files)
3. **Filters** by geographic region (Indian Ocean by default)
4. **Transforms** AIS data to SeaTrace format:
   - Maps column names (handles various naming conventions)
   - Extracts vessel information (IMO, MMSI, name, position, speed, course)
   - Estimates missing data (DWT, compliance ratings)
   - Assigns vessel types and risk levels
5. **Saves** to `data/vessels.json`

## Supported AIS Column Formats

The processor automatically detects common column names:

- **IMO**: `IMO`, `imo`, `Imo`, `vessel_imo`
- **MMSI**: `MMSI`, `mmsi`, `Mmsi`, `vessel_mmsi`
- **Name**: `VesselName`, `vessel_name`, `Name`, `SHIPNAME`
- **Latitude**: `LAT`, `lat`, `Latitude`, `latitude`
- **Longitude**: `LON`, `lon`, `Longitude`, `longitude`
- **Speed**: `SOG`, `sog`, `Speed`, `speed`, `SpeedOverGround`
- **Course**: `COG`, `cog`, `Course`, `course`, `CourseOverGround`
- **Type**: `VesselType`, `vessel_type`, `Type`, `SHIPTYPE`
- **Flag**: `Flag`, `flag`, `Country`, `country`

## Region Filtering

Default region (Indian Ocean):
- Latitude: 5°N to 25°N
- Longitude: 65°E to 100°E

To change the region, edit `backend/kaggle_config.py`:

```python
REGION_FILTER = {
    'lat_min': 5.0,   # Southern boundary
    'lat_max': 25.0,  # Northern boundary
    'lon_min': 65.0,  # Western boundary
    'lon_max': 100.0  # Eastern boundary
}
```

## Troubleshooting

### Issue: "Kaggle API not available"
- **Solution**: Make sure `kaggle.json` is in `~/.kaggle/` (Linux/Mac) or `C:\Users\<User>\.kaggle\` (Windows)
- Verify file permissions: `chmod 600 ~/.kaggle/kaggle.json`

### Issue: "No CSV files found"
- **Solution**: Check that the dataset contains CSV files
- Some datasets may be in different formats (JSON, Parquet, etc.)

### Issue: "No vessels processed"
- **Solution**: 
  - Check if vessels are in the specified region filter
  - Verify column names match expected formats
  - Check data quality (valid coordinates, IMO/MMSI present)

### Issue: "Dataset not found"
- **Solution**: Verify the dataset name is correct (format: `username/dataset-name`)
- Make sure the dataset is public or you have access

## Customization

### Adding Custom Transformations

Edit `backend/kaggle_ais_processor.py`:

```python
def transform_ais_to_vessels(self, ais_df, region_filter=None):
    # Add your custom transformations here
    ...
```

### Adding More Datasets

Edit `backend/kaggle_config.py`:

```python
KAGGLE_DATASETS = {
    'default': 'username/dataset-1',
    'alternative': 'username/dataset-2',
    'historical': 'username/dataset-3',
}
```

## Best Practices

1. **Regular Updates**: Set up a cron job or scheduled task to sync data periodically
2. **Data Validation**: Review processed vessels to ensure data quality
3. **Region Filtering**: Use appropriate region filters to reduce processing time
4. **Backup**: Keep backups of `data/vessels.json` before syncing
5. **Monitoring**: Check sync logs for errors or warnings

## Example Workflow

1. **Initial Setup**:
   ```bash
   # Install dependencies
   pip install -r requirements.txt
   
   # Configure Kaggle API
   # (place kaggle.json in ~/.kaggle/)
   
   # Update kaggle_config.py with your dataset
   ```

2. **First Sync**:
   ```bash
   python sync_kaggle_data.py
   ```

3. **Verify Data**:
   - Check `data/vessels.json`
   - View vessels in the SeaTrace dashboard

4. **Automated Sync** (optional):
   - Set up cron job or scheduled task
   - Or use API endpoint with automation tool

## Support

For issues or questions:
1. Check the error messages in the console
2. Review `kaggle_data/` directory for downloaded files
3. Verify dataset format matches expected structure
4. Check Kaggle API credentials and permissions

