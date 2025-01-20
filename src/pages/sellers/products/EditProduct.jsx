import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Swal from "sweetalert2";
import categoryService from "../../../services/categoryService";
import productService from "../../../services/productService";
import { EDITOR_CONFIG } from "../../../constants/productConstants";
import { urlImage } from "../../../config";
import templateService from "../../../services/templateService";

export default function EditProduct() {
  const id = parseInt(useParams().id);
  const [categories, setCategories] = useState([]);
  const [description, setDescription] = useState("");
  const [product, setProduct] = useState({
    name: "",
    category_id: "",
    price: "",
    description: "",
    stock: "",
    status: "1",
    images: [],
  });
  const [templates, setTemplates] = useState([]);
  const [images, setImages] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await categoryService.getFlatCategories();
        setCategories(categoriesResponse.data.data);

        // Fetch templates
        const templatesResponse = await templateService.getTemplates();
        setTemplates(templatesResponse.data.data);

        // Fetch product
        const productResponse = await productService.getProductById(id);
        const productData = productResponse.data.data;
        setProduct({
          ...productData,
          images: productData.images || [],
        });
        setImages(productData.images);

        // Chỉ cập nhật template_id của sản phẩm thay vì ghi đè toàn bộ templates
        if (productData.template_id) {
          setProduct((prev) => ({
            ...prev,
            template_id: productData.template.id,
          }));
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        toast.error("Không thể tải thông tin sản phẩm");
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
        "image/webp",
      ];
      if (validImageTypes.includes(file.type) && images.length < 8) {
        setImages((prev) => [...prev, file]);
      } else if (images.length >= 8) {
        toast.error("Bạn chỉ có thể tải lên tối đa 8 ảnh.");
      } else {
        toast.error("Định dạng tệp không hợp lệ. Vui lòng chọn hình ảnh.");
      }
    }
  };
  // Thêm useEffect để khởi tạo Toast
  useEffect(() => {
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

    window.Toast = Toast;
  }, []);
  console.log("product.images", product.images);
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("category_id", product.category_id);
      formData.append("price", product.price);
      formData.append("description", description);
      formData.append("stock", product.stock);
      formData.append("status", product.status);
      formData.append("template_id", product.template_id);

      // Gửi hình ảnh theo đúng thứ tự hiển thị
      images.forEach((image, index) => {
        if (image instanceof File) {
          formData.append(`images[${index}]`, image);
        } else {
          formData.append(`images[${index}]`, image.image_url);
        }
      });

      const response = await productService.updateProduct(id, formData);

      if (response.data.success) {
        window.Toast.fire({
          icon: "success",
          title: "Cập nhật sản phẩm thành công!",
        });
      }
    } catch (error) {
      console.error("Lỗi chi tiết:", error);
      window.Toast.fire({
        icon: "error",
        title:
          error.response?.status === 422
            ? "Vui lòng kiểm tra lại thông tin!"
            : "Có lỗi xảy ra khi cập nhật sản phẩm!",
      });
    }
  };

  return (
    <div className="content-wrapper" style={{ minHeight: "228.4px" }}>
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Product Update</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <a href="/admin/addproduct">Home</a>
                </li>
                <li className="breadcrumb-item active">Product Add</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="content mb-3">
        <form>
          <div className="row">
            {/* Left Column */}
            <div className="col-md-6">
              <div className="card card-info">
                <div className="card-header">
                  <h3 className="card-title">Information Products</h3>
                </div>
                <div className="card-body">
                  {/* Product Name */}
                  <div className="form-group">
                    <label htmlFor="inputName">Product Name</label>
                    <input
                      type="text"
                      id="inputName"
                      value={product.name}
                      onChange={handleChange}
                      name="name"
                      className="form-control"
                      placeholder="Enter the product name"
                    />
                  </div>

                  {/* Product Description */}
                  <div className="form-group">
                    <label htmlFor="inputDescription">
                      Product Description
                    </label>
                    <CKEditor
                      editor={ClassicEditor}
                      config={EDITOR_CONFIG}
                      data={product.description}
                      name="description"
                      value={product.description}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setDescription(data);
                      }}
                    />
                  </div>

                  {/* Category */}
                  <div className="form-group">
                    <label htmlFor="inputStatus">Category</label>
                    <select
                      id="inputStatus"
                      name="category_id"
                      value={product.category_id}
                      onChange={handleChange}
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

                  {/* Status */}
                  <div className="form-group">
                    <label htmlFor="inputStatus">Status</label>
                    <select
                      id="selectStatus"
                      value={product.status}
                      onChange={handleChange}
                      name="status"
                      className="form-control custom-select"
                    >
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-md-6">
              <div className="card card-info">
                <div className="card-header">
                  <h3 className="card-title">Detailed Information</h3>
                </div>
                <div className="card-body">
                  {/* Price and Quantity */}
                  <div className="form-group">
                    <label htmlFor="inputStatus">Template</label>
                    <select
                      id="inputStatus"
                      name="template_id"
                      value={product.template_id}
                      onChange={handleChange}
                      className="form-control custom-select"
                    >
                      <option value="" disabled>
                        Select a template
                      </option>
                      {templates &&
                        templates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="inputEstimatedBudget">
                      Applicable to all categories
                    </label>
                    <div className="row">
                      <div className="col-6">
                        <input
                          type="number"
                          name="price"
                          onChange={handleChange}
                          className="form-control"
                          placeholder="Price"
                          value={product.price}
                        />
                      </div>
                      <div className="col-6">
                        <input
                          type="text"
                          name="stock"
                          onChange={handleChange}
                          className="form-control"
                          placeholder="Quantity"
                          value={product.stock}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Avatar */}
                  <div className="form-group">
                    <label htmlFor="inputStatus">Avatar</label>
                    <div>
                      <div className="mb-4 d-flex flex-wrap justify-content-center">
                        {/* Hiển thị tất cả hình ảnh (cả cũ và mới) */}
                        {images.map((image, index) => (
                          <div key={index} className="position-relative m-2">
                            <img
                              src={
                                image instanceof File
                                  ? URL.createObjectURL(image)
                                  : image.image_url?.startsWith("http")
                                  ? image.image_url
                                  : urlImage + image.image_url
                              }
                              alt={`Product ${index + 1}`}
                              className="img-thumbnail"
                              style={{
                                width: "200px",
                                height: "200px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-danger btn-sm position-absolute"
                              style={{
                                top: "5px",
                                right: "5px",
                                borderRadius: "50%",
                                width: "25px",
                                height: "25px",
                                padding: "0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              onClick={() => {
                                setImages((prevImages) =>
                                  prevImages.filter((_, i) => i !== index)
                                );
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Nút thêm hình ảnh */}
                      <div className="d-flex justify-content-center">
                        <div className="btn btn-info btn-md btn-rounded">
                          <label
                            className="form-label text-white m-1"
                            htmlFor="customFile1"
                            style={{ cursor: "pointer", marginBottom: 0 }}
                          >
                            <small>Choose file</small>
                          </label>
                          <input
                            type="file"
                            className="form-control d-none"
                            id="customFile1"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                handleImageChange(e);
                              }
                            }}
                            accept="image/*"
                          />
                        </div>
                      </div>

                      {/* Hiển thị giới hạn số lượng ảnh */}
                      <div className="text-center mt-2">
                        <small className="text-muted">
                          {images.length}/8 ảnh đã được tải lên
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* Color Selection */}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="row">
            <div className="col-12 d-flex justify-content-end">
              <button
                type="submit"
                className="btn btn-success swalDefaultSuccess"
                onClick={handleSubmit}
              >
                Update Product
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
