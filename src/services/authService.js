import httpAxios from "../httpAxios";

const authService = {
  login: (data) => {
    return httpAxios.post(`/login`, data);
  },
  logout: () => {
    return httpAxios.post(`/logout`);
  },
};

export default authService;
