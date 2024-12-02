import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import discountService from "../../../services/discountService";
import { urlImage } from "../../../config";

// Initialize Toast
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 1500,
  timerProgressBar: true,
});

export default function SellerDiscountList() {
  const [discounts, setDiscounts] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
  });
  const sellerId = JSON.parse(localStorage.getItem("user")).id;
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDiscounts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await discountService.getDiscountsBySeller(
        sellerId,
        page
      );
      console.log(response);
      if (response.data.success) {
        setDiscounts(response.data.data);
        setPagination({
          current_page: response.data.meta.current_page,
          per_page: response.data.meta.per_page,
          total: response.data.meta.total,
          last_page: response.data.meta.last_page,
        });
      }
    } catch (err) {
      setError("Unable to load discount list");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handlePageChange = (page) => {
    fetchDiscounts(page);
  };

  const handleUpdateStatus = async (id) => {
    try {
      const response = await discountService.updateStatus(id);
      if (response.data.success) {
        Toast.fire({
          icon: "success",
          title: "Status changed successfully!",
          timer: 1500,
        });

        fetchDiscounts(pagination.current_page);
      }
    } catch (err) {
      Toast.fire({
        icon: "error",
        title:
          err.response?.data?.message ||
          "Error occurred while updating status!",
        timer: 1500,
      });
      console.error(err);
    }
  };

  const handleDeleteDiscount = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Xác nhận xóa?",
        text: "Bạn không thể hoàn tác sau khi xóa!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        const response = await discountService.deleteDiscount(id);
        if (response.data.success) {
          Toast.fire({
            icon: "success",
            title: "Xóa khuyến mãi thành công!",
          });
          fetchDiscounts(pagination.current_page);
        }
      }
    } catch (err) {
      Toast.fire({
        icon: "error",
        title:
          err.response?.data?.message || "Có lỗi xảy ra khi xóa khuyến mãi!",
      });
      console.error("Error:", err);
    }
  };

  return (
    <div>
      <div className="content-wrapper" style={{ minHeight: "1302.4px" }}>
        <section className="content-header">
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
                          <th style={{ width: 250 }}>Discount Name</th>
                          <th>Discount Percentage</th>
                          <th style={{ width: 200 }}>Start Date</th>
                          <th style={{ width: 200 }}>End Date</th>
                          <th style={{ width: 200 }}>Operation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {discounts.length > 0 ? (
                          discounts.map((discount) => (
                            <tr key={discount.id}>
                              <td>{discount.id}</td>
                              <td>
                                <p>Product ID: {discount.product_id}</p>
                                <div>
                                  <Link
                                    to={`/admin/updateProduct/${discount.product_id}`}
                                    className="text-decoration-none text-dark mb-2"
                                  >
                                    {discount.product_name}
                                  </Link>
                                </div>
                                {discount.product_image && (
                                  <div>
                                    <img
                                      className="img-fluid"
                                      style={{ maxHeight: "100px" }}
                                      src={urlImage + discount.product_image}
                                      alt={discount.product_name}
                                    />
                                  </div>
                                )}
                              </td>
                              <td>{discount.discount_name}</td>
                              <td>{discount.discount_value}</td>
                              <td>{discount.date_begin}</td>
                              <td>{discount.date_end}</td>
                              <td>
                                <button
                                  className="btn btn-danger btn-sm mx-1"
                                  title="Delete"
                                  onClick={() =>
                                    handleDeleteDiscount(discount.id)
                                  }
                                >
                                  <i className="fa-solid fa-trash-can" />
                                </button>
                                <button
                                  className={`btn ${
                                    discount.status === 1
                                      ? "btn-success"
                                      : "btn-danger"
                                  } btn-sm mx-1`}
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="top"
                                  onClick={() =>
                                    handleUpdateStatus(discount.id)
                                  }
                                  title={
                                    discount.status === 1
                                      ? "Discount program is active"
                                      : "Discount program has ended"
                                  }
                                >
                                  <i
                                    className={`fa-solid ${
                                      discount.status === 1
                                        ? "fa-toggle-on"
                                        : "fa-toggle-off"
                                    }`}
                                  />
                                </button>
                                <Link
                                  to={`/admin/updateDiscount/${discount.id}`}
                                  className="btn btn-secondary btn-sm mx-1"
                                  title="Edit"
                                >
                                  <i className="fas fa-edit" />
                                </Link>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="text-center py-4">
                              <h5 className="text-muted">
                                No promotion programs yet
                              </h5>
                              <p className="text-muted">
                                Please add promotion programs for your products
                              </p>
                            </td>
                          </tr>
                        )}
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
                            pagination.current_page === index + 1
                              ? "active"
                              : ""
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
    </div>
  );
}
