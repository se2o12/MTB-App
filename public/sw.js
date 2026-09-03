self.addEventListener('push', (event) => {
  let data = {
    title: 'MTB Community',
    body: 'Du hast eine neue Nachricht.',
    icon: '/pwa-192.png',
    badge: '/pwa-192.png',
  }

  try {
    if (event.data) {
      data = {
        ...data,
        ...event.data.json(),
      }
    }
  } catch (error) {
    console.error('Push-Daten konnten nicht gelesen werden:', error)
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      data: {
        url: data.url || '/',
      },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})