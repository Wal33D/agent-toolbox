import { GmailMailer } from 'gmail-node-mailer';
import { SpeechSynthesizer } from 'microsoft-cognitiveservices-speech-sdk';

declare global {
    var gmailClient: GmailMailer | undefined;
    var speechSynthesizer: SpeechSynthesizer | undefined;
}

export {};
