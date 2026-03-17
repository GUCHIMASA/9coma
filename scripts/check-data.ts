import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where,
  limit 
} from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

import { initializeApp } from 'firebase/app';
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkData() {
  const authorName = '鳥山 明';
  console.log(`🔍 「${authorName}」のデータサンプリング開始`);
  
  const q = query(
    collection(db, 'lists'), 
    where('authors', 'array-contains', authorName),
    limit(5)
  );
  
  const snaps = await getDocs(q);
  console.log(`ヒット件数: ${snaps.size}`);
  
  snaps.forEach(snap => {
    const data = snap.data();
    console.log(`ID: ${snap.id}`);
    console.log(`Authors: ${JSON.stringify(data.authors)}`);
    if (data.slots) {
      data.slots.forEach((slot: any, i: number) => {
        console.log(`  Slot ${i}: ${typeof slot} - ${JSON.stringify(slot)}`);
      });
    }
    console.log('---');
  });
}

checkData().catch(console.error);
