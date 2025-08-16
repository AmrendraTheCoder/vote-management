# Frontend Deployment Guide

## 🚀 Deploy Frontend to Vercel

### Prerequisites

- Backend already deployed and URL obtained
- GitHub repository ready

### Step 1: Update Environment Variables

**Get your backend URL first**, then update these files:

#### For Development (.env)

```env
VITE_API_URL=http://localhost:5001/api
VITE_NODE_ENV=development
```

#### For Production (.env.production)

```env
VITE_API_URL=https://your-actual-backend-url.vercel.app/api
VITE_NODE_ENV=production
```

### Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Click "New Project"**
3. **Import your GitHub repository**: `https://github.com/AmrendraTheCoder/vote-management`
4. **Set root directory to `/` (main folder, not backend)**
5. **Framework preset**: Vite (should be auto-detected)

### Step 3: Configure Environment Variables

In Vercel project settings → Environment Variables, add:

```
VITE_API_URL = https://your-backend-url.vercel.app/api
VITE_NODE_ENV = production
```

### Step 4: Deploy & Test

1. **Click "Deploy"**
2. **Wait for deployment** (usually 2-3 minutes)
3. **Test your app** at the provided URL
4. **Verify mobile responsiveness**

## 🔧 Post-Deployment Steps

### Update Backend CORS

1. **Copy your frontend URL** (e.g., `https://vote-management-abc123.vercel.app`)
2. **Update backend environment variable** in Vercel:
   ```
   FRONTEND_URL = https://your-actual-frontend-url.vercel.app
   ```
3. **Redeploy backend** or wait for auto-deployment

## ✅ Verification Checklist

- [ ] Frontend loads correctly
- [ ] Mobile responsive design works
- [ ] Can add/edit/delete students
- [ ] Data persists (check MongoDB Atlas)
- [ ] Online/offline indicator works
- [ ] Export functionality works
- [ ] No CORS errors in browser console

## 🛠️ Troubleshooting

### Common Issues

**CORS Errors:**

- Check backend `FRONTEND_URL` environment variable
- Verify frontend URL is correct in backend settings

**API Not Working:**

- Check `VITE_API_URL` in frontend environment variables
- Test backend health endpoint: `https://your-backend.vercel.app/api/health`

**Build Failures:**

- Check all dependencies are in `package.json`
- Verify no import errors in components

## 📱 Mobile Testing

After deployment, test on:

- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] Desktop Chrome
- [ ] Desktop Safari
- [ ] Tablet views

## 🎯 Success Criteria

✅ **Full-stack application deployed**
✅ **Mobile-first design working**
✅ **Database integration functional**
✅ **CORS configured correctly**
✅ **Both development and production environments working**

---

**Your vote management app is now live! 🎉**
