<template>
  <transition-group name="toast" tag="div" class="global-toast-container">
    <div v-for="toast in toasts" :key="toast.id" class="glass-toast" @click="handleToastClick(toast)">
      <div class="toast-avatar">
        <img :src="toast.sender.avatar || 'https://via.placeholder.com/40'" alt="avatar">
      </div>
      <div class="toast-content">
        <div class="toast-user">{{ toast.sender.username }}</div>
        <div class="toast-msg">{{ truncateText(toast.content, 40) }}</div>
      </div>
      <button class="toast-close" @click.stop="removeToast(toast.id)">&times;</button>
    </div>
  </transition-group>
</template>

<script>
export default {
  name: 'GlobalNotification',
  computed: {
    toasts() {
      // Access via $notifier injected in plugin
      return this.$notifier && this.$notifier.state ? this.$notifier.state.toasts : [];
    }
  },
  methods: {
    removeToast(id) {
      if (this.$notifier) this.$notifier.removeToast(id);
    },
    handleToastClick(toast) {
      if (this.$notifier) this.$notifier.handleToastClick(toast);
    },
    truncateText(text, length) {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    }
  }
}
</script>

<style scoped>
/* Scoped styles if needed, but we already have them in style.css */
</style>
