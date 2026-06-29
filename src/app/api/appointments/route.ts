import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { appointmentSchema } from '@/lib/validations/schemas'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || undefined
  const date = searchParams.get('date')

  const where: Record<string, unknown> = { ...(status && { status }) }

  if (date) {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)
    where.scheduledAt = { gte: start, lte: end }
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: { include: { user: { select: { name: true } } } },
      doctor: { include: { user: { select: { name: true } } } },
    },
    orderBy: { scheduledAt: 'asc' },
  })

  return NextResponse.json(appointments)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const allowedRoles = ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = appointmentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { patientId, doctorId, scheduledAt, type, reason, notes, duration } = parsed.data

  const count = await prisma.appointment.count()

  const appointment = await prisma.appointment.create({
    data: {
      appointmentCode: `APT-${String(count + 1).padStart(6, '0')}`,
      patientId,
      doctorId,
      scheduledAt: new Date(scheduledAt),
      type,
      reason: reason || undefined,
      notes: notes || undefined,
      duration,
      status: 'SCHEDULED',
      createdBy: session.user.id,
    },
    include: {
      patient: { include: { user: { select: { name: true } } } },
      doctor: { include: { user: { select: { name: true } } } },
    },
  })

  return NextResponse.json(appointment, { status: 201 })
}
