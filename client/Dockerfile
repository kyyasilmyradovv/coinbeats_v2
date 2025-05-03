# Dockerfile for frontend
FROM node:20-slim

# Set the working directory inside the container
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy the rest of the application files
COPY . .

# Build the application
RUN pnpm run build

# Expose the port your app runs on
EXPOSE 3000

# Specify the command to run your application
CMD ["pnpm", "run", "start"]