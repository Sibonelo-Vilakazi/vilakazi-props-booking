import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

/**
 * Auth Service
 * Handles all authentication-related operations
 * To migrate to Node.js backend: Replace Firebase Auth with JWT-based auth
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'guest';
  phone?: string;
  createdAt: string;
}

export const authService = {
  /**
   * Sign in with email and password
   * @param email - User's email
   * @param password - User's password
   * @returns Promise<User>
   */
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }
      
      return userDoc.data() as User;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  /**
   * Register a new user
   * @param email - User's email
   * @param password - User's password
   * @param name - User's name
   * @param phone - User's phone (optional)
   * @returns Promise<User>
   */
  async register(email: string, password: string, name: string, phone?: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      const userData: User = {
        id: userCredential.user.uid,
        email,
        name,
        role: 'guest',
        phone,
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      
      return userData;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * Sign in with Google
   * @returns Promise<User>
   */
  async signInWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (userDoc.exists()) {
        return userDoc.data() as User;
      }
      
      // Create new user profile
      const userData: User = {
        id: result.user.uid,
        email: result.user.email || '',
        name: result.user.displayName || 'Guest User',
        role: 'guest',
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', result.user.uid), userData);
      
      return userData;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  },

  /**
   * Sign out current user
   * @returns Promise<void>
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  /**
   * Get current user profile
   * @param userId - User ID
   * @returns Promise<User | null>
   */
  async getCurrentUserProfile(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        return null;
      }
      
      return userDoc.data() as User;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
};

// Example of how to migrate to Node.js backend:
/*
export const authService = {
  async signIn(email: string, password: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) throw new Error('Login failed');
    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    return data.user;
  },

  async register(email: string, password: string, name: string, phone?: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, phone })
    });
    if (!response.ok) throw new Error('Registration failed');
    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    return data.user;
  },

  async signInWithGoogle(): Promise<User> {
    // Implement OAuth flow with your backend
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  },

  async signOut(): Promise<void> {
    localStorage.removeItem('authToken');
  },

  async getCurrentUserProfile(userId: string): Promise<User | null> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return null;
    return await response.json();
  }
};
*/
