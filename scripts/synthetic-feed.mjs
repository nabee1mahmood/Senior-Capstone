/**
 * Sends random readings to the local API every 2s (for dashboard demos).
 * Run from repo root (Node 18+): node scripts/synthetic-feed.mjs
 * Env: API_URL=http://localhost:3001 (default)
 */

const base = (process.env.API_URL || "http://localhost:3001").replace(/\/$/, "")

const feeds = [
  {
    device_uid: "dev-attic-01",
    sensor_type: "humidity",
    unit: "% RH",
    nextValue: () => 45 + Math.random() * 25
  },
  {
    device_uid: "dev-basement-01",
    sensor_type: "moisture",
    unit: "%",
    nextValue: () => 30 + Math.random() * 20
  },
  {
    device_uid: "dev-kitchen-01",
    sensor_type: "power",
    unit: "W",
    nextValue: () => 800 + Math.random() * 600
  }
]

async function postReading(entry) {
  const value = entry.nextValue()
  const res = await fetch(`${base}/api/readings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      device_uid: entry.device_uid,
      value,
      sensor_type: entry.sensor_type,
      unit: entry.unit
    })
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${entry.device_uid}: ${res.status} ${text}`)
  }
}

async function tick() {
  for (const f of feeds) {
    try {
      await postReading(f)
    } catch (e) {
      console.error(e.message || e)
    }
  }
}

console.log(`Synthetic feed → ${base}/api/readings (every 2s, Ctrl+C to stop)`)
await tick()
setInterval(tick, 2000)
