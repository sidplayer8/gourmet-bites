# Gourmet Bites Admin Portal

Separate admin portal deployment for Gourmet Bites restaurant management.

## Deploy Instructions

### Option 1: Deploy as Separate Vercel Project

1. Navigate to admin-portal folder:
```bash
cd admin-portal
```

2. Deploy to Vercel:
```bash
vercel --prod
```

3. When prompted, create a NEW project named `gourmet-bites-admin`

4. Your admin portal will be available at:
   - `gourmet-bites-admin.vercel.app` (or custom domain)

### Option 2: Link to Existing Vercel Project

If you prefer a subdomain like `admin.gourmet-bites.com`:

1. Deploy as above
2. In Vercel dashboard, add a custom domain:
   - Project Settings → Domains
   - Add: `admin.your-domain.com`

## Admin Credentials

- **Username:** `sidplayer8`
- **Password:** `adithidumb`

**Security Note:** These credentials are currently hardcoded. For production, implement proper backend authentication.

## Features

- Dedicated admin login page
- Separate from customer portal
- Secure URL (not linked from main site)
- Restaurant management interface

## Files

- `index.html` - Admin login page
- `style.css` - Shared styles
- `vercel.json` - Deployment configuration
