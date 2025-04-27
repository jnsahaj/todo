self.addEventListener("message", (event) => {
  console.log("SW Received Message:", event.data);
  const { title, options, timestamp } = event.data;

  if (!title || !options || !timestamp) {
    console.error("SW: Invalid message data received", event.data);
    return;
  }

  const now = Date.now();
  const delay = timestamp - now;

  if (delay > 0) {
    console.log(`SW: Scheduling notification "${title}" in ${delay}ms`);
    setTimeout(() => {
      self.registration
        .showNotification(title, options)
        .then(() => console.log(`SW: Notification "${title}" shown.`))
        .catch((err) =>
          console.error(`SW: Error showing notification "${title}":`, err)
        );
    }, delay);
  } else {
    // If the time is in the past or immediate, show it now (or handle as needed)
    console.log(
      `SW: Showing notification "${title}" immediately (scheduled time was in the past).`
    );
    self.registration
      .showNotification(title, options)
      .then(() => console.log(`SW: Notification "${title}" shown.`))
      .catch((err) =>
        console.error(`SW: Error showing notification "${title}":`, err)
      );
  }
});

self.addEventListener("install", (event) => {
  console.log("SW: Installed");
  // Skip waiting to activate the new SW immediately.
  // Useful for development, might remove for production.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("SW: Activated");
  // Use event.waitUntil to ensure claim() finishes before activation completes
  event.waitUntil(
    self.clients
      .claim()
      .then(() => {
        console.log("SW: Claimed clients successfully.");
      })
      .catch((err) => {
        console.error("SW: Error claiming clients:", err);
        // Optionally, rethrow or handle the error if claiming is critical
      })
  );
});
