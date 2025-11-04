# GOLEXAI Setup Guide

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example)
cp .env.example .env
# Edit .env and add your settings:
# - SECRET_KEY (generate a new one)
# - OPENAI_API_KEY (your OpenAI API key)
# - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (for OAuth)

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

Backend will be available at `http://localhost:8000`

### 2. Frontend Setup

```bash
cd frontend

# Serve with Python (or any static server)
python3 -m http.server 3000
```

Frontend will be available at `http://localhost:3000`

### 3. Admin Panel

Access Django admin at `http://localhost:8000/admin/` with your superuser credentials.

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (use sqlite3 for development, postgresql for production)
DB_ENGINE=sqlite3
# For PostgreSQL:
# DB_NAME=golexai
# DB_USER=postgres
# DB_PASSWORD=your-password
# DB_HOST=localhost
# DB_PORT=5432

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Encryption (generate a secure key)
ENCRYPTION_KEY=your-encryption-key-here
```

## API Endpoints

### Authentication
- `POST /api/auth/token/` - Get JWT token (username/password)
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `GET /api/auth/users/me/` - Get current user

### Documents
- `GET /api/documents/` - List documents
- `POST /api/documents/` - Upload document
- `GET /api/documents/{id}/` - Get document
- `POST /api/documents/{id}/analyze/` - Analyze document with AI

### Cases
- `GET /api/cases/` - List cases
- `POST /api/cases/` - Create case
- `GET /api/cases/{id}/` - Get case

### AI Chat
- `POST /api/ai/chat/` - Send chat message
- `GET /api/ai/conversations/` - List conversations
- `GET /api/ai/conversations/{id}/` - Get conversation

### Analytics
- `GET /api/analytics/` - Get analytics data
- `GET /api/audit-logs/` - Get audit logs

## Testing

1. Create a test user via admin panel or API
2. Get JWT token: `POST /api/auth/token/` with username/password
3. Use token in Authorization header: `Bearer <token>`

## Production Deployment

1. Set `DEBUG=False` in `.env`
2. Set `DB_ENGINE=postgresql` and configure PostgreSQL
3. Configure `ALLOWED_HOSTS` with your domain
4. Set up SSL/TLS certificates
5. Configure static files serving
6. Set up daily backups
7. Configure monitoring (Sentry)

## Troubleshooting

### Database Connection Error
- For development, use SQLite (default)
- For production, ensure PostgreSQL is running and credentials are correct

### Missing Dependencies
```bash
pip install -r requirements.txt
```

### Migration Issues
```bash
python manage.py makemigrations
python manage.py migrate
```

### CORS Issues
Update `CORS_ALLOWED_ORIGINS` in `settings.py` with your frontend URL.

