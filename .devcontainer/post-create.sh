#!/bin/bash
workflow_name="Run Analysis"

echo "Get info on latest GitHub Actions run..."
run_id=$(gh run list -w "$workflow_name" -L 1 --json databaseId | jq '.[]| .databaseId')

echo "GitHub Actions latest runId: $run_id"

echo "Download artifacts..."
gh run download $run_id -D $(pwd)/pgdata

echo "Starting database restore..."
touch ~/.pgpass
echo "postgres:5432:mergestat:postgres:postgres" > ~/.pgpass
chmod 0600 ~/.pgpass

pg_restore -h postgres -U postgres -d mergestat --clean -x --no-owner $(pwd)/pgdata/pg-dump/backup_mergestat.dump 