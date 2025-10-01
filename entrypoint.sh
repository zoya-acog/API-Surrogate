#!/bin/sh
set -e

DB_HOST=${DB_HOST:-apisurrogate_postgres}
DB_PORT=${DB_PORT:-5432}
TIMEOUT=${DB_TIMEOUT:-60}

echo "Waiting for Postgres at $DB_HOST:$DB_PORT..."
elapsed=0
until nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 2
  elapsed=$((elapsed+2))
  if [ $elapsed -ge $TIMEOUT ]; then
    echo "Error: Postgres did not become available within $TIMEOUT seconds."
    exit 1
  fi
done
echo "Postgres is up!"

# ✅ Only generate client, no schema changes
echo "Generating Prisma Client..."
npx prisma generate

echo "Starting app..."
exec npm run start
