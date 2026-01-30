export default class BaseService {
  constructor($axios, resource) {
    this.$axios = $axios;
    this.resource = resource; // Ví dụ: '/api/users', '/api/chat'
  }

  // 1. GET ALL (List) - Hỗ trợ query params cho phân trang, filter
  async index(params = {}) {
    return await this.$axios.$get(this.resource, { params });
  }

  // 2. GET ONE (Detail)
  async show(id) {
    return await this.$axios.$get(`${this.resource}/${id}`);
  }

  // 3. CREATE
  async create(data) {
    return await this.$axios.$post(this.resource, data);
  }

  // 4. UPDATE
  async update(id, data) {
    return await this.$axios.$put(`${this.resource}/${id}`, data);
  }

  // 5. DELETE
  async delete(id) {
    return await this.$axios.$delete(`${this.resource}/${id}`);
  }
}
