#!/bin/bash

# Variables (replace with your actual values or export these as environment variables)
DB_USER=${DB_USER:-"your_db_user"}
DB_PASSWORD=${DB_PASSWORD:-"your_db_password"}
DB_NAME=${DB_NAME:-"your_db_name"}
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-5432}

# SQL commands for creating the database and tables
SQL_COMMANDS=$(cat <<EOF
CREATE DATABASE $DB_NAME;

\c $DB_NAME;

-- Table for users
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    organisation VARCHAR(255),
    role VARCHAR(50) CHECK (role IN ('user', 'admin', 'owner'))
);

-- Table for applications
CREATE TABLE applications (
    application_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    secret VARCHAR(255) NOT NULL,
    organisation VARCHAR(255) NOT NULL,
    user_id INT REFERENCES users(user_id)
);

-- Table for dictionaries
CREATE TABLE dictionaries (
    dictionary_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    data JSONB NOT NULL
);

-- Table for logs
CREATE TABLE logs (
    log_id SERIAL PRIMARY KEY,
    dict_name VARCHAR(255) REFERENCES dictionaries(name),
    type VARCHAR(255),
    data JSONB NOT NULL,
    path TEXT NOT NULL,
    application_name VARCHAR(255),
    organisation_name VARCHAR(255)
);
EOF
)

# Export password so it's accessible for the psql command
export PGPASSWORD=$DB_PASSWORD

# Create the database and tables
echo "Creating database and tables..."

psql -U $DB_USER -h $DB_HOST -p $DB_PORT -c "$SQL_COMMANDS"

if [ $? -eq 0 ]; then
    echo "Database and tables created successfully."
else
    echo "Error creating the database or tables."
fi
