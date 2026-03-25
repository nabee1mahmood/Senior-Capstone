import 'dotenv/config'

import express from 'express'
import axios from 'axios'
import cors from 'cors'



const app = express()
const PORT = process.env.PORT || 8080

console.log(app)

app.listen(8080, () => {
      console.log('server listening on port 8080')
})



// Allow your React app (running on a different port) to call this API

app.use(cors())
app.use(express.json())

// --- Example routes (you can replace these with real DB logic later) ---

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' })
})

// Example: list sensors (mock data for now)
app.get('/api/sensors', (req, res) => {
  res.json({
    sensors: [
      { id: 1, name: 'Living room', type: 'temperature', value: 72 },
      { id: 2, name: 'Front door', type: 'motion', value: 0 },
    ],
  })
})

// Login (mock – always succeeds for now; TODO: validate against database)
app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' })
  }
  res.json({
    success: true,
    message: 'Logged in',
    user: { email },
  })
})

// Create account (mock – always succeeds for now; TODO: save to database)
app.post('/api/register', (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' })
  }
  if (password.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' })
  }
  res.status(201).json({
    success: true,
    message: 'Account created',
    user: { email },
  })
})

// 404: return JSON so the client never gets HTML or invalid body
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not found' })
})

// --- Start server ---

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API running at http://localhost:${PORT}`)
  console.log(`  Health:  http://localhost:${PORT}/api/health`)
  console.log(`  Sensors: http://localhost:${PORT}/api/sensors`)
})
