const findUnsents = async tag => {
  const cache = await caches.open('unsent')
  const reqs = (await cache.keys()).filter(req => req.headers.get('x-tag') === tag)
  const unsents = []
  for (const req of reqs) {
    const res = await cache.match(req)
    unsents.push({
      key: req.url,
      pathname: req.headers.get('x-pathname'),
      method: req.headers.get('x-method'),
      body: (await res.json()).body
    })
  }
  return unsents
}

const deleteUnsents = async urls => {
  const cache = await caches.open('unsent')
  for (const url of urls) await cache.delete(url)
}
