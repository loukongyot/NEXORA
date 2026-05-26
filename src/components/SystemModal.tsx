import { useState } from 'react'
import type { FormEvent } from 'react'
import { X } from 'lucide-react'
import type {
  WorkspaceCategory,
  WorkspaceCollection,
  WorkspaceColor,
  WorkspaceSystem,
  WorkspaceSystemInput,
} from '../types/workspace'
import {
  defaultWorkspaceTags,
  detectWorkspaceLink,
  formatTags,
  parseTags,
  validateWorkspaceUrl,
  workspaceCategories,
  workspaceColors,
} from '../utils/workspaceOptions'

const emptyForm: WorkspaceSystemInput = {
  name: '',
  category: 'Forms',
  url: '',
  description: '',
  notes: '',
  icon: 'Forms',
  color: 'pink',
  favorite: false,
  pinned: false,
  tags: ['Active'],
  collectionId: '',
}

type SystemModalProps = {
  collections: WorkspaceCollection[]
  createTemplate?: Partial<WorkspaceSystemInput> | null
  editingSystem?: WorkspaceSystem | null
  onClose: () => void
  onSave: (input: WorkspaceSystemInput) => void
}

function getInitialForm(
  createTemplate?: Partial<WorkspaceSystemInput> | null,
  editingSystem?: WorkspaceSystem | null,
): WorkspaceSystemInput {
  if (createTemplate) {
    return {
      ...emptyForm,
      ...createTemplate,
    }
  }

  if (!editingSystem) {
    return emptyForm
  }

  return {
    name: editingSystem.name,
    category: editingSystem.category,
    url: editingSystem.url,
    description: editingSystem.description,
    notes: editingSystem.notes,
    icon: editingSystem.icon,
    color: editingSystem.color,
    favorite: editingSystem.favorite,
    pinned: editingSystem.pinned,
    tags: editingSystem.tags,
    collectionId: editingSystem.collectionId,
  }
}

