import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Common
      next: 'Next',
      back: 'Back',
      yes: 'Yes',
      no: 'No',

      // Language Selection
      selectLanguage: 'Select Language',
      english: 'English',
      gujarati: 'ગુજરાતી',

      // Greetings
      goodMorning: 'Good Morning',
      goodAfternoon: 'Good Afternoon',
      goodEvening: 'Good Evening',
      greetingHelp: "I'm here to help track your meals today.",

      // Chat Interface
      todaysMenu: "Today's meal Menu",
      uploadFoodImage: 'Upload Food Image',
      capturePhoto: 'Capture Photo',
      selectFromGallery: 'Select from Gallery',
      analyzing: 'Analyzing food image...',
      whatDidYouHave: 'What did you have for',

      // Navigation
      chat: 'Chat',
      history: 'History',
      profile: 'Profile',

      // Menu Items
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',

      // Analysis
      itemsFound: 'Items Found',
      missingItems: 'Missing Items',
      nutritionInfo: 'Nutrition Information',
      calories: 'Calories',
      protein: 'Protein',
      fat: 'Fat',
      carbs: 'Carbs',

      // Profile
      teacherName: 'Teacher Name',
      schoolName: 'School Name',
      district: 'District',
      changeLanguage: 'Change Language',
      notifications: 'Notifications',
      helpSupport: 'Help & Support',
      settings: 'Settings',

      // Navigation & Feedback
      feedbackSaved: 'Thank you! Your feedback has been saved successfully.',
      redirectingToHistory: 'Redirecting to history dashboard...',

      // AI Messages
      great: 'Great',
      menuRecommendation: "Here's today's recommended meal menu based on your analysis:",
      analysisComplete: 'Analysis Complete',
      feedbackIntro: "Now I have a few quick questions about your meal experience. Let's start:",
      feedbackSubmitted: 'Feedback submitted successfully!',

      // Feedback Questions
      mealFreshQuestion: 'Was the meal fresh?',
      mealTastyQuestion: 'Was the meal tasty?',
      mealQuantityQuestion: 'Was the quantity sufficient?',

      // App Name
      appName: 'Poshan Tracker',

      // Additional Translations
      notSure: 'Not sure',
      veryTasty: 'Very tasty',
      okay: 'Okay',
      notTasty: 'Not tasty',
      tooMuch: 'Too much',
      totalReports: 'Total Reports',
      sampleUserMenu: 'Today’s menu includes poha, some jalebi, and a glass of milk.',
      aiPhotoPrompt: 'Can you take a photo of your meal so I can analyze the nutritional content? 📸',
      nutritionAssistant: 'Nutrition Assistant',
      poha: 'Poha',
      banana: 'Banana',
      milk: 'Milk',
      jalebi: 'Jalebi',
      oneBowl: '1 bowl',
      onePiece: '1 piece',
      oneGlass: '1 glass',
      twoPieces: '2 pieces',
      gallery: 'Gallery',
      selectPhotoPrompt: 'Select a photo to continue...',
      alreadySubmitted: 'You have already submitted your response for {{meal}}.',
    },
  },
  gu: {
    translation: {
      // Common
      next: 'આગળ',
      back: 'પાછળ',
      yes: 'હા',
      no: 'ના',

      // Language Selection
      selectLanguage: 'ભાષા પસંદ કરો',
      english: 'English',
      gujarati: 'ગુજરાતી',

      // Greetings
      goodMorning: 'સુપ્રભાત',
      goodAfternoon: 'શુભ બપોર',
      goodEvening: 'શુભ સાંજ',
      greetingHelp: 'હું આજે તમારા ભોજનને ટ્રેક કરવામાં મદદ કરવા માટે અહીં છું.',

      // Chat Interface
      todaysMenu: 'આજનું {{meal}} મેન્યુ',
      uploadFoodImage: 'ખોરાકની તસવીર અપલોડ કરો',
      capturePhoto: 'ફોટો લો',
      selectFromGallery: 'ગેલેરીમાંથી પસંદ કરો',
      analyzing: 'ખોરાકની તસવીરનું વિશ્લેષણ...',
      whatDidYouHave: 'તમે શું લીધું હતું',

      // Navigation
      chat: 'ચેટ',
      history: 'ઇતિહાસ',
      profile: 'પ્રોફાઇલ',

      // Menu Items
      breakfast: 'નાસ્તો',
      lunch: 'લંચ',
      dinner: 'રાત્રિભોજન',

      // Analysis
      itemsFound: 'મળેલી વસ્તુઓ',
      missingItems: 'ગુમ થયેલી વસ્તુઓ',
      nutritionInfo: 'પોષણ માહિતી',
      calories: 'કેલરી',
      protein: 'પ્રોટીન',
      fat: 'ચરબી',
      carbs: 'કાર્બોહાઇડ્રેટ',

      // Profile
      teacherName: 'શિક્ષકનું નામ',
      schoolName: 'શાળાનું નામ',
      district: 'જિલ્લો',
      changeLanguage: 'ભાષા બદલો',
      notifications: 'સૂચનાઓ',
      helpSupport: 'મદદ અને સપોર્ટ',
      settings: 'સેટિંગ્સ',

      // Navigation & Feedback
      feedbackSaved: 'આભાર! તમારો પ્રતિસાદ સફળતાપૂર્વક સાચવવામાં આવ્યો છે.',
      redirectingToHistory: 'ઇતિહાસ ડેશબોર્ડ પર રીડાયરેક્ટ કરી રહ્યાં છીએ...',

      // AI Messages
      great: 'શાનદાર',
      menuRecommendation: 'તમારા વિશ્લેષણના આધારે આજનું ભલામણ કરેલ ભોજન મેન્યુ અહીં છે:',
      analysisComplete: 'વિશ્લેષણ પૂર્ણ',
      feedbackIntro: 'હવે મારી પાસે તમારા ભોજનના અનુભવ વિશે કેટલાક ઝડપી પ્રશ્નો છે. ચાલો શરૂ કરીએ:',
      feedbackSubmitted: 'પ્રતિસાદ સફળતાપૂર્વક સબમિટ થયો!',

      // Feedback Questions
      mealFreshQuestion: 'શું ભોજન તાજું હતું?',
      mealTastyQuestion: 'શું ભોજન સ્વાદિષ્ટ હતું?',
      mealQuantityQuestion: 'શું માત્રા પૂરતી હતી?',

      // App Name
      appName: 'પોષણ ટ્રેકર',

      // Additional Translations
      notSure: 'ખાતરી નથી',
      veryTasty: 'ખૂબ સ્વાદિષ્ટ',
      okay: 'બરાબર',
      notTasty: 'સ્વાદિષ્ટ નથી',
      tooMuch: 'ઘણું વધારે',
      totalReports: 'કુલ રિપોર્ટ્સ',
      sampleUserMenu: 'આજના મેનુમાં પોહા, જલેબી અને એક ગ્લાસ દૂધ છે.',
      aiPhotoPrompt: 'શું તમે તમારા ભોજનનો ફોટો લઈ શકો છો જેથી હું પોષણનું વિશ્લેષણ કરી શકું? 📸',
      nutritionAssistant: 'પોષણ સહાયક',
      poha: 'પોહા',
      banana: 'કેળું',
      milk: 'દૂધ',
      jalebi: 'જલેબી',
      oneBowl: '૧ વાટકી',
      onePiece: '૧ ટુકડો',
      oneGlass: '૧ ગ્લાસ',
      twoPieces: '૨ ટુકડા',
      gallery: 'ગેલેરી',
      selectPhotoPrompt: 'આગળ વધવા માટે ફોટો પસંદ કરો...',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
