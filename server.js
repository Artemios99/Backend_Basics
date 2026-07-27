const express = require('express')
const mysql = require('mysql2')
const app = express()
app.use(express.json())

const db = mysql.createConnection({
  host: '127.0.0.1',
  port: 3307,
  user: 'root',
  password: '',
  database: 'portfolio_db',
})

db.connect((err) => {
  if (err) {
    console.error('Σφάλμα σύνδεσης:', err)
    return
  }
  console.log('Συνδέθηκε επιτυχώς στη MySQL!')
})

// 1. Πρώτα, ΟΛΑ τα routes
app.get('/', (req, res) => {
  res.send('Γεια σου από τον Express server!')
})

app.get('/about', (req, res) => {
  res.send('Είμαι φοιτητής στο CEID.')
})

app.get('/projects', (req, res) => {
  db.query('SELECT * FROM projects', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    res.json(results)
  })
})

app.get('/projects/:id', (req, res) => {
  const id = req.params.id

  db.query('SELECT * FROM projects WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }
    res.json(results[0])
  })
})

app.post('/contact', (req, res) => {
  const { name, message } = req.body
  console.log(`Νέο μήνυμα από ${name}: ${message}`)
  res.json({ success: true, message: 'Το μήνυμά σου παραλήφθηκε!' })
})

app.post('/projects', (req, res) => {
  const { title, description } = req.body

  db.query(
    'INSERT INTO projects (title, description) VALUES (?, ?)',
    [title, description],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message })
      }
      res.status(201).json({ id: result.insertId, title, description })
    }
  )
})

app.put('/projects/:id', (req, res) => {
  const id = req.params.id
  const { title, description } = req.body

  db.query(
    'UPDATE projects SET title = ?, description = ? WHERE id = ?',
    [title, description, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message })
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Project not found' })
      }
      res.json({ id, title, description })
    }
  )
})

app.delete('/projects/:id', (req, res) => {
  const id = req.params.id

  db.query('DELETE FROM projects WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }
    res.json({ success: true, message: 'Project deleted' })
  })
})

app.get('/projects/:id/comments', (req, res) => {
  const id = req.params.id

  db.query(
    'SELECT comments.id, comments.text FROM comments WHERE comments.project_id = ?',
    [id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message })
      }
      res.json(results)
    }
  )
})

app.listen(3000, () => {
  console.log('Ο server τρέχει στο http://localhost:3000')
})