import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Get totals
    const totalCases = await prisma.case.count({
      where: { userId: user.id },
    })

    const totalDocuments = await prisma.document.count({
      where: { userId: user.id },
    })

    const activeCases = await prisma.case.count({
      where: {
        userId: user.id,
        status: 'active',
      },
    })

    const documentsThisMonth = await prisma.document.count({
      where: {
        userId: user.id,
        uploadedAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    })

    // Get AI usage time (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const aiUsageRecords = await prisma.analytics.findMany({
      where: {
        userId: user.id,
        date: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        aiUsageTimeSeconds: true,
      },
    })

    const aiUsageTime = aiUsageRecords.reduce(
      (sum: number, record: { aiUsageTimeSeconds: number }) => sum + record.aiUsageTimeSeconds,
      0
    )

    // Get document types
    const documentTypes = await prisma.document.groupBy({
      by: ['fileType'],
      where: { userId: user.id },
      _count: true,
    })

    // Get monthly productivity (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyDocs = await prisma.document.groupBy({
      by: ['uploadedAt'],
      where: {
        userId: user.id,
        uploadedAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: true,
    })

    // Group by month
    const monthlyProductivity: Record<string, number> = {}
    monthlyDocs.forEach((doc: { uploadedAt: Date; _count: number }) => {
      const month = new Date(doc.uploadedAt).toLocaleDateString('pl-PL', {
        month: 'short',
      })
      monthlyProductivity[month] =
        (monthlyProductivity[month] || 0) + doc._count
    })

    return NextResponse.json({
      totalCases,
      totalDocuments,
      activeCases,
      documentsThisMonth,
      aiUsageTime: Math.floor(aiUsageTime / 60), // Convert to minutes
      documentTypes: documentTypes.map((dt) => ({
        type: dt.fileType,
        count: dt._count,
      })),
      monthlyProductivity: Object.entries(monthlyProductivity).map(
        ([month, count]) => ({
          month,
          count,
        })
      ),
    })
  } catch (error: any) {
    console.error('Get overview error:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to get overview data' },
      { status: 500 }
    )
  }
}

