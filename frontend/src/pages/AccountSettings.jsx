import { Link } from 'react-router-dom'

function AccountSettings() {
  return (
    <div className="dashboard">
      <header className="dashboard-header d-flex justify-content-between align-items-center mb-4">
        <h1 className="h4 mb-0 font-weight-bold">Account Settings</h1>
        <div className="d-flex gap-2">
          <Link to="/home" className="btn btn-outline-secondary btn-sm mr-2">
            Back to dashboard
          </Link>
          <Link to="/" className="btn btn-outline-secondary btn-sm">
            Log out
          </Link>
        </div>
      </header>

      <section className="row">
        <div className="col-lg-8 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white font-weight-medium">
              Profile information
            </div>

            <div className="card-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  alert('Profile updated (demo)')
                }}
              >
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="firstName">First name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="firstName"
                      placeholder="Enter first name"
                      defaultValue="Alex"
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <label htmlFor="lastName">Last name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="lastName"
                      placeholder="Enter last name"
                      defaultValue="Morgan"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="emailAddress">Email address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="emailAddress"
                    placeholder="Enter email"
                    defaultValue="alex@email.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phoneNumber">Phone number</label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phoneNumber"
                    placeholder="Enter phone number"
                    defaultValue="(555) 123-4567"
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Save changes
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white font-weight-medium">
              Account summary
            </div>

            <div className="card-body">
              <p className="text-muted small mb-1">Plan</p>
              <p className="font-weight-bold mb-3">Standard</p>

              <p className="text-muted small mb-1">Connected sensors</p>
              <p className="font-weight-bold mb-3">12 devices</p>

              <p className="text-muted small mb-1">Last login</p>
              <p className="font-weight-bold mb-0">Today at 8:42 AM</p>
            </div>
          </div>
        </div>
      </section>

      <section className="row">
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white font-weight-medium">
              Change password
            </div>

            <div className="card-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  alert('Password updated (demo)')
                }}
              >
                <div className="form-group">
                  <label htmlFor="currentPassword">Current password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="currentPassword"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="newPassword"
                    placeholder="Enter new password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmNewPassword">Confirm new password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmNewPassword"
                    placeholder="Confirm new password"
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Update password
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white font-weight-medium">
              Preferences
            </div>

            <div className="card-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  alert('Preferences saved (demo)')
                }}
              >
                <div className="custom-control custom-switch mb-3">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="emailAlerts"
                    defaultChecked
                  />
                  <label className="custom-control-label" htmlFor="emailAlerts">
                    Email alerts
                  </label>
                </div>

                <div className="custom-control custom-switch mb-3">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="smsAlerts"
                  />
                  <label className="custom-control-label" htmlFor="smsAlerts">
                    SMS notifications
                  </label>
                </div>

                <div className="custom-control custom-switch mb-4">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="weeklyReports"
                    defaultChecked
                  />
                  <label className="custom-control-label" htmlFor="weeklyReports">
                    Weekly reports
                  </label>
                </div>

                <button type="submit" className="btn btn-primary">
                  Save preferences
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="card shadow-sm border-danger">
          <div className="card-header bg-white font-weight-medium text-danger">
            Danger zone
          </div>

          <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-md-center">
            <div className="mb-3 mb-md-0">
              <p className="mb-1 font-weight-medium">Delete account</p>
              <p className="text-muted small mb-0">
                Permanently remove your account and sensor history.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() => alert('Delete account (demo)')}
            >
              Delete account
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AccountSettings