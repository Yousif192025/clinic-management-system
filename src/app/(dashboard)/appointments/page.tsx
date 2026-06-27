import type { Metadata } from 'next'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth/config'
import { AppointmentsClient } from '@/components/appointments/appointments-client'

export const metadata: Metadata = { title: 'المواعيد' }

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string; date?: string }>
}) {
  const session = await auth()
  const params = await searchParams
  const search = params.q || ''
  const page = Number(params.page || 1)
  const status = params.status || ''
  const perPage = 10

  const where: Record<string, unknown> = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { patient: { user: { name: { contains: search, mode: 'insensitive' } } } },
        { doctor: { user: { name: { contains: search, mode: 'insensitive' } } } },
        { appointmentCode: { contains: search, mode: 'insensitive' } },
      ],
    }),
  }

  // Restrict doctors to their own appointments
  if (session!.user.role === 'DOCTOR') {
    const doctor = await prisma.doctor.findFirst({ where: { userId: session!.user.id } })
    if (doctor) where.doctorId = doctor.id
  }

  const [appointments, total, doctors, patients] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: {
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
      orderBy: { scheduledAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.appointment.count({ where }),
    prisma.doctor.findMany({ where: { isActive: true }, include: { user: { select: { name: true } } } }),
    prisma.patient.findMany({ where: { isArchived: false }, include: { user: { select: { name: true } } }, take: 100 }),
  ])

  return (
    <AppointmentsClient
      appointments={appointments}
      total={total}
      page={page}
      perPage={perPage}
      search={search}
      status={status}
      doctors={doctors}
      patients={patients}
      canEdit={['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'].includes(session!.user.role)}
    />
  )
}
