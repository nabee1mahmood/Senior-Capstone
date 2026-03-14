import { Link } from 'react-router-dom'

function Login() {
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

        <form
          onSubmit={(e) => {
            e.preventDefault()
            alert('Logged in (demo only)')
          }}
        >
          <div className="form-group">
            <label htmlFor="emailInput">Email address</label>
            <input
              type="email"
              className="form-control"
              id="emailInput"
              placeholder="Please enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="passwordInput">Password</label>
            <input
              type="password"
              className="form-control"
              id="passwordInput"
              placeholder="Please enter your password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Login
          </button>
        </form>

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
