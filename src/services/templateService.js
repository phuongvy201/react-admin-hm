import httpAxios from "../httpAxios";

const templateService = {
  getTemplates: () => {
    return httpAxios.get(`/seller/templates`);
  },
  postTemplates: (data) => {
    return httpAxios.post(`/seller/templates`, data);
  },
  deleteTemplate: (id) => {
    return httpAxios.delete(`/seller/templates/${id}`);
  },
  updateTemplate: (id, data) => {
    return httpAxios.post(`/seller/templates/${id}`, data);
  },
  getTemplate: (id) => {
    return httpAxios.get(`/seller/templates/${id}`);
  },
};

export default templateService;
