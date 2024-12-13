import httpAxios from "../httpAxios";

const mailService = {
  sendMail: (data) => {
    return httpAxios.post(`/admin/send-email`, data);
  },
};

export default mailService;
