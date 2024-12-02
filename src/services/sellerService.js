import httpAxios from "../httpAxios";

const sellerService = {
  getEmployees: () => {
    return httpAxios.get("admin/employees");
  },
  createEmployee: (data) => {
    return httpAxios.post("admin/employees", data);
  },
  updateStatus: (id, data) => {
    return httpAxios.post(`admin/employees/${id}/status`, data);
  },
  deleteEmployee: (id) => {
    return httpAxios.delete(`admin/employees/${id}`);
  },
  getEmployeeById: (id) => {
    return httpAxios.get(`admin/employees/${id}`);
  },
  updateEmployee: (id, data) => {
    return httpAxios.post(`admin/employees/${id}`, data);
  },
  getCustomers: (page = 1) => {
    return httpAxios.get(`admin/customers?page=${page}`);
  },
};

export default sellerService;
