# Use the latest Node.js Alpine image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy the package.json and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy the rest of the application code
COPY . .

RUN pnpm prisma generate

# Expose the port the app runs on
EXPOSE 5000

# Start the server
CMD ["pnpm", "start"]
