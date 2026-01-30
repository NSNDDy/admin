export default function ({ $axios, redirect }) {
  $axios.onRequest(config => {
    // Tự động thêm Token vào mọi request
    if (process.client) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.common['Authorization'] = `Bearer ${token}`;
      }
    }
    console.log('Making request to ' + config.url);
  });

  $axios.onError(error => {
    const code = parseInt(error.response && error.response.status);
    if (code === 401) {
      // Token hết hạn hoặc không hợp lệ -> Logout
      if (process.client) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
      redirect('/login');
    }
  });
}
