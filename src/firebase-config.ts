export const firebaseConfig = {
  apiKey: 'AIzaSyDsX0tRFuD3NWHV0AIvjQiAvOkwyqOTlgM',
  authDomain: 'streamer-queue.firebaseapp.com',
  databaseURL:
    'https://streamer-queue-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'streamer-queue',
  storageBucket: 'streamer-queue.firebasestorage.app',
  messagingSenderId: '279985941141',
  appId: '1:279985941141:web:39c1ea22705ed9b033c99c',
}

/**
 * True once the block above has been filled in with a real project.
 * Until then the app runs in local demo mode (data stays in this browser).
 */
export function isFirebaseConfigured(): boolean {
  return (
    firebaseConfig.databaseURL.startsWith('https://') &&
    !firebaseConfig.databaseURL.includes('PASTE') &&
    firebaseConfig.apiKey.length > 10 &&
    !firebaseConfig.apiKey.includes('PASTE')
  )
}
