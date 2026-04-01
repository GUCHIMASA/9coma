import { db } from './src/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

async function test() {
  try {
    const docRef = await addDoc(collection(db, '9tube_lists'), {
      test: true,
      createdAt: serverTimestamp()
    });
    console.log('Success:', docRef.id);
  } catch (e) {
    console.error('Fail:', e);
  }
}
test();
