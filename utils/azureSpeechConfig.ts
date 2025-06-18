import { SpeechConfig } from 'microsoft-cognitiveservices-speech-sdk';

// Environment variables are validated on application start

export const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
export const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION;

if (!AZURE_SPEECH_KEY) {
	throw new Error('AZURE_SPEECH_KEY is not defined in environment variables.');
}

if (!AZURE_SPEECH_REGION) {
	throw new Error('AZURE_SPEECH_REGION is not defined in environment variables.');
}

const speechConfig = SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION);

export { speechConfig };
