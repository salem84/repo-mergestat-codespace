#!/bin/bash
workflow_name="Run Analysis"

# Set the variable with the path to the pg_isready command
PG_ISREADY_CMD="/usr/bin/pg_isready -h postgres"
# Set the maximum number of retries for check postgres
MAX_RETRIES=10
# Set the delay between retries (in seconds) for check postgres
RETRY_DELAY=5

# Function to check if PostgreSQL is ready
check_postgres_ready() {
  retries=0
  while true; do
    if $PG_ISREADY_CMD >/dev/null 2>&1; then
      echo "PostgreSQL is ready!"
      break
    else
      retries=$((retries+1))
      if [ $retries -ge $MAX_RETRIES ]; then
        echo "Max retries exceeded. PostgreSQL is not ready."
        exit 1
      fi
      echo "Waiting for PostgreSQL to be ready... Retry $retries"
      sleep $RETRY_DELAY
    fi
  done
}


echo "Get info on latest GitHub Actions run..."
run_id=$(gh run list -w "$workflow_name" -L 1 --json databaseId | jq '.[]| .databaseId')

echo "GitHub Actions latest runId: $run_id"

echo "Download artifacts..."
gh run download $run_id -D $(pwd)/pgdata

check_postgres_ready

echo "Starting database restore..."
touch ~/.pgpass
echo "postgres:5432:mergestat:postgres:postgres" > ~/.pgpass
chmod 0600 ~/.pgpass

pg_restore -h postgres -U postgres -d mergestat --clean -x --no-owner $(pwd)/pgdata/pg-dump/backup_mergestat.dump 