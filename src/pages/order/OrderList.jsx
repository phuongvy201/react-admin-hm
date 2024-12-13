import React, { useEffect, useState } from "react";
import orderService from "../../services/orderService";
import { urlImage } from "../../config";
import "../../assets/orders.css";
import { Link } from "react-router-dom";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderService.getAllOrders();
        setOrders(response.data.data);
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
                        <div className="account-breadcrumb">
                          <Link to="/"> Home </Link>
                          <i className="fas fa-chevron-right"> </i>
                          <span> Orders</span>
                        </div>

                        <h1>No orders found</h1>
                        <hr />
                      </>
                    )}
                    {orders.length > 0 && (
                      <>
                        <h1>Order Review</h1>
                        <div className="order-summary mb-4">
                          {orders.map((order) => (
                            <div className="order-header" key={order.order_id}>
                              <div className="d-flex  justify-content-end align-items-center">
                                <h5 className="mb-0 mx-2">Order #{order.order_id}</h5>
                                <div className="product-variants d-flex justify-content-end">
                                  <span className="variant-badge bg-lightblue color-palette">
                                    Seller: {order.seller.seller_name}
                                  </span>
                                </div>
                                {order.customer_id !== null && (
                                  <div className="mx-2 color-palette-set">
                                    <div className="bg-info color-palette p-1 small">
                                      <span>Customer: {order.customer_id}</span>
                                    </div>
                                  </div>
                                )}
                                <span
                                  className={`mx-2 status-badge ${
                                    order.status === "1"
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
                              {order.details &&
                                order.details.map((detail) => (
                                  <div
                                    key={detail.product_id}
                                    className="product-item"
                                  >
                                    <div className="d-flex">
                                      <img
                                        src={
                                          detail.image
                                            ? urlImage + detail.image
                                            : "default-image-url"
                                        }
                                        alt={detail.product_name}
                                        className="product-image"
                                      />

                                      <div className="product-details">
                                        <h6 className="product-name">
                                          {detail.product_name}
                                        </h6>
                                        <div className="product-variants">
                                          {" "}
                                          <span className="variant-badge">
                                            {" "}
                                            Size: {detail.attributes?.size}{" "}
                                          </span>{" "}
                                          <span className="variant-badge">
                                            {" "}
                                            Color: {detail.attributes?.color}
                                          </span>{" "}
                                        </div>

                                        <div className="quantity-price">
                                          <span className="quantity text-danger">
                                            ${detail.price} x {detail.quantity}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              <div className="order-footer">
                                <div className="d-flex justify-content-end">
                                  <br />
                                  <span className="total-label text-danger fs-5 price">
                                    Total Amount: $
                                    {order?.total_amount
                                      ? parseFloat(order.total_amount).toFixed(
                                          2
                                        )
                                      : "0.00"}
                                  </span>
                                </div>
                              </div>
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
