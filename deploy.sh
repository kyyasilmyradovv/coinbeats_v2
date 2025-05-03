#!/bin/bash
# deploy.sh: Script to deploy the application

# Paths
DEPLOYMENT_CONF="/etc/nginx/conf.d/deployment.conf"

# Function to get the current deployment
get_current_deployment() {
  grep -oP 'default "\K[^"]+' "$DEPLOYMENT_CONF" || echo "blue"  # Default to "blue" if file doesn't exist
}

CURRENT_DEPLOYMENT=$(get_current_deployment)
echo "Current deployment is: $CURRENT_DEPLOYMENT"

if [ "$CURRENT_DEPLOYMENT" = "blue" ]; then
  NEW_DEPLOYMENT="green"
  OLD_DEPLOYMENT="blue"
  NEW_FRONTEND_PORT=8084  # Update this to match your green container's port
else
  NEW_DEPLOYMENT="blue"
  OLD_DEPLOYMENT="green"
  NEW_FRONTEND_PORT=8082  # Update this to match your blue container's port
fi

echo "Deploying to: $NEW_DEPLOYMENT (port $NEW_FRONTEND_PORT)"

# Remove old containers in the new deployment environment
echo "Stopping and removing old containers..."
docker-compose stop frontend-"$NEW_DEPLOYMENT" backend-"$NEW_DEPLOYMENT" || true
docker-compose rm -f frontend-"$NEW_DEPLOYMENT" backend-"$NEW_DEPLOYMENT" || true

# Build new images without cache
echo "Building new images without cache..."
docker-compose build --no-cache frontend-"$NEW_DEPLOYMENT" backend-"$NEW_DEPLOYMENT"

# Bring up the new containers
echo "Starting new containers..."
docker-compose up -d frontend-"$NEW_DEPLOYMENT" backend-"$NEW_DEPLOYMENT"

# Health check
HEALTH_CHECK_URL="http://localhost:$NEW_FRONTEND_PORT"
MAX_WAIT=60
WAIT_INTERVAL=5
ELAPSED_TIME=0

echo "Waiting for $NEW_DEPLOYMENT frontend to become healthy..."
until curl --fail --silent --head "$HEALTH_CHECK_URL" > /dev/null; do
  if [ $ELAPSED_TIME -ge $MAX_WAIT ]; then
    echo "Health check failed after $MAX_WAIT seconds. Rolling back to $OLD_DEPLOYMENT."
    exit 1
  fi
  echo "Not ready yet. Waiting $WAIT_INTERVAL seconds..."
  sleep $WAIT_INTERVAL
  ELAPSED_TIME=$((ELAPSED_TIME + WAIT_INTERVAL))
done

echo "$NEW_DEPLOYMENT frontend is healthy."

# Update the deployment variable
echo "Updating deployment configuration..."
echo 'map "" $deployment {
    default "'$NEW_DEPLOYMENT'";
}' | tee $DEPLOYMENT_CONF >/dev/null

# Update NGINX configuration to use the correct port
NGINX_CONF="/etc/nginx/sites-available/coinbeats.xyz"
if [ "$NEW_DEPLOYMENT" = "blue" ]; then
  sed -i 's/proxy_pass http:\/\/127.0.0.1:[0-9]\+;/proxy_pass http:\/\/127.0.0.1:8082;/' $NGINX_CONF
else
  sed -i 's/proxy_pass http:\/\/127.0.0.1:[0-9]\+;/proxy_pass http:\/\/127.0.0.1:8084;/' $NGINX_CONF
fi

# Reload Nginx
echo "Reloading Nginx..."
if nginx -t; then
  nginx -s reload
  echo "Nginx reloaded successfully"
else
  echo "Nginx config test failed, not reloading"
  exit 1
fi

echo "Switched deployment to $NEW_DEPLOYMENT"
echo "If issues occur, run './rollback.sh' to revert."

FROM node:20-slim AS base