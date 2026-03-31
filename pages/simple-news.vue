<template>
  <div class="simple-news-page">
    <h1>Tin tức đơn giản</h1>
    
    <!-- Hiển thị danh sách tin tức -->
    <div class="news-list">
      <div v-for="post in posts" :key="post.id" class="news-item">
        <h3>{{ post.title }}</h3>
        <p>{{ post.body }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SimpleNewsPage',
  data() {
    return {
      posts: []
    }
  },
  mounted() {
    this.getPosts()
  },
  methods: {
    getPosts() {
      fetch('https://jsonplaceholder.typicode.com/posts?_limit=5')
        .then(response => response.json())
        .then(data => {
          this.posts = data
        })
        .catch(error => {
          console.error('Lỗi:', error)
        })
    }
  }
}
</script>
