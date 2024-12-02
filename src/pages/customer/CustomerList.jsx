import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import sellerService from "../../services/sellerService";

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCustomers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await sellerService.getCustomers(page);
      console.log(response);
      if (response.data.success) {
        setCustomers(response.data.data);
      }
    } catch (err) {
      setError("Không thể tải danh sách khách hàng");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
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
        setCustomers(
          customers.map((customer) => {
            if (customer.id === id) {
              return {
                ...customer,
                status: customer.status === 1 ? 0 : 1,
              };
            }
            return customer;
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
            title: "Xóa khách hàng thành công!",
          });
          fetchCustomers();
        }
      }
    } catch (err) {
      Toast.fire({
        icon: "error",
        title:
          err.response?.data?.message || "Có lỗi xảy ra khi xóa khách hàng!",
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
              <h1>Customer List</h1>
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
                        <th style={{ width: 150 }}>Customer</th>
                        <th style={{ width: 100 }}>Email</th>
                        <th style={{ width: 100 }}>Phone Numer</th>
                        <th style={{ width: 100 }}>Address</th>
                        <th style={{ width: 200 }}>Created_at</th>
                        <th style={{ width: 200 }}>Operation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.id}>
                          <td>{customer.id}</td>
                          <td>
                            <div>
                              <Link
                                to={`/customer/${customer.id}`}
                                className="text-decoration-none text-dark mb-2"
                              >
                                {customer.name}
                              </Link>
                            </div>
                          </td>
                          <td>{customer.email}</td>
                          <td>{customer.phone_number}</td>
                          <td>{customer.address}</td>
                          <td>
                            {new Date(customer.created_at).toLocaleDateString()}
                          </td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm mx-1"
                              title="Delete"
                              onClick={() => handleDelete(customer.id)}
                            >
                              <i className="fa-solid fa-trash-can" />
                            </button>
                            <button
                              className={`btn ${
                                customer.status ? "btn-success" : "btn-danger"
                              } btn-sm mx-1`}
                              onClick={() => handleUpdateStatus(customer.id)}
                            >
                              <i
                                className={`fa-solid ${
                                  customer.status
                                    ? "fa-toggle-on"
                                    : "fa-toggle-off"
                                }`}
                              />
                            </button>

                            <Link
                              to={`/customer/${customer.id}`}
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
