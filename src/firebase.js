import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDC6RheD-8ADKROqESFMtZzjKsylE93uUI",
  authDomain: "memoriz-507a0.firebaseapp.com",
  projectId: "memoriz-507a0",
  storageBucket: "memoriz-507a0.firebasestorage.app",
  messagingSenderId: "194395162190",
  appId: "1:194395162190:web:133ac71c846645309b251f"
}

const app        = initializeApp(firebaseConfig)
export const db      = getFirestore(app)
export const storage = getStorage(app)
export const auth    = getAuth(app)
export default app
