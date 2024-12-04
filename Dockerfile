# # Use an official Node.js image as the base
# FROM node:16-buster

# # Install necessary dependencies
# RUN apt-get update && apt-get install -y \
#     ca-certificates \
#     chromium \
#     fonts-liberation \
#     libasound2 \
#     libatk-bridge2.0-0 \
#     libatk1.0-0 \
#     libc6 \
#     libcairo2 \
#     libcups2 \
#     libdbus-1-3 \
#     libexpat1 \
#     libfontconfig1 \
#     libgbm1 \
#     libgcc1 \
#     libglib2.0-0 \
#     libgtk-3-0 \
#     libnspr4 \
#     libnss3 \
#     libpango-1.0-0 \
#     libpangocairo-1.0-0 \
#     libstdc++6 \
#     libx11-6 \
#     libx11-xcb1 \
#     libxcb1 \
#     libxcomposite1 \
#     libxcursor1 \
#     libxdamage1 \
#     libxext6 \
#     libxfixes3 \
#     libxi6 \
#     libxrandr2 \
#     libxrender1 \
#     libxss1 \
#     libxtst6 \
#     lsb-release \
#     wget \
#     xdg-utils \
#     libvulkan1 \
#     && apt-get clean

# # Install Puppeteer browser dependencies and cache path
# RUN mkdir -p /root/.cache/puppeteer && chmod -R 777 /root/.cache

# # Set the working directory
# WORKDIR /src

# # Copy package.json and package-lock.json to /src directory
# COPY package*.json /src/

# # Install dependencies
# RUN npm install

# # Install Puppeteer's expected Chrome version
# RUN npx puppeteer browsers install chrome

# # Verify the installed Chrome version
# RUN ls -la /root/.cache/puppeteer/chrome/

# # Set the PUPPETEER_EXECUTABLE_PATH environment variable
# ENV PUPPETEER_EXECUTABLE_PATH=/root/.cache/puppeteer/chrome/linux-131.0.6778.85/chrome-linux64/chrome

# # Copy the rest of the application files
# COPY . /src

# # Compile TypeScript to JavaScript
# RUN npm run build
# RUN node node_modules/puppeteer/install.ts
# # Expose the port for the application
# EXPOSE 5001

# # Start the application
# CMD ["node", "dist/index.js"]

# Use the official Puppeteer image as the base
FROM ghcr.io/puppeteer/puppeteer:23.9.0

# Set environment variables to skip Chromium download and use the installed Chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies including TypeScript
RUN npm ci

# Install TypeScript globally
RUN npm install -g typescript

# Copy the rest of the application files
COPY . .

# Compile TypeScript to JavaScript
RUN tsc

# Expose the port for the application
EXPOSE 5001

# Start the application
CMD ["node", "dist/index.js"]