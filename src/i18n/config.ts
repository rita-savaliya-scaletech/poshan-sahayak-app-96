import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Common
      next: "Next",
      back: "Back",
      yes: "Yes",
      no: "No",
      
      // Language Selection
      selectLanguage: "Select Language",
      english: "English",
      gujarati: "ગુજરાતી",
      
      // Greetings
      goodMorning: "Good Morning",
      goodAfternoon: "Good Afternoon", 
      goodEvening: "Good Evening",
      
      // Chat Interface
      todaysMenu: "Today's {{meal}} Menu",
      uploadFoodImage: "Upload Food Image",
      capturePhoto: "Capture Photo",
      selectFromGallery: "Select from Gallery",
      analyzing: "Analyzing food image...",
      
      // Navigation
      chat: "Chat",
      history: "History",
      profile: "Profile",
      
      // Menu Items
      breakfast: "Breakfast",
      lunch: "Lunch",
      dinner: "Dinner",
      
      // Analysis
      itemsFound: "Items Found",
      missingItems: "Missing Items",
      nutritionInfo: "Nutrition Information",
      calories: "Calories",
      protein: "Protein", 
      fat: "Fat",
      carbs: "Carbs",
      
      // Profile
      teacherName: "Teacher Name",
      schoolName: "School Name",
      district: "District",
      changeLanguage: "Change Language",
      notifications: "Notifications",
      helpSupport: "Help & Support",
      settings: "Settings",
      
      // Navigation & Feedback
      feedbackSaved: "Thank you! Your feedback has been saved successfully.",
      redirectingToHistory: "Redirecting to history dashboard...",
      
      // App Name
      appName: "Poshan Tracker"
    }
  },
  gu: {
    translation: {
      // Common
      next: "આગળ",
      back: "પાછળ",
      yes: "હા",
      no: "ના",
      
      // Language Selection
      selectLanguage: "ભાષા પસંદ કરો",
      english: "English",
      gujarati: "ગુજરાતી",
      
      // Greetings
      goodMorning: "સુપ્રભાત",
      goodAfternoon: "શુભ બપોર",
      goodEvening: "શુભ સાંજ",
      
      // Chat Interface
      todaysMenu: "આજનું {{meal}} મેન્યુ",
      uploadFoodImage: "ખોરાકની તસવીર અપલોડ કરો",
      capturePhoto: "ફોટો લો",
      selectFromGallery: "ગેલેરીમાંથી પસંદ કરો",
      analyzing: "ખોરાકની તસવીરનું વિશ્લેષણ...",
      
      // Navigation
      chat: "ચેટ",
      history: "ઇતિહાસ",
      profile: "પ્રોફાઇલ",
      
      // Menu Items
      breakfast: "નાસ્તો",
      lunch: "લંચ",
      dinner: "રાત્રિભોજન",
      
      // Analysis
      itemsFound: "મળેલી વસ્તુઓ",
      missingItems: "ગુમ થયેલી વસ્તુઓ",
      nutritionInfo: "પોષણ માહિતી",
      calories: "કેલરી",
      protein: "પ્રોટીન",
      fat: "ચરબી", 
      carbs: "કાર્બોહાઇડ્રેટ",
      
      // Profile
      teacherName: "શિક્ષકનું નામ",
      schoolName: "શાળાનું નામ",
      district: "જિલ્લો",
      changeLanguage: "ભાષા બદલો",
      notifications: "સૂચનાઓ",
      helpSupport: "મદદ અને સપોર્ટ",
      settings: "સેટિંગ્સ",
      
      // Navigation & Feedback
      feedbackSaved: "આભાર! તમારો પ્રતિસાદ સફળતાપૂર્વક સાચવવામાં આવ્યો છે.",
      redirectingToHistory: "ઇતિહાસ ડેશબોર્ડ પર રીડાયરેક્ટ કરી રહ્યાં છીએ...",
      
      // App Name
      appName: "પોષણ ટ્રેકર"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;