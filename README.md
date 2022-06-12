# Amanah Toko
Accounting desktop app

## Setup
1. Install dependencies:
    - Install Node >= 14
    - `yarn install`, `cd backend && yarn install`, `cd frontend && yarn install`,
    - Install `pm2` globally, `npm install pm2 -g`
    - Running project in pm2 `pm2 start /backend/process.json`
    - Set pm2 running on computer startup `pm2 startup`, `pm2 save`
    - Note: `pm2` used for running backend & frontend in background process, because **THIS IS ONLY WRAPPER (WEBVIEW)**
    - Install `serve` globally, `yarn global add serve` (for frontend)
2. This app using custom host, (e.g: amanahtoko.local )
    - (Mac): edit host in `/etc/hosts`, 
    - (Windows): search on google
