const fs = require('fs');

async function testMemory() {
  const startMemory = process.memoryUsage().heapUsed;
  const urls = [
    'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
  ];

  console.log('Fetching 9 images in parallel...');
  const results = await Promise.all(urls.map(async url => {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    const uint8array = new Uint8Array(buffer);
    const binary = new TextDecoder("latin1").decode(uint8array);
    const base64 = btoa(binary);
    return { size: buffer.byteLength, base64Length: base64.length };
  }));

  const endMemory = process.memoryUsage().heapUsed;
  console.log('Results:', results);
  console.log(`Memory spike: ${((endMemory - startMemory) / 1024 / 1024).toFixed(2)} MB`);
}

testMemory();
