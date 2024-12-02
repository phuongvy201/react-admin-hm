import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import sellerService from "../../services/sellerService";

export default function SellerList() {
  const [sellers, setSellers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSellers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await sellerService.getEmployees(page);
      console.log(response);
      if (response.data.success) {
        setSellers(response.data.data);
      }
    } catch (err) {
      setError("Không thể tải danh sách nhân viên");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
  });

  const handleUpdateStatus = async (id) => {
    try {
      const response = await sellerService.updateStatus(id);
      if (response.data.success) {
        setSellers(
          sellers.map((seller) => {
            if (seller.id === id) {
              return {
                ...seller,
                status: seller.status === 1 ? 0 : 1,
              };
            }
            return seller;
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
  const handleDelete = async (id) => {
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
        const response = await sellerService.deleteEmployee(id);
        if (response.data.success) {
          Toast.fire({
            icon: "success",
            title: "Xóa nhân viên thành công!",
          });
          fetchSellers();
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
              <h1>Seller List</h1>
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
                        <th style={{ width: 150 }}>Seller</th>
                        <th style={{ width: 100 }}>Email</th>
                        <th style={{ width: 100 }}>Phone Numer</th>
                        <th style={{ width: 100 }}>Address</th>
                        <th style={{ width: 200 }}>Created_at</th>
                        <th style={{ width: 200 }}>Operation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sellers.map((seller) => (
                        <tr key={seller.id}>
                          <td>{seller.id}</td>
                          <td>
                            <div>
                              <Link
                                to={`/seller/${seller.id}`}
                                className="text-decoration-none text-dark mb-2"
                              >
                                {seller.name}
                              </Link>
                            </div>
                          </td>
                          <td>{seller.email}</td>
                          <td>{seller.phone_number}</td>
                          <td>{seller.address}</td>
                          <td>
                            {new Date(seller.created_at).toLocaleDateString()}
                          </td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm mx-1"
                              title="Delete"
                              onClick={() => handleDelete(seller.id)}
                            >
                              <i className="fa-solid fa-trash-can" />
                            </button>
                            <button
                              className={`btn ${
                                seller.status ? "btn-success" : "btn-danger"
                              } btn-sm mx-1`}
                              onClick={() => handleUpdateStatus(seller.id)}
                            >
                              <i
                                className={`fa-solid ${
                                  seller.status
                                    ? "fa-toggle-on"
                                    : "fa-toggle-off"
                                }`}
                              />
                            </button>
                            <Link
                              to={`/admin/updateSeller/${seller.id}`}
                              className="btn btn-secondary btn-sm mx-1"
                              title="Edit"
                            >
                              <i className="fas fa-edit" />
                            </Link>
                            <Link
                              to={`/seller/${seller.id}`}
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
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
