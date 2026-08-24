// firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyAqmFiLSEKgYNlscQkwGc4TVlEeh_GV-F8",
  authDomain: "couple-card-game-d8852.firebaseapp.com",
  projectId: "couple-card-game-d8852",
  storageBucket: "couple-card-game-d8852.firebasestorage.app",
  messagingSenderId: "1089424772159",
  appId: "1:1089424772159:web:8c0546fe679ba86cfbfc8a",
  measurementId: "G-0RLX4JTBGP"
};

// 初始化
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();