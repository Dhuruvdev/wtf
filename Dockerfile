FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY drizzle.config.ts ./
COPY postcss.config.js ./
COPY tailwind.config.ts ./

# Install dependencies
RUN npm ci

# Copy source
COPY client ./client
COPY server ./server
COPY shared ./shared
COPY script ./script

# Build
RUN npm run build

# Expose port
EXPOSE 5000

# Run production server
CMD ["npm", "run", "start"]
