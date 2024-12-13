FROM ghcr.io/puppeteer/puppeteer:23.9.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy remaining app files with correct ownership
COPY --chown=pptruser:pptruser . .

# Build the app
RUN npm run build

# Ensure the user has permissions
USER pptruser

# Run the app
CMD [ "node", "dist/index.js" ]
