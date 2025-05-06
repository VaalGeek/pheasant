// public/firebase-messaging-sw.js



// Import scripts from Firebase
importScripts('https://www.gstatic.com/firebasejs/10.10.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.10.0/firebase-messaging-compat.js')

const firebaseConfig = {
  apiKey:'AIzaSyB_G_JugBo7dX2ccR1udkE7vPgDxiGsy9I',
  authDomain: "school-websites-e23df.firebaseapp.com",
  projectId: 'school-websites-e23df',
  storageBucket: 'school-websites-e23df.firebasestorage.app',
  messagingSenderId: '195827426463',
  appId: '1:195827426463:web:ce508cd13c6beb0278aeaa',
  measurementId: 'G-26B53YTL3E',
}


// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// ✅ STEP 2: Now it's safe to access messaging
const messaging = firebase.messaging()

// ✅ (Optional) Background notification handling
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Received background message ', payload);

  const options = {
    body: payload.data.body,
    icon: payload.data.icon || '/default-icon.png',
    badge: payload.data.badge || '/default-badge.png',
    data: {
      url: payload.data.click_action || '/',
    },
    actions: [
      {
        action: 'open_url',
        title: '🔗 Open Link',
      }
    ],
    requireInteraction: true,
  };
  

  self.registration.showNotification(payload.data.title, options);
});

self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification click Received.', event);

  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});


// Handle button clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open_url') {
    clients.openWindow(event.notification.data.url);
  } else {
    clients.openWindow('https://setlabotjhaps.netlify.app');  // Default action
  }
});
