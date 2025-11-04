import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        language: true,
        createdAt: true,
      },
    })

    return NextResponse.json(dbUser)
  } catch (error: any) {
    console.error('Get profile error:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { name, email, language } = await request.json()

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { 
        name: name || undefined,
        email: email || undefined,
        language: language || undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        language: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error: any) {
    console.error('Update profile error:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

