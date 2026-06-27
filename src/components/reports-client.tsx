'use client'

import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts'
import { formatCurrency, APPOINTMENT_STATUS_MAP, INVOICE_STATUS_MAP } from '@/lib/utils/helpers'
import { Download, FileText, TrendingUp, Users, Calendar, Receipt } from 'lucide-react'

interface MonthlyData {
  month: string
  appointments: number
  newPatients: number
  revenue: number
}

interface Props {
  data: {
    monthlyData: MonthlyData[]
    topDoctors: { name: string; specialization: string; appointments: number }[]
    statusCounts: { status: string; count: number }[]
    invoiceStatusCounts: { status: string; count: number; total: number }[]
    summary: {
      totalPatients: number
      totalDoctors: number
      totalAppointments: number
      totalRevenue: number
      pendingInvoices: number
    }
  }
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'مجدول', CONFIRMED: 'مؤكد', COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي', NO_SHOW: 'لم يحضر',
  PAID: 'مدفوع', PENDING: 'معلق', PARTIAL: 'جزئي',
}

export function ReportsClient({ data }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'revenue' | 'doctors'>('overview')

  const { monthlyData, topDoctors, statusCounts, invoiceStatusCounts, summary } = data

  function exportCSV() {
    const rows = [
      ['الشهر', 'المواعيد', 'مرضى جدد', 'الإيرادات (ريال)'],
      ...monthlyData.map(d => [d.month, d.appointments, d.newPatients, d.revenue]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'clinic-report.csv'; a.click()
  }

  const statCards = [
    { label: 'إجمالي المرضى', value: summary.totalPatients.toLocaleString('ar'), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'إجمالي المواعيد', value: summary.totalAppointments.toLocaleString('ar'), icon: Calendar, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
    { label: 'إجمالي الإيرادات', value: formatCurrency(summary.totalRevenue), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'فواتير معلقة', value: formatCurrency(summary.pendingInvoices), icon: Receipt, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ]

  const tabClass = (t: string) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === t
      ? 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`

  const tooltipStyle = {
    contentStyle: {
      background: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '8px',
      fontSize: '12px',
    },
    labelStyle: { color: 'hsl(var(--foreground))' },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">التقارير والإحصاءات</h1>
          <p className="text-muted-foreground text-sm mt-0.5">نظرة شاملة على أداء العيادة</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-background hover:bg-muted text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          تصدير CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="stat-card">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {[
          { key: 'overview', label: 'نظرة عامة' },
          { key: 'appointments', label: 'المواعيد' },
          { key: 'revenue', label: 'الإيرادات' },
          { key: 'doctors', label: 'الأطباء' },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key as typeof activeTab)} className={tabClass(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Monthly Appointments */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">المواعيد الشهرية</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="appointments" name="المواعيد" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Appointment Status Pie */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">توزيع حالات المواعيد</h3>
            {statusCounts.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={statusCounts.map(s => ({ name: STATUS_LABELS[s.status] || s.status, value: s.count }))}
                    cx="50%" cy="50%" outerRadius={90} innerRadius={50}
                    paddingAngle={3} dataKey="value"
                  >
                    {statusCounts.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-60 text-muted-foreground text-sm">لا توجد بيانات</div>
            )}
          </div>

          {/* Monthly Revenue Area */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">الإيرادات الشهرية</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="revenueGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => [formatCurrency(v), 'الإيرادات']} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revenueGrad2)" name="الإيرادات" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* New Patients Line */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">نمو المرضى الجدد</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="newPatients" name="مرضى جدد" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: '#22c55e', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">المواعيد والمرضى الجدد شهرياً</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="appointments" name="المواعيد" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="newPatients" name="مرضى جدد" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status Table */}
          <div className="data-table-container">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-semibold text-foreground">إحصاءات حالات المواعيد</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['الحالة', 'العدد', 'النسبة'].map(h => (
                    <th key={h} className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {statusCounts.map(s => {
                  const total = statusCounts.reduce((acc, cur) => acc + cur.count, 0)
                  const pct = total > 0 ? ((s.count / total) * 100).toFixed(1) : '0'
                  const info = APPOINTMENT_STATUS_MAP[s.status]
                  return (
                    <tr key={s.status} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="px-5 py-3">
                        <span className={`status-badge ${info?.color || 'bg-gray-100 text-gray-700'}`}>{info?.label || s.status}</span>
                      </td>
                      <td className="px-5 py-3 font-medium text-foreground">{s.count.toLocaleString('ar')}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-24">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">الإيرادات الشهرية التفصيلية</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => [formatCurrency(v), 'الإيرادات']} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#revGrad)" name="الإيرادات" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="data-table-container">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-semibold text-foreground">حالات الفواتير</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['الحالة', 'عدد الفواتير', 'الإجمالي'].map(h => (
                    <th key={h} className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoiceStatusCounts.map(s => {
                  const info = INVOICE_STATUS_MAP[s.status]
                  return (
                    <tr key={s.status} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="px-5 py-3">
                        <span className={`status-badge ${info?.color || 'bg-gray-100 text-gray-700'}`}>{info?.label || s.status}</span>
                      </td>
                      <td className="px-5 py-3 font-medium">{s.count}</td>
                      <td className="px-5 py-3 font-semibold text-foreground">{formatCurrency(s.total)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Doctors Tab */}
      {activeTab === 'doctors' && (
        <div className="space-y-4">
          <div className="data-table-container">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-semibold text-foreground">أكثر الأطباء نشاطاً</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['الترتيب', 'الطبيب', 'التخصص', 'عدد المواعيد'].map(h => (
                    <th key={h} className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topDoctors.map((d, i) => (
                  <tr key={d.name} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-5 py-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-muted text-muted-foreground'}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-foreground">{d.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{d.specialization}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-32">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${topDoctors[0].appointments > 0 ? (d.appointments / topDoctors[0].appointments) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="font-semibold text-foreground">{d.appointments}</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {topDoctors.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">لا توجد بيانات</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {topDoctors.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4">مقارنة المواعيد بين الأطباء</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topDoctors.map(d => ({ name: d.name.split(' ').slice(-1)[0], مواعيد: d.appointments }))} layout="vertical" barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="مواعيد" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
