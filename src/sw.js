/* eslint-disable no-undef */
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener("push", (event) => {
  let payload = {
    title: "Placement Daily Log",
    body: "Time to complete today's log.",
    url: "/"
  };

  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() };
    }
  } catch {
    // Fall back to defaults when payload is not JSON.
  }

  const options = {
    body: payload.body,
    icon: "/icon.svg",
    badge: "/icon.svg",
    data: { url: payload.url || "/" }
  };

  event.waitUntil(self.registration.showNotification(payload.title || "Placement Daily Log", options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existingClient = clients.find((client) => client.url.includes(self.location.origin));
      if (existingClient) {
        existingClient.focus();
        existingClient.navigate(targetUrl);
        return;
      }
      self.clients.openWindow(targetUrl);
    })
  );
});
