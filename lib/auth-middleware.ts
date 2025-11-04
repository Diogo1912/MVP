import { NextRequest } from 'next/server'
import { getUserFromToken } from './auth'

export async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '') || 
                request.cookies.get('token')?.value ||
                request.headers.get('cookie')?.split('token=')[1]?.split(';')[0]

  if (!token) {
    return null
  }

  return await getUserFromToken(token)
}

export async function requireAuth(request: NextRequest) {
  const user = await getAuthUser(request)
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  return user
}

