import axios, { AxiosRequestConfig, AxiosResponse, CancelToken, ResponseType } from 'axios';
import { getUrl } from '../api';
import AuthService from './Auth.service';

const axiosInstance = axios.create();
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface IMiscellaneousRequestParams {
  contentType?: string;
  isPublic?: boolean;
  cancelToken?: CancelToken;
  responseType?: ResponseType;
}

/**
 * get method
 * @param request object containing axios params
 */
const get = (url: string, params: any = {}, otherData: IMiscellaneousRequestParams = {}) =>
  commonAxios({ method: 'GET', url: getUrl(url, params), ...otherData });

/**
 * post method
 * @param request object containing axios params
 */
const post = (url: string, params: any = {}, otherData: IMiscellaneousRequestParams = {}) =>
  commonAxios({ method: 'POST', url: getUrl(url), data: params, ...otherData });

/**
 * put method
 * @param request object containing axios params
 */
const put = (url: string, params: any = {}, otherData: IMiscellaneousRequestParams = {}) =>
  commonAxios({ method: 'PUT', url: getUrl(url), data: params, ...otherData });

/**
 * deleteRequest method
 * @param request object containing axios params
 */
const deleteRequest = (url: string, params: any = {}, otherData: IMiscellaneousRequestParams = {}) =>
  commonAxios({ method: 'DELETE', url: getUrl(url), data: params, ...otherData });

/**
 * patch method
 * @param request object containing axios params
 */
const patch = (url: string, params: any = {}, otherData: IMiscellaneousRequestParams = {}) =>
  commonAxios({ method: 'PATCH', url: getUrl(url), data: params, ...otherData });

interface IAxiosParams extends IMiscellaneousRequestParams {
  method: string;
  url: string;
  data?: any;
}

/**
 * commonAxios
 * @param object containing method, url, data, access token, content-type, isLogin
 */
const commonAxios = (config: IAxiosParams): Promise<any> => {
  const { method, url, data, contentType = 'application/json', isPublic = false, responseType } = config;
  const headers: any = {
    'Content-Type': contentType,
    'ngrok-skip-browser-warning': '69420',
  };

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
  if (contentType === 'application/json') {
    body = JSON.stringify(data);
  } else {
    body = data;
  }

  const axiosInstanceParams = {
    method: method,
    baseURL: API_BASE_URL,
    url: url,
    cancelToken: config.cancelToken,
    headers: headers,
    data: body,
    responseType: responseType,
  } as AxiosRequestConfig;

  return new Promise((resolve, reject) => {
    axiosInstance(axiosInstanceParams)
      .then((response: AxiosResponse<any>) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
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
