self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', () => {
    Promise.all([
        caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))),
        self.registration.unregister(),
    ])
        .then(() => self.clients.matchAll())
        .then((clients) => {
            clients.forEach((client) => client.navigate(client.url));
        });
});
