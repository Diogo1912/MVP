# GOLEXAI - Legal Practice Management Platform

A comprehensive web application for lawyers to manage cases, documents, and leverage AI assistance.

## Features

- **Overview Dashboard**: General data, case summaries, AI activity, document types, and productivity metrics
- **AI Chatbot**: Real-time responses, document analysis, and document creation with .docx/PDF integration
- **Documents/Cases Management**: View, export (.docx/PDF), AI analysis, printing, sharing, and priority indicators
- **Analytics**: Visualizations for documents, AI usage, productivity, and accuracy
- **Settings**: RODO/GDPR compliance (data export, deletion, encryption, password management)
- **Bilingual Support**: Polish and English interface and AI responses

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **AI**: OpenAI GPT API
- **Deployment**: Railway

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Deployment on Railway

### Prerequisites
- Railway account
- OpenAI API key
- PostgreSQL database (Railway provides this)

### Steps

1. **Create a new Railway project**
   - Go to [Railway](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo" (or upload directly)

2. **Add PostgreSQL database**
   - In your Railway project, click "New" → "Database" → "Add PostgreSQL"
   - Railway will automatically create a `DATABASE_URL` environment variable

3. **Configure environment variables**
   In Railway project settings, add these environment variables:
   ```
   DATABASE_URL=<automatically provided by Railway PostgreSQL>
   OPENAI_API_KEY=your-openai-api-key-here
   JWT_SECRET=generate-a-random-secret-key-here
   NEXT_PUBLIC_APP_URL=https://your-app-name.up.railway.app
   ```

4. **Deploy**
   - Railway will automatically detect Next.js and run `npm install` and `npm run build`
   - After build, it will run `npm start`
   - Railway will run database migrations automatically if configured

5. **Run database migrations** ⚠️ **IMPORTANT**
   You MUST run migrations before the app will work:
   ```bash
   # Via Railway CLI or one-off command in Railway dashboard
   npx prisma migrate deploy
   ```
   
   Or create initial migration locally and push:
   ```bash
   npx prisma migrate dev --name init
   ```
   
   **Without running migrations, registration and all database operations will fail!**

### Post-Deployment

- The app will be available at the Railway-provided URL
- Make sure to set up authentication (currently using mock data)
- Configure your OpenAI API key for AI features to work

## Project Structure

```
/app              # Next.js app router pages
/components       # React components
/lib              # Utilities and helpers
/prisma           # Database schema
/public           # Static assets
/locales          # Translation files
```

