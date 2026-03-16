const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const db = require('../db/database')

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token provided' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

router.get('/', auth, (req, res) => {
  const jobs = db.prepare('SELECT * FROM jobs WHERE user_id = ? ORDER BY created_at DESC').all(req.userId)
  res.json(jobs)
})

router.post('/', auth, (req, res) => {
  const { company, position, status, notes, applied_date } = req.body
  if (!company || !position) {
    return res.status(400).json({ error: 'Company and position are required' })
  }
  const result = db.prepare(
    'INSERT INTO jobs (user_id, company, position, status, notes, applied_date) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.userId, company, position, status || 'applied', notes || '', applied_date || '')
  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(job)
})

router.put('/:id', auth, (req, res) => {
  const { company, position, status, notes, applied_date } = req.body
  const job = db.prepare('SELECT * FROM jobs WHERE id = ? AND user_id = ?').get(req.params.id, req.userId)
  if (!job) return res.status(404).json({ error: 'Job not found' })
  db.prepare(
    'UPDATE jobs SET company=?, position=?, status=?, notes=?, applied_date=? WHERE id=?'
  ).run(company, position, status, notes, applied_date, req.params.id)
  const updated = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id)
  res.json(updated)
})

router.delete('/:id', auth, (req, res) => {
  const job = db.prepare('SELECT * FROM jobs WHERE id = ? AND user_id = ?').get(req.params.id, req.userId)
  if (!job) return res.status(404).json({ error: 'Job not found' })
  db.prepare('DELETE FROM jobs WHERE id = ?').run(req.params.id)
  res.json({ message: 'Job deleted' })
})

module.exports = router