#!/bin/bash

echo "Setting up Vercel environment variables..."

# Set all required environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production < /dev/stdin <<EOF
https://rqwmdsxpfqmzbhwzlshd.supabase.co
EOF

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production < /dev/stdin <<EOF
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxd21kc3hwZnFtemJod3psc2hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE0MjY5MTEsImV4cCI6MjA0NzAwMjkxMX0.NJkQOqnfyKrIrWBwvtIeqLGNGD0aCqTIKKh8yIzU3ic
EOF

vercel env add SUPABASE_SERVICE_ROLE_KEY production < /dev/stdin <<EOF
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxd21kc3hwZnFtemJod3psc2hkIiwicm9sZSI6InNlcnZpY2VfXJvbGUiLCJpYXQiOjE3MzE0MjY5MTEsImV4cCI6MjA0NzAwMjkxMX0.w5xb6D1cX7tJNcgfUWJ10K_Q_6hULWIvzJEzoQUiKpI
EOF

vercel env add STRAVA_CLIENT_ID production < /dev/stdin <<EOF
104687
EOF

vercel env add STRAVA_CLIENT_SECRET production < /dev/stdin <<EOF
93ff8d5c0c02049c5667432fec55a47927e06fda
EOF

vercel env add NEXTAUTH_SECRET production < /dev/stdin <<EOF
eZE1+oIEIrWMi0dmGCkMEBHT7ZyKB5wUe1wdy5IQB1s=
EOF

vercel env add NEXTAUTH_URL production < /dev/stdin <<EOF
https://runreel.vercel.app
EOF

echo "Environment variables set. Listing current environment variables:"
vercel env ls production