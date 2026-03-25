import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import CreateAccount from './pages/CreateAccount'
import AccountSettings from './pages/AccountSettings'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'
import DayDetails from './pages/DayDetails'
import './index.css'

function AppLayout() {
  const location = useLocation()
  const dashboardRoutes = ['/home', '/account-settings', '/day/:day']
  const isDashboard = dashboardRoutes.some(route =>
    location.pathname.startsWith(route.replace(':day', ''))
  )

  return (
    <div
      className={`app-shell d-flex w-100 ${isDashboard ? 'app-shell--dashboard align-items-start' : 'app-shell--auth justify-content-center align-items-center'}`}
    >
      <div
        className="w-100 app-shell__inner"
        style={{ maxWidth: isDashboard ? 'none' : 400 }}
      >
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/account-settings" element={<AccountSettings />} />
          <Route path="/home" element={<Home />} />
          <Route path="/day/:day" element={<DayDetails />} /> {/* <-- new */}
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