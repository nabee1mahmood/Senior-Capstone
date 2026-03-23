import { Link } from 'react-router-dom'

function ForgotPassword() {
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h3 className="card-title mb-4 text-center">Forgot Password?</h3>
        <p className="text-muted small mb-3">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert("Reset Link Sent (demo)");
          }}
        >
          <div className="form-group">
            <label htmlFor="forgotEmail">Email Address</label>
            <input
              type="email"
              className="form-control"
              id="forgotEmail"
              placeholder="Enter Your Email"
              required
            />
          </div>

          
          <button type="submit" className="btn btn-primary btn-block">
            Send Reset Link
          </button>
        </form>
        <p className="mt-3 text-center text-muted small mb-0">
          <Link to="/">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
