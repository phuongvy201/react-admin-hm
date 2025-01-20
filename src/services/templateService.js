import httpAxios from "../httpAxios";

const templateService = {
  getTemplates: () => {
    return httpAxios.get(`/seller/product-templates`);
  },
  postTemplates: (data) => {
    return httpAxios.post(`/seller/product-templates`, data);
  },
  deleteTemplate: (id) => {
    return httpAxios.delete(`/seller/product-templates/${id}`);
  },
  updateTemplate: (id, data) => {
    return httpAxios.post(`/seller/product-templates/${id}`, data);
  },
  copyTemplate: (id) => {
    return httpAxios.post(`/seller/product-templates/copy/${id}`);
  },
  getTemplate: (id) => {
    return httpAxios.get(`/seller/templates/${id}`);
  },
  addVariants: (id, data) => {
    return httpAxios.post(`/seller/product-templates/${id}/variants`, data);
  },
};

export default templateService;
