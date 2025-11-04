# GOLEXAI MVP

AI-powered legal tech platform for law firms.

## Project Structure

```
golexai-mvp/
├── backend/          # Django REST API
│   ├── accounts/    # User management
│   ├── documents/   # Document handling
│   ├── cases/       # Case management
│   ├── ai_agent/    # AI integration
│   └── analytics/   # Analytics & metrics
├── frontend/        # Vanilla JS frontend
└── docs/           # Documentation
```

## Setup

### Backend Setup

1. Create virtual environment:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
# Edit .env with your settings
```

4. Set up PostgreSQL database and update `.env` with credentials.

5. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Create superuser:
```bash
python manage.py createsuperuser
```

7. Run development server:
```bash
python manage.py runserver
```

### Frontend Setup

1. Serve the frontend (use a simple HTTP server):
```bash
cd frontend
python3 -m http.server 3000
```

Or use any static file server.

2. Open `http://localhost:3000` in your browser.

## Features

- ✅ Multi-language support (English/Polish)
- ✅ Google SSO authentication
- ✅ Document upload and analysis
- ✅ AI chatbot with GPT integration
- ✅ Case management
- ✅ Analytics dashboard
- ✅ GDPR compliance features

## API Endpoints

- `/api/auth/` - Authentication
- `/api/documents/` - Document management
- `/api/cases/` - Case management
- `/api/ai/` - AI chat and prompts
- `/api/analytics/` - Analytics data

## Environment Variables

See `backend/.env.example` for required environment variables.

## Development

This is an MVP focused on simplicity and maintainability. All AI functionality is built directly into the Django backend without external workflow tools.

