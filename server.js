const express = require('express')
const app = express()
app.use(express.json())

const projects = [
  { id: 1, title: 'Unibite', description: 'Website για διαμοιρασμό φαγητού' },
  { id: 2, title: 'Patras Limani', description: 'Application για καλύτερη εξυπηρέτηση λιμανιού' },
]

// 1. Πρώτα, ΟΛΑ τα routes
app.get('/', (req, res) => {
  res.send('Γεια σου από τον Express server!')
})

app.get('/about', (req, res) => {
  res.send('Είμαι φοιτητής στο CEID.')
})

app.get('/projects', (req, res) => {
  res.json(projects)
})

app.get('/projects/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const project = projects.find((p) => p.id === id)

  if (!project) {
    return res.status(404).json({ error: 'Project not found' })
  }

  res.json(project)
})

app.post('/contact', (req, res) => {
  const { name, message } = req.body
  console.log(`Νέο μήνυμα από ${name}: ${message}`)
  res.json({ success: true, message: 'Το μήνυμά σου παραλήφθηκε!' })
})

// 2. ΜΕΤΑ, ξεκίνα τον server
app.listen(3000, () => {
  console.log('Ο server τρέχει στο http://localhost:3000')
})