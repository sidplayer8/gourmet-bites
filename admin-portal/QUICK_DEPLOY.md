# Quick Deploy Admin Portal (Without GitHub)

Since git push is blocked by secrets, let's deploy the admin portal folder directly to Vercel without GitHub.

## Steps:

### 1. Install Vercel CLI (if not already)
```bash
npm install -g vercel
```

### 2. Navigate to admin-portal folder
```bash
cd admin-portal
```

### 3. Deploy directly
```bash
vercel --prod
```

When prompted:
- "Set up and deploy?"  → **Yes**
- "Which scope?" → Select your team
- "Link to existing project?" → **No**
- "What's your project's name?" → `gourmet-bites-admin`
- "In which directory is your code located?" → `./`

### 4. Done!

Your admin portal will be deployed to `gourmet-bites-admin.vercel.app`

---

## Alternative: Upload Manually

1. Zip the `admin-portal` folder
2. Go to https://vercel.com/new
3. Drag and drop the zip file
4. Name: `gourmet-bites-admin`
5. Deploy

That's it!
