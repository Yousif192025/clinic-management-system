import type { Metadata } from 'next'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth/config'
import { PatientsClient } from '@/components/patients/patients-client'

export const metadata: Metadata = { title: 'المرضى' }

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; archived?: string }>
}) {
  const session = await auth()
  const params = await searchParams
  const search = params.q || ''
  const page = Number(params.page || 1)
  const archived = params.archived === 'true'
  const perPage = 10

  const where = {
    isArchived: archived,
    OR: search ? [
      { user: { name: { contains: search, mode: 'insensitive' as const } } },
      { patientCode: { contains: search, mode: 'insensitive' as const } },
      { phone: { contains: search } },
      { nationalId: { contains: search } },
    ] : undefined,
  }

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      include: { user: { select: { name: true, email: true, image: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.patient.count({ where }),
  ])

  return (
    <PatientsClient
      patients={patients}
      total={total}
      page={page}
      perPage={perPage}
      search={search}
      archived={archived}
      canEdit={['ADMIN', 'RECEPTIONIST', 'NURSE'].includes(session!.user.role)}
    />
  )
}
