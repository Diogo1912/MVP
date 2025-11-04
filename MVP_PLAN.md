# GOLEXAI MVP Development Plan

## Overview
This MVP is an AI-powered legal tech platform for law firms. It helps lawyers analyze documents, generate legal drafts (pleadings/opinions), and manage cases with AI assistance. The system must be GDPR-compliant, deployed in the EU, and ready for investor demonstration.

## Core Features (Phase I - MVP)

### 1. **Dashboard Interface**
A web-based dashboard with 5 main sections:
- **Overview**: Summary of cases/documents, AI activity metrics, document types, monthly productivity
- **Chatbot AI**: Interactive AI assistant for real-time responses, document analysis, and document creation
- **Documents/Cases**: Case management with export (DOCX/PDF), AI analysis, printing, sharing, priority indicators
- **Analytics**: Visualizations of documents generated/uploaded/analyzed, AI usage tracking, productivity metrics, accuracy reports
- **Settings**: GDPR (RODO) data management, encryption settings, password management

### 2. **Document Processing**
- **Ingestion**: Upload DOCX/PDF files with basic OCR for scanned documents
- **Analysis**: AI-powered document analysis and extraction
- **Generation**: Generate legal drafts (pleadings, opinions) in DOCX/PDF format
- **Export**: Export to Google Docs or Microsoft Word (at least one must work)

### 3. **AI Chatbot**
- Real-time conversational interface
- Document analysis capability
- Document creation assistance
- Conversation history storage
- Persona switching (different AI personalities/roles)

### 4. **User Management**
- Google SSO authentication
- Role-based access: Admin and Lawyer roles
- Token-based authorization
- User profiles and settings

### 5. **GDPR Compliance**
- Data export functionality
- Data deletion on request
- Encryption at rest for sensitive data
- 90-day data retention policy
- Audit logs for all data access
- DPA (Data Processing Agreement) ready

## Technical Architecture

### **Frontend**
- **Technology**: Simple, maintainable web framework (consider vanilla JS + HTML/CSS or lightweight framework)
- **Features**:
  - Google SSO integration
  - Responsive dashboard UI
  - Document upload/management interface
  - Chat interface for AI interactions
  - Analytics visualizations
  - Settings panel

### **Backend**
- **Technology**: Django + PostgreSQL
- **Features**:
  - REST API for frontend communication
  - Google SSO authentication
  - Token-based authorization (JWT)
  - Document storage and management
  - Conversation history storage
  - Admin panel for anonymization/deletion
  - Audit logging
  - Role-based permissions

### **AI Agent (Built-in)**
- **Technology**: Direct integration in Django backend
- **Features**:
  - Prompt editing interface (admin panel)
  - Knowledge Base uploads (document storage for AI context)
  - Draft generation (PDF/Word) via API calls
  - Prompt versioning system (database)
  - Direct GPT API integration
  - Multi-language support (English/Polish)

### **Integrations**
- **Document Import**: DOCX/PDF parsing with basic OCR (e.g., Tesseract or cloud OCR)
- **Document Export**: 
  - Google Docs API integration OR
  - Microsoft Word API integration
  - (At least one must be fully functional)

### **Security & Infrastructure**
- **Hosting**: EU-based (Railway.app or similar)
- **Security**:
  - TLS/HTTPS encryption
  - Encryption at rest (sensitive database columns)
  - Secure secret management (no secrets in code)
- **Monitoring**: Sentry for error tracking
- **Backups**: Daily automated backups (7-day retention minimum)
- **Compliance**: GDPR-ready architecture

## Project Structure

```
golexai-mvp/
├── frontend/          # Web UI (vanilla JS + HTML/CSS)
├── backend/           # Django API with AI integration
├── docs/             # Documentation
└── docker/            # Deployment configs (if needed)
```

## Development Phases

### **Phase 1: Foundation (Week 1)**
- Set up project repositories
- Django backend setup with PostgreSQL
- Basic frontend structure
- Google SSO integration
- Basic authentication flow

### **Phase 2: Core Features (Week 2)**
- Document upload/ingestion
- Basic OCR integration
- AI chatbot interface (n8n integration)
- Document analysis functionality
- Basic dashboard UI

### **Phase 3: Advanced Features (Week 3)**
- Document generation (DOCX/PDF)
- Google Docs or MS Word export
- Analytics dashboard
- Case management system
- Settings panel

### **Phase 4: Polish & Deploy (Week 4)**
- GDPR compliance features
- Security hardening
- EU deployment setup
- Monitoring and backups
- Documentation and handover

## Key Decisions to Make

1. **Frontend Framework**: 
   - Option A: Vanilla JS + HTML/CSS (simplest, no dependencies)
   - Option B: Lightweight framework (Alpine.js, Lit, or similar)
   - Recommendation: Start with vanilla JS for MVP, add framework only if needed

2. **Document Export Priority**:
   - Google Docs API vs Microsoft Word API
   - Recommendation: Start with Google Docs (simpler API, better for MVP)

3. **OCR Solution**:
   - Option A: Tesseract (open-source, self-hosted)
   - Option B: Cloud OCR (Google Cloud Vision, AWS Textract)
   - Recommendation: Start with Tesseract for MVP, upgrade if needed

4. **AI Integration**:
   - Use GPT API (per user preference)
   - Direct integration in Django backend
   - Store prompts and versions in database
   - Support English and Polish languages

5. **Database Schema**:
   - Users (with roles)
   - Documents (with metadata, encryption flags)
   - Cases (linked to documents)
   - Conversations (chat history)
   - Analytics (usage metrics)
   - Audit logs

## MVP Success Criteria

✅ Working dashboard with all 5 sections
✅ Google SSO login
✅ Document upload and analysis
✅ AI chatbot with real-time responses
✅ Document generation (DOCX/PDF)
✅ Export to Google Docs or MS Word
✅ Basic GDPR features (export/deletion)
✅ Deployed on EU infrastructure
✅ Daily backups configured
✅ Monitoring active

## Timeline

- **Stage I (Design + Concept)**: Due 13.10.2025
- **Stage II (MVP)**: Due 27.10.2025
- **Stage III (Go-Live)**: Due 3.11.2025
- **Stage IV (Support)**: Due 3.12.2025

## Next Steps

1. Confirm technology choices
2. Set up development environment
3. Create repository structure
4. Begin with backend foundation
5. Build incrementally, test continuously

---

**Note**: This MVP should be fully functional but prioritize simplicity and maintainability over complex features. Avoid heavy frameworks - focus on working, clean code that can be demonstrated to investors.

