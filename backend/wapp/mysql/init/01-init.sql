-- SwinGold Database Initialization Script
-- This script creates the database schema and populates it with sample data

USE swingold;

-- Create tables
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    price DECIMAL(10,1) DEFAULT 0.0,
    tags VARCHAR(255),
    status ENUM('upcoming','active','completed','cancelled') DEFAULT 'upcoming',
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME,
    price DECIMAL(10) DEFAULT 0,
    location VARCHAR(255),
    seats_available INT,
    image_url VARCHAR(500),
    tags VARCHAR(255),
    status ENUM('upcoming','active','completed','cancelled') DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(42) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(18,8) NOT NULL,
    direction ENUM('credit','debit') NOT NULL,
    description VARCHAR(500) NOT NULL,
    date VARCHAR(50) NOT NULL,
    time VARCHAR(20),
    user_id INT NOT NULL,
    event_id INT,
    item_id INT,
    quantity INT DEFAULT 1,
    tx_hash VARCHAR(66),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
);

-- Insert sample items data
INSERT INTO items (id, name, description, image_url, price, tags) VALUES
(1, 'Polo Shirt', 'The uniform of Swinburne Vietnam, coloured in red and black. Made with cotton. Comfortable to wear.', './images/poloshirt.png', 100, '["S", "M", "L", "XL"]'),
(2, 'Umbrella', 'Small, portable umbrella, with the Logo of Swinburne University will be your perfect companion during rainy days or even sunny days. Especially suitable for Hanoi weather.', './images/umbrella.png', 280, NULL),
(3, 'Teddy Bear', 'Teddy bear of variable sizes', './images/teddybear.png', 150, NULL),
(4, 'Tinh An Tam Thuc Book', 'A book by Swinburne Vietnam Vovinam Club', './images/book.png', 65, NULL),
(5, '[Coursera] Foundations of Digital Marketing and E-commerce', 'An online course, offered by Coursera & Google that would provide you with insights on Marketing and E-commerce.', './images/coursera.png', 300, NULL);

-- Insert sample events data
INSERT INTO events (id, name, category, start_datetime, end_datetime, price, location, seats_available, tags, status, image_url) VALUES
(1, '[AWS] Build MCP Servers with Amazon Q CLI and Rust Programming', 'Tech', '2025-06-25 13:00:00', '2025-06-25 14:00:00', 0, 'Hanoi', 5, 'AWS, MCP, Rust', 'upcoming', '/images/coursera.png'),
(2, 'Special Sharing Session with Shark Nguyen Hoa Binh', 'Tech', '2025-05-07 14:00:00', '2025-05-07 15:00:00', 0, 'DaNang', 5, 'Shark Nguyen Hoa Binh', 'upcoming', '/images/coursera.png'),
(3, 'Swinburne Arena of Valor National Community Day', 'Gaming', '2025-04-27 14:00:00', '2025-04-27 15:00:00', 0, 'Vietnam', 5, 'Arena of Valor', 'upcoming', '/images/coursera.png'),
(4, 'SWINBIRTH 6th: SWINCHELLA 2025', 'Party', '2025-04-12 15:00:00', '2025-04-12 16:00:00', 0, 'Hanoi, HCM, DaNang', 5, 'SWINBIRTH, SWINCHELLA', 'upcoming', '/images/coursera.png'),
(5, 'CHEFIESTA 2025: Taste of Korea by Chefs Choice', 'Food', '2025-03-18 10:00:00', '2025-03-18 11:00:00', 0, 'Hanoi', 5, 'Chefs Choice', 'upcoming', '/images/coursera.png');

-- Insert user & admin
INSERT INTO users (id, username, email, wallet_address, password_hash, is_active, is_admin) VALUES
(1, 'admin', 'admin@swinburne.edu.au', NULL, 'cos30049', true, true),
(2, 'user1', 'user1@swinburne.edu.au', NULL, 'cos30049', true, false),
(3, 'user2', 'user2@swinburne.edu.au', NULL, 'cos30049', true, false);

-- Create indexes for better performance
CREATE INDEX idx_items_name ON items(name);
CREATE INDEX idx_events_name ON events(name);