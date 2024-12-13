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
  searchProductBySeller: (data) => {
    const queryParams = new URLSearchParams(data).toString();
    return httpAxios.get(`seller/product/search?${queryParams}`);
  },
};

export default productService;
