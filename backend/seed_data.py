"""
Database Seed Script
====================
Run this script ONCE to initialize:
  1. Default hardware sets (fixed lab inventory)
  2. admin       — hardware admin (password: admin1234)
  3. superadmin  — super admin, can view all users & passwords (password: 000000)

Usage:
    cd backend
    source ../.venv/bin/activate
    python seed_data.py

To wipe everything and re-seed from scratch, pass --reset:
    python seed_data.py --reset
"""

import sys
from pymongo import MongoClient
from datetime import datetime
import config

client = MongoClient(config.MONGO_URI)
db = client[config.DATABASE_NAME]
hardware_collection = db[config.HARDWARE_COLLECTION]
users_collection    = db[config.USERS_COLLECTION]
projects_collection = db[config.PROJECTS_COLLECTION]

# ============================================================================
# Default hardware inventory — edit this list to change lab resources
# ============================================================================
DEFAULT_HARDWARE = [
    {'hw_name': 'A100 GPU Node',  'total_capacity': 10, 'description': 'NVIDIA A100 80GB GPU compute node'},
    {'hw_name': 'H100 GPU Node',  'total_capacity':  4, 'description': 'NVIDIA H100 SXM5 GPU compute node'},
    {'hw_name': 'Arduino Uno',    'total_capacity': 30, 'description': 'Arduino Uno R3 microcontroller board'},
    {'hw_name': 'Raspberry Pi 4', 'total_capacity': 20, 'description': 'Raspberry Pi 4 Model B (4GB RAM)'},
    {'hw_name': 'FPGA Board',     'total_capacity': 15, 'description': 'Xilinx Artix-7 FPGA development board'},
    {'hw_name': 'Oscilloscope',   'total_capacity':  8, 'description': '4-channel 200MHz digital oscilloscope'},
]

# ============================================================================
# Built-in accounts
# ============================================================================
BUILTIN_USERS = [
    {
        'username': 'admin',
        'password': 'admin1234',
        'role':     'admin',
        'note':     'Hardware admin — can create/delete hardware sets',
    },
    {
        'username': 'superadmin',
        'password': '000000',
        'role':     'superadmin',
        'note':     'Super admin — can view all users and their passwords',
    },
]


def seed_hardware(reset=False):
    if reset:
        hardware_collection.delete_many({})
        print('  Cleared hardware collection.')

    created = skipped = 0
    for hw in DEFAULT_HARDWARE:
        if hardware_collection.find_one({'hw_name': hw['hw_name']}):
            print(f"  [skip] {hw['hw_name']} already exists")
            skipped += 1
            continue
        hardware_collection.insert_one({
            **hw,
            'available':   hw['total_capacity'],
            'checked_out': 0,
            'created_at':  datetime.utcnow(),
            'updated_at':  datetime.utcnow(),
        })
        print(f"  [ok]   {hw['hw_name']}  (capacity: {hw['total_capacity']})")
        created += 1
    print(f'  → {created} created, {skipped} skipped.\n')


def seed_users(reset=False):
    if reset:
        users_collection.delete_many({})
        projects_collection.delete_many({})
        print('  Cleared users and projects collections.')

    for u in BUILTIN_USERS:
        existing = users_collection.find_one({'username': u['username']})
        if existing:
            if existing.get('role') != u['role']:
                users_collection.update_one(
                    {'username': u['username']},
                    {'$set': {'role': u['role']}}
                )
                print(f"  [ok]   Updated role for \"{u['username']}\" → {u['role']}")
            else:
                print(f"  [skip] \"{u['username']}\" already exists ({u['role']})")
            continue

        users_collection.insert_one({
            'username':   u['username'],
            'password':   u['password'],
            'role':       u['role'],
            'projects':   [],
            'created_at': datetime.utcnow(),
            'last_login': None,
        })
        print(f"  [ok]   Created \"{u['username']}\"  password={u['password']}  role={u['role']}")
        print(f"         {u['note']}")
    print()


if __name__ == '__main__':
    reset = '--reset' in sys.argv

    if reset:
        print('=== RESET MODE: wiping database ===')

    print('=== Seeding hardware sets ===')
    seed_hardware(reset=reset)

    print('=== Seeding built-in users ===')
    seed_users(reset=reset)

    print('Done.')
    print('  admin       password: admin1234  (hardware admin)')
    print('  superadmin  password: 000000     (super admin, can view all passwords)')
