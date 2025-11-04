import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { analyzeDocument } from '@/lib/openai'
import { requireAuth } from '@/lib/auth-middleware'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    
    const document = await prisma.document.findUnique({
      where: { id: params.id },
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    if (document.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const documentContent = document.content || ''

    const analysis = await analyzeDocument(documentContent, 'summary', (user.language as 'pl' | 'en') || 'pl')

    // Save analysis to database
    await prisma.aIAnalysis.create({
      data: {
        documentId: document.id,
        analysisType: 'summary',
        content: analysis,
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
        documentsAnalyzed: 1,
      },
      update: {
        documentsAnalyzed: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({ analysis })
  } catch (error: any) {
    console.error('Analysis error:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to analyze document' },
      { status: 500 }
    )
  }
}

