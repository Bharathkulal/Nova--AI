"""
Simple SQLite database wrapper for NOVA CLI
Creates `users` and `chats` tables and provides helper methods.
"""
import sqlite3
import os
import hashlib
from datetime import datetime

class Database:
    def __init__(self, path=None):
        base = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
        default = os.path.join(base, 'nova.db') if path is None else path
        self.path = os.path.abspath(default)
        self.conn = sqlite3.connect(self.path, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self.init_db()

    def init_db(self):
        cur = self.conn.cursor()
        cur.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                is_admin INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        ''')
        cur.execute('''
            CREATE TABLE IF NOT EXISTS chats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                username TEXT,
                prompt TEXT,
                response TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        ''')
        cur.execute('''
            CREATE TABLE IF NOT EXISTS user_profile (
                key TEXT PRIMARY KEY,
                value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        ''')
        cur.execute('''
            CREATE TABLE IF NOT EXISTS facts (
                fact_key TEXT PRIMARY KEY,
                fact_val TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        ''')
        self.conn.commit()

        # Seed default profile value for username if empty
        cur.execute('SELECT COUNT(*) AS c FROM user_profile WHERE key = "name"')
        if cur.fetchone()['c'] == 0:
            cur.execute('INSERT OR REPLACE INTO user_profile (key, value) VALUES ("name", "Bharath")')
            self.conn.commit()

        cur.execute('SELECT COUNT(*) AS c FROM users')
        row = cur.fetchone()
        count = row['c'] if row else 0
        if count == 0:
            self.seed_sample_data()

    def hash_password(self, username, password):
        # simple deterministic hash (for demo). Use proper salted hashing in production.
        s = (username + '|' + password).encode('utf-8')
        return hashlib.sha256(s).hexdigest()

    def create_user(self, username, password, is_admin=False):
        h = self.hash_password(username, password)
        cur = self.conn.cursor()
        try:
            cur.execute('INSERT INTO users (username,password_hash,is_admin) VALUES (?,?,?)', (username,h, int(is_admin)))
            self.conn.commit()
            return cur.lastrowid
        except sqlite3.IntegrityError:
            return None

    def authenticate(self, username, password):
        h = self.hash_password(username, password)
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM users WHERE username = ? AND password_hash = ?', (username,h))
        row = cur.fetchone()
        return dict(row) if row else None

    def add_chat(self, user_id, username, prompt, response):
        cur = self.conn.cursor()
        cur.execute('INSERT INTO chats (user_id, username, prompt, response) VALUES (?,?,?,?)', (user_id, username, prompt, response))
        self.conn.commit()
        return cur.lastrowid

    def get_recent_chats(self, limit=10):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM chats ORDER BY created_at DESC LIMIT ?', (limit,))
        rows = cur.fetchall()
        return [dict(r) for r in rows]

    def get_stats(self):
        cur = self.conn.cursor()
        cur.execute('SELECT COUNT(*) as total_users FROM users')
        total_users = cur.fetchone()['total_users']
        cur.execute('SELECT COUNT(*) as total_chats FROM chats')
        total_chats = cur.fetchone()['total_chats']
        return {'total_users': total_users, 'total_chats': total_chats}

    def seed_sample_data(self):
        # Seed an admin and guest user plus example chats
        self.create_user('admin', 'adminpass', is_admin=True)
        self.create_user('guest', 'guest')
        self.add_chat(1, 'admin', 'Welcome to NOVA AI', 'Welcome! This is a seeded conversation.')
        self.add_chat(2, 'guest', 'Hello NOVA', 'Hello guest! I am NOVA AI.')

    def get_profile_value(self, key, default=None):
        cur = self.conn.cursor()
        cur.execute('SELECT value FROM user_profile WHERE key = ?', (key,))
        row = cur.fetchone()
        return row['value'] if row else default

    def set_profile_value(self, key, value):
        cur = self.conn.cursor()
        cur.execute('INSERT OR REPLACE INTO user_profile (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)', (key, str(value)))
        self.conn.commit()

    def save_fact(self, key, value):
        cur = self.conn.cursor()
        cur.execute('INSERT OR REPLACE INTO facts (fact_key, fact_val, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)', (key, str(value)))
        self.conn.commit()

    def get_fact(self, key):
        cur = self.conn.cursor()
        cur.execute('SELECT fact_val FROM facts WHERE fact_key = ?', (key,))
        row = cur.fetchone()
        return row['fact_val'] if row else None

    def get_all_facts(self):
        cur = self.conn.cursor()
        cur.execute('SELECT fact_key, fact_val FROM facts')
        rows = cur.fetchall()
        return {r['fact_key']: r['fact_val'] for r in rows}
