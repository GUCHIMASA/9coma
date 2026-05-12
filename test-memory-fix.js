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
    const base64 = Buffer.from(buffer).toString('base64');
    return { size: buffer.byteLength, base64Length: base64.length };
  }));

  const endMemory = process.memoryUsage().heapUsed;
  let totalBytes = 0;
  let totalBase64 = 0;
  results.forEach(r => {
    totalBytes += r.size;
    totalBase64 += r.base64Length;
  });
  console.log(`Total raw size: ${(totalBytes / 1024).toFixed(2)} KB`);
  console.log(`Total base64 size: ${(totalBase64 / 1024).toFixed(2)} KB`);
  console.log(`Memory spike: ${((endMemory - startMemory) / 1024 / 1024).toFixed(2)} MB`);
}

testMemory();
