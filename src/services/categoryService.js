import httpAxios from "../httpAxios";

const categoryService = {
  getFlatCategories: () => {
    return httpAxios.get(`admin/categories/flat`);
  },
  getAllCategories: (page = 1, per_page = 10) => {
    return httpAxios.get(`admin/categories?page=${page}&per_page=${per_page}`);
  },
  updateStatus: (id) => {
    return httpAxios.post(`admin/categories/${id}/status`);
  },
  addCategory: (data) => {
    return httpAxios.post(`admin/categories`, data);
  },
  updateCategory: (id, data) => {
    return httpAxios.post(`admin/categories/${id}`, data);
  },
  getCategoryById: (id) => {
    return httpAxios.get(`admin/categories/${id}`);
  },
  getShippingCategories: () => {
    return httpAxios.get(`admin/categories/shipping-categories`);
  },
  addShippingCategory: (data) => {
    return httpAxios.post(`admin/shipping-categories`, data);
  },
  updateShippingCategory: (id, data) => {
    return httpAxios.post(`admin/shipping-categories/${id}`, data);
  },
  getRootCategories: () => {
    return httpAxios.get(`admin/shipping/categories`);
  },
};

export default categoryService;
