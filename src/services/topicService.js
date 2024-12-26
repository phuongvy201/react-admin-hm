import httpAxios from "../httpAxios";

const topicService = {
  postTopic: (data) => {
    return httpAxios.post(`admin/addTopic`, data);
  },
  deleteTopic: (id) => {
    return httpAxios.delete(`admin/topics/${id}`);
  },
};

export default topicService;
