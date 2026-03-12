import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

// .env.localを簡易的にパースする機能
function loadEnv(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      process.env[key] = value;
    }
  });
}

loadEnv(path.resolve(process.cwd(), '.env.local'));

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const appId = process.env.RAKUTEN_APPLICATION_ID;
const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;
const accessKey = process.env.RAKUTEN_ACCESS_KEY;

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function repair(listId: string) {
  console.log('--- API Connectivity Test ---');
  const testIsbn = '9784088820934'; // ONE PIECE 1
  const testRes = await fetchRakuten({ isbnjan: testIsbn });
  console.log(`Test Search (ONE PIECE 1): ${testRes.Items?.length ? 'SUCCESS' : 'FAILED'}`);
  if (!testRes.Items?.length) {
    console.log('Full Debug Response:', JSON.stringify(testRes, null, 2));
  }
  console.log('--- End Test ---\n');

  console.log(`Starting repair for list: ${listId}`);
  
  const snap = await getDoc(doc(db, 'lists', listId));
  if (!snap.exists()) {
    console.error('List not found!');
    return;
  }

  const data = snap.data();
  const slots = (data.slots || []) as any[];
  const newSlots = [...slots];
  let changed = false;

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const isObject = slot && typeof slot === 'object';
    const isbn = isObject ? slot.isbn : (typeof slot === 'string' ? slot : null);
    
    const hasValidImage = isObject && slot.imageUrl && slot.imageUrl !== '' && !slot.imageUrl.includes('placeholder');

    if (isbn && !hasValidImage) {
      console.log(`Slot ${idxToString(i)}: Repairing ISBN ${isbn}...`);
      
      // 第1試行: isbnjanパラメータで検索
      let resData = await fetchRakuten({ isbnjan: isbn });
      await new Promise(resolve => setTimeout(resolve, 3100)); // 3秒待機

      // 第2試行: 結果がなければキーワードとして検索
      if ((!resData.Items || resData.Items.length === 0) && !resData.error) {
        console.log(`Slot ${idxToString(i)}: No direct ISBN match. Trying keyword search...`);
        resData = await fetchRakuten({ keyword: isbn });
        await new Promise(resolve => setTimeout(resolve, 3100));
      }

      if (resData.Items && resData.Items.length > 0) {
        const item = resData.Items[0];
        newSlots[i] = {
          isbn: item.isbn,
          title: item.title,
          author: item.author,
          imageUrl: item.largeImageUrl,
          affiliateUrl: item.affiliateUrl || item.itemUrl,
        };
        console.log(`Slot ${idxToString(i)}: Successfully fetched info for "${item.title}"`);
        changed = true;
      } else {
        console.warn(`Slot ${idxToString(i)}: No results found after all attempts. Error: ${JSON.stringify(resData.error || 'None')}`);
      }
    } else {
      console.log(`Slot ${idxToString(i)}: OK (${hasValidImage ? 'has image' : 'no ISBN'})`);
    }
  }

  if (changed) {
    console.log('Updating Firestore...');
    await updateDoc(doc(db, 'lists', listId), { slots: newSlots });
    console.log('Repair completed successfully!');
  } else {
    console.log('No changes needed.');
  }
}

async function fetchRakuten(params: Record<string, string>) {
  const url = new URL('https://openapi.rakuten.co.jp/services/api/BooksTotal/Search/20170404');
  url.searchParams.set('applicationId', appId!);
  if (affiliateId) url.searchParams.set('affiliateId', affiliateId);
  if (accessKey) url.searchParams.set('accessKey', accessKey);
  url.searchParams.set('formatVersion', '2');
  url.searchParams.set('hits', '1');
  
  for (const [key, val] of Object.entries(params)) {
    url.searchParams.set(key, val);
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://9coma.com';
  try {
    const res = await fetch(url.toString(), {
      headers: {
        'Referer': baseUrl,
        'Origin': baseUrl,
      }
    });
    const data: any = await res.json();
    if (data.errors || data.error || !res.ok) {
        return { error: data.errors || data.error || `HTTP ${res.status}`, raw: data };
    }
    return data;
  } catch (e: any) {
    return { error: e.message };
  }
}

function idxToString(i: number) {
  return (i + 1).toString();
}

const targetId = process.argv[2] || 'n9n8l00y';
repair(targetId).then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
