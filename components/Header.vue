<template>
    <header id="header" class="header d-flex align-items-center sticky-top">
    <link rel="stylesheet" href="/css/header.css">
    <div class="container-fluid container-xl position-relative d-flex align-items-center">

      <nuxt-link to="/" class="logo d-flex align-items-center me-auto">
        <!-- <img src="/logo.png" alt=""> -->
        <h1 class="sitename">Neyyud</h1>
      </nuxt-link>

      <nav id="navmenu" class="navmenu">
        <ul>
          <li><a href="#hero" class="active">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#portfolio">Portfolio</a></li>
          <li><a href="#team">Team</a></li>
          <li class="dropdown">
            <a href="#"><span>Dropdown</span> <i class="bi bi-chevron-down toggle-dropdown"></i></a>
            <ul>
              <li><a href="#">Dropdown 1</a></li>
              <li class="dropdown">
                <a href="#"><span>Deep Dropdown</span> <i class="bi bi-chevron-down toggle-dropdown"></i></a>
                <ul>
                  <li><a href="#">Deep Dropdown 1</a></li>
                  <li><a href="#">Deep Dropdown 2</a></li>
                  <li><a href="#">Deep Dropdown 3</a></li>
                  <li><a href="#">Deep Dropdown 4</a></li>
                  <li><a href="#">Deep Dropdown 5</a></li>
                </ul>
              </li>
              <li><a href="#">Dropdown 2</a></li>
              <li><a href="#">Dropdown 3</a></li>
              <li><a href="#">Dropdown 4</a></li>
            </ul>
          </li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <i class="mobile-nav-toggle d-xl-none bi bi-list"></i>
      </nav>

      <a class="btn-getstarted" href="#about">Get Started</a>
    </div>
    <!-- Account Menu -->
      <div class="account-menu">
        <div class="dropdown">
          <button class="btn-account dropdown-toggle" @click="toggleAccountMenu">
            <i class="bi bi-person-circle"></i>
            <span class="account-name">{{ userName }}</span>
            <i class="bi bi-chevron-down"></i>
          </button>
          <ul class="dropdown-menu" :class="{ show: showAccountMenu }">
            <li><a href="#" @click.prevent="goToProfile"><i class="bi bi-person"></i> Thông tin tài khoản</a></li>
            <li><a href="#" @click.prevent="goToSettings"><i class="bi bi-gear"></i> Cài đặt</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a href="#" @click.prevent="logout" class="logout"><i class="bi bi-box-arrow-right"></i> Đăng xuất</a></li>
          </ul>
        </div>
      </div>
  </header>
</template>

<script>
export default {
    name: 'TheHeader',

    data() {
      return {
        showAccountMenu: false,
        isLoggedIn: false,
        userName: 'User'
      }
    },
    mounted() {
      this.checkLoginStatus();
    },
    methods: {
      checkLoginStatus() {
        const token = localStorage.getItem('accessToken');
        console.log('Access Token:', token);
        const userInfo = localStorage.getItem('userInfo');
        
        if (token) {
          this.isLoggedIn = true;
          if (userInfo) {
            try {
              const user = JSON.parse(userInfo);
              this.userName = user.username || 'User';
            } catch (e) {
              this.userName = 'User';
            }
          }
        }
      },
      toggleAccountMenu() {
        this.showAccountMenu = !this.showAccountMenu;
      },
      closeAccountMenu() {
        this.showAccountMenu = false;
      },
      goToProfile() {
        this.closeAccountMenu();
        this.$router.push('/profile');
      },
      goToSettings() {
        this.closeAccountMenu();
        this.$router.push('/settings');
      },
      logout() {
        this.closeAccountMenu();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userInfo');
        this.isLoggedIn = false;
        this.$router.push('/login');
      }
    }
}
</script>
