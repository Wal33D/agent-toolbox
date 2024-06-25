// Communication functions
import { sendEmail } from '../functions/communication/sendEmail';
import { sendTextMessage } from '../functions/communication/sendTextMessage';
import { textToAudioFile } from '../functions/communication/textToAudio';
import { audioFileToText } from '../functions/communication/audioToTextFile';
import { sendWhatsAppMessage } from '../functions/communication/sendWhatsAppMessage';
import { sendWhatsAppVoiceMessage } from '../functions/communication/sendWhatsAppVoiceMessage';
import { listenToWhatsAppVoiceAudio } from '../functions/communication/listenToWhatsAppVoiceAudio';
import { viewAndDescribeWhatsAppImage } from '../functions/communication/viewAndDescribeWhatsAppImage';

// Google search functions
import { searchGoogle } from '../functions/searchGoogle/googleWebSearch';
import { googleImageSearch } from '../functions/searchGoogle/googleImageSearch';

// Location resolvers
import { IPAddressLookUp } from '../functions/ip/ip';
import { getLocationData } from '../functions/resolvers/location';
import { googleAddressResolver } from '../functions/resolvers/googleAddressResolver';
import { parsePhoneNumberHandler } from '../functions/resolvers/phonenumber';

// Tool handling
import { handleToolOptions } from '../functions/handleToolOptions';

// Weather functions
import { uploadToCloudinary } from '../functions/weather/uploaders/uploadToCloudinary';
import { fetchExtendedWeather } from '../functions/weather/fetchExtendedWeather';
import { fetchWeeklyWeatherData } from '../functions/weather/weeklyWeather';
import { fetchTodaysWeatherData } from '../functions/weather/todaysWeather';

// Screenshot functions
import { getWebsiteScreenshot } from '../functions/screenshot/getWebsiteScreenshot';

// Islamic prayer timings
import { getIslamicPrayerTimingsDay } from '../functions/islamicPrayerTimingsDay';
import { getIslamicPrayerTimingsWeek } from '../functions/IslamicPrayerTimingsWeek';

// Google business functions
import {
	createGoogleDocsFile,
	updateGoogleDocsFile,
	updateGoogleSheetsFile,
	createGoogleSheetsFile,
	setGoogleFilePermissions,
} from '../functions/googleBusinessStuff/createGoogleSheetOrGoogleDoc';

// Utility functions
import { getCurrentDateTime } from './getCurrentDateTime';
import { markWhatsAppMessageRead } from '../functions/communication/markWhatsAppMessageRead';
import { sendWhatsAppLocation } from '../functions/communication/sendWhatsAppLocation';
import { requestWhatsAppLocation } from '../functions/communication/requestWhatsAppLocation';

interface AIRequest {
	functionName: string;
	[key: string]: any;
}

const handler = async (request: any, response: any) => {
	if (request.method === 'OPTIONS') {
		return await handleToolOptions(response);
	}
	try {
		let functionName: string | null = null;

		if (request.method === 'POST') {
			const body: AIRequest = request.body;
			functionName = body.functionName ? body.functionName.toLowerCase() : null;
		} else {
			throw new Error('Invalid request method');
		}

		const processRequest = async (request: any) => {
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
				case 'audiototextfile':
					return await audioFileToText(request);
				case 'viewanddescribewhatsappimage':
					return await viewAndDescribeWhatsAppImage(request);
				case 'listentowhatsappvoiceaudio':
					return await listenToWhatsAppVoiceAudio(request);
				case 'markwhatsappmessageread':
					return await markWhatsAppMessageRead(request);
				case 'sendwhatsapplocation':
					return await sendWhatsAppLocation(request);
				case 'requestwhatsapplocation':
					return await requestWhatsAppLocation(request);

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
