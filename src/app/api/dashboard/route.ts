import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const todayStart = new Date(now.setHours(0,0,0,0))
  const todayEnd = new Date(now.setHours(23,59,59,999))
  const [totalPatients, totalDoctors, todayAppointments, monthlyRevenue, pendingInvoices] = await Promise.all([
    prisma.patient.count({ where: { isArchived: false } }),
    prisma.doctor.count({ where: { isActive: true } }),
    prisma.appointment.count({ where: { scheduledAt: { gte: todayStart, lte: todayEnd } } }),
    prisma.invoice.aggregate({ where: { status: 'PAID', issueDate: { gte: monthStart, lte: monthEnd } }, _sum: { paidAmount: true } }),
    prisma.invoice.aggregate({ where: { status: { in: ['PENDING', 'PARTIAL'] } }, _sum: { total: true } }),
  ])
  return NextResponse.json({
    totalPatients, totalDoctors, todayAppointments,
    monthlyRevenue: Number(monthlyRevenue._sum.paidAmount || 0),
    pendingInvoices: Number(pendingInvoices._sum.total || 0),
  })
}
