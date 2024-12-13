import httpAxios from "../httpAxios";

const postService = {
  getAllPost: () => {
    return httpAxios.get(`posts`);
  },
  getAllPages: () => {
    return httpAxios.get(`posts/pages`);
  },
  addPages: (pageData) => {
    return httpAxios.post(`admin/pages`, pageData);
  },
  updateStatus: (id) => {
    return httpAxios.post(`admin/post/${id}/status`);
  },
  delete: (id) => {
    return httpAxios.delete(`admin/post/${id}`);
  },
  getPostById: (id) => {
    return httpAxios.get(`admin/post/${id}`);
  },
  updatePage: (id, pageData) => {
    return httpAxios.post(`admin/page/${id}`, pageData);
  },
  getPostBySeller: () => {
    return httpAxios.get(`seller/posts`);
  },
  getPostByAdmin: () => {
    return httpAxios.get(`admin/posts`);
  },
  addPosts: (postData) => {
    return httpAxios.post(`seller/post`, postData);
  },
  getTopics: () => {
    return httpAxios.get(`topics`);
  },
  updatePost: (id, postData) => {
    return httpAxios.post(`seller/post/${id}/update`, postData);
  },
};

export default postService;
