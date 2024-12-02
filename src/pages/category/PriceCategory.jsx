import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Toast from "sweetalert2";
import { urlImage } from "../../config";
import categoryService from "../../services/categoryService";

export default function PriceCategory() {
  const [categories, setCategories] = useState([]);
  const [shippingRates, setShippingRates] = useState({});

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async (page = 1) => {
    try {
      setLoading(true);
      const response = await categoryService.getRootCategories();
      console.log(response);
      if (response.data.success) {
        setCategories(response.data.data);
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

  const handleUpdateShipping = async (id) => {
    try {
      const categoryRates = shippingRates[id] || {};
      const category = categories.find((cat) => cat.id === id);

      // Lấy giá trị từ state mới hoặc giữ nguyên giá trị cũ
      const baseRate =
        categoryRates.base_rate || category.shipping_category?.base_rate;
      const additionalRate =
        categoryRates.additional_rate ||
        category.shipping_category?.additional_rate;

      if (!baseRate || !additionalRate) {
        Toast.fire({
          icon: "error",
          title: "Please enter the shipping rate",
        });
        return;
      }

      const response = await categoryService.addShippingCategory({
        category_id: id,
        base_rate: baseRate,
        additional_rate: additionalRate,
      });

      if (response.data.success) {
        Toast.fire({
          icon: "success",
          title: response.data.message,
        });
        fetchCategories(); // Refresh data

        // Reset giá trị trong shippingRates state sau khi cập nhật thành công
        setShippingRates((prev) => {
          const newRates = { ...prev };
          delete newRates[id];
          return newRates;
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      Toast.fire({
        icon: "error",
        title:
          error.message || "An error occurred while updating the shipping rate",
      });
    }
  };

  const handleRateChange = (categoryId, field, value) => {
    setShippingRates((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [field]: value,
      },
    }));
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
              <h1>Category List</h1>
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
                        <th>Base Rate</th>
                        <th>Additional Rate </th>
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
                                  src={urlImage + "images/" + category.image}
                                  alt={category.name}
                                />
                              </div>
                            )}
                          </td>

                          <td>
                            <input
                              className="form-control"
                              type="number"
                              value={
                                shippingRates[category.id]?.base_rate ||
                                category.shipping_category?.base_rate ||
                                ""
                              }
                              onChange={(e) =>
                                handleRateChange(
                                  category.id,
                                  "base_rate",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <input
                              className="form-control"
                              type="number"
                              value={
                                shippingRates[category.id]?.additional_rate ||
                                category.shipping_category?.additional_rate ||
                                ""
                              }
                              onChange={(e) =>
                                handleRateChange(
                                  category.id,
                                  "additional_rate",
                                  e.target.value
                                )
                              }
                            />
                          </td>

                          <td>
                            {new Date(category.created_at).toLocaleDateString()}
                          </td>
                          <td>
                            <button
                              className="btn  btn-primary"
                              onClick={() => handleUpdateShipping(category.id)}
                            >
                              Update Shipping
                            </button>
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
