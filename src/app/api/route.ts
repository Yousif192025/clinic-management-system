import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)

  const [totalPatients, totalDoctors, todayAppointments, monthlyRevenue, pendingInvoices] = await Promise.all([
    prisma.patient.count({ where: { isArchived: false } }),
    prisma.doctor.count({ where: { isActive: true } }),
    prisma.appointment.count({ where: { scheduledAt: { gte: todayStart, lte: todayEnd } } }),
    prisma.invoice.aggregate({
      where: { status: 'PAID', issueDate: { gte: monthStart, lte: monthEnd } },
      _sum: { paidAmount: true },
    }),
    prisma.invoice.aggregate({
      where: { status: { in: ['PENDING', 'PARTIAL'] } },
      _sum: { total: true },
    }),
  ])

  return NextResponse.json({
    totalPatients,
    totalDoctors,
    todayAppointments,
    monthlyRevenue: Number(monthlyRevenue._sum.paidAmount || 0),
    pendingInvoices: Number(pendingInvoices._sum.total || 0),
  })
}
