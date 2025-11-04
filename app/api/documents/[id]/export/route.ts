import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createDocx, createPdf } from '@/lib/document-handler'
import { requireAuth } from '@/lib/auth-middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'docx'

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

    const content = document.content || ''

    let buffer: Buffer
    let contentType: string
    let filename: string

    if (format === 'pdf') {
      buffer = createPdf(content, `${document.title}.pdf`)
      contentType = 'application/pdf'
      filename = `${document.title}.pdf`
    } else {
      buffer = await createDocx(content, `${document.title}.docx`)
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      filename = `${document.title}.docx`
    }

    // Record export
    await prisma.documentExport.create({
      data: {
        documentId: document.id,
        exportType: format as 'docx' | 'pdf',
        filePath: filename,
      },
    })

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error('Export error:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to export document' },
      { status: 500 }
    )
  }
}

