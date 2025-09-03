#!/bin/sh
set -e

echo "Starting Caseshelf application..."

mkdir -p /app/data
chown -R nextjs:nodejs /app/data

if [ ! -f "/app/data/caseshelf.db" ]; then
    echo "Database not found, creating new database..."
    su nextjs -s /bin/sh -c "npx prisma db push"
else
    echo "Database found, running migrations..."
    su nextjs -s /bin/sh -c "npx prisma migrate deploy"
fi

echo "Starting Next.js application..."
exec su nextjs -s /bin/sh -c "npm start"