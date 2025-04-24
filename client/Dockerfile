# Base image
FROM node:20-alpine AS build

# Set working directory
WORKDIR /client

# Install pnpm
RUN npm install -g pnpm

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Production image
FROM nginx:alpine AS production

# Copy built static files to nginx serve directory
COPY --from=build /client/out /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 8082

# Start nginx
CMD ["nginx", "-g", "daemon off;"]