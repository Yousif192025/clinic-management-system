import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { currentPassword, newPassword } = await req.json()
  if (!currentPassword || !newPassword) return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
  if (newPassword.length < 8) return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 8 أحرف' }, { status: 400 })
  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } })
  if (!user?.password) return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
  const isValid = await bcrypt.compare(currentPassword, user.password)
  if (!isValid) return NextResponse.json({ error: 'كلمة المرور الحالية غير صحيحة' }, { status: 400 })
  await prisma.user.update({ where: { id: user.id }, data: { password: await bcrypt.hash(newPassword, 12) } })
  return NextResponse.json({ success: true })
}
