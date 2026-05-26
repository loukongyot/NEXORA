import { CheckCircle2 } from 'lucide-react'

export type ToastMessage = {
  id: string
  message: string
}

type ToastStackProps = {
  toasts: ToastMessage[]
}

export function ToastStack({ toasts }: ToastStackProps) {
  return (
    <div className="fixed right-4 top-24 z-[90] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6">
      {toasts.map((toast) => (
        <div
          className="animate-[toast-in_220ms_ease-out] rounded-2xl border border-[#009FD1]/25 bg-[#0f172a]/90 p-4 text-sm text-white shadow-2xl shadow-[#009FD1]/10 backdrop-blur-2xl"
          key={toast.id}
        >
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#009FD1]/15 text-[#70dfff]">
              <CheckCircle2 size={18} />
            </span>
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
