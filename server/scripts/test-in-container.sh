#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="docker-compose.test.yml"
SERVICE_NAME="test-db"

# 1. Start Postgres
echo "[test-e2e] Starting Postgres via docker compose..."
docker compose -f "$COMPOSE_FILE" up -d "$SERVICE_NAME"

# 2. Wait for Postgres to be healthy
echo "[test-e2e] Waiting for Postgres to be ready..."
for i in {1..30}; do
  if docker compose -f "$COMPOSE_FILE" exec -T "$SERVICE_NAME" pg_isready -U app -d app_test > /dev/null 2>&1; then
    echo "[test-e2e] Postgres is ready."
    break
  fi
  echo "[test-e2e] Still waiting for Postgres... ($i/30)"
  sleep 1
done

# Optional: final check to fail fast if DB never came up
if ! docker compose -f "$COMPOSE_FILE" exec -T "$SERVICE_NAME" pg_isready -U app -d app_test > /dev/null 2>&1; then
  echo "[test-e2e] ERROR: Postgres did not become ready in time."
  docker compose -f "$COMPOSE_FILE" logs "$SERVICE_NAME" || true
  docker compose -f "$COMPOSE_FILE" down -v || true
  exit 1
fi

# 3. Export DB env vars so your app/tests pick them up
export DATABASE_URL="postgres://app:password@localhost:5433/app_test"
export PGHOST="localhost"
export PGPORT="5433"
export PGUSER="app"
export PGPASSWORD="password"
export PGDATABASE="app_test"

# 5. Run the e2e tests serially (each file gets its own DB schema)
echo "[test-e2e] Running e2e tests..."
TEST_EXIT_CODE=0
for f in test/*.e2e-spec.ts; do
  echo "[test-e2e] Running $f..."
  if ! bun test "./$f" --timeout 50000; then
    TEST_EXIT_CODE=1
    echo "[test-e2e] FAILED: $f"
    break
  fi
done

# 6. Tear down Postgres
echo "[test-e2e] Stopping Postgres and cleaning up..."
docker compose -f "$COMPOSE_FILE" down -v

# 7. Exit with the same code as the tests
exit $TEST_EXIT_CODE
