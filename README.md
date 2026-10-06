<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png" alt="LeetCode Logo" width="100"/>
  <h1>LeetCode Tracker 🚀</h1>
  <p><strong>An automated, real-time LeetCode progress tracker with Telegram notifications.</strong></p>
  
  [![Cloudflare Workers](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Workers-F38020?style=for-the-badge&logo=cloudflare)](https://workers.cloudflare.com/)
  [![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.io/)
</div>

<br />

## 🌟 Overview

LeetCode Tracker is a completely free, automated system built for competitive programmers who want to stay consistent. It continuously monitors your (or your friends') LeetCode accounts and sends instant Telegram notifications whenever a new problem is solved. 

No more manually checking profiles. Just code, and we handle the rest.

### ✨ Key Features
- **⚡ Continuous Background Tracking:** Automatically checks LeetCode accounts every 15 minutes using Cloudflare Cron Triggers.
- **📱 Instant Telegram Alerts:** Get perfectly formatted Telegram notifications with the problem name, difficulty, and your updated total solved counts.
- **👥 Multi-Account Support:** Track multiple LeetCode accounts (yours, your friends, your rivals) from a single Telegram Chat ID.
- **📊 Live Global Feed:** View a real-time dashboard of who solved what recently across the entire platform.
- **💰 100% Free Tier Stack:** Built entirely on Cloudflare Pages, Cloudflare Workers, and Supabase (PostgreSQL).

---

## 📸 Telegram Notification Format

When a user solves a problem, the bot automatically sends this directly to your phone:

> 👤 **User:** `i_priince_kr`  
> 📝 **Problem:** `Evaluate Boolean Binary Tree`  
> 
> ✅ **Total Solved:** **562**  
> 🟢 **Easy:** 388  
> 🟡 **Medium:** 167  
> 🔴 **Hard:** 7  
> 
> 🔗 https://leetcode.com/i_priince_kr/

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Frontend** | React, Vite | Multi-account dashboard, Global Activity feed |
| **Backend** | Cloudflare Workers | Serverless API endpoints, Telegram Bot webhook |
| **Automation**| Cloudflare Cron | Triggers the background checking script every 15m |
| **Database** | Supabase (PostgreSQL) | Stores users, stats, and tracks past submissions |
| **Hosting** | Cloudflare Pages | Hosts the blazing fast static frontend |

---

## 🚀 Setup & Deployment

### 1. Database Setup (Supabase)
1. Create a free Supabase project.
2. Run the SQL schema found in `database/schema.sql` in the Supabase SQL Editor.
3. Keep your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` handy.

### 2. Telegram Bot Setup
1. Message [@BotFather](https://t.me/BotFather) on Telegram and create a new bot.
2. Save the API Token.

### 3. Backend Deployment (Cloudflare Workers)
```bash
cd worker
npm install

# Upload Secrets to Cloudflare
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put TELEGRAM_BOT_TOKEN

# Deploy
npm run deploy
```

### 4. Frontend Deployment (Cloudflare Pages)
Update the `VITE_API_URL` in your `.env.production` file to point to your new Worker URL.
```bash
cd frontend
npm install
npm run build
npx wrangler pages deploy dist --project-name leetcode-tracker-ui
```

---

## 💡 How It Works (The Architecture)

1. **User Registration:** You enter a LeetCode username and your personal Telegram Chat ID into the React UI.
2. **Cron Trigger:** Every 15 minutes, the Cloudflare Worker wakes up.
3. **Fetching:** It loops through all tracked users, querying the LeetCode GraphQL API for recent submissions and profile stats.
4. **Diffing:** It cross-references the submissions with the Supabase database to ignore duplicates.
5. **Notification:** For every *new* accepted submission, it formats a beautiful HTML message and POSTs it to the Telegram Bot API.

---

<div align="center">
  <i>Built to keep you coding. 🚀</i>
</div>
