import os
import sys

# Ensure root directory is on python path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.server import start_server

if __name__ == "__main__":
    start_server()
