import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDdS6xWylnURckj7Ysr69o6QKFoXObrePU",
  authDomain: "tookang-app.firebaseapp.com",
  projectId: "tookang-app",
  storageBucket: "tookang-app.firebasestorage.app",
  messagingSenderId: "84462197873",
  appId: "1:84462197873:web:7770b85230e24fbf364fd0"
};

// Initialize Firebase only if it hasn't been initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();

export default firebase;