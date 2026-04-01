import { getYoutubeMetadata } from './actions';

async function test() {
  const videoUrl = 'https://www.youtube.com/watch?v=ScMzIvxBSi4';
  const channelUrl = 'https://www.youtube.com/@HIKAKIN';

  console.log('--- Testing Video URL ---');
  const videoData = await getYoutubeMetadata(videoUrl);
  console.log(JSON.stringify(videoData, null, 2));

  console.log('\n--- Testing Channel URL ---');
  const channelData = await getYoutubeMetadata(channelUrl);
  console.log(JSON.stringify(channelData, null, 2));
}

test();
