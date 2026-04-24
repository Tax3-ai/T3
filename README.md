# Tax3 Social Agent

Autonomous social media growth agent for Tax3. Generates and publishes 3 optimised posts/day to Instagram and TikTok, learns from performance data, and continuously refines strategy.

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Tax3-ai/T3&branch=claude/social-media-growth-agent-UpZI4&env=DATABASE_PROVIDER,DATABASE_URL,ANTHROPIC_API_KEY,INSTAGRAM_ACCESS_TOKEN,INSTAGRAM_BUSINESS_ACCOUNT_ID,TIKTOK_ACCESS_TOKEN,TIKTOK_OPEN_ID,CRON_SECRET&envDescription=See%20.env.example%20for%20full%20descriptions&project-name=tax3-social-agent&repository-name=tax3-social-agent)

---

## Setup (5 minutes)

### 1. Get a free PostgreSQL database (Neon)

1. Go to **[neon.tech](https://neon.tech)** → Sign up free
2. Click **"New Project"** → name it `tax3`
3. Copy the **Connection string** — it looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

### 2. Deploy to Vercel

1. Go to **[vercel.com/new](https://vercel.com/new)**
2. Click **"Import Git Repository"**
3. Select **Tax3-ai/T3**
4. Set branch to **`claude/social-media-growth-agent-UpZI4`**
5. Under **Environment Variables**, add:

| Variable | Value |
|---|---|
| `DATABASE_PROVIDER` | `postgresql` |
| `DATABASE_URL` | your Neon connection string |
| `ANTHROPIC_API_KEY` | `sk-ant-...` from [console.anthropic.com](https://console.anthropic.com) |
| `INSTAGRAM_ACCESS_TOKEN` | from Meta Developer portal |
| `INSTAGRAM_BUSINESS_ACCOUNT_ID` | your IG business account ID |
| `TIKTOK_ACCESS_TOKEN` | from TikTok Developer portal |
| `TIKTOK_OPEN_ID` | your TikTok open ID |
| `CRON_SECRET` | any random string (run `openssl rand -hex 32`) |

6. Click **"Deploy"** — takes ~2 minutes

### 3. Seed the database

After deploy, open your Vercel project → **Functions** tab → or run locally:

```bash
DATABASE_PROVIDER=postgresql DATABASE_URL="your-neon-url" npx prisma db push
DATABASE_PROVIDER=postgresql DATABASE_URL="your-neon-url" npm run db:seed
```

### 4. You're live

Your dashboard: `https://your-project.vercel.app/dashboard`

The agent starts posting 3×/day automatically at **09:00, 13:00, 18:00 GMT**.
Every post lands in your **Approval Queue** until you're comfortable going fully autonomous.

---

## Local Development

```bash
git clone https://github.com/Tax3-ai/T3.git
cd T3
cp .env.example .env        # fill in your keys
npm install
npm run db:push             # creates local SQLite DB
npm run db:seed             # loads Tax3 brand bible
npm run dev                 # http://localhost:3000
```

---

## Pages

| URL | Purpose |
|---|---|
| `/dashboard` | Stats, recent posts, trend tracker, AI suggestions |
| `/approval` | Review & approve AI-generated posts |
| `/calendar` | 7-day rolling content calendar |
| `/trends` | Trending sounds, hooks, formats, hashtags |
| `/reports` | Weekly AI strategy reports |
| `/brand-bible` | View & edit the Tax3 brand bible |

## Cron Schedule (GMT)

| Time | Action |
|---|---|
| 09:00 daily | Generate morning posts (Lifestyle pillar) |
| 13:00 daily | Generate midday posts (Behind the Scenes) |
| 18:00 daily | Generate evening posts (Campaign) |
| Every hour | Collect metrics from published posts |
| Monday 08:00 | Generate weekly strategy report |
