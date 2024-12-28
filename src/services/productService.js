import httpAxios from "../httpAxios";

const productService = {
  getAllProducts: (page = 1) => {
    return httpAxios.get(`admin/products?page=${page}`);
  },
  addNewProduct: (data) => {
    return httpAxios.post(`seller/products`, data);
  },
  updateProduct: (id, data) => {
    return httpAxios.post(`seller/products/${id}/update`, data);
  },
  getProductColors: (id) => {
    return httpAxios.get(`seller/products/${id}/colors`);
  },
  getProductSizes: (id) => {
    return httpAxios.get(`admin/products/${id}/sizes`);
  },
  getProductById: (id) => {
    return httpAxios.get(`products/${id}`);
  },
  getProductBySeller: (page = 1) => {
    return httpAxios.get(`seller/products/seller?page=${page}`);
  },
  updateProductStatus: (id) => {
    return httpAxios.post(`products/${id}/status`);
  },
  deleteProduct: (id) => {
    return httpAxios.delete(`products/${id}`);
  },
  searchProductBySeller: (data) => {
    const queryParams = new URLSearchParams(data).toString();
    return httpAxios.get(`seller/product/search?${queryParams}`);
  },
  copyProduct: (id) => {
    return httpAxios.post(`seller/products/${id}/copy`);
  },
  importProduct: (data) => {
    return httpAxios.post(`seller/products/import`, data);
  },
  addProductByTemplate: (data) => {
    return httpAxios.post(`seller/products/add-by-template`, data);
  },
  getProductTypes: (id) => {
    return httpAxios.get(`seller/products/types/${id}`);
  },
};  

export default productService;
