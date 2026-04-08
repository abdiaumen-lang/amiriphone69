import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// This script migrates images from local public/uploads to Supabase Storage
const SUPABASE_URL = 'https://abncjqujfmnzucstuadu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const UPLOADS_DIR = './artifacts/api-server/public/uploads';
const BUCKET_NAME = 'uploads';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function migrate() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    console.error(`Directory not found: ${UPLOADS_DIR}`);
    return;
  }

  const files = fs.readdirSync(UPLOADS_DIR);
  console.log(`Found ${files.length} files to migrate.`);

  for (const file of files) {
    const filePath = path.join(UPLOADS_DIR, file);
    if (!fs.statSync(filePath).isFile()) continue;

    console.log(`Uploading ${file}...`);
    const fileContent = fs.readFileSync(filePath);
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(file, fileContent, {
        upsert: true,
        contentType: getContentType(file)
      });

    if (error) {
      console.error(`Failed to upload ${file}:`, error.message);
    } else {
      console.log(`Uploaded ${file} successfully.`);
    }
  }
}

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    case '.gif': return 'image/gif';
    case '.svg': return 'image/svg+xml';
    case '.mp4': return 'video/mp4';
    case '.webm': return 'video/webm';
    default: return 'application/octet-stream';
  }
}

migrate();
