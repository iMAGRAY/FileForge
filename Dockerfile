# Ultra Code Manager Enhanced - Production Docker Image
# Multi-stage build for optimal image size and security

# ================================
# Build Stage - C++ Assembler
# ================================
FROM gcc:12-bullseye AS assembler-builder

WORKDIR /build

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    make \
    && rm -rf /var/lib/apt/lists/*

# Copy C++ source and build
COPY src/file_assembler.cpp .
COPY Makefile .

# Build optimized assembler
RUN make CFLAGS="-O3 -march=native -mtune=native"

# ================================
# Python Dependencies Stage  
# ================================
FROM python:3.10-slim AS python-deps

WORKDIR /app

# Install system dependencies for Python packages
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# ================================
# Production Stage
# ================================
FROM node:18-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    gcompat \
    libstdc++ \
    && ln -sf python3 /usr/bin/python

# Create non-root user for security
RUN addgroup -g 1001 -S ultracm && \
    adduser -S ultracm -u 1001 -G ultracm

WORKDIR /app

# Copy Python dependencies from build stage
COPY --from=python-deps --chown=ultracm:ultracm /root/.local /home/ultracm/.local

# Copy built assembler
COPY --from=assembler-builder --chown=ultracm:ultracm /build/file_assembler /app/file_assembler

# Copy Node.js package files
COPY --chown=ultracm:ultracm package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application source
COPY --chown=ultracm:ultracm src/ ./src/
COPY --chown=ultracm:ultracm docs/ ./docs/
COPY --chown=ultracm:ultracm examples/ ./examples/

# Create directories with proper permissions
RUN mkdir -p /app/embeddings /app/backups /app/logs && \
    chown -R ultracm:ultracm /app/embeddings /app/backups /app/logs

# Set environment variables
ENV NODE_ENV=production \
    PYTHONPATH=/app \
    EMBEDDINGS_DIR=/app/embeddings \
    BACKUP_DIR=/app/backups \
    LOG_DIR=/app/logs \
    PATH=/home/ultracm/.local/bin:$PATH

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('./src/fileforge.cjs')" || exit 1

# Switch to non-root user
USER ultracm

# Expose MCP port (if needed for HTTP transport)
EXPOSE 3000

# Default command
CMD ["node", "src/fileforge.cjs"]

# ================================
# Metadata Labels
# ================================
LABEL \
    org.opencontainers.image.title="Ultra Code Manager Enhanced" \
    org.opencontainers.image.description="Advanced MCP server for efficient code management" \
    org.opencontainers.image.version="3.2.0" \
    org.opencontainers.image.vendor="Ultra Code Manager Team" \
    org.opencontainers.image.licenses="MIT" \
    org.opencontainers.image.source="https://github.com/your-username/ultra-code-manager-enhanced" \
    org.opencontainers.image.documentation="https://github.com/your-username/ultra-code-manager-enhanced#readme"