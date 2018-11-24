import polka from 'polka'
import {json} from 'body-parser'
import serveStatic from 'serve-static'
import path from 'path'

const {PWD, PORT} = process.env

const app = polka()
app.use(json())
app.use(serveStatic(path.resolve(PWD)))
app.use(serveStatic(path.resolve(PWD, 'static')))

app.post('/api/tweet', (req, res) => {
  console.log(Object.keys(req))
  const result = JSON.stringify({})
  res.end(result)
})

app.listen(PORT, _ => {
  console.log(`> Running on http://localhost:${PORT}`)
})
