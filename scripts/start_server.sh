#!/bin/bash
cd /home/ec2-user/Olym_Project/backend
pm2 start server.js || pm2 restart server.js