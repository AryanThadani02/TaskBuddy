import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, collection, getDocs} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCAlvGBDEpOXc-_dI2gU7wPEhXjVJbMH-Y",
  authDomain: "taskmanager-a1e8a.firebaseapp.com",
  projectId: "taskmanager-a1e8a",
  storageBucket: "taskmanager-a1e8a.firebasestorage.app",
  messagingSenderId: "642776070281",
  appId: "1:642776070281:web:e9ba9c7ea3201db25d6e58",
  measurementId: "G-LBB5Q70G2J"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Verify initialization
// Verify Firestore connection
const tasksRef = collection(db, 'tasks');
getDocs(tasksRef)
  .then((snapshot) => {
    console.log('Firestore is connected');
    console.log('Current number of documents:', snapshot.size);
    console.log('Firebase config:', {
      projectId: firebaseConfig.projectId,
      // databaseURL is not required for Firestore
    });
  })
  .catch(error => {
    console.error('Firestore connection error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  });

auth.onAuthStateChanged(user => {
  console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
});

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
  }
};

const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign-Out Error:", error);
  }
};

export { auth, db, signInWithGoogle, signOutUser, app };