import os
import json

with open(os.path.join(os.path.dirname(__file__), 'dummy.json'), 'r') as f:
    print(f.read())
