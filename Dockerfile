FROM node:24-slim

# Optional Python 3 fallback in case USE_PYTHON_SQLITE=true is enabled
RUN apt-get update && apt-get install -y --no-install-recommends python3 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy application files (compiled styles and assets are bundled; no runtime npm install needed)
COPY . .

# Ensure persistent data directories exist
RUN mkdir -p /app/data/uploads /app/data/backups

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    DATA_DIR=/app/data

EXPOSE 3000

CMD ["node", "start.cjs"]
