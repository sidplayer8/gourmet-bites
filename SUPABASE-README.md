# Supabase Database Setup - Quick Start

## ✅ What's Already Done
- ✅ Supabase JS client installed (`@supabase/supabase-js`)
- ✅ Database schema created (`supabase/migrations/20241209_initial_schema.sql`)
- ✅ Supabase client configured (`lib/supabase.js`)

## 🚀 Next Steps to Complete Setup

### Option A: Use Vercel Supabase Integration (Recommended)

1. Go to https://vercel.com/integrations/supabase
2. Click "Add Integration"
3. Select your `gourmet-bites` project
4. Create new Supabase project
5. After setup, go to Supabase SQL Editor
6. Copy and paste the entire contents of `supabase/migrations/20241209_initial_schema.sql`
7. Click "Run" to create all tables and seed data
8. Done! Environment variables auto-configured in Vercel

### Option B: Manual Supabase Setup

1. Go to https://supabase.com/dashboard
2. Create new project: `gourmet-bites`
3. Wait for database to provision
4. Go to SQL Editor
5. Run the migration file: `supabase/migrations/20241209_initial_schema.sql`
6. Get your API keys from Settings → API
7. Add to Vercel environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📊 Database Schema

The migration creates:
- **menu_items** - 8 items already seeded
- **orders** - for storing customer orders
- **users** - user profiles
- **admins** - admin access (default: admin@gourmetbites.com / admin123)

## 🔐 Security

- ✅ Row Level Security (RLS) enabled
- ✅ Public can read menu
- ✅ Users can create and view their own orders
- ✅ Indexes added for performance

## 📝 Test After Setup

Once you run the SQL migration, test in Supabase:
```sql
SELECT * FROM menu_items;
-- Should return 8 menu items
```

## ⚠️ Important

After running the migration, you MUST:
1. Change the default admin password
2. Update `lib/supabase.js` URL and key (or use env variables)
