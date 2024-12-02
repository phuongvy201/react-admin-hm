import httpAxios from "../httpAxios";

const discountService = {
  getAllDiscounts: (page = 1) => {
    return httpAxios.get(`admin/discounts?page=${page}`);
  },
  createDiscount: (data) => {
    return httpAxios.post(`admin/discounts`, data);
  },
  updateStatus: (id) => {
    return httpAxios.post(`admin/discounts/${id}/status`);
  },
  updateDiscount: (id, data) => {
    return httpAxios.post(`admin/discounts/${id}/update`, data);
  },
  getDiscountById: (id) => {
    return httpAxios.get(`admin/discounts/${id}`);
  },
  getDiscountsBySeller: (id) => {
    return httpAxios.get(`seller/discounts/seller/${id}`);
  },
  deleteDiscount: (id) => {
    return httpAxios.delete(`discounts/${id}`);
  },
};

export default discountService;
