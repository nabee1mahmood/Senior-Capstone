
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import OpenAI from "openai"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8080

app.use(cors())
app.use(express.json())


// OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})



// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" })
})



// Sensors mock
app.get("/api/sensors", (req, res) => {
  res.json({
    sensors: [
      { id: 1, name: "Living room", type: "temperature", value: 72 },
      { id: 2, name: "Front door", type: "motion", value: 0 }
    ]
  })
})



// Register
app.post("/api/register", (req, res) => {
  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ message: "Missing fields" })
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password too short" })
  }

  res.status(201).json({
    success: true,
    user: { email }
  })
})



// Login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ message: "Missing fields" })
  }

  res.json({
    success: true,
    user: { email }
  })
})



// OpenAI route (example)
app.post("/api/ai", async (req, res) => {
  try {
    const { message } = req.body

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }]
    })

    res.json({
      reply: response.choices[0].message.content
    })

  } catch (err) {
    res.status(500).json({ error: "OpenAI request failed" })
  }
})

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Not found" })
})

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on http://localhost:${PORT}`)
})