<template>
    <div>
        <link rel="stylesheet" href="/css/login.css">
        <div class="frame">
            <img class="background-image" src="/images/AEQtS26ZqMvVZVKKc25KjwR1I5X5ECpnUb4imiG7.jpg">
            <div class="gradient-overlay"></div>

            <div class="login-container">
                <div class="login-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to your account</p>
                </div>

                <form class="login-form" @submit.prevent="handleLogin">
                    <div class="input-group">
                        <input 
                            class="input username-input" 
                            type="text" 
                            placeholder="Username"
                            v-model="form.username"
                            required
                        >
                        <i class="fa-solid fa-user icon user-icon"></i>
                    </div>

                    <div class="input-group">
                        <input 
                            class="input password-input" 
                            type="password" 
                            placeholder="Password"
                            v-model="form.password"
                            required
                        >
                        <i class="fa-solid fa-lock icon lock-icon"></i>
                        <i class="fa-solid fa-eye-slash toggle-password" @click="togglePassword"></i>
                    </div>

                    <div class="form-options">
                        <label class="remember-me">
                            <input type="checkbox" v-model="form.remember">
                            <span class="checkmark"></span>
                            Remember me
                        </label>
                        <a href="#" class="forgot-password" @click.prevent="forgotPassword">Forgot Password?</a>
                    </div>

                    <button type="submit" class="login-btn" :disabled="loading">
                        <span v-if="!loading">Sign In</span>
                        <i v-else class="fa-solid fa-spinner fa-spin"></i>
                    </button>
                </form>

                <div class="divider">
                    <span>or continue with</span>
                </div>

                <div class="social-login">
                    <button class="social-btn google-btn" @click="loginWithGoogle">
                        <i class="fab fa-google"></i>
                        <span>Google</span>
                    </button>
                    <button class="social-btn facebook-btn" @click="loginWithFacebook">
                        <i class="fab fa-facebook-f"></i>
                        <span>Facebook</span>
                    </button>
                </div>

                <div class="phone-login">
                    <button class="phone-btn" @click="showPhoneLogin">
                        <i class="fa-solid fa-phone"></i>
                        <span>Sign in with Phone</span>
                    </button>
                </div>

                <div class="signup-link">
                    <p>Don't have an account? <a href="#" @click.prevent="goToSignup">Sign up</a></p>
                </div>
            </div>

            <!-- Phone Login Modal -->
            <div class="modal" v-if="showPhoneModal" @click="closePhoneModal">
                <div class="modal-content" @click.stop>
                    <div class="modal-header">
                        <h3>Sign in with Phone</h3>
                        <button class="close-btn" @click="closePhoneModal">
                            <i class="fa-solid fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="input-group">
                            <input 
                                class="input phone-input" 
                                type="tel" 
                                placeholder="Phone Number"
                                v-model="phoneForm.number"
                            >
                            <i class="fa-solid fa-phone icon phone-icon"></i>
                        </div>
                        <button class="send-otp-btn" @click="sendOTP">
                            Send OTP
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  name: 'LoginPage',
  middleware: 'authenticated', // Check nếu đã login thì redirect đi
  data() {
    return {
      form: {
        username: '',
        password: '',
        remember: false
      },
      phoneForm: {
        number: ''
      },
      loading: false,
      showPassword: false,
      showPhoneModal: false
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      
      try {
        // Gọi API Login chuẩn
        const response = await this.$axios.$post("/api/auth/login", {
          username: this.form.username,
          password: this.form.password
        });

        if (response.success) {
          const { accessToken, user } = response.data;
          
          // Lưu Token và User Info
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('user', JSON.stringify(user));

          // Xử lý thời gian hết hạn (Expiration)
          // Nếu Remember Me: 7 ngày, Ngược lại: 1 ngày (24h)
          const days = this.form.remember ? 7 : 1;
          const expiryTime = new Date().getTime() + days * 24 * 60 * 60 * 1000;
          localStorage.setItem('tokenExpiry', expiryTime);
          
          // Redirect vào trang Dashboard
          this.$router.push("/dashboard");
        } else {
          alert('Login Failed: ' + (response.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Login Error:', error);
        
        // Xử lý lỗi từ response backend
        const msg = error.response?.data?.message || error.message;
        
        // --- MÔ PHỎNG LOGIN THÀNH CÔNG KHI BACKEND LỖI (403/Network Error) ---
        // Giúp dev frontend tiếp tục làm việc mà không bị chặn
        const confirmMock = confirm(`Lỗi kết nối Backend (${msg}). Bạn có muốn đăng nhập bằng chế độ Mock (Giả lập) không?`);
        
        if (confirmMock) {
            localStorage.setItem('accessToken', 'dummy-token-123');
            localStorage.setItem('user', JSON.stringify({ 
                username: this.form.username, 
                id: 1,
                role: 'admin'
            }));
            
            // Set expiry cho mock login luôn
            const days = this.form.remember ? 7 : 1;
            localStorage.setItem('tokenExpiry', new Date().getTime() + days * 24 * 60 * 60 * 1000);

            this.$router.push("/dashboard");
        }
      } finally {
        this.loading = false;
      }
    },
    togglePassword() {
      this.showPassword = !this.showPassword;
      const passwordInput = document.querySelector('.password-input');
      if (passwordInput) {
        passwordInput.type = this.showPassword ? 'text' : 'password';
      }
    },
    forgotPassword() {
      alert('Chức năng quên mật khẩu sẽ được phát triển sau.');
    },
    loginWithGoogle() {
      alert('Chức năng đăng nhập Google sẽ được phát triển sau.');
    },
    loginWithFacebook() {
      alert('Chức năng đăng nhập Facebook sẽ được phát triển sau.');
    },
    showPhoneLogin() {
      this.showPhoneModal = true;
    },
    closePhoneModal() {
      this.showPhoneModal = false;
    },
    sendOTP() {
      alert('OTP đã gửi tới ' + this.phoneForm.number);
    },
    goToSignup() {
      this.$router.push('/register');
    }
  }
}
</script>
