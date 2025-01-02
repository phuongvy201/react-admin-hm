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
    image: null,
  });
  const [templates, setTemplates] = useState([]);

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
        setProduct(productData);

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
      setProduct((prev) => ({
        ...prev,
        image: file,
      }));
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

      // Xử lý ảnh
      if (product.image) {
        if (product.image instanceof File) {
          // Nếu là file mới upload
          formData.append("image", product.image);
        } else if (typeof product.image === "string") {
          // Nếu là ảnh cũ, gửi tên file
          formData.append("old_image", product.image);
        }
      }

      const response = await productService.updateProduct(id, formData);

      if (response.data.success) {
        // Thông báo thành công
        window.Toast.fire({
          icon: "success",
          title: "Cập nhật sản phẩm thành công!",
        }).then(() => {
          // Load lại trang sau khi toast biến mất
          window.location.reload();
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
                      <div className="mb-4 d-flex justify-content-center">
                        <img
                          src={
                            product.image instanceof File
                              ? URL.createObjectURL(product.image)
                              : product.image?.startsWith("http")
                              ? product.image
                              : urlImage + product.image
                          }
                          alt="Product"
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
                            accept="image/*"
                          />
                        </div>
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
