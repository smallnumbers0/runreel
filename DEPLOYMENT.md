# RunReel Deployment Guide

## Build Status ✅

The project builds successfully and is ready for deployment to Vercel!

## Pre-Deployment Checklist

### 1. Supabase Setup (Required)

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to SQL Editor and run the contents of `supabase-schema.sql`
4. Go to Settings > API to get:
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - Anon/Public key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - Service role key (`SUPABASE_SERVICE_ROLE_KEY`)

### 2. Strava App Setup (Required)

1. Go to [Strava API Settings](https://www.strava.com/settings/api)
2. Create a new application:
   - Application Name: RunReel
   - Category: Social Motivation
   - Club: (leave blank)
   - Website: Your app URL
   - Authorization Callback Domain: `localhost` (for testing)
3. Note your:
   - Client ID (`STRAVA_CLIENT_ID`)
   - Client Secret (`STRAVA_CLIENT_SECRET`)

### 3. Environment Variables

Generate a NextAuth secret:
```bash
openssl rand -base64 32
```

## Vercel Deployment Steps

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial RunReel deployment"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Strava
STRAVA_CLIENT_ID=your-client-id
STRAVA_CLIENT_SECRET=your-client-secret
STRAVA_REDIRECT_URI=https://your-app.vercel.app/api/auth/callback/strava

# NextAuth
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-generated-secret
```

4. Click Deploy!

### 3. Post-Deployment

1. Update Strava App:
   - Go back to Strava API settings
   - Update Authorization Callback Domain to your Vercel domain
   - Add `https://your-app.vercel.app/api/auth/callback/strava`

2. Test the deployment:
   - Visit your Vercel URL
   - Connect with Strava
   - Sync and view your runs

## Important Notes

### Video Generation
The current implementation uses placeholder videos for the MVP. To enable real video generation:
1. Set up a background worker service
2. Implement Remotion server-side rendering
3. Configure Supabase Storage bucket for video files

### Production Considerations

1. **Rate Limits**: Strava API has limits (600 requests/15 min)
2. **Storage**: Supabase free tier has 1GB storage limit
3. **Functions**: Vercel serverless functions have 10-second timeout on free tier
4. **Security**: Ensure all environment variables are properly set

## Troubleshooting

### Build Issues
- Ensure all dependencies are installed: `npm install`
- Check TypeScript errors: `npm run build`

### Authentication Issues
- Verify Strava callback URL matches exactly
- Check NextAuth secret is set correctly
- Ensure Supabase project is active

### Map Display Issues
- MapLibre uses OpenStreetMap tiles (no API key needed)
- Check browser console for errors
- Verify polyline data is present in Strava activities

## Next Steps

1. **Enable Real Video Generation**:
   - Set up Remotion rendering pipeline
   - Configure video storage in Supabase
   - Implement queue system for processing

2. **Add Features**:
   - Custom video templates
   - Music integration
   - Social sharing
   - Activity statistics

3. **Optimize Performance**:
   - Implement caching
   - Add loading states
   - Optimize image/video delivery

## Support

For deployment issues:
- Check [Vercel Docs](https://vercel.com/docs)
- Review [Supabase Docs](https://supabase.com/docs)
- Open an issue on GitHub

---

Successfully tested and ready for production deployment! 🚀