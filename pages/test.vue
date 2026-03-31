<template>
  <div class="test-page">
    <!-- Checkbox -->
    <label>
      <input type="checkbox" v-model="useText1" />
      Sử dụng ô text 1 (tích để bật ô 1, tắt ô 2)
    </label>

    <!-- Ô text 1: chỉ hoạt động khi checkbox được tích -->
    <div>
      <label>Ô text 1:</label>
      <input 
        type="text" 
        v-model="text1" 
        :disabled="!useText1"
        placeholder="Chỉ hoạt động khi checkbox được tích"
      />
    </div>

    <!-- Ô text 2: chỉ hoạt động khi checkbox KHÔNG được tích -->
    <div>
      <label>Ô text 2:</label>
      <input 
        type="text" 
        v-model="text2" 
        :disabled="useText1"
        placeholder="Chỉ hoạt động khi checkbox không tích"
      />
    </div>

    <!-- Hiển thị giá trị để test -->
    <p>Giá trị ô 1: {{ text1 }}</p>
    <p>Giá trị ô 2: {{ text2 }}</p>

    <div>
      <input type="month"lang="ja">
    </div>
  </div>
</template>

<script>
export default {
  layout: 'default',
  data() {
    return {
      useText1: false,   // false = ô 2 hoạt động, true = ô 1 hoạt động
      text1: '',
      text2: ''
    }
  }
}
</script>
