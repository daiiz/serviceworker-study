import polka from 'polka'
import serveStatic from 'serve-static'
import path from 'path'

const {PWD, PORT} = process.env

const app = polka()
app
  .use(serveStatic(path.resolve(PWD)))
  .use(serveStatic(path.resolve(PWD, 'static')))
  .listen(PORT, _ => {
    console.log(`> Running on http://localhost:${PORT}`)
  })
