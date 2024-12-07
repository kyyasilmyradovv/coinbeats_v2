# Use a Debian-based Node.js image instead of Alpine
FROM node:20-bullseye-slim

# Set the working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy the package.json and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Install clinic globally for monitoring
RUN npm install -g clinic

# Copy the rest of the application code
COPY . .

RUN pnpm prisma generate

# Expose the ports
EXPOSE 4000 9229

# Start the server with clinic.js
CMD ["clinic", "doctor", "--", "pnpm", "start"]
