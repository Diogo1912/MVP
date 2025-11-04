# Railway Quick Start - 5 Minute Deployment

## 🚀 Fast Track

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Railway ready"
git remote add origin <your-repo>
git push -u origin main
```

### 2. Deploy on Railway

1. **Go to**: https://railway.app
2. **Click**: "New Project" → "Deploy from GitHub repo"
3. **Select**: Your repository
4. **Add PostgreSQL**: Click "+ New" → "Database" → "Add PostgreSQL"

### 3. Set Environment Variables

In Railway → Your Service → Variables, add:

```
SECRET_KEY=<generate-with-python-c-secrets-token_urlsafe-50>
DEBUG=False
OPENAI_API_KEY=your-key-here
```

**Generate SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

### 4. Configure Service

- **Root Directory**: `backend`
- Railway auto-detects start command from Procfile ✅

### 5. Deploy!

Railway automatically:
- ✅ Detects Python project
- ✅ Installs dependencies
- ✅ Runs migrations
- ✅ Collects static files
- ✅ Starts Gunicorn server

### 6. Create Admin User

After deployment:
1. Click on your service → "Shell"
2. Run: `python manage.py createsuperuser`
3. Follow prompts

### 7. Access Your App

- **API**: `https://your-app.up.railway.app/api/`
- **Admin**: `https://your-app.up.railway.app/admin/`

## ✅ That's It!

Your app is live on Railway with PostgreSQL!

---

**Full Guide**: See `RAILWAY_DEPLOYMENT.md` for detailed instructions.

