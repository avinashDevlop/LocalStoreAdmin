// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDzWHPStnuwGMlpkJZnCCoh4N_NR8bZ_7w",
  authDomain: "facialrecognitiondb.firebaseapp.com",
  databaseURL: "https://facialrecognitiondb-default-rtdb.firebaseio.com",
  projectId: "facialrecognitiondb",
  storageBucket: "facialrecognitiondb.appspot.com",
  messagingSenderId: "331227943033",
  appId: "1:331227943033:web:95edd1313135dddda9c4a8",
  measurementId: "G-SYGF0KCHD8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;