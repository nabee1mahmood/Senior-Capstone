import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api'

function Login() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = e.target
    const email = form.emailInput.value.trim()
    const password = form.passwordInput.value

    try {
      const data = await login(email, password)
      if (data.success) {
        navigate('/home')
        return
      }
      setError(data.message || 'Login failed')
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="text-center mb-3">
          <img
            src="/HomeSensor.png"
            alt="Home Sensor logo"
            style={{ maxWidth: '220px', width: '100%', height: 'auto' }}
          />
          <h5 className="mt-2">HomeSense Login Page</h5>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger small py-2" role="alert">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="emailInput">Email address</label>
            <input
              type="email"
              className="form-control"
              id="emailInput"
              name="emailInput"
              placeholder="Please enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="passwordInput">Password</label>
            <input
              type="password"
              className="form-control"
              id="passwordInput"
              name="passwordInput"
              placeholder="Please enter your password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <Link to="/home" className="btn btn-outline-secondary btn-block mt-2">
          View home page
        </Link>

        <div className="d-flex justify-content-between mt-3">
          <Link to="/forgot-password" className="btn btn-link p-0">
            Forgot password?
          </Link>
          <Link to="/create-account" className="btn btn-link p-0">
            Create account
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
