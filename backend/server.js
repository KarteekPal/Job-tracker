const express = require('express')
const dotenv = require('dotenv')

dotenv.config()

const app = express()

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

app.use(express.json())

const db = require('./db/database')
const authRoutes = require('./routes/auth')
const jobRoutes = require('./routes/jobs')

app.use('/api/auth', authRoutes)
app.use('/api/jobs', jobRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'Job Tracker API is running' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})