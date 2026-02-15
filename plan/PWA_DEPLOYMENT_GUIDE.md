# PWA Deployment Guide - Workout Planner

**Last Updated:** 2026-02-15  
**App:** Workout Planner  
**Platform:** Progressive Web App (PWA)

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Setup](#local-setup)
3. [Building for Production](#building-for-production)
4. [Deployment Options](#deployment-options)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)
7. [iOS Installation](#ios-installation)

---

## Prerequisites

### Required Software
- **Node.js** 20 or higher
- **npm** 10 or higher
- **Git** (for version control)

### Required Accounts (depending on deployment method)
- GitHub account (free)
- Netlify/Vercel/Firebase account (free tier available)

### Check Your Environment
```bash
node --version    # Should be v20.x or higher
npm --version     # Should be 10.x or higher
```

---

## Local Setup

### 1. Navigate to Project
```bash
cd WorkoutPlanner
```

### 2. Install Dependencies

**Option A: Standard Install (Recommended)**
```bash
# Delete old dependencies
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item package-lock.json -Force -ErrorAction SilentlyContinue

# Fresh install
npm install --force
```

**Option B: If Vite is Missing**
```bash
npm install vite @vitejs/plugin-react vite-plugin-pwa react-native-web react-dom --save-dev --force
```

### 3. Verify Installation
```bash
# Check if Vite is installed
npx vite --version

# Should output: vite/x.x.x
```

### 4. Run Development Server
```bash
npm run web
```

Visit http://localhost:3000 - you should see the Workout Planner app running in your browser.

**Troubleshooting Local Setup:**
- If "vite not found": Run `npm install vite --save-dev --force`
- If port 3000 in use: Kill process or change port in `vite.config.js`
- If blank screen: Check browser console for errors

---

## Building for Production

### 1. Create Production Icons

Replace placeholder icons in `public/` folder:
- **icon-192.png** - 192x192 pixels
- **icon-512.png** - 512x512 pixels

**Icon Requirements:**
- PNG format
- Transparent or solid background
- Square aspect ratio
- Simple, recognizable design

**Quick Icon Generation:**
- Use [favicon.io](https://favicon.io/) or [realfavicongenerator.net](https://realfavicongenerator.net/)
- Upload a logo or image
- Download PNG files in required sizes

### 2. Update Manifest (Optional)

Edit `public/manifest.json` to customize:
```json
{
  "name": "Your App Name",
  "short_name": "Short Name",
  "description": "Your app description",
  "theme_color": "#your-color",
  "background_color": "#your-color"
}
```

### 3. Build the App

```bash
npm run web:build
```

This creates a `dist/` folder with:
- Optimized JavaScript bundles
- HTML files
- Service worker
- PWA manifest
- Static assets

**Build Output:**
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
├── icon-192.png
├── icon-512.png
├── manifest.webmanifest
└── sw.js (service worker)
```

### 4. Test Production Build Locally

```bash
npm run web:preview
```

Visit http://localhost:4173 to test the production build.

**What to Test:**
- ✅ App loads correctly
- ✅ All screens/features work
- ✅ Icons appear correctly
- ✅ Can "Add to Home Screen" (mobile)
- ✅ Works offline after first load

---

## Deployment Options

### Option 1: Netlify (Easiest - Recommended)

#### Method A: Drag & Drop
1. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the `dist` folder onto the upload area
3. Wait for deployment
4. Get your URL: `https://random-name.netlify.app`

#### Method B: GitHub Integration (Auto-Deploy)
1. Push code to GitHub repository
2. Go to [Netlify](https://netlify.com) and sign in
3. Click "New site from Git"
4. Select your repository
5. Configure build settings:
   - **Base directory:** `WorkoutPlanner`
   - **Build command:** `npm run web:build`
   - **Publish directory:** `WorkoutPlanner/dist`
6. Click "Deploy site"

**Custom Domain (Optional):**
1. Go to Site settings → Domain management
2. Add custom domain
3. Configure DNS as instructed

**Free Features:**
- HTTPS automatic
- Continuous deployment
- 100GB bandwidth/month
- Custom domains
- Preview deployments

---

### Option 2: Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your repository
5. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `WorkoutPlanner`
   - **Build Command:** `npm run web:build`
   - **Output Directory:** `dist`
6. Click "Deploy"

**Free Features:**
- HTTPS automatic
- Edge network (fast globally)
- Custom domains
- Preview deployments
- Analytics

---

### Option 3: GitHub Pages

1. **Build the app:**
```bash
npm run web:build
```

2. **Create gh-pages branch:**
```bash
cd dist
git init
git add .
git commit -m "Deploy PWA"
git branch -M gh-pages
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -f origin gh-pages
```

3. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: gh-pages branch
   - Save

4. **Visit:** `https://YOUR-USERNAME.github.io/YOUR-REPO`

**Notes:**
- Free for public repositories
- HTTPS automatic
- Custom domain supported

---

### Option 4: Firebase Hosting

1. **Install Firebase CLI:**
```bash
npm install -g firebase-tools
```

2. **Login:**
```bash
firebase login
```

3. **Initialize:**
```bash
cd WorkoutPlanner
firebase init hosting
```

Configure:
- Public directory: `dist`
- Single-page app: Yes
- GitHub auto-deploys: No (or Yes if desired)

4. **Deploy:**
```bash
npm run web:build
firebase deploy
```

**Free Features:**
- 10GB storage
- HTTPS automatic
- Custom domain
- Fast global CDN

---

### Option 5: Any Static Host

Upload the `dist` folder to any static hosting:
- **AWS S3 + CloudFront**
- **Azure Static Web Apps**
- **DigitalOcean App Platform**
- **Cloudflare Pages**
- **Render**
- **Surge.sh**

**Steps:**
1. Build: `npm run web:build`
2. Upload entire `dist/` folder
3. Configure to serve `index.html` for all routes
4. Enable HTTPS

---

## Post-Deployment

### 1. Test PWA Functionality

#### On Desktop Chrome:
1. Visit your deployed URL
2. Open DevTools (F12)
3. Go to Application tab
4. Check:
   - ✅ Manifest loads correctly
   - ✅ Service Worker registers
   - ✅ Icons appear
5. Try "Install" prompt (address bar icon)

#### On Mobile (Android Chrome):
1. Visit URL in Chrome
2. Wait for "Add to Home Screen" prompt
3. Add to home screen
4. Open from home screen
5. Verify:
   - ✅ Opens as standalone app
   - ✅ No browser UI
   - ✅ Icon correct
   - ✅ Works offline (after first load)

#### On Mobile (iOS Safari):
1. Visit URL in Safari
2. Tap Share button
3. Scroll and tap "Add to Home Screen"
4. Name the app and add
5. Open from home screen

**Note:** iOS PWA limitations:
- No install prompt (manual only)
- Limited background features
- No push notifications
- Storage limits (50MB)

### 2. Verify HTTPS

PWAs **require** HTTPS in production. Check:
```
https://your-domain.com (✅ HTTPS)
http://your-domain.com  (❌ Won't work as PWA)
```

All recommended deployment platforms provide free HTTPS.

### 3. Test Offline Mode

1. Load app online
2. Open DevTools → Network tab
3. Check "Offline"
4. Refresh page
5. App should still load from cache

### 4. Update App Content (Future Updates)

To update the deployed app:
1. Make code changes
2. Run `npm run web:build`
3. Re-deploy (method depends on platform)
4. Service worker will update automatically
5. Users get update on next visit/refresh

---

## iOS Installation Guide

### For End Users:

**Installing Workout Planner on iPhone/iPad:**

1. **Open Safari** (must use Safari, not Chrome)
   - Go to your PWA URL: `https://your-app-url.com`

2. **Add to Home Screen:**
   - Tap the Share button (square with arrow pointing up)
   - Scroll down and tap "Add to Home Screen"
   - Edit the name if desired
   - Tap "Add"

3. **Open the App:**
   - Find the icon on your home screen
   - Tap to open - it opens fullscreen like a native app

**Features on iOS:**
- ✅ Works offline
- ✅ Fullscreen app experience
- ✅ Saves data locally
- ✅ Fast loading
- ❌ No push notifications (iOS limitation)
- ❌ Limited background sync

**Troubleshooting iOS:**
- If icon doesn't appear: Check if you used Safari (required)
- If opens in browser: Try re-adding from Safari
- If data doesn't save: Check Safari settings → Advanced → Website Data

---

## Troubleshooting

### Build Errors

**Error: "vite: command not found"**
```bash
npm install vite --save-dev --force
```

**Error: "Cannot find module 'vite'"**
```bash
rm -rf node_modules package-lock.json
npm install --force
```

**Error: Peer dependency conflicts**
```bash
npm install --legacy-peer-deps
# or
npm install --force
```

### Deployment Issues

**PWA not installing on mobile**
- Ensure HTTPS is enabled
- Check manifest.json is accessible
- Verify icons exist and are correct format
- Clear browser cache and try again

**Service worker not registering**
- Check browser console for errors
- Verify app is served over HTTPS
- Check service worker file is in root of dist
- Try hard refresh (Ctrl+Shift+R)

**App shows blank screen**
- Check browser console for errors
- Verify build completed successfully
- Check that base path is configured correctly
- Test locally with `npm run web:preview`

**Offline mode not working**
- Service worker must register first (requires initial online visit)
- Check Application → Service Workers in DevTools
- Verify cache storage populated
- Some resources may not cache (external APIs)

### Performance Issues

**Slow initial load**
- Use CDN for deployment
- Enable gzip/brotli compression
- Optimize images
- Check bundle size with `npm run web:build --stats`

**App freezes or crashes**
- Check for memory leaks in components
- Reduce re-renders
- Lazy load heavy components
- Test on actual devices

---

## Quick Reference

### Development Commands
```bash
npm run web              # Start dev server
npm run web:build        # Build for production
npm run web:preview      # Preview production build
```

### Deployment Checklist
- [ ] Replace placeholder icons
- [ ] Update manifest.json
- [ ] Run production build
- [ ] Test locally with preview
- [ ] Deploy to hosting platform
- [ ] Verify HTTPS
- [ ] Test PWA install on mobile
- [ ] Test offline functionality
- [ ] Share URL with users

### Deployment URLs (Examples)
- Netlify: `https://workout-planner.netlify.app`
- Vercel: `https://workout-planner.vercel.app`
- GitHub Pages: `https://username.github.io/workout-planner`
- Firebase: `https://workout-planner.web.app`

---

## Support & Resources

### Official Documentation
- [Vite](https://vitejs.dev/)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [React Native Web](https://necolas.github.io/react-native-web/)
- [Workbox](https://developers.google.com/web/tools/workbox)

### Testing Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - PWA audit
- [PWA Builder](https://www.pwabuilder.com/) - Validate PWA
- [webhint](https://webhint.io/) - Web best practices

### Icon Generators
- [favicon.io](https://favicon.io/)
- [realfavicongenerator.net](https://realfavicongenerator.net/)
- [app-manifest.firebaseapp.com](https://app-manifest.firebaseapp.com/)

---

## Next Steps

After successful deployment:

1. **Share your app:** Send URL to users
2. **Monitor usage:** Set up analytics (Google Analytics, Plausible)
3. **Collect feedback:** Get user feedback on PWA experience
4. **Optimize:** Use Lighthouse to identify improvements
5. **Update regularly:** Deploy updates as needed

**iOS-specific instructions:** Send users to this guide's [iOS Installation](#ios-installation-guide) section

---

## License & Credits

**Workout Planner PWA**
- Built with React Native Web
- Powered by Vite
- PWA capabilities by Vite PWA Plugin

---

**Questions or Issues?**
Check troubleshooting section or review error logs in `logs/` folder.

**Congratulations! Your Workout Planner is now accessible on any device with a web browser! 🎉**
