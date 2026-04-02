import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "../../public/uploads");

const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

const useCloudinary = !!(cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret);

let storage: multer.StorageEngine;

if (useCloudinary) {
  cloudinary.config({
    cloud_name: cloudinaryCloudName,
    api_key: cloudinaryApiKey,
    api_secret: cloudinaryApiSecret,
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "amiri-phone",
      resource_type: "auto",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "svg", "mp4", "webm"],
    } as any,
  });
} else {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname).toLowerCase();
      const prefix = file.mimetype.startsWith("video/") ? "vid" : "img";
      cb(null, `${prefix}-${unique}${ext}`);
    },
  });
}

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    const allowedExt = /\.(jpg|jpeg|png|webp|gif|svg|mp4|webm)$/i;
    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");
    
    if (allowedExt.test(file.originalname) && (isImage || isVideo)) {
      cb(null, true);
    } else {
      cb(new Error("Seuls les fichiers image (jpg, png...) et vidéo (mp4, webm) sont acceptés."));
    }
  },
});

router.post("/", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded", message: "Aucun fichier reçu." });
      return;
    }

    if (useCloudinary) {
      const fileUrl = (req.file as any).path || (req.file as any).secure_url;
      res.json({
        success: true,
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size,
      });
      return;
    }

    // Return relative URL for better proxy/host compatibility
    const url = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      url,
      filename: req.file.filename,
      size: req.file.size,
    });
  } catch (err: any) {
    res.status(400).json({ error: "Upload failed", message: err.message });
  }
});

router.delete("/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;
    
    if (useCloudinary) {
      // Simple fallback for Cloudinary deletion (assuming filename maps to public_id in the folder vaguely, or just skipping error)
      try {
        await cloudinary.uploader.destroy(`amiri-phone/${filename.split(".")[0]}`);
      } catch (e) {
        // Ignored
      }
      res.json({ success: true });
      return;
    }

    if (filename.includes("..") || filename.includes("/")) {
      res.status(400).json({ error: "Invalid filename" });
      return;
    }
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: "Delete failed", message: err.message });
  }
});

export default router;
