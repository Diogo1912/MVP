# Railway Deployment Guide for GOLEXAI

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Push your code to GitHub
3. **Environment Variables**: Prepare your secrets

## Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure your code is pushed to GitHub:
```bash
git init
git add .
git commit -m "Initial commit - Railway ready"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Railway will detect it's a Python/Django project

### 3. Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically create a PostgreSQL database
4. Note: Railway automatically sets `DATABASE_URL` environment variable

### 4. Configure Environment Variables

In Railway project settings, add these environment variables:

#### Required Variables

```
SECRET_KEY=your-secret-key-here-generate-a-long-random-string
DEBUG=False
OPENAI_API_KEY=your-openai-api-key
```

#### Optional Variables (for Google OAuth)

```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Optional Variables (for CORS)

```
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com,https://another-domain.com
```

#### For Encryption (if needed)

```
ENCRYPTION_KEY=your-encryption-key-here
```

**To generate SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

### 5. Configure Railway Service

1. Click on your **service** (the main app)
2. Go to **Settings** → **Deploy**
3. Set **Root Directory** to: `backend`
4. Set **Start Command** (should auto-detect from Procfile):
   ```
   python manage.py migrate && python manage.py collectstatic --noinput && gunicorn golexai.wsgi:application --bind 0.0.0.0:$PORT
   ```

### 6. Deploy

1. Railway will automatically deploy when you push to GitHub
2. Or click **"Deploy"** button manually
3. Watch the deployment logs

### 7. Create Superuser

After first deployment:

1. Go to your service → **Deployments** → Click on latest deployment
2. Open **"View Logs"**
3. Click **"Shell"** tab
4. Run:
   ```bash
   python manage.py createsuperuser
   ```
5. Follow prompts to create admin user

### 8. Access Your Application

1. Railway provides a public domain: `your-app-name.up.railway.app`
2. Access admin panel: `https://your-app-name.up.railway.app/admin/`
3. API endpoints: `https://your-app-name.up.railway.app/api/`

### 9. Set Custom Domain (Optional)

1. Go to **Settings** → **Networking**
2. Click **"Custom Domain"**
3. Add your domain and configure DNS

## Frontend Deployment

### Option 1: Railway Static Site

1. Create a new service in Railway
2. Select **"Empty Service"**
3. Add GitHub repository
4. Set **Root Directory** to: `frontend`
5. Set **Build Command**: (none needed for static files)
6. Set **Start Command**: `python3 -m http.server 3000`
7. Update `CORS_ALLOWED_ORIGINS` in backend to include frontend URL

### Option 2: Separate Static Hosting

Deploy frontend to:
- **Vercel** (recommended for static sites)
- **Netlify**
- **Railway Static**

Update `API_BASE_URL` in `frontend/js/api.js` to your backend URL.

## Environment Variables Summary

### Backend (Railway)

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | ✅ Yes | Django secret key |
| `DEBUG` | ✅ Yes | Set to `False` |
| `OPENAI_API_KEY` | ✅ Yes | OpenAI API key |
| `DATABASE_URL` | ✅ Auto | Automatically set by Railway PostgreSQL |
| `RAILWAY_PUBLIC_DOMAIN` | ✅ Auto | Automatically set by Railway |
| `GOOGLE_CLIENT_ID` | No | For Google OAuth |
| `GOOGLE_CLIENT_SECRET` | No | For Google OAuth |
| `CORS_ALLOWED_ORIGINS` | No | Comma-separated frontend URLs |
| `ENCRYPTION_KEY` | No | For data encryption |

### Frontend (if separate)

| Variable | Required | Description |
|----------|----------|-------------|
| `API_BASE_URL` | ✅ Yes | Backend API URL |

## Post-Deployment Checklist

- [ ] Database migrations ran successfully
- [ ] Static files collected successfully
- [ ] Admin user created
- [ ] API endpoints accessible
- [ ] Frontend can connect to backend
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Custom domain configured (if needed)

## Troubleshooting

### Database Connection Issues

Railway automatically provides `DATABASE_URL`. If you see connection errors:
1. Check PostgreSQL service is running
2. Verify `DATABASE_URL` is set in environment variables
3. Check deployment logs for connection errors

### Static Files Not Loading

1. Verify `whitenoise` is in requirements.txt
2. Check `STATIC_ROOT` is set correctly
3. Ensure `collectstatic` runs during deployment
4. Check `STATICFILES_STORAGE` setting

### CORS Errors

1. Add frontend URL to `CORS_ALLOWED_ORIGINS`
2. Include protocol (`https://`)
3. No trailing slashes
4. Restart service after changing env vars

### 500 Errors

1. Check deployment logs
2. Verify all required environment variables are set
3. Check database migrations completed
4. Verify `SECRET_KEY` is set

## Monitoring

Railway provides:
- **Logs**: Real-time deployment and runtime logs
- **Metrics**: CPU, Memory, Network usage
- **Deployments**: History of all deployments

## Backup Strategy

1. **Database Backups**: Railway PostgreSQL includes automatic backups
2. **Manual Backup**: Use Railway CLI or admin panel
3. **Export Data**: Use Django `dumpdata` command via Railway shell

## Cost Considerations

- **Railway Free Tier**: $5/month credit
- **PostgreSQL**: ~$5/month for small database
- **Compute**: Pay as you go after free tier

## Security Notes

- ✅ Never commit `.env` files
- ✅ Use strong `SECRET_KEY`
- ✅ Set `DEBUG=False` in production
- ✅ Use HTTPS (Railway provides automatically)
- ✅ Regularly update dependencies
- ✅ Use Railway's built-in secrets management

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Django Deployment: https://docs.djangoproject.com/en/stable/howto/deployment/

## Quick Reference Commands

```bash
# Railway CLI (install: npm i -g @railway/cli)
railway login
railway link
railway up
railway logs
railway shell  # Access Django shell
```

