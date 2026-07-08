import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', maxWidth: '512px', margin: '0 auto' }}>
      <Navbar />
      <main style={{ flex: 1, paddingBottom: '100px' }}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
