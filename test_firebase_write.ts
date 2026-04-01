import { db } from './src/lib/firebase';
import { collection, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
// Let's use a simpler way since it's a Next.js environment.
