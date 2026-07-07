import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { appointmentSchema } from '@/lib/validations/schemas'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || undefined
  const appointments = await prisma.appointment.findMany({
    where: { ...(status && { status }) },
    include: {
      patient: { include: { user: { select: { name: true } } } },
      doctor: { include: { user: { select: { name: true } } } },
    },
    orderBy: { scheduledAt: 'asc' },
  })
  return NextResponse.json(appointments)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const parsed = appointmentSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  const { patientId, doctorId, scheduledAt, type, reason, notes, duration } = parsed.data
  const count = await prisma.appointment.count()
  const appointment = await prisma.appointment.create({
    data: {
      appointmentCode: `APT-${String(count + 1).padStart(6, '0')}`,
      patientId, doctorId,
      scheduledAt: new Date(scheduledAt),
      type, duration,
      reason: reason || undefined,
      notes: notes || undefined,
      status: 'SCHEDULED',
      createdBy: (session.user as any).id,
    },
    include: {
      patient: { include: { user: { select: { name: true } } } },
      doctor: { include: { user: { select: { name: true } } } },
    },
  })
  return NextResponse.json(appointment, { status: 201 })
}
