
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import bcrypt from "bcryptjs"
import { pool, query } from "./db.js"
import {
  provisionDefaultDevices,
  userHasDevices
} from "./provisionDevices.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8080

app.use(cors())
app.use(express.json())

/** Latest reading per device id (in-memory until you persist synthetic data). */
const liveReadingByDeviceId = new Map()
/** Recent reading history per device id for graph/detail page. */
const readingHistoryByDeviceId = new Map()
/** Alert history by user id for dashboard timeline. */
const alertHistoryByUserId = new Map()
const MAX_HISTORY_POINTS = 120
const MAX_ALERT_HISTORY = 200

const defaultReadingByUid = {
  "dev-attic-01": { value: 58.2, sensor_type: "humidity", unit: "% RH" },
  "dev-basement-01": { value: 41, sensor_type: "moisture", unit: "%" },
  "dev-kitchen-01": { value: 1204, sensor_type: "power", unit: "W" }
}

function unitFromSensorType(sensorType, explicitUnit) {
  if (explicitUnit) return explicitUnit
  const t = (sensorType || "").toLowerCase()
  const map = {
    humidity: "% RH",
    moisture: "%",
    temperature: "°C",
    power: "W",
    power_w: "W",
    flow: "L/min",
    liters: "L",
    custom: ""
  }
  return map[t] || ""
}

function uidLabel(deviceUid) {
  return deviceUid.replaceAll("-", " ")
}

/** Map `12-dev-attic-01` → defaults keyed by `dev-attic-01` (legacy uids still work). */
function defaultReadingForDeviceUid(deviceUid) {
  if (defaultReadingByUid[deviceUid]) {
    return defaultReadingByUid[deviceUid]
  }
  const m = deviceUid.match(/^\d+-(.+)$/)
  const suffix = m ? m[1] : deviceUid
  return (
    defaultReadingByUid[suffix] || {
      value: null,
      sensor_type: null,
      unit: ""
    }
  )
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function evaluateAlert(sensorType, value, unit) {
  const type = (sensorType || "").toLowerCase()
  if (typeof value !== "number" || Number.isNaN(value)) return null

  if (type === "temperature") {
    const isF = String(unit || "").toLowerCase().includes("f")
    const threshold = isF ? 86 : 30
    if (value >= threshold) {
      return {
        kind: "threshold",
        level: "warning",
        message: `Temperature threshold reached (${value}${isF ? "°F" : "°C"} >= ${threshold}${isF ? "°F" : "°C"})`
      }
    }
  }

  if (type === "vibration" && value >= 1) {
    return {
      kind: "event",
      level: "critical",
      message: "Vibration detected"
    }
  }

  return null
}

function pushHistory(deviceId, reading) {
  const history = readingHistoryByDeviceId.get(deviceId) || []
  history.push(reading)
  if (history.length > MAX_HISTORY_POINTS) {
    history.splice(0, history.length - MAX_HISTORY_POINTS)
  }
  readingHistoryByDeviceId.set(deviceId, history)
}

function pushAlert(userId, alertEvent) {
  const history = alertHistoryByUserId.get(userId) || []
  const previous = history[history.length - 1]
  // Avoid flooding duplicates for the same device + same alert message.
  if (
    previous &&
    previous.device_id === alertEvent.device_id &&
    previous.message === alertEvent.message
  ) {
    return
  }
  history.push(alertEvent)
  if (history.length > MAX_ALERT_HISTORY) {
    history.splice(0, history.length - MAX_ALERT_HISTORY)
  }
  alertHistoryByUserId.set(userId, history)
}

function maybeSeedHistory(deviceId, deviceUid) {
  const existing = readingHistoryByDeviceId.get(deviceId)
  if (existing && existing.length > 0) return

  const fallback = defaultReadingForDeviceUid(deviceUid)
  if (!fallback || typeof fallback.value !== "number") return

  const now = Date.now()
  const seeded = []
  for (let i = 29; i >= 0; i -= 1) {
    const jitterPct = (Math.random() - 0.5) * 0.12
    const value = Number.parseFloat((fallback.value * (1 + jitterPct)).toFixed(2))
    seeded.push({
      value: clamp(value, 0, Number.MAX_SAFE_INTEGER),
      sensor_type: fallback.sensor_type,
      unit: unitFromSensorType(fallback.sensor_type, fallback.unit),
      recorded_at: new Date(now - i * 2 * 60 * 1000).toISOString()
    })
  }
  readingHistoryByDeviceId.set(deviceId, seeded)
}

app.get("/api/health", async (req, res) => {
  if (!pool) {
    return res.json({ status: "ok", db: false })
  }
  try {
    await query("SELECT 1")
    return res.json({ status: "ok", db: true })
  } catch (err) {
    console.error(err)
    return res.status(503).json({ status: "degraded", db: false })
  }
})

app.get("/api/sensors", (req, res) => {
  res.json({
    sensors: [
      { id: 1, name: "Living room", type: "temperature", value: 72 },
      { id: 2, name: "Front door", type: "motion", value: 0 }
    ]
  })
})

app.post("/api/register", async (req, res) => {
  const { email, password, display_name: displayNameRaw } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ message: "Missing fields" })
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password too short" })
  }

  if (!pool) {
    return res.status(500).json({ message: "Database not configured" })
  }

  const displayName =
    displayNameRaw === undefined || displayNameRaw === null
      ? null
      : String(displayNameRaw).trim() || null

  try {
    const hash = await bcrypt.hash(password, 10)
    const { rows } = await query(
      `INSERT INTO users (email, password, display_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, display_name`,
      [email.trim().toLowerCase(), hash, displayName]
    )
    const newUser = rows[0]
    await provisionDefaultDevices(query, newUser.id)
    return res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        display_name: newUser.display_name
      }
    })
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Email already registered" })
    }
    console.error(err)
    return res.status(500).json({ message: "Registration failed" })
  }
})

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ message: "Missing fields" })
  }

  if (!pool) {
    return res.status(500).json({ message: "Database not configured" })
  }

  try {
    const { rows } = await query(
      "SELECT id, email, password, display_name FROM users WHERE lower(email) = lower($1)",
      [email.trim()]
    )

    if (rows.length === 0) {
      return res.status(401).json({
        message: "This account doesn't exist. Try creating one or check your email."
      })
    }

    const user = rows[0]
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [user.id]).catch(
      () => {}
    )

    const hasDevices = await userHasDevices(query, user.id)
    if (!hasDevices) {
      await provisionDefaultDevices(query, user.id)
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name
      }
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Login failed" })
  }
})

