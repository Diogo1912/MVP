import { NextRequest, NextResponse } from 'next/server'
import { chatCompletion } from '@/lib/openai'
import { createDocx } from '@/lib/document-handler'
import { requireAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { prompt, language = (user.language as 'pl' | 'en') || 'pl' } = await request.json()

    const systemPrompt = language === 'pl'
      ? `Jesteś ekspertem prawnym specjalizującym się w prawie polskim. Twoim zadaniem jest stworzenie profesjonalnego dokumentu prawnego zgodnego z polskim prawem.

Wymagania:
- Dokument musi być zgodny z Kodeksem Cywilnym, Kodeksem Pracy lub innymi właściwymi przepisami prawa polskiego
- Używaj profesjonalnej terminologii prawnej
- Włącz odpowiednie klauzule zgodnie z polskim prawem
- Uwzględnij wymogi RODO, jeśli dokument dotyczy danych osobowych
- Dokument powinien być gotowy do użycia i profesjonalnie sformatowany
- Dodaj odpowiednie daty, miejsca i dane stron
- Uwzględnij polskie standardy prawne i praktykę

Formatuj dokument w sposób profesjonalny, z odpowiednimi nagłówkami, sekcjami i paragrafami.`
      : `You are a legal expert specializing in Polish law. Your task is to create a professional legal document compliant with Polish law.

Requirements:
- The document must comply with the Civil Code, Labor Code or other applicable Polish law provisions
- Use professional legal terminology
- Include appropriate clauses according to Polish law
- Consider GDPR requirements if the document involves personal data
- The document should be ready to use and professionally formatted
- Add appropriate dates, places and party details
- Consider Polish legal standards and practice

Format the document professionally, with appropriate headers, sections and paragraphs.`

    const response = await chatCompletion(
      [
        {
          role: 'user',
          content: `${systemPrompt}\n\nOpis dokumentu:\n${prompt}`,
        },
      ],
      language
    )

    // Save document to database
    const document = await prisma.document.create({
      data: {
        title: `Document ${new Date().toLocaleDateString()}`,
        content: response,
        fileType: 'docx',
        userId: user.id,
        status: 'draft',
      },
    })

    // Update analytics
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    await prisma.analytics.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
      create: {
        userId: user.id,
        date: today,
        documentsGenerated: 1,
      },
      update: {
        documentsGenerated: {
          increment: 1,
        },
      },
    })

    // Create DOCX file
    const buffer = await createDocx(response, `${document.title}.docx`)

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${document.title}.docx"`,
      },
    })
  } catch (error: any) {
    console.error('Document creation error:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    )
  }
}

