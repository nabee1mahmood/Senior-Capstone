import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="dashboard">
      <header className="dashboard-header d-flex justify-content-between align-items-center mb-4">
        <h1 className="h4 mb-0 font-weight-bold">Analytics Dashboard</h1>
        <Link to="/account-settings" className="btn btn-outline-primary btn-sm mr-2">
          Account settings
        </Link>
        <Link to="/" className="btn btn-outline-secondary btn-sm">
          Log out
        </Link>
      </header>


      <section className="stats-row row mb-4">
        <div className="col-6 col-md-3 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted small mb-1">Active Sensors</p>
              <p className="h4 mb-0 font-weight-bold">12</p>
            </div>
          </div>
        </div>


        <div className="col-6 col-md-3 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted small mb-1">Alerts Today</p>
              <p className="h4 mb-0 font-weight-bold">3</p>
            </div>
          </div>
        </div>


        <div className="col-6 col-md-3 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted small mb-1">Avg. Temperature</p>
              <p className="h4 mb-0 font-weight-bold">72°F</p>
            </div>
          </div>
        </div>


        <div className="col-6 col-md-3 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <p className="text-muted small mb-1">Humidity</p>
              <p className="h4 mb-0 font-weight-bold">45%</p>
            </div>
          </div>
        </div>
      </section>


      <section className="charts-row row">
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white font-weight-medium">
              Sensor activity
            </div>



            <div className="card-body d-flex align-items-end" style={{ minHeight: 200 }}>
              <div className="d-flex align-items-end gap-1 w-100" style={{ height: 160 }}>
                {[65, 40, 80, 55, 70, 45, 90].map((h, i) => (
                  <div
                    key={i}
                    className="flex-grow-1 bg-primary rounded"
                    style={{
                      height: `${h}%`,
                      minWidth: 24,
                      opacity: 0.85,
                    }}
                    title={`${h}%`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>


        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white font-weight-medium">
              Alerts by type
            </div>


            <div className="card-body" style={{ minHeight: 200 }}>
              <ul className="list-unstyled mb-0">
                <li className="d-flex justify-content-between py-2 border-bottom">
                  <span>Temperature</span>
                  <span className="font-weight-medium">5</span>
                </li>
                <li className="d-flex justify-content-between py-2 border-bottom">
                  <span>Motion</span>
                  <span className="font-weight-medium">2</span>
                </li>
                <li className="d-flex justify-content-between py-2">
                  <span>Door / Window</span>
                  <span className="font-weight-medium">1</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="recent-activity">
        <div className="card shadow-sm">
          <div className="card-header bg-white font-weight-medium">
            Recent activity
          </div>

          
          <div className="card-body">
            <p className="text-muted small mb-0">
              Living room sensor — 72°F · 2 min ago
            </p>
            <p className="text-muted small mb-0 mt-2">
              Front door — opened · 15 min ago
            </p>
            <p className="text-muted small mb-0 mt-2">
              Kitchen — motion detected · 1 hr ago
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
