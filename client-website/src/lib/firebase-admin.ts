import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Сервисный аккаунт (скачайте из консоли Firebase)
// ВАЖНО: этот файл НЕ должен попасть в git!
// Добавьте service-account.json в .gitignore
const serviceAccount = require('../../service-account.json');

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: "ВАШ_ПРОЕКТ.appspot.com"
  });
}

export const adminDb = getFirestore();
