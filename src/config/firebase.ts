import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAG1ZqMymX8-SJVfkRRvi2qb1t_ObTvKQk",
  authDomain: "vilakazi-props-booking.firebaseapp.com",
  projectId: "vilakazi-props-booking",
  storageBucket: "vilakazi-props-booking.firebasestorage.app",
  messagingSenderId: "958459732678",
  appId: "1:958459732678:web:dc6864ce7b86cc76d46dc7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;