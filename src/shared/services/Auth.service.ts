import CryptoJS from 'crypto-js';

// interface

const API_KEY_URL = import.meta.env.VITE_API_KEY || '';

const KEY: string = API_KEY_URL as string;

/**
 * function to check if user is logged in or not
 */
const checkLogin = (): boolean => {
  if (localStorage['authData']) {
    return true;
  } else {
    return false;
  }
};

/**
 * function to get user access token
 */
const getAccessToken = (): boolean | string => {
  try {
    const data = localStorage['authData'];

    if (data) {
      const bytes = CryptoJS.AES.decrypt(data.toString(), KEY);
      const decryptedData: any = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      return decryptedData && decryptedData.access_token ? decryptedData.access_token : false;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
};

/**
 * function to set user authentication data
 */
const setAuthData = (data: any): void => {
  const cipherText = CryptoJS.AES.encrypt(JSON.stringify(data), KEY);
  localStorage.setItem('authData', cipherText.toString());
};

/**
 * function to get user authentication data
 */
const getAuthData = (): any | undefined => {
  const data = localStorage['authData'];
  try {
    if (data) {
      const bytes = CryptoJS.AES.decrypt(data.toString(), KEY);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      return decryptedData;
    } else {
      return;
    }
  } catch (e) {
    return;
  }
};

/**
 * function to remove user authentication data
 */
const removeAuthData = (): void => {
  localStorage.removeItem('authData');
};

/**
 * function to set data in local storage
 */
const setLocalStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

/**
 * function to get data from local storage
 */
const getLocalStorage = (key: string) => {
  const storedValue = localStorage.getItem(key);
  return storedValue ? JSON.parse(storedValue) : null;
};

/**
 * function to remove data from local storage
 */
const clearLocalStorage = () => {
  localStorage.clear();
};

const AuthService = {
  checkLogin: checkLogin,
  getAccessToken: getAccessToken,
  setAuthData: setAuthData,
  getAuthData: getAuthData,
  removeAuthData: removeAuthData,
  setLocalStorage: setLocalStorage,
  getLocalStorage: getLocalStorage,
  clearLocalStorage: clearLocalStorage,
};

export default AuthService;
