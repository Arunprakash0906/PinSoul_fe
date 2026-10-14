import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import backgroundImage from './assets/pinsoul_location_bg_image.jpg'
import Home from './comp/Home'
import Sign from './comp/Sign'
import LocationDashboard from './comp/LocationDashboard'
import AllPinSoulLocation from './comp/AllPinSoulLocation'
import UserDashboard from './comp/UserDashboard'

function AppShell() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div
      className={`app-shell ${isHome ? 'home-shell' : ''}`}
      style={{ '--page-background': `url(${backgroundImage})` }}
    >
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<Sign isSignIn={true} />} />
          <Route path="/admin-signin" element={<Sign isSignIn initialAccountType="ADMIN" />} />
          <Route path="/signup" element={<Sign isSignIn={false} />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/location-dashboard" element={<LocationDashboard />} />
          <Route path="/all-locations" element={<AllPinSoulLocation />} />
          <Route path="/admin-dashboard" element={<AllPinSoulLocation isAdmin />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App
