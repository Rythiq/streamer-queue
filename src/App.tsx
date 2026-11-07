import { HashRouter, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import ManagePage from './pages/ManagePage'
import NotFound from './pages/NotFound'
import QueueView from './pages/QueueView'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/q/:id" element={<QueueView />} />
        <Route path="/m/:id" element={<ManagePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  )
}
