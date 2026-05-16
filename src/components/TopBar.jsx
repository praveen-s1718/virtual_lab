import { useState } from 'react'
import useSimulationStore from '../store/simulationStore.js'

const NAV_LINKS = [
  { id: 'local-canvas', label: 'Local Canvas' },
  { id: 'shared-canvas', label: 'Shared Canvas' },
  { id: 'library',      label: 'Library' },
]

const ICON_BTNS = [
  { icon: 'group',          title: 'Collaborators' },
  { icon: 'notifications',  title: 'Notifications' },
  { icon: 'account_circle', title: 'Profile' },
]

export default function TopBar() {
  const { labId, activePage, setActivePage, socketConnected, remoteCollaborators, activeSharedProjectId, closeSharedProject, sharedProjects } = useSimulationStore()
  const [inviteCopied, setInviteCopied] = useState(false)

  const handleInvite = () => {
    // Generate an invite link using the current origin and Lab ID
    const inviteUrl = `${window.location.origin}/?lab=${labId}`
    
    // Safely copy to clipboard inside browser environments/iframes
    const textArea = document.createElement('textarea')
    textArea.value = inviteUrl
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      document.execCommand('copy')
      setInviteCopied(true)
      setTimeout(() => setInviteCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy invite link', err)
    }
    
    document.body.removeChild(textArea)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 bg-surface/90 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">

      {/* ── Left: logo + lab badge + nav ── */}
      <div className="flex items-center gap-8">

        {/* Logo */}
        <h1 className="text-xl font-black tracking-tighter text-primary font-headline uppercase select-none">
          Virtual-Lab
        </h1>

        {/* Lab ID badge + socket status */}
        <div className={`flex items-center gap-2 transition-opacity ${activePage === 'shared-canvas' && activeSharedProjectId ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button
            onClick={() => closeSharedProject()}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface-container hover:bg-surface-container-highest border border-outline-variant/20 text-zinc-400 hover:text-white transition-colors"
            title="Back to Shared Projects"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
          </button>
          
          <div className="px-3 py-1 bg-surface-container-high border border-outline-variant/20 rounded-lg flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                socketConnected ? 'bg-primary animate-pulse' : 'bg-zinc-600'
              }`}
            />
          <span className="text-[10px] font-bold text-primary font-label tracking-widest uppercase">
            Lab ID: {labId}
          </span>
          {socketConnected && (
            <span className="text-[9px] font-label text-primary/50 uppercase tracking-widest pl-1 border-l border-outline-variant/20">
              {remoteCollaborators.length > 0
                ? `+${remoteCollaborators.length} live`
                : 'connected'}
            </span>
          )}
        </div>
      </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ id, label }) => (
            <button
              key={id}
              id={`nav-${id}`}
              onClick={() => {
                setActivePage(id)
              }}
              className={`font-headline uppercase tracking-[0.05em] text-xs font-bold transition-all duration-200 ${
                activePage === id ? 'nav-link-active' : 'nav-link'
              }`}
            >
              {label}
            </button>
          ))}

          {/* Dynamic Project Tab */}
          {useSimulationStore.getState().activeExperimentConfig && (
            <div className="flex items-center gap-1 group">
              <button
                onClick={() => setActivePage('project')}
                className={`font-headline uppercase tracking-[0.05em] text-xs font-bold transition-all duration-200 py-1 px-2 rounded-md ${
                  activePage === 'project' ? 'bg-primary/10 text-primary' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {useSimulationStore.getState().activeExperimentConfig.title}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  useSimulationStore.getState().closeActiveProject()
                }}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/10 text-zinc-600 hover:text-white transition-all"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          )}
        </nav>
      </div>

      {/* ── Right: avatars + icon buttons ── */}
      <div className="flex items-center gap-6">

        {/* Collaborator avatars */}
        <div className={`flex -space-x-2 items-center transition-opacity ${activePage === 'shared-canvas' && activeSharedProjectId ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          
          {/* "You" Avatar */}
          <div
            title="You"
            className="relative w-8 h-8 rounded-full border-2 border-surface overflow-hidden cursor-pointer hover:z-10 hover:scale-110 transition-transform bg-primary/20 flex items-center justify-center"
          >
            <span className="text-[10px] font-bold text-primary font-headline uppercase tracking-wider">
              ME
            </span>
            {/* Online dot */}
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-surface bg-primary" />
          </div>

          {/* Remote Collaborators (from socket state) */}
          {remoteCollaborators.map((user, idx) => (
            <div
              key={user.id || idx}
              title={user.name || "Remote User"}
              className="relative w-8 h-8 rounded-full border-2 border-surface overflow-hidden cursor-pointer hover:z-10 hover:scale-110 transition-transform bg-secondary/20 flex items-center justify-center"
            >
              <span className="text-[10px] font-bold text-secondary font-headline uppercase tracking-wider">
                {(user.name || "RU").slice(0, 2)}
              </span>
              {/* Online dot */}
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-surface bg-secondary" />
            </div>
          ))}

          {/* Add collaborator / Invite Action */}
          <div className="relative flex items-center">
            <button
              id="add-collaborator-btn"
              onClick={handleInvite}
              className={`w-8 h-8 rounded-full border-2 border-surface flex items-center justify-center transition-all ml-1 z-10 ${
                inviteCopied 
                  ? 'bg-primary border-primary text-on-primary' 
                  : 'bg-surface-container-highest hover:bg-surface-container text-on-surface-variant'
              }`}
              title="Copy Invite Link"
            >
              <span className="material-symbols-outlined text-sm">
                {inviteCopied ? 'check' : 'add'}
              </span>
            </button>

            {/* Success Tooltip popup */}
            {inviteCopied && (
              <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded shadow-lg animate-in fade-in slide-in-from-top-1 whitespace-nowrap pointer-events-none">
                Link Copied!
              </div>
            )}
          </div>
        </div>

        {/* Icon buttons */}
        <div className="flex items-center gap-3">
          {ICON_BTNS.map(({ icon, title }) => (
            <button
              key={icon}
              id={`topbar-${icon}`}
              title={title}
              className="material-symbols-outlined text-[22px] text-zinc-500 hover:text-white transition-colors duration-200 cursor-pointer"
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}