
<template>
  <div class="valentine-page" @click="handleFirstClick">
    <!-- Background Hearts -->
    <div class="hearts-container">
      <div v-for="n in 30" :key="n" class="bubble-heart">
        <i class="fas fa-heart"></i>
      </div>
    </div>

    <!-- Music Control -->
    <div class="music-control" @click.stop="toggleMusic">
      <i class="fas" :class="isMuted ? 'fa-volume-mute' : 'fa-volume-up'"></i>
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
    <audio ref="bgMusic" src="/music/love-story.mp3" @ended="onMusicEnded"></audio>
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
      showRedirect: false,
      autoSlideInterval: null,
      isMuted: true,
      musicStarted: false,
      isFirstPlay: true
    }
  },
  watch: {
    currentStep(newStep) {
      if (newStep === 'photos') {
        this.startAutoSlide();
      }
    }
  },
  head() {
    return {
      title: 'Happy Anniversary - My Love',
      link: [
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css' }
      ]
    }
  },
  mounted() {
    this.startTyping();
    this.playMusic();
  },
  beforeDestroy() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
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
    startAutoSlide() {
      // Chuyển ảnh mỗi 3 giây
      this.autoSlideInterval = setInterval(() => {
        this.nextPhoto();
      }, 3000);
    },
    playMusic() {
      const audio = this.$refs.bgMusic;
      if (audio) {
        // Nếu là lần đầu phát, nhảy qua 4 giây đầu bị trống
        if (this.isFirstPlay) {
          audio.currentTime = 4;
          this.isFirstPlay = false;
        }
        
        audio.play()
          .then(() => {
            this.isMuted = false;
            this.musicStarted = true;
          })
          .catch(e => {
            console.log("Autoplay blocked, waiting for interaction");
            this.isMuted = true;
          });
      }
    },
    onMusicEnded() {
      // Khi hết bài, tự động quay lại giây thứ 4 và phát tiếp (thay thế thuộc tính loop)
      const audio = this.$refs.bgMusic;
      if (audio) {
        audio.currentTime = 4;
        audio.play();
      }
    },
    handleFirstClick() {
      if (!this.musicStarted) {
        this.playMusic();
      }
    },
    toggleMusic() {
      const audio = this.$refs.bgMusic;
      if (!audio) return;
      
      if (this.isMuted) {
        audio.play();
        this.isMuted = false;
        this.musicStarted = true;
      } else {
        audio.pause();
        this.isMuted = true;
      }
    },
    nextPhoto() {
      if (this.currentPhotoIndex < this.photos.length - 1) {
        this.currentPhotoIndex++;
        
        // Nếu đã đến ảnh cuối cùng
        if (this.currentPhotoIndex === this.photos.length - 1) {
          this.showRedirect = true;
          // Dừng tự động chuyển ảnh khi đến cuối
          if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
          }
        }
      }
    },
    prevPhoto() {
      if (this.currentPhotoIndex > 0) {
        this.currentPhotoIndex--;
        // Reset interval if user interacts manually (though it might already be null if at the end)
        this.resetAutoSlide();
      }
    },
    resetAutoSlide() {
      // Chỉ reset nếu chưa đến ảnh cuối cùng
      if (this.currentPhotoIndex < this.photos.length - 1) {
        if (this.autoSlideInterval) {
          clearInterval(this.autoSlideInterval);
        }
        this.startAutoSlide();
      }
    },
    redirectToLove() {
      window.location.href = "https://love.tsonit.com/ahihihoho";
    }
  }
}
</script>

<style>
@import '~/assets/css/pages/valentine.css';
</style>
