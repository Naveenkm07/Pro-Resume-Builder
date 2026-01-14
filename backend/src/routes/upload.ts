import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import axios from "axios";
import { z } from "zod";

const router = Router();

const uploadsDir = path.join(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    fs.mkdirSync(uploadsDir, { recursive: true });
    cb(null, uploadsDir);
  },
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({ storage });

const fileSchema = z.object({
  mimetype: z.enum([
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]),
});

router.post("/upload", upload.single("resume"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "File is required under key 'resume'." });
  }

  const validation = fileSchema.safeParse({ mimetype: file.mimetype });
  if (!validation.success) {
    // clean up saved invalid file
    try {
      fs.unlinkSync(file.path);
    } catch {
      // ignore
    }
    return res.status(400).json({ error: "Invalid file type. Only PDF or DOCX allowed." });
  }

  try {
    const parserUrl = process.env.PARSER_SERVICE_URL || "http://localhost:8000";
    const parseResponse = await axios.post(`${parserUrl}/parse`, {
      filepath: file.path,
    });
    return res.json(parseResponse.data);
  } catch (err) {
    console.error("Parse service error:", err);
    return res.status(500).json({ error: "Failed to parse resume." });
  }
});

export default router;


