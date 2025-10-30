# ---------- Builder (installs deps, optional build) ----------
FROM node:18-alpine AS builder
WORKDIR /app

# Install only what's locked in package-lock.json
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# If you transpile/build (TS/webpack), do it here:
# RUN npm run build

# ---------- Runtime (tiny, prod-only) ----------
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production

# Build metadata for health/version
ARG BUILD_SHA=unknown
ENV BUILD_SHA=${BUILD_SHA}

# Copy only what runtime needs
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
# If you have compiled output, copy /app/dist and run from dist instead
# COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/tests/.htpasswd ./tests/.htpasswd


EXPOSE 8080
CMD ["node", "src/index.js"]
