# Deploy Storyforge to the Cloud (Free & Simple) 🚀

Use Storyforge on your **Android phone right now** while you wait for your PC!

## What You'll Have:
- ✅ Access from any device (phone, tablet, computer)
- ✅ Completely free (Vercel + Render free tiers)
- ✅ Works offline on your phone (can add later)
- ✅ Syncs everything to cloud

---

## Step 1: Create Free Accounts (One Time)

### Account 1: GitHub (Free)
1. Go to: https://github.com/signup
2. Sign up with your email
3. Done!

### Account 2: Vercel (Free Frontend Hosting)
1. Go to: https://vercel.com/signup
2. Click "Continue with GitHub"
3. Click "Authorize"
4. Done!

### Account 3: Render (Free Backend Hosting)
1. Go to: https://render.com
2. Click "Sign Up"
3. Click "Continue with GitHub"
4. Click "Authorize"
5. Done!

---

## Step 2: Push Your Code to GitHub (Just Copy-Paste)

Go to: https://github.com/new

1. **Repository name**: `Storyforge` (keep it exactly like this)
2. **Description**: `AI-powered manuscript editor`
3. Click "Create repository"

You'll see a box with commands. Copy all commands under:
**"…or push an existing repository from the command line"**

Open your computer terminal and paste those commands.

---

## Step 3: Deploy Frontend on Vercel (Click & Done!)

1. Go to: https://vercel.com/new
2. Click "Import Git Repository"
3. Search for "Storyforge" and click it
4. Click "Import"
5. Click "Deploy"
6. **Wait 2-3 minutes...**
7. You'll get a link! Example: `https://storyforge-abc123.vercel.app`

**That's your app!** 🎉

---

## Step 4: Deploy Backend on Render (Click & Done!)

1. Go to: https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Click "Build and deploy from a Git repository"
4. Click "Connect account" (if needed)
5. Search and select "Storyforge"
6. Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `storyforge-api` |
| **Environment** | `Python 3.11` |
| **Build Command** | `pip install -r backend/requirements.txt` |
| **Start Command** | `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

7. Click "Create Web Service"
8. **Wait 3-5 minutes...**
9. When it says "Live", you'll get a link! Example: `https://storyforge-api-xyz.onrender.com`

---

## Step 5: Connect Frontend to Backend

Your frontend needs to know where your backend is.

1. Go to your Vercel project: https://vercel.com/dashboard
2. Click on "Storyforge"
3. Click "Settings" → "Environment Variables"
4. Click "Add New"
5. Fill in:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://storyforge-api-xyz.onrender.com/api/v1` (replace with YOUR Render URL)
6. Click "Save"
7. Go back to "Deployments" and click "Redeploy" on the latest deployment

**Wait 1-2 minutes for it to rebuild...**

---

## Step 6: Use It on Your Android Phone! 📱

1. Open your phone browser
2. Go to your Vercel link (e.g., `https://storyforge-abc123.vercel.app`)
3. **Start writing!** ✏️

---

## That's It! 🎊

Your app is now **live and free**!

- **Frontend URL**: `https://storyforge-abc123.vercel.app`
- **Works on**: Phone, tablet, computer (any browser)
- **Costs**: $0/month
- **No installation needed**: Just open a link

---

## Making Changes

When you want to add features later:

1. Make changes on your computer
2. Push to GitHub: `git add . && git commit -m "Your message" && git push`
3. Vercel & Render **auto-deploy** (5-10 mins)
4. Refresh your phone browser = instant updates!

---

## How to Get Your Links Again

- **Frontend**: Go to vercel.com → Storyforge → copy the domain
- **Backend**: Go to render.com → storyforge-api → copy the link

---

## Next Steps

When you get your Windows PC:
- You can deploy new features the same way
- Or develop locally and push to GitHub
- Same links work everywhere!

**Enjoy Storyforge on your phone!** 🚀📱
