/**
 * MUSTAZ CRAFT - Automated Supabase Storage Asset Uploader
 * 
 * Mengunggah seluruh aset gambar lokal di folder `assets/images/` ke Supabase Storage CDN ('product-images').
 * 
 * CARA PAKAI:
 * 1. Pastikan Anda sudah menjalankan 'supabase_security_rules.sql' di Supabase SQL Editor.
 * 2. Jalankan perintah:
 *    node scripts/upload_assets_to_supabase.js
 * 
 * Atau jika ingin menggunakan Service Role Key Supabase:
 *    node scripts/upload_assets_to_supabase.js <YOUR_SERVICE_ROLE_KEY>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = "https://hskggocaakmidbysrpnd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_GiDVOZNX_cZFe79wO0fw5w_wsfgRyAi";
const STORAGE_BUCKET = "product-images";

// Ambil auth key dari argumen terminal jika disediakan (misal service role key), jika tidak gunakan anon key
const customKey = process.argv[2] || process.env.SUPABASE_SERVICE_ROLE_KEY;
const ACTIVE_KEY = customKey || SUPABASE_ANON_KEY;

const IMAGES_DIR = path.resolve(__dirname, '../assets/images');

const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

async function uploadFile(filePath, fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
  const fileBuffer = fs.readFileSync(filePath);

  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${encodeURIComponent(fileName)}`;

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'apikey': ACTIVE_KEY,
      'Authorization': `Bearer ${ACTIVE_KEY}`,
      'Content-Type': mimeType,
      'x-upsert': 'true' // Timpa jika file sudah ada
    },
    body: fileBuffer
  });

  const cdnUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${encodeURIComponent(fileName)}`;

  if (!response.ok) {
    const errText = await response.text();
    return { success: false, fileName, error: errText, cdnUrl };
  }

  return { success: true, fileName, cdnUrl };
}

async function main() {
  console.log('====================================================');
  console.log('⚡ MUSTAZ CRAFT - CLOUD STORAGE ASSET UPLOADER');
  console.log(`📦 Target Bucket : ${STORAGE_BUCKET}`);
  console.log(`🌐 Supabase Host : ${SUPABASE_URL}`);
  console.log(`📁 Source Folder : ${IMAGES_DIR}`);
  console.log('====================================================\n');

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`❌ Direktori tidak ditemukan: ${IMAGES_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(IMAGES_DIR).filter(f => {
    const ext = path.extname(f).toLowerCase();
    const stat = fs.statSync(path.join(IMAGES_DIR, f));
    return stat.isFile() && Object.keys(MIME_TYPES).includes(ext);
  });

  console.log(`🔍 Menemukan ${files.length} file gambar untuk diunggah ke cloud...\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < files.length; i++) {
    const fileName = files[i];
    const fullPath = path.join(IMAGES_DIR, fileName);
    process.stdout.write(`[${i + 1}/${files.length}] Mengunggah: ${fileName.padEnd(35)} `);

    try {
      const result = await uploadFile(fullPath, fileName);
      if (result.success) {
        console.log('✅ BERHASIL');
        successCount++;
      } else {
        console.log('⚠️ GAGAL');
        console.log(`   Detail: ${result.error}`);
        failCount++;
      }
    } catch (err) {
      console.log('❌ ERROR');
      console.log(`   ${err.message}`);
      failCount++;
    }
  }

  console.log('\n====================================================');
  console.log(`🎉 Selesai: ${successCount} Berhasil, ${failCount} Gagal.`);
  console.log(`🌐 Base CDN URL: ${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/`);
  console.log('====================================================');

  if (failCount > 0 && !customKey) {
    console.log('\n💡 TIPS: Jika upload gagal karena "Bucket not found" atau "Unauthorized":');
    console.log('1. Jalankan isi file `supabase_security_rules.sql` di Supabase SQL Editor.');
    console.log('2. Atau jalankan script ini dengan Service Role Key:');
    console.log('   node scripts/upload_assets_to_supabase.js <SUPABASE_SERVICE_ROLE_KEY>\n');
  }
}

main().catch(err => {
  console.error('Fatal Error:', err);
});
