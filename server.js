require('dotenv').config()
const express = require('express')
const mysql = require('mysql2')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cors = require('cors')


const app = express()
app.use(cors())
app.use(express.json())

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

const JWT_SECRET = process.env.JWT_SECRET

db.connect((err) => {
  if (err) {
    console.error('Σφάλμα σύνδεσης:', err)
    return
  }
  console.log('Συνδέθηκε επιτυχώς στη MySQL!')
})

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

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message })
        }
        res.status(201).json({ id: result.insertId, username, email })
      }
    )
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/login', async (req, res) => {
  const { email, password } = req.body

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Λάθος email ή password' })
    }

    const user = results[0]
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Λάθος email ή password' })
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' })

    res.json({ success: true, token, username: user.username })
  })
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

app.post('/upload', upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Δεν στάλθηκε αρχείο' })
  }
  res.json({
    message: 'Το αρχείο ανέβηκε επιτυχώς!',
    filename: req.file.filename,
  })
})

app.listen(3000, () => {
  console.log('Ο server τρέχει στο http://localhost:3000')
})