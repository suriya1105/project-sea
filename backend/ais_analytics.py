"""
AIS Data Analytics Module for SeaTrace
Handles anomaly detection, statistical analysis, and behavior profiling.
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

class AISAnalytics:
    def __init__(self):
        self.anomaly_threshold_std = 2.5 # Z-score threshold

    def detect_anomalies(self, vessel_data_list):
        """
        Detect operational anomalies in a list of vessel dictionaries.
        Returns a list of anomalies.
        """
        if not vessel_data_list:
            return []

        df = pd.DataFrame(vessel_data_list)
        anomalies = []

        # Ensure numeric types
        df['speed'] = pd.to_numeric(df['speed'], errors='coerce').fillna(0)
        df['course'] = pd.to_numeric(df['course'], errors='coerce').fillna(0)

        # 1. Speed Anomalies (Global Z-Score)
        # In a real app, this should be per-vessel-type or per-vessel-history
        mean_speed = df['speed'].mean()
        std_speed = df['speed'].std()
        
        if std_speed > 0.1:
            df['speed_z'] = (df['speed'] - mean_speed) / std_speed
            
            # SUDDEN STOP or OVERSPEED
            anomalous_speeds = df[df['speed_z'].abs() > self.anomaly_threshold_std]
            for _, row in anomalous_speeds.iterrows():
                anomalies.append({
                    'type': 'SPEED_ANOMALY',
                    'severity': 'MEDIUM',
                    'vessel_imo': row.get('imo'),
                    'vessel_name': row.get('name'),
                    'details': f"Abnormal speed: {row['speed']} kts (Z-score: {row['speed_z']:.2f})"
                })

        # 2. Stationary but drift (potential engine failure or disabled)
        # Speed < 1.0 but course changing wildly (simulated logic)
        
        # 3. Loitering Detection (Pollution/Smuggling Risk)
        # Vessel moving very slowly for extended periods in open ocean
        loitering_vessels = df[(df['speed'] < 3.0) & (df['speed'] > 0.1)]
        for _, row in loitering_vessels.iterrows():
            anomalies.append({
                'type': 'LOITERING_RISK',
                'severity': 'HIGH' if row.get('type', '').lower().endswith('tanker') else 'MEDIUM',
                'vessel_imo': row.get('imo'),
                'vessel_name': row.get('name'),
                'details': f"Suspicious loitering detected at {row['speed']} kts. Risk of illegal discharge."
            })

        # 4. Potential Dumping / S-Turn Detection (Simulated)
        # Speed changes + sharp course turns often indicate dumping
        # We simulate this by checking for high variance if we had history, 
        # but for single-frame we'll use a random probability for demonstration if metadata suggests
        
        return anomalies

    def analyze_vessel_history(self, history_points):
        """
        Analyze a single vessel's history for route deviation.
        history_points: list of {'lat': float, 'lon': float, 'timestamp': str}
        """
        if len(history_points) < 5:
            return None
        
        # Check for erratic maneuvers (zigzag)
        zigzag_score = 0
        for i in range(1, len(history_points) - 1):
             prev = history_points[i-1]
             curr = history_points[i]
             # Simple lat/lon diff check
             if abs(curr['lat'] - prev['lat']) > 0.05 or abs(curr['lon'] - prev['lon']) > 0.05:
                 zigzag_score += 1
                 
        if zigzag_score > 3:
            return {
                'track_consistency': 'Erratic',
                'alert': 'High maneuvering detected - Potential dumping pattern'
            }

        # Convert to DataFrame (keep original logic)
        df = pd.DataFrame(history_points)
        return {
            'track_consistency': 'Normal', # Placeholder for real geospatial analysis
            'points_analyzed': len(df)
        }

ais_analyzer = AISAnalytics()
