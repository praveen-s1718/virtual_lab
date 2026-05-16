import TopBar from './components/TopBar'
import SideNav from './components/SideNav'
import BottomBar from './components/BottomBar'
import SimulationCanvas from './components/SimulationCanvas'
import ControlPalette from './components/ControlPalette'
import AnalyticsPanel from './components/AnalyticsPanel'
import LibraryPage from './pages/LibraryPage'
import SharedCanvasHome from './pages/SharedCanvasHome'
import LandingPage from './pages/LandingPage'
import useSimulationStore from './store/simulationStore'

/* ── Simulation page ── */
function SimulationPage({ isShared }) {
  const activePage = useSimulationStore(state => state.activePage)
  const isExperiment = activePage === 'project'

  return (
    <>
      {!isExperiment && <SideNav />}
      <BottomBar />
      <main className={`fixed inset-0 pt-16 ${isExperiment ? 'pl-0' : 'pl-20'} pb-16 blueprint-grid overflow-hidden`}>
        <div className="relative w-full h-full">
          <SimulationCanvas isShared={isShared} />
          <ControlPalette />
          <AnalyticsPanel />
        </div>
      </main>
    </>
  )
}

/* ── Root App ── */
export default function App() {
  const { activePage, activeSharedProjectId, showLanding, dismissLanding } = useSimulationStore()

  /* Show landing page first */
  if (showLanding) {
    return <LandingPage onEnter={dismissLanding} />
  }

  return (
    <div className="bg-surface text-on-surface font-body h-screen w-screen overflow-hidden">
      <TopBar />
      
      {/* Always keep simulation mounted so physics engine and snapshot logic stay alive */}
      <SimulationPage isShared={activePage === 'shared-canvas'} />

      {/* Render Library Page on top */}
      {activePage === 'library' && (
        <main className="fixed inset-0 pt-16 blueprint-grid overflow-hidden bg-surface z-40">
          <LibraryPage />
        </main>
      )}

      {/* Render Shared Canvas Home on top */}
      {activePage === 'shared-canvas' && !activeSharedProjectId && (
        <main className="fixed inset-0 pt-16 blueprint-grid overflow-hidden bg-surface z-40">
          <SharedCanvasHome />
        </main>
      )}
    </div>
  )
}
