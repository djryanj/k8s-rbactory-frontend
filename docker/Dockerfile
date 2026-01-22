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

# Switch to root to install envsubst
USER root

# Install gettext for envsubst (needed by initContainer)
RUN apk add --no-cache gettext

# Switch back to nginx user
USER 101

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy config template (will be used by initContainer)
COPY --chown=101:101 public/config.template.js /tmp/config.template.js

# Copy init script for Kubernetes initContainer
COPY --chmod=0755 --chown=101:101 docker/init-config.sh /usr/local/bin/init-config.sh

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

# Default command runs nginx
CMD ["nginx", "-g", "daemon off;"]