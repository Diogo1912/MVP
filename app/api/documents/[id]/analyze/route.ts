import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { analyzeDocument } from '@/lib/openai'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Get document from database
    // const document = await prisma.document.findUnique({
    //   where: { id: params.id },
    // })

    // For now, using mock content
    const documentContent = 'Mock document content for analysis'

    const analysis = await analyzeDocument(documentContent, 'summary', 'pl')

    // TODO: Save analysis to database
    // await prisma.aIAnalysis.create({
    //   data: {
    //     documentId: params.id,
    //     analysisType: 'summary',
    //     content: analysis,
    //   },
    // })

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze document' },
      { status: 500 }
    )
  }
}

