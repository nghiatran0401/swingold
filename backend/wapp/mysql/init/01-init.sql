-- SwinGold Database Initialization Script
-- This script creates the database schema and populates it with sample data

USE swingold;

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
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Essential metadata for fast queries
    amount VARCHAR(100) NOT NULL,
    direction ENUM('credit','debit') NOT NULL,
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    description VARCHAR(500),
    status ENUM('pending','confirmed','failed') DEFAULT 'pending',
    
    -- User and context
    user_id INT NOT NULL,
    event_id INT,
    item_id INT,
    
    -- Blockchain metadata for easy querying
    block_number INT,
    gas_used INT,
    gas_price VARCHAR(100),
    
    -- Trade-specific metadata (for P2P trades)
    trade_type VARCHAR(50),  -- 'item_purchase', 'p2p_trade', 'transfer', 'event_registration'
    counterparty_address VARCHAR(42),  -- Other party in the trade
    item_name VARCHAR(255),  -- For trades
    item_category VARCHAR(100),  -- For trades
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mined_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
);

INSERT INTO items (id, name, description, image_url, price, tags) VALUES
(1, 'Polo Shirt', 'The uniform of Swinburne Vietnam, coloured in red and black. Made with cotton. Comfortable to wear.', 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&h=400&fit=crop', 100, '["S", "M", "L", "XL"]'),
(2, 'Umbrella', 'Small, portable umbrella, with the Logo of Swinburne University will be your perfect companion during rainy days or even sunny days. Especially suitable for Hanoi weather.', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', 280, NULL),
(3, 'Teddy Bear', 'Teddy bear of variable sizes', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', 150, NULL),
(4, 'Tinh An Tam Thuc Book', 'A book by Swinburne Vietnam Vovinam Club', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop', 65, NULL),
(5, '[Coursera] Foundations of Digital Marketing and E-commerce', 'An online course, offered by Coursera & Google that would provide you with insights on Marketing and E-commerce.', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=400&fit=crop', 300, NULL),
(6, 'Graduation Cap', 'Official Swinburne graduation cap for your special day', 'https://images.unsplash.com/photo-1523050854058-8df90110c9e1?w=400&h=400&fit=crop', 200, '["One Size"]'),
(7, 'Laptop Sticker Pack', 'Collection of Swinburne-themed laptop stickers', 'https://images.unsplash.com/photo-1603314585442-ee3b3c16fbcf?w=400&h=400&fit=crop', 50, NULL),
(8, 'Water Bottle', 'Eco-friendly water bottle with Swinburne logo', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop', 120, NULL),
(9, 'Notebook Set', 'Premium notebooks for your academic journey', 'https://images.unsplash.com/photo-1531346680769-a1d79b57de5c?w=400&h=400&fit=crop', 80, NULL),
(10, 'Hoodie', 'Comfortable hoodie with Swinburne branding', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop', 250, '["S", "M", "L", "XL", "XXL"]');

INSERT INTO events (id, name, category, start_datetime, end_datetime, price, location, seats_available, tags, status, image_url) VALUES
(1, '[AWS] Build MCP Servers with Amazon Q CLI and Rust Programming', 'Tech', '2025-06-25 13:00:00', '2025-06-25 14:00:00', 0, 'Hanoi', 5, 'AWS, MCP, Rust', 'upcoming', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=400&fit=crop'),
(2, 'Special Sharing Session with Shark Nguyen Hoa Binh', 'Tech', '2025-05-07 14:00:00', '2025-05-07 15:00:00', 0, 'DaNang', 5, 'Shark Nguyen Hoa Binh', 'upcoming', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'),
(3, 'Swinburne Arena of Valor National Community Day', 'Gaming', '2025-04-27 14:00:00', '2025-04-27 15:00:00', 0, 'Vietnam', 5, 'Arena of Valor', 'upcoming', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop'),
(4, 'SWINBIRTH 6th: SWINCHELLA 2025', 'Party', '2025-04-12 15:00:00', '2025-04-12 16:00:00', 0, 'Hanoi, HCM, DaNang', 5, 'SWINBIRTH, SWINCHELLA', 'upcoming', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop'),
(5, 'CHEFIESTA 2025: Taste of Korea by Chefs Choice', 'Food', '2025-03-18 10:00:00', '2025-03-18 11:00:00', 0, 'Hanoi', 5, 'Chefs Choice', 'upcoming', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop'),
(6, 'AI and Machine Learning Workshop', 'Tech', '2025-07-15 09:00:00', '2025-07-15 12:00:00', 50, 'Ho Chi Minh City', 20, 'AI, Machine Learning, Python', 'upcoming', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=400&fit=crop'),
(7, 'Swinburne Sports Day 2025', 'Sports', '2025-05-20 08:00:00', '2025-05-20 17:00:00', 0, 'Hanoi Campus', 100, 'Sports, Competition, Team Building', 'upcoming', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop'),
(8, 'Career Fair: Tech Industry', 'Career', '2025-06-10 10:00:00', '2025-06-10 16:00:00', 0, 'Da Nang Campus', 50, 'Career, Networking, Tech Jobs', 'upcoming', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop'),
(9, 'Vietnamese Culture Festival', 'Cultural', '2025-08-15 14:00:00', '2025-08-15 20:00:00', 25, 'Hanoi', 80, 'Culture, Traditional, Festival', 'upcoming', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop'),
(10, 'Startup Pitch Competition', 'Business', '2025-09-05 13:00:00', '2025-09-05 18:00:00', 100, 'Ho Chi Minh City', 30, 'Startup, Pitch, Innovation', 'upcoming', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop');

INSERT INTO users (id, username, email, password_hash, is_active, is_admin) VALUES
(1, 'admin', 'admin@swinburne.edu.au', 'cos30049', true, true),
(2, 'user1', 'user1@swinburne.edu.au', 'cos30049', true, false),
(3, 'user2', 'user2@swinburne.edu.au', 'cos30049', true, false);

-- Create indexes for better performance
CREATE INDEX idx_items_name ON items(name);
CREATE INDEX idx_events_name ON events(name);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_tx_hash ON transactions(tx_hash);
CREATE INDEX idx_transactions_trade_type ON transactions(trade_type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);