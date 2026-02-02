# Boilerplate Thiết Kế API Cho Dự Án Vue/Nuxt

Tài liệu này mô tả cấu trúc "Store Factory Pattern" được chuẩn hóa để tái sử dụng logic gọi API, quản lý state và phân trang cho các dự án Vue.js/Nuxt.js.

## 1. Cấu Trúc Thư Mục

```
/src
  /constants
    api.constant.js    # Các mã lỗi, config mặc định
  /services
    BaseApiService.js  # Lớp bọc Axios (Wrapper)
  /store
    /core
      StoreFactory.js  # Lõi trung tâm (Logic CRUD tái sử dụng)
    productStore.js    # Ví dụ áp dụng
  /plugins
    axios.js           # Interceptors (Xử lý request/response chung)
```

## 2. Chi Tiết Triển Khai

### 2.1. Constants (`src/constants/api.constant.js`)

Định nghĩa các quy ước giao tiếp giữa FE và BE.

```javascript
export const API_STATUS = {
  SUCCESS: 0,
  ERROR: 1,
  NO_AUTH: 401,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

export const PAGINATION_DEFAULT = {
  CURRENT_PAGE: 1,
  TOTAL_PAGE_CNT: 1,
  TOTAL_RECORD_CNT: 0,
  RECORDS_PER_PAGE: 20,
};
```

### 2.2. Service Layer (`src/services/BaseApiService.js`)

Lớp wrapper cho Axios, giúp gọi API gọn gàng hơn.

```javascript
/**
 * Base Service Wrapper
 * Chịu trách nhiệm thực hiện các cuộc gọi HTTP cơ bản
 */
export default class BaseApiService {
  constructor(axiosInstance, prefixUrl) {
    this.axios = axiosInstance;
    this.prefix = prefixUrl;
  }

  // Helper để tạo URL
  _url(path) {
    return path ? `${this.prefix}/${path}` : this.prefix;
  }

  async get(url, params = {}) {
    return await this.axios.get(this._url(url), { params });
  }

  async post(url, data = {}) {
    return await this.axios.post(this._url(url), data);
  }

  async put(url, data = {}) {
    return await this.axios.put(this._url(url), data);
  }

  async delete(url, params = {}) {
    return await this.axios.delete(this._url(url), { params });
  }

  // Dành cho download file (Blob)
  async download(url, data = {}) {
    return await this.axios.post(this._url(url), data, {
      responseType: 'blob',
    });
  }
}
```

### 2.3. Core Factory (`src/store/core/StoreFactory.js`)

Đây là "trái tim" của kiến trúc. Nó tạo ra state, mutations và actions chuẩn cho mọi module.

