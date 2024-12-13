import httpAxios from "../httpAxios";

const profileService = {
  getShopInfo: (sellerId) => {
    return httpAxios.get(`profile-shop/${sellerId}`);
  },
  follow: (sellerId) => {
    return httpAxios.get(`profile-shop/${sellerId}`);
  },
  createProfile: (data) => {
    return httpAxios.post(`seller/profile`, data);
  },
  checkExistProfile: () => {
    return httpAxios.get(`seller/check-profile`);
  },
  getProfileShopInfo: () => {
    return httpAxios.get(`seller/profile`);
  },
};

export default profileService;
