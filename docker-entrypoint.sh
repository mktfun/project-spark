#!/bin/sh
set -e
export HOME=/tmp

echo "🚀 Tork CRM - Starting Initialization..."

echo "🟢 Starting Server..."
exec node server.js
