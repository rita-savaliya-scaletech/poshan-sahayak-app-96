import { getUrl } from '../api';
import AuthService from './Auth.service';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface IMiscellaneousRequestParams {
  contentType?: string;
  isPublic?: boolean;
  responseType?: ResponseType;
}

/**
 * get method
 * @param request object containing axios params
 */
const get = (url: string, params: any = {}, otherData: IMiscellaneousRequestParams = {}) =>
  commonHttp({ method: 'GET', url: getUrl(url, params), ...otherData });

/**
 * post method
 * @param request object containing axios params
 */
const post = (url: string, params: any = {}, otherData: IMiscellaneousRequestParams = {}) =>
  commonHttp({ method: 'POST', url: getUrl(url), data: params, ...otherData });

/**
 * put method
 * @param request object containing axios params
 */
const put = (url: string, params: any = {}, otherData: IMiscellaneousRequestParams = {}) =>
  commonHttp({ method: 'PUT', url: getUrl(url), data: params, ...otherData });

/**
 * deleteRequest method
 * @param request object containing axios params
 */
const deleteRequest = (url: string, params: any = {}, otherData: IMiscellaneousRequestParams = {}) =>
  commonHttp({ method: 'DELETE', url: getUrl(url), data: params, ...otherData });

/**
 * patch method
 * @param request object containing axios params
 */
const patch = (url: string, params: any = {}, otherData: IMiscellaneousRequestParams = {}) =>
  commonHttp({ method: 'PATCH', url: getUrl(url), data: params, ...otherData });

interface IHttpParams extends IMiscellaneousRequestParams {
  method: string;
  url: string;
  data?: any;
}

/**
 * commonHttp - Fetch-based implementation
 * @param object containing method, url, data, access token, content-type, isLogin
 */
const commonHttp = async (config: IHttpParams): Promise<any> => {
  const { method, url, data, contentType = 'application/json', isPublic = false } = config;
  const headers: Record<string, string> = {
    'ngrok-skip-browser-warning': '69420',
  };

  // Don't set Content-Type header for FormData - let browser set it automatically with boundary
  if (!(data instanceof FormData)) {
    headers['Content-Type'] = contentType;
  }

  // if end point is public than no need to provide access token
  if (!isPublic) {
    const token = AuthService.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;

      const language = localStorage.getItem('lang') || 'en';
      headers['x-request-language'] = `${language}`;
    }
  }

  let body: any = null;
  if (contentType === 'application/json' && !(data instanceof FormData)) {
    body = JSON.stringify(data);
  } else {
    body = data;
  }

  const fullUrl = `${API_BASE_URL}${url}`;

  const fetchOptions: RequestInit = {
    method: method,
    headers: headers,
    body: method !== 'GET' ? body : undefined,
  };

  const response = await fetch(fullUrl, fetchOptions);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const responseData = await response.json();
  return responseData;
};

// Create a mock axios instance for compatibility
const axiosInstance = {
  create: () => ({
    get: get,
    post: post,
    put: put,
    delete: deleteRequest,
    patch: patch,
  }),
};

export { axiosInstance };

const HttpService = {
  get: get,
  post: post,
  put: put,
  deleteRequest: deleteRequest,
  patch: patch,
};

export default HttpService;
