# How to run the project

## Ideally with docker-compose

Run: `docker-compose up -d`

## Running Without Docker (Manual Setup)

If Docker is unavailable or fails, you can run each part of the project manually. Follow these steps for local development:

### 1. Backend/dapp (Smart Contracts)

1. Install Node.js (v16+) and npm
2. Navigate to the dapp directory: `cd backend/dapp`
3. Install dependencies: `npm install`
4. Set environment variables: the `.env` file is provided within this source code for easy development between teammates since this is just a school assignment (not the best practice/industry standard)
5. Compile contracts: `npm run compile`
6. Extract ABI files into root directory `shared-abis`: `npm run extract-abis`
7. Copy `shared-abis` into `backend/wapp` and `frontend/src`
8. Run Hardhat network: `npm run node`

### 2. Backend/wapp (API Server)

1. Install Python 3.9+ and pip
2. Navigate to the wapp directory: `cd backend/wapp`
3. Activate conda (optional): `conda activate swingold`
4. Install dependencies: `pip install -r requirements.txt`
5. Set environment variables: the `.env` file is provided within this source code for easy development between teammates since this is just a school assignment, not the best practice / industry standard
6. Run the API server: `uvicorn main:app --reload`

### 3. Set up MySQL database:

1. Install MySQL 8.0 locally
2. Create a database named `swingold`
3. Set up a mysql user with the credentials:

   - username: `user`
   - password: `password`

4. Run the SQL initialization script: `mysql -u user -p swingold < backend/wapp/mysql/init/01-init.sql`

##### Note: This script (01-init.sql) contains the schema and first batch of data. Read it to fully understand about the database

### 4. Frontend (React App)

1. Install Node.js (v16+) and npm
2. Navigate to the frontend directory: `cd frontend`
3. Install dependencies: `npm install`
4. Set environment variables: the `.env` file is provided within this source code for easy development between teammates since this is just a school assignment, not the best practice / industry standard
5. Run the frontend app: `npm start`

### 5. Notes and Troubleshooting

- **ABI Sharing:** When not using Docker, you must manually copy ABI files after every contract change/compile.
- **Database:** Ensure MySQL is running and accessible with the correct credentials.
- **Environment Variables:** Refer to `docker-compose.yml` for all required variables for each service.
- **Ports:** Make sure ports 3000 (frontend), 8000 (API), and 3306 (MySQL) are free.
- **Contract Changes:** After modifying smart contracts, recompile and re-extract ABIs, then copy them to the frontend.

If you encounter issues, check the logs for each service and ensure all dependencies are installed and environment variables are set correctly.
