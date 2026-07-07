import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { medicalRecordSchema } from '@/lib/validations/schemas'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const records = await prisma.medicalRecord.findMany({
    include: {
      patient: { include: { user: { select: { name: true } } } },
      doctor: { include: { user: { select: { name: true } } } },
      prescriptions: true, vitalSigns: true,
    },
    orderBy: { visitDate: 'desc' },
  })
  return NextResponse.json(records)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const parsed = medicalRecordSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  const { patientId, doctorId, appointmentId, visitDate, chiefComplaint, symptoms, diagnosis, treatment, notes, followUpDate } = parsed.data
  const count = await prisma.medicalRecord.count()
  const record = await prisma.medicalRecord.create({
    data: {
      recordCode: `MR-${String(count + 1).padStart(6, '0')}`,
      patientId, doctorId,
      appointmentId: appointmentId || undefined,
      visitDate: new Date(visitDate),
      chiefComplaint: chiefComplaint || undefined,
      symptoms: symptoms || undefined,
      diagnosis: diagnosis || undefined,
      treatment: treatment || undefined,
      notes: notes || undefined,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
    },
    include: { patient: { include: { user: { select: { name: true } } } }, doctor: { include: { user: { select: { name: true } } } }, prescriptions: true },
  })
  if (body.vitals && Object.values(body.vitals).some((v: any) => v)) {
    await prisma.vitalSign.create({
      data: {
        medicalRecordId: record.id,
        temperature: body.vitals.temperature ? parseFloat(body.vitals.temperature) : undefined,
        heartRate: body.vitals.heartRate ? parseInt(body.vitals.heartRate) : undefined,
        bloodPressureSystolic: body.vitals.bloodPressureSystolic ? parseInt(body.vitals.bloodPressureSystolic) : undefined,
        bloodPressureDiastolic: body.vitals.bloodPressureDiastolic ? parseInt(body.vitals.bloodPressureDiastolic) : undefined,
        oxygenSaturation: body.vitals.oxygenSaturation ? parseFloat(body.vitals.oxygenSaturation) : undefined,
        weight: body.vitals.weight ? parseFloat(body.vitals.weight) : undefined,
        height: body.vitals.height ? parseFloat(body.vitals.height) : undefined,
      },
    })
  }
  if (body.prescriptions?.length > 0) {
    await prisma.prescription.createMany({
      data: body.prescriptions.filter((rx: any) => rx.medicationName).map((rx: any) => ({
        medicalRecordId: record.id,
        medicationName: rx.medicationName, dosage: rx.dosage || '', frequency: rx.frequency || '', duration: rx.duration || '', instructions: rx.instructions || undefined,
      })),
    })
  }
  return NextResponse.json(record, { status: 201 })
}
