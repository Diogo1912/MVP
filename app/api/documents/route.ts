import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'
    const sortBy = searchParams.get('sortBy') || 'date'

    const where: any = {
      userId: user.id,
    }

    if (filter === 'active') {
      where.status = 'active'
    } else if (filter === 'archived') {
      where.status = 'archived'
    }

    const orderBy: any = {}
    if (sortBy === 'priority') {
      orderBy.priority = 'desc'
    } else if (sortBy === 'title') {
      orderBy.title = 'asc'
    } else {
      orderBy.uploadedAt = 'desc'
    }

    const documents = await prisma.document.findMany({
      where,
      orderBy,
      include: {
        case: {
          select: {
            caseNumber: true,
          },
        },
      },
    })

    return NextResponse.json(documents)
  } catch (error: any) {
    console.error('Get documents error:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to get documents' },
      { status: 500 }
    )
  }
}

