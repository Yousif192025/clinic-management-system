'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Loader2, Save, Plus, Trash2 } from 'lucide-react'
import { invoiceSchema, type InvoiceInput } from '@/lib/validations/schemas'
import { formatCurrency } from '@/lib/utils/helpers'

interface Patient { id: string; patientCode: string; user: { name: string } }
interface Props {
  patients: Patient[]
  onClose: () => void
  onSuccess: () => void
}

export function InvoiceModal({ patients, onClose, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, watch, control, formState: { errors } } = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      taxRate: 15,
      discount: 0,
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  const watchItems = watch('items')
  const watchTax = watch('taxRate') || 0
  const watchDiscount = watch('discount') || 0

  const subtotal = watchItems?.reduce((s, item) => s + (Number(item.quantity) * Number(item.unitPrice)), 0) || 0
  const taxAmount = subtotal * (watchTax / 100)
  const total = subtotal + taxAmount - watchDiscount

  async function onSubmit(data: InvoiceInput) {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'حدث خطأ')
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = 'w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring'
  const labelClass = 'block text-xs font-medium text-muted-foreground mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">إنشاء فاتورة جديدة</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-8rem)] p-6">
          {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} id="invoice-form" className="space-y-5">
            {/* Patient & Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>المريض *</label>
                <select {...register('patientId')} className={inputClass}>
                  <option value="">اختر المريض</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.user.name} ({p.patientCode})</option>)}
                </select>
                {errors.patientId && <p className="text-xs text-destructive mt-0.5">{errors.patientId.message}</p>}
              </div>
              <div>
                <label className={labelClass}>تاريخ الاستحقاق</label>
                <input {...register('dueDate')} type="date" className={inputClass} dir="ltr" />
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelClass + ' mb-0'}>الخدمات / الأصناف *</label>
                <button type="button" onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
                  className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <Plus className="w-3 h-3" /> إضافة صنف
                </button>
              </div>

              <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground px-1">
                  <span className="col-span-5">الوصف</span>
                  <span className="col-span-2 text-center">الكمية</span>
                  <span className="col-span-3 text-center">السعر</span>
                  <span className="col-span-1 text-center">الإجمالي</span>
                  <span className="col-span-1" />
                </div>

                {fields.map((field, idx) => {
                  const qty = Number(watchItems?.[idx]?.quantity || 0)
                  const price = Number(watchItems?.[idx]?.unitPrice || 0)
                  return (
                    <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                      <input {...register(`items.${idx}.description`)} placeholder="وصف الخدمة"
                        className={inputClass + ' col-span-5'} />
                      <input {...register(`items.${idx}.quantity`)} type="number" min="1" placeholder="1"
                        className={inputClass + ' col-span-2 text-center'} />
                      <input {...register(`items.${idx}.unitPrice`)} type="number" min="0" step="0.01" placeholder="0.00"
                        className={inputClass + ' col-span-3'} dir="ltr" />
                      <span className="col-span-1 text-xs font-medium text-foreground text-center">
                        {(qty * price).toFixed(0)}
                      </span>
                      <button type="button" onClick={() => remove(idx)} disabled={fields.length === 1}
                        className="col-span-1 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 disabled:opacity-30 transition-colors mx-auto">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })}
                {errors.items && <p className="text-xs text-destructive">{errors.items.message}</p>}
              </div>
            </div>

            {/* Tax & Discount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>نسبة الضريبة (%)</label>
                <input {...register('taxRate')} type="number" min="0" max="100" className={inputClass} placeholder="15" />
              </div>
              <div>
                <label className={labelClass}>الخصم (ريال)</label>
                <input {...register('discount')} type="number" min="0" className={inputClass} placeholder="0" />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-muted/40 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>المجموع الفرعي</span>
                <span dir="ltr">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>ضريبة القيمة المضافة ({watchTax}%)</span>
                <span dir="ltr">{formatCurrency(taxAmount)}</span>
              </div>
              {watchDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>الخصم</span>
                  <span dir="ltr">- {formatCurrency(watchDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-foreground text-base border-t border-border pt-2">
                <span>الإجمالي</span>
                <span dir="ltr">{formatCurrency(total)}</span>
              </div>
            </div>

            <div>
              <label className={labelClass}>ملاحظات</label>
              <textarea {...register('notes')} rows={2} className={inputClass} placeholder="أي ملاحظات على الفاتورة..." />
            </div>
          </form>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-input hover:bg-muted transition-colors">إلغاء</button>
          <button form="invoice-form" type="submit" disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60">
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {isLoading ? 'جاري الحفظ...' : 'إنشاء الفاتورة'}
          </button>
        </div>
      </div>
    </div>
  )
}
