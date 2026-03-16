-- Home Sensor database (PostgreSQL)
-- Run this when the Postgres container is first created (e.g. via docker-compose).

CREATE TABLE IF NOT EXISTS users (
    ID        SERIAL PRIMARY KEY,
    Email      VARCHAR(255) NOT NULL UNIQUE,
    Password   VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);



