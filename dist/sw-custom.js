// Custom Service Worker additions for Push Notifications

// Handle push events
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  let data = {
    title: 'Football Trainer',
    body: 'Час тренуватися! ⚽',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'default',
    data: {},
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    tag: data.tag || 'default',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || [
      { action: 'open', title: 'Відкрити' },
      { action: 'dismiss', title: 'Закрити' },
    ],
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  if (action === 'dismiss') {
    return;
  }

  // Default action or 'open' action
  const urlToOpen = data.url || '/app';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Open new window if not
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  // Could track dismissals here
  const data = event.notification.data || {};
  if (data.trackDismissal) {
    // Send to analytics
  }
});

// Handle background sync for offline progress
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);
  
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgress());
  }
});

// Sync offline progress
async function syncProgress() {
  try {
    // This would be handled by the main app's sync logic
    console.log('Syncing offline progress...');
  } catch (error) {
    console.error('Sync error:', error);
  }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('Periodic sync event:', event.tag);
  
  if (event.tag === 'check-training-reminder') {
    event.waitUntil(checkTrainingReminder());
  }
});

// Check if training reminder should be sent
async function checkTrainingReminder() {
  try {
    // Get current time
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Default reminder time is 18:00
    // In production, this would check user preferences from IndexedDB
    if (currentHour === 18 && currentMinute === 0) {
      self.registration.showNotification('Час тренуватися! ⚽', {
        body: 'Не забудь виконати сьогоднішнє тренування',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'training-reminder',
        vibrate: [200, 100, 200],
        actions: [
          { action: 'open', title: 'Почати' },
          { action: 'dismiss', title: 'Пізніше' },
        ],
        data: {
          url: '/app',
          type: 'training_reminder',
        },
      });
    }
  } catch (error) {
    console.error('Check training reminder error:', error);
  }
}

console.log('Custom Service Worker loaded');

