import React, { useEffect, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Cropper } from "react-cropper";
import "cropperjs/dist/cropper.css";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

import {
  COLOR_OPTIONS,
  EDITOR_CONFIG,
  IMAGE_DIMENSIONS,
  SIZE_OPTIONS,
} from "../../../constants/productConstants";
import categoryService from "../../../services/categoryService";
import productService from "../../../services/productService";

export default function AddProductBySeller() {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [cropData, setCropData] = useState("");
  const [cropper, setCropper] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [colorBlocks, setColorBlocks] = useState([]);
  const [colorCropData, setColorCropData] = useState({});
  const [colorCropper, setColorCropper] = useState(null);
  const [showColorCropper, setShowColorCropper] = useState(false);
  const [selectedColorId, setSelectedColorId] = useState(null);
  const [sizeBlocks, setSizeBlocks] = useState([]);
  const [categories, setCategories] = useState([]);
  const sellerId = JSON.parse(localStorage.getItem("user")).id;
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

  useEffect(() => {
    // Khởi tạo Toast của SweetAlert2

    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });

    // Lưu Toast vào biến global để sử dụng trong component
    window.Toast = Toast;
  }, []);
  // Xử lý khi chọn ảnh
  const handleImageChange = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Xử lý khi crop
  const getCropData = () => {
    if (cropper) {
      const cropDataUrl = cropper.getCroppedCanvas().toDataURL();
      setCropData(cropDataUrl);
      setShowCropper(false);
    }
  };
  // Thêm hàm xử lý crop ảnh màu
  const handleColorImageChange = (e, uniqueId) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
        setShowColorCropper(true);
        setSelectedColorId(uniqueId);
      };
      reader.readAsDataURL(file);
    }
  };
  // Thêm hàm xử lý khi crop
  const getColorCropData = () => {
    if (colorCropper && selectedColorId) {
      const cropDataUrl = colorCropper.getCroppedCanvas().toDataURL();
      console.log("Cropped color image for ID:", selectedColorId); // Log để kiểm tra
      console.log("Crop data URL:", cropDataUrl); // Log để kiểm tra

      setColorCropData((prev) => {
        const newData = {
          ...prev,
          [selectedColorId]: cropDataUrl,
        };
        console.log("Updated colorCropData:", newData); // Log để kiểm tra
        return newData;
      });

      // Cập nhật preview
      const img = document.getElementById(`img_${selectedColorId}`);
      if (img) {
        img.src = cropDataUrl;
      }
      setShowColorCropper(false);
    }
  };

  const handleAddColor = () => {
    const uniqueId = "upload_" + Date.now();
    const newBlock = (
      <div className="row" key={uniqueId} data-unique-id={uniqueId}>
        <div className="form-group col-12 col-sm-5 d-flex align-items-center mt-2">
          <select
            className="form-control select-option-color"
            style={{ width: "100%" }}
            data-select2-id="25"
            tabindex="-1"
            aria-hidden="true"
          >
            <option selected>Choose a color</option>
            {COLOR_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
                data-color={option.color}
              >
                {option.value}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-sm-7">
          <div className="row">
            <div className="col-sm-6 d-flex align-items-center">
              <input
                id={uniqueId}
                type="file"
                className="form-control border-0 d-none"
                accept="image/*"
                onChange={(e) => handleColorImageChange(e, uniqueId)}
              />
              <div className="input-group-append">
                <label
                  htmlFor={uniqueId}
                  className="btn btn-light m-0 rounded-pill px-4"
                >
                  <i className="fa fa-cloud-upload mr-2 text-muted"></i>
                  <small className="text-uppercase font-weight-bold text-muted">
                    Choose file
                  </small>
                </label>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="image-area mt-2">
                <img
                  id={`img_${uniqueId}`}
                  src={
                    colorCropData[uniqueId] ||
                    "https://cdn-icons-png.flaticon.com/128/179/179378.png"
                  }
                  alt=""
                  className="img-fluid rounded shadow-sm mx-auto d-block"
                  style={{
                    width: IMAGE_DIMENSIONS.width,
                    height: IMAGE_DIMENSIONS.height,
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    setColorBlocks([...colorBlocks, newBlock]);
  };
  // Thêm hàm xử lý thêm size
  const handleAddSize = () => {
    const uniqueId = "size_" + Date.now();
    const newSizeBlock = (
      <div className="row mt-3" key={uniqueId}>
        <div className="col-sm-6">
          <select
            className="form-control select-option-size"
            style={{ width: "100%" }}
            data-select2-id="25"
            tabIndex="-1"
            aria-hidden="true"
          >
            <option selected>Choose a size</option>
            {SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="col-sm-6">
          <input type="text" className="form-control" placeholder="Price" />
        </div>
      </div>
    );

    setSizeBlocks([...sizeBlocks, newSizeBlock]);
  };
  const [formData, setFormData] = useState({
    name: "",
    seller_id: sellerId, // Giả sử ID người bán cố định là 1
    category_id: "",
    description: "",
    price: "",
    stock: "",
    status: "1",
  });
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Kiểm tra xem có ảnh được chọn chưa
      if (!cropData) {
        window.Toast.fire({
          icon: "error",
          title: "Vui lòng chọn ảnh sản phẩm!",
        });
        return;
      }

      // Hàm chuyển đổi base64 thành file

      const productData = new FormData();
      const mainImageFile = dataURLtoFile(cropData, "main-product-image.png");
      // Thêm các trường cơ bản
      productData.append("name", formData.name);
      productData.append("seller_id", formData.seller_id);
      productData.append("category_id", formData.category_id);
      productData.append("price", formData.price);
      productData.append("stock", formData.stock);
      productData.append("status", formData.status);
      productData.append("description", description);
      productData.append("image", mainImageFile);

      // Xử lý sizes - thêm từng size riêng biệt
      let sizeIndex = 0;
      sizeBlocks.forEach((_, index) => {
        const sizeSelect =
          document.getElementsByClassName("select-option-size")[index];
        const sizeValue = sizeSelect.value;
        const priceInput = sizeSelect
          .closest(".row")
          .querySelector('input[type="text"]');

        if (sizeValue !== "Choose a size" && priceInput.value) {
          productData.append(`sizes[${sizeIndex}][size_value]`, sizeValue);
          productData.append(`sizes[${sizeIndex}][price]`, priceInput.value);
          sizeIndex++;
        }
      });

      // Xử lý colors và ảnh màu đã crop
      let colorIndex = 0;
      for (let index = 0; index < colorBlocks.length; index++) {
        const colorSelect = document.getElementsByClassName(
          "select-option-color"
        )[index];
        const colorValue = colorSelect.value;

        if (colorValue !== "Choose a color") {
          const rowElement = colorSelect.closest(".row");
          const uniqueId = rowElement.getAttribute("data-unique-id");

          if (colorCropData[uniqueId]) {
            const colorImageFile = dataURLtoFile(
              colorCropData[uniqueId],
              `color-${colorValue}.png`
            );
            productData.append(
              `colors[${colorIndex}][color_value]`,
              colorValue
            );
            productData.append(
              `colors[${colorIndex}][color_code]`,
              colorSelect.options[colorSelect.selectedIndex].dataset.color
            );
            productData.append(`colors[${colorIndex}][image]`, colorImageFile);
            colorIndex++;
          }
        }
      }

      // Log để kiểm tra
      console.log("Form Data entries:");
      for (let pair of productData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await productService.addNewProduct(productData);
      if (response.data.success) {
        // Thông báo thành công
        window.Toast.fire({
          icon: "success",
          title: "Thêm sản phẩm thành công!",
        });

        // Reset form
        setFormData({
          name: "",
          seller_id: sellerId,
          category_id: "",
          price: "",
          stock: "",
          status: "1",
        });

        // Reset description
        setDescription("");

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

        // Reset colors
        setColorBlocks([]);
        setColorCropData({});

        // Reset sizes
        setSizeBlocks([]);

        // Reset file inputs
        const mainImageInput = document.getElementById("customFile1");
        if (mainImageInput) {
          mainImageInput.value = "";
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      console.error("Error details:", error.response?.data); // Log chi tiết lỗi
      window.Toast.fire({
        icon: "error",
        title:
          error.response?.data?.message || "Có lỗi xảy ra khi thêm sản phẩm!",
      });
    }
  };

  // Thêm hàm xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  return (
    <div className="content-wrapper" style={{ minHeight: "1604.8px" }}>
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Product Add</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <Link to="#">Home</Link>
                </li>
                <li className="breadcrumb-item active">Product Add</li>
              </ol>
            </div>
          </div>
        </div>
      </section>
      <section className="content mb-3">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="card card-info">
                <div className="card-header">
                  <h3 className="card-title">Information Products</h3>
                </div>
                <div className="card-body">
                  <div className="form-group">
                    <label htmlFor="inputName">Product Name</label>
                    <input
                      type="text"
                      id="inputName"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Enter the product name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputDescription">
                      Product Description
                    </label>
                    <CKEditor
                      editor={ClassicEditor}
                      config={EDITOR_CONFIG}
                      data={description}
                      name="description"
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setDescription(data);
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputStatus">Category</label>
                    <select
                      id="inputStatus"
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleInputChange}
                      className="form-control custom-select"
                    >
                      <option selected disabled>
                        Select a category
                      </option>
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
                      value={formData.status}
                      onChange={handleInputChange}
                      className="form-control custom-select"
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputStatus">Avatar</label>
                    <div>
                      <div className="mb-4 d-flex justify-content-center">
                        <img
                          src={
                            cropData ||
                            "https://cdn-icons-png.flaticon.com/128/179/179378.png"
                          }
                          alt="cropped"
                          style={{ width: "40%" }}
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
              </div>
            </div>
            <div className="col-md-6">
              <div className="card card-info">
                <div className="card-header">
                  <h3 className="card-title">Detailed Information</h3>
                </div>
                <div className="card-body">
                  <div className="form-group">
                    <label htmlFor="inputEstimatedBudget">
                      Applicable to all categories
                    </label>
                    <div className="row">
                      <div className="col-6">
                        <input
                          type="number"
                          value={formData.price}
                          name="price"
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="Price"
                        />
                      </div>
                      <div className="col-6">
                        <input
                          type="text"
                          name="stock"
                          value={formData.stock}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="Quantity"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputEstimatedBudget">
                      Product Classification
                    </label>
                    <br />
                    <label>
                      <span>Color&nbsp;&nbsp;</span>
                      <button
                        type="button"
                        id="addColorButton"
                        className="btn btn-info btn-sm"
                        onClick={handleAddColor}
                      >
                        <small>Add Color</small>
                      </button>
                    </label>
                    <div id="color-container">{colorBlocks}</div>
                    {showColorCropper && (
                      <div
                        className="modal fade show"
                        style={{ display: "block" }}
                      >
                        <div className="modal-dialog modal-lg">
                          <div className="modal-content">
                            <div className="modal-header">
                              <h5 className="modal-title">Crop Color Image</h5>
                              <button
                                type="button"
                                className="close"
                                onClick={() => setShowColorCropper(false)}
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
                                minCropBoxHeight={IMAGE_DIMENSIONS.height}
                                minCropBoxWidth={IMAGE_DIMENSIONS.width}
                                cropBoxResizable={false}
                                background={false}
                                responsive={true}
                                autoCropArea={1}
                                checkOrientation={false}
                                onInitialized={(instance) => {
                                  setColorCropper(instance);
                                }}
                              />
                            </div>
                            <div className="modal-footer">
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowColorCropper(false)}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger"
                                onClick={getColorCropData}
                              >
                                Crop & Save
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>
                      <span>Size&nbsp;&nbsp;</span>
                      <button
                        type="button"
                        id="addSizeButton"
                        className="btn btn-info btn-sm"
                        onClick={handleAddSize} // Thêm onClick handler
                      >
                        <small>Add Size</small>
                      </button>
                    </label>
                    <div id="size-container">
                      {sizeBlocks} {/* Render các size blocks */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12 d-flex justify-content-end">
              <button type="submit" class="btn btn-success swalDefaultSuccess">
                Create Product
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
