
import { getBase64Image } from './src/lib/og-helper';

async function test() {
  const url = 'https://m.media-amazon.com/images/I/51-mD+D+UGL._SL500_.jpg';
  console.log('Fetching:', url);
  const result = await getBase64Image(url);
  if (result.success) {
    console.log('Success!');
    console.log('Data URL length:', result.dataUrl?.length);
    console.log('Size:', result.size);
    // console.log('Data URL start:', result.dataUrl?.substring(0, 100));
  } else {
    console.error('Failed:', result.error);
  }
}

test();
