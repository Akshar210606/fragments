# Dockerfile — Fragments (Lab 05) — Cognito mode
FROM node:22.12.0

LABEL maintainer="Your Name <you@example.com>"
LABEL description="Fragments node.js microservice (CCP Lab 05)"

ENV PORT=8080
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY src ./src

EXPOSE 8080
CMD npm start
