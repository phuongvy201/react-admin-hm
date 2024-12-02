import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import productService from "../../../services/productService";
import discountService from "../../../services/discountService";
import { urlImage } from "../../../config";

export default function AddDiscountBySeller() {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    promotions: [],
  });
  const sellerId = JSON.parse(localStorage.getItem("user")).id;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductBySeller(sellerId);
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (err) {
      setError("Không thể tải danh sách sản phẩm");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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

  const handleCheckboxChange = (product) => {
    setSelectedProducts((prev) => {
      const isSelected = prev.some((p) => p.id === product.id);
      if (isSelected) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
    console.log(selectedProducts);
  };

  const handleConfirmSelection = () => {
    console.log("Các sản phẩm đã chọn:", selectedProducts);
    document.querySelector('[data-dismiss="modal"]').click();
  };

  const handleInputChange = (productId, field, value) => {
    setFormData((prev) => {
      const promotions = [...prev.promotions];
      const index = promotions.findIndex((p) => p.product_id === productId);

      if (index === -1) {
        promotions.push({
          product_id: productId,
          [field]: value,
          status: 1,
        });
      } else {
        promotions[index] = {
          ...promotions[index],
          [field]: value,
        };
      }

      return { ...prev, promotions };
    });
  };

  const handleSubmit = async () => {
    try {
      const promises = formData.promotions.map((promotion) => {
        return discountService.createDiscount({
          product_id: promotion.product_id,
          discount_name: promotion.discount_name,
          discount_value: promotion.discount_value,
          date_begin: promotion.date_begin,
          date_end: promotion.date_end,
          status: 1,
          created_by: sellerId,
        });
      });

      const results = await Promise.all(promises);

      const hasError = results.some((res) => !res.data.success);
      if (hasError) {
        window.Toast.fire({
          icon: "error",
          title:
            results.find((res) => !res.data.success)?.data?.message ||
            "Có lỗi xảy ra khi thêm khuyến mãi!",
        });
        return;
      }

      window.Toast.fire({
        icon: "success",
        title: "Thêm khuyến mãi thành công!",
      });

      setSelectedProducts([]);
      setFormData({ promotions: [] });
    } catch (err) {
      window.Toast.fire({
        icon: "error",
        title:
          err.response?.data?.message || "Có lỗi xảy ra khi thêm khuyến mãi!",
        timer: 1500,
      });
      console.error(err);
    }
  };

  return (
    <div className="content-wrapper" style={{ minHeight: "1302.4px" }}>
      <section className="content-header">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <button
                  type="button"
                  class="btn btn-info mt-3 mx-3"
                  style={{ width: "25%" }}
                  data-toggle="modal"
                  data-target="#modal-default"
                >
                  Add promotions to products
                </button>
                <div className="modal fade" id="modal-default">
                  <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h4 className="modal-title">Products</h4>
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
                        <table className="table table-bordered">
                          <thead>
                            <tr>
                              <th style={{ width: 50 }}>
                                <input
                                  type="checkbox"
                                  className="form-check-input position-static"
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedProducts(products);
                                    } else {
                                      setSelectedProducts([]);
                                    }
                                  }}
                                  checked={
                                    selectedProducts.length === products.length
                                  }
                                />
                              </th>
                              <th style={{ width: 10 }}>ID</th>
                              <th style={{ width: 250 }}>Product</th>
                              <th>Category</th>
                              <th style={{ width: 100 }}>Price</th>
                              <th style={{ width: 100 }}>Stock</th>
                              <th style={{ width: 200 }}>Created_at</th>
                            </tr>
                          </thead>
                          <tbody>
                            {products.map((product) => (
                              <tr key={product.id}>
                                <td>
                                  <input
                                    type="checkbox"
                                    className="form-check-input "
                                    checked={selectedProducts.some(
                                      (p) => p.id === product.id
                                    )}
                                    onChange={() =>
                                      handleCheckboxChange(product)
                                    }
                                  />
                                </td>
                                <td>{product.id}</td>
                                <td>
                                  <div>
                                    <p className="text-decoration-none text-dark mb-2">
                                      {product.name}
                                    </p>
                                  </div>
                                  {product.image && (
                                    <div>
                                      <img
                                        className="img-fluid"
                                        style={{ maxHeight: "100px" }}
                                        src={urlImage + product.image}
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
                              </tr>
                            ))}
                          </tbody>
                        </table>
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
                          className="btn btn-danger"
                          onClick={handleConfirmSelection}
                          disabled={selectedProducts.length === 0}
                        >
                          Confirm Selection ({selectedProducts.length} products)
                        </button>
                      </div>
                    </div>
                    {/* /.modal-content */}
                  </div>
                  {/* /.modal-dialog */}
                </div>

                <div className="card-body">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th style={{ width: 10 }}>ID</th>
                        <th style={{ width: 250 }}>Product</th>
                        <th style={{ width: 250 }}>Promotion Name</th>
                        <th>Discount Percentage</th>
                        <th style={{ width: 200 }}>Start Date</th>
                        <th style={{ width: 200 }}>End Date</th>
                        <th style={{ width: 200 }}>Operation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProducts.length > 0 ? (
                        selectedProducts.map((product) => (
                          <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>
                              <div>
                                {product.name}
                                {product.image && (
                                  <div>
                                    <img
                                      className="img-fluid"
                                      style={{ maxHeight: "50px" }}
                                      src={urlImage + product.image}
                                      alt={product.name}
                                    />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Enter promotion name"
                                onChange={(e) =>
                                  handleInputChange(
                                    product.id,
                                    "discount_name",
                                    e.target.value
                                  )
                                }
                                value={
                                  formData.promotions.find(
                                    (p) => p.product_id === product.id
                                  )?.discount_name || ""
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control"
                                placeholder="Enter discount percentage"
                                min="0"
                                max="100"
                                onChange={(e) =>
                                  handleInputChange(
                                    product.id,
                                    "discount_value",
                                    e.target.value
                                  )
                                }
                                value={
                                  formData.promotions.find(
                                    (p) => p.product_id === product.id
                                  )?.discount_value || ""
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="date"
                                className="form-control"
                                onChange={(e) =>
                                  handleInputChange(
                                    product.id,
                                    "date_begin",
                                    e.target.value
                                  )
                                }
                                value={
                                  formData.promotions.find(
                                    (p) => p.product_id === product.id
                                  )?.date_begin || ""
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="date"
                                className="form-control"
                                onChange={(e) =>
                                  handleInputChange(
                                    product.id,
                                    "date_end",
                                    e.target.value
                                  )
                                }
                                value={
                                  formData.promotions.find(
                                    (p) => p.product_id === product.id
                                  )?.date_end || ""
                                }
                              />
                            </td>
                            <td>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleCheckboxChange(product)}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
                            <h5 className="text-muted">No products selected</h5>
                            <p className="text-muted">
                              Please select products from the list above to add
                              promotions
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="card-footer">
                  <button
                    type="button"
                    className="btn btn-info btn-md"
                    onClick={handleSubmit}
                    disabled={
                      selectedProducts.length === 0 ||
                      formData.promotions.length === 0
                    }
                  >
                    Add Discount
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
