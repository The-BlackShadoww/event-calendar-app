# ── Stage 1: Builder ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (Docker layer caching — if these haven't 
# changed, npm ci is skipped on rebuilds)
COPY package.json package-lock.json ./

# Clean install all dependencies including devDependencies
# (we need typescript, @types/* etc. to compile)
RUN npm ci

# Copy all source files into the container
COPY . .

# Compile TypeScript → JavaScript into dist/
# If this fails, the entire Docker build fails — no silent errors
RUN npm run build

# Verify dist/main.js actually exists — fails build if missing
RUN test -f dist/main.js || (echo "BUILD FAILED: dist/main.js not found" && exit 1)

# ── Stage 2: Production ───────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install ONLY production dependencies (no typescript, no dev tools)
RUN npm ci --only=production

# Copy compiled output from builder stage
COPY --from=builder /app/dist ./dist

# Copy migrations folder — needed at runtime for db:migrate on startup
COPY --from=builder /app/drizzle ./drizzle

# Railway injects PORT environment variable
EXPOSE 3000

# Start the compiled app
CMD ["node", "dist/main.js"]