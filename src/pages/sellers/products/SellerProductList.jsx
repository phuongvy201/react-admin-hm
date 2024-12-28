import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import productService from "../../../services/productService";
import { urlImage } from "./../../../config";
import Toast from "sweetalert2";
import Swal from "sweetalert2";
import templateService from "../../../services/templateService";
import { useDropzone } from "react-dropzone";

export default function SellerProductList() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 50,
    total: 0,
    last_page: 1,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const sellerId = JSON.parse(localStorage.getItem("user")).id;
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [created_from, setCreatedFrom] = useState("");
  const [status, setStatus] = useState(1);
  const [created_to, setCreatedTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [templates, setTemplates] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [template_id, setTemplateId] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const fileInputRef = useRef(null);

  const fetchProducts = async (page = currentPage) => {
    try {
      setLoading(true);
      const response = await productService.getProductBySeller(page);
      if (response.data.success) {
        setProducts(response.data.data);
        setPagination({
          current_page: response.data.meta.current_page,
          per_page: response.data.meta.per_page,
          total: response.data.meta.total,
          last_page: response.data.meta.last_page,
        });
      }
    } catch (err) {
      setError("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };
  const fetchTemplates = async (page = 1) => {
    try {
      setLoading(true);
      const response = await templateService.getTemplates();
      if (response.data.success) {
        setTemplates(response.data.data);
        setError(null);
      } else {
        setError("Không thể tải danh sách template");
      }
    } catch (err) {
      setError("Không thể tải danh sách template");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchTemplates();
  }, []);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.last_page) {
      setCurrentPage(page);
      fetchProducts(page);
    }
  };
  const handleCreateProduct = async () => {
    if (!template_id) {
      Toast.fire({
        icon: "error",
        title: "Please select a template.",
      });
      return;
    }

    if (!name) {
      Toast.fire({
        icon: "error",
        title: "Product name is required.",
      });
      return;
    }

    if (!price) {
      Toast.fire({
        icon: "error",
        title: "Price is required.",
      });
      return;
    }

    if (!stock) {
      Toast.fire({
        icon: "error",
        title: "Stock quantity is required.",
      });
      return;
    }

    // Tạo FormData để gửi file
    const formData = new FormData();
    formData.append("template_id", template_id);
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("status", status);

    // Sử dụng ref để lấy file
    const fileInput = fileInputRef.current;
    if (fileInput && fileInput.files.length > 0) {
      formData.append("image", fileInput.files[0]);
    } else {
      Toast.fire({
        icon: "error",
        title: "Image is required.",
      });
      return;
    }

    const response = await productService.addProductByTemplate(formData);

    if (response.data.success) {
      Toast.fire({
        icon: "success",
        title: "Create product successfully!",
        timer: 1500,
      });
      fetchProducts();
    } else {
      Toast.fire({
        icon: "error",
        title: response.data.message,
      });
    }
  };
  const handleUpdateStatus = async (id) => {
    const response = await productService.updateProductStatus(id);
    if (response.data.success) {
      Toast.fire({
        icon: "success",
        title: "Status changed successfully!",
        timer: 1500,
      });

      fetchProducts(pagination.current_page);
    } else {
      Toast.fire({
        icon: "error",
        title: response.data.message,
        timer: 1500,
      });
    }
  };
  const handleSearch = async () => {
    try {
      // Gửi yêu cầu tìm kiếm
      const response = await productService.searchProductBySeller({
        name,
        created_from,
        created_to,
        id,
      });

      // Kiểm tra phản hồi từ server
      if (!response.data?.success) {
        alert(
          `Lỗi khi tìm kiếm sản phẩm: ${
            response.data?.message || "Vui lòng thử lại sau."
          }`
        );
        return;
      }

      // Nếu bạn cần cập nhật kết quả vào UI
      setProducts(response.data?.data);
    } catch (error) {
      // Xử lý lỗi mạng hoặc lỗi từ phía client
      alert(
        "Đã xảy ra lỗi khi tìm kiếm sản phẩm. Vui lòng kiểm tra lại kết nối hoặc thử lại sau."
      );
    }
  };
  const handleDeleteProduct = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Confirm deletion?",
        text: "You cannot undo once deleted!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        const response = await productService.deleteProduct(id);

        if (response.data.success) {
          Toast.fire({
            icon: "success",
            title: "Deleted successfully!",
          });

          // Gọi lại hàm load dữ liệu
          fetchProducts();
        }
      }
    } catch (err) {
      Toast.fire({
        icon: "error",
        title:
          err.response?.data?.message || "An error occurred while deleting!",
      });
      console.error("Error:", err);
    }
  };

  const handleCopyProduct = async (id) => {
    try {
      const response = await productService.copyProduct(id);
      // Thông báo thành công
      if (response.data.success) {
        Toast.fire({
          icon: "success",
          title: "Copy product successfully!",
        });
        fetchProducts();
      }
      // Có thể thêm logic để cập nhật danh sách sản phẩm nếu cần
    } catch (error) {
      // Thông báo lỗi
      alert("Có lỗi xảy ra khi sao chép sản phẩm.");
      console.error(error);
    }
  };
  const handleImportFile = async () => {
    try {
      const file = document.querySelector(".file-input").files[0];
      console.log(file);
      const formData = new FormData();
      formData.append("file", file);
      const response = await productService.importProduct(formData);
      if (response.data.success) {
        Toast.fire({
          icon: "success",
          title: "Import file successfully!",
        });
        fetchProducts();
      } else {
        Toast.fire({
          icon: "error",
          title: response.data.message,
        });
      }
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error.response.data.message,
      });
      console.log(error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result); // Cập nhật URL hình ảnh từ file đã tải lên
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setImageUrl(acceptedFiles[0]);
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 8,
    accept: "image/*",
  });

  // Hiển thị loading
  if (loading) {
    return (
      <div className="content-wrapper">
        <div className="content">
          <div className="container-fluid">
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <div className="content-wrapper">
        <div className="content">
          <div className="container-fluid">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper" style={{ minHeight: "1302.4px" }}>
      <section className="content py-4">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-10 offset-md-1">
              <div className="row">
                <div className="col-4">
                  <div className="form-group">
                    <label>ID:</label>

                    <span
                      className="select2 select2-container select2-container--default select2-container--below"
                      dir="ltr"
                      data-select2-id={2}
                      style={{ width: "100%" }}
                    >
                      <span className="selection">
                        <span
                          className="select2-selection select2-selection--multiple"
                          role="combobox"
                          aria-haspopup="true"
                          aria-expanded="false"
                          tabIndex={-1}
                          aria-disabled="false"
                        >
                          <ul className="select2-selection__rendered">
                            <li className="select2-search select2-search--inline">
                              <input
                                className="select2-search__field"
                                type="text"
                                tabIndex={0}
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="none"
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                spellCheck="false"
                                role="searchbox"
                                aria-autocomplete="list"
                                placeholder="ID"
                                style={{ width: 0 }}
                              />
                            </li>
                          </ul>
                        </span>
                      </span>
                      <span className="dropdown-wrapper" aria-hidden="true" />
                    </span>
                  </div>
                </div>
                <div className="col-4">
                  <div className="form-group">
                    <label>From Date:</label>

                    <span
                      className="select2 select2-container select2-container--default select2-container--below"
                      dir="ltr"
                      data-select2-id={2}
                      style={{ width: "100%" }}
                    >
                      <span className="selection">
                        <span
                          className="select2-selection select2-selection--multiple"
                          role="combobox"
                          aria-haspopup="true"
                          aria-expanded="false"
                          tabIndex={-1}
                          aria-disabled="false"
                        >
                          <ul className="select2-selection__rendered">
                            <li className="select2-search select2-search--inline">
                              <input
                                className="select2-search__field"
                                type="date"
                                tabIndex={0}
                                autoComplete="off"
                                value={created_from}
                                onChange={(e) => setCreatedFrom(e.target.value)}
                                autoCorrect="off"
                                autoCapitalize="none"
                                spellCheck="false"
                                role="searchbox"
                                aria-autocomplete="list"
                                placeholder="From Date"
                                style={{ width: 0 }}
                              />
                            </li>
                          </ul>
                        </span>
                      </span>
                      <span className="dropdown-wrapper" aria-hidden="true" />
                    </span>
                  </div>
                </div>
                <div className="col-4">
                  <div className="form-group">
                    <label>To Date:</label>

                    <span
                      className="select2 select2-container select2-container--default select2-container--below"
                      dir="ltr"
                      data-select2-id={2}
                      style={{ width: "100%" }}
                    >
                      <span className="selection">
                        <span
                          className="select2-selection select2-selection--multiple"
                          role="combobox"
                          aria-haspopup="true"
                          aria-expanded="false"
                          tabIndex={-1}
                          aria-disabled="false"
                        >
                          <ul className="select2-selection__rendered">
                            <li className="select2-search select2-search--inline">
                              <input
                                className="select2-search__field"
                                type="date"
                                tabIndex={0}
                                autoComplete="off"
                                autoCorrect="off"
                                value={created_to}
                                onChange={(e) => setCreatedTo(e.target.value)}
                                autoCapitalize="none"
                                spellCheck="false"
                                role="searchbox"
                                aria-autocomplete="list"
                                placeholder="ID"
                                style={{ width: 0 }}
                              />
                            </li>
                          </ul>
                        </span>
                      </span>
                      <span className="dropdown-wrapper" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <div className="input-group ">
                  <input
                    type="search"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-control"
                    placeholder="Type name product here"
                  />
                  <div className="input-group-append">
                    <button onClick={handleSearch} className="btn btn-default">
                      <i className="fa fa-search" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-9">
              <h1>Products List</h1>
            </div>
            <div className="col-sm-3 d-flex flex-row-reverse">
              <button
                type="button"
                className="btn btn-info mx-2"
                data-toggle="modal"
                data-target="#importModal"
              >
                Import File Product
              </button>
              <button
                type="button"
                className="btn btn-info"
                data-toggle="modal"
                data-target="#createModal"
              >
                Create Product
              </button>

              {/* Modal for Import File Product */}
              <div className="modal fade" id="importModal">
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h4 className="modal-title">Import Product File</h4>
                      <button
                        type="button"
                        className="close"
                        data-dismiss="modal"
                        aria-label="Close"
                      >
                        <span aria-hidden="true">×</span>
                      </button>
                    </div>
                    <div className="modal-body">
                      <div className="form-group">
                        <label className="file-label mx-2">File: </label>
                        <input
                          type="file"
                          className="file-input"
                          placeholder="Enter product title"
                        />
                      </div>
                    </div>
                    <div className="modal-footer justify-content-between">
                      <button
                        type="button"
                        className="btn btn-default"
                        data-dismiss="modal"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={handleImportFile}
                        className="btn btn-primary"
                      >
                        Import
                      </button>
                    </div>
                  </div>
                  {/* /.modal-content */}
                </div>
                {/* /.modal-dialog */}
              </div>

              {/* Modal for Create Product */}
              <div className="modal fade" id="createModal">
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h4 className="modal-title">Create Product</h4>
                      <button
                        type="button"
                        className="close"
                        data-dismiss="modal"
                        aria-label="Close"
                      >
                        <span aria-hidden="true">×</span>
                      </button>
                    </div>
                    <div className="modal-body">
                      <div className="form-group">
                        <label className="mx-2">Product Name:</label>
                        <input
                          type="text"
                          name="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="form-control"
                          placeholder="Enter product name"
                        />
                      </div>
                      <div className="form-group">
                        <label className="mx-2">Template:</label>
                        <select
                          className="form-control"
                          value={template_id}
                          onChange={(e) => setTemplateId(e.target.value)}
                        >
                          <option value="">Select Template</option>
                          {templates.map((template) => (
                            <option key={template.id} value={template.id}>
                              {template.template_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="mx-2">Description:</label>
                        <textarea
                          className="form-control"
                          placeholder="Enter product description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="mx-2">Status:</label>
                        <select
                          className="form-control"
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                        >
                          <option value="1">Active</option>
                          <option value="0">Inactive</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="mx-2">Stock:</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Enter stock quantity"
                          value={stock}
                          onChange={(e) => setStock(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="mx-2">Price:</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Enter price"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="mx-2">Upload Image:</label>
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                        />
                        {imageUrl && (
                          <div>
                            <h4>Image Preview:</h4>
                            <img
                              src={imageUrl}
                              alt="Preview"
                              style={{ maxHeight: "200px", marginTop: "10px" }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="modal-footer justify-content-between">
                      <button
                        type="button"
                        className="btn btn-default"
                        data-dismiss="modal"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateProduct}
                        className="btn btn-primary"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                  {/* /.modal-content */}
                </div>
                {/* /.modal-dialog */}
              </div>
              {/* /.modal */}
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  {products.length === 0 ? (
                    <div className="text-center py-5">
                      <h5>No products available</h5>
                    </div>
                  ) : (
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th style={{ width: 10 }}>ID</th>
                          <th style={{ width: 250 }}>Product</th>
                          <th>Category</th>
                          <th style={{ width: 100 }}>Price</th>
                          <th style={{ width: 100 }}>Stock</th>
                          <th style={{ width: 200 }}>Created_at</th>
                          <th style={{ width: 200 }}>Operation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>
                              <div>
                                <Link
                                  to={`/product/${product.id}`}
                                  className="text-decoration-none text-dark mb-2"
                                >
                                  {product.name}
                                </Link>
                              </div>
                              {product.image && (
                                <div>
                                  <img
                                    className="img-fluid"
                                    style={{ maxHeight: "100px" }}
                                    src={
                                      product.image instanceof File
                                        ? URL.createObjectURL(product.image)
                                        : product.image?.startsWith("http")
                                        ? product.image
                                        : urlImage + product.image
                                    }
                                    alt={product.name}
                                  />
                                </div>
                              )}
                            </td>
                            <td>
                              {product.category && (
                                <>
                                  {product.category.parent?.parent?.name &&
                                    `${product.category.parent.parent.name} > `}
                                  {product.category.parent?.name &&
                                    `${product.category.parent.name} > `}
                                  {product.category.name}
                                </>
                              )}
                            </td>
                            <td>${product.price?.toLocaleString()}</td>
                            <td>{product.stock}</td>
                            <td>
                              {new Date(
                                product.created_at
                              ).toLocaleDateString()}
                            </td>
                            <td>
                              <button
                                className="btn btn-danger btn-sm mx-1"
                                title="Delete"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <i className="fa-solid fa-trash-can" />
                              </button>
                              <button
                                className={`btn ${
                                  product.status ? "btn-success" : "btn-danger"
                                } btn-sm mx-1`}
                                onClick={() => handleUpdateStatus(product.id)}
                              >
                                <i
                                  className={`fa-solid ${
                                    product.status
                                      ? "fa-toggle-on"
                                      : "fa-toggle-off"
                                  }`}
                                />
                              </button>
                              <Link
                                to={`/seller/updateProduct/${product.id}`}
                                className="btn btn-secondary btn-sm mx-1"
                                title="Edit"
                              >
                                <i className="fas fa-edit" />
                              </Link>
                              <button
                                className="btn btn-secondary btn-sm mx-1"
                                title="Copy"
                                onClick={() => handleCopyProduct(product.id)}
                              >
                                <i className="fa-solid fa-copy" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <div className="card-footer clearfix">
                  <ul className="pagination pagination-md m-0 float-right">
                    <li
                      className={`page-item ${
                        pagination.current_page === 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          handlePageChange(pagination.current_page - 1)
                        }
                        disabled={pagination.current_page === 1}
                      >
                        «
                      </button>
                    </li>

                    {[...Array(pagination.last_page)].map((_, index) => (
                      <li
                        key={index + 1}
                        className={`page-item ${
                          pagination.current_page === index + 1 ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(index + 1)}
                        >
                          {index + 1}
                        </button>
                      </li>
                    ))}

                    <li
                      className={`page-item ${
                        pagination.current_page === pagination.last_page
                          ? "disabled"
                          : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          handlePageChange(pagination.current_page + 1)
                        }
                        disabled={
                          pagination.current_page === pagination.last_page
                        }
                      >
                        »
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
