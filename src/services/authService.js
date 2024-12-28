import httpAxios from "../httpAxios";

const authService = {
  login: (data) => {
    return httpAxios.post(`/login`, data);
  },
  logout: () => {
    return httpAxios.post(`/logout`);
  },
  checkSession: () => {
    return httpAxios.get(`/check-session`);
  },
};

export default authService;
