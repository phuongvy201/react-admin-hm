import httpAxios from "../httpAxios";

const productService = {
  getAllProducts: (page = 1) => {
    return httpAxios.get(`admin/products?page=${page}`);
  },
  addNewProduct: (data) => {
    return httpAxios.post(`admin/products`, data);
  },
  updateProduct: (id, data) => {
    return httpAxios.post(`admin/products/${id}/update`, data);
  },
  getProductColors: (id) => {
    return httpAxios.get(`admin/products/${id}/colors`);
  },
  getProductSizes: (id) => {
    return httpAxios.get(`admin/products/${id}/sizes`);
  },
  getProductById: (id) => {
    return httpAxios.get(`admin/products/${id}`);
  },
  getProductBySeller: (id) => {
    return httpAxios.get(`seller/products/seller/${id}`);
  },
  updateProductStatus: (id) => {
    return httpAxios.post(`products/${id}/status`);
  },
  deleteProduct: (id) => {
    return httpAxios.delete(`admin/products/${id}`);
  },
};

export default productService;
