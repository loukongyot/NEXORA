# NEXORA Google Workspace Setup

NEXORA can read Google Workspace summary data through a free Google Apps Script Web App API. This does not use Google OAuth yet.

## 1. Create Apps Script Project

1. Go to https://script.google.com.
2. Create a new project.
3. Open [google-apps-script/nexora-api.gs](google-apps-script/nexora-api.gs).
4. Paste the full file into Apps Script.
5. Replace these constants:

```js
const SHEET_ID = 'PASTE_GOOGLE_SHEET_ID_HERE';
const SHEET_NAME = 'Daily Report';
const OUTPUT_FOLDER_ID = 'PASTE_OUTPUT_FOLDER_ID_HERE';
```

## 2. Deploy As Web App

1. Click Deploy.
2. Choose New deployment.
3. Select Web app.
4. Execute as: Me.
5. Who has access: Anyone with the link.
6. Deploy and copy the Web App URL.

## 3. Add URL To Local NEXORA

Create or update `.env.local` in the NEXORA project root:

```bash
VITE_GOOGLE_WORKSPACE_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Restart the Vite dev server after changing env values.

If this value is missing, NEXORA shows:

```text
ยังไม่ได้เชื่อมต่อ
```

## 4. Add Environment Variable In Vercel

1. Open the Vercel project.
2. Go to Settings.
3. Open Environment Variables.
4. Add:

```bash
VITE_GOOGLE_WORKSPACE_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

5. Redeploy the project.

## 5. Expected JSON Response

The Apps Script Web App should return:

```json
{
  "status": "ok",
  "updatedAt": "2026-05-26T00:00:00.000Z",
  "formResponsesToday": 0,
  "latestReportTotal": 0,
  "outputFileCount": 0,
  "latestUpdates": []
}
```

Example:

```json
{
  "status": "ok",
  "updatedAt": "2026-05-26T08:30:00.000Z",
  "formResponsesToday": 12,
  "latestReportTotal": 48,
  "outputFileCount": 7,
  "latestUpdates": [
    "Daily Report: 48 records",
    "Output files: 7"
  ]
}
```

## 6. Current NEXORA Behavior

- Dashboard shows `ข้อมูลจาก Google Workspace`.
- Settings includes `Test Google Connection`.
- Missing URL, loading, errors, and empty data are handled safely.
- No Google OAuth is used yet.
- No paid services are required.
- Supabase sync and localStorage fallback continue working normally.

