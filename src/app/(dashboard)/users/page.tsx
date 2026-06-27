import type { Metadata } from 'next'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { UsersClient } from '@/components/users/users-client'

export const metadata: Metadata = { title: 'المستخدمون' }

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; page?: string }>
}) {
  const session = await auth()
  if (session?.user.role !== 'ADMIN') redirect('/dashboard')

  const params = await searchParams
  const search = params.q || ''
  const role = params.role || ''
  const page = Number(params.page || 1)
  const perPage = 10

  const where: Record<string, unknown> = {
    ...(role && { role }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, image: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.user.count({ where }),
  ])

  return <UsersClient users={users} total={total} page={page} perPage={perPage} search={search} role={role} />
}
