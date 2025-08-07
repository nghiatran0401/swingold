## Project Overview

This project developed a Web 3.0 Page to facilitate the trading of Swinburne Vietnam Social Gold.

**Swinburne Vietnam’s Social Gold** rewards students with Social Tokens for their engagement in both academic and extracurricular activities. The current system is centralised (Web 2.0), allowing students to give or receive Gold from others or the organisation. However, because it's controlled by a central authority, the process lacks transparency and can be manipulated. Students have limited ability to track their own transaction history.

This project proposes a **Blockchain-based solution** to decentralise and improve the transparency of the Swinburne Social Gold trading system. Built on Web 3.0, the new platform includes:

- Peer-to-peer trading functionality
- Transparent and immutable transaction records
- A front-end web interface for students, staff, and teachers to trade Gold for goods and services

## Project Structure

- mysql database: (backend/wapp/mysql/init/) Contains SQL initialization scripts for setting up the MySQL database schema and sample data during container startup.
- backend/dapp: Contains smart contract artifacts, deployment scripts, and the contract ABIs (for blockchain interaction).
- backend/wapp: The main backend API (FastAPI), handling business logic, database (MySQL), and REST endpoints for the frontend.
- frontend/: Contains the React web application, including UI components, pages, and logic for interacting with the backend API and smart contracts. The ABIs needed for contract interaction are copied into frontend/src/abi/.

## Project Functionality

### 1. Users Can View Digital Assets for Trading

Swinburne Gold is the primary currency. Users can:

- View their total Gold balance on the **Wallet** page
- Exchange Gold for goods, school merchandise, event tickets, or online courses

This variety encourages students to engage more actively in both learning and social events.

### 2. Asset Information Stored in a Database

All items and events available for trading are stored in JSON files, which:

- Allow for dynamic data reading in React components
- Improve scalability and maintainability
- Eliminate the need to change core logic when adding new items

### 3. Search and Filter Functionalities

To enhance user experience:

- The **Items** page uses a grid view with search, sort, and filter features
- The **Events** page uses a list view with month-based filtering

Users can easily find specific assets or upcoming opportunities.

### 4. Smart Contracts as Escrow

Smart contracts:

- Securely hold assets during trading
- Provide a 10-minute confirmation window for buyers
- Automatically cancel transactions if not confirmed in time
- Ensure Gold is only deducted once the transaction is successfully completed

### 5. Transaction History Access

Users can view past transactions on the **Wallet** page. Transaction history includes:

- Timestamps
- Amount of Gold traded
- Related contract details

This feature improves transparency and helps users track their engagement and spending.

### Currency

All prices and transactions in this app are denominated in **GOLD** (the Swingold token). The token contract is named `Swingold` (symbol: GOLD). For all app logic and display, 1 GOLD is treated as equivalent to 1 ETH.
