// Communication functions
import { handleToolOptions } from '../functions/handleToolOptions';
import { verifyRequestToken } from '../utils/verifyJWT';

interface AIRequest {
	functionName: string;
	[key: string]: any;
}

const handler = async (request: any, response: any) => {
	if (request.method === 'OPTIONS') {
		return await handleToolOptions(response);
	}
	if (!verifyRequestToken(request)) {
		return response.status(401).json({ error: 'Unauthorized' });
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
				case 'ipaddresslookup': {
					const { IPAddressLookUp } = await import('../functions/ip/ip');
					return await IPAddressLookUp(request);
				}
				case 'locationresolver': {
					const { getLocationData } = await import('../functions/resolvers/location');
					return await getLocationData(request);
				}
				case 'getwebsitescreenshot': {
					const { getWebsiteScreenshot } = await import('../functions/screenshot/getWebsiteScreenshot');
					return await getWebsiteScreenshot(request);
				}
				case 'googlewebsearch': {
					const { searchGoogle } = await import('../functions/searchGoogle/googleWebSearch');
					return await searchGoogle(request);
				}
				case 'gettodaysweather': {
					const { fetchTodaysWeatherData } = await import('../functions/weather/todaysWeather');
					return await fetchTodaysWeatherData(request);
				}
				case 'getweeklyforecast': {
					const { fetchWeeklyWeatherData } = await import('../functions/weather/weeklyWeather');
					return await fetchWeeklyWeatherData(request);
				}
				case 'getextendedweather': {
					const { fetchExtendedWeather } = await import('../functions/weather/fetchExtendedWeather');
					return await fetchExtendedWeather(request);
				}
				case 'googleaddressresolver': {
					const { googleAddressResolver } = await import('../functions/resolvers/googleAddressResolver');
					return await googleAddressResolver(request);
				}
				case 'parsephonenumber': {
					const { parsePhoneNumberHandler } = await import('../functions/resolvers/phonenumber');
					return await parsePhoneNumberHandler(request);
				}
				case 'googleimagesearch': {
					const { googleImageSearch } = await import('../functions/searchGoogle/googleImageSearch');
					return await googleImageSearch(request);
				}
				case 'cloudinaryupload': {
					const { uploadToCloudinary } = await import('../functions/weather/uploaders/uploadToCloudinary');
					return await uploadToCloudinary(request);
				}
				case 'getislamicprayertimingsday': {
					const { getIslamicPrayerTimingsDay } = await import('../functions/islamicPrayerTimingsDay');
					return await getIslamicPrayerTimingsDay(request);
				}
				case 'getislamicprayertimingsweek': {
					const { getIslamicPrayerTimingsWeek } = await import('../functions/IslamicPrayerTimingsWeek');
					return await getIslamicPrayerTimingsWeek(request);
				}
				case 'getcurrentdatetime': {
					const { getCurrentDateTime } = await import('./getCurrentDateTime');
					return await getCurrentDateTime(request);
				}
				case 'sendtextmessage': {
					const { sendTextMessage } = await import('../functions/communication/sendTextMessage');
					return await sendTextMessage(request);
				}
				case 'sendwhatsappmessage': {
					const { sendWhatsAppMessage } = await import('../functions/communication/sendWhatsAppMessage');
					return await sendWhatsAppMessage(request as any);
				}
				case 'sendwhatsappvoicemessage': {
					const { sendWhatsAppVoiceMessage } = await import('../functions/communication/sendWhatsAppVoiceMessage');
					return await sendWhatsAppVoiceMessage(request as any);
				}
				case 'creategoogledocsfile': {
					const { createGoogleDocsFile } = await import('../functions/googleBusinessStuff/createGoogleSheetOrGoogleDoc');
					return await createGoogleDocsFile(request);
				}
				case 'creategooglesheetsfile': {
					const { createGoogleSheetsFile } = await import('../functions/googleBusinessStuff/createGoogleSheetOrGoogleDoc');
					return await createGoogleSheetsFile(request);
				}
				case 'updategoogledocsfile': {
					const { updateGoogleDocsFile } = await import('../functions/googleBusinessStuff/createGoogleSheetOrGoogleDoc');
					return await updateGoogleDocsFile(request);
				}
				case 'updategooglesheetsfile': {
					const { updateGoogleSheetsFile } = await import('../functions/googleBusinessStuff/createGoogleSheetOrGoogleDoc');
					return await updateGoogleSheetsFile(request);
				}
				case 'setgooglefilepermissions': {
					const { setGoogleFilePermissions } = await import('../functions/googleBusinessStuff/createGoogleSheetOrGoogleDoc');
					return await setGoogleFilePermissions(request);
				}
				case 'sendemail': {
					const { sendEmail } = await import('../functions/communication/sendEmail');
					return await sendEmail(request);
				}
				case 'texttoaudio': {
					const { textToAudioFile } = await import('../functions/communication/textToAudio');
					return await textToAudioFile(request);
				}
				case 'audiototextfile': {
					const { audioFileToText } = await import('../functions/communication/audioToTextFile');
					return await audioFileToText(request);
				}
				case 'viewanddescribewhatsappimage': {
					const { viewAndDescribeWhatsAppImage } = await import('../functions/communication/viewAndDescribeWhatsAppImage');
					return await viewAndDescribeWhatsAppImage(request);
				}
				case 'listentowhatsappvoiceaudio': {
					const { listenToWhatsAppVoiceAudio } = await import('../functions/communication/listenToWhatsAppVoiceAudio');
					return await listenToWhatsAppVoiceAudio(request);
				}
				case 'markwhatsappmessageread': {
					const { markWhatsAppMessageRead } = await import('../functions/communication/markWhatsAppMessageRead');
					return await markWhatsAppMessageRead(request);
				}
				case 'sendwhatsapplocation': {
					const { sendWhatsAppLocation } = await import('../functions/communication/sendWhatsAppLocation');
					return await sendWhatsAppLocation(request);
				}
				case 'requestwhatsapplocation': {
					const { requestWhatsAppLocation } = await import('../functions/communication/requestWhatsAppLocation');
					return await requestWhatsAppLocation(request);
				}

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
