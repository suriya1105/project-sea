# Kaggle AIS Integration - Setup Summary

## ✅ What Was Added

### 1. **Dependencies** (`backend/requirements.txt`)
- Added `kaggle==1.5.16` - Kaggle API client
- Added `pandas==2.1.4` - Data processing
- Added `numpy==1.24.3` - Numerical operations

### 2. **Core Modules**

#### `backend/kaggle_ais_processor.py`
- Main processor for downloading and transforming Kaggle AIS data
- Features:
  - Downloads datasets from Kaggle
  - Loads and processes CSV files
  - Transforms AIS data to SeaTrace vessel format
  - Filters by geographic region
  - Handles various column name formats automatically

#### `backend/kaggle_config.py`
- Configuration file for:
  - Kaggle dataset names
  - Region filtering (default: Indian Ocean)
  - Update intervals

#### `backend/sync_kaggle_data.py`
- Standalone script to sync data manually
- Can be run from command line

### 3. **API Endpoints** (`backend/app.py`)

#### `POST /api/kaggle/sync`
- Admin-only endpoint to sync Kaggle data
- Runs in background thread
- Returns immediately with status

#### `GET /api/kaggle/status`
- Check Kaggle integration status
- View configured datasets and region filters

### 4. **Documentation**
- `KAGGLE_INTEGRATION.md` - Complete integration guide
- Setup instructions, troubleshooting, examples

## 🚀 Quick Start

### Step 1: Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Set Up Kaggle API
1. Go to https://www.kaggle.com/settings
2. Click "Create New API Token"
3. Save `kaggle.json` to:
   - **Linux/Mac**: `~/.kaggle/kaggle.json`
   - **Windows**: `C:\Users\<YourUsername>\.kaggle\kaggle.json`
4. Set permissions (Linux/Mac): `chmod 600 ~/.kaggle/kaggle.json`

### Step 3: Configure Dataset
Edit `backend/kaggle_config.py`:
```python
KAGGLE_DATASETS = {
    'default': 'username/dataset-name',  # Replace with your dataset
}
```

### Step 4: Run Sync
```bash
cd backend
python sync_kaggle_data.py
```

Or use the API endpoint (requires admin token):
```bash
curl -X POST http://localhost:5000/api/kaggle/sync \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

## 📋 Features

### Automatic Column Detection
The processor automatically detects common AIS column names:
- IMO, MMSI, VesselName, LAT, LON, SOG, COG, etc.
- Works with various dataset formats

### Region Filtering
Default: Indian Ocean region (5°N-25°N, 65°E-100°E)
- Customizable in `kaggle_config.py`
- Reduces processing time
- Focuses on relevant vessels

### Data Transformation
- Maps AIS data to SeaTrace format
- Estimates missing fields (DWT, compliance ratings)
- Assigns vessel types and risk levels
- Generates company names from vessel names

### Background Processing
- API sync runs in background thread
- Non-blocking - returns immediately
- Updates data automatically when complete

## 🔧 Configuration

### Region Filter
Edit `backend/kaggle_config.py`:
```python
REGION_FILTER = {
    'lat_min': 5.0,   # Southern boundary
    'lat_max': 25.0,  # Northern boundary
    'lon_min': 65.0,  # Western boundary
    'lon_max': 100.0  # Eastern boundary
}
```

### Multiple Datasets
```python
KAGGLE_DATASETS = {
    'default': 'username/dataset-1',
    'historical': 'username/dataset-2',
    'realtime': 'username/dataset-3',
}
```

## 📊 Data Flow

1. **Download** → Kaggle dataset downloaded to `kaggle_data/`
2. **Load** → CSV files loaded into pandas DataFrame
3. **Filter** → Filtered by geographic region
4. **Transform** → Converted to SeaTrace vessel format
5. **Save** → Saved to `data/vessels.json`
6. **Reload** → Data manager reloads updated data
7. **Broadcast** → Real-time updates sent to connected clients

## 🎯 Next Steps

1. **Find a Kaggle AIS Dataset**:
   - Search Kaggle for "AIS" or "vessel tracking"
   - Look for datasets with columns: IMO, MMSI, LAT, LON, SOG, COG

2. **Update Configuration**:
   - Edit `kaggle_config.py` with your dataset name
   - Adjust region filter if needed

3. **Test the Integration**:
   - Run `python sync_kaggle_data.py`
   - Check `data/vessels.json` for results
   - View vessels in SeaTrace dashboard

4. **Set Up Automation** (Optional):
   - Create cron job or scheduled task
   - Sync data periodically (daily/weekly)

## ⚠️ Important Notes

- **Kaggle API Required**: You need valid Kaggle credentials
- **Dataset Format**: Works best with CSV files containing AIS data
- **Region Filter**: Adjust based on your monitoring area
- **Data Quality**: Review processed vessels to ensure accuracy
- **Performance**: Large datasets may take time to process

## 🐛 Troubleshooting

See `KAGGLE_INTEGRATION.md` for detailed troubleshooting guide.

Common issues:
- "Kaggle API not available" → Check `kaggle.json` location
- "No CSV files found" → Verify dataset format
- "No vessels processed" → Check region filter and data quality

## 📚 Additional Resources

- Full documentation: `KAGGLE_INTEGRATION.md`
- Kaggle API docs: https://github.com/Kaggle/kaggle-api
- Kaggle datasets: https://www.kaggle.com/datasets

---

**Integration Complete!** 🎉

Your SeaTrace system is now ready to use real AIS data from Kaggle!

