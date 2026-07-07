import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { doctorSchema } from '@/lib/validations/schemas'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = params
  const body = await req.json()
  const parsed = doctorSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  const { name, email, phone, specialization, licenseNumber, consultationFee, bio } = parsed.data
  const doctor = await prisma.doctor.findUnique({ where: { id }, include: { user: true } })
  if (!doctor) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.user.update({ where: { id: doctor.userId }, data: { name, email } })
  const updated = await prisma.doctor.update({ where: { id }, data: { specialization, licenseNumber, phone: phone || undefined, consultationFee, bio: bio || undefined }, include: { user: { select: { name: true, email: true } } } })
  return NextResponse.json(updated)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = params
  const body = await req.json()
  const doctor = await prisma.doctor.update({ where: { id }, data: body, include: { user: { select: { name: true, email: true } } } })
  return NextResponse.json(doctor)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = params
  const doctor = await prisma.doctor.findUnique({ where: { id } })
  if (!doctor) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.user.delete({ where: { id: doctor.userId } })
  return NextResponse.json({ success: true })
}
