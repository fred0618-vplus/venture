const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { recipients, subject, content, attachmentPath } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'Recipients are required' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: recipients.join(','),
      subject: subject || '會議記錄',
      html: content || '<p>會議記錄已生成</p>'
    };

    if (attachmentPath) {
      mailOptions.attachments = [
        {
          filename: 'meeting-minutes.docx',
          path: attachmentPath
        }
      ];
    }

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email error:', error.message);
    res.status(500).json({ error: 'Email sending failed' });
  }
});

module.exports = router;
