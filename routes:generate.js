const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { transcript, template } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    const prompt = `Based on the following meeting transcript, generate meeting minutes following this template structure:

Template:
${template || getDefaultTemplate()}

Meeting Transcript:
${transcript}

Please generate comprehensive meeting minutes in Chinese that follows the template structure above. Include all key points, decisions, and action items.`;

    const response = await axios.post(
      'https://hnd1.aihub.zeabur.ai/v1/chat/completions',
      {
        model: 'claude-3-5-sonnet',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.AIHUB_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const minutes = response.data.choices[0].message.content;

    res.json({ minutes });
  } catch (error) {
    console.error('Generation error:', error.message);
    res.status(500).json({ error: 'Generation failed' });
  }
});

function getDefaultTemplate() {
  return `
基本信息
- 會議日期：
- 會議時間：
- 參與人員：
- 會議主題：

重點執行摘要
- 主要決策：
- 關鍵成果：

詳盡會議紀錄
- 議題 1：
- 議題 2：
- 議題 3：

行動項
- 行動項 1：負責人、截止日期
- 行動項 2：負責人、截止日期

下次會議
- 時間：
- 主題：
`;
}

module.exports = router;
