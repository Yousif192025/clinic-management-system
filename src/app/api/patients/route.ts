import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { patientSchema } from '@/lib/validations/schemas'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const page = Number(searchParams.get('page') || 1)
  const perPage = 10

  const where = {
    isArchived: false,
    ...(q && {
      OR: [
        { user: { name: { contains: q, mode: 'insensitive' as const } } },
        { patientCode: { contains: q, mode: 'insensitive' as const } },
        { phone: { contains: q } },
      ],
    }),
  }

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.patient.count({ where }),
  ])

  return NextResponse.json({ patients, total })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const allowedRoles = ['ADMIN', 'RECEPTIONIST', 'NURSE']
  if (!allowedRoles.includes(session.user.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = patientSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { name, email, phone, nationalId, dateOfBirth, gender, bloodType, maritalStatus, address, city, emergencyName, emergencyPhone, allergies, notes } = parsed.data

  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 })
  }

  const count = await prisma.patient.count()
  const hashedPassword = await bcrypt.hash('Patient@123456', 12)

  const user = await prisma.user.create({
    data: {
      name,
      email: email || `patient${count + 1}@clinic.local`,
      password: hashedPassword,
      role: 'PATIENT',
    }
  })

  const patient = await prisma.patient.create({
    data: {
      userId: user.id,
      patientCode: `PT-${String(count + 1).padStart(4, '0')}`,
      nationalId: nationalId || undefined,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender: gender || undefined,
      bloodType: bloodType || 'UNKNOWN',
      maritalStatus: maritalStatus || 'SINGLE',
      phone: phone || undefined,
      address: address || undefined,
      city: city || undefined,
      emergencyName: emergencyName || undefined,
      emergencyPhone: emergencyPhone || undefined,
      allergies: allergies || undefined,
      notes: notes || undefined,
    },
    include: { user: { select: { name: true, email: true } } },
  })

  return NextResponse.json(patient, { status: 201 })
}
