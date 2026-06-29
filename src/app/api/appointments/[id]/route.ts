import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { appointmentSchema } from '@/lib/validations/schemas'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const body = await req.json()
  const parsed = appointmentSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })

  const { patientId, doctorId, scheduledAt, type, reason, notes, duration } = parsed.data

  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      patientId, doctorId,
      scheduledAt: new Date(scheduledAt),
      type, duration,
      reason: reason || undefined,
      notes: notes || undefined,
    },
    include: {
      patient: { include: { user: { select: { name: true } } } },
      doctor: { include: { user: { select: { name: true } } } },
    },
  })

  return NextResponse.json(appointment)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const body = await req.json()
  const appointment = await prisma.appointment.update({ where: { id }, data: body })
  return NextResponse.json(appointment)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  if (!['ADMIN', 'RECEPTIONIST'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.appointment.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
