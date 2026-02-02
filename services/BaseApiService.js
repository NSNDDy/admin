/**
 * Base Service Wrapper
 * Chịu trách nhiệm thực hiện các cuộc gọi HTTP cơ bản
 */
export default class BaseApiService {
  constructor(axiosInstance, prefixUrl) {
    this.axios = axiosInstance;
    this.prefix = prefixUrl;
  }

  // Helper để tạo URL
  _url(path) {
    return path ? `${this.prefix}/${path}` : this.prefix;
  }

  async get(url, params = {}) {
    return await this.axios.get(this._url(url), { params });
  }

  async post(url, data = {}) {
    return await this.axios.post(this._url(url), data);
  }

  async put(url, data = {}) {
    return await this.axios.put(this._url(url), data);
  }

  async delete(url, params = {}) {
    return await this.axios.delete(this._url(url), { params });
  }

  // Dành cho download file (Blob)
  async download(url, data = {}) {
    return await this.axios.post(this._url(url), data, {
      responseType: 'blob',
    });
  }
}
