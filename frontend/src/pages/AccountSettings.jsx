import { Link } from 'react-router-dom'
import './AccountSettings.css'

function AccountSettings() {
  return (
    <div className="dashboard">
      <header className="dashboard-header d-flex justify-content-between align-items-center mb-4">
        <h1 className="h4 mb-0 font-weight-bold">Account Settings</h1>
        <div className="d-flex gap-2">
          <Link to="/home" className="btn btn-outline-secondary btn-sm">
            Back To Dashboard
          </Link>
          <Link to="/" className="btn btn-outline-secondary btn-sm">
            Log Out
          </Link>
        </div>
      </header>

      <section className="row">
        <div className="col-lg-8 mb-4">
          <div className="card shadow-sm h-100 custom-card">
            <div className="card-header font-weight-medium">Profile Information</div>

            <div className="card-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  alert('Profile updated (demo)')
                }}
              >
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      className="form-control custom-input"
                      id="firstName"
                      placeholder="Enter first name"
                      defaultValue="Paul"
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      className="form-control custom-input"
                      id="lastName"
                      placeholder="Enter last name"
                      defaultValue="Mahmood"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="emailAddress">Email Address</label>
                  <input
                    type="email"
                    className="form-control custom-input"
                    id="emailAddress"
                    placeholder="Enter email"
                    defaultValue="pmahmo00@email.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control custom-input"
                    id="phoneNumber"
                    placeholder="Enter phone number"
                    defaultValue="(420) 069-1337"
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm h-100 custom-card">
            <div className="card-header font-weight-medium">Account Summary</div>

            <div className="card-body">
              <p className="text-muted small mb-1">Plan</p>
              <p className="font-weight-bold mb-3">Standard</p>

              <p className="text-muted small mb-1">Connected Sensors</p>
              <p className="font-weight-bold mb-3">12 Devices</p>

              <p className="text-muted small mb-1">Last Login</p>
              <p className="font-weight-bold mb-0">Today At 8:42 AM</p>
            </div>
          </div>
        </div>
      </section>

      <section className="row">
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100 custom-card">
            <div className="card-header font-weight-medium">Change Password</div>

            <div className="card-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  alert('Password updated (demo)')
                }}
              >
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    className="form-control custom-input"
                    id="currentPassword"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    className="form-control custom-input"
                    id="newPassword"
                    placeholder="Enter new password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmNewPassword">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control custom-input"
                    id="confirmNewPassword"
                    placeholder="Confirm new password"
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Update Password
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100 custom-card">
            <div className="card-header font-weight-medium">Preferences</div>

            <div className="card-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  alert('Preferences saved (demo)')
                }}
              >
                <div className="form-check form-switch mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="emailAlerts"
                    defaultChecked
                  />
                  <label className="form-check-label" htmlFor="emailAlerts">
                    Email Alerts
                  </label>
                </div>

                <div className="form-check form-switch mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="smsAlerts"
                  />
                  <label className="form-check-label" htmlFor="smsAlerts">
                    SMS Notifications
                  </label>
                </div>

                <div className="form-check form-switch mb-4">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="weeklyReports"
                    defaultChecked
                  />
                  <label className="form-check-label" htmlFor="weeklyReports">
                    Weekly Reports
                  </label>
                </div>

                <button type="submit" className="btn btn-primary">
                  Save Preferences
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="card shadow-sm border-danger custom-card">
          <div className="card-header font-weight-medium text-danger">Danger Zone</div>

          <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-md-center">
            <div className="mb-3 mb-md-0">
              <p className="mb-1 font-weight-medium">Delete Account</p>
              <p className="text-muted small mb-0">
                Permanently Remove Your Account and Sensor History.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() => alert('Delete account (demo)')}
            >
              Delete Account
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AccountSettings