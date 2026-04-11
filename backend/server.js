
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import bcrypt from "bcryptjs"
import { pool, query } from "./db.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8080

app.use(cors())
app.use(express.json())

/** Latest reading per device id (in-memory until you persist synthetic data). */
const liveReadingByDeviceId = new Map()

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
  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ message: "Missing fields" })
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password too short" })
  }

  if (!pool) {
    return res.status(500).json({ message: "Database not configured" })
  }

  try {
    const hash = await bcrypt.hash(password, 10)
    const { rows } = await query(
      `INSERT INTO users (email, password)
       VALUES ($1, $2)
       RETURNING id, email`,
      [email.trim().toLowerCase(), hash]
    )
    return res.status(201).json({
      success: true,
      user: { id: rows[0].id, email: rows[0].email }
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
      "SELECT id, email, password FROM users WHERE lower(email) = lower($1)",
      [email.trim()]
    )

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    const user = rows[0]
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [user.id]).catch(
      () => {}
    )

    return res.json({
      success: true,
      user: { id: user.id, email: user.email }
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
      `SELECT id, email, first_name, last_name, phone, last_login_at
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

  const { first_name: firstName, last_name: lastName, email, phone } = req.body || {}
  const newEmail = typeof email === "string" ? email.trim().toLowerCase() : ""
  if (!newEmail || !newEmail.includes("@")) {
    return res.status(400).json({ message: "A valid email address is required" })
  }

  const fn =
    firstName === undefined || firstName === null
      ? null
      : String(firstName).trim() || null
  const ln =
    lastName === undefined || lastName === null ? null : String(lastName).trim() || null
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
       SET email = $1, first_name = $2, last_name = $3, phone = $4
       WHERE id = $5
       RETURNING id, email, first_name, last_name, phone, last_login_at`,
      [newEmail, fn, ln, ph, userId]
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
      const fallback = defaultReadingByUid[row.device_uid] || {
        value: null,
        sensor_type: null,
        unit: ""
      }
      const source = live || fallback
      const unit = unitFromSensorType(source.sensor_type, source.unit)
      return {
        id: row.id,
        device_uid: row.device_uid,
        label: uidLabel(row.device_uid),
        reading: source.value,
        sensor_type: source.sensor_type,
        unit
      }
    })

    return res.json({ devices })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Could not load device overview" })
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
      "SELECT id FROM devices WHERE device_uid = $1 LIMIT 1",
      [deviceUid]
    )
    if (rows.length === 0) {
      return res.status(404).json({ message: "Unknown device_uid" })
    }

    const deviceId = rows[0].id
    const st = sensorType || "custom"
    liveReadingByDeviceId.set(deviceId, {
      value,
      sensor_type: st,
      unit: typeof unitOverride === "string" ? unitOverride : unitFromSensorType(st, "")
    })

    return res.json({ ok: true, device_id: deviceId })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Could not record reading" })
  }
})

<<<<<<< HEAD
=======

// 404
>>>>>>> 429db40 (WIP: saving local changes)
app.use((req, res) => {
  res.status(404).json({ message: "Not found" })
})


app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on http://localhost:${PORT}`)
})
