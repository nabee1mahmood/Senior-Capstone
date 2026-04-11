import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { fetchDeviceOverview } from "../api";
import "./Home.css";

function displayNameFromEmail(email) {
  if (!email || typeof email !== "string") return "there";
  const local = email.split("@")[0] || "";
  if (!local) return "there";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

function formatReading(value) {
  if (value === null || value === undefined) return "—";
  if (typeof value !== "number" || Number.isNaN(value)) return String(value);
  const rounded = Math.round(value * 100) / 100;
  return String(+rounded)
}

function Home({ darkMode, setDarkMode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadDevices = useCallback(async (userId, opts = {}) => {
    const { silent } = opts;
    if (!silent) {
      setLoadError("");
      setLoading(true);
    }
    try {
      const data = await fetchDeviceOverview(userId);
      setDevices(data.devices || []);
    } catch (err) {
      if (!silent) {
        setLoadError(err.message || "Could not load devices");
        setDevices([]);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("homesense_user");
    if (!raw) {
      navigate("/", { replace: true });
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed?.id) {
        navigate("/", { replace: true });
        return;
      }
      setUser(parsed);
      loadDevices(parsed.id);
    } catch {
      navigate("/", { replace: true });
    }
  }, [navigate, loadDevices]);

  useEffect(() => {
    if (!user?.id) return undefined;
    const id = user.id;
    const intervalMs = 2500;
    const idInterval = window.setInterval(() => {
      loadDevices(id, { silent: true });
    }, intervalMs);
    return () => window.clearInterval(idInterval);
  }, [user?.id, loadDevices]);

  function handleLogout() {
    localStorage.removeItem("homesense_user");
    navigate("/", { replace: true });
  }

  const welcomeName = displayNameFromEmail(user?.email);

  return (
    <div className={`dashboard gf-dashboard ${darkMode ? "dark" : "light"}`}>
      <p className="mb-3 h5 font-weight-normal" style={{ fontWeight: 500 }}>
        Welcome Back, {welcomeName}!
      </p>

      <header className="dashboard-header d-flex justify-content-between align-items-center mb-4">
        <h1 className="h4 mb-0 font-weight-bold gf-dashboard-title">Analytics Dashboard</h1>

        <div className="position-relative" style={{ zIndex: 9999 }}>
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
                zIndex: 9999,
              }}
            >
              <div className="list-group list-group-flush">
                <button
                  type="button"
                  className="list-group-item list-group-item-action"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </button>

                <Link to="/account-settings" className="list-group-item list-group-item-action">
                  Account Settings
                </Link>

                <button
                  type="button"
                  className="list-group-item list-group-item-action text-danger"
                  onClick={handleLogout}
                >
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <section>
        <div className="card shadow-sm">
          <div className="card-header">Device List</div>
          <div className="card-body">
            {loadError && (
              <div className="alert alert-danger small py-2" role="alert">
                {loadError}
              </div>
            )}
            {loading && !loadError && <p className="text-muted small mb-0">Loading devices…</p>}
            {!loading && !loadError && devices.length === 0 && (
              <p className="text-muted small mb-0">No devices for this account.</p>
            )}
            {!loading &&
              devices.map((d) => (
                <div
                  key={d.id}
                  className="d-flex justify-content-between align-items-center border-bottom py-2"
                >
                  <span>{d.label}</span>
                  <span className="text-right" style={{ fontFamily: "ui-monospace, monospace" }}>
                    <span className="font-weight-bold">{formatReading(d.reading)}</span>
                    {d.unit ? (
                      <span className="text-muted small ml-2" style={{ fontFamily: "inherit" }}>
                        {d.unit}
                      </span>
                    ) : null}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
