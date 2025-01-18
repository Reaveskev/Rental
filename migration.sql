DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS leases CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS disputes CASCADE;

-- psql -f migration.sql rental_system

-- USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL, 
    last_name VARCHAR(100) NOT NULL, 
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('landlord', 'tenant')) NOT NULL,
    wallet_address VARCHAR(255) UNIQUE NOT NULL, -- For blockchain wallet
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PROPERTIES TABLE
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE, -- Reference to landlord
    address VARCHAR(255) NOT NULL,
    property_type VARCHAR(100) NOT NULL, -- e.g., Apartment, House, etc.
    description TEXT,
    status VARCHAR(50) DEFAULT 'Available', -- Property status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LEASES TABLE
CREATE TABLE leases (
    id SERIAL PRIMARY KEY,
    property_id INT REFERENCES properties(id) ON DELETE CASCADE,
    landlord_id INT REFERENCES users(id) ON DELETE CASCADE, -- Reference to the landlord
    tenant_id INT REFERENCES users(id) ON DELETE CASCADE, -- Reference to the tenant
    rent_amount DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2) NOT NULL,
    lease_start_date TIMESTAMP NOT NULL,
    lease_end_date TIMESTAMP NOT NULL,
    lease_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PAYMENTS TABLE
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    lease_id INT REFERENCES leases(id) ON DELETE CASCADE,
    tenant_id INT REFERENCES users(id) ON DELETE CASCADE,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) CHECK (payment_status IN ('Pending', 'Completed', 'Failed')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DISPUTES TABLE (Optional)
CREATE TABLE disputes (
    id SERIAL PRIMARY KEY,
    lease_id INT REFERENCES leases(id) ON DELETE CASCADE,
    issue_description TEXT NOT NULL,
    status VARCHAR(50) CHECK (status IN ('Open', 'Resolved', 'Closed')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE OR REPLACE FUNCTION update_property_status_on_lease()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the property's status to 'Leased'
  UPDATE properties
  SET status = 'Leased'
  WHERE id = NEW.property_id;
  
  RETURN NEW;
END;

$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION reset_property_status_on_lease_end()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the property's status to 'Available'
  UPDATE properties
  SET status = 'Available'
  WHERE id = OLD.property_id;

  RETURN NEW;
END;

$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_property_status
AFTER INSERT ON leases
FOR EACH ROW
EXECUTE FUNCTION update_property_status_on_lease();

CREATE TRIGGER trigger_reset_property_status
AFTER UPDATE ON leases
FOR EACH ROW
WHEN (OLD.lease_active = TRUE AND NEW.lease_active = FALSE)
EXECUTE FUNCTION reset_property_status_on_lease_end();


-- SAMPLE DATA INSERTIONS

-- Inserting Users (Landlords and Tenants)
INSERT INTO users (first_name, last_name, username, email, password_hash, role, wallet_address) VALUES
('John', 'Doe', 'landlord_1', 'landlord1@example.com', 'hashed_password_1', 'landlord', '0x123456789abcdef123456789abcdef123456789a'),
('Alice', 'Johnson', 'landlord_2', 'landlord2@example.com', 'hashed_password_4', 'landlord', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefd'),
('Bob', 'Brown', 'landlord_3', 'landlord3@example.com', 'hashed_password_5', 'landlord', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdeffe'),
('Jane', 'Smith', 'tenant_1', 'tenant1@example.com', 'hashed_password_2', 'tenant', '0xabcdef123456789abcdef123456789abcdef123456b'),
('Emily', 'Davis', 'tenant_2', 'tenant2@example.com', 'hashed_password_3', 'tenant', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefc'),
('Tom', 'Wilson', 'tenant_3', 'tenant3@example.com', 'hashed_password_6', 'tenant', '0xabcdefabcdefabcdefabcdefabcdefabcddeef'),
('Jane', 'Taylor', 'tenant_4', 'tenant4@example.com', 'hashed_password_7', 'tenant', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefac4');

-- Inserting Properties
INSERT INTO properties (user_id, address, property_type, description, status)
VALUES 
(1, '1234 Main St, San Diego, CA', 'Apartment', 'A cozy 2-bedroom apartment.', 'Available'),
(4, '5678 Oak St, Springfield, IL', 'House', 'Spacious 3-bedroom house with a large backyard.', 'Available'),
(5, '9101 Maple St, Denver, CO', 'Townhouse', 'Modern townhouse near downtown Denver.', 'Available'),
(2, '1112 Pine St, Seattle, WA', 'Condo', 'Luxury condo with city views.', 'Available'),
(3, '1314 Cedar Ave, Austin, TX', 'Apartment', 'Studio apartment close to the university.', 'Available');

-- Inserting Leases
INSERT INTO leases (property_id, landlord_id, tenant_id, rent_amount, deposit_amount, lease_start_date, lease_end_date, lease_active) VALUES
(1, 1, 4, 1200.00, 2400.00, '2024-01-01', '2024-12-31', TRUE),
(2, 2, 5, 1500.00, 3000.00, '2024-05-01', '2025-04-30', TRUE),
(3, 3, 6, 1300.00, 2600.00, '2024-07-01', '2025-06-30', TRUE),
(4, 2, 7, 1400.00, 2800.00, '2024-08-01', '2025-07-31', TRUE),
(5, 1, 4, 1250.00, 2500.00, '2024-10-01', '2025-09-30', TRUE);

-- Inserting Payments
INSERT INTO payments (lease_id, tenant_id, amount, payment_status) VALUES
(1, 4, 1200.00, 'Completed'),
(2, 5, 1500.00, 'Completed'),
(1, 4, 1200.00, 'Pending'),
(3, 6, 1300.00, 'Completed'),
(4, 7, 1400.00, 'Pending'),
(5, 4, 1250.00, 'Completed'),
(3, 6, 1300.00, 'Pending'),
(4, 7, 1400.00, 'Completed');

-- Inserting Disputes
INSERT INTO disputes (lease_id, issue_description, status) VALUES
(1, 'Tenant complains about noise from the neighbors.', 'Open'), 
(2, 'Property damage report for the backyard fence.', 'Resolved'), 
(3, 'Tenant requesting earlier lease termination due to job relocation.', 'Resolved'), 
(4, 'Tenant disputes late fee for July rent.', 'Open'), 
(5, 'Tenant reports issues with heating system in apartment.', 'Open'); 
