# 1. Base Image
FROM node:18-slim AS base

# 2. Dependencies
FROM base AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y openssl
COPY package.json package-lock.json* ./
# Instala dependências (incluindo dev para o build)
RUN npm ci

# 3. Builder
FROM base AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Gera o Prisma Client
RUN npx prisma generate
# Build do Next.js
RUN npm run build

# 4. Runner (Imagem Final Leve)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

# Instala OpenSSL para Prisma
# Instala OpenSSL para Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Cria usuário não-root por segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia script de entrypoint
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Copia apenas o necessário do build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copia o diretório prisma para rodar migrations e seed e schema
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000
ENV PORT 3000

ENTRYPOINT ["docker-entrypoint.sh"]
# CMD is optional if ENTRYPOINT script ends with exec "$@" or hardcodes startup but our script hardcodes startup
# CMD ["node", "server.js"]
