#!/bin/bash
set -e

echo "=== Initializing TCS WorkforceGuard AI ==="

# Check Node
if [ -d "$HOME/.nvm/versions/node/v20.20.2/bin" ]; then
  export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"
fi

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# 1. Setup Backend Python Virtualenv
echo "Setting up Backend Virtual Environment..."
cd "$ROOT_DIR/backend"
if [ ! -d "venv" ]; then
  python3 -m venv venv
fi
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 2. Generate Benchmark Dataset if missing
cd "$ROOT_DIR"
if [ ! -f "data/sample/tcs_workforce_benchmark.csv" ]; then
  echo "Generating synthetic TCS Workforce Benchmark Dataset (1,470 records)..."
  python3 data/sample/generate_benchmark_data.py
fi

# 3. Setup Frontend
echo "Setting up Frontend Next.js Dependencies..."
cd "$ROOT_DIR/frontend"
npm install

echo "=== Setup Completed Successfully ==="
