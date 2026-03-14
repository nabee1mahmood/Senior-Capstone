import { Link } from 'react-router-dom'

function CreateAccount() {
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h3 className="card-title mb-4 text-center">Create account</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert("Create account (demo)");
          }}
        >
          <div className="form-group">
            <label htmlFor="createEmail">Email address</label>
            <input
              type="email"
              className="form-control"
              id="createEmail"
              placeholder="Enter email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="createPassword">Password</label>
            <input
              type="password"
              className="form-control"
              id="createPassword"
              placeholder="At least 8 characters"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              placeholder="Confirm password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Create account
          </button>
        </form>
        <p className="mt-3 text-center text-muted small mb-0">
          Already have an account? <Link to="/">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default CreateAccount;
