#!/bin/bash

# Update system
sudo yum update -y

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install 16
nvm use 16

# Install PM2 globally
npm install -g pm2

# Install project dependencies
npm install

# Start the application with PM2
pm2 start server.js --name "olymm-backend"
pm2 save
pm2 startup 