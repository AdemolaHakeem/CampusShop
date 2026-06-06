import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const input = resolve(root, 'public', 'CampusShop2.0.png');

// Generate 32x32 standard favicon
await sharp(input)
  .resize(32, 32, { fit: 'cover', position: 'centre' })
  .png()
  .toFile(resolve(root, 'public', 'favicon.png'));

// Generate 96x96 for retina/touch icons
await sharp(input)
  .resize(96, 96, { fit: 'cover', position: 'centre' })
  .png()
  .toFile(resolve(root, 'public', 'favicon-96x96.png'));

console.log('✅ Favicons generated: favicon.png (32x32) and favicon-96x96.png (96x96)');
