# Base image with Node.js (Debian-based)
FROM node:latest

# Install netcat (openbsd version) for entrypoint.sh
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Create a directory for the app
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy application files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the production code
RUN npm run build

# Use entrypoint script
ENTRYPOINT ["sh", "entrypoint.sh"]
