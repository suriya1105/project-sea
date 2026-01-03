"""
SeaTrace Data Manager
Handles persistent storage of application data using JSON files
"""

import json
import os
import threading
from datetime import datetime
from pathlib import Path

class DataManager:
    def __init__(self, data_dir="data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        self.lock = threading.Lock()

        # Data file paths
        self.vessels_file = self.data_dir / "vessels.json"
        self.oil_spills_file = self.data_dir / "oil_spills.json"
        self.marine_strikes_file = self.data_dir / "marine_strikes.json"
        self.users_file = self.data_dir / "users.json"
        self.credentials_file = self.data_dir / "credentials.json"
        self.audit_logs_file = self.data_dir / "audit_logs.json"
        self.company_users_file = self.data_dir / "company_users.json"

        # Initialize data structures
        self._load_all_data()

    def _load_json_file(self, file_path, default=None):
        """Load data from JSON file with error handling"""
        if default is None:
            default = {}

        try:
            if file_path.exists():
                with open(file_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            else:
                # Create file with default data
                self._save_json_file(file_path, default)
                return default
        except (json.JSONDecodeError, IOError) as e:
            print(f"Error loading {file_path}: {e}")
            return default

    def _save_json_file(self, file_path, data):
        """Save data to JSON file with error handling"""
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except IOError as e:
            print(f"Error saving {file_path}: {e}")

    def _load_all_data(self):
        """Load all data from files"""
        self.vessels = self._load_json_file(self.vessels_file, {})
        self.oil_spills = self._load_json_file(self.oil_spills_file, {})
        self.users = self._load_json_file(self.users_file, {})
        self.credentials = self._load_json_file(self.credentials_file, {})
        self.audit_logs = self._load_json_file(self.audit_logs_file, [])
        self.company_users = self._load_json_file(self.company_users_file, {})
        self.marine_strikes = self._load_json_file(self.marine_strikes_file, [])

    def save_all_data(self):
        """Save all data to files"""
        with self.lock:
            self._save_json_file(self.vessels_file, self.vessels)
            self._save_json_file(self.oil_spills_file, self.oil_spills)
            self._save_json_file(self.users_file, self.users)
            self._save_json_file(self.credentials_file, self.credentials)
            self._save_json_file(self.audit_logs_file, self.audit_logs)
            self._save_json_file(self.company_users_file, self.company_users)
            self._save_json_file(self.marine_strikes_file, self.marine_strikes)

    # User operations
    def get_users(self):
        """Get all users"""
        with self.lock:
            return self.users

    def get_user(self, email):
        """Get user by email"""
        with self.lock:
            return self.users.get(email)

    def add_user(self, email, user_data):
        """Add new user"""
        with self.lock:
            self.users[email] = user_data
            self._save_json_file(self.users_file, self.users)

    def update_user(self, email, updates):
        """Update existing user"""
        with self.lock:
            if email in self.users:
                self.users[email].update(updates)
                self._save_json_file(self.users_file, self.users)
                return self.users[email]
            return None

    def delete_user(self, email):
        """Delete user"""
        with self.lock:
            if email in self.users:
                del self.users[email]
                self._save_json_file(self.users_file, self.users)
                return True
            return False

    def get_next_user_id(self):
        """Generate next user ID"""
        with self.lock:
            if not self.users:
                return 1
            ids = [user.get('id', 0) for user in self.users.values()]
            return max(ids) + 1

    # ... (Keep existing methods)

    # Audit log operations
    def add_audit_log(self, log_entry):
        """Add audit log entry"""
        with self.lock:
            # Add timestamp if not provided
            if 'timestamp' not in log_entry:
                log_entry['timestamp'] = datetime.now().isoformat()

            self.audit_logs.append(log_entry)

            # Keep only last 1000 entries
            if len(self.audit_logs) > 1000:
                self.audit_logs = self.audit_logs[-1000:]

            self._save_json_file(self.audit_logs_file, self.audit_logs)

    def get_audit_logs(self):
        with self.lock:
            return self.audit_logs

    def get_marine_strikes(self):
        """Get list of marine strikes"""
        with self.lock:
            return self.marine_strikes

    def get_user_audit_logs(self, email, limit=50):
        """Get audit logs for specific user"""
        with self.lock:
            user_logs = [log for log in self.audit_logs if log.get('user_email') == email]
            return user_logs[-limit:]

    # Company operations
    def get_company_users(self, company):
        """Get users for a company"""
        with self.lock:
            return self.company_users.get(company, [])

    def get_companies(self):
        """Get all companies"""
        with self.lock:
            return list(self.company_users.keys())

# Global data manager instance
data_manager = DataManager()