app.get("/api/users/:userId/profile", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ message: "Database not configured" })
  }

  const userId = Number.parseInt(req.params.userId, 10)
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ message: "Invalid user id" })
  }

  try {
    const { rows } = await query(
      `SELECT id, email, display_name, first_name, last_name, phone, last_login_at
       FROM users WHERE id = $1`,
      [userId]
    )
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }
    return res.json({ profile: rows[0] })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Could not load profile" })
  }
})

app.patch("/api/users/:userId/profile", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ message: "Database not configured" })
  }

  const userId = Number.parseInt(req.params.userId, 10)
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ message: "Invalid user id" })
  }

  const { display_name: displayNameRaw, email, phone } = req.body || {}
  const newEmail = typeof email === "string" ? email.trim().toLowerCase() : ""
  if (!newEmail || !newEmail.includes("@")) {
    return res.status(400).json({ message: "A valid email address is required" })
  }

  const displayName =
    displayNameRaw === undefined || displayNameRaw === null
      ? null
      : String(displayNameRaw).trim() || null
  const ph =
    phone === undefined || phone === null ? null : String(phone).trim() || null

  try {
    const taken = await query(
      `SELECT id FROM users WHERE lower(email) = lower($1) AND id <> $2`,
      [newEmail, userId]
    )
    if (taken.rows.length > 0) {
      return res.status(409).json({ message: "That email is already in use" })
    }

    const { rows } = await query(
      `UPDATE users
       SET email = $1, display_name = $2, phone = $3
       WHERE id = $4
       RETURNING id, email, display_name, first_name, last_name, phone, last_login_at`,
      [newEmail, displayName, ph, userId]
    )
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }
    return res.json({ success: true, profile: rows[0] })
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "That email is already in use" })
    }
    console.error(err)
    return res.status(500).json({ message: "Could not update profile" })
  }
})

