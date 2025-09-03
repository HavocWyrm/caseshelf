#!/bin/sh
set -e

echo "Starting Caseshelf application..."

mkdir -p /app/data

if [ ! -f "/app/data/caseshelf.db" ]; then
    echo "Database not found, creating new database..."
    npx prisma db push
else
    echo "Database found, running migrations..."
    npx prisma migrate deploy
fi

echo "Starting Next.js application..."
npm start