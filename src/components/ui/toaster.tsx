'use client'

import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'

type ToastType = 'success' | 'error' | 'info'
interface Toast { id: string; message: string; type: ToastType }
interface ToastContextType { toast: (message: string, type?: ToastType) => void }

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id))

  const icons = { success: CheckCircle, error: AlertCircle, info: Info }
  const colors = {
    success: 'border-green-200 bg-green-50 text-green-800 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-300',
    error: 'border-red-200 bg-red-50 text-red-800 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-300',
    info: 'border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:border-blue-900/30 dark:text-blue-300',
  }

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      <div className="fixed bottom-4 left-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map(t => {
          const Icon = icons[t.type]
          return (
            <div
              key={t.id}
              className={cn(
                'flex items-start gap-3 p-4 rounded-xl border shadow-lg text-sm animate-fade-in',
                colors[t.type]
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="flex-1">{t.message}</p>
              <button onClick={() => removeToast(t.id)} className="opacity-60 hover:opacity-100 transition-opacity">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
