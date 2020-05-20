const express = require('express')

const app = express()
// static file serve
app.use(express.static(`${__dirname}/dist`))
// not found in static files, so default to index.html
app.use((req, res) => res.sendFile(`${__dirname}/dist/index.html`))

const port = process.env.PORT || 5000
app.listen(port)

console.log('\n=====================================')
console.log('Server started in port: ', port)
console.log(`Local Server: http://localhost:${port}`)
console.log('=====================================')