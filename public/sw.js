self.addEventListener('install', event => {
  self.skipWaiting(); // Force immediate activation
});

self.addEventListener('activate', event => {
  clients.claim(); // Take control of existing pages
});




self.addEventListener('push', function (event) {
  let payload = { title: 'Default Title', body: 'No content', icon: '/icon.png' };
console.log(event)
  if (event.data) {
    try {
      const data = event.data.json();
      // Assuming payload was wrapped like { data: { title, body, icon, ... } }
      payload = data.data || data;
    } catch (err) {
      console.error('Push event data parse error:', err);
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icon.png',
      badge: payload.badge || '/icon.png',
      data: payload.data || {},
      tag: 'schoolconnect-msg',
    })
  );
});


self.addEventListener('notificationclick', function(event) {
  var doge = event.notification.data.doge;
  console.log(doge.wow);
});
