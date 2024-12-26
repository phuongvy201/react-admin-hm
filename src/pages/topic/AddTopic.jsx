import { CKEditor } from "@ckeditor/ckeditor5-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import topicService from "../../services/topicService";
import Swal from "sweetalert2";
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});
export default function AddTopic() {
  const [name, setName] = useState(""); // Instance của CropperJS
  const [description, setDescription] = useState(""); // Instance của CropperJS
  const handleSubmit = (e) => {
    e.preventDefault();

    const topicData = new FormData();
    topicData.append("name", name);
    topicData.append("description", description);
    topicData.append("status", 1);

    topicService
      .postTopic(topicData)
      .then((response) => {
        if (response.data.success) {
          Toast.fire({
            icon: "success",
            title: "Added posts successfully!",
          });
          setName("");
          setDescription("");
        }
      })
      .catch((error) => {
        console.error("Error details:", error.response?.data);
        Toast.fire({
          icon: "error",
          title:
            error.response?.data?.message || "Có lỗi xảy ra khi thêm sản phẩm!",
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
              <h1>Topic Add</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="#">Home</Link>
                </li>
                <li className="breadcrumb-item active">Topic Add</li>
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
            <div className="col-md-6 justify-content-center">
              <div className="card card-primary">
                <div className="card-body">
                  <div className="form-group">
                    <label htmlFor="inputName">Topic Name</label>
                    <input
                      type="text"
                      value={name}
                      id="inputName"
                      placeholder="Enter topic name"
                      onChange={(e) => setName(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputDescription">Topic Description</label>
                    <textarea
                      id="inputDescription"
                      className="form-control"
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter topic description"
                    />
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
                Create Topic
              </button>
            </div>
          </div>
        </form>
      </section>
      {/* /.content */}
    </div>
  );
}
