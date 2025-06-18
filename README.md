# Agent Toolbox

This repository provides a collection of serverless utilities designed for AI-driven tasks. The project includes REST endpoints for gathering information, communicating via email or WhatsApp, handling Google Drive files, and much more.

## Project Purpose

Agent Toolbox exposes a set of serverless APIs for tasks such as location lookup, Google searches, capturing website screenshots, weather data retrieval, and communication integrations. It is optimized for deployment on [Vercel](https://vercel.com) and can be used in other serverless environments.

## Directory Structure

```
api/                 Vercel API routes that route requests to the functions
functions/           Core serverless functions
functions/unitConversion/  Utility APIs for unit conversions (length, weight, etc.)
public/              Static assets served by Vercel
utils/               Helper modules shared by the functions
types/               TypeScript type declarations
```

Each entry point in `api/` proxies to a handler from the `functions` directory via `toolsHandler.ts`. The `vercel.json` file configures these routes for deployment.

## Serverless Functions

Below is a summary of the main functions exposed through `toolsHandler.ts`:

- **IPAddressLookUp** – Resolves IP address information and caches results in MongoDB.
- **getWebsiteScreenshot** – Uses Puppeteer to capture screenshots of websites and uploads them to Google Drive.
- **googleImageSearch** – Performs Google image searches using the Scale SERP API.
- **searchGoogle** – Performs Google web searches via Scale SERP.
- **fetchTodaysWeatherData / fetchWeeklyWeatherData / fetchExtendedWeather** – Retrieve weather information.
- **getIslamicPrayerTimingsDay / getIslamicPrayerTimingsWeek** – Provide Islamic prayer times.
- **Communication utilities** – Send emails, SMS messages, WhatsApp messages, and audio conversions.

Other helpers in `functions/unitConversion/` handle unit conversions (length, weight, temperature, etc.).

## Environment Variables

Create a `.env` file using `.env.example` as a reference. Required variables include:

- `OPENAI_API_KEY` – API key for OpenAI services
- `OPEN_WEATHER_API_KEY` – Key for OpenWeather
- `VISUAL_CROSSING_WEATHER_API_KEY` – Key for Visual Crossing weather
- MongoDB credentials: `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `DB_CLUSTER`
- `GDRIVE_SERVICE_ACCOUNT_JSON` – Google Drive service account JSON
- `TRUSTED_API_KEY` – Shared API key for protected routes
- `JWT_SECRET` – Secret used for JWT verification
- Cloudinary credentials: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Azure speech: `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`
- WhatsApp integration: `WHATSAPP_GRAPH_API_TOKEN`, `WHATSAPP_GRAPH_API_URL`, `WHATSAPP_PHONE_ID`, `WHATSAPP_ASSISTANT_PHONE_NUMBER`
- Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_ASSISTANT_PHONE_NUMBER`
- `GMAIL_MAILER_ASSISTANT_NAME` – Sender name for Gmail
- `GOOGLE_API_KEY` – Key for Google APIs
- `SCALE_SERP_API_KEY` – API key for Scale SERP web search

## Building and Deploying to Vercel

1. Install dependencies with `npm install`.
2. Build the TypeScript sources:

   ```bash
   npm run build
   ```

3. Deploy to Vercel using the Vercel CLI:

   ```bash
   npx vercel --prod
   ```

   Vercel reads `vercel.json` to configure functions and rewrites.

## Testing

Tests run with [Jest](https://jestjs.io/). After installing dependencies, run:

```bash
npm test
```

This executes the Jest test suite defined in the project.

## License

MIT
