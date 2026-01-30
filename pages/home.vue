<template>
 <div>
    <Header />
    
    <!-- <Footer /> -->
  </div>
</template>

<script>
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'

export default {
  name: 'HomePage',
 

  data() {
    return{
      message:'hello'
    }
  },
  mounted() {
    console.log(this.message);
  },

  components: {
    Header,
    Footer
  }
};
</script>