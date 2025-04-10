FROM node:18-alpine

WORKDIR /app

COPY api-gateway/package*.json .

RUN npm install

COPY api-gateway/ .

EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -q --spider http://localhost:3000/health || exit 1

# Use a more robust start command
CMD ["node", "src/index.js"]