# ---------- Builder stage ----------
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy tests (INCLUDING .htpasswd)
COPY tests ./tests

# Copy source code
COPY src ./src

# ---------- Runtime stage ----------
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production

ARG BUILD_SHA=unknown
ENV BUILD_SHA=${BUILD_SHA}

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy source
COPY --from=builder /app/src ./src

# Copy tests INCLUDING .htpasswd
COPY --from=builder /app/tests ./tests

EXPOSE 8080
CMD ["node", "src/index.js"]
