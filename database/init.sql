-- Home Sensor database (PostgreSQL)
-- Runs once when the Postgres data volume is first created (docker-entrypoint-initdb.d).
-- If you change this file, reset the volume: docker compose down -v && docker compose up -d

CREATE TABLE IF NOT EXISTS users (
    id         SERIAL PRIMARY KEY,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    first_name    VARCHAR(100),
    last_name     VARCHAR(100),
    phone         VARCHAR(40),
    last_login_at TIMESTAMPTZ,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(40);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS devices (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name       VARCHAR(255) NOT NULL,
    device_uid VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS devices_user_id_idx ON devices (user_id);

CREATE TABLE IF NOT EXISTS sensor_readings (
    id          SERIAL PRIMARY KEY,
    device_id   INTEGER NOT NULL REFERENCES devices (id) ON DELETE CASCADE,
    sensor_type VARCHAR(64) NOT NULL,
    value       DOUBLE PRECISION NOT NULL,
    unit        VARCHAR(32),
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sensor_readings_device_time_idx
    ON sensor_readings (device_id, recorded_at DESC);

-- Test account (password: password123) — bcrypt hash generated for bcryptjs
INSERT INTO users (email, password, first_name, last_name)
VALUES (
    'test@homesense.local',
    '$2b$10$.3FKziO02YYZgzh9toi9ee6crDMbVADnF3RdQ3Xc9xPQ08Py6wyAK',
    'Test',
    'User'
)
ON CONFLICT (email) DO NOTHING;

UPDATE users
SET first_name = COALESCE(first_name, 'Test'),
    last_name = COALESCE(last_name, 'User')
WHERE email = 'test@homesense.local';

INSERT INTO devices (user_id, name, device_uid)
SELECT u.id, v.name, v.uid
FROM users u
CROSS JOIN (VALUES
    ('Attic humidity node', 'dev-attic-01'),
    ('Basement moisture', 'dev-basement-01'),
    ('Kitchen appliance health', 'dev-kitchen-01')
) AS v(name, uid)
WHERE u.email = 'test@homesense.local'
ON CONFLICT (device_uid) DO NOTHING;
