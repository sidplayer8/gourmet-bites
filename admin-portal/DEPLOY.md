# Deploy Admin Portal to Vercel

## Quick Setup

### Step 1: Initialize Git in admin-portal
```bash
cd admin-portal
git init
git add .
git commit -m "Initial admin portal"
```

### Step 2: Create GitHub Repo
1. Go to https://github.com/new
2. Name: `gourmet-bites-admin`
3. Don't initialize with README
4. Copy the commands shown

### Step 3: Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/gourmet-bites-admin.git
git branch -M main
git push -u origin main
```

### Step 4: Deploy to Vercel
1. Go to https://vercel.com/new
2. Import your `gourmet-bites-admin` GitHub repo
3. Project Name: `gourmet-bites-admin`
4. Click "Deploy"

✅ Your admin portal will be live at: `gourmet-bites-admin.vercel.app`

---

## Alternative: Deploy from Main Repo

If you don't want a separate repo:

1. Push the `admin-portal` folder to your main repo
2. In Vercel dashboard:
   - Create New Project
   - Import your main repo
   - Root Directory: `admin-portal`
   - Project Name: `gourmet-bites-admin`
   - Deploy

---

## What's Inside admin-portal/

- `index.html` - Admin login page
- `style.css` - Styling
- `vercel.json` - Deployment config
- `package.json` - Project metadata

Admin credentials:
- Username: `sidplayer8`
- Password: `adithidumb`
