# Quick Start Guide

Get TiniLink running locally in under 5 minutes!

## Prerequisites

- Node.js 18 or higher
- A Neon Postgres database (free at [neon.tech](https://neon.tech))

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy your connection string
4. Run this SQL in the Neon SQL Editor:

```sql
CREATE TABLE links (
  id SERIAL PRIMARY KEY,
  code VARCHAR(8) UNIQUE NOT NULL,
  target_url TEXT NOT NULL,
  total_clicks INTEGER DEFAULT 0,
  last_clicked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Configure Environment

Create `.env.local`:

```bash
DATABASE_URL=postgresql://user:password@host/database
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Replace `DATABASE_URL` with your Neon connection string.

### 4. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Test It Out

### Create a Link
1. Click "Add Link"
2. Enter a URL: `https://github.com`
3. (Optional) Add custom code: `github`
4. Click "Create Short Link"

### Use the Short Link
- Visit: `http://localhost:3000/github`
- You'll be redirected to GitHub!

### View Stats
- Click the short code in the dashboard
- See total clicks and timestamps

### Test the API

Health Check:
```bash
curl http://localhost:3000/healthz
```

Create Link:
```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"targetUrl":"https://example.com","customCode":"test01"}'
```

Get All Links:
```bash
curl http://localhost:3000/api/links
```

Get One Link:
```bash
curl http://localhost:3000/api/links/test01
```

Delete Link:
```bash
curl -X DELETE http://localhost:3000/api/links/test01
```

## Common Issues

### Port Already in Use
```bash
# Run on a different port
PORT=3001 npm run dev
```

### Database Connection Error
- Check your `DATABASE_URL` is correct
- Ensure Neon database is active
- Verify you're using `.env.local` (not `.env`)

### TypeScript Errors
```bash
# Check for errors
npm run build
```

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guide
- Customize styling in `app/globals.css`
- Add features and iterate!

## Project Structure

```
TiniLinkAssignment/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── [code]/route.ts       # Redirect handler
│   ├── code/[code]/page.tsx  # Stats page
│   ├── api/links/            # API endpoints
│   └── healthz/route.ts      # Health check
├── lib/
│   └── db.ts                 # Database utilities
└── .env.local                # Your environment variables
```

## Need Help?

- Check the console for error messages
- Review the README.md for detailed documentation
- Ensure all environment variables are set correctly
- Verify Node.js version: `node --version` (should be 18+)

Happy link shortening!
