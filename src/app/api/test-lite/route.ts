import { NextResponse } from 'next/server';
export const runtime = 'edge';
export async function GET(req: Request) {
  try {
    const { initializeApp } = await import('firebase/app');
    const { getFirestore, doc, getDoc } = await import('firebase/firestore/lite');
    
    // Explicitly grab environment variables
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    };
    
    // Just dump them to see if they exist
    if (!firebaseConfig.projectId) {
      return NextResponse.json({ error: 'Missing projectId from env', envDump: { NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID } }, { status: 500 });
    }

    const app = initializeApp(firebaseConfig, 'lite-test');
    const db = getFirestore(app);
    
    const docRef = doc(db, '9tube_lists', 'Q8dKhwZYRpk3UpSzChl9');
    const snap = await getDoc(docRef);
    
    if (snap.exists()) {
      return NextResponse.json({ success: true, usingLite: true, id: snap.id, ...snap.data() });
    } else {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
