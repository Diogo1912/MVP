# GOLEXAI - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Backend Setup

```bash
cd backend

# Activate virtual environment (already created)
source venv/bin/activate

# Create .env file
cp .env.example .env

# Edit .env and add at minimum:
# OPENAI_API_KEY=your-key-here

# Run migrations (already done, but can run again)
python manage.py migrate

# Create test data
python manage.py shell < create_test_data.py

# Start server
python manage.py runserver
```

**Backend runs on:** http://localhost:8000

### 2. Frontend Setup

```bash
cd frontend

# Start simple HTTP server
python3 -m http.server 3000
```

**Frontend runs on:** http://localhost:3000

### 3. Test Credentials

After running `create_test_data.py`:

- **Admin:** admin@golexai.pl / admin123
- **Lawyer:** lawyer@golexai.pl / lawyer123

### 4. Test API

Get JWT token:
```bash
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"lawyer@golexai.pl","password":"lawyer123"}'
```

Use token:
```bash
curl http://localhost:8000/api/auth/users/me/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## ✅ What's Working

- ✅ User authentication (JWT)
- ✅ Document upload and storage
- ✅ AI chatbot (needs OPENAI_API_KEY)
- ✅ Case management
- ✅ Analytics tracking
- ✅ GDPR data export/deletion
- ✅ Multi-language (EN/PL)
- ✅ Document export to DOCX

## 📝 Next Steps

1. Add your OpenAI API key to `.env`
2. Test document upload
3. Test AI chat
4. Customize prompts in admin panel
5. Add Google OAuth (configure Google credentials)

## 🎯 Key Endpoints

- Admin: http://localhost:8000/admin/
- API Root: http://localhost:8000/api/
- Frontend: http://localhost:3000

## 💡 Tips

- Use admin panel to manage prompts, users, and data
- Check analytics endpoint for usage metrics
- Test GDPR export/delete in Settings section
- All AI responses respect user's language preference

