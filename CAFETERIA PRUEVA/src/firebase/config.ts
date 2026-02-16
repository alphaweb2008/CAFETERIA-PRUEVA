import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBS1waVldUTYu4Zm2jckDLna5C1vMxP_Mg",
  authDomain: "cafeteria-prueva-d085e.firebaseapp.com",
  projectId: "cafeteria-prueva-d085e",
  storageBucket: "cafeteria-prueva-d085e.firebasestorage.app",
  messagingSenderId: "1021253954759",
  appId: "1:1021253954759:web:53bd1fed8edb86edcd62e2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
