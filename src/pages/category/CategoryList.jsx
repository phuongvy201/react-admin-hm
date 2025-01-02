import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Toast from "sweetalert2";
import { urlImage } from "../../config";
import categoryService from "../../services/categoryService";

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async (page = 1) => {
    try {
      setLoading(true);
      const response = await categoryService.getAllCategories(
        page,
        pagination.per_page
      );
      console.log(response);
      if (response.data.success) {
        setCategories(response.data.data);
        setPagination({
          current_page: response.data.meta.current_page,
          per_page: response.data.meta.per_page,
          total: response.data.meta.total,
          last_page: response.data.meta.last_page,
        });
      }
    } catch (err) {
      setError("Không thể tải danh sách danh mục");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handlePageChange = (page) => {
    fetchCategories(page);
  };

  const handleUpdateStatus = async (id) => {
    try {
      const response = await categoryService.updateStatus(id);
      if (response.data.success) {
        setCategories(
          categories.map((category) => {
            if (category.id === id) {
              return {
                ...category,
                status: category.status === 1 ? 0 : 1,
              };
            }
            return category;
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
              <h1>Danh mục sản phẩm</h1>
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
                        <th style={{ width: 250 }}>Category</th>
                        <th>Relationships</th>
                        <th width="200">Description</th>
                        <th style={{ width: 200 }}>Created_at</th>
                        <th style={{ width: 200 }}>Operation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <tr key={category.id}>
                          <td>{category.id}</td>
                          <td>
                            <div>
                              <Link
                                to={`admin/category/${category.id}`}
                                className="text-decoration-none text-dark mb-2"
                              >
                                {category.name}
                              </Link>
                            </div>
                            {category.image && (
                              <div>
                                <img
                                  className="img-fluid"
                                  style={{ maxHeight: "100px" }}
                                  src={urlImage + category.image}
                                  alt={category.name}
                                />
                              </div>
                            )}
                          </td>

                          <td>
                            {category.parent_id && (
                              <div>
                                <span>
                                  <strong className="text-info">
                                    Danh mục cha:
                                  </strong>
                                  <br />
                                  {"-" + category.parent_name}
                                </span>
                              </div>
                            )}
                            {/* Hiển thị danh mục con */}
                            {category.children &&
                              category.children.length > 0 && (
                                <div>
                                  <strong className="text-info">
                                    Danh mục con:
                                  </strong>
                                  <ul className="list-unstyled ml-3">
                                    {category.children.map((child) => (
                                      <li key={child.id} className="text-muted">
                                        - {child.name}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                            {/* Hiển thị danh mục cha nếu có */}
                          </td>
                          <td>{category.description}</td>
                          <td>
                            {new Date(category.created_at).toLocaleDateString()}
                          </td>
                          <td>
                            <button
                              className={`btn ${
                                category.status ? "btn-success" : "btn-danger"
                              } btn-sm mx-1`}
                              onClick={() => handleUpdateStatus(category.id)}
                            >
                              <i
                                className={`fa-solid ${
                                  category.status
                                    ? "fa-toggle-on"
                                    : "fa-toggle-off"
                                }`}
                              />
                            </button>
                            <Link
                              to={`/admin/updateCategory/${category.id}`}
                              className="btn btn-secondary btn-sm mx-1"
                              title="Edit"
                            >
                              <i className="fas fa-edit" />
                            </Link>
                            <Link
                              to={`/category/${category.id}`}
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
