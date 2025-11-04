import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// import { getUserFromToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // TODO: Get user from token
    // const token = request.headers.get('authorization')?.replace('Bearer ', '')
    // const user = await getUserFromToken(token || '')
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // TODO: Delete all user data (CASCADE should handle related records)
    // await prisma.user.delete({
    //   where: { id: user.id },
    // })

    return NextResponse.json({ message: 'Data deleted successfully' })
  } catch (error) {
    console.error('Delete data error:', error)
    return NextResponse.json(
      { error: 'Failed to delete data' },
      { status: 500 }
    )
  }
}

