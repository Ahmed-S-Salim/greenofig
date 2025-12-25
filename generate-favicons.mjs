import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicDir = join(__dirname, 'public');
const logoPath = join(publicDir, 'logo.png');

const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
];

async function generateFavicons() {
  console.log('Generating favicons from logo.png...');

  for (const { size, name } of sizes) {
    await sharp(logoPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(join(publicDir, name));
    console.log(`Created ${name} (${size}x${size})`);
  }

  // Also create the main favicon.png (32x32 is standard)
  await sharp(logoPath)
    .resize(32, 32, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(join(publicDir, 'favicon.png'));
  console.log('Created favicon.png (32x32)');

  // Create favicon.ico (multi-size ICO is best for compatibility)
  // Sharp doesn't support ICO directly, so we'll use the 32x32 PNG
  // Google prefers PNG anyway

  console.log('\nAll favicons generated successfully!');
}

generateFavicons().catch(console.error);
