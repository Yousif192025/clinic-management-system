import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  const user = await prisma.user.update({ where: { id: params.id }, data: body, select: { id: true, name: true, email: true, role: true, isActive: true } })
  return NextResponse.json(user)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (params.id === (session.user as any).id) return NextResponse.json({ error: 'لا يمكنك حذف حسابك' }, { status: 400 })
  await prisma.user.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
