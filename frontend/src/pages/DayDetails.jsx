import { useParams, Link, useNavigate } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { fetchDeviceReadings } from "../api"
import "./Home.css"
import "./DayDetails.css"

const CHART_WIDTH = 860
const CHART_HEIGHT = 240
const CHART_PADDING = 16

function formatValue(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—"
  const rounded = Math.round(value * 100) / 100
  return String(+rounded)
}

function formatTimestamp(iso) {
  if (!iso) return "—"
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString()
}

function buildPolylinePoints(readings, width, height, padding) {
  if (!readings.length) return ""
  const values = readings.map((r) => r.value).filter((v) => typeof v === "number")
  if (!values.length) return ""
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const usableW = width - padding * 2
  const usableH = height - padding * 2

  return readings
    .map((r, idx) => {
      const x = padding + (idx / Math.max(readings.length - 1, 1)) * usableW
      const y = padding + (1 - (r.value - min) / range) * usableH
      return `${x},${y}`
    })
    .join(" ")
}

function DayDetails({ darkMode, setDarkMode }) {
  const { day: deviceIdParam } = useParams()
  const navigate = useNavigate()
  const [device, setDevice] = useState(null)
  const [stats, setStats] = useState({ min: null, max: null, avg: null, count: 0 })
  const [readings, setReadings] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const deviceId = Number.parseInt(deviceIdParam, 10)

  useEffect(() => {
    const raw = localStorage.getItem("homesense_user")
    if (!raw) {
      navigate("/", { replace: true })
      return
    }
    let userId = null
    try {
      const parsed = JSON.parse(raw)
      userId = parsed?.id
    } catch {
      navigate("/", { replace: true })
      return
    }
    if (!userId || !Number.isFinite(deviceId)) {
      navigate("/home", { replace: true })
      return
    }

    let mounted = true
    const load = async () => {
      setLoading(true)
      setError("")
      try {
        const data = await fetchDeviceReadings(userId, deviceId, 60)
        if (!mounted) return
        setDevice(data.device || null)
        setStats(data.stats || { min: null, max: null, avg: null, count: 0 })
        setReadings(data.readings || [])
        setAlerts(data.alerts || [])
      } catch (err) {
        if (!mounted) return
        setError(err.message || "Could not load device details")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    const intervalId = window.setInterval(load, 10000)
    return () => {
      mounted = false
      window.clearInterval(intervalId)
    }
  }, [deviceId, navigate])

  const chartPoints = useMemo(
    () => buildPolylinePoints(readings, CHART_WIDTH, CHART_HEIGHT, CHART_PADDING),
    [readings]
  )

  return (
    <div className={`dashboard gf-dashboard ${darkMode ? "dark" : "light"}`}>
      <header className="dashboard-header d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h1 className="h4 mb-0 font-weight-bold gf-dashboard-title">
          {device?.label || "Device"} details
        </h1>
        <div className="d-flex gap-2 align-items-center">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <Link to="/home" className="btn btn-outline-secondary btn-sm">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      {error && (
        <div className="alert alert-danger small py-2" role="alert">
          {error}
        </div>
      )}

      {loading && !error && <p className="text-muted small mb-3">Loading device details…</p>}

      {!loading && !error && (
        <div className="day-details px-0">
          {device?.alert ? (
            <div
              className={`alert mb-3 ${device.alert.level === "critical" ? "alert-danger" : "alert-warning"}`}
              role="alert"
            >
              <strong>Alert:</strong> {device.alert.message}
            </div>
          ) : null}
          <p className="dd-subtitle text-muted mb-3">
            Detailed sensor history with a graph-ready view (similar to Grafana drill-down).
          </p>

          <div className="row g-3 mb-3">
            <div className="col-6 col-md-3">
              <div className="card h-100">
                <div className="card-body py-3">
                  <div className="small text-muted">Latest</div>
                  <div className="h5 mb-0">
                    {formatValue(device?.latest_value)} {device?.unit || ""}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card h-100">
                <div className="card-body py-3">
                  <div className="small text-muted">Min</div>
                  <div className="h5 mb-0">
                    {formatValue(stats.min)} {device?.unit || ""}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card h-100">
                <div className="card-body py-3">
                  <div className="small text-muted">Avg</div>
                  <div className="h5 mb-0">
                    {formatValue(stats.avg)} {device?.unit || ""}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card h-100">
                <div className="card-body py-3">
                  <div className="small text-muted">Max</div>
                  <div className="h5 mb-0">
                    {formatValue(stats.max)} {device?.unit || ""}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-header">Recent trend</div>
            <div className="card-body">
              {readings.length === 0 ? (
                <p className="text-muted small mb-0">No readings yet.</p>
              ) : (
                <>
                  <p className="text-muted small mb-2">
                    Trend from the latest readings.
                  </p>
                  <svg
                    viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                    className="dd-chart"
                    role="img"
                    aria-label="Device reading trend"
                  >
                    <polyline points={chartPoints} fill="none" stroke="#0d6efd" strokeWidth="3" />
                  </svg>
                  <div className="dd-point-card mt-3">
                    <div className="small text-muted">Latest sample</div>
                    <div className="h6 mb-1">
                      {formatValue(device?.latest_value)} {device?.unit || ""}
                    </div>
                    <div className="small text-muted">
                      {device?.sensor_type || "sensor"} at {formatTimestamp(device?.latest_recorded_at)}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-striped table-hover dd-table mt-3">
              <thead>
                <tr>
                  <th>Device</th>
                  <th>Sensor type</th>
                  <th>Value</th>
                  <th>Unit</th>
                  <th>Recorded at</th>
                </tr>
              </thead>
              <tbody>
                {readings
                  .slice()
                  .reverse()
                  .map((reading, idx) => (
                    <tr key={`${reading.recorded_at}-${idx}`}>
                      <td>{device?.label || "—"}</td>
                      <td>{reading.sensor_type || "—"}</td>
                      <td>{formatValue(reading.value)}</td>
                      <td>{reading.unit || "—"}</td>
                      <td>{formatTimestamp(reading.recorded_at)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="card mt-3">
            <div className="card-header">Alert history for this device</div>
            <div className="card-body">
              {alerts.length === 0 ? (
                <p className="text-muted small mb-0">No alerts for this device yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Level</th>
                        <th>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alerts.map((alert, idx) => (
                        <tr key={`${alert.recorded_at}-${idx}`}>
                          <td>{formatTimestamp(alert.recorded_at)}</td>
                          <td className={alert.level === "critical" ? "text-danger fw-semibold" : "text-warning fw-semibold"}>
                            {alert.level}
                          </td>
                          <td>{alert.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DayDetails
