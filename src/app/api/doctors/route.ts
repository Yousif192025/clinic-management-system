import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { doctorSchema } from '@/lib/validations/schemas'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const doctors = await prisma.doctor.findMany({
    where: { isActive: true },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(doctors)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  const parsed = doctorSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  const { name, email, phone, specialization, licenseNumber, consultationFee, bio } = parsed.data
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'البريد الإلكتروني مستخدم' }, { status: 400 })
  const count = await prisma.doctor.count()
  const user = await prisma.user.create({ data: { name, email, password: await bcrypt.hash('Doctor@123456', 12), role: 'DOCTOR' } })
  const doctor = await prisma.doctor.create({
    data: { userId: user.id, doctorCode: `DR-${String(count + 1).padStart(4, '0')}`, specialization, licenseNumber, phone: phone || undefined, consultationFee, bio: bio || undefined },
    include: { user: { select: { name: true, email: true } } },
  })
  return NextResponse.json(doctor, { status: 201 })
}
