const API_BASE = (process.env.API_BASE_URL || "http://localhost:8080").replace(/\/$/, "")
const INTERVAL_MS = Number.parseInt(process.env.FAKE_INTERVAL_MS || "10000", 10)

const devices = [
  { device_uid: "dev-attic-01", sensor_type: "temperature", unit: "C", min: 22, max: 37 },
  { device_uid: "dev-basement-01", sensor_type: "moisture", unit: "%", min: 25, max: 60 },
  { device_uid: "dev-kitchen-01", sensor_type: "vibration", unit: "", min: 0, max: 1 }
]

const stateByDeviceUid = new Map()

function nextValue(device) {
  if (device.sensor_type === "vibration") {
    // Simulate occasional vibration events.
    return Math.random() < 0.18 ? 1 : 0
  }

  const span = device.max - device.min
  const baseline = device.min + span * 0.5
  const prev = stateByDeviceUid.get(device.device_uid) ?? baseline
  const drift = (Math.random() - 0.5) * span * 0.08
  const pullToCenter = (baseline - prev) * 0.1
  const noise = (Math.random() - 0.5) * span * 0.015
  const raw = prev + drift + pullToCenter + noise
  const clamped = Math.min(device.max, Math.max(device.min, raw))
  const rounded = Number.parseFloat(clamped.toFixed(1))
  stateByDeviceUid.set(device.device_uid, rounded)
  return rounded
}

async function postReading(device) {
  const payload = {
    device_uid: device.device_uid,
    sensor_type: device.sensor_type,
    unit: device.unit,
    value: nextValue(device)
  }

  const res = await fetch(`${API_BASE}/api/readings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })

  const text = await res.text()
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text || "unknown error"}`)
  }
  return { payload, responseText: text }
}

async function tick() {
  for (const device of devices) {
    try {
      const { payload, responseText } = await postReading(device)
      console.log("[fake-readings] ok", payload.device_uid, payload.value, responseText)
    } catch (err) {
      console.error("[fake-readings] failed", device.device_uid, err.message)
    }
  }
}

async function main() {
  console.log(`[fake-readings] posting to ${API_BASE}/api/readings every ${INTERVAL_MS}ms`)
  await tick()
  setInterval(tick, INTERVAL_MS)
}

main().catch((err) => {
  console.error("[fake-readings] fatal", err)
  process.exit(1)
})
