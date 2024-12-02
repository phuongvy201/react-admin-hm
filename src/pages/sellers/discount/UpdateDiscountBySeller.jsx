import React, { useEffect, useState } from "react";
import productService from "../../../services/productService";
import { Link, useNavigate, useParams } from "react-router-dom";
import { urlImage } from "../../../config";
import Swal from "sweetalert2";
import discountService from "../../../services/discountService";

export default function UpdateDiscountBySeller() {
  const [discount, setDiscount] = useState([]);
  const [discountName, setDiscountName] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [dateBegin, setDateBegin] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [status, setStatus] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    promotions: [],
  });
  const { id } = useParams();
  const sellerId = JSON.parse(localStorage.getItem("user")).id;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await discountService.getDiscountById(id);
      if (response.data.success) {
        setDiscount(response.data.data);
        setDiscountName(response.data.data.discount_name);
        setDiscountValue(response.data.data.discount_value);
        setStatus(response.data.data.status);
      }
      console.log(response.data.data);
    } catch (err) {
      setError("Không thể tải thông tin khuyến mãi");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [id]);

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

  const handleSubmit = async () => {
    try {
      // Tạo object chứa dữ liệu cập nhật
      const updateData = {
        product_id: discount.product_id,
        discount_name: discountName,
        discount_value: discountValue,
        date_begin: dateBegin,
        date_end: dateEnd,
        status: status,
        updated_by: sellerId,
      };

      // Gọi API cập nhật
      const response = await discountService.updateDiscount(id, updateData);

      if (response.data.success) {
        window.Toast.fire({
          icon: "success",
          title: "Cập nhật khuyến mãi thành công!",
        });

        // Có thể chuyển hướng về trang danh sách sau khi cập nhật thành công
        navigate("/admin/discounts");
      } else {
        window.Toast.fire({
          icon: "error",
          title:
            response.data.message || "Có lỗi xảy ra khi cập nhật khuyến mãi!",
        });
      }
    } catch (err) {
      // Lấy thông báo lỗi từ response của backend
      let errorMessage = "Có lỗi xảy ra khi cập nhật khuyến mãi!";

      if (err.response) {
        // Trường hợp lỗi validation (422)
        if (err.response.status === 422) {
          const validationErrors = err.response.data.errors;
          // Chuyển đổi object errors thành array các message
          errorMessage = Object.values(validationErrors).flat().join("<br>");
        }
        // Trường hợp có message từ backend
        else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }

      window.Toast.fire({
        icon: "error",
        title: errorMessage,
      });

      console.error("Error:", err.response?.data || err);
    }
  };

  // Hàm helper để format date
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    return dateString.split("T")[0]; // Lấy phần date trước T
  };

  useEffect(() => {
    const fetchDiscountDetail = async () => {
      try {
        const response = await discountService.getDiscountById(id);
        if (response.data.success) {
          const discount = response.data.data;
          setDateBegin(formatDateForInput(discount.date_begin));
          setDateEnd(formatDateForInput(discount.date_end));
        }
      } catch (error) {
        console.error("Error fetching discount:", error);
      }
    };

    fetchDiscountDetail();
  }, [id]);

  return (
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
                        <th style={{ width: 250 }}>Promotion Name</th>
                        <th>Discount Percentage</th>
                        <th style={{ width: 200 }}>Start Date</th>
                        <th style={{ width: 200 }}>End Date</th>
                        <th style={{ width: 200 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr key={discount.id}>
                        <td>{discount.id}</td>
                        <td>
                          <div>
                            {discount.product_name}
                            {discount.product_image && (
                              <div>
                                <img
                                  className="img-fluid"
                                  style={{ maxHeight: "50px" }}
                                  src={urlImage + discount.product_image}
                                  alt={discount.product_name}
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
                            onChange={(e) => setDiscountName(e.target.value)}
                            value={discountName}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Enter discount percentage"
                            min="0"
                            onChange={(e) => setDiscountValue(e.target.value)}
                            max="100"
                            value={discountValue}
                          />
                        </td>
                        <td>
                          <input
                            type="date"
                            className="form-control"
                            value={dateBegin}
                          />
                        </td>
                        <td>
                          <input
                            type="date"
                            className="form-control"
                            onChange={(e) => setDateEnd(e.target.value)}
                            value={dateEnd}
                          />
                        </td>
                        <td>
                          <select
                            className="form-control"
                            onChange={(e) => setStatus(e.target.value)}
                            value={status}
                          >
                            <option value={1}>Active</option>
                            <option value={0}>Inactive</option>
                          </select>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="card-footer">
                  <button
                    type="button"
                    className="btn btn-info btn-md"
                    onClick={handleSubmit}
                  >
                    Update Discount{" "}
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
