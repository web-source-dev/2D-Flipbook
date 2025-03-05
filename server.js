import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import Flipbook from './models/Flipbook.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flipbookpdf')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

app.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const filename = req.file.filename;
    const url = `/uploads/${filename}`;

    const flipbook = new Flipbook({
      name,
      description,
      filename,
      url
    });

    await flipbook.save();
    res.json({ filePath: url, flipbook });
  } catch (error) {
    res.status(500).json({ error: 'Error saving flipbook' });
  }
});

app.get('/flipbooks', async (req, res) => {
  try {
    const flipbooks = await Flipbook.find().sort({ createdAt: -1 });
    res.json(flipbooks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flipbooks' });
  }
});

app.get('/flipbooks/:id', async (req, res) => {
  try {
    const flipbook = await Flipbook.findById(req.params.id);
    if (!flipbook) {
      return res.status(404).json({ error: 'Flipbook not found' });
    }
    res.json(flipbook);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flipbook' });
  }
});

app.use('/uploads', express.static(join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});