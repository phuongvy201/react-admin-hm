import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import orderService from "../../../services/orderService";
import { urlImage } from "../../../config";
import "../../../assets/orders.css";

export default function SellerOrderList() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderService.getOrderBySeller();
        if (response.data.success) {
          setOrders(response.data.orders);
        } else {
          console.error("Failed to fetch orders:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching orders:", error.message);
      }
    };

    fetchOrders();
  }, []);
  return (
    <div className="content-wrapper" style={{ minHeight: "1302.4px" }}>
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Order List</h1>
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
                  <div className="account-container">
                    {orders.length === 0 && (
                      <>
                        <h1>No orders found</h1>
                        <hr />
                      </>
                    )}
                    {orders.length > 0 && (
                      <>
                        <h1>Order Review</h1>
                        <div className="order-summary mb-4">
                          {orders.map((order) => (
                            <div key={order.id} className="order-header">
                              <div className="d-flex justify-content-end align-items-center">
                                <h5 className="mb-0 mx-2">
                                  <Link
                                    className="text-dark"
                                    to={`/seller/orders/${order.id}`}
                                  >
                                    Order #{order.id}
                                  </Link>
                                </h5>
                                <span
                                  className={`mx-2 status-badge ${
                                    order.status === "1" || order.status === "2"
                                      ? "status-pending"
                                      : "status-confirmed"
                                  }`}
                                >
                                  {order.status === "1"
                                    ? "Pending"
                                    : "Confirmed"}
                                </span>
                              </div>

                              <div className="order-date">
                                <i className="far fa-calendar-alt me-2 mx-2"></i>
                                <span>
                                  {new Date(
                                    order.created_at
                                  ).toLocaleDateString("vi-VN")}
                                </span>
                              </div>

                              {order.order_details &&
                                order.order_details.map((detail, index) => (
                                  <div key={index} className="product-item">
                                    <div className="d-flex">
                                      <img
                                        src={
                                          detail.product.image
                                            ? detail.product.image instanceof
                                              File
                                              ? URL.createObjectURL(
                                                  detail.product.image
                                                )
                                              : detail.product.image?.startsWith(
                                                  "http"
                                                )
                                              ? detail.product.image
                                              : urlImage + detail.product.image
                                            : "default-image-url"
                                        }
                                        alt={detail.product.name}
                                        className="product-image"
                                      />
                                      <div className="product-details">
                                        <h6 className="product-name">
                                          {detail.product.name}
                                        </h6>
                                        <div className="product-variants">
                                          <span className="variant-badge">
                                            Size: {detail.attributes.size}
                                          </span>
                                          <span className="variant-badge">
                                            Color: {detail.attributes.color}
                                          </span>
                                        </div>
                                        <div className="quantity-price">
                                          <span className="quantity">
                                            ${detail.price} x {detail.quantity}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {/* <div className="card-footer clearfix">
                <ul className="pagination pagination-md m-0 float-right">
                  <li
                    className={`page-item ${
                      pagination.current_page === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() =>
                        handleOrderChange(pagination.current_page - 1)
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
                        onClick={() => handleOrderChange(index + 1)}
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
                        handleOrderChange(pagination.current_page + 1)
                      }
                      disabled={
                        pagination.current_page === pagination.last_page
                      }
                    >
                      »
                    </button>
                  </li>
                </ul>
              </div> */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
