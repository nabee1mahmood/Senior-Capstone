import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Home.css";

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );
  const [showChartModal, setShowChartModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const theme = darkMode ? "dark" : "light";
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [darkMode]);

  useEffect(() => {
    document.body.style.overflow = showChartModal ? "hidden" : "auto";
  }, [showChartModal]);

  const getColor = (value) => {
    if (value < 50) return "bg-success";
    if (value < 75) return "bg-warning";
    return "bg-danger";
  };

  const weekdays = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const data = [65, 40, 80, 55, 70, 45, 90];

  const activities = [
    { name: "Living Room Sensor", type: "temperature", value: "72°F", timeAgo: "2 min ago" },
    { name: "Front Door", type: "door", value: "Opened", timeAgo: "15 min ago" },
    { name: "Kitchen", type: "motion", value: "Motion Detected", timeAgo: "1 hr ago" },
    { name: "Bedroom Sensor", type: "temperature", value: "70°F", timeAgo: "2 hr ago" },
    { name: "Garage Door", type: "door", value: "Closed", timeAgo: "3 hr ago" },
  ];

  const summaryStats = [
    { label: "Peak Activity Today", value: Math.max(...data) },
    { label: "Weekly Avg. Temperature", value: "76°F" },
    { label: "Most Active Sensor", value: "Living Room" },
  ];

  return (
    <div className={`dashboard gf-dashboard ${darkMode ? "dark" : "light"}`}>

      {/* HEADER */}
      <header className="dashboard-header d-flex justify-content-between align-items-center mb-4">
        <h1 className="h4 mb-0 font-weight-bold gf-dashboard-title">Analytics Dashboard</h1>

        {/* 🔥 FIXED HERE */}
        <div className="position-relative" style={{ zIndex: 9999 }}>
          <button
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
                zIndex: 9999, // 🔥 ensures it's above everything
              }}
            >
              <div className="list-group list-group-flush">
                <button
                  className="list-group-item list-group-item-action"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </button>

                <Link to="/account-settings" className="list-group-item list-group-item-action">
                  Account Settings
                </Link>

                <Link to="/" className="list-group-item list-group-item-action text-danger">
                  Log Out
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* SUMMARY */}
      <section className="row mb-4">
        {summaryStats.map((stat, i) => (
          <div
            key={i}
            className="col-6 col-md-4 mb-3 gf-stagger-in"
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            <div className="card shadow-sm h-100 text-center">
              <div className="card-body">
                <p className="text-muted small mb-1">{stat.label}</p>
                <p className="h4 mb-0">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* STATS */}
      <section className="row mb-4">
        {[
          { label: "Active Sensors", value: 12 },
          { label: "Alerts Today", value: 3 },
          { label: "Avg. Temperature (Today)", value: "64°F" },
          { label: "Humidity", value: "45%" },
        ].map((stat, i) => (
          <div
            key={i}
            className="col-6 col-md-3 mb-3 gf-stagger-in"
            style={{ animationDelay: `${0.2 + i * 0.06}s` }}
          >
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <p className="text-muted small">{stat.label}</p>
                <p className="h4">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* CHARTS */}
      <section className="row">
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">

            <div className="card-header d-flex justify-content-between">
              <span>Sensor Activity</span>
              <button className="btn btn-sm btn-outline-primary" onClick={() => setShowChartModal(true)}>
                Expand
              </button>
            </div>

            <div className="d-flex align-items-end" style={{ height: 160, gap: "6px", padding: "8px" }}>
              {data.map((h, i) => (
                <div
                  key={i}
                  className={`flex-grow-1 ${getColor(h)} rounded d-flex align-items-end justify-content-center`}
                  style={{ height: `${h}%`, cursor: "pointer" }}
                  onClick={() => navigate(`/day/${weekdays[i]}`)}
                >
                  <span style={{ color: "white", fontWeight: "bold" }}>{h}</span>
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-between px-2">
              {weekdays.map((d, i) => (
                <span key={i} style={{ flex: 1, textAlign: "center", fontSize: "0.75rem" }}>
                  {d.slice(0, 3)}
                </span>
              ))}
            </div>

            <div className="px-3 pb-2 small d-flex">
              <span className="text-success mr-3">● Normal</span>
              <span className="text-warning mr-3">● Warning</span>
              <span className="text-danger">● Critical</span>
            </div>

          </div>
        </div>

        {/* ALERTS */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header">Alerts by Type</div>
            <div className="card-body">
              <ul className="list-unstyled">
                <li className="d-flex justify-content-between border-bottom py-2"><span>Temperature</span><span>5</span></li>
                <li className="d-flex justify-content-between border-bottom py-2"><span>Motion</span><span>2</span></li>
                <li className="d-flex justify-content-between py-2"><span>Door / Window</span><span>1</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* RECENT ACTIVITY */}
      <section>
        <div className="card shadow-sm">
          <div className="card-header d-flex justify-content-between">
            <h5>Recent Activity</h5>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="motion">Motion</option>
              <option value="temperature">Temperature</option>
              <option value="door">Door</option>
            </select>
          </div>

          <div className="card-body">
            {activities
              .filter((a) => filter === "all" || a.type === filter)
              .map((a, i) => (
                <p key={i} className="text-muted small">
                  {a.name} — {a.value} · {a.timeAgo}
                </p>
              ))}
          </div>
        </div>
      </section>

      {/* MODAL */}
      {showChartModal && (
        <div
          onClick={() => setShowChartModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
        >
          <div
            className="card p-4"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "90%", height: "70%" }}
          >
            <div className="d-flex justify-content-between mb-3">
              <h5>Expanded Chart</h5>
              <button className="btn btn-danger btn-sm" onClick={() => setShowChartModal(false)}>
                Close
              </button>
            </div>

            <div className="d-flex align-items-end" style={{ height: "100%" }}>
              {data.map((h, i) => (
                <div key={i} className={`flex-grow-1 ${getColor(h)} mx-1`} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Home;