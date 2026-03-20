import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "../../public/uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `img-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|webp|gif|svg)$/i;
    if (allowed.test(file.originalname) && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Seuls les fichiers image sont acceptés (jpg, png, webp, gif, svg)"));
    }
  },
});

router.post("/", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded", message: "Aucun fichier reçu." });
    }

    const host = req.get("host") || "localhost:8080";
    const protocol = req.get("x-forwarded-proto") || req.protocol || "http";
    const baseUrl = `${protocol}://${host}`;
    const url = `${baseUrl}/uploads/${req.file.filename}`;

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

router.delete("/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    if (filename.includes("..") || filename.includes("/")) {
      return res.status(400).json({ error: "Invalid filename" });
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
