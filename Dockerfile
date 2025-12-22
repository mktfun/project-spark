# 1. Base Image
FROM node:18-slim AS base

# 2. Dependencies
FROM base AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y openssl
COPY package.json package-lock.json* ./
# Instala dependências (incluindo dev para o build)
RUN npm ci --legacy-peer-deps

# 3. Builder
FROM base AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build do Next.js
ENV NEXT_PUBLIC_API_URL=http://localhost:8001
RUN npm run build

# 4. Runner (Imagem Final Leve)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOME=/tmp

# Instala OpenSSL para Prisma (Mantido por segurança/compatibilidade)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Cria usuário não-root por segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia apenas o necessário do build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Garante que dependências estejam disponíveis
COPY --from=builder /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000
ENV PORT=3000

# Usa CMD diretamente para evitar problemas de line endings
CMD ["node", "server.js"]
