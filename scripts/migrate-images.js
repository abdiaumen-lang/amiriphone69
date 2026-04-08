import fs from 'fs';
import path from 'path';

// Dependency-free script to migrate images to Supabase Storage via REST API
const SUPABASE_URL = 'https://abncjqujfmnzucstuadu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const UPLOADS_DIR = './artifacts/api-server/public/uploads';
const BUCKET_NAME = 'uploads';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required.');
  process.exit(1);
}

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
    const fileBuffer = fs.readFileSync(filePath);
    
    // Using Supabase REST API directly
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${file}`;
    
    try {
      const response = await fetch(uploadUrl, {
        method: 'POST', // Use PUT to overwrite, POST creates new
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': getContentType(file),
          'x-upsert': 'true' // Supabase specific header to overwrite
        },
        body: fileBuffer
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to upload ${file}: ${response.status} ${response.statusText} - ${errorText}`);
      } else {
        console.log(`Uploaded ${file} successfully.`);
      }
    } catch (err) {
      console.error(`Error uploading ${file}:`, err.message);
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
