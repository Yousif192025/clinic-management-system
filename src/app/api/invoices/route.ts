import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { invoiceSchema } from '@/lib/validations/schemas'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const invoices = await prisma.invoice.findMany({
    include: { patient: { include: { user: { select: { name: true } } } }, items: true },
    orderBy: { issueDate: 'desc' },
  })
  return NextResponse.json(invoices)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const parsed = invoiceSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  const { patientId, dueDate, taxRate, discount, notes, items } = parsed.data
  const subtotal = items.reduce((s, item) => s + item.quantity * item.unitPrice, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount - (discount || 0)
  const count = await prisma.invoice.count()
  const invoice = await prisma.invoice.create({
    data: {
      invoiceCode: `INV-${String(count + 1).padStart(6, '0')}`,
      patientId, dueDate: dueDate ? new Date(dueDate) : undefined,
      taxRate, taxAmount, subtotal, discount: discount || 0, total, paidAmount: 0, status: 'PENDING',
      notes: notes || undefined, createdBy: (session.user as any).id,
      items: { create: items.map(item => ({ description: item.description, quantity: item.quantity, unitPrice: item.unitPrice, total: item.quantity * item.unitPrice })) },
    },
    include: { patient: { include: { user: { select: { name: true } } } }, items: true },
  })
  return NextResponse.json(invoice, { status: 201 })
}
