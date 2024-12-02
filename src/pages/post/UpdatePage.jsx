import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import Swal from "sweetalert2";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import postService from "../../services/postService";

// Khởi tạo Toast
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});
const user = JSON.stringify(localStorage.getItem("user"));
export default function UpdatePage() {
  const [name, setName] = useState(""); // Hiển thị modal
  const [post, setPost] = useState({}); // Hiển thị modal
  const [description, setDescription] = useState(""); // Hiển thị modal
  const [detail, setDetail] = useState(""); // Hiển thị modal
  const { id } = useParams();
  const [status, setStatus] = useState(1); // Hiển thị modal
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await postService.getPostById(id);
      console.log(response);
      if (response.data.success) {
        setPost(response.data.data);
        setName(response.data.data.title);
        setDetail(response.data.data.detail);
        setDescription(response.data.data.description);
        setStatus(response.data.data.status);
      }
    } catch (err) {
      setError("Unable to load article list");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  const handleSubmit = (e) => {
    e.preventDefault();
    const pageData = new FormData();
    pageData.append("title", name);
    pageData.append("description", description);
    pageData.append("detail", detail);
    pageData.append("status", status);
    pageData.append("created_by", user.id);
    pageData.append("updated_by", user.id);
    postService
      .updatePage(id, pageData)
      .then((response) => {
        if (response.data.success) {
          // Thông báo thành công
          Toast.fire({
            icon: "success",
            title: "Single page updated successfully!",
          });

          // Scroll to top
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      })
      .catch((error) => {
        console.error("Error details:", error.response?.data); // Log chi tiết lỗi
        Toast.fire({
          icon: "error",
          title:
            error.response?.data?.message ||
            "An error occurred while updating the single page!",
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
              <h1>Page Add</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="#">Home</Link>
                </li>
                <li className="breadcrumb-item active">Page Add</li>
              </ol>
            </div>
          </div>
        </div>
        {/* /.container-fluid */}
      </section>
      {/* Main content */}
      <section className="content">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-12">
              <div className="card card-primary">
                <div className="card-body">
                  <div className="form-group">
                    <label htmlFor="inputName">Page Title</label>
                    <input
                      type="text"
                      value={name}
                      id="inputName"
                      placeholder="Enter page title"
                      onChange={(e) => setName(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputDescription">Page Description</label>
                    <textarea
                      id="inputDescription"
                      className="form-control"
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter page description"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputDescription">Page Detail</label>
                    <CKEditor
                      editor={ClassicEditor}
                      data={detail} // Nội dung ban đầu
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setDetail(data); // Cập nhật state
                      }}
                      config={{
                        placeholder: "Enter page description", // Placeholder
                        toolbar: [
                          "heading",
                          "|",
                          "bold",
                          "italic",
                          "link",
                          "bulletedList",
                          "numberedList",
                          "|",
                          "blockQuote",
                          "undo",
                          "redo",
                        ],
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputStatus">Status</label>
                    <select
                      id="selectStatus"
                      name="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="form-control custom-select"
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </div>
                </div>
                {/* /.card-body */}
              </div>
              {/* /.card */}
            </div>
          </div>
          <div className="row">
            <div className="col-12 d-flex justify-content-end">
              <button
                type="submit"
                className="btn btn-success swalDefaultSuccess"
              >
                Update Page
              </button>
            </div>
          </div>
        </form>
      </section>
      {/* /.content */}
    </div>
  );
}
