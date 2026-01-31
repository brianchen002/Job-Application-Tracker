# Deployment Guide

This guide covers deploying the Job Application Tracker to production.

## Prerequisites

- A hosting platform account (Vercel, Netlify, Railway, etc.)
- PostgreSQL or SQLite database (depending on platform)
- Git repository (for automatic deployments)

## Option 1: Vercel (Recommended)

Vercel provides the easiest deployment for Next.js apps.

### Steps

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**

   In Vercel dashboard, add:
   ```
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
   NEXTAUTH_URL="https://your-app.vercel.app"
   ```

4. **Deploy**

   Vercel will automatically build and deploy.

### Database Considerations

- SQLite works on Vercel but data persists only during the serverless function lifetime
- For production, consider upgrading to PostgreSQL:
  - Vercel Postgres
  - Supabase
  - Neon
  - PlanetScale

### Upgrading to PostgreSQL

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Update DATABASE_URL to PostgreSQL connection string:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   ```

3. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

## Option 2: Railway

Railway supports both SQLite and PostgreSQL out of the box.

### Steps

1. **Create Railway account** at [railway.app](https://railway.app)

2. **Create new project from GitHub**
   - Connect your repository
   - Railway auto-detects Next.js

3. **Add PostgreSQL database**
   - In Railway dashboard, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will provide DATABASE_URL automatically

4. **Set environment variables**
   ```
   NEXTAUTH_SECRET="your-secret"
   NEXTAUTH_URL="https://your-app.railway.app"
   ```

5. **Deploy**

   Railway automatically deploys on push to main branch.

## Option 3: Self-Hosted (VPS/Docker)

For full control, deploy to your own server.

### Using Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS deps
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci

   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npx prisma generate
   RUN npm run build

   FROM node:18-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV production
   COPY --from=builder /app/next.config.ts ./
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next ./.next
   COPY --from=builder /app/node_modules ./node_modules
   COPY --from=builder /app/package.json ./package.json
   COPY --from=builder /app/prisma ./prisma

   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and run**
   ```bash
   docker build -t job-tracker .
   docker run -p 3000:3000 \
     -e DATABASE_URL="your-db-url" \
     -e NEXTAUTH_SECRET="your-secret" \
     -e NEXTAUTH_URL="https://your-domain.com" \
     job-tracker
   ```

### Using PM2 (Node Process Manager)

1. **Install PM2**
   ```bash
   npm install -g pm2
   ```

2. **Build the app**
   ```bash
   npm run build
   ```

3. **Start with PM2**
   ```bash
   pm2 start npm --name "job-tracker" -- start
   pm2 save
   pm2 startup
   ```

## Database Migration in Production

Always run migrations before deployment:

```bash
npx prisma migrate deploy
```

For zero-downtime migrations:
1. Deploy backward-compatible schema changes
2. Update application code
3. Remove deprecated fields in next deployment

## Environment Variables Checklist

Required for all deployments:

- ✅ `DATABASE_URL` - Database connection string
- ✅ `NEXTAUTH_SECRET` - Auth secret (min 32 characters)
- ✅ `NEXTAUTH_URL` - Full app URL with https://

## Security Checklist

Before going live:

- [ ] Change NEXTAUTH_SECRET to a strong random value
- [ ] Use HTTPS (required for NextAuth)
- [ ] Set up database backups
- [ ] Enable rate limiting on API routes
- [ ] Review CORS settings if needed
- [ ] Set up monitoring and error tracking
- [ ] Configure proper CSP headers
- [ ] Review and update SSRF protection rules

## Performance Optimization

1. **Enable caching**
   - Add Redis for session storage
   - Cache job board parsing results

2. **Optimize images**
   - Add Next.js Image component if adding images
   - Use WebP format

3. **Database optimization**
   - Add indexes (already included in schema)
   - Set up connection pooling for PostgreSQL

4. **CDN**
   - Use Vercel's Edge Network
   - Or CloudFlare for static assets

## Monitoring

Recommended tools:
- Vercel Analytics (free for Vercel deployments)
- Sentry for error tracking
- Uptime Robot for uptime monitoring
- PostHog or Plausible for privacy-friendly analytics

## Backup Strategy

1. **Database backups**
   - Automated daily backups
   - Point-in-time recovery
   - Test restore procedure

2. **Code backups**
   - Git repository is your backup
   - Tag releases: `git tag v1.0.0`

## Troubleshooting

### Build fails
- Check Node.js version (18+)
- Ensure all dependencies installed
- Verify environment variables set

### Database connection fails
- Check DATABASE_URL format
- Ensure database is accessible from app
- Verify firewall rules

### Authentication not working
- Confirm NEXTAUTH_URL matches actual URL
- Check NEXTAUTH_SECRET is set
- Verify HTTPS is enabled (required)

### Slow performance
- Check database indexes
- Add caching layer
- Review database query performance
- Consider upgrading server resources

## Cost Estimation

### Free Tier Options
- **Vercel**: Free for hobby projects
- **Railway**: $5/month credit (includes DB)
- **Supabase**: Free PostgreSQL tier
- **Neon**: Free PostgreSQL tier

### Paid Tiers
- **Vercel Pro**: $20/month (team features)
- **Railway**: ~$10-20/month (app + DB)
- **VPS**: $5-10/month (DigitalOcean, Linode)

## Next Steps

After deployment:
1. Test all features in production
2. Set up monitoring
3. Configure backups
4. Share with users
5. Gather feedback
6. Iterate and improve

## Support

For deployment issues, check:
- Vercel/Railway documentation
- Next.js deployment docs
- GitHub issues
