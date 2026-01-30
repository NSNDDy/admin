import ChatService from '~/services/ChatService';
import AuthService from '~/services/AuthService';

export default (ctx, inject) => {
  // Khởi tạo các service với axios instance và endpoint gốc
  const services = {
    chat: new ChatService(ctx.$axios, '/api'),
    auth: new AuthService(ctx.$axios, '/api/auth'),
    // Sau này thêm: 
    // user: new UserService(ctx.$axios, '/api/users'),
    // product: new ProductService(ctx.$axios, '/api/products'),
  };

  // Inject vào Nuxt context
  // Cách dùng: this.$api.chat.getHistory() hoặc this.$api.auth.login()
  inject('api', services);
};
