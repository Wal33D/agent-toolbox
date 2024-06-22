import { sendEmail } from '../functions/communication/sendEmail';
import { searchGoogle } from '../functions/searchGoogle/googleWebSearch';
import { getLocationData } from '../functions/resolvers/location';
import { sendTextMessage } from '../functions/communication/sendTextMessage';
import { IPAddressLookUp } from '../functions/ip/ip';
import { handleToolOptions } from '../functions/handleToolOptions';
import { googleImageSearch } from '../functions/searchGoogle/googleImageSearch';
import { getCurrentDateTime } from './getCurrentDateTime';
import { uploadToCloudinary } from '../functions/weather/uploaders/uploadToCloudinary';
import { sendWhatsAppMessage } from '../functions/communication/sendWhatsAppMessage';
import { fetchExtendedWeather } from '../functions/weather/fetchExtendedWeather';
import { getWebsiteScreenshot } from '../functions/screenshot/getWebsiteScreenshot';
import { googleAddressResolver } from '../functions/resolvers/googleAddressResolver';
import { fetchWeeklyWeatherData } from '../functions/weather/weeklyWeather';
import { fetchTodaysWeatherData } from '../functions/weather/todaysWeather';
import { parsePhoneNumberHandler } from '../functions/resolvers/phonenumber';
import { getIslamicPrayerTimingsDay } from '../functions/islamicPrayerTimingsDay';
import { getIslamicPrayerTimingsWeek } from '../functions/IslamicPrayerTimingsWeek';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { textToAudioFile } from '../functions/communication/textToAudio';
import {
	createGoogleDocsFile,
	createGoogleSheetsFile,
	updateGoogleDocsFile,
	updateGoogleSheetsFile,
	setGoogleFilePermissions,
} from '../functions/googleBusinessStuff/createGoogleSheetOrGoogleDoc';
import { audioFileToText } from '../functions/communication/audioToTextFile';
import { textToAudioFileOpenai } from '../functions/communication/textToSpeechOpenAi';
import { sendWhatsAppVoiceMessage } from '../functions/communication/sendWhatsAppVoiceMessage';

const handler = async (request: VercelRequest, response: VercelResponse) => {
	if (request.method === 'OPTIONS') {
		return await handleToolOptions(response);
	}
	try {
		let functionName: string | null = null;

		if (request.method === 'POST') {
			const body = request.body;
			functionName = body.functionName ? body.functionName.toLowerCase() : null;
		} else {
			throw new Error('Invalid request method');
		}

		const processRequest = async (request: VercelRequest) => {
			console.log({ functionName, request: request.body });
			switch (functionName) {
				case 'ipaddresslookup':
					return await IPAddressLookUp(request);
				case 'locationresolver':
					return await getLocationData(request);
				case 'getwebsitescreenshot':
					return await getWebsiteScreenshot(request);
				case 'googlewebsearch':
					return await searchGoogle(request);
				case 'gettodaysweather':
					return await fetchTodaysWeatherData(request);
				case 'getweeklyforecast':
					return await fetchWeeklyWeatherData(request);
				case 'getextendedweather':
					return await fetchExtendedWeather(request);
				case 'googleaddressresolver':
					return await googleAddressResolver(request);
				case 'parsephonenumber':
					return await parsePhoneNumberHandler(request);
				case 'googleimagesearch':
					return await googleImageSearch(request);
				case 'cloudinaryupload':
					return await uploadToCloudinary(request);
				case 'getislamicprayertimingsday':
					return await getIslamicPrayerTimingsDay(request);
				case 'getislamicprayertimingsweek':
					return await getIslamicPrayerTimingsWeek(request);
				case 'getcurrentdatetime':
					return await getCurrentDateTime(request);
				case 'sendtextmessage':
					return await sendTextMessage(request);
				case 'sendwhatsappmessage':
					return await sendWhatsAppMessage(request as any);
				case 'sendwhatsappvoicemessage':
					return await sendWhatsAppVoiceMessage(request as any);
				case 'creategoogledocsfile':
					return await createGoogleDocsFile(request);
				case 'creategooglesheetsfile':
					return await createGoogleSheetsFile(request);
				case 'updategoogledocsfile':
					return await updateGoogleDocsFile(request);
				case 'updategooglesheetsfile':
					return await updateGoogleSheetsFile(request);
				case 'setgooglefilepermissions':
					return await setGoogleFilePermissions(request);
				case 'sendemail':
					return await sendEmail(request);
				case 'texttoaudio':
					return await textToAudioFile(request);
				case 'texttoaudioopenai':
					return await textToAudioFileOpenai(request);
				case 'audiototextfile':
					return await audioFileToText(request);

				default:
					throw new Error('Invalid function name.');
			}
		};

		const responseData = await processRequest(request);
		response.status(200).json(responseData);
	} catch (error: any) {
		response.status(400).json({ error: error.message });
	}
};

export default handler;
