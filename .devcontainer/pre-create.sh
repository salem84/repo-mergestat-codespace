#!/bin/bash
workflow_name="Run Analysis"

mkdir $(pwd)/pgdata
touch $(pwd)/pgdata/leggimi.txt 

echo "Get info on latest GitHub Actions run..."
run_id=$(gh run list -w "$workflow_name" -L 1 --json databaseId | jq '.[]| .databaseId')

echo "GitHub Actions latest runId: $run_id"

echo "Download artifacts..."
gh run download $run_id -D $(pwd)/pgdata



