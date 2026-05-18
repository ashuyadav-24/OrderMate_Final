// 🔔 OrderMate Service Worker
// Handles push notifications even when browser is closed

self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};

  const title = data.title || "OrderMate";
  const options = {
    body: data.body || "You have a new notification",
    icon: "/icon.png",       // add your app icon here
    badge: "/badge.png",
    vibrate: [200, 100, 200],
    data: {
      url: data.url || "/home",  // where to navigate on click
    },
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// When user clicks the notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/home";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If app tab is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // Otherwise open a new tab
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
