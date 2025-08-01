#syntax=docker/dockerfile:1.4

# Versions
FROM node:20-alpine AS node_upstream


# Base stage for dev and build
FROM node_upstream AS base

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# hadolint ignore=DL3018
RUN apk add --no-cache libc6-compat

WORKDIR /srv/www

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Delete the following line in case you want to enable telemetry during dev and build.
ENV NEXT_TELEMETRY_DISABLED=1


# Development image
FROM base AS app_dev

EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME=localhost

CMD ["sh", "-c", "npm install; npm run dev"]


FROM base AS node_builder

COPY --link package.json package-lock.json ./

RUN npm ci

COPY --link . .

RUN npm run build


# Production image, copy all the files and run next
FROM node_upstream AS app_prod

WORKDIR /srv/www

ENV NODE_ENV=production
# Delete the following line in case you want to enable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs; \
    adduser --system --uid 1001 nextjs

# COPY --from=node_builder --link /srv/www/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next; \
    chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=node_builder --link --chown=1001:1001 /srv/www/.next/standalone ./
COPY --from=node_builder --link --chown=1001:1001 /srv/www/.next/static ./.next/static

USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
