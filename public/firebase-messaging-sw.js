importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBcHKgs-MYcGxniduWAR9T32rueaJGzZ_8",
  authDomain: "lista9-aa89a.firebaseapp.com",
  projectId: "lista9-aa89a",
  storageBucket: "lista9-aa89a.firebasestorage.app",
  messagingSenderId: "922519559675",
  appId: "1:922519559675:web:687d9bf7b906a16850ff5e"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Notificacion en segundo plano:', payload);

  const { title, body } = payload.notification;

  self.registration.showNotification(title, {
    body,
    icon: '/rex-yes.png',
    badge: '/rex-yes.png',
  });
});