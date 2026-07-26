# Tasky Proxy

One-route Express server that receives a dictated transcript from the app and
asks OpenAI to split it into individual tasks. Keeps the OpenAI API key off
the device.

## Local

```bash
cd tasky-proxy
npm install
cp .env.example .env   # then paste your real OPENAI_API_KEY
npm start
```

Server runs on `http://localhost:4000`. Test it:

```bash
curl -X POST http://localhost:4000/parse-tasks \
  -H "Content-Type: application/json" \
  -d '{"transcript":"Buy provisions and call mom"}'
```

Then point the app at it: in `app/config.ts` set
`TASK_PARSER_URL = 'http://localhost:4000'` — but note the RN app on a
physical device/emulator can't reach `localhost` on your machine directly.
Use your machine's LAN IP (e.g. `http://192.168.1.23:4000`) for local device
testing, or deploy (below) and skip that problem entirely.

## Deploy to Render

1. Push this `tasky-proxy` folder to its own GitHub repo (or a subfolder of
   one, setting Render's "Root Directory" accordingly).
2. On Render: New → Web Service → connect the repo.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variable `OPENAI_API_KEY` in the Render dashboard (never
   commit it).
6. Once deployed, copy the Render URL (e.g.
   `https://tasky-proxy.onrender.com`) into `app/config.ts` as
   `TASK_PARSER_URL` in the RN app.

Render free-tier services sleep after inactivity, so the first request after
idle time can take ~30s to wake up — worth knowing if the voice flow feels
slow during grading/demoing.
# tesky-gpt
