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
                            placeholder="Username or Email"
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
        const response = await this.$axios.$post("/api-login", {
          username : this.form.username,
          password : this.form.password
        });
        console.log('Received response:', response.result);
        // const token = response.headers.accesstoken;
        // console.log('Received Token:', token);

        // if(token){
        //   localStorage.setItem('accessToken', token);
        //   console.log('Access Token đã lưu : ' , token);
        //   this.$router.push("/dashboard");
        // } else {
        //   alert('Đăng nhập thất bại: Không nhận được token');
        // }
        if(response.result === 0){
          this.$router.push("/dashboard");
        } else {
          alert('Đăng nhập thất bại: ' + response.data.message);
        }
      } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        alert('Đăng nhập thất bại: ' + (error.response?.data?.message || error.message));
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
      alert('Forgot password functionality - redirect to reset page');
    },
    loginWithGoogle() {
      alert('Google login functionality');
    },
    loginWithFacebook() {
      alert('Facebook login functionality');
    },
    showPhoneLogin() {
      this.showPhoneModal = true;
    },
    closePhoneModal() {
      this.showPhoneModal = false;
    },
    sendOTP() {
      alert('OTP sent to ' + this.phoneForm.number);
    },
    goToSignup() {
      this.$router.push('/register');
    }
  }
}
</script>