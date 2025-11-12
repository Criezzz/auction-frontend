import './App.css'
import { Outlet } from 'react-router-dom'
import SiteLayout from './layouts/SiteLayout'

export default function App() {
  return (
    <SiteLayout>
      <Outlet />
    </SiteLayout>
  )
}
