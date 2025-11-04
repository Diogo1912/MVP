# Deployment Checklist

## Pre-Deployment

- [ ] Code pushed to GitHub
- [ ] All tests passing locally
- [ ] `DEBUG=False` in production settings
- [ ] `SECRET_KEY` generated and ready
- [ ] `OPENAI_API_KEY` ready
- [ ] Database migrations tested locally
- [ ] Static files collection tested (`python manage.py collectstatic`)

## Railway Setup

- [ ] Railway account created
- [ ] Project created from GitHub
- [ ] PostgreSQL database added
- [ ] Root directory set to `backend`
- [ ] All environment variables configured:
  - [ ] `SECRET_KEY`
  - [ ] `DEBUG=False`
  - [ ] `OPENAI_API_KEY`
  - [ ] `GOOGLE_CLIENT_ID` (if using OAuth)
  - [ ] `GOOGLE_CLIENT_SECRET` (if using OAuth)
  - [ ] `CORS_ALLOWED_ORIGINS` (frontend URLs)
  - [ ] `ENCRYPTION_KEY` (if needed)

## Post-Deployment

- [ ] First deployment successful
- [ ] Database migrations completed
- [ ] Static files collected
- [ ] Superuser created via Railway shell
- [ ] Admin panel accessible
- [ ] API endpoints responding
- [ ] Frontend can connect to backend
- [ ] CORS configured correctly
- [ ] HTTPS working (Railway default)

## Testing

- [ ] User registration/login works
- [ ] Document upload works
- [ ] AI chat responds
- [ ] Analytics endpoint works
- [ ] GDPR export works
- [ ] GDPR delete works
- [ ] Multi-language switching works

## Security

- [ ] `DEBUG=False` confirmed
- [ ] `SECRET_KEY` is strong and secret
- [ ] No sensitive data in code
- [ ] Environment variables properly set
- [ ] HTTPS enforced
- [ ] CORS properly configured

## Monitoring

- [ ] Railway logs accessible
- [ ] Error tracking set up (optional: Sentry)
- [ ] Performance monitoring (Railway metrics)

## Documentation

- [ ] API documentation updated with production URLs
- [ ] Frontend configured with production API URL
- [ ] Team notified of deployment

