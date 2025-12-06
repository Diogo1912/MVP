# Testing GOLEXAI Locally

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (if not already done)
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add at minimum:
# OPENAI_API_KEY=your-key-here

# Run migrations
python manage.py migrate

# Create superuser (optional, for admin access)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

Backend will run on: **http://localhost:8000**

### 2. Frontend Setup (in a new terminal)

```bash
cd frontend

# Start simple HTTP server
python3 -m http.server 3000
```

Frontend will run on: **http://localhost:3000**

## Testing the API

### Get JWT Token

```bash
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"lawyer@golexai.pl","password":"lawyer123"}'
```

**Note:** First create test user via admin or use superuser.

### Test Endpoints

```bash
# Get current user (replace YOUR_TOKEN)
curl http://localhost:8000/api/auth/users/me/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get documents
curl http://localhost:8000/api/documents/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get analytics
curl http://localhost:8000/api/analytics/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Create Test User

### Option 1: Via Admin Panel

1. Go to http://localhost:8000/admin/
2. Login with superuser
3. Go to Accounts → Users
4. Add new user

### Option 2: Via Django Shell

```bash
cd backend
source venv/bin/activate
python manage.py shell
```

Then in Python shell:
```python
from accounts.models import User
user = User.objects.create_user(
    email='test@example.com',
    username='testuser',
    password='test123',
    role='lawyer',
    language='pl'
)
print(f"Created user: {user.email}")
```

### Option 3: Use Test Data Script

```bash
cd backend
source venv/bin/activate
python manage.py shell < create_test_data.py
```

This creates:
- Admin: admin@golexai.pl / admin123
- Lawyer: lawyer@golexai.pl / lawyer123

## Testing Features

### 1. Document Upload

1. Login to frontend: http://localhost:3000
2. Go to Documents section
3. Click "Upload Document"
4. Select a PDF or DOCX file
5. Document should upload and appear in list

### 2. AI Chat

1. Go to AI Chatbot section
2. Type a message
3. Ensure `OPENAI_API_KEY` is set in `.env`
4. AI should respond

### 3. Document Analysis

1. Upload a document
2. Click "Analyze" on the document
3. AI will analyze and return insights

### 4. Analytics

1. Go to Analytics section
2. Should show:
   - Total documents
   - Active cases
   - AI queries count
   - Monthly productivity

### 5. GDPR Features

1. Go to Settings
2. Click "Export My Data" - downloads JSON
3. Click "Delete My Data" - type `DELETE_ALL_MY_DATA` to confirm

## Admin Panel

Access: http://localhost:8000/admin/

Features:
- Manage users
- View/edit documents
- Manage cases
- View analytics
- Manage AI prompts
- View audit logs

## Troubleshooting

### Port Already in Use

```bash
# Use different port
python manage.py runserver 8001
```

### Database Errors

```bash
# Reset database (WARNING: deletes all data)
rm db.sqlite3
python manage.py migrate
```

### CORS Errors

If frontend can't connect:
- Check `CORS_ALLOWED_ORIGINS` in settings.py includes `http://localhost:3000`
- Restart backend server

### OpenAI API Errors

- Verify `OPENAI_API_KEY` is set in `.env`
- Check API key is valid
- Check your OpenAI account has credits

## Testing Checklist

- [ ] Backend server starts successfully
- [ ] Frontend loads and connects to backend
- [ ] Can login/register
- [ ] Can upload documents
- [ ] Can chat with AI (if API key set)
- [ ] Can analyze documents
- [ ] Analytics page shows data
- [ ] GDPR export works
- [ ] Admin panel accessible
- [ ] Multi-language switching works

