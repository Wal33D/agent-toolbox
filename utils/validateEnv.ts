export function validateEnv(): void {
	const rules: Record<string, RegExp | ((v: string) => boolean)> = {
		OPENAI_API_KEY: /.+/,
		OPEN_WEATHER_API_KEY: /.+/,
		VISUAL_CROSSING_WEATHER_API_KEY: /.+/,
		DB_USERNAME: /.+/,
		DB_PASSWORD: /.+/,
		DB_NAME: /.+/,
		DB_CLUSTER: /.+/,
		GDRIVE_SERVICE_ACCOUNT_JSON: (v: string) => {
			try {
				JSON.parse(v);
				return true;
			} catch {
				return false;
			}
		},
		TRUSTED_API_KEY: /.+/,
		JWT_SECRET: /.+/,
		CLOUDINARY_CLOUD_NAME: /.+/,
		CLOUDINARY_API_KEY: /.+/,
		CLOUDINARY_API_SECRET: /.+/,
		AZURE_SPEECH_KEY: /.+/,
		AZURE_SPEECH_REGION: /.+/,
               WHATSAPP_GRAPH_API_TOKEN: /.+/,
               WHATSAPP_GRAPH_API_URL: /^https?:\/\/.+/,
               WHATSAPP_PHONE_ID: /\d+/,
               WHATSAPP_ASSISTANT_PHONE_NUMBER: /^\+\d{6,}/,
		TWILIO_ACCOUNT_SID: /.+/,
		TWILIO_AUTH_TOKEN: /.+/,
		TWILIO_ASSISTANT_PHONE_NUMBER: /^\+\d{6,}/,
		GMAIL_MAILER_ASSISTANT_NAME: /.+/,
		GOOGLE_API_KEY: /.+/,
		SCALE_SERP_API_KEY: /.+/,
	};
	for (const [key, rule] of Object.entries(rules)) {
		const value = process.env[key];
		if (!value) {
			throw new Error(`Missing environment variable: ${key}`);
		}
		if (rule instanceof RegExp && !rule.test(value)) {
			throw new Error(`Invalid format for environment variable: ${key}`);
		}
		if (typeof rule === 'function' && !rule(value)) {
			throw new Error(`Invalid format for environment variable: ${key}`);
		}
	}
}
