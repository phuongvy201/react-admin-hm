import httpAxios from "../httpAxios";

const orderService = {
  getAllOrders: () => {
    return httpAxios.get(`admin/orders`);
  },
  getOrderBySeller: () => {
    return httpAxios.get(`seller/orders`);
  },
};

export default orderService;
