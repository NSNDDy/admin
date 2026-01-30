import BaseService from './BaseService';

export default class AuthService extends BaseService {
  async login(username, password) {
    return await this.$axios.$post(`${this.resource}/login`, { username, password });
  }

  async register(data) {
    return await this.$axios.$post(`${this.resource}/register`, data);
  }
  
  async logout() {
    return await this.$axios.$post(`${this.resource}/logout`);
  }
}
