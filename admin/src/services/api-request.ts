import axios from 'axios';
import { isUrl } from '@lib/string';

export interface IResponse<T> {
  status: number;
  data: T;
}

export const TOKEN = 'token';

export abstract class APIRequest {
  static API_ENDPOINT: string = '';

  public getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN);
    }
    return null;
  }

  getBaseApiEndpoint() {
    const { API_ENDPOINT } = APIRequest;
    if (API_ENDPOINT) return API_ENDPOINT;

    return process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:5001';
  }

  async request(
    url: string,
    method?: string,
    body?: any,
    headers?: { [key: string]: string }
  ): Promise<IResponse<any>> {
    const verb = (method || 'get').toUpperCase();
    const token = this.getToken();
    const updatedHeader = {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      ...(headers || {})
    };
    const baseApiEndpoint = this.getBaseApiEndpoint();

    return axios(isUrl(url) ? url : `${baseApiEndpoint}${url}`, {
      method: verb,
      headers: updatedHeader,
      data: body ? JSON.stringify(body) : undefined
    })
      .then(resp => resp.data)
      .catch(error => {
        if (error?.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(TOKEN);
            window.location.href = '/';
          }
          throw new Error('Please login!');
        }
        throw error?.response?.data;
      });
  }

  buildUrl(baseUrl: string, params?: { [key: string]: any }) {
    if (!params) {
      return baseUrl;
    }

    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => {
        if (value === undefined || value === null || value === '') {
          return false;
        }
        if (Array.isArray(value) && value.length === 0) {
          return false;
        }
        return true;
      })
    );

    if (Object.keys(filteredParams).length === 0) {
      return baseUrl;
    }

    const queryString = Object.keys(filteredParams)
      .map(k => {
        if (Array.isArray(filteredParams[k])) {
          return filteredParams[k]
            .map(param => `${encodeURIComponent(k)}=${encodeURIComponent(param)}`)
            .join('&');
        }
        return `${encodeURIComponent(k)}=${encodeURIComponent(filteredParams[k])}`;
      })
      .join('&');
    return `${baseUrl}?${queryString}`;
  }

  get(url: string, headers?: { [key: string]: string }) {
    return this.request(url, 'get', null, headers);
  }

  post(url: string, data?: any, headers?: { [key: string]: string }) {
    return this.request(url, 'post', data, headers);
  }

  put(url: string, data?: any, headers?: { [key: string]: string }) {
    return this.request(url, 'put', data, headers);
  }

  del(url: string, data?: any, headers?: { [key: string]: string }) {
    return this.request(url, 'delete', data, headers);
  }

  upload(
    url: string,
    files: {
      file: File;
      fieldname: string;
    }[],
    options: {
      onProgress: Function;
      customData?: Record<any, any>;
      method?: string;
    } = {
      onProgress() {},
      method: 'POST'
    }
  ) {
    const baseApiEndpoint = this.getBaseApiEndpoint();
    const uploadUrl = isUrl(url) ? url : `${baseApiEndpoint}${url}`;
    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();

      req.upload.addEventListener('progress', event => {
        if (event.lengthComputable) {
          options.onProgress({
            percentage: (event.loaded / event.total) * 100
          });
        }
      });

      req.addEventListener('load', () => {
        const success = req.status >= 200 && req.status < 300;
        const { response } = req;
        if (!success) {
          return reject(response);
        }
        return resolve(response);
      });

      req.upload.addEventListener('error', () => {
        reject(req.response);
      });

      const formData = new FormData();
      files.forEach(f => {
        if (f.file instanceof Blob) {
          const fileName = f.file instanceof File ? f.file.name : 'upload';
          formData.append(f.fieldname, f.file, fileName);
        }
      });
      options.customData &&
        Object.keys(options.customData).forEach(fieldname => {
          if (
            typeof options.customData[fieldname] !== 'undefined' &&
            !Array.isArray(options.customData[fieldname])
          )
            formData.append(fieldname, options.customData[fieldname]);
          if (
            typeof options.customData[fieldname] !== 'undefined' &&
            Array.isArray(options.customData[fieldname])
          ) {
            if (options.customData[fieldname].length) {
              for (let i = 0; i < options.customData[fieldname].length; i += 1) {
                formData.append(fieldname, options.customData[fieldname][i]);
              }
            }
          }
        });

      req.responseType = 'json';
      req.open(options.method || 'POST', uploadUrl);

      const token = this.getToken();
      req.setRequestHeader('Authorization', token ? `Bearer ${token}` : '');
      req.send(formData);
    });
  }
}

