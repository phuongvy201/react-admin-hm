import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Toast from "sweetalert2";
import ProductService from "../../services/productService";
import { urlImage } from "../../config";
import productService from "../../services/productService";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 50,
    total: 0,
    last_page: 1,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await ProductService.getAllProducts(page);
      console.log(response);
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
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handlePageChange = (page) => {
    fetchProducts(page);
  };

  const handleUpdateStatus = async (id) => {
    try {
      const response = await productService.updateProductStatus(id);
      if (response.data.success) {
        setProducts(
          products.map((product) => {
            if (product.id === id) {
              return {
                ...product,
                status: product.status === 1 ? 0 : 1,
              };
            }
            return product;
          })
        );

        Toast.fire({
          icon: "success",
          title: "Cập nhật trạng thái thành công!",
        });
      }
    } catch (err) {
      Toast.fire({
        icon: "error",
        title:
          err.response?.data?.message ||
          "Có lỗi xảy ra khi cập nhật trạng thái!",
      });
      console.error("Error:", err);
    }
  };

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
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Products List</h1>
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
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th style={{ width: 10 }}>ID</th>
                        <th style={{ width: 250 }}>Product</th>
                        <th style={{ width: 150 }}>Seller</th>
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
                            {product.seller && <div>{product.seller.name}</div>}
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
                            {new Date(product.created_at).toLocaleDateString()}
                          </td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm mx-1"
                              title="Delete"
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
                              to={`/product/${product.id}`}
                              className="btn btn-info btn-sm mx-1"
                              title="View"
                            >
                              <i className="fa-solid fa-eye" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
