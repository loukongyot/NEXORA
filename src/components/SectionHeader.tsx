type SectionHeaderProps = {
  title: string
  eyebrow?: string
  action?: string
}

export function SectionHeader({ title, eyebrow, action }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#009FD1]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-xl font-semibold tracking-normal text-white">
          {title}
        </h2>
      </div>
      {action ? (
        <button
          className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-xl transition hover:border-[#009FD1]/50 hover:text-white"
          type="button"
        >
          {action}
        </button>
      ) : null}
    </div>
  )
}
