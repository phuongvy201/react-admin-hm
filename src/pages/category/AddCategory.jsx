import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import categoryService from "../../services/categoryService";
import Swal from "sweetalert2";

// Khởi tạo Toast
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

export default function AddCategory() {
  const [image, setImage] = useState(null); // Lưu ảnh tải lên
  const [cropper, setCropper] = useState(null); // Instance của CropperJS
  const [cropData, setCropData] = useState(""); // Kết quả ảnh đã cắt
  const [showCropper, setShowCropper] = useState(false); // Hiển thị modal
  const [categories, setCategories] = useState([]); // Hiển thị modal
  const [name, setName] = useState(""); // Hiển thị modal
  const [description, setDescription] = useState(""); // Hiển thị modal
  const [parent_id, setParentId] = useState(null); // Hiển thị modal
  const [status, setStatus] = useState(1); // Hiển thị modal

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getFlatCategories();
        setCategories(response.data.data); // Giả sử API trả về data trong response.data.data
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);
  // Hàm xử lý khi chọn ảnh
  const handleImageChange = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result); // Chuyển đổi file ảnh thành base64
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Hàm lấy dữ liệu ảnh đã cắt
  const getCropData = () => {
    if (cropper) {
      setCropData(cropper.getCroppedCanvas().toDataURL());
      setShowCropper(false); // Đóng modal sau khi cắt
    }
  };

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1]; // Lấy mime type từ chuỗi base64
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    // Sử dụng mime type thực tế của file
    return new File([u8arr], filename, { type: mime });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const categoryData = new FormData();
    const mainImageFile = dataURLtoFile(cropData, "main-category-image.png");
    // Thêm các trường cơ bản
    categoryData.append("name", name);
    categoryData.append("description", description);
    if (parent_id !== null && parent_id !== undefined) {
      categoryData.append("parent_id", parent_id);
    }

    categoryData.append("status", status);
    categoryData.append("image", mainImageFile);
    categoryData.append("created_by", 1);
    categoryData.append("updated_by", 1);
    categoryService
      .addCategory(categoryData)
      .then((response) => {
        if (response.data.success) {
          // Thông báo thành công
          Toast.fire({
            icon: "success",
            title: "Thêm sản phẩm thành công!",
          });

          // Reset form

          // Reset description
          setName("");
          setDescription("");
          setParentId("");
          setStatus(1);

          // Reset ảnh chính
          setCropData("");
          setImage("");
          const mainImagePreview = document.querySelector(
            ".mb-4.d-flex.justify-content-center img"
          );
          if (mainImagePreview) {
            mainImagePreview.src =
              "https://cdn-icons-png.flaticon.com/128/179/179378.png";
          }

          // Reset file inputs
          const mainImageInput = document.getElementById("customFile1");
          if (mainImageInput) {
            mainImageInput.value = "";
          }

          // Scroll to top
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      })
      .catch((error) => {
        console.error("Error details:", error.response?.data); // Log chi tiết lỗi
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
              <h1>Category Add</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="#">Home</Link>
                </li>
                <li className="breadcrumb-item active">Category Add</li>
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
            <div className="col-md-6">
              <div className="card card-primary">
                <div className="card-body">
                  <div className="form-group">
                    <label htmlFor="inputName">Category Name</label>
                    <input
                      type="text"
                      value={name}
                      id="inputName"
                      placeholder="Enter category name"
                      onChange={(e) => setName(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputDescription">
                      Category Description
                    </label>
                    <textarea
                      id="inputDescription"
                      className="form-control"
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter category description"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="inputCategoryLeader">Category Image</label>
                    <div>
                      <div className="mb-4 d-flex justify-content-center">
                        <img
                          src={
                            cropData ||
                            "https://cdn-icons-png.flaticon.com/128/179/179378.png"
                          }
                          alt="cropped"
                          style={{ width: "60%" }}
                        />
                      </div>
                      <div className="d-flex justify-content-center">
                        <div className="btn btn-info btn-md btn-rounded">
                          <label
                            className="form-label text-white m-1"
                            htmlFor="customFile1"
                          >
                            <small>Choose file</small>
                          </label>
                          <input
                            type="file"
                            className="form-control d-none"
                            id="customFile1"
                            onChange={handleImageChange}
                            placeholder="Choose a image"
                          />
                        </div>
                      </div>

                      {/* Modal Cropper */}
                      {showCropper && (
                        <div
                          className="modal fade show"
                          style={{ display: "block" }}
                        >
                          <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                              <div className="modal-header">
                                <h5 className="modal-title">Crop Image</h5>
                                <button
                                  type="button"
                                  className="close"
                                  onClick={() => setShowCropper(false)}
                                >
                                  <span>&times;</span>
                                </button>
                              </div>
                              <div className="modal-body">
                                <Cropper
                                  style={{ height: 400, width: "100%" }}
                                  initialAspectRatio={1}
                                  aspectRatio={1}
                                  preview=".img-preview"
                                  src={image}
                                  viewMode={1}
                                  guides={true}
                                  minCropBoxHeight={10}
                                  minCropBoxWidth={10}
                                  background={false}
                                  responsive={true}
                                  autoCropArea={1}
                                  checkOrientation={false}
                                  onInitialized={(instance) => {
                                    setCropper(instance);
                                  }}
                                />
                              </div>
                              <div className="modal-footer">
                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  onClick={() => setShowCropper(false)}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-danger"
                                  onClick={getCropData}
                                >
                                  Crop & Save
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* /.card-body */}
              </div>
              {/* /.card */}
            </div>
            <div className="col-md-6">
              <div className="card card-secondary">
                <div className="card-body">
                  <div className="form-group">
                    <label htmlFor="inputStatus">Parent Category</label>
                    <select
                      id="inputStatus"
                      name="category_id"
                      value={parent_id}
                      onChange={(e) => setParentId(e.target.value)}
                      className="form-control custom-select"
                    >
                      <option selected>Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}{" "}
                          {/* name đã bao gồm dấu -- cho subcategories */}
                        </option>
                      ))}
                    </select>
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
                Create Category
              </button>
            </div>
          </div>
        </form>
      </section>
      {/* /.content */}
    </div>
  );
}
