import type { Metadata } from 'next'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { DashboardClient } from '@/components/dashboard/dashboard-client'
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns'

export const metadata: Metadata = { title: 'لوحة التحكم' }

async function getDashboardData(role: string, userId: string) {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)

  const [
    totalPatients, totalDoctors, todayAppointments, completedAppointments,
    monthlyRevenueData, pendingInvoicesData, recentAppointments,
    monthlyStats
  ] = await Promise.all([
    prisma.patient.count({ where: { isArchived: false } }),
    prisma.doctor.count({ where: { isActive: true } }),
    prisma.appointment.count({ where: { scheduledAt: { gte: todayStart, lte: todayEnd } } }),
    prisma.appointment.count({ where: { status: 'COMPLETED', scheduledAt: { gte: monthStart, lte: monthEnd } } }),
    prisma.invoice.aggregate({
      where: { status: 'PAID', issueDate: { gte: monthStart, lte: monthEnd } },
      _sum: { paidAmount: true }
    }),
    prisma.invoice.aggregate({
      where: { status: { in: ['PENDING', 'PARTIAL'] } },
      _sum: { total: true }
    }),
    prisma.appointment.findMany({
      take: 8,
      orderBy: { scheduledAt: 'desc' },
      include: {
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      }
    }),
    // Last 6 months stats
    prisma.$queryRaw<Array<{ month: string; count: bigint; revenue: number }>>`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', "scheduledAt"), 'MM/YYYY') as month,
        COUNT(*) as count,
        0 as revenue
      FROM appointments
      WHERE "scheduledAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "scheduledAt")
      ORDER BY DATE_TRUNC('month', "scheduledAt")
    `.catch(() => []),
  ])

  return {
    stats: {
      totalPatients,
      totalDoctors,
      todayAppointments,
      completedAppointments,
      monthlyRevenue: Number(monthlyRevenueData._sum.paidAmount || 0),
      pendingInvoices: Number(pendingInvoicesData._sum.total || 0),
    },
    recentAppointments,
    monthlyStats,
  }
}

export default async function DashboardPage() {
  const session = await auth()
  const data = await getDashboardData(session!.user.role, session!.user.id)

  return <DashboardClient data={data} user={session!.user} />
}
