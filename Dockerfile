# syntax=docker/dockerfile:1

FROM node:20-alpine AS base

# ========== DEPS: install npm packages ==========
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
# BuildKit cache mount — npm-кэш переиспользуется между билдами
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate

# ========== BUILDER: compile Next.js ==========
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Ограничиваем потребление памяти при сборке, чтобы VPS не завис
ENV NODE_OPTIONS="--max-old-space-size=2048"
ARG NEXT_PUBLIC_IS_STAGING
ENV NEXT_PUBLIC_IS_STAGING=$NEXT_PUBLIC_IS_STAGING
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
# BuildKit cache mount — .next/cache переиспользуется между билдами (ускоряет повторные сборки на ~60%)
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

# ========== RUNNER: production Next.js server ==========
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
RUN mkdir -p ./public/uploads && chown -R nextjs:nodejs ./public/uploads
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
