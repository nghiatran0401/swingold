# Base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json .

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Set ABI output directory environment variable for Docker volume
ENV ABI_OUTPUT_DIR=/app/shared-abis

# Compile contracts and extract ABIs at build time
RUN npm run compile

# Expose port
EXPOSE 8545

# Run the application
CMD ["npm", "run", "node"]