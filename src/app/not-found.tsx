import Link from 'next/link'

export default function NotFound() {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0, fontFamily: 'Cairo, sans-serif', background: '#f8fafc' }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <h1 style={{ fontSize: '6rem', fontWeight: 'bold', color: '#3b82f6', margin: 0 }}>404</h1>
          <h2 style={{ fontSize: '1.5rem', color: '#1e293b', margin: '1rem 0 0.5rem' }}>الصفحة غير موجودة</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>الصفحة التي تبحث عنها غير موجودة أو تم نقلها</p>
          <Link href="/dashboard" style={{
            background: '#3b82f6',
            color: 'white',
            padding: '0.6rem 1.5rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: '500'
          }}>
            العودة للرئيسية
          </Link>
        </div>
      </body>
    </html>
  )
}
