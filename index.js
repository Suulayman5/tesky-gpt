import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You split a dictated to-do list transcript into individual tasks.
Rules:
- Return ONLY valid JSON: { "tasks": [{ "title": string, "description"?: string }] }
- Each task title should be short and action-oriented (e.g. "Buy provisions", "Call mom").
- If the transcript only contains one task, return an array with one item.
- If the transcript is empty, unclear, or not task-like, return { "tasks": [] }.
- Do not invent tasks that weren't said.`;

app.post('/parse-tasks', async (req, res) => {
  const { transcript } = req.body ?? {};

  if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
    return res.status(400).json({ error: 'transcript is required' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: transcript },
      ],
      response_format: { type: 'json_object' },
      temperature: 0,
    });

    const raw = completion.choices[0]?.message?.content ?? '{"tasks":[]}';
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed.tasks)) {
      return res.json({ tasks: [] });
    }

    return res.json({ tasks: parsed.tasks });
  } catch (error) {
    console.error('parse-tasks error:', error);
    return res.status(500).json({ error: 'Failed to parse transcript' });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Tasky proxy listening on port ${PORT}`));
