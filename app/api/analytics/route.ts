import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || 'month'

    const now = new Date()
    let startDate = new Date()

    // Calculate start date based on time range
    if (timeRange === 'week') {
      startDate.setDate(now.getDate() - 7)
    } else if (timeRange === 'month') {
      startDate.setMonth(now.getMonth() - 1)
    } else if (timeRange === 'year') {
      startDate.setFullYear(now.getFullYear() - 1)
    }

    // Get analytics data
    const analyticsRecords = await prisma.analytics.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
        },
      },
      orderBy: { date: 'asc' },
    })

    // Calculate totals
    const documentsGenerated = analyticsRecords.reduce(
      (sum: number, record) => sum + record.documentsGenerated,
      0
    )
    const documentsUploaded = analyticsRecords.reduce(
      (sum: number, record) => sum + record.documentsUploaded,
      0
    )
    const documentsAnalyzed = analyticsRecords.reduce(
      (sum: number, record) => sum + record.documentsAnalyzed,
      0
    )
    const aiUsageTime = analyticsRecords.reduce(
      (sum: number, record) => sum + record.aiUsageTimeSeconds,
      0
    )

    // Format data for charts
    const dates: string[] = []
    const documentsGeneratedData: number[] = []
    const documentsUploadedData: number[] = []
    const documentsAnalyzedData: number[] = []
    const aiUsageTimeData: number[] = []
    const productivityData: number[] = []
    const accuracyData: number[] = []

    analyticsRecords.forEach((record) => {
      const dateStr = record.date.toLocaleDateString('pl-PL', {
        weekday: 'short',
      })
      dates.push(dateStr)
      documentsGeneratedData.push(record.documentsGenerated)
      documentsUploadedData.push(record.documentsUploaded)
      documentsAnalyzedData.push(record.documentsAnalyzed)
      aiUsageTimeData.push(Math.floor(record.aiUsageTimeSeconds / 60)) // Convert to minutes
      productivityData.push(record.productivityScore || 0)
      accuracyData.push(85 + Math.random() * 10) // Placeholder - calculate from actual data if needed
    })

    return NextResponse.json({
      documentsGenerated: documentsGeneratedData,
      documentsUploaded: documentsUploadedData,
      documentsAnalyzed: documentsAnalyzedData,
      aiUsageTime: aiUsageTimeData,
      productivity: productivityData,
      accuracy: accuracyData,
      dates,
      totals: {
        documentsGenerated,
        documentsUploaded,
        documentsAnalyzed,
        aiUsageTime: Math.floor(aiUsageTime / 60), // minutes
      },
    })
  } catch (error: any) {
    console.error('Get analytics error:', error)
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Failed to get analytics' },
      { status: 500 }
    )
  }
}