app.patch("/api/users/:userId/password", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ message: "Database not configured" })
  }

  const userId = Number.parseInt(req.params.userId, 10)
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ message: "Invalid user id" })
  }

  const { current_password: currentPassword, new_password: newPassword } =
    req.body || {}
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current and new passwords are required" })
  }
  if (String(newPassword).length < 8) {
    return res.status(400).json({ message: "New password must be at least 8 characters" })
  }

  try {
    const { rows } = await query("SELECT password FROM users WHERE id = $1", [userId])
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }
    const ok = await bcrypt.compare(currentPassword, rows[0].password)
    if (!ok) {
      return res.status(401).json({ message: "Current password is incorrect" })
    }
    const hash = await bcrypt.hash(String(newPassword), 10)
    await query("UPDATE users SET password = $1 WHERE id = $2", [hash, userId])
    return res.json({ success: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Could not update password" })
  }
})

app.delete("/api/users/:userId", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ message: "Database not configured" })
  }

  const userId = Number.parseInt(req.params.userId, 10)
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ message: "Invalid user id" })
  }

  const { password } = req.body || {}
  if (!password) {
    return res.status(400).json({ message: "Password is required to delete your account" })
  }

  try {
    const { rows } = await query("SELECT password FROM users WHERE id = $1", [userId])
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }
    const ok = await bcrypt.compare(String(password), rows[0].password)
    if (!ok) {
      return res.status(401).json({ message: "Invalid password" })
    }
    await query("DELETE FROM users WHERE id = $1", [userId])
    return res.json({ success: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Could not delete account" })
  }
})

app.get("/api/users/:userId/devices", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ message: "Database not configured" })
  }

  const userId = Number.parseInt(req.params.userId, 10)
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ message: "Invalid user id" })
  }

  try {
    const { rows } = await query(
      `SELECT id, user_id, name, device_uid, created_at
       FROM devices WHERE user_id = $1 ORDER BY id`,
      [userId]
    )
    return res.json({ devices: rows })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Could not load devices" })
  }
})

/**
 * Devices for this user with a single raw reading each (live in-memory or seeded default).
 */
app.get("/api/users/:userId/devices/overview", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ message: "Database not configured" })
  }

  const userId = Number.parseInt(req.params.userId, 10)
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ message: "Invalid user id" })
  }

  try {
    const { rows } = await query(
      `SELECT id, device_uid FROM devices WHERE user_id = $1 ORDER BY id`,
      [userId]
    )

    const devices = rows.map((row) => {
      const live = liveReadingByDeviceId.get(row.id)
      const fallback = defaultReadingForDeviceUid(row.device_uid)
      const source = live || fallback
      const unit = unitFromSensorType(source.sensor_type, source.unit)
      const alert = evaluateAlert(source.sensor_type, source.value, unit)
      return {
        id: row.id,
        device_uid: row.device_uid,
        label: uidLabel(row.device_uid),
        reading: source.value,
        sensor_type: source.sensor_type,
        unit,
        recorded_at: source.recorded_at || null,
        alert
      }
    })

    return res.json({ devices })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Could not load device overview" })
  }
})

/**
 * Alert history for this user (most recent first).
 */
app.get("/api/users/:userId/alerts", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ message: "Database not configured" })
  }

  const userId = Number.parseInt(req.params.userId, 10)
  const limitRaw = Number.parseInt(req.query.limit, 10)
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 25
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ message: "Invalid user id" })
  }

  try {
    const alerts = (alertHistoryByUserId.get(userId) || []).slice(-limit).reverse()
    return res.json({ alerts })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Could not load alert history" })
  }
})

/**
 * Push a synthetic reading (HTTP). Same payload can later be sent from MQTT → shared handler.
 */
