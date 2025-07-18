-- SwinGold Database Initialization Script
-- This script creates the database schema and populates it with sample data

USE swingold;

-- Create tables
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(500),
    alt VARCHAR(255),
    price INT NOT NULL DEFAULT 0,
    favorite BOOLEAN DEFAULT FALSE,
    size JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    fee VARCHAR(10) NOT NULL DEFAULT '0',
    earn VARCHAR(10) NOT NULL DEFAULT '0',
    date VARCHAR(100) NOT NULL,
    description TEXT,
    month VARCHAR(20) NOT NULL,
    location VARCHAR(255),
    enroll BOOLEAN DEFAULT FALSE,
    end BOOLEAN DEFAULT FALSE,
    seats INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    amount VARCHAR(20) NOT NULL,
    description VARCHAR(500) NOT NULL,
    date VARCHAR(50) NOT NULL,
    time VARCHAR(20),
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    gold_balance INT DEFAULT 300,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample items data
INSERT INTO items (id, name, description, image, alt, price, favorite, size) VALUES
(1, 'Polo Shirt', 'The uniform of Swinburne Vietnam, coloured in red and black. Made with cotton. Comfortable to wear.', './images/poloshirt.png', 'Red Short-sleeves Shirt', 180, false, '["S", "M", "L", "XL"]'),
(2, 'Black Tote with Zipper', 'Big and powerful tote bag with zipper. Suitable for carrying both Tablet and Laptop.', './images/blacktote.png', NULL, 140, false, NULL),
(3, 'White Tote', 'Small and convenient tote bag, with fashionable design.', './images/whitetote.png', NULL, 120, false, NULL),
(4, 'Umbrella', 'Small, portable umbrella, with the Logo of Swinburne University will be your perfect companion during rainy days or even sunny days. Especially suitable for Hanoi weather.', './images/umbrella.png', NULL, 180, false, NULL),
(5, 'Notebook and Pen', 'Black Notebook and blue pen', './images/notebook.png', NULL, 30, false, NULL),
(6, 'Teddy Bear', 'Teddy bear of variable sizes', './images/teddybear.png', NULL, 150, false, NULL),
(7, 'Water Bottle', 'White Water Bottle 500ml', './images/waterbottle.png', NULL, 250, false, NULL),
(8, 'Lanyard', 'Lanyard that can hold your phone or Student ID', './images/lanyard.png', NULL, 70, false, NULL),
(9, 'Red Hoodie', 'Red hoodie to keep you warm on winter days', './images/redhoodie.png', NULL, 420, false, '["S", "M", "L", "XL"]'),
(10, 'Tinh An Tam Thuc Book', 'A book by Swinburne Vietnam Vovinam Club', './images/book.png', NULL, 165, false, NULL),
(11, '[Coursera] Build Dynamic UI for Websites', 'An online course, offered by Coursera that would provide you with useful skills on how to effectively design a Website Interface.', './images/coursera.png', NULL, 100, false, NULL),
(12, '[Coursera] Foundations of Digital Marketing and E-commerce', 'An online course, offered by Coursera & Google that would provide you with insights on Marketing and E-commerce.', './images/coursera.png', NULL, 100, false, NULL);

-- Insert sample events data
INSERT INTO events (id, name, fee, earn, date, description, month, location, enroll, end, seats) VALUES
(1, '[AWS] Build MCP Servers with Amazon Q CLI and Rust Programming', '0', '10', '13:00 25-06-2025', 'Join us to learn how to build MCP servers using Rust Programming and integrate them with Amazon Q CLI.', 'June', 'Hanoi', false, false, 5),
(2, 'Special Sharing Session with Shark Nguyen Hoa Binh', '0', '10', '14:00 7-05-2025', 'Listen to real-industry stories and skills needed to apply for a job', 'May', 'DaNang', false, true, NULL),
(3, 'Swinburne Arena of Valor National Community Day', '0', '5', '14:00 27-4-2025', 'Meet up wiht gaming buddies across the country', 'April', 'Vietnam', false, true, NULL),
(4, 'SWINBIRTH 6th: SWINCHELLA 2025', '0', '15', '15:00 12-04-2025', 'Celebrate Swinburne Vietnam Birthday, enjoying joyful performances and activiites,...', 'April', 'Hanoi, HCM, DaNang', false, true, NULL),
(5, 'CHEFIESTA 2025: Taste of Korea by Chef\'s Choice', '0', '10', '10:00 18-03-2025', 'Following the success of CHEFIESTA 2024, this year CHEFSIESTA is back with a completely new theme. Let\'s enjoy the taste of Korean mixed noodles and fresh milk with brown sugar pearls right at Swinburne Hanoi!', 'March', 'Hanoi', false, true, NULL),
(6, 'HSBC Business Case Competition 2025', '0', '10', '09:00 14-03-2025', '', 'March', 'Hanoi', false, true, NULL),
(7, 'Worshop by ClickClick', '0', '0', '10:00 07-03-2025', '', 'March', 'Hanoi', false, true, NULL),
(8, 'Internship Orientation', '10', '0', '09:00 07-03-2025', 'This session will provide essential information about the internship process, requirements and expectations to help you successfully secure and complete your internship.', 'March', 'HCM', false, true, NULL),
(9, 'HSBC Business Case Competition 2025', '0', '10', '10:00 18-03-2025', '', 'March', 'Hanoi', false, true, NULL),
(10, 'Swinburne Debate Tournament 2025', '0', '10', '17:00 26-02-2025', '', 'February', 'Hanoi', false, true, NULL);

-- Insert sample transactions data
INSERT INTO transactions (id, amount, description, date, time, user_id) VALUES
(1, '-140', 'Purchased Black Tote with Zipper', '06/06/2025', '10:00:00', 1),
(2, '-50', 'Swinburne Vietnam Check-in Cloud Computing Conference', '25/5/2025', '17:46', 1),
(3, '20', 'Received by attending Event: ICATS 2025', '25/5/2025', '17:46', 1),
(4, '10', 'Gift as full attendance for the course COS30049', '25/5/2025', '17:46', 1);

-- Insert user & admin
INSERT INTO users (id, username, email, password_hash, gold_balance, is_active, is_admin) VALUES
(1, 'user', 'user@swinburne.edu.au', 'cos30049', 300, true, false),
(2, 'admin', 'admin@swinburne.edu.au', 'cos30049', 300, true, true);

-- Create indexes for better performance
CREATE INDEX idx_items_name ON items(name);
CREATE INDEX idx_events_month ON events(month);
CREATE INDEX idx_events_name ON events(name);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);