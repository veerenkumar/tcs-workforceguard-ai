#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Ensure Node v20 path if nvm is installed
if [ -d "$HOME/.nvm/versions/node/v20.20.2/bin" ]; then
  export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"
fi

echo "Starting TCS WorkforceGuard AI Services..."

cleanup() {
  echo "Shutting down servers..."
  kill $(jobs -p) 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Start Backend FastAPI
echo "Starting FastAPI Backend on http://localhost:8000..."
cd "$ROOT_DIR/backend"
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait for backend health check
echo "Waiting for FastAPI to become ready..."
for i in {1..30}; do
  if curl -s http://localhost:8000/api/v1/health >/dev/null; then
    echo "Backend is live!"
    break
  fi
  sleep 1
done

# Start Frontend Next.js
echo "Starting Next.js Frontend on http://localhost:3000..."
cd "$ROOT_DIR/frontend"
export NEXT_PUBLIC_API_BASE_URL="http://localhost:8000/api/v1"
npm run dev &
FRONTEND_PID=$!

wait
