CREATE TABLE sites (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(250),
    start_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    completion_percentage INT NOT NULL DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100)
);

CREATE TABLE personnel (
    id SERIAL PRIMARY KEY,
    site_id INT REFERENCES sites(id),
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    hire_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'active'
);

CREATE TABLE shifts (
    id SERIAL PRIMARY KEY,
    site_id INT REFERENCES sites(id),
    name VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

CREATE TABLE shift_assignments (
    id SERIAL PRIMARY KEY,
    shift_id INT REFERENCES shifts(id),
    personnel_id INT REFERENCES personnel(id),
    work_date DATE NOT NULL,
    check_in TIMESTAMP,
    check_out TIMESTAMP,
    status VARCHAR(30) NOT NULL DEFAULT 'scheduled'
);

CREATE TABLE machines (
    id SERIAL PRIMARY KEY,
    site_id INT REFERENCES sites(id),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    serial_number VARCHAR(100),
    purchase_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'active'
);

CREATE TABLE machine_usage_logs (
    id SERIAL PRIMARY KEY,
    machine_id INT REFERENCES machines(id),
    log_date DATE NOT NULL,
    hours_used NUMERIC(6,2) NOT NULL,
    fuel_consumed NUMERIC(6,2),
    operator_id INT REFERENCES personnel(id)
);

CREATE TABLE maintenance_records (
    id SERIAL PRIMARY KEY,
    machine_id INT REFERENCES machines(id),
    maintenance_date DATE NOT NULL,
    type VARCHAR(30) NOT NULL,
    description TEXT,
    cost NUMERIC(10,2),
    performed_by VARCHAR(150)
);

CREATE TABLE maintenance_predictions (
    id SERIAL PRIMARY KEY,
    machine_id INT REFERENCES machines(id),
    predicted_date DATE NOT NULL,
    risk_score NUMERIC(5,2) NOT NULL,
    basis TEXT,
    generated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE audits (
    id SERIAL PRIMARY KEY,
    site_id INT REFERENCES sites(id),
    inspector_id INT REFERENCES personnel(id),
    audit_date DATE NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'completed'
);

CREATE TABLE audit_findings (
    id SERIAL PRIMARY KEY,
    audit_id INT REFERENCES audits(id),
    category VARCHAR(50),
    severity VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    corrective_action TEXT,
    due_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'open'
);

CREATE TABLE materials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unit_cost NUMERIC(10,2)
);

CREATE TABLE work_orders (
    id SERIAL PRIMARY KEY,
    site_id INT REFERENCES sites(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    source_type VARCHAR(30),
    source_id INT,
    assigned_to INT REFERENCES personnel(id),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    status VARCHAR(30) NOT NULL DEFAULT 'open',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    completed_at TIMESTAMP
);

CREATE TABLE material_stocks (
    id SERIAL PRIMARY KEY,
    site_id INT REFERENCES sites(id),
    material_id INT REFERENCES materials(id),
    quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
    reorder_threshold NUMERIC(12,2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (site_id, material_id)
);

CREATE TABLE material_transactions (
    id SERIAL PRIMARY KEY,
    site_id INT REFERENCES sites(id),
    material_id INT REFERENCES materials(id),
    transaction_type VARCHAR(10) NOT NULL,
    quantity NUMERIC(12,2) NOT NULL,
    work_order_id INT REFERENCES work_orders(id),
    performed_by INT REFERENCES personnel(id),
    transaction_date TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE work_order_materials (
    id SERIAL PRIMARY KEY,
    work_order_id INT REFERENCES work_orders(id),
    material_id INT REFERENCES materials(id),
    required_quantity NUMERIC(12,2) NOT NULL
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id INT,
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    recipient_id INT REFERENCES personnel(id)
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    personnel_id INT REFERENCES personnel(id)
);
