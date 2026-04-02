import { Router } from "express";
import { WILAYAS, COMMUNES } from "../data/wilayas.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json(WILAYAS);
});

router.get("/:wilayaCode/communes", (req, res) => {
  const { wilayaCode } = req.params;
  const communes = COMMUNES[wilayaCode];

  if (!communes) {
    const wilaya = WILAYAS.find(w => w.code === wilayaCode);
    if (!wilaya) {
      res.status(404).json({ error: "Not found", message: "Wilaya not found" });
      return;
    }
    res.json([]);
    return;
  }

  res.json(communes);
});

export default router;