app.post("/api/readings", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ message: "Database not configured" })
  }

  const {
    device_uid: deviceUid,
    value,
    sensor_type: sensorType,
    unit: unitOverride
  } = req.body || {}
  if (!deviceUid || typeof value !== "number" || Number.isNaN(value)) {
    return res.status(400).json({ message: "device_uid and numeric value are required" })
  }

  try {
    const { rows } = await query(
      "SELECT id, user_id FROM devices WHERE device_uid = $1 LIMIT 1",
      [deviceUid]
    )
    if (rows.length === 0) {
      return res.status(404).json({ message: "Unknown device_uid" })
    }

    const deviceId = rows[0].id
    const userId = rows[0].user_id
    const st = sensorType || "custom"
    const resolvedUnit =
      typeof unitOverride === "string" ? unitOverride : unitFromSensorType(st, "")
    const recordedAt = new Date().toISOString()
    liveReadingByDeviceId.set(deviceId, {
      value,
      sensor_type: st,
      unit: resolvedUnit,
      recorded_at: recordedAt
    })
    pushHistory(deviceId, {
      value,
      sensor_type: st,
      unit: resolvedUnit,
      recorded_at: recordedAt
    })
    const alert = evaluateAlert(st, value, resolvedUnit)
    if (alert) {
      pushAlert(userId, {
        device_id: deviceId,
        device_uid: deviceUid,
        label: uidLabel(deviceUid),
        sensor_type: st,
        value,
        unit: resolvedUnit,
        level: alert.level,
        kind: alert.kind,
        message: alert.message,
        recorded_at: recordedAt
      })
    }

    return res.json({ ok: true, device_id: deviceId, alert })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Could not record reading" })
  }
})

/**
 * Detailed device readings for charts/table drill-down.
 */
app.get("/api/users/:userId/devices/:deviceId/readings", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ message: "Database not configured" })
  }

  const userId = Number.parseInt(req.params.userId, 10)
  const deviceId = Number.parseInt(req.params.deviceId, 10)
  const limitRaw = Number.parseInt(req.query.limit, 10)
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 10), MAX_HISTORY_POINTS) : 60
  if (!Number.isFinite(userId) || !Number.isFinite(deviceId)) {
    return res.status(400).json({ message: "Invalid user id or device id" })
  }

  try {
    const { rows } = await query(
      `SELECT id, name, device_uid
       FROM devices
       WHERE id = $1 AND user_id = $2
       LIMIT 1`,
      [deviceId, userId]
    )
    if (rows.length === 0) {
      return res.status(404).json({ message: "Device not found for user" })
    }

    const device = rows[0]
    maybeSeedHistory(device.id, device.device_uid)

    const allHistory = readingHistoryByDeviceId.get(device.id) || []
    const readings = allHistory.slice(-limit)
    const values = readings.map((r) => r.value).filter((v) => typeof v === "number")
    const latest = readings[readings.length - 1] || null
    const latestUnit = latest?.unit || unitFromSensorType(latest?.sensor_type, "") || ""
    const alert = latest
      ? evaluateAlert(latest.sensor_type, latest.value, latestUnit)
      : null
    const recentAlerts = (alertHistoryByUserId.get(userId) || [])
      .filter((entry) => entry.device_id === device.id)
      .slice(-10)
      .reverse()

    const stats =
      values.length > 0
        ? {
            min: Number.parseFloat(Math.min(...values).toFixed(2)),
            max: Number.parseFloat(Math.max(...values).toFixed(2)),
            avg: Number.parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)),
            count: values.length
          }
        : { min: null, max: null, avg: null, count: 0 }

    return res.json({
      device: {
        id: device.id,
        name: device.name,
        device_uid: device.device_uid,
        label: uidLabel(device.device_uid),
        sensor_type: latest?.sensor_type || null,
        unit: latestUnit,
        latest_value: latest?.value ?? null,
        latest_recorded_at: latest?.recorded_at || null,
        alert
      },
      stats,
      readings,
      alerts: recentAlerts
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Could not load device readings" })
  }
})

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Not found" })
})


app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on http://localhost:${PORT}`)
})
