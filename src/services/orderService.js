import httpAxios from "../httpAxios";

const orderService = {
  getAllOrders: () => {
    return httpAxios.get(`admin/orders`);
  },
  getOrderBySeller: () => {
    return httpAxios.get(`seller/orders`);
  },
  getOrderById: (id) => {
    return httpAxios.get(`seller/orders/${id}`);
  },
  updateStatus: (id, data) => {
    return httpAxios.post(`seller/orders/${id}/status`, data);
  },
};

export default orderService;