export function SystemModal({
  collections,
  createTemplate,
  editingSystem,
  onClose,
  onSave,
}: SystemModalProps) {
  const [form, setForm] = useState<WorkspaceSystemInput>(() =>
    getInitialForm(createTemplate, editingSystem),
  )
  const [urlError, setUrlError] = useState('')

  function updateField<Value extends keyof WorkspaceSystemInput>(
    field: Value,
    value: WorkspaceSystemInput[Value],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
      icon: field === 'category' ? String(value) : currentForm.icon,
    }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validateWorkspaceUrl(form.url)) {
      setUrlError('Enter a valid http or https link.')
      return
    }
    onSave(form)
  }

  function handleUrlChange(url: string) {
    const detectedLink = detectWorkspaceLink(url)
    setUrlError(url && !validateWorkspaceUrl(url) ? 'Enter a valid http or https link.' : '')
    setForm((currentForm) => {
      if (!detectedLink) {
        return {
          ...currentForm,
          url,
        }
      }

      return {
        ...currentForm,
        category: detectedLink.category,
        color: detectedLink.color,
        icon: detectedLink.icon,
        tags: Array.from(new Set([...currentForm.tags, ...detectedLink.tags])),
        url,
      }
    })
  }

  function toggleTag(tag: string) {
    setForm((currentForm) => {
      const hasTag = currentForm.tags.includes(tag)

      return {
        ...currentForm,
        tags: hasTag
          ? currentForm.tags.filter((currentTag) => currentTag !== tag)
          : [...currentForm.tags, tag],
      }
    })
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-end bg-[#020617]/75 p-0 backdrop-blur-sm sm:place-items-center sm:p-5">
      <form
        className="max-h-[94vh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0f172a]/95 p-5 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:max-w-2xl sm:rounded-3xl sm:p-6"
        onSubmit={handleSubmit}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#009FD1]">
              Workspace System
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal text-white">
              {editingSystem ? 'แก้ไขระบบ' : 'เพิ่มระบบ'}
            </h2>
          </div>
          <button
            aria-label="Close modal"
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.07] text-slate-300"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-slate-300">Name</span>
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-[#009FD1]/50"
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="Daily Form Hub"
              required
              value={form.name}
            />
          </label>

          <label>
            <span className="text-sm font-medium text-slate-300">หมวดหมู่</span>
            <select
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[#16213a] px-4 py-3 text-white outline-none transition focus:border-[#009FD1]/50"
              onChange={(event) =>
                updateField('category', event.target.value as WorkspaceCategory)
              }
              value={form.category}
            >
              {workspaceCategories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-sm font-medium text-slate-300">Color</span>
            <select
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[#16213a] px-4 py-3 text-white outline-none transition focus:border-[#009FD1]/50"
              onChange={(event) =>
                updateField('color', event.target.value as WorkspaceColor)
              }
              value={form.color}
            >
              {workspaceColors.map((color) => (
                <option key={color}>{color}</option>
              ))}
            </select>
          </label>

          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-slate-300">URL</span>
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-[#009FD1]/50"
              onChange={(event) => handleUrlChange(event.target.value)}
              placeholder="https://..."
              required
              type="text"
              value={form.url}
            />
            {urlError ? (
              <p className="mt-2 text-xs font-medium text-[#ffb08d]">
                {urlError}
              </p>
            ) : null}
            {!urlError && detectWorkspaceLink(form.url) ? (
              <p className="mt-2 text-xs font-medium text-[#70dfff]">
                ตรวจพบ Google workspace link และตั้งค่าหมวดหมู่ให้อัตโนมัติ.
              </p>
            ) : null}
          </label>

          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-slate-300">Tags</span>
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-[#009FD1]/50"
              onChange={(event) =>
                updateField('tags', parseTags(event.target.value))
              }
              placeholder="Daily, Important, Custom"
              value={formatTags(form.tags)}
            />
          </label>

          <div className="flex flex-wrap gap-2 sm:col-span-2">
            {defaultWorkspaceTags.map((tag) => (
              <button
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  form.tags.includes(tag)
                    ? 'border-[#009FD1]/35 bg-[#009FD1]/15 text-[#70dfff]'
                    : 'border-white/10 bg-white/[0.06] text-slate-400 hover:text-white'
                }`}
                key={tag}
                onClick={() => toggleTag(tag)}
                type="button"
              >
                {tag}
              </button>
            ))}
          </div>

          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-slate-300">
              กลุ่มงาน
            </span>
            <select
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[#16213a] px-4 py-3 text-white outline-none transition focus:border-[#009FD1]/50"
              onChange={(event) =>
                updateField('collectionId', event.target.value)
              }
              value={form.collectionId}
            >
              <option value="">ไม่มีกลุ่มงาน</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </label>

          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-slate-300">
              คำอธิบาย
            </span>
            <textarea
              className="mt-2 min-h-28 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-[#009FD1]/50"
              onChange={(event) =>
                updateField('description', event.target.value)
              }
              placeholder="What this workspace system is for..."
              value={form.description}
            />
          </label>

          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-slate-300">Notes</span>
            <textarea
              className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-[#009FD1]/50"
              onChange={(event) => updateField('notes', event.target.value)}
              placeholder="บันทึกภายใน ผู้รับผิดชอบ reminder หรือบริบทการใช้งาน..."
              value={form.notes}
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 sm:col-span-2">
            <input
              checked={form.favorite}
              className="h-4 w-4 accent-[#f05193]"
              onChange={(event) =>
                updateField('favorite', event.target.checked)
              }
              type="checkbox"
            />
            <span className="text-sm font-medium text-slate-200">
              เพิ่มใน Starred
            </span>
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 sm:col-span-2">
            <input
              checked={form.pinned}
              className="h-4 w-4 accent-[#009FD1]"
              onChange={(event) => updateField('pinned', event.target.checked)}
              type="checkbox"
            />
            <span className="text-sm font-medium text-slate-200">
              Pin to Workspace
            </span>
          </label>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="rounded-2xl border border-white/10 bg-white/[0.07] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:text-white"
            onClick={onClose}
            type="button"
          >
            ยกเลิก
          </button>
          <button
            className="rounded-2xl border border-[#009FD1]/30 bg-[#009FD1]/20 px-5 py-3 text-sm font-semibold text-[#70dfff] shadow-lg shadow-[#009FD1]/10 transition hover:bg-[#009FD1]/25"
            type="submit"
          >
            {editingSystem ? 'บันทึกการแก้ไข' : 'บันทึกระบบ'}
          </button>
        </div>
      </form>
    </div>
  )
}
