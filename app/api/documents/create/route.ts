import { NextRequest, NextResponse } from 'next/server'
import { chatCompletion } from '@/lib/openai'
import { createDocx } from '@/lib/document-handler'

export async function POST(request: NextRequest) {
  try {
    const { prompt, language = 'pl' } = await request.json()

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

    // Create DOCX file
    const buffer = await createDocx(response, `document-${Date.now()}.docx`)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="document-${Date.now()}.docx"`,
      },
    })
  } catch (error) {
    console.error('Document creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    )
  }
}

