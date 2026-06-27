import type { Metadata } from 'next'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth/config'
import { InvoicesClient } from '@/components/invoices/invoices-client'

export const metadata: Metadata = { title: 'الفواتير' }

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>
}) {
  const session = await auth()
  const params = await searchParams
  const search = params.q || ''
  const page = Number(params.page || 1)
  const status = params.status || ''
  const perPage = 10

  const where: Record<string, unknown> = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { invoiceCode: { contains: search, mode: 'insensitive' } },
        { patient: { user: { name: { contains: search, mode: 'insensitive' } } } },
      ],
    }),
  }

  if (session!.user.role === 'PATIENT') {
    const patient = await prisma.patient.findFirst({ where: { userId: session!.user.id } })
    if (patient) where.patientId = patient.id
  }

  const [invoices, total, patients] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: { patient: { include: { user: { select: { name: true } } } } },
      orderBy: { issueDate: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.invoice.count({ where }),
    prisma.patient.findMany({ where: { isArchived: false }, include: { user: { select: { name: true } } }, take: 100 }),
  ])

  return (
    <InvoicesClient
      invoices={invoices}
      total={total}
      page={page}
      perPage={perPage}
      search={search}
      status={status}
      patients={patients}
      canEdit={['ADMIN', 'RECEPTIONIST'].includes(session!.user.role)}
    />
  )
}
