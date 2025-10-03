#!/bin/sh
set -e

# Load environment variables from .env if it exists
if [ -f .env ]; then
  echo "Loading environment variables from .env..."
  export $(grep -v '^#' .env | xargs)
fi

# Fail if POSTGRES_CONTAINER_NAME is not set
if [ -z "$POSTGRES_CONTAINER_NAME" ]; then
  echo "Error: DB_HOST is not set in .env"
  exit 1
fi

DB_PORT=${DB_PORT:-5432}
TIMEOUT=${DB_TIMEOUT:-60}

echo "Waiting for Postgres at $POSTGRES_CONTAINER_NAME:$DB_PORT..."
elapsed=0
until nc -z "$POSTGRES_CONTAINER_NAME" "$DB_PORT"; do
  sleep 2
  elapsed=$((elapsed+2))
  if [ $elapsed -ge $TIMEOUT ]; then
    echo "Error: Postgres did not become available within $TIMEOUT seconds."
    exit 1
  fi
done
echo "Postgres is up!"

echo "Generating Prisma Client..."
npx prisma generate

echo "Starting app..."
exec npm run start
