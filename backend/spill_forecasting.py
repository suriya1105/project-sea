"""
Advanced Spill Forecasting Module
Uses environmental data to predict plume trajectory and weathering.
"""
import math
import random
from datetime import datetime, timedelta

class SpillForecaster:
    def __init__(self):
        pass

    def run_simulation(self, spill_initial_state, env_conditions, duration_hours=24):
        """
        Run a deterministic physics-based simulation.
        spill_initial_state: {'lat', 'lon', 'size_tons'}
        env_conditions: {'wind_speed', 'wind_dir', 'current_speed', 'current_dir'}
        """
        path = []
        current_lat = float(spill_initial_state['lat'])
        current_lon = float(spill_initial_state['lon'])
        
        # Coefficients
        WIND_DRIFT_FACTOR = 0.035
        CURRENT_DRIFT_FACTOR = 1.0
        SPREAD_RATE = 0.1 # km/hr^0.5

        w_spd = float(env_conditions.get('wind_speed', 10))
        w_dir = float(env_conditions.get('wind_dir', 0))
        c_spd = float(env_conditions.get('current_speed', 1))
        c_dir = float(env_conditions.get('current_dir', 90))

        # Vectors (m/s approximation)
        # 1 kt = 0.514 m/s
        
        total_drift_x_nm = 0
        total_drift_y_nm = 0
        
        # Calculate drift per hour in Nautical Miles
        # Wind vector
        w_drift_nm = w_spd * WIND_DRIFT_FACTOR
        w_dx = w_drift_nm * math.sin(math.radians(w_dir))
        w_dy = w_drift_nm * math.cos(math.radians(w_dir))
        
        # Current vector
        c_drift_nm = c_spd * CURRENT_DRIFT_FACTOR
        c_dx = c_drift_nm * math.sin(math.radians(c_dir))
        c_dy = c_drift_nm * math.cos(math.radians(c_dir))

        hourly_dx_nm = w_dx + c_dx
        hourly_dy_nm = w_dy + c_dy
        
        # 1 NM approx 0.0166 degrees Lat
        deg_per_nm = 1/60.0
        
        hourly_dlat = hourly_dy_nm * deg_per_nm
        # Longitude correction (cos lat)
        hourly_dlon = (hourly_dx_nm * deg_per_nm) / math.cos(math.radians(current_lat))

        for h in range(duration_hours + 1):
            path.append({
                'timestamp': (datetime.utcnow() + timedelta(hours=h)).isoformat(),
                'lat': current_lat,
                'lon': current_lon,
                'radius_km': 0.5 + (SPREAD_RATE * (h**0.6)),
                'mass_remaining_pct': max(0, 100 - (h * 1.5)) # Simple weathering
            })
            
            # Step
            current_lat += hourly_dlat
            current_lon += hourly_dlon

        return path

spill_forecaster = SpillForecaster()
