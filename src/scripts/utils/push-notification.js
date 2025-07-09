const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk'; // VAPID key dari API Dicoding

class PushNotification {
  static async init() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
        
        // Tambahan: Fetch ke endpoint /notifications/subscribe
        await this.subscribeToServer(subscription);
      }
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

  // Tambahan: Method untuk subscribe ke server
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
}

// Auto-initialize
PushNotification.init();