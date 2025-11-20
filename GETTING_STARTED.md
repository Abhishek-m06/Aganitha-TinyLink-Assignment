# Getting Started with TiniLink

This guide will help you get TiniLink up and running on your local machine and deployed to production.

## Prerequisites

Before you begin, ensure you have:
- **Node.js 18+** installed ([Download here](https://nodejs.org/))
- **Git** installed
- A **Neon account** (free at [neon.tech](https://neon.tech))
- A **Vercel account** for deployment (free at [vercel.com](https://vercel.com))

## Local Development Setup

### Step 1: Check Node.js Version

```bash
node --version
```

Should output v18 or higher.

### Step 2: Create Neon Database

1. Go to [console.neon.tech](https://console.neon.tech)
2. Sign in or create a free account
3. Click "Create Project"
4. Give it a name (e.g., "tinilink")
5. Copy the connection string shown (starts with `postgresql://`)

### Step 3: Initialize Database

In the Neon SQL Editor, run this SQL:

```sql
CREATE TABLE links (
  id SERIAL PRIMARY KEY,
  code VARCHAR(8) UNIQUE NOT NULL,
  target_url TEXT NOT NULL,
  total_clicks INTEGER DEFAULT 0,
  last_clicked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_links_code ON links(code);
CREATE INDEX idx_links_created_at ON links(created_at DESC);
```

### Step 4: Configure Environment Variables

Create `.env.local` in the project root:

```bash
DATABASE_URL=postgresql://your-username:your-password@your-host.neon.tech/neondb
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Replace `DATABASE_URL` with your actual Neon connection string.

### Step 5: Install Dependencies

```bash
npm install
```

This will install all required packages (Next.js, React, Tailwind, etc.).

### Step 6: Run the Development Server

```bash
npm run dev
```

The app will start at [http://localhost:3000](http://localhost:3000)

### Step 7: Test the Application

1. Open your browser to `http://localhost:3000`
2. You should see the TiniLink dashboard
3. Click "Add Link" to create your first short link
4. Try creating a link with a custom code (e.g., "github" → "https://github.com")
5. Visit `http://localhost:3000/github` to test the redirect

## Verify Everything Works

### Test the Health Check
```bash
curl http://localhost:3000/healthz
```

Expected output:
```json
{
  "ok": true,
  "version": "1.0",
  "uptime": "15s",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Test Creating a Link
```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"targetUrl":"https://example.com","customCode":"test01"}'
```

### Test the Redirect
Open `http://localhost:3000/test01` in your browser - you should be redirected to example.com.

## Deploy to Production

### Option 1: Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables**
   In Vercel project settings, add:
   - `DATABASE_URL`: Your Neon connection string
   - `NEXT_PUBLIC_BASE_URL`: Your Vercel URL (e.g., `https://tinilink.vercel.app`)

4. **Deploy**
   - Click "Deploy"
   - Wait 1-2 minutes
   - Your app will be live!

5. **Update Base URL** (After first deploy)
   - Copy your Vercel URL
   - Update `NEXT_PUBLIC_BASE_URL` in Vercel settings
   - Redeploy (or it will auto-deploy on next push)

### Option 2: Deploy to Render

1. Go to [render.com](https://render.com)
2. Create a "New Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add environment variables
6. Click "Create Web Service"

### Option 3: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Create a new project from GitHub
3. Add environment variables
4. Railway will auto-deploy

## Project Structure Overview

```
TiniLinkAssignment/
├── app/
│   ├── page.tsx              # Dashboard (/)
│   ├── [code]/route.ts       # Redirect handler
│   ├── code/[code]/page.tsx  # Stats page
│   ├── api/links/            # API endpoints
│   └── healthz/route.ts      # Health check
├── lib/
│   └── db.ts                 # Database connection
├── .env.local                # Your local config (not in git)
├── .env.example              # Template
└── package.json              # Dependencies
```

## Understanding the Code

### Database Connection (`lib/db.ts`)

Uses Neon's serverless driver for PostgreSQL connections. The `sql` function is used throughout to run queries.

### API Routes (`app/api/links/`)

Next.js API routes handle:
- `POST /api/links` - Create new link
- `GET /api/links` - List all links
- `GET /api/links/:code` - Get one link
- `DELETE /api/links/:code` - Delete link

### Pages (`app/`)

- `page.tsx` - Dashboard with table and form
- `code/[code]/page.tsx` - Stats page
- `[code]/route.ts` - Redirect logic

### Styling

Tailwind CSS classes are used throughout for styling. All global styles are in `app/globals.css`.

## Common Issues & Solutions

### Issue: Database Connection Error

**Solution**:
- Verify `DATABASE_URL` in `.env.local`
- Check Neon database is active (may sleep on free tier)
- Ensure connection string includes `?sslmode=require`

### Issue: Port Already in Use

**Solution**:
```bash
PORT=3001 npm run dev
```

### Issue: TypeScript Errors

**Solution**:
```bash
npm run build
```
Check the output for specific errors.

### Issue: Redirect Not Working

**Solution**:
- Check the link exists in database
- Verify code format matches `[A-Za-z0-9]{6,8}`
- Check browser console for errors

### Issue: Environment Variables Not Working

**Solution**:
- Restart dev server after changing `.env.local`
- For production, redeploy after changing env vars

## Development Tips

### Hot Reload
Changes to code will auto-reload the browser. If not:
- Save the file again
- Restart the dev server

### Database Viewer
Use Neon's SQL Editor to view data:
```sql
SELECT * FROM links ORDER BY created_at DESC;
```

### Clear Database
To start fresh:
```sql
DELETE FROM links;
```

### Logs
- **Local**: Check your terminal where `npm run dev` is running
- **Vercel**: View logs in Vercel dashboard
- **Render**: View logs in Render dashboard

## Next Steps

1. **Customize Styling**: Edit `app/globals.css` and Tailwind classes
2. **Add Features**: See `PROJECT_SUMMARY.md` for ideas
3. **Test Edge Cases**: See `API_TESTING.md` for test cases
4. **Monitor Usage**: Check Vercel/Render analytics

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Vercel Deployment](https://vercel.com/docs)

## Need Help?

1. Check this guide first
2. Review error messages carefully
3. Check the other documentation files:
   - `README.md` - Full documentation
   - `QUICKSTART.md` - 5-minute setup
   - `DEPLOYMENT.md` - Deployment details
   - `API_TESTING.md` - API examples
   - `PROJECT_SUMMARY.md` - Technical overview

## Assignment Submission

Before submitting:
1. ✅ Test all features locally
2. ✅ Deploy to Vercel
3. ✅ Test production deployment
4. ✅ Verify health check works
5. ✅ Test API endpoints
6. ✅ Check responsive design
7. ✅ Submit your Vercel URL

Good luck with your assignment!
