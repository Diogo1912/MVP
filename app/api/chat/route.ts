import { NextRequest, NextResponse } from 'next/server'
import { chatCompletion } from '@/lib/openai'
import { extractTextFromDocx, extractTextFromPdf } from '@/lib/document-handler'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const message = formData.get('message') as string
    const language = (formData.get('language') as 'pl' | 'en') || 'pl'
    const file = formData.get('file') as File | null

    let context = ''
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const fileType = file.name.split('.').pop()?.toLowerCase()

      if (fileType === 'docx') {
        context = await extractTextFromDocx(buffer)
      } else if (fileType === 'pdf') {
        context = await extractTextFromPdf(buffer)
      }
    }

    const messages = [
      {
        role: 'user' as const,
        content: context
          ? `${message}\n\nKontekst z dokumentu:\n${context}`
          : message,
      },
    ]

    const response = await chatCompletion(messages, language)

    // TODO: Save chat session and message to database
    // TODO: Track AI usage time

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}

