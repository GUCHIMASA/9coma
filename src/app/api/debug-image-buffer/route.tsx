/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  const url = 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg';

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: 'white' }}>
        <img src={url} width="300" height="300" alt="debug" />
      </div>
    ),
    { width: 300, height: 300 }
  );
}
