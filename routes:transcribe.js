const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioPath = req.file.path;
    const audioBuffer = fs.readFileSync(audioPath);
    const base64Audio = audioBuffer.toString('base64');

    const response = await axios.post(
      'https://hnd1.aihub.zeabur.ai/v1/audio/transcriptions',
      {
        model: 'whisper-1',
        audio: base64Audio,
        language: 'zh'
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.AIHUB_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Delete the uploaded file
    fs.unlinkSync(audioPath);

    res.json({
      text: response.data.text,
      duration: req.body.duration || 0
    });
  } catch (error) {
    console.error('Transcription error:', error.message);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Transcription failed' });
  }
});

module.exports = router;
