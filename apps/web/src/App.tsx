import { Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Dashboard } from '@/pages/Dashboard'
import { Matches } from '@/pages/Matches'
import { Champions } from '@/pages/Champions'
import { Stats } from '@/pages/Stats'

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/matches"   element={<Matches />} />
          <Route path="/champions" element={<Champions />} />
          <Route path="/stats"     element={<Stats />} />
        </Routes>
      </main>
    </div>
  )
}
