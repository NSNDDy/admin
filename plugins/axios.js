export default function ({ $axios, redirect }) {
  $axios.onRequest(config => {
    if (process.client) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.common['Authorization'] = `Bearer ${token}`;
      }
    }
    console.log('Making request to ' + config.url);
  });

  $axios.onError(async error => {
    const config = error.config || {};
    const status = parseInt(error.response && error.response.status);
    const isRetryable = !error.response || status === 502 || status === 503 || status === 504;
    config.__retryCount = config.__retryCount || 0;
    if (isRetryable && config.__retryCount < 3) {
      config.__retryCount += 1;
      const delay = Math.pow(2, config.__retryCount) * 500;
      await new Promise(r => setTimeout(r, delay));
      return $axios.request(config);
    }
    const code = parseInt(error.response && error.response.status);
    if (code === 401) {
      if (process.client) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
      redirect('/login');
    }
  });
}
