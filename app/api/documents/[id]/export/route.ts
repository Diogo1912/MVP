import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createDocx, createPdf } from '@/lib/document-handler'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'docx'

    // TODO: Get document from database
    // const document = await prisma.document.findUnique({
    //   where: { id: params.id },
    // })

    // For now, using mock content
    const content = 'Mock document content'

    let buffer: Buffer
    let contentType: string
    let filename: string

    if (format === 'pdf') {
      buffer = createPdf(content, `document-${params.id}.pdf`)
      contentType = 'application/pdf'
      filename = `document-${params.id}.pdf`
    } else {
      buffer = await createDocx(content, `document-${params.id}.docx`)
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      filename = `document-${params.id}.docx`
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export document' },
      { status: 500 }
    )
  }
}

