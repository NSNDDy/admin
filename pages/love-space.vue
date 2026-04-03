
<template>
  <div class="valentine-page">
    <!-- Background Hearts -->
    <div class="hearts-container">
      <div v-for="n in 30" :key="n" class="bubble-heart">
        <i class="fas fa-heart"></i>
      </div>
    </div>

    <!-- Letter Section -->
    <div v-if="currentStep === 'letter'" class="letter-container">
      <div class="letter-card glass-panel">
        <h2 class="letter-title">Happy Anniversary</h2>
        <div class="letter-content">
          <p class="typewriter-text">{{ displayedText }}</p>
        </div>
        <div class="heart-footer">
          <i class="fas fa-heart"></i>
        </div>
      </div>
    </div>

    <!-- Photo Gallery Section -->
    <div v-if="currentStep === 'photos'" class="gallery-container fade-in">
      <div class="photo-card glass-panel">
        <h2 class="letter-title">Happy Valentine</h2>
        <div class="photo-slider">
          <img :src="photos[currentPhotoIndex]" alt="Memory" class="slide-img">
          <div class="slider-controls">
            <button @click="prevPhoto" class="btn-nav"><i class="fas fa-chevron-left"></i></button>
            <div class="heart-nav"><i class="fas fa-heart"></i></div>
            <button @click="nextPhoto" class="btn-nav"><i class="fas fa-chevron-right"></i></button>
          </div>
        </div>
        <div v-if="showRedirect" class="redirect-container fade-in">
          <button @click="redirectToLove" class="btn-redirect">
            Mở điều bất ngờ tiếp theo <i class="fas fa-arrow-right"></i>
          </button>
        </div>
        <div class="heart-footer">
          <i class="fas fa-heart"></i>
        </div>
      </div>
    </div>

    <!-- Hidden Audio -->
    <audio ref="bgMusic" loop src="https://raw.githubusercontent.com/NguyenBaoNam/Love/main/music/love-story.mp3"></audio>
  </div>
</template>

<script>
export default {
  name: 'ValentinePage',
  layout: 'none',
  data() {
    return {
      currentStep: 'letter', // 'letter' or 'photos'
      fullText: "Anh không hứa sẽ mang lại cho em một cuộc sống hoàn hảo, không sóng gió. Nhưng anh hứa, dù bất cứ chuyện gì xảy ra, anh cũng sẽ đứng bên cạnh em, cùng em giải quyết tất cả. Anh yêu em không chỉ vì em là ai, mà vì anh là ai khi ở bên cạnh em. Anh muốn thấy nụ cười của em vào mỗi buổi sáng và ôm em vào mỗi buổi tối. Mừng ngày kỷ niệm của chúng ta ❤️",
      displayedText: "",
      typeSpeed: 55,
      currentPhotoIndex: 0,
      photos: [
        '/images/portfolio/app-1.jpg',
        '/images/portfolio/app-2.jpg',
        '/images/portfolio/app-3.jpg',
        '/images/portfolio/books-1.jpg'
      ],
      showRedirect: false
    }
  },
  head() {
    return {
      title: 'Happy Anniversary - My Love',
      link: [
        { rel: 'stylesheet', href: '/css/pages/valentine.css' },
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css' }
      ]
    }
  },
  mounted() {
    this.startTyping();
    this.playMusic();
  },
  methods: {
    startTyping() {
      let i = 0;
      const interval = setInterval(() => {
        this.displayedText += this.fullText.charAt(i);
        i++;
        if (i >= this.fullText.length) {
          clearInterval(interval);
          // Wait 5-10s then switch to photos
          setTimeout(() => {
            this.currentStep = 'photos';
          }, 4000);
        }
      }, this.typeSpeed);
    },
    playMusic() {
      // Browsers may block autoplay, usually requires a click, but we'll try
      this.$nextTick(() => {
        if (this.$refs.bgMusic) {
          this.$refs.bgMusic.play().catch(e => console.log("Autoplay blocked"));
        }
      });
    },
    nextPhoto() {
      this.currentPhotoIndex = (this.currentPhotoIndex + 1) % this.photos.length;
      if (this.currentPhotoIndex === this.photos.length - 1) {
        this.showRedirect = true;
      }
    },
    prevPhoto() {
      this.currentPhotoIndex = (this.currentPhotoIndex - 1 + this.photos.length) % this.photos.length;
    },
    redirectToLove() {
      window.location.href = "https://love.tsonit.com/ahihihoho";
    }
  }
}
</script>

<style scoped>
@import '~/assets/css/pages/valentine.css';
</style>
