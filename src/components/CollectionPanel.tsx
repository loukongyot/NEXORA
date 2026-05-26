import { Plus } from 'lucide-react'
import type { WorkspaceCollection, WorkspaceSystem } from '../types/workspace'

type CollectionPanelProps = {
  collections: WorkspaceCollection[]
  onAddCollection: (name: string) => void
  onReorderCollections: (sourceId: string, targetId: string) => void
  systems: WorkspaceSystem[]
}

export function CollectionPanel({
  collections,
  onAddCollection,
  onReorderCollections,
  systems,
}: CollectionPanelProps) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f05193]">
            📁 Workspace
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-normal text-white">
            กลุ่มงาน
          </h2>
        </div>
        <button
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs font-medium text-slate-300"
          onClick={() => {
            const name = window.prompt('ชื่อกลุ่มงาน')
            if (name) {
              onAddCollection(name)
            }
          }}
          type="button"
        >
          <Plus size={14} />
          เพิ่มกลุ่ม
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {collections.map((collection) => {
          const total = systems.filter(
            (system) => system.collectionId === collection.id,
          ).length

          return (
            <article
              className="rounded-2xl border border-white/10 bg-white/[0.075] p-4 shadow-2xl shadow-black/20 backdrop-blur-2xl"
              draggable
              key={collection.id}
              onDragOver={(event) => event.preventDefault()}
              onDragStart={(event) =>
                event.dataTransfer.setData('collection-id', collection.id)
              }
              onDrop={(event) => {
                const sourceId = event.dataTransfer.getData('collection-id')
                if (sourceId) {
                  onReorderCollections(sourceId, collection.id)
                }
              }}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                {total} ระบบ
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">
                {collection.name}
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                ลากเพื่อจัดลำดับกลุ่มงานที่ใช้บ่อย.
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
