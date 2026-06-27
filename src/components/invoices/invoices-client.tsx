'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Receipt, Trash2, Eye } from 'lucide-react'
import { formatDate, formatCurrency, INVOICE_STATUS_MAP } from '@/lib/utils/helpers'
import { InvoiceModal } from './invoice-modal'

interface Patient { id: string; patientCode: string; user: { name: string } }
interface Invoice {
  id: string
  invoiceCode: string
  status: string
  total: number | string
  paidAmount: number | string
  issueDate: Date
  dueDate?: Date | null
  patient: { patientCode: string; user: { name: string } }
}

interface Props {
  invoices: Invoice[]
  total: number
  page: number
  perPage: number
  search: string
  status: string
  patients: Patient[]
  canEdit: boolean
}

const STATUSES = [
  { value: '', label: 'الكل' },
  { value: 'PAID', label: 'مدفوع' },
  { value: 'PENDING', label: 'معلق' },
  { value: 'PARTIAL', label: 'جزئي' },
]

export function InvoicesClient({ invoices, total, page, perPage, search, status, patients, canEdit }: Props) {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState(search)
  const [showModal, setShowModal] = useState(false)
  const totalPages = Math.ceil(total / perPage)

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams({ q: search, page: String(page), status, ...overrides })
    return `/invoices?${params}`
  }

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) return
    const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
  }

  // Summary stats
  const totalAmount = invoices.reduce((s, i) => s + Number(i.total), 0)
  const paidAmount = invoices.reduce((s, i) => s + Number(i.paidAmount), 0)
  const pendingAmount = totalAmount - paidAmount

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">الفواتير</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{total.toLocaleString('ar')} فاتورة</p>
        </div>
        {canEdit && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20">
            <Plus className="w-4 h-4" /> فاتورة جديدة
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'إجمالي الفواتير', value: formatCurrency(totalAmount), color: 'text-foreground' },
          { label: 'المبالغ المحصلة', value: formatCurrency(paidAmount), color: 'text-emerald-600' },
          { label: 'المبالغ المعلقة', value: formatCurrency(pendingAmount), color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="stat-card text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <form onSubmit={e => { e.preventDefault(); router.push(buildUrl({ q: searchValue, page: '1' })) }} className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={searchValue} onChange={e => setSearchValue(e.target.value)}
            placeholder="بحث بالاسم أو رقم الفاتورة..."
            className="pr-9 pl-4 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring w-64" />
        </form>
        <div className="flex items-center gap-1.5">
          {STATUSES.map(s => (
            <button key={s.value} onClick={() => router.push(buildUrl({ status: s.value, page: '1' }))}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${status === s.value ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:bg-muted'}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="data-table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['رقم الفاتورة', 'المريض', 'تاريخ الإصدار', 'تاريخ الاستحقاق', 'الإجمالي', 'المدفوع', 'الحالة', ''].map(h => (
                  <th key={h} className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">
                  <Receipt className="w-10 h-10 mx-auto mb-3 opacity-20" />لا توجد فواتير
                </td></tr>
              ) : (
                invoices.map(inv => {
                  const statusInfo = INVOICE_STATUS_MAP[inv.status] || { label: inv.status, color: 'bg-gray-100 text-gray-700' }
                  const remaining = Number(inv.total) - Number(inv.paidAmount)
                  return (
                    <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-primary">{inv.invoiceCode}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{inv.patient.user.name}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(inv.issueDate)}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{inv.dueDate ? formatDate(inv.dueDate) : '—'}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">{formatCurrency(Number(inv.total))}</td>
                      <td className="px-4 py-3 text-emerald-600 font-medium">{formatCurrency(Number(inv.paidAmount))}</td>
                      <td className="px-4 py-3"><span className={`status-badge ${statusInfo.color}`}>{statusInfo.label}</span></td>
                      <td className="px-4 py-3">
                        {canEdit && (
                          <button onClick={() => handleDelete(inv.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">عرض {((page - 1) * perPage) + 1}–{Math.min(page * perPage, total)} من {total}</p>
            <div className="flex gap-1">
              <button onClick={() => router.push(buildUrl({ page: String(page - 1) }))} disabled={page <= 1}
                className="px-3 py-1.5 text-xs rounded-lg border border-input hover:bg-muted disabled:opacity-40 transition-colors">السابق</button>
              <span className="px-2 text-xs text-muted-foreground">{page} / {totalPages}</span>
              <button onClick={() => router.push(buildUrl({ page: String(page + 1) }))} disabled={page >= totalPages}
                className="px-3 py-1.5 text-xs rounded-lg border border-input hover:bg-muted disabled:opacity-40 transition-colors">التالي</button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <InvoiceModal patients={patients} onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); router.refresh() }} />
      )}
    </div>
  )
}
