import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  // セキュリティのため、キー自体の値ではなく「存在するかどうか」だけを返します
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    env_status: {
      NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_APP_ID: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      YOUTUBE_API_KEY: !!process.env.YOUTUBE_API_KEY,
      RAKUTEN_APPLICATION_ID: !!process.env.RAKUTEN_APPLICATION_ID,
    },
    context: 'Diagnostic API to verify environment variable injection in Cloudflare Pages'
  });
}
