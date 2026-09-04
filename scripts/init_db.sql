-- Gemelo Digital de Infraestructura Verde Urbana
-- Database Initialization Script
-- Run this script as postgres user: sudo -u postgres psql -f scripts/init_db.sql

-- Create database
DROP DATABASE IF EXISTS bd_gemelodigital;
CREATE DATABASE bd_gemelodigital OWNER postgres;

-- Connect to the database
\c bd_gemelodigital

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "postgis";
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'PostGIS extension not installed in PostgreSQL, skipping PostGIS extension.';
END $$;
-- TimescaleDB is not available on Windows by default
-- Uncomment the following line if using Linux with TimescaleDB installed:
-- CREATE EXTENSION IF NOT EXISTS "timescaledb";

-- Create tables (these will be managed by Alembic, but we create initial structure)
-- Note: In production, use Alembic migrations instead of this script

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'visitor' CHECK (role IN ('admin', 'researcher', 'visitor')),
    institution VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location_name VARCHAR(255),
    bounds_geojson JSONB,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Green Infrastructure table
CREATE TABLE IF NOT EXISTS green_infrastructure (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    geometry JSONB,
    type VARCHAR(50) CHECK (type IN ('tree', 'shrub', 'grass', 'green_roof', 'vertical_garden', 'rain_garden')),
    species VARCHAR(255),
    height_meters DECIMAL(10, 2),
    crown_diameter_meters DECIMAL(10, 2),
    leaf_area_index DECIMAL(5, 2),
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scenarios table
CREATE TABLE IF NOT EXISTS scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    vegetation_config JSONB DEFAULT '{}',
    surfaces_config JSONB DEFAULT '{}',
    buildings_config JSONB DEFAULT '{}',
    climate_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Simulations table
CREATE TABLE IF NOT EXISTS simulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    progress_percent INTEGER DEFAULT 0,
    duration_hours INTEGER,
    envi_met_input_path VARCHAR(512),
    envi_met_output_path VARCHAR(512),
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Simulation Results table (hypertable for time-series data)
CREATE TABLE IF NOT EXISTS simulation_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    simulation_id UUID REFERENCES simulations(id) ON DELETE CASCADE,
    time TIMESTAMP WITH TIME ZONE NOT NULL,
    temperature DECIMAL(10, 2),
    humidity DECIMAL(10, 2),
    wind_speed DECIMAL(10, 2),
    wind_direction DECIMAL(10, 2),
    pet DECIMAL(10, 2),
    radiation DECIMAL(10, 2),
    surface_temperature DECIMAL(10, 2),
    thermal_comfort_index DECIMAL(5, 2),
    runoff_coefficient DECIMAL(5, 2),
    biodiversity_index DECIMAL(5, 2),
    spatial_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Convert simulation_results to TimescaleDB hypertable (Linux only)
-- Uncomment the following line if using Linux with TimescaleDB installed:
-- SELECT create_hypertable('simulation_results', 'time', if_not_exists => TRUE);

-- Create spatial index on green_infrastructure (if PostGIS is active)
DO $$
BEGIN
    CREATE INDEX IF NOT EXISTS idx_green_infrastructure_geometry ON green_infrastructure USING GIST(geometry);
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'GIST index on geometry skipped.';
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_is_public ON projects(is_public);
CREATE INDEX IF NOT EXISTS idx_green_infrastructure_project ON green_infrastructure(project_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_project ON scenarios(project_id);
CREATE INDEX IF NOT EXISTS idx_simulations_scenario ON simulations(scenario_id);
CREATE INDEX IF NOT EXISTS idx_simulations_user ON simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_simulations_status ON simulations(status);
CREATE INDEX IF NOT EXISTS idx_simulation_results_simulation ON simulation_results(simulation_id);
CREATE INDEX IF NOT EXISTS idx_simulation_results_time ON simulation_results(time DESC);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    simulation_id UUID REFERENCES simulations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    format VARCHAR(20) CHECK (format IN ('pdf', 'word', 'excel')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
    content_config JSONB DEFAULT '{}',
    data_selection JSONB DEFAULT '{}',
    comparison_scenario_id UUID REFERENCES scenarios(id),
    file_path VARCHAR(512),
    file_size_bytes BIGINT,
    generated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for reports
CREATE INDEX IF NOT EXISTS idx_reports_simulation ON reports(simulation_id);
CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- Insert default admin user (password: admin123 - change this in production!)
-- Password hash for 'admin123' (bcrypt)
INSERT INTO users (email, hashed_password, full_name, role, is_active, is_verified)
VALUES ('admin@gemelodigital.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7vGyYq7y6i', 'System Administrator', 'admin', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Create read-only user for API (optional - configure as needed)
-- CREATE USER gemelo_api WITH PASSWORD 'secure_password';
-- GRANT CONNECT ON DATABASE gemelo_digital TO gemelo_api;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO gemelo_api;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed successfully!';
    RAISE NOTICE 'Default admin user: admin@gemelodigital.com / admin123';
    RAISE NOTICE 'Please change the default password immediately!';
END $$;
