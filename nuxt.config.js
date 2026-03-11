
export default {
  mode: 'universal',
  /*
  ** Headers of the page
  */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      // Favicon
      // { rel: 'icon', type: 'image/png', href: '/assets/img/favicon.png' },
      // { rel: 'apple-touch-icon', href: '/assets/img/apple-touch-icon.png' },

      // Google Fonts
      {rel:"preconnect", href:"https://fonts.googleapis.com"},
      {rel:"preconnect", href:"https://fonts.gstatic.com"},
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Raleway:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap' },
      
      

      // Main CSS
      { rel: 'stylesheet', href: '/css/style.css' },
    ],
    script: [
      // Main Js File
      {
        src: '/js/main.js',
      },
      

      
    ]
  },
  /*
  ** Environment variables
  */
  env: {
    SOCKET_URL: process.env.SOCKET_URL,
    API_URL: process.env.API_URL,
    BROWSER_API_URL: process.env.BROWSER_API_URL
  },
  publicRuntimeConfig: {
    socketUrl: process.env.SOCKET_URL || '',
    apiUrl: process.env.API_URL || ''
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '~/plugins/axios.js',
    '~/plugins/repository.js'
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://bootstrap-vue.js.org
    'bootstrap-vue/nuxt',
    '@nuxtjs/axios'
  ],
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
    }
  },

  server: {
    port: process.env.PORT || process.env.NUXT_PORT || 4000,
    host: process.env.HOST || process.env.NUXT_HOST || '0.0.0.0'
  },

   axios: {
    proxy: true,
    baseURL: process.env.API_URL || 'http://localhost:8090',
    browserBaseURL: '/'
  },
  proxy: {
    '/api/': {
      target: process.env.API_URL || 'http://localhost:8090',
      changeOrigin: true
    },
    '/auth/': {
      target: process.env.API_URL || 'http://localhost:8090',
      changeOrigin: true
    },
    '/api-login': {
      target: process.env.API_URL || 'http://localhost:8090',
      changeOrigin: true
    }
  }
}
