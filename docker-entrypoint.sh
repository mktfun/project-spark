#!/bin/sh
set -e
export HOME=/tmp

# Load secrets from file if using Docker Secrets (optional support)
# file_env() { ... }

echo "🚀 Tork CRM - Starting Initialization..."

# Wait for Postgres (simple check)
# In production, proper healthchecks in docker-compose are preferred, 
# but this script runs inside the container.
echo "⏳ Waiting for database connection..."
# We can just let Prisma retry or handle it, but a small sleep helps avoiding immediate crash loops
sleep 2

# Run Migrations
echo "📦 Running Database Migrations..."
npx prisma migrate deploy

# Run Seed (Idempotent)
echo "🌱 Seeding Database..."
node prisma/seed.js || echo "⚠️ Seed script failed or incomplete (ignoring non-critical errors)"

# Start Application
echo "🟢 Starting Server..."
exec node server.js
