<template>
    <header id="header" class="header d-flex align-items-center sticky-top">
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

<style scoped>
.account-menu {
  /* margin-right: auto; */
  padding-right: 20px;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.btn-account {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  transition: color 0.3s ease;
  padding: 8px 12px;
  border-radius: 4px;
}

.btn-account:hover {
  color: #0ea5e9;
  background-color: rgba(14, 165, 233, 0.1);
}

.btn-account i {
  font-size: 20px;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  left: -6rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  min-width: 200px;
  padding: 8px 0;
  list-style: none;
  margin: 10px 0 0 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 1000;
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-menu li {
  margin: 0;
}

.dropdown-menu a {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  color: #333;
  text-decoration: none;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.dropdown-menu a:hover {
  background-color: #f3f4f6;
  color: #0ea5e9;
}

.dropdown-menu a.logout {
  color: #ef4444;
}

.dropdown-menu a.logout:hover {
  background-color: #fee2e2;
  color: #dc2626;
}

.dropdown-divider {
  margin: 8px 0;
  border: none;
  border-top: 1px solid #e5e7eb;
}

.account-name {
  font-weight: 500;
}

@media (max-width: 768px) {
  .account-menu {
    margin-left: 10px;
  }

  .dropdown-menu {
    min-width: 160px;
  }

  .btn-account {
    font-size: 14px;
    padding: 6px 8px;
  }

  .account-name {
    display: none;
  }
}
</style>

