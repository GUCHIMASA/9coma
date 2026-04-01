import { YouTubeSlot } from '../src/types/youtube';

async function testApi() {
  const payload = {
    slots: [
      { type: 'video', url: 'https://www.youtube.com/watch?v=1', title: 'Video 1', imageUrl: 'https://i.ytimg.com/vi/1/hqdefault.jpg' },
      { type: 'channel', url: 'https://www.youtube.com/@1', title: 'Channel 1', imageUrl: 'https://yt3.ggpht.com/1' },
      null, null, null, null, null, null, null
    ],
    authorName: 'Test Author',
    theme: 'Test Theme',
    colorThemeId: '01'
  };

  console.log('--- Testing POST API ---');
  // 開発環境のベースURL (localhost:3000)
  const baseUrl = 'http://localhost:3000';
  
  try {
    const postRes = await fetch(`${baseUrl}/api/9tube/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const postData = await postRes.json();
    console.log('POST Response:', JSON.stringify(postData, null, 2));

    if (postData.id) {
      console.log('\n--- Testing GET API ---');
      const getRes = await fetch(`${baseUrl}/api/9tube/list?id=${postData.id}`);
      const getData = await getRes.json();
      console.log('GET Response:', JSON.stringify(getData, null, 2));
    }
  } catch (e) {
    console.error('API Test Failed:', e);
  }
}

testApi();
