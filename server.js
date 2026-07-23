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

app.post('/projects', (req, res) => {
  const { title, description } = req.body

  const newProject = {
    id: projects.length + 1,
    title,
    description,
  }

  projects.push(newProject)
  res.status(201).json(newProject)
})

app.put('/projects/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const project = projects.find((p) => p.id === id)

  if (!project) {
    return res.status(404).json({ error: 'Project not found' })
  }

  project.title = req.body.title || project.title
  project.description = req.body.description || project.description

  res.json(project)
})

app.delete('/projects/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const index = projects.findIndex((p) => p.id === id)

  if (index === -1) {
    return res.status(404).json({ error: 'Project not found' })
  }

  projects.splice(index, 1)
  res.json({ success: true, message: 'Project deleted' })
})

app.listen(3000, () => {
  console.log('Ο server τρέχει στο http://localhost:3000')
})