import httpAxios from "../httpAxios";

const shippingService = {
  updateTracking: (id, data) => {
    return httpAxios.post(`/seller/shippings/${id}/update-tracking`, data);
  },
};

export default shippingService;
