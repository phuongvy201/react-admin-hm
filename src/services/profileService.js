import httpAxios from "../httpAxios";

const profileService = {
  getShopInfo: (id) => {
    return httpAxios.get(`seller/profile-shop/${id}`);
  },
};

export default profileService;
