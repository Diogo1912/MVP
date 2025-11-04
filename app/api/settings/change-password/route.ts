import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword } from '@/lib/auth'
// import { getUserFromToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json()

    // TODO: Get user from token
    // const token = request.headers.get('authorization')?.replace('Bearer ', '')
    // const user = await getUserFromToken(token || '')
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // TODO: Verify current password
    // const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
    // if (!dbUser) {
    //   return NextResponse.json({ error: 'User not found' }, { status: 404 })
    // }

    // const isValid = await verifyPassword(currentPassword, dbUser.passwordHash)
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid current password' }, { status: 400 })
    // }

    // TODO: Update password
    // const newPasswordHash = await hashPassword(newPassword)
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: { passwordHash: newPasswordHash },
    // })

    return NextResponse.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
}

