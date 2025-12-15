-- Create tables for LGIA application
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE IF NOT EXISTS tb_user (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    division VARCHAR(255),
    pass VARCHAR(255) NOT NULL,
    auth VARCHAR(50) DEFAULT 'user',
    ts TIMESTAMP DEFAULT NOW()
);

-- Layer name table
CREATE TABLE IF NOT EXISTS layer_name (
    id SERIAL PRIMARY KEY,
    formid VARCHAR(255) UNIQUE NOT NULL,
    division VARCHAR(255),
    layername VARCHAR(255),
    layertype VARCHAR(50),
    ts TIMESTAMP DEFAULT NOW()
);

-- Layer column table
CREATE TABLE IF NOT EXISTS layer_column (
    id SERIAL PRIMARY KEY,
    formid VARCHAR(255) NOT NULL,
    col_id VARCHAR(255) NOT NULL,
    col_name VARCHAR(255),
    col_type VARCHAR(50),
    col_desc TEXT
);

-- Create default admin user (password: admin123)
INSERT INTO tb_user (username, email, division, pass, auth, ts)
VALUES ('admin', 'admin@lgia.local', 'admin', '$2b$10$LH9xQhxqVkJqVkJqVkJqVO8z5qVkJqVkJqVkJqVkJqVkJqVkJq', 'admin', NOW())
ON CONFLICT (username) DO NOTHING;
