#!/bin/bash
cd /home/ec2-user/Olym_Project/backend
npm install
cd ../frontend
npm install
npm run build
cd /home/ec2-user/Olym_Project/backend
pip3 install -r ../fitness/requirements.txt || true