// ⚠️ REEMPLAZA estos valores con tu firebaseConfig real
// Los obtienes en: console.firebase.google.com → Tu proyecto → </> → Configuración

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyB-5Sa4NzvOPo0qmcRWC1M_cyT1KLWN05A",
  authDomain: "academia-guerrera.firebaseapp.com",
  projectId: "academia-guerrera",
  storageBucket: "academia-guerrera.firebasestorage.app",
  messagingSenderId: "885901049806",
  appId: "1:885901049806:web:d2d966bbaf3a5666dc759f",
  measurementId: "G-B47KW2819N",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