```javascript
import BaseApiService from '@/services/BaseApiService';
import { API_STATUS, PAGINATION_DEFAULT } from '@/constants/api.constant';

export default class StoreFactory {
  /**
   * @param {string} namespace - Tên module (để debug)
   * @param {string} urlPrefix - Đường dẫn API gốc (vd: '/api/products')
   */
  constructor(namespace, urlPrefix) {
    this.urlPrefix = urlPrefix;

    // 1. STATE CHUẨN
    this.state = {
      list: [],           // Danh sách dữ liệu (Table)
      item: {},           // Chi tiết 1 đối tượng (Form edit)
      loading: false,
      pagination: { ...PAGINATION_DEFAULT },
      messages: [],       // Thông báo lỗi/thành công từ BE
    };

    // 2. MUTATIONS CHUẨN
    this.mutations = {
      SET_LOADING(state, status) {
        state.loading = status;
      },
      
      // Tự động map response vào state list và pagination
      SET_LIST_DATA(state, responseData) {
        state.list = responseData.items || []; // Giả sử BE trả về field 'items'
        
        // Map phân trang an toàn
        const pageInfo = responseData.pageInfo || {};
        state.pagination = {
          currentPage: Number(pageInfo.currentPage) || PAGINATION_DEFAULT.CURRENT_PAGE,
          totalPageCnt: Number(pageInfo.totalPageCnt) || PAGINATION_DEFAULT.TOTAL_PAGE_CNT,
          totalRecordCnt: Number(pageInfo.totalRecordCnt) || PAGINATION_DEFAULT.TOTAL_RECORD_CNT,
          recordsPerPage: Number(pageInfo.recordsPerPage) || PAGINATION_DEFAULT.RECORDS_PER_PAGE,
        };
      },

      SET_ITEM(state, item) {
        state.item = item || {};
      },

      SET_MESSAGES(state, messages) {
        state.messages = messages || [];
      },
      
      RESET_STATE(state) {
        state.list = [];
        state.item = {};
        state.messages = [];
        state.pagination = { ...PAGINATION_DEFAULT };
      }
    };

    // 3. ACTIONS CHUẨN
    this.actions = {
      // Action tìm kiếm/lấy danh sách chung
      // axios: instance được inject từ component hoặc plugin
      async fetchList({ commit }, { axios, url = '', params = {} }) {
        commit('SET_LOADING', true);
        const service = new BaseApiService(axios, this.urlPrefix);
        
        try {
          const res = await service.post(url, params); // Thường search là POST để gửi body phức tạp
          
          if (res.data.status === API_STATUS.SUCCESS) {
            commit('SET_LIST_DATA', res.data.data);
            return true;
          } else {
            // Xử lý logic khi BE trả về lỗi nghiệp vụ (nhưng HTTP vẫn 200)
            commit('SET_MESSAGES', res.data.messages);
            return false;
          }
        } catch (error) {
          console.error(`[${namespace}] Fetch Error:`, error);
          return false;
        } finally {
          commit('SET_LOADING', false);
        }
      },

      // Action tạo mới
      async create({ commit }, { axios, url = 'create', data }) {
        commit('SET_LOADING', true);
        const service = new BaseApiService(axios, this.urlPrefix);
        try {
            const res = await service.post(url, data);
            // Logic xử lý kết quả...
            return res.data.status === API_STATUS.SUCCESS;
        } finally {
            commit('SET_LOADING', false);
        }
      },
      
      // Các action update, delete tương tự...
    };
  }
}
```

### 2.4. Axios Interceptor (`src/plugins/axios.js`)

Xử lý logic "biến hình" dữ liệu trước khi gửi đi (như logic phân trang) và xử lý lỗi global.

```javascript
export default function ({ $axios, redirect }) {
  // REQUEST INTERCEPTOR
  $axios.onRequest((config) => {
    // Tự động format lại tham số phân trang nếu có
    if (config.data && config.data.pagination) {
      const { pagination, ...otherData } = config.data;
      
      config.data = {
        ...otherData,
        page: pagination.currentPage,
        limit: pagination.recordsPerPage,
        // Thêm các tham số sort nếu cần
      };
    }
    return config;
  });

  // RESPONSE INTERCEPTOR
  $axios.onResponse((response) => {
    // Xử lý session timeout
    if (response.data.status === 401) {
       redirect('/login');
    }
    
    // Xử lý download file (Blob to JSON nếu lỗi)
    if (response.data instanceof Blob && response.data.type === 'application/json') {
       // Logic đọc blob thành text JSON để hiện lỗi
    }
    
    return response;
  });
}
```

## 3. Cách Áp Dụng (Ví dụ: ProductStore)

Khi tạo module mới, bạn chỉ cần kế thừa từ Factory.

**File:** `src/store/productStore.js`

```javascript
import StoreFactory from './core/StoreFactory';

// 1. Khởi tạo factory với prefix API
const factory = new StoreFactory('ProductStore', 'api/v1/products');

export const state = () => ({
  ...factory.state,
  // Thêm state riêng nếu cần
  customFilter: null 
});

export const mutations = {
  ...factory.mutations,
  // Thêm mutation riêng nếu cần
  SET_CUSTOM_FILTER(state, val) { state.customFilter = val; }
};

export const actions = {
  ...factory.actions,

  // Override hoặc thêm action mới cực gọn
  async searchProducts({ commit }, params) {
    // Gọi action chung từ factory
    // 'search' là endpoint con: api/v1/products/search
    return await factory.actions.fetchList(
      { commit }, 
      { axios: this.$axios, url: 'search', params }
    );
  }
};
```
