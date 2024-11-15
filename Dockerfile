# Base image with dependencies
FROM node:16-slim AS base

# Install packages needed for Puppeteer
RUN apt-get update && apt-get install -y \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Add Puppeteer dependencies
FROM base AS puppeteer

# Set the working directory
WORKDIR /app

# Copy over package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of your code
COPY . .

# Final stage: run the Puppeteer script
CMD ["node", "src/index.js"]
