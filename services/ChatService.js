import BaseService from './BaseService';

export default class ChatService extends BaseService {
  // Tự động có đủ CRUD từ BaseService
  // Chỉ cần thêm các hàm đặc thù của Chat

  // Ví dụ: Lấy lịch sử chat (đặc thù)
  async getHistory(roomId) {
    // Backend yêu cầu header đặc biệt này (giữ nguyên logic cũ)
    const token = localStorage.getItem('accessToken');
    
    return await this.$axios.$get(`${this.resource}/history`, {
      params: { roomId },
      headers: {
        'accessToken': token, // Backend cần cái này
        'roomId': roomId      // Backend cần cái này
      }
    });
  }

  // Ví dụ: Gửi tin nhắn (Nếu dùng HTTP thay vì Socket)
  async sendMessage(data) {
    return await this.create(data);
  }
}
