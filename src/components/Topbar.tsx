import { Menu, Moon, Search, UserRound } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import type { WorkspaceSystem } from '../types/workspace'

type TopbarProps = {
  onCommitSearch: (query?: string) => void
  onMenuClick: () => void
  onOpenSystem: (system: WorkspaceSystem) => void
  onSearchChange: (value: string) => void
  recentSearches: string[]
  searchQuery: string
  searchResults: WorkspaceSystem[]
}

export function Topbar({
  onCommitSearch,
  onMenuClick,
  onOpenSystem,
  onSearchChange,
  recentSearches,
  searchQuery,
  searchResults,
}: TopbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const showDropdown =
    isSearchOpen && Boolean(searchQuery.trim() || recentSearches.length > 0)

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onCommitSearch()
  }

  function renderSearchDropdown() {
    if (!showDropdown) {
      return null
    }

    return (
      <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-3xl border border-white/10 bg-[#0f172a]/95 p-3 shadow-2xl shadow-black/35 backdrop-blur-2xl">
        {searchQuery.trim() ? (
          <>
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#009FD1]">
              Live Results
            </p>
            <div className="space-y-2">
              {searchResults.length > 0 ? (
                searchResults.map((system) => (
                  <button
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-left transition hover:border-[#009FD1]/35 hover:bg-white/[0.1]"
                    key={system.id}
                    onClick={() => {
                      onCommitSearch(searchQuery)
                      onOpenSystem(system)
                    }}
                    type="button"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-white">
                        {system.name}
                      </span>
                      <span className="mt-1 block text-xs text-slate-400">
                        {system.category}
                        {system.tags.length ? ` - ${system.tags.join(', ')}` : ''}
                      </span>
                    </span>
                    <span className="rounded-full bg-[#009FD1]/15 px-2 py-1 text-xs text-[#70dfff]">
                      Open
                    </span>
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.04] p-4 text-sm text-slate-400">
                  No systems found. Try a name, category, or tag.
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#f05193]">
              Recent Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search) => (
                <button
                  className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white"
                  key={search}
                  onClick={() => onSearchChange(search)}
                  type="button"
                >
                  {search}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0f172a]/70 px-4 py-4 backdrop-blur-2xl sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          aria-label="Open navigation"
          className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.07] text-slate-200 lg:hidden"
          onClick={onMenuClick}
          type="button"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f05193]">
            Workspace
          </p>
          <h2 className="truncate text-lg font-semibold tracking-normal text-white sm:text-2xl">
            NEXORA Command Dashboard
          </h2>
        </div>

        <form
          className="relative hidden min-w-72 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-slate-400 shadow-2xl shadow-black/10 backdrop-blur-2xl md:flex"
          onSubmit={handleSearchSubmit}
        >
          <Search size={18} />
          <input
            aria-label="Search workspace"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            onBlur={() => window.setTimeout(() => setIsSearchOpen(false), 150)}
            onChange={(event) => onSearchChange(event.target.value)}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search forms, sheets, scripts, folders..."
            value={searchQuery}
            type="search"
          />
          {renderSearchDropdown()}
        </form>

        <button
          aria-label="Theme toggle placeholder"
          className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.07] text-slate-300 transition hover:border-[#6b5095]/50 hover:text-white"
          type="button"
        >
          <Moon size={18} />
        </button>

        <button
          aria-label="User profile placeholder"
          className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-gradient-to-br from-[#f05193]/30 via-[#6b5095]/25 to-[#009FD1]/30 text-white shadow-lg shadow-[#009FD1]/10"
          type="button"
        >
          <UserRound size={18} />
        </button>
      </div>

      <form
        className="relative mt-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-slate-400 md:hidden"
        onSubmit={handleSearchSubmit}
      >
        <Search size={18} />
        <input
          aria-label="Search workspace"
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          onBlur={() => window.setTimeout(() => setIsSearchOpen(false), 150)}
          onChange={(event) => onSearchChange(event.target.value)}
          onFocus={() => setIsSearchOpen(true)}
          placeholder="Search workspace..."
          value={searchQuery}
          type="search"
        />
        {renderSearchDropdown()}
      </form>
    </header>
  )
}
