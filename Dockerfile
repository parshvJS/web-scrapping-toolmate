FROM ghcr.io/puppeteer/puppeteer:23.9.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .

RUN npm install
RUN npm run build

USER pptruser

CMD [ "node", "dist/index.js" ]