# RunReel - Strava to Video Web App

Transform your Strava runs into stunning Instagram Story videos with animated route visualization.

## Features

- **Strava OAuth Integration**: Securely connect your Strava account
- **Activity Import**: Automatically fetch your last 10 running activities
- **Interactive Map**: Visualize routes using MapLibre GL with OpenStreetMap tiles
- **Animated Route Playback**: Watch your run progress with smooth animations
- **Video Generation**: Create 1080x1920 videos perfect for Instagram Stories
- **Cloud Storage**: Videos stored in Supabase Storage for easy access
- **Mobile-Friendly**: Responsive design optimized for all devices

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js with Strava OAuth
- **Database & Storage**: Supabase
- **Maps**: MapLibre GL JS (OSM tiles, no API key needed)
- **Animation**: Framer Motion
- **Video Generation**: Remotion
- **Deployment**: Vercel

## Prerequisites

1. **Strava API App**
   - Go to https://www.strava.com/settings/api
   - Create a new application
   - Note your Client ID and Client Secret

2. **Supabase Project**
   - Create a new project at https://supabase.com
   - Get your project URL and keys

3. **Node.js 18+** installed locally

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd runreel
npm install
```

### 2. Configure Supabase

Run the SQL schema in your Supabase SQL editor:

```sql
-- Copy contents from supabase-schema.sql
```

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Strava OAuth
STRAVA_CLIENT_ID=your-strava-client-id
STRAVA_CLIENT_SECRET=your-strava-client-secret
STRAVA_REDIRECT_URI=http://localhost:3000/api/auth/callback/strava

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-secret-key-here
```

Generate `NEXTAUTH_SECRET` with:
```bash
openssl rand -base64 32
```

### 4. Local Development

```bash
npm run dev
```

Visit http://localhost:3000

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Add environment variables in Vercel dashboard
4. Update `STRAVA_REDIRECT_URI` to `https://your-app.vercel.app/api/auth/callback/strava`
5. Deploy!

### 3. Update Strava App

Update your Strava app's Authorization Callback Domain to your Vercel domain.

## Project Structure

```
/app
  /api
    /auth/[...nextauth] - NextAuth.js endpoints
    /strava            - Strava API integration
    /video             - Video generation API
  /dashboard           - User's runs list
  /run/[id]           - Run detail with map
  /video/[id]         - Video player page
  page.tsx            - Landing page

/components
  Map.tsx             - MapLibre map component
  RunCard.tsx         - Run list item component
  VideoPlayer.tsx     - Video player with download

/lib
  auth.ts             - NextAuth configuration
  strava.ts           - Strava API helpers
  supabase-*.ts       - Supabase clients

/remotion
  RunVideo.tsx        - Remotion video composition
  Root.tsx            - Remotion root component
```

## Usage

1. **Connect Strava**: Click "Connect with Strava" on the landing page
2. **Authorize**: Grant RunReel access to your Strava activities
3. **Sync Activities**: Click "Sync with Strava" to import your runs
4. **Select Run**: Click on any run to view details and map
5. **Generate Video**: Click "Generate Video" to create your video
6. **Download/Share**: Download the video or share directly to Instagram

## Video Generation Notes

The current implementation uses a simplified video generation approach for the MVP. In production, you would:

1. Set up a worker/queue system for background processing
2. Use Remotion's server-side rendering for actual video generation
3. Upload generated videos to Supabase Storage
4. Consider using edge functions for better scalability

## Limitations

- Video generation is simulated (placeholder videos) in this MVP
- Remotion server-side rendering requires additional setup for production
- Rate limits apply to Strava API (600 requests per 15 minutes)
- Supabase free tier limits apply

## Future Enhancements

- Real video generation with Remotion
- Custom video templates and styles
- Pace/elevation graphs overlay
- Music integration
- Social sharing features
- Activity statistics dashboard
- Batch video generation
- Premium features (HD export, custom branding)

## License

MIT

## Support

For issues or questions, please open a GitHub issue or contact support.

---

Built with Next.js, Supabase, and Strava API
