# Workout Tracker

3-day full body circuit training tracker with warm-ups, plyo primers, per-set weight logging, rest timers, RPE tracking, and fully editable exercises.

## Deploy to Vercel

### Step 1 — Push to GitHub
1. Go to [github.com/new](https://github.com/new) and create a new repository (e.g. `workout-tracker`)
2. Unzip this project and open a terminal in the folder
3. Run:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/workout-tracker.git
   git push -u origin main
   ```

### Step 2 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign up / log in with your GitHub account
2. Click **"Add New Project"**
3. Import your `workout-tracker` repository
4. Vercel auto-detects Vite — leave all settings as default
5. Click **Deploy**
6. Done — you'll get a live URL like `workout-tracker.vercel.app`

### Step 3 — Add to your phone
1. Open your Vercel URL on your phone's browser
2. **iOS:** Tap Share → "Add to Home Screen"
3. **Android:** Tap ⋮ menu → "Add to Home Screen"

## Custom Domain (optional)
In Vercel dashboard → your project → Settings → Domains → add your custom domain and follow the DNS instructions.

## Tech
- React 18 + Vite
- Zero dependencies beyond React
- All data stored in localStorage (persists in your browser)
