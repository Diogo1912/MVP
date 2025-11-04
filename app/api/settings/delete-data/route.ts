import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    // Delete all user data (CASCADE will handle related records)
    await prisma.user.delete({
      where: { id: user.id },
    })

    return NextResponse.json({ message: 'Data deleted successfully' })
  } catch (error: any) {
    console.error('Delete data error:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to delete data' },
      { status: 500 }
    )
  }
}

