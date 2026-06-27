import type { Metadata } from 'next'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth/config'
import { DoctorsClient } from '@/components/doctors/doctors-client'

export const metadata: Metadata = { title: 'الأطباء' }

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const session = await auth()
  const params = await searchParams
  const search = params.q || ''
  const page = Number(params.page || 1)
  const perPage = 10

  const where = {
    ...(search && {
      OR: [
        { user: { name: { contains: search, mode: 'insensitive' as const } } },
        { specialization: { contains: search, mode: 'insensitive' as const } },
        { doctorCode: { contains: search, mode: 'insensitive' as const } },
        { licenseNumber: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [doctors, total] = await Promise.all([
    prisma.doctor.findMany({
      where,
      include: { user: { select: { name: true, email: true, image: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.doctor.count({ where }),
  ])

  return (
    <DoctorsClient
      doctors={doctors}
      total={total}
      page={page}
      perPage={perPage}
      search={search}
      canEdit={session!.user.role === 'ADMIN'}
    />
  )
}
