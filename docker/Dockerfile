FROM node:lts-bookworm AS builder

ARG BUILD_DATE
ARG VCS_REF
ARG VERSION=0.0.1

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginxinc/nginx-unprivileged:alpine

# Switch to root to install envsubst and set up directories
USER root

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Create writable directory for runtime config
RUN mkdir -p /tmp/runtime-config && \
    chown -R 101:101 /tmp/runtime-config

# Switch back to nginx user
USER 101

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy config template to writable location
COPY --chown=101:101 public/config.template.js /tmp/runtime-config/config.template.js

# Copy entrypoint script
COPY --chmod=0755 --chown=101:101 docker/docker-entrypoint.sh /docker-entrypoint.sh

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Metadata labels
LABEL org.opencontainers.image.created="${BUILD_DATE}" \
    org.opencontainers.image.title="K8s RBACtory Frontend" \
    org.opencontainers.image.description="React Frontend for K8s RBACtory - RBAC policy builder" \
    org.opencontainers.image.licenses="Apache-2.0" \
    org.opencontainers.image.version="${VERSION}" \
    org.opencontainers.image.revision="${VCS_REF}" \
    org.opencontainers.image.source="https://github.com/djryanj/k8s-rbactory-frontend" \
    org.opencontainers.image.documentation="https://github.com/djryanj/k8s-rbactory-frontend/blob/main/README.md"


ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]