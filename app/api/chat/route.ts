import { NextRequest, NextResponse } from 'next/server'
import { chatCompletion } from '@/lib/openai'
import { extractTextFromDocx, extractTextFromPdf } from '@/lib/document-handler'
import { requireAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    const formData = await request.formData()
    const message = formData.get('message') as string
    const language = (formData.get('language') as 'pl' | 'en') || user.language || 'pl'
    const file = formData.get('file') as File | null
    const sessionId = formData.get('sessionId') as string | null

    let context = ''
    let documentId: string | null = null

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const fileType = file.name.split('.').pop()?.toLowerCase()

      if (fileType === 'docx') {
        context = await extractTextFromDocx(buffer)
      } else if (fileType === 'pdf') {
        context = await extractTextFromPdf(buffer)
      }

      // Save uploaded document
      const document = await prisma.document.create({
        data: {
          title: file.name,
          content: context,
          fileType: fileType || 'unknown',
          fileSize: buffer.length,
          userId: user.id,
        },
      })
      documentId = document.id
    }

    const messages = [
      {
        role: 'user' as const,
        content: context
          ? `${message}\n\nKontekst z dokumentu:\n${context}`
          : message,
      },
    ]

    const startTime = Date.now()
    const response = await chatCompletion(messages, language)
    const usageTime = Math.floor((Date.now() - startTime) / 1000)

    // Get or create chat session
    let session = sessionId 
      ? await prisma.chatSession.findUnique({ where: { id: sessionId } })
      : null

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          userId: user.id,
          language,
          title: message.substring(0, 50),
        },
      })
    }

    // Save messages
    await prisma.chatMessage.createMany({
      data: [
        {
          sessionId: session.id,
          role: 'user',
          content: message,
          documentId,
        },
        {
          sessionId: session.id,
          role: 'assistant',
          content: response,
        },
      ],
    })

    // Track AI usage time
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
        aiUsageTimeSeconds: usageTime,
      },
      update: {
        aiUsageTimeSeconds: {
          increment: usageTime,
        },
      },
    })

    return NextResponse.json({ response, sessionId: session.id })
  } catch (error: any) {
    console.error('Chat API error:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}

