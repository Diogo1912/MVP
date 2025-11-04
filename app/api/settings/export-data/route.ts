import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const userData = {
      user: await prisma.user.findUnique({ 
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          name: true,
          language: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      documents: await prisma.document.findMany({ 
        where: { userId: user.id },
        select: {
          id: true,
          title: true,
          fileType: true,
          priority: true,
          status: true,
          uploadedAt: true,
          updatedAt: true,
        },
      }),
      cases: await prisma.case.findMany({ 
        where: { userId: user.id },
        select: {
          id: true,
          title: true,
          description: true,
          caseNumber: true,
          priority: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      chatSessions: await prisma.chatSession.findMany({ 
        where: { userId: user.id },
        include: {
          messages: {
            select: {
              role: true,
              content: true,
              createdAt: true,
            },
          },
        },
      }),
      analytics: await prisma.analytics.findMany({ 
        where: { userId: user.id },
      }),
      exportedAt: new Date().toISOString(),
    }

    return NextResponse.json(userData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="golexai-data-export-${Date.now()}.json"`,
      },
    })
  } catch (error: any) {
    console.error('Export data error:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}

