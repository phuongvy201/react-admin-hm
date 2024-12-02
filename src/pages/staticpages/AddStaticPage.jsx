import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import sellerService from "../../services/sellerService";
import Swal from "sweetalert2";
import postService from './../../../../hmfulfill/src/service/PostService';
export default function AddStaticPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [detail, setDetail] = useState("");
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState(1);
  const [topicId, setTopicId] = useState("");
  const [topics, setTopics] = useState([]); // Danh sách topics
  const [type, setType] = useState(1);

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
  });

  // Lấy danh sách topics khi component mount
  useEffect(() => {
    // Gọi API lấy danh sách topics
    postService
      .getTopics()
      .then((response) => {
        setTopics(response.data);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy danh sách topics:", error);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const postData = new FormData();
    postData.append("title", title);
    postData.append("description", description);
    postData.append("detail", detail);
    postData.append("status", parseInt(status));
    postData.append("topic_id", parseInt(topicId));
    postData.append("type", parseInt(type));
    if (image) {
      postData.append("image", image);
    }
    postData.append("created_by", 1); // ID của user hiện tại
    postData.append("updated_by", 1);

    postService
      .createPost(postData)
      .then((response) => {
        if (response.data.success) {
          Toast.fire({
            icon: "success",
            title: "Thêm bài viết thành công!",
          });

          // Reset form
          setTitle("");
          setDescription("");
          setDetail("");
          setImage(null);
          setStatus(1);
          setTopicId("");
          setType(1);

          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      })
      .catch((error) => {
        Toast.fire({
          icon: "error",
          title:
            error.response?.data?.message || "Có lỗi xảy ra khi thêm bài viết!",
        });
      });
  };

  return (
    <div className="content-wrapper" style={{ minHeight: "1604.8px" }}>
      {/* Content Header (Page header) */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Thêm Bài Viết</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="/">Trang chủ</Link>
                </li>
                <li className="breadcrumb-item active">Thêm bài viết</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="title">Tiêu đề</label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Mô tả ngắn</label>
                <textarea
                  className="form-control"
                  id="description"
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="detail">Nội dung chi tiết</label>
                <textarea
                  className="form-control"
                  id="detail"
                  rows="6"
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="image">Hình ảnh</label>
                <input
                  type="file"
                  className="form-control"
                  id="image"
                  onChange={(e) => setImage(e.target.files[0])}
                  accept="image/*"
                />
              </div>

              <div className="form-group">
                <label htmlFor="topic">Chủ đề</label>
                <select
                  className="form-control"
                  id="topic"
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  required
                >
                  <option value="">Chọn chủ đề</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status">Trạng thái</label>
                <select
                  className="form-control"
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="1">Hiện</option>
                  <option value="2">Ẩn</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="type">Loại bài viết</label>
                <select
                  className="form-control"
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="1">Tin tức</option>
                  <option value="2">Bài viết</option>
                </select>
              </div>
            </div>

            <div className="card-footer">
              <button type="submit" className="btn btn-primary float-right">
                Thêm bài viết
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
