# Firebase Setup Instructions

## 🔥 Firebase Project Created!

**Project Name:** Vilakazi Props Booking System  
**Project ID:** `vilakazi-props-booking`  
**Console URL:** https://console.firebase.google.com/project/vilakazi-props-booking/overview

## 📋 Setup Steps

### 1. Enable Firebase Authentication

1. Go to the [Firebase Console](https://console.firebase.google.com/project/vilakazi-props-booking/authentication)
2. Click on "Get Started" in Authentication
3. Enable the following sign-in methods:
   - **Email/Password** ✓
   - **Google** ✓

### 2. Enable Firestore Database

1. Go to [Firestore Database](https://console.firebase.google.com/project/vilakazi-props-booking/firestore)
2. Click "Create Database"
3. Choose **"Start in test mode"** (for development)
4. Select a location (preferably closest to your users)
5. Click "Enable"

### 3. Initialize Database with Mock Data

After enabling Firestore, initialize it with data:

```bash
# Visit this URL in your browser
http://localhost:5173/initialize-db
```

Click the "Initialize Now" button to populate your database with:
- Test users
- Property listings
- Sample bookings
- Messages
- Availability data

### 4. Create Test User Accounts in Firebase Auth

You need to manually create these test accounts in Firebase Authentication:

1. Go to [Authentication > Users](https://console.firebase.google.com/project/vilakazi-props-booking/authentication/users)
2. Click "Add User" for each account:

**Admin Account:**
- Email: `admin@bnb.com`
- Password: `admin123`
- UID: `admin1` (set this manually)

**Guest Account 1:**
- Email: `guest@example.com`
- Password: `guest123`
- UID: `guest1` (set this manually)

**Guest Account 2:**
- Email: `sarah@example.com`
- Password: `sarah123`
- UID: `guest2` (set this manually)

> **Note:** Setting custom UIDs ensures they match the Firestore user documents.

### 5. Update Firestore Security Rules (Production)

For production, update Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Anyone can read listings
    match /listings/{listingId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users can read their own bookings
    match /bookings/{bookingId} {
      allow read: if request.auth != null && 
        (resource.data.guestId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.guestId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Messages
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Availability
    match /availability/{listingId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 🗄️ Firestore Database Structure

```
📁 firestore
├── 📁 users
│   ├── 📄 admin1
│   ├── 📄 guest1
│   └── 📄 guest2
├── 📁 listings
│   └── 📄 1 (Vilakazi Props)
├── 📁 bookings
│   ├── 📄 1, 2, 3... (admin bookings)
│   └── 📄 res1, res2... (user reservations)
├── 📁 messages
│   ├── 📄 1
│   └── 📄 2
└── 📁 availability
    └── 📄 1 (listing availability)
```

## 🚀 Running the Application

1. Make sure Firebase is configured:
   ```bash
   # Check firebase.ts has correct config
   cat src/config/firebase.ts
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Initialize the database (first time only):
   - Visit: `http://localhost:5173/initialize-db`
   - Click "Initialize Now"

4. Test the application:
   - Login with test accounts
   - Make bookings
   - View reservations
   - Test Google sign-in

## 📝 Environment Variables (Optional)

For better security, move Firebase config to environment variables:

Create `.env` file:
```env
VITE_FIREBASE_API_KEY=AIzaSyAG1ZqMymX8-SJVfkRRvi2qb1t_ObTvKQk
VITE_FIREBASE_AUTH_DOMAIN=vilakazi-props-booking.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=vilakazi-props-booking
VITE_FIREBASE_STORAGE_BUCKET=vilakazi-props-booking.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=958459732678
VITE_FIREBASE_APP_ID=1:958459732678:web:dc6864ce7b86cc76d46dc7
```

Update `firebase.ts` to use environment variables:
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

## ✅ Features Migrated to Firebase

- ✅ **Authentication:** Firebase Auth with Email/Password and Google
- ✅ **User Management:** Firestore user documents
- ✅ **Listings:** Property data in Firestore
- ✅ **Bookings:** Real-time booking storage
- ✅ **Messages:** Guest messaging system
- ✅ **Availability:** Blocked dates management
- ✅ **Reservations:** User booking history

## 🔐 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bnb.com | admin123 |
| Guest | guest@example.com | guest123 |
| Guest | sarah@example.com | sarah123 |

## 📚 Next Steps

1. Enable Firebase Authentication (Email/Password + Google)
2. Enable Firestore Database
3. Create test user accounts in Firebase Auth
4. Run database initialization
5. Test login and booking features
6. Update security rules for production
7. (Optional) Add Firebase Storage for image uploads
8. (Optional) Add Firebase Cloud Functions for booking automation

## 🛠️ Troubleshooting

**Issue:** Can't login with test accounts  
**Solution:** Make sure you created the test accounts in Firebase Authentication with the exact emails and UIDs.

**Issue:** Database initialization fails  
**Solution:** Ensure Firestore is enabled in test mode.

**Issue:** Google sign-in doesn't work  
**Solution:** Enable Google sign-in method in Firebase Authentication console.

**Issue:** Permission denied errors  
**Solution:** Check Firestore security rules are in test mode for development.

---

🎉 **Your Firebase setup is complete!** Visit `/initialize-db` to populate your database and start testing!
