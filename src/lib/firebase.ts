import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase config — these keys are public by design.
// Security is enforced by Firebase Realtime Database Rules, not by hiding these keys.
const firebaseConfig = {
  apiKey: "AIzaSyCH9GoMrfeTSnLgNLOqvjMF2eAwk8kPMhI",
  authDomain: "fila-barbearia-bd154.firebaseapp.com",
  databaseURL: "https://fila-barbearia-bd154-default-rtdb.firebaseio.com",
  projectId: "fila-barbearia-bd154",
  storageBucket: "fila-barbearia-bd154.firebasestorage.app",
  messagingSenderId: "526248427249",
  appId: "1:526248427249:web:4cfbc217eaba397045b350",
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const database = getDatabase(app);

export { database };
