import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Sign up with email and password
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    // Update the user profile
    await updateProfile(user, { displayName });

    // Create user document in Firestore
    const userData: User = {
      uid: user.uid,
      email: user.email!,
      displayName,
      photoURL: user.photoURL,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    return userData;
  } catch (error) {
    throw error;
  }
}

// Sign in with email and password
export async function signInWithEmail(
  email: string,
  password: string
): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    // Update last login time
    await updateDoc(doc(db, 'users', user.uid), {
      lastLoginAt: new Date(),
    });

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data() as User;

    return userData;
  } catch (error) {
    throw error;
  }
}

// Sign in with Google
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const { user } = result;

    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));

    let userData: User;

    if (userDoc.exists()) {
      // Update existing user
      userData = userDoc.data() as User;
      await updateDoc(doc(db, 'users', user.uid), {
        lastLoginAt: new Date(),
        photoURL: user.photoURL,
      });
    } else {
      // Create new user
      userData = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };

      await setDoc(doc(db, 'users', user.uid), userData);
    }

    return userData;
  } catch (error) {
    throw error;
  }
}

// Sign out
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
}

// Get current user data from Firestore
export async function getCurrentUserData(): Promise<User | null> {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) return null;

    return userDoc.data() as User;
  } catch (error) {
    console.error('Error getting current user data:', error);
    return null;
  }
}

// Convert Firebase User to our User type
export function convertFirebaseUser(firebaseUser: FirebaseUser): User {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName: firebaseUser.displayName || 'Anonymous',
    photoURL: firebaseUser.photoURL,
    createdAt: new Date(),
    lastLoginAt: new Date(),
  };
}
