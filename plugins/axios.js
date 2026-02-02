export default function ({ $axios, redirect }) {
  $axios.onRequest(config => {
    // Tự động thêm Token vào mọi request
    if (process.client) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.common['Authorization'] = `Bearer ${token}`;
      }
    }

    // Tự động format lại tham số phân trang nếu có (Chuẩn hóa API)
    if (config.data && config.data.pagination) {
      const { pagination, ...otherData } = config.data;
      
      config.data = {
        ...otherData,
        page: pagination.currentPage,
        limit: pagination.recordsPerPage,
        // Thêm các tham số sort nếu cần
      };
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
