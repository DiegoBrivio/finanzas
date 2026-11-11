#!/usr/bin/env bash
set -e

# Directorio del proyecto
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Priorizar el Node embebido que resuelve el problema de libsimdjson
export PATH="$DIR/.node/bin:$PATH"

echo "✅ Entorno listo (Node $(node -v) / npm $(npm -v))"
echo "🚀 Levantando servidor web en http://localhost:3000..."

cd "$DIR/frontend"
npm run dev -- --host
