export type ToolHandler = (req: any) => Promise<any>;

export const toolsMap: Record<string, ToolHandler> = {
  ipaddresslookup: async (req) => {
    const { IPAddressLookUp } = await import('../functions/ip/ip');
    return IPAddressLookUp(req);
  },
  locationresolver: async (req) => {
    const { getLocationData } = await import('../functions/resolvers/location');
    return getLocationData(req);
  },
  getwebsitescreenshot: async (req) => {
    const { getWebsiteScreenshot } = await import('../functions/screenshot/getWebsiteScreenshot');
    return getWebsiteScreenshot(req);
  },
  googlewebsearch: async (req) => {
    const { searchGoogle } = await import('../functions/searchGoogle/googleWebSearch');
    return searchGoogle(req);
  },
  gettodaysweather: async (req) => {
    const { fetchTodaysWeatherData } = await import('../functions/weather/todaysWeather');
    return fetchTodaysWeatherData(req);
  },
  getweeklyforecast: async (req) => {
    const { fetchWeeklyWeatherData } = await import('../functions/weather/weeklyWeather');
    return fetchWeeklyWeatherData(req);
  },
  getextendedweather: async (req) => {
    const { fetchExtendedWeather } = await import('../functions/weather/fetchExtendedWeather');
    return fetchExtendedWeather(req);
  },
  googleaddressresolver: async (req) => {
    const { googleAddressResolver } = await import('../functions/resolvers/googleAddressResolver');
    return googleAddressResolver(req);
  },
  parsephonenumber: async (req) => {
    const { parsePhoneNumberHandler } = await import('../functions/resolvers/phonenumber');
    return parsePhoneNumberHandler(req);
  },
  googleimagesearch: async (req) => {
    const { googleImageSearch } = await import('../functions/searchGoogle/googleImageSearch');
    return googleImageSearch(req);
  },
  cloudinaryupload: async (req) => {
    const { uploadToCloudinary } = await import('../functions/weather/uploaders/uploadToCloudinary');
    return uploadToCloudinary(req);
  },
  getislamicprayertimingsday: async (req) => {
    const { getIslamicPrayerTimingsDay } = await import('../functions/islamicPrayerTimingsDay');
    return getIslamicPrayerTimingsDay(req);
  },
  getislamicprayertimingsweek: async (req) => {
    const { getIslamicPrayerTimingsWeek } = await import('../functions/IslamicPrayerTimingsWeek');
    return getIslamicPrayerTimingsWeek(req);
  },
  getcurrentdatetime: async (req) => {
    const { getCurrentDateTime } = await import('./getCurrentDateTime');
    return getCurrentDateTime(req);
  },
  sendtextmessage: async (req) => {
    const { sendTextMessage } = await import('../functions/communication/sendTextMessage');
    return sendTextMessage(req);
  },
  sendwhatsappmessage: async (req) => {
    const { sendWhatsAppMessage } = await import('../functions/communication/sendWhatsAppMessage');
    return sendWhatsAppMessage(req as any);
  },
  sendwhatsappvoicemessage: async (req) => {
    const { sendWhatsAppVoiceMessage } = await import('../functions/communication/sendWhatsAppVoiceMessage');
    return sendWhatsAppVoiceMessage(req as any);
  },
  creategoogledocsfile: async (req) => {
    const { createGoogleDocsFile } = await import('../functions/googleBusinessStuff/createGoogleSheetOrGoogleDoc');
    return createGoogleDocsFile(req);
  },
  creategooglesheetsfile: async (req) => {
    const { createGoogleSheetsFile } = await import('../functions/googleBusinessStuff/createGoogleSheetOrGoogleDoc');
    return createGoogleSheetsFile(req);
  },
  updategoogledocsfile: async (req) => {
    const { updateGoogleDocsFile } = await import('../functions/googleBusinessStuff/createGoogleSheetOrGoogleDoc');
    return updateGoogleDocsFile(req);
  },
  updategooglesheetsfile: async (req) => {
    const { updateGoogleSheetsFile } = await import('../functions/googleBusinessStuff/createGoogleSheetOrGoogleDoc');
    return updateGoogleSheetsFile(req);
  },
  setgooglefilepermissions: async (req) => {
    const { setGoogleFilePermissions } = await import('../functions/googleBusinessStuff/createGoogleSheetOrGoogleDoc');
    return setGoogleFilePermissions(req);
  },
  sendemail: async (req) => {
    const { sendEmail } = await import('../functions/communication/sendEmail');
    return sendEmail(req);
  },
  texttoaudio: async (req) => {
    const { textToAudioFile } = await import('../functions/communication/textToAudio');
    return textToAudioFile(req);
  },
  audiototextfile: async (req) => {
    const { audioFileToText } = await import('../functions/communication/audioToTextFile');
    return audioFileToText(req);
  },
  viewanddescribewhatsappimage: async (req) => {
    const { viewAndDescribeWhatsAppImage } = await import('../functions/communication/viewAndDescribeWhatsAppImage');
    return viewAndDescribeWhatsAppImage(req);
  },
  listentowhatsappvoiceaudio: async (req) => {
    const { listenToWhatsAppVoiceAudio } = await import('../functions/communication/listenToWhatsAppVoiceAudio');
    return listenToWhatsAppVoiceAudio(req);
  },
  markwhatsappmessageread: async (req) => {
    const { markWhatsAppMessageRead } = await import('../functions/communication/markWhatsAppMessageRead');
    return markWhatsAppMessageRead(req);
  },
  sendwhatsapplocation: async (req) => {
    const { sendWhatsAppLocation } = await import('../functions/communication/sendWhatsAppLocation');
    return sendWhatsAppLocation(req);
  },
  requestwhatsapplocation: async (req) => {
    const { requestWhatsAppLocation } = await import('../functions/communication/requestWhatsAppLocation');
    return requestWhatsAppLocation(req);
  },
};
