// sw-register.js - File untuk mendaftarkan service worker
const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

class ServiceWorkerRegister {
  static async init() {
    if ('serviceWorker' in navigator) {
      try {
        // Register service worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration);
        
        // Initialize push notification
        await this.initPushNotification(registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  static async initPushNotification(registration) {
    if ('PushManager' in window) {
      try {
        // Request permission
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          // Subscribe to push notifications
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
          });
          
          // Send subscription to server
          await this.subscribeToServer(subscription);
        }
      } catch (error) {
        console.error('Push notification initialization failed:', error);
      }
    }
  }

  static async subscribeToServer(subscription) {
    try {
      // Konversi subscription menjadi JSON object
      const subscriptionJSON = subscription.toJSON();
      
      // Fetch ke endpoint /notifications/subscribe dengan format yang benar
      const response = await fetch('/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscriptionJSON.endpoint,
          keys: {
            auth: subscriptionJSON.keys.auth,
            p256dh: subscriptionJSON.keys.p256dh,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Successfully subscribed to push notifications:', result);
    } catch (error) {
      console.error('Error subscribing to server:', error);
    }
  }

  static urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Auto-initialize
ServiceWorkerRegister.init();