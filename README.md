# Project Overview

This project developed a Web 3.0 Page to facilitate the trading of Swinburne Vietnam Social Gold.

**Swinburne Vietnam’s Social Gold** rewards students with Social Tokens for their engagement in both academic and extracurricular activities. The current system is centralised (Web 2.0), allowing students to give or receive Gold from others or the organisation. However, because it's controlled by a central authority, the process lacks transparency and can be manipulated. Students have limited ability to track their own transaction history.

This project proposes a **Blockchain-based solution** to decentralise and improve the transparency of the Swinburne Social Gold trading system. Built on Web 3.0, the new platform includes:

- Peer-to-peer trading functionality
- Transparent and immutable transaction records
- A front-end web interface for students, staff, and teachers to trade Gold for goods and services

# How to run the project

Run: `docker-compose up -d`

## Project Structure Overview

- backend/dapp: Contains smart contract artifacts, deployment scripts, and the contract ABIs (for blockchain interaction).
- backend/wapp: The main backend API (FastAPI), handling business logic, database (MySQL), and REST endpoints for the frontend.

# Project Requirements

## 1. Users Can View Digital Assets for Trading

Swinburne Gold is the primary currency. Users can:

- View their total Gold balance on the **Wallet** page
- Exchange Gold for goods, school merchandise, event tickets, or online courses

This variety encourages students to engage more actively in both learning and social events.

## 2. Asset Information Stored in a Database

All items and events available for trading are stored in JSON files, which:

- Allow for dynamic data reading in React components
- Improve scalability and maintainability
- Eliminate the need to change core logic when adding new items

## 3. Search and Filter Functionalities

To enhance user experience:

- The **Items** page uses a grid view with search, sort, and filter features
- The **Events** page uses a list view with month-based filtering

Users can easily find specific assets or upcoming opportunities.

## 4. Smart Contracts as Escrow

Smart contracts:

- Securely hold assets during trading
- Provide a 10-minute confirmation window for buyers
- Automatically cancel transactions if not confirmed in time
- Ensure Gold is only deducted once the transaction is successfully completed

## 5. Transaction History Access

Users can view past transactions on the **Wallet** page. Transaction history includes:

- Timestamps
- Amount of Gold traded
- Related contract details

This feature improves transparency and helps users track their engagement and spending.

## Currency

All prices and transactions in this app are denominated in **GOLD** (the Swingold token). The token contract is named `Swingold` (symbol: GOLD). For all app logic and display, 1 GOLD is treated as equivalent to 1 ETH.

# Backend

## Features

- **Docker** - Easy setup with Dockerfile and Docker Compose
- **RESTful API** with FastAPI
- **MySQL Database** with SQLAlchemy ORM
- **CRUD Operations** for Events, Items, and Transactions
- **Automatic Database Initialization** with sample data
- **CORS Support** for frontend integration
- **Automatic API Documentation** with Swagger UI
- Error Handling and validation

3. **Check the API will be available at**

- **API Base URL:** http://localhost:8000
- **Interactive Docs:** http://localhost:8000/docs

## Docker Services

### 1. Database Service (`db`)

- **Image:** MySQL 8.0
- **Port:** 3306
- **Database:** swingold
- **Credentials:** for easy setup between teammates and instructors, the .env file is available ONLY within this course COS30049 (not a best practice)

### 2. API Service (`api`)

- **Image:** Custom FastAPI application
- **Port:** 8000
- **Dependencies:** Database service

# API Endpoints

### Items

- `GET /api/v1/items` - Get all items (with search and pagination)
- `GET /api/v1/items/{item_id}` - Get specific item
- `POST /api/v1/items` - Create new item
- `PUT /api/v1/items/{item_id}` - Update item
- `DELETE /api/v1/items/{item_id}` - Delete item
- `PATCH /api/v1/items/{item_id}/favorite` - Toggle favorite status

### Events

- `GET /api/v1/events` - Get all events (with filtering and pagination)
- `GET /api/v1/events/{event_id}` - Get specific event
- `POST /api/v1/events` - Create new event
- `PUT /api/v1/events/{event_id}` - Update event
- `DELETE /api/v1/events/{event_id}` - Delete event
- `PATCH /api/v1/events/{event_id}/enroll` - Toggle enrollment status
- `GET /api/v1/events/months/list` - Get available months

### Transactions

- `GET /api/v1/transactions` - Get all transactions
- `GET /api/v1/transactions/{transaction_id}` - Get specific transaction
- `POST /api/v1/transactions` - Create new transaction
- `PUT /api/v1/transactions/{transaction_id}` - Update transaction
- `DELETE /api/v1/transactions/{transaction_id}` - Delete transaction
- `GET /api/v1/transactions/user/{user_id}/balance` - Get user balance
- `POST /api/v1/transactions/user/{user_id}/purchase` - Create purchase transaction
- `POST /api/v1/transactions/user/{user_id}/earn` - Create earning transaction

# Additional Information

## Git Commands

- `git status`: to check what files you have changed during development
- `git add .`: add all modified files to be ready for commit
- `git commit -m`: add a message for that commit
- `git push`: push to github
- `git pull`: pull from github
- `git clone [github-url]`: clone new project from scratch
- `git init`: initialize new project from scratch

## Docker Commands

- `docker-compose up -d`: to start services
- `docker-compose down`: to stop services
- `docker exec -it swingold mysql -u user -p password`: to access database
- `docker system prune -a --volumes`: to prune all

Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (10000 ETH)
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
