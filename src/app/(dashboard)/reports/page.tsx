import type { Metadata } from 'next'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { ReportsClient } from '@/components/reports/reports-client'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

export const metadata: Metadata = { title: 'التقارير' }

async function getReportsData() {
  const now = new Date()

  // Monthly stats for last 6 months
  const monthlyData = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const monthDate = subMonths(now, 5 - i)
      const start = startOfMonth(monthDate)
      const end = endOfMonth(monthDate)
      const monthLabel = format(monthDate, 'MMM yyyy')

      return Promise.all([
        prisma.appointment.count({ where: { scheduledAt: { gte: start, lte: end } } }),
        prisma.patient.count({ where: { createdAt: { gte: start, lte: end } } }),
        prisma.invoice.aggregate({
          where: { status: 'PAID', issueDate: { gte: start, lte: end } },
          _sum: { paidAmount: true },
        }),
      ]).then(([appointments, newPatients, revenue]) => ({
        month: monthLabel,
        appointments,
        newPatients,
        revenue: Number(revenue._sum.paidAmount || 0),
      }))
    })
  )

  // Top doctors by appointment count
  const topDoctors = await prisma.doctor.findMany({
    include: {
      user: { select: { name: true } },
      _count: { select: { appointments: true } },
    },
    orderBy: { appointments: { _count: 'desc' } },
    take: 5,
  })

  // Appointment status distribution
  const statusCounts = await prisma.appointment.groupBy({
    by: ['status'],
    _count: { status: true },
  })

  // Invoice status distribution
  const invoiceStatusCounts = await prisma.invoice.groupBy({
    by: ['status'],
    _count: { status: true },
    _sum: { total: true },
  })

  // Summary totals
  const [totalPatients, totalDoctors, totalAppointments, totalRevenue, pendingInvoices] = await Promise.all([
    prisma.patient.count({ where: { isArchived: false } }),
    prisma.doctor.count({ where: { isActive: true } }),
    prisma.appointment.count(),
    prisma.invoice.aggregate({ where: { status: 'PAID' }, _sum: { paidAmount: true } }),
    prisma.invoice.aggregate({ where: { status: { in: ['PENDING', 'PARTIAL'] } }, _sum: { total: true } }),
  ])

  return {
    monthlyData,
    topDoctors: topDoctors.map(d => ({
      name: d.user.name,
      specialization: d.specialization,
      appointments: d._count.appointments,
    })),
    statusCounts: statusCounts.map(s => ({ status: s.status, count: s._count.status })),
    invoiceStatusCounts: invoiceStatusCounts.map(s => ({
      status: s.status,
      count: s._count.status,
      total: Number(s._sum.total || 0),
    })),
    summary: {
      totalPatients,
      totalDoctors,
      totalAppointments,
      totalRevenue: Number(totalRevenue._sum.paidAmount || 0),
      pendingInvoices: Number(pendingInvoices._sum.total || 0),
    },
  }
}

export default async function ReportsPage() {
  const session = await auth()
  if (session?.user.role !== 'ADMIN') redirect('/dashboard')

  const data = await getReportsData()
  return <ReportsClient data={data} />
}
