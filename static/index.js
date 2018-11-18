// client
console.log('index.js')

// https://w3c.github.io/ServiceWorker/#document-context
async function register () {
  try {
    // https://w3c.github.io/ServiceWorker/#serviceworkercontainer-interface
    const serviceWorkerContainer = navigator.serviceWorker
    const registration = await serviceWorkerContainer.register('/sw.js', {scope: '/'})

    // https://w3c.github.io/ServiceWorker/#navigator-service-worker-controller
    console.log('controller', serviceWorkerContainer.controller)

    // https://w3c.github.io/ServiceWorker/#update-state-algorithm
    // https://gyazo.com/d471d91f15f0e694caf0d73e17d00939
    console.log({
      // installing
      // The service worker in this state is considered an "installing worker".
      // https://svgscreenshot.appspot.com/x/1307e5ffe5851941588035370e88c0a0
      installing: registration.installing,

      // installed
      // The service worker in this state is considered a "waiting worker".

      // waiting
      waiting: registration.waiting,

      // activating
      // The service worker in this state is considered an "active worker".
      // https://svgscreenshot.appspot.com/x/ef17a5817e94f361431d41426c7a55af

      // activated
      // The service worker in this state is considered an "active worker"
      // ready to handle functional events.
      // https://gyazo.com/44c6fed44e5629fe65d28a1638b64288
      active: registration.active

      // redundant
    })

    // fire when the document's associated `registration` acquires a new "active worker".
    // self.clients.claim() 実行しない場合、初回install直後にここ来ない
    serviceWorkerContainer.addEventListener('controllerchange', event => {
      const sw = event.target.controller
      console.log(sw === registration.active) // true
    })

    trackWaitingWorker(registration)
  } catch (err) {
    console.error(err)
  }
}

const trackWaitingWorker = registration => {
  // self.skipWaiting() していると観察できない
  // waiting -> activating -> activated を追跡
  // waiting -> redundant も見れる
  // https://gyazo.com/ea9af31dcbe633f4d9262ad57b572370
  if (registration.waiting) {
    // https://w3c.github.io/ServiceWorker/#serviceworker
    const serviceWorker = registration.waiting
    serviceWorker.addEventListener('statechange', event => {
      console.log('->', event.target.state)
    })
  }
}

const getRegistration = async () => {
  const {serviceWorker} = navigator
  return serviceWorker && serviceWorker.getRegistration('/')
}

// https://googlechrome.github.io/samples/service-worker/post-message/
const postMessage = ({title, body}) => {
  const {controller} = navigator.serviceWorker
  if (!controller) return

  return new Promise((resolve, reject) => {
    // https://gyazo.com/06e98f9d067a35be4eaf7f5e3f0f51c7
    const messageChannel = new MessageChannel()
    messageChannel.port1.onmessage = event => {
      if (event.data && event.data.error) {
        reject(event.data.error)
      } else {
        resolve(event.data)
      }
    }
    controller.postMessage({title, body}, [messageChannel.port2])
  })
}

register()
