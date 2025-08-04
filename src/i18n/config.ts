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
      greetingFull: '{{greeting}}! 👋 {{help}} {{question}} {{meal}}?', // <-- Add this line
      date: 'Date',
      mealType: 'Meal Type',
      location: 'Location',
      uploadPhoto: 'Upload Photo',
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
      school: 'School',
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
      seeYouAtNextMeal: 'See you at {{nextMeal}} - Ready to track more healthy choices! 📊',
      feedbackSubmittedSuccess:
        'Thank you! Your feedback has been saved successfully. Keep nourishing those bright minds! 🧠💪',

      // Toast Messages
      locationAccessNeeded:
        'Location access is needed to provide better service. Please allow location access when prompted.',
      locationDetectedSuccess: 'Location detected successfully!',
      locationPermissionDenied: 'Location access denied',
      locationUnavailable: 'Location unavailable',
      locationTimeout: 'Location timeout',
      locationError: 'Location error',
      locationNotSupported: 'Location not supported',
      locationServicesUnavailable: 'Location services are not available in your browser.',
      imageAnalysisCompleted: 'Image analysis completed!',
      imageAnalysisFailed: 'Failed to analyze image. Please try again.',
      cameraOpenFailed: 'Failed to open camera. Please try again.',

      // AI Messages
      great: 'Great',
      menuRecommendation: "Here's today's recommended meal menu based on your analysis:",
      analysisComplete: 'Analysis Complete',
      feedbackIntro: "Now I have a few quick questions about your meal experience. Let's start:",
      feedbackSubmitted: 'Feedback submitted successfully!',

      // Feedback Questions
      question1: 'Did all students receive their meal in a timely manner?',
      question2: 'Can you comment on the freshness level of the food?',
      question3: 'Did the food quantity meet the needs of all the students?',
      question4: 'How would you describe the cleanliness during the food serving process?',
      question5: 'How would you assess the overall breakfast service provided today?',
      q1opt1: 'Absolutely, everyone did',
      q1opt2: 'Yes, but it was delayed',
      q1opt3: 'No',
      q1opt4: 'Only some students',
      q2opt1: 'Extremely fresh',
      q2opt2: 'Fresh',
      q2opt3: 'Fair',
      q2opt4: 'Not fresh at all',
      q3opt1: 'It was more than sufficient',
      q3opt2: 'It was adequate',
      q3opt3: 'It was less than needed',
      q3opt4: 'It was not sufficient at all',
      q4opt1: 'Outstanding cleanliness',
      q4opt2: 'Good cleanliness',
      q4opt3: 'Adequate but could be better',
      q4opt4: 'Poor cleanliness',
      q5opt1: 'Outstanding',
      q5opt2: 'Good',
      q5opt3: 'Fair',
      q5opt4: 'Poor',
      gram: 'gram',

      // App Name
      appName: 'Poshan Tracker',

      // Additional Translations
      notSure: 'Not sure',
      veryTasty: 'Very tasty',
      okay: 'Okay',
      notTasty: 'Not tasty',
      tooMuch: 'Too much',
      totalReports: 'Total Reports',
      sampleUserMenu: "Today's menu includes poha, some jalebi, and a glass of milk.",
      aiPhotoPrompt: 'Can you take a photo of your meal so I can analyze the nutritional content? 📸',
      nutritionAssistant: 'Nutrition Assistant',
      tuverDalKhichdi: 'Tuver dal khichdi',
      golVadiFadaLapsi: 'Gol vadi fada lapsi',
      seasonalGreenVegetables: 'Seasonal green vegetables',
      gallery: 'Gallery',
      selectPhotoPrompt: 'Select a photo to continue...',
      alreadySubmitted: 'You have already submitted your response for {{meal}}.',
      feedbackComplete: 'Thank you for your feedback!',
      seeYouAt: 'See you at',
      alreadyCompleted: 'You have already completed',
      feedbackToday: 'feedback today',
      foundFromMenu: "Found from today's menu",
      allDetectedItems: 'All detected food items',
      nutritionHighlights: 'Nutrition highlights',
      totalItems: 'total items',

      // History Dashboard
      trackProgress: 'Track your meal reporting progress',
      filters: 'Filters',
      selectDate: 'Select date range',
      allTime: 'All time',
      today: 'Today',
      thisWeek: 'This week',
      thisMonth: 'This month',
      selectMeal: 'Select meal type',
      allMeals: 'All meals',
      sessionHistory: 'Session History',
      sessions: 'sessions',
      noSessionsFound: 'No sessions found',
      completed: 'Completed',
      pending: 'Pending',
      freshness: 'Freshness',
      quantity: 'Quantity',
      satisfaction: 'Satisfaction',
      completionRate: 'Completion Rate',
      studentsServed: 'Students Served',

      // Profile Screen
      manageAccountInfo: 'Manage your account information',
      preferredLanguage: 'Preferred Language',
      activitySummary: 'Activity Summary',
      accuracyRate: 'Accuracy Rate',
      chooseLanguage: 'Choose Language',
      signOut: 'Sign Out',
      governmentOfGujarat: 'Government of Gujarat',
      ministryOfEducation: 'Ministry of Education',
      sarvaShikshaAbhiyan: 'Sarva Shiksha Abhiyan',

      // Splash Screen
      gujaratEducationDepartment: 'Gujarat Education Department',
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
      greetingFull: '{{greeting}}! 👋 {{help}} {{question}} {{meal}}?', // <-- Add this line
      date: 'તારીખ',
      mealType: 'ભોજનનો પ્રકાર',
      location: 'સ્થાન',
      uploadPhoto: 'ફોટો અપલોડ કરો',

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
      lunch: 'મધ્યાહ્ન ભોજન',
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
      school: 'શાળા',
      teacherName: 'શિક્ષકનું નામ',
      schoolName: 'શાળાનું નામ',
      district: 'જિલ્લો',
      changeLanguage: 'ભાષા બદલો',
      notifications: 'સૂચનાઓ',
      helpSupport: 'મદદ અને સપોર્ટ',
      settings: 'સેટિંગ્સ',

      // Navigation & Feedback
      redirectingToHistory: 'ઇતિહાસ ડેશબોર્ડ પર રીડાયરેક્ટ કરી રહ્યાં છીએ...',
      seeYouAtNextMeal: '{{nextMeal}} પર મળીએ - વધુ સ્વાસ્થ્યપ્રદ પસંદગીઓ ટ્રેક કરવા માટે તૈયાર! 📊',
      feedbackSubmittedSuccess: 'આભાર! તમારો પ્રતિસાદ સફળતાપૂર્વક સાચવાયો છે. તે તેજસ્વી મનને પોષણ આપતા રહો! 🧠💪',

      // Toast Messages
      locationAccessNeeded:
        'સ્થાન એક્સેસ જરૂરી છે જેથી વધુ સેવા આપવામાં મદદ કરી શકે. કૃપા કરીને જ્યારે પ્રમુખીત કરવામાં આવે ત્યારે સ્થાન એક્સેસ અનુમતિ આપો.',
      locationDetectedSuccess: 'સ્થાન સફળતાપૂર્વક શોધવામાં આવ્યું!',
      locationPermissionDenied: 'સ્થાન એક્સેસ અનુમતિ અવરોધાયું',
      locationUnavailable: 'સ્થાન ઉપલબ્ધ નથી',
      locationTimeout: 'સ્થાન સમયમાં આવી છે',
      locationError: 'સ્થાન ગુમાવી છે',
      locationNotSupported: 'સ્થાન આપવામાં નથી',
      locationServicesUnavailable: 'તમારા બ્રાઉઝરમાં સ્થાન સેવાઓ ઉપલબ્ધ નથી.',
      imageAnalysisCompleted: 'છબીનું વિશ્લેષણ પૂર્ણ થયું!',
      imageAnalysisFailed: 'છબીનું વિશ્લેષણ થતું નથી. કૃપા કરીને ફરી પ્રયાસ કરો.',
      cameraOpenFailed: 'કેમેરા ખોલવામાં થતું નથી. કૃપા કરીને ફરી પ્રયાસ કરો.',

      // AI Messages
      great: 'શાનદાર',
      menuRecommendation: 'તમારા વિશ્લેષણના આધારે આજનું ભલામણ કરેલ ભોજન મેન્યુ અહીં છે:',
      analysisComplete: 'વિશ્લેષણ પૂર્ણ',
      feedbackIntro: 'હવે મારી પાસે તમારા ભોજનના અનુભવ વિશે કેટલાક ઝડપી પ્રશ્નો છે. ચાલો શરૂ કરીએ:',
      feedbackSubmitted: 'પ્રતિસાદ સફળતાપૂર્વક સબમિટ થયો!',

      question1: 'શું બધા વિદ્યાર્થીઓને સમયસર ભોજન મળ્યું?',
      question2: 'શું તમે ખોરાકની તાજગીના સ્તર વિશે ટિપ્પણી કરી શકો છો?',
      question3: 'શું ખોરાકનો જથ્થો બધા વિદ્યાર્થીઓની જરૂરિયાતોને પૂર્ણ કરે છે?',
      question4: 'ભોજન પીરસતી વખતે થતી સ્વચ્છતાનું તમે કેવી રીતે વર્ણન કરશો?',
      question5: 'આજે પૂરી પાડવામાં આવતી એકંદર નાસ્તાની સેવાનું તમે કેવી રીતે મૂલ્યાંકન કરશો?',
      q1opt1: 'ચોક્કસ, બધાએ કર્યું',
      q1opt2: 'હા, પણ મોડું થયું.',
      q1opt3: 'ના',
      q1opt4: 'માત્ર કેટલાક વિદ્યાર્થીઓ',
      q2opt1: 'ખૂબ તાજું',
      q2opt2: 'તાજું',
      q2opt3: 'સરેરાશ',
      q2opt4: 'ખૂબ જ ન તાજું',
      q3opt1: 'તે વધુ than પૂરતું હતું',
      q3opt2: 'તે પૂરતું હતું',
      q3opt3: 'તેની જરૂરિયાત કરતાં ઓછું હતું',
      q3opt4: 'તે બિલકુલ પૂરતું નહોતું',
      q4opt1: 'ઉત્કૃષ્ટ સ્વચ્છતા',
      q4opt2: 'સારી સ્વચ્છતા',
      q4opt3: 'પર્યાપ્ત પરંતુ વધુ સારું હોઈ શકે છે',
      q4opt4: 'ખરાબ સ્વચ્છતા',
      q5opt1: 'ઉત્કૃષ્ટ',
      q5opt2: 'સારો',
      q5opt3: 'સરેરાશ',
      q5opt4: 'ખરાબ',

      // App Name
      appName: 'પોષણ ટ્રેકર',

      // Additional Translations
      totalReports: 'કુલ અહેવાલો',
      aiPhotoPrompt: 'શું તમે તમારા ભોજનનો ફોટો લઈ શકો છો જેથી હું પોષણનું વિશ્લેષણ કરી શકું? 📸',
      nutritionAssistant: 'પોષણ સહાયક',
      tuverDalKhichdi: 'તુવેર દાળ ખીચડી',
      golVadiFadaLapsi: 'ગોળ વાડી ફડા લાપસી',
      seasonalGreenVegetables: 'ઋતુ પ્રમાણેની લીલી શાકભાજી',
      gallery: 'ગેલેરી',
      selectPhotoPrompt: 'આગળ વધવા માટે ફોટો પસંદ કરો...',
      gram: 'ગ્રામ',
      feedbackComplete: 'તમારા પ્રતિસાદ માટે આભાર!',
      feedbackSaved: 'આભાર! તમારો પ્રતિસાદ સફળતાપૂર્વક સાચવાયો છે.',
      seeYouAt: 'તમને મળીએ',
      alreadyCompleted: 'તમે પહેલેથી જ પૂર્ણ કર્યું છે',
      feedbackToday: 'આજે પ્રતિસાદ',
      foundFromMenu: 'આજના મેનુમાંથી મળ્યું',
      allDetectedItems: 'બધી શોધાયેલ ખાદ્ય વસ્તુઓ',
      nutritionHighlights: 'પોષણ હાઇલાઇટ્સ',
      totalItems: 'કુલ વસ્તુઓ',

      // History Dashboard
      trackProgress: 'તમારા ભોજન રિપોર્ટિંગ પ્રગતિને ટ્રેક કરો',
      filters: 'ફિલ્ટર્સ',
      selectDate: 'તારીખની રેન્જ પસંદ કરો',
      allTime: 'બધો સમય',
      today: 'આજે',
      thisWeek: 'આ સપ્તાહ',
      thisMonth: 'આ મહિનો',
      selectMeal: 'ભોજનનો પ્રકાર પસંદ કરો',
      allMeals: 'બધા ભોજન',
      sessionHistory: 'સેશન ઇતિહાસ',
      sessions: 'સેશન્સ',
      noSessionsFound: 'કોઈ સેશન મળ્યું નથી',
      completed: 'પૂર્ણ',
      pending: 'પેન્ડિંગ',
      freshness: 'તાજગી',
      quantity: 'જથ્થો',
      satisfaction: 'સંતુષ્ટિ',
      completionRate: 'પૂર્ણતા દર',
      studentsServed: 'વિદ્યાર્થીઓ પૂર્ણ કર્યા',

      // Profile Screen
      manageAccountInfo: 'તમારા ખાતાની માહિતી સંચાલિત કરો',
      preferredLanguage: 'પસંદગીની ભાષા',
      activitySummary: 'પ્રવૃત્તિ સારાંશ',
      accuracyRate: 'ચોકસાઈ દર',
      chooseLanguage: 'ભાષા પસંદ કરો',
      signOut: 'બાહર જાઓ',
      governmentOfGujarat: 'ગુજરાત સરકાર',
      ministryOfEducation: 'શિક્ષણ મંત્રાલય',
      sarvaShikshaAbhiyan: 'સર્વશીક્ષા અભિયાન',

      // Splash Screen
      gujaratEducationDepartment: 'ગુજરાત શિક્ષણ વિભાગ',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'gu', // Default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
