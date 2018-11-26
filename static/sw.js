// ServiceWorkerGlobalScope
// https://w3c.github.io/ServiceWorker/#serviceworkerglobalscope-interface

// https://w3c.github.io/ServiceWorker/#service-worker-global-scope-install-event
self.addEventListener('install', extendableEvent => {
  const stall = async sec => {
    await delay(sec)
    console.log('oninstall')
    // https://w3c.github.io/ServiceWorker/#dom-serviceworkerglobalscope-skipwaiting
    // https://gyazo.com/6fb44e44253591b58b40f3cb3ea0d35f
    self.skipWaiting()
  }
  extendableEvent.waitUntil(stall())
})

// https://w3c.github.io/ServiceWorker/#service-worker-global-scope-install-event
self.addEventListener('activate', extendableEvent => {
  console.log('onactivate')
  extendableEvent.waitUntil((async () => {
    // https://w3c.github.io/ServiceWorker/#clients-claim
    // https://svgscreenshot.appspot.com/c/x/064ad6cd761a92b49d685595321b7b88.png
    // https://svgscreenshot.appspot.com/x/b43567d45f4210d16f459d878428f9e6
    // これを実行しない場合、初回install直後のclientsは空。
    // つまり、install直後にコントロール下に置かれているclientはゼロ。
    await self.clients.claim()
    // https://w3c.github.io/ServiceWorker/#clients-interface
    const clients = await self.clients.matchAll()
    console.log('clients', clients)
  })())
})

// https://w3c.github.io/ServiceWorker/#service-worker-global-scope-install-event
self.addEventListener('fetch', fetchEvent => {
  console.log('onfetch', fetchEvent)
  return
})

// https://w3c.github.io/ServiceWorker/#extendablemessageevent
// extendableMessageEvent.source of the message events is Client object
self.addEventListener('message', event => {
  const {title, body} = event.data
  console.log('onmessage', event, body)
  // return to sender
  const clientPort = event.ports[0]
  event.waitUntil(async function () {
    // XXX: ここでprefetchとかできる
    clientPort.postMessage({
      title,
      result: 'from serviceworker'
    })
  }())
})

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

self.addEventListener('sync', event => {
  console.log('fire syncEvent', event)
  if (event.tag === 'send:tweet') {
    event.waitUntil(async function () {
      const unsents = await findUnsents('tweet')
      for (const item of unsents) {
        const {method, pathname, body, key} = item
        const res = await fetch(pathname, {
          method,
          body: JSON.stringify(body),
          headers: {
            'Content-Type': 'application/json'
          }
        })
      }
      await deleteUnsents(unsents.map(item => item.key))
    }())
  }
})

const delay = sec => new Promise(resolve => setTimeout(resolve, 1000 * sec))
