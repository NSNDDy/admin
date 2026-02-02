import BaseApiService from '~/services/BaseApiService';
import { API_STATUS, PAGINATION_DEFAULT } from '~/constants/api.constant';

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
