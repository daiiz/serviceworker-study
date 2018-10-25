// ServiceWorkerGlobalScope
console.log(self)

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
  console.log('fetch', fetchEvent)
})

const delay = sec => new Promise(resolve => setTimeout(resolve, 1000 * sec))
