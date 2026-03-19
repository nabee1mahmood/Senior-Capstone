import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import CreateAccount from './pages/CreateAccount'
import AccountSettings from './pages/AccountSettings'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'
import './index.css'

function AppLayout() {
  const location = useLocation()
  const dashboardRoutes = ['/home', '/account-settings']
  const isDashboard = dashboardRoutes.includes(location.pathname)

  return (
    <div
      className={`d-flex bg-light w-100 ${isDashboard ? 'align-items-start' : 'justify-content-center align-items-center'}`}
      style={{ minHeight: '100vh', padding: 16 }}
    >
      <div
        className="w-100"
        style={{ maxWidth: isDashboard ? 'none' : 400 }}
      >
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/account-settings" element={<AccountSettings />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
