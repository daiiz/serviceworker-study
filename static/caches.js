const NO_CORS_HOSTS = [
  'cdnjs.cloudflare.com'
]

const NOT_AUTO_UPDATE_HOSTS = []

const cacheResponse = async (key, url, res) => {
  const cache = await caches.open(key)
  await cache.put(url, res)
}

const fetchAndupdateCache = async (key, url) => {
  if (!navigator.onLine) return
  const {host} = new URL(url)
  const options = {}
  if (NO_CORS_HOSTS.includes(host)) options.mode = 'no-cors'
  const res = await fetch(url, options)

  if (!NOT_AUTO_UPDATE_HOSTS.includes(host)) {
    cacheResponse(key, url, res.clone())
  }
  return res
}

const respondCacheFirst = async (key, url) => {
  url = url.split('?').shift()
  const cache = await caches.open(key)
  const res = await cache.match(url)
  if (res) {
    fetchAndupdateCache(key, url)
    return res
  }

  console.log('fetch', url)
  const remoteRes = await fetchAndupdateCache(key, url)
  return remoteRes
}
