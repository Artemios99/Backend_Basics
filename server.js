require('dotenv').config()
const express = require('express')
const { Pool } = require('pg')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

pool.connect((err) => {
  if (err) {
    console.error('Σφάλμα σύνδεσης:', err)
    return
  }
  console.log('Συνδέθηκε επιτυχώς στη PostgreSQL!')
})

const JWT_SECRET = process.env.JWT_SECRET

const multer = require('multer')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  },
})

const upload = multer({ storage: storage })

// 1. Πρώτα, ΟΛΑ τα routes
app.get('/', (req, res) => {
  res.send('Γεια σου από τον Express server!')
})

app.get('/about', (req, res) => {
  res.send('Είμαι φοιτητής στο CEID.')
})

app.get('/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/projects/:id', async (req, res) => {
  const id = req.params.id
  try {
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/contact', (req, res) => {
  const { name, message } = req.body
  console.log(`Νέο μήνυμα από ${name}: ${message}`)
  res.json({ success: true, message: 'Το μήνυμά σου παραλήφθηκε!' })
})

/*
app.post('/projects', async (req, res) => {
  const { title, description } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO projects (title, description) VALUES ($1, $2) RETURNING id',
      [title, description]
    )
    res.status(201).json({ id: result.rows[0].id, title, description })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/projects/:id', async (req, res) => {
  const id = req.params.id
  const { title, description } = req.body
  try {
    const result = await pool.query(
      'UPDATE projects SET title = $1, description = $2 WHERE id = $3',
      [title, description, id]
    )
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }
    res.json({ id, title, description })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/projects/:id', async (req, res) => {
  const id = req.params.id
  try {
    const result = await pool.query('DELETE FROM projects WHERE id = $1', [id])
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }
    res.json({ success: true, message: 'Project deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
*/

app.get('/projects/:id/comments', async (req, res) => {
  const id = req.params.id
  try {
    const result = await pool.query(
      'SELECT comments.id, comments.text FROM comments WHERE comments.project_id = $1',
      [id]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/*
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
      [username, email, hashedPassword]
    )
    res.status(201).json({ id: result.rows[0].id, username, email })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Λάθος email ή password' })
    }

    const user = result.rows[0]
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Λάθος email ή password' })
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' })

    res.json({ success: true, token, username: user.username })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Δεν βρέθηκε token' })
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Μη έγκυρο token' })
    }
    req.userId = decoded.userId
    next()
  })
}

app.get('/dashboard', verifyToken, (req, res) => {
  res.json({ message: `Καλωσόρισες, χρήστη με id ${req.userId}!` })
})
*/

app.post('/upload', upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Δεν στάλθηκε αρχείο' })
  }
  res.json({
    message: 'Το αρχείο ανέβηκε επιτυχώς!',
    filename: req.file.filename,
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Ο server τρέχει στο port ${PORT}`)
})