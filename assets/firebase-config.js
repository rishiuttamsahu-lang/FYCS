// Firebase configuration
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHMxne5GmuGFxoxz71Mk1NlbTfJCqYLro",
  authDomain: "my-project-c6453.firebaseapp.com",
  projectId: "my-project-c6453",
  storageBucket: "my-project-c6453.firebasestorage.app",
  messagingSenderId: "90067329674",
  appId: "1:90067329674:web:3d8cb062647b43c427c373",
  measurementId: "G-E0MCYHYF4S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Google Auth Provider
const provider = new GoogleAuthProvider();

export { app, auth, provider };