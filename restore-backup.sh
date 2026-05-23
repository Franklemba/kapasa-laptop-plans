#!/bin/bash

# Script to restore Supabase backup properly
# This script filters out role/password conflicts and restores only the database content

BACKUP_FILE="db_cluster-29-07-2025@19-51-46.backup"
FILTERED_BACKUP="filtered_backup.sql"

echo "Creating filtered backup file..."

# Extract only the postgres database content (skip roles and template1)
sed -n '/\\connect postgres/,$p' "$BACKUP_FILE" > "$FILTERED_BACKUP"

echo "Starting Supabase..."
supabase db reset --db-url postgresql://postgres:postgres@127.0.0.1:54322/postgres || supabase start

echo "Waiting for database to be ready..."
sleep 5

echo "Restoring database..."
docker exec -i supabase_db_kapasa-laptop-plans psql -U postgres -d postgres < "$FILTERED_BACKUP"

echo "Restoration complete!"
echo "Checking tables..."
docker exec supabase_db_kapasa-laptop-plans psql -U postgres -d postgres -c "SELECT schemaname, tablename FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema') ORDER BY schemaname, tablename LIMIT 20;"
