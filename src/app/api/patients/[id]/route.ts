import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { patientSchema } from '@/lib/validations/schemas'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = params
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  })
  if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(patient)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = params
  const body = await req.json()
  const parsed = patientSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  const { name, email, phone, nationalId, dateOfBirth, gender, bloodType, maritalStatus, address, city, emergencyName, emergencyPhone, allergies, notes } = parsed.data
  const patient = await prisma.patient.findUnique({ where: { id }, include: { user: true } })
  if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.user.update({ where: { id: patient.userId }, data: { name, ...(email && { email }) } })
  const updated = await prisma.patient.update({
    where: { id },
    data: {
      nationalId: nationalId || undefined,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender: gender || undefined,
      bloodType, maritalStatus,
      phone: phone || undefined, address: address || undefined, city: city || undefined,
      emergencyName: emergencyName || undefined, emergencyPhone: emergencyPhone || undefined,
      allergies: allergies || undefined, notes: notes || undefined,
    },
    include: { user: { select: { name: true, email: true } } },
  })
  return NextResponse.json(updated)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = params
  const body = await req.json()
  const patient = await prisma.patient.update({ where: { id }, data: body, include: { user: { select: { name: true, email: true } } } })
  return NextResponse.json(patient)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = params
  const patient = await prisma.patient.findUnique({ where: { id } })
  if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.user.delete({ where: { id: patient.userId } })
  return NextResponse.json({ success: true })
}
