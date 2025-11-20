# Deployment Guide

This guide will walk you through deploying TiniLink to Vercel with Neon Postgres.

## Step 1: Set up Neon Database

1. Go to [neon.tech](https://neon.tech) and sign up for a free account
2. Create a new project
3. Copy your connection string (it looks like: `postgresql://user:password@host/database`)
4. Run the initialization script in the Neon SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS links (
  id SERIAL PRIMARY KEY,
  code VARCHAR(8) UNIQUE NOT NULL,
  target_url TEXT NOT NULL,
  total_clicks INTEGER DEFAULT 0,
  last_clicked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_links_code ON links(code);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at DESC);
```

## Step 2: Prepare Your Code

1. Ensure all code is committed to Git:
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Push to GitHub:
```bash
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure your project:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: ./
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

5. Add Environment Variables:
   - `DATABASE_URL`: Your Neon connection string
   - `NEXT_PUBLIC_BASE_URL`: Will be your Vercel URL (e.g., `https://tinilink.vercel.app`)

6. Click "Deploy"

## Step 4: Update Base URL

After your first deployment:

1. Copy your Vercel deployment URL (e.g., `https://tinilink.vercel.app`)
2. Go to your Vercel project settings
3. Update the `NEXT_PUBLIC_BASE_URL` environment variable with your actual URL
4. Redeploy (or it will auto-deploy on next push)

## Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Test the health check: `https://your-app.vercel.app/healthz`
3. Create a test link
4. Verify the redirect works
5. Check the stats page

## Alternative: Deploy to Render

1. Go to [render.com](https://render.com)
2. Create a new "Web Service"
3. Connect your GitHub repository
4. Configure:
   - Name: tinilink
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add environment variables:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_BASE_URL`
6. Create Web Service

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Check that Neon database is active (it may sleep on free tier)
- Ensure the connection string includes SSL parameters if required

### Build Failures
- Check that all dependencies are in `package.json`
- Verify TypeScript has no errors: `npm run build` locally
- Check build logs in Vercel/Render dashboard

### Environment Variables
- Make sure `NEXT_PUBLIC_BASE_URL` doesn't have trailing slash
- Verify all required env vars are set
- Redeploy after changing environment variables

### 404 on Redirect
- Check that the link exists in the database
- Verify the code format matches `[A-Za-z0-9]{6,8}`
- Check application logs for errors

## Post-Deployment

### Custom Domain (Optional)
1. In Vercel, go to Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_BASE_URL` to your custom domain

### Monitoring
- Check Vercel Analytics for usage stats
- Monitor Neon dashboard for database performance
- Review application logs for errors

### Backup
- Neon provides automatic backups on paid plans
- For free tier, periodically export data:
```sql
COPY links TO '/tmp/links_backup.csv' DELIMITER ',' CSV HEADER;
```

## Security Considerations

- Neon connections are SSL encrypted by default
- Consider adding rate limiting for production use
- Monitor for abuse (spam links, inappropriate content)
- Consider implementing CAPTCHA for link creation

## Cost Estimates

- **Neon Free Tier**: 0.5GB storage, 10GB data transfer/month
- **Vercel Free Tier**: 100GB bandwidth, unlimited deployments
- **Total**: $0/month for moderate usage

For higher traffic, consider:
- Neon Scale: ~$20/month
- Vercel Pro: $20/month

## Support

If you encounter issues:
1. Check the [Next.js documentation](https://nextjs.org/docs)
2. Review [Vercel deployment docs](https://vercel.com/docs)
3. Check [Neon documentation](https://neon.tech/docs)
4. Review application logs for error details
