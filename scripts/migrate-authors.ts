/**
 * Phase 36: 既存データの著者名紐付け（マイグレーション）スクリプト
 * 
 * 使い方:
 * 1. .env.local に有効な Firebase / Firestore の環境変数を設定する
 * 2. `npx tsx scripts/migrate-authors.ts` を実行する
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where, 
  writeBatch, 
  doc, 
  getDoc,
  limit
} from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 環境変数の読み込み
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateAuthors() {
  console.log('🚀 マイグレーション開始: authors フィールドの見直しと付与');
  
  // 1. authors フィールドが存在しない全ドキュメントを取得
  // 本来は where('authors', '==', null) などが使いたいが、Firestore の仕様上
  // 「存在しない」フィールドをクエリするのは難しいため、一旦全件取得（または authors != exists 的な判定）
  // 件数が少ない想定なので、全件取得してJS側で判定する。
  const listsRef = collection(db, 'lists');
  const snaps = await getDocs(listsRef);
  
  console.log(`📊 総ドキュメント数: ${snaps.size}`);
  
  let processedCount = 0;
  let updatedCount = 0;
  let batch = writeBatch(db);
  let batchSize = 0;

  for (const snap of snaps.docs) {
    processedCount++;
    const data = snap.data();
    
    // 既に authors が存在し、空でない場合はスキップ
    if (data.authors && Array.from(data.authors).length > 0) {
      continue;
    }

    console.log(`🔍 処理中 (${processedCount}/${snaps.size}): ${snap.id}`);
    
    const slots = data.slots as any[];
    if (!slots || !Array.isArray(slots)) continue;

    const authorSet = new Set<string>();

    for (const slot of slots) {
      if (!slot) continue;

      // 1. オブジェクト形式（MangaItem）の場合
      if (typeof slot === 'object' && slot.author) {
        authorSet.add(slot.author);
      } 
      // 2. ISBN（文字列）のみの場合
      else if (typeof slot === 'string' && slot.length > 0) {
        const mangaSnap = await getDoc(doc(db, 'manga_cache', slot));
        if (mangaSnap.exists()) {
          const mangaData = mangaSnap.data();
          if (mangaData.author) {
            authorSet.add(mangaData.author);
          }
        }
      }
    }

    const authors = Array.from(authorSet);
    if (authors.length > 0) {
      batch.update(snap.ref, { authors });
      batchSize++;
      updatedCount++;
      
      console.log(`   ✅ 付与: ${authors.join(', ')}`);
    }

    // 500件ごとにコミット
    if (batchSize >= 500) {
      console.log('📦 バッチコミット中...');
      await batch.commit();
      batch = writeBatch(db);
      batchSize = 0;
    }
  }

  // 残りのバッチをコミット
  if (batchSize > 0) {
    await batch.commit();
  }

  console.log('✨ マイグレーション完了！');
  console.log(`   処理数: ${processedCount}`);
  console.log(`   更新数: ${updatedCount}`);
}

migrateAuthors().catch(err => {
  console.error('❌ マイグレーション中にエラーが発生しました:', err);
  process.exit(1);
});
