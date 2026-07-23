const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.send('Γεια σου από τον Express server!')
})

app.listen(3000, () => {
  console.log('Ο server τρέχει στο http://localhost:3000')
})

app.get('/about', (req, res) => {
  res.send('Είμαι φοιτητής στο CEID.')
})

app.get('/projects', (req, res) => {
  res.json([
    { title: 'Unibite', description: 'Website για διαμοιρασμό φαγητού' },
    { title: 'Patras Limani', description: 'Application για καλύτερη εξυπηρέτηση λιμανιού' },
  ])
})