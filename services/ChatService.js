import BaseService from './BaseService';

export default class ChatService extends BaseService {
  // Tự động có đủ CRUD từ BaseService
  // Chỉ cần thêm các hàm đặc thù của Chat

  // Ví dụ: Lấy lịch sử chat (đặc thù)
  async getHistory(roomId) {
    return await this.$axios.$get(`${this.resource}/history`, {
      params: { roomId }
    });
  }

  async getUsers() {
    return await this.$axios.$get(`${this.resource}/users`);
  }

  // Ví dụ: Gửi tin nhắn (Nếu dùng HTTP thay vì Socket)
  async sendMessage(data) {
    return await this.create(data);
  }
}
