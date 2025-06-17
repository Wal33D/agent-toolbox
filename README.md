# 🌟 AI Serverless Toolbelt 🌟

Welcome to the AI Serverless Toolbelt, a collection of single-purpose functions designed for various AI tasks and utilities. This toolbelt empowers an AI to perform real-world tasks, look up information, upload/download data, manipulate content, and alert a human user in real-time. The project provides a serverless environment to perform tasks such as IP address lookup, weather forecasting, Google search, and more.

## 🚀 Usage

To use these tools, send a POST request to `tool.aquataze.com/belt` with the `functionName` of the tool you want to use.

For a complete list of available tools and their descriptions, visit the [homepage](https://tool.aquataze.com/).

## 🔐 JWT Authentication

All API calls require an `Authorization` header containing a valid JWT. Tokens can be generated using the helper `getToken()` which relies on the `TRUSTED_API_KEY_1` and `TRUSTED_API_KEY_2` environment variables. Incoming tokens are verified using the `JWT_SECRET` environment variable.

```bash
Authorization: Bearer <your-jwt-token>
```


## 🔧 Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your keys.
3. Build the TypeScript project:
   ```bash
   npm run build
   ```
4. Start a local development server (requires the [Vercel CLI](https://vercel.com/docs/cli)):
   ```bash
   npx vercel dev
   ```
5. Run the test suite:
   ```bash
   npm test
   ```


## 🌱 Environment Variables

The project relies on several environment variables. Below is a list of all of them along with a short description of what each one controls:

- `OPENAI_API_KEY` – token used to call the OpenAI API.
- `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `DB_CLUSTER` – MongoDB connection details.
- `GDRIVE_SERVICE_ACCOUNT_JSON` – JSON credentials for the Google Drive service account.
- `TRUSTED_API_KEY_1`, `TRUSTED_API_KEY_2` – secrets used to sign and verify JWT tokens.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` – Cloudinary configuration for uploading media (screenshots, audio, etc.).
- `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` – Azure Speech service credentials for text‑to‑speech features.
- `WHATSAPP_GRAPH_API_TOKEN`, `WHATSAPP_GRAPH_API_URL`, `WHATSAPP_ASSISTANT_PHONE_NUMBER` – credentials and configuration for the WhatsApp Business API.
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_ASSISTANT_PHONE_NUMBER` – Twilio credentials for sending SMS messages.
- `GMAIL_MAILER_ASSISTANT_NAME` – display name used when sending email via Gmail.
- `GOOGLE_API_KEY` – API key used for geocoding and Google search utilities.
- `OPEN_WEATHER_API_KEY` – OpenWeatherMap API key used for location and weather lookups.
- `JWT_SECRET`


## 🛠 Major Functions

### IPAddressLookUp
Example request:
```json
{
  "functionName": "IPAddressLookUp",
  "ip": "8.8.8.8"
}
```
Expected response (truncated):
```json
{
  "ip": "8.8.8.8",
  "city": "Mountain View",
  "country": "United States",
  "description": "IP 8.8.8.8 is located in ..."
}
```

### googleWebSearch
Example request:
```json
{
  "functionName": "googleWebSearch",
  "searchTerm": "vercel"
}
```
Expected response:
```json
{
  "status": true,
  "data": {
    "searchQuery": "vercel",
    "organic_results": [ ... ]
  }
}
```

### getTodaysWeather
Example request:
```json
{
  "functionName": "getTodaysWeather",
  "city": "Austin",
  "state": "TX"
}
```
Expected response (truncated):
```json
{
  "location": "Austin, TX, US",
  "currentWeather": {
    "datetime": "...",
    "temp": 25
  }
}
```

### getWebsiteScreenshot
Example request:
```json
{
  "functionName": "getWebsiteScreenshot",
  "url": "https://example.com"
}
```
Expected response:
```json
{
  "status": true,
  "url": "https://example.com",
  "screenshotUrl": {
    "downloadUrl": "...",
    "webViewLink": "...",
    "mimeType": "image/png"
  }
}
```

### sendTextMessage
Example request:
```json
{
  "functionName": "sendTextMessage",
  "to": "+1234567890",
  "body": "Hello!"
}
```
Expected response:
```json
{
  "success": true,
  "platform": "twilio",
  "type": "text",
  "to": "+1234567890",
  "from": "<your Twilio number>",
  "msgId": "...",
  "duration": "250 ms",
  "timestamp": "..."
}
```

### createGoogleDocsFile
Example request:
```json
{
  "functionName": "createGoogleDocsFile",
  "title": "MyDoc",
  "content": "Hello world"
}
```
Expected response:
```json
{
  "status": true,
  "fileId": "1Abc...",
  "fileLink": "https://docs.google.com/document/d/1Abc.../edit",
  "message": "Google Docs file created and updated with content successfully."
}
```
## 📄 License

This project is licensed under the MIT License.

## 👤 Author

-   **Wal33D** - [GitHub](https://github.com/Wal33D)

Check out the code on GitHub: [https://github.com/Wal33D/toolbelt.git](https://github.com/Wal33D/toolbelt.git)

---

**Note:** 🔐 Requests require JWT token verification and are intended for personal use by Wal33D.
