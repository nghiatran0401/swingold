# Base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json .

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Copy the ABI copy script
COPY copy-abis.sh /app/copy-abis.sh

# Make the script executable
RUN chmod +x /app/copy-abis.sh

# Expose port
EXPOSE 3000

# Run the ABI copy script and then start the app
CMD ["/bin/sh", "-c", "/app/copy-abis.sh && npm start"]