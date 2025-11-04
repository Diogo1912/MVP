import { NextRequest, NextResponse } from 'next/server'
import { chatCompletion } from '@/lib/openai'
import { createDocx } from '@/lib/document-handler'
import { requireAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { prompt, language = user.language || 'pl' } = await request.json()

    const systemPrompt = language === 'pl'
      ? 'Jesteś ekspertem prawnym. Stwórz profesjonalny dokument prawny na podstawie podanego opisu. Dokument powinien być sformatowany i gotowy do użycia.'
      : 'You are a legal expert. Create a professional legal document based on the provided description. The document should be formatted and ready to use.'

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

