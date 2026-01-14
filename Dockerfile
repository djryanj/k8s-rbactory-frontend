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

# Metadata labels
LABEL org.opencontainers.image.created="${BUILD_DATE}"
LABEL org.opencontainers.image.authors="ryan@ryanjjacobs.com"
LABEL org.opencontainers.image.url="https://github.com/djryanj/k8s-rbactory-frontend"
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.revision="${VCS_REF}"
LABEL org.opencontainers.image.title="K8s RBACTory Frontend"
LABEL org.opencontainers.image.description="React frontend for K8s RBAC management"

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]