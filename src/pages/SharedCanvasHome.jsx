import { useState } from 'react'
import useSimulationStore from '../store/simulationStore'

export default function SharedCanvasHome() {
  const { sharedProjects, addSharedProject, openSharedProject, deleteSharedProject } = useSimulationStore()
  const [isCreating, setIsCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const handleCreate = (e) => {
    e.preventDefault()
    if (newTitle.trim()) {
      addSharedProject(newTitle.trim())
      setNewTitle('')
      setIsCreating(false)
    }
  }

  return (
    <div className="h-full w-full overflow-y-auto no-scrollbar pt-16">
      <div className="max-w-6xl mx-auto px-8 py-8">
        
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[10px] font-label text-primary uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
              Multiplayer
            </p>
            <h2 className="text-3xl font-headline font-black text-on-surface tracking-tighter">
              Shared Canvas
            </h2>
            <p className="text-sm font-body text-zinc-500 mt-1">
              Collaborate in real-time. Create a new shared workspace or open an existing one.
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-on-primary rounded-xl font-headline font-bold text-sm tracking-wide transition-colors shadow-[0_0_15px_rgba(47,245,255,0.2)]"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Create Project
          </button>
        </div>

        {/* Create Form Modal */}
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-surface-container-high border border-white/10 p-6 rounded-2xl shadow-2xl w-[400px]">
              <h3 className="text-lg font-headline font-bold mb-4 text-on-surface">New Shared Project</h3>
              <form onSubmit={handleCreate}>
                <input
                  type="text"
                  autoFocus
                  placeholder="Project Title (e.g., Team Physics Lab)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2 text-sm text-on-surface placeholder-zinc-600 focus:border-primary/50 focus:outline-none mb-6"
                />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setIsCreating(false); setNewTitle('') }}
                    className="px-4 py-2 rounded-lg text-sm font-label font-bold tracking-wider uppercase text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newTitle.trim()}
                    className="px-4 py-2 rounded-lg text-sm font-label font-bold tracking-wider uppercase bg-primary text-on-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Project Grid */}
        {sharedProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sharedProjects.map((project) => (
              <div
                key={project.id}
                className="group relative bg-surface-container-low border border-white/5 hover:border-primary/30 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(47,245,255,0.05)] hover:-translate-y-1 overflow-hidden"
                onClick={() => openSharedProject(project.id)}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:bg-primary/10" />
                
                <div className="flex items-start justify-between mb-4 relative">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-highest border border-white/5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">diversity_3</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteSharedProject(project.id)
                    }}
                    className="material-symbols-outlined text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Project"
                  >
                    delete
                  </button>
                </div>
                
                <h3 className="text-lg font-headline font-bold text-on-surface mb-1 relative truncate">
                  {project.title}
                </h3>
                <p className="text-[10px] font-label text-zinc-500 uppercase tracking-widest relative">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </p>
                
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between relative">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 border border-surface flex items-center justify-center">
                      <span className="text-[8px] font-bold text-primary">ME</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-label font-bold text-primary uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Open Lab <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/5 rounded-3xl bg-surface-container-lowest/30">
            <span className="material-symbols-outlined text-4xl text-zinc-600 mb-4">folder_shared</span>
            <h3 className="text-lg font-headline font-bold text-zinc-400 mb-1">No shared projects yet</h3>
            <p className="text-sm text-zinc-600 mb-6 max-w-sm text-center">
              Create your first shared project to start collaborating with others in real-time.
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-6 py-2 bg-surface-container-high hover:bg-white/10 text-on-surface rounded-xl font-headline font-bold text-sm tracking-wide transition-colors border border-outline-variant/20"
            >
              Create Project
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
