import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Home.css";

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // ✅ Apply dark/light mode to entire page (BODY)
  useEffect(() => {
    document.body.className = darkMode ? "dark" : "light";
  }, [darkMode]);

  // ✅ Color logic for bars
  const getColor = (value) => {
    if (value < 50) return "bg-success";   // green
    if (value < 75) return "bg-warning";   // yellow
    return "bg-danger";                    // red
  };

  return (
    <div className={`dashboard ${darkMode ? "dark" : "light"}`}>
      {/* Header */}
      <header className="dashboard-header d-flex justify-content-between align-items-center mb-4">
        <h1 className="h4 mb-0 font-weight-bold">Analytics Dashboard</h1>

        <div className="position-relative">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>

          {menuOpen && (
            <div
              className="card shadow-sm position-absolute"
              style={{
                top: "calc(100% + 8px)",
                right: 0,
                minWidth: 200,
                zIndex: 1000,
              }}
            >
              <div className="list-group list-group-flush">
                <button
                  className="list-group-item list-group-item-action"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </button>

                <Link
                  to="/account-settings"
                  className="list-group-item list-group-item-action"
                  onClick={() => setMenuOpen(false)}
                >
                  Account Settings
                </Link>

                <Link
                  to="/"
                  className="list-group-item list-group-item-action text-danger"
                  onClick={() => setMenuOpen(false)}
                >
                  Log Out
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Stats */}
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

      {/* Charts */}
      <section className="charts-row row">
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header font-weight-medium">
              Sensor Activity
            </div>

            {/* ✅ FIXED: spacing + color + labels */}
            <div
              className="d-flex align-items-end w-100"
              style={{ height: 160, gap: "6px", padding: "8px" }}
            >
              {[65, 40, 80, 55, 70, 45, 90].map((h, i) => (
                <div
                  key={i}
                  className={`flex-grow-1 ${getColor(h)} rounded d-flex align-items-end justify-content-center`}
                  style={{
                    height: `${h}%`,
                    minWidth: 24,
                    opacity: 0.9,
                  }}
                >
                  <span
                    style={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "0.8rem",
                      marginBottom: 2,
                    }}
                  >
                    {h}
                  </span>
                </div>
              ))}
            </div>

            {/* ✅ Optional legend */}
            <div className="px-3 pb-2 small d-flex gap-3">
              <span className="text-success">● Normal</span>
              <span className="text-warning">● Warning</span>
              <span className="text-danger">● Critical</span>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header font-weight-medium">Alerts by Type</div>

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

      {/* Activity */}
      <section className="recent-activity">
        <div className="card shadow-sm">
          <div className="card-header font-weight-medium">Recent Activity</div>

          <div className="card-body">
            <p className="text-muted small mb-0">
              Living Room Sensor — 72°F · 2 min ago
            </p>
            <p className="text-muted small mb-0 mt-2">
              Front Door — Opened · 15 min ago
            </p>
            <p className="text-muted small mb-0 mt-2">
              Kitchen — Motion Detected · 1 hr ago
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;