import React, { useEffect, useState } from "react";
import "../../../assets/orderdetail.css";
import orderService from "../../../services/orderService";
import { useParams } from "react-router-dom";
import { urlImage } from "../../../config";
import shippingService from "../../../services/shippingService";
import Swal from "sweetalert2";
import { BeatLoader, ClipLoader } from "react-spinners";

export default function OrderDetail() {
  const [order, setOrder] = useState([]);
  const [orderdetail, setOrderDetail] = useState([]);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
  const { id } = useParams();
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderService.getOrderDetail(parseInt(id));
        setOrder(response.data.order);
        setOrderDetail(response.data.order.order_details);
        setTrackingNumber(response.data.order.shipping.tracking_number);
        console.log(response.data.order.shipping.tracking_number);
      } catch (error) {
        console.error("Error fetching orders:", error.message);
      }
    };

    fetchOrders();
  }, []);
  const handleSubmitTracking = async () => {
    if (!trackingNumber.trim()) {
      alert("Tracking number cannot be empty!");
      return;
    }
    setLoading(true); // Bắt đầu loading
    try {
      // Cập nhật tracking number
      await shippingService.updateTracking(order.shipping.id, {
        tracking_number: trackingNumber,
      });

      // Kiểm tra nếu trạng thái đơn hàng là 1 thì mới cập nhật
      if (order.status === 1) {
        // Cập nhật trạng thái đơn hàng
        const updatedStatus = {
          status: 2,
        }; // Ví dụ: 2 có thể là trạng thái "Processing"
        await orderService.updateStatus(order.id, updatedStatus); // Gọi API để cập nhật trạng thái
      }

      // Hiển thị thông báo thành công
      Toast.fire({
        icon: "success",
        title: "Tracking number and status updated successfully!",
      });

      // Reset input tracking number
      setTrackingNumber("");
    } catch (error) {
      console.error("Error updating tracking:", error.message);
      Toast.fire({
        icon: "error",
        title: "Failed to update tracking number or status.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-wrapper" style={{ minHeight: "1302.4px" }}>
      <div className="container">
        <div className="header-order py-4">
          <h1 className="fw-bold">Order Details</h1>
        </div>
        <div className="order-info ">
          <h2>Order Information</h2>
          <p>Order Number: #{order?.id}</p>
          <p>
            Order Date:{" "}
            {new Date(order?.created_at).toLocaleDateString("vi-VN")}
          </p>
        </div>
        <div className="recipient-info">
          <h2>Recipient Information</h2>
          <p>
            Name: {order?.shipping?.first_name} {order?.shipping?.last_name}
          </p>
          <p>
            Address: {order?.shipping?.address}, {order?.shipping?.city}
          </p>
          <p>Phone: {order?.shipping?.phone}</p>
        </div>
        <div className="order-items">
          {Array.isArray(orderdetail) && orderdetail.length > 0 ? (
            orderdetail.map((detail) => (
              <div className="order-item" key={detail.product_id}>
                <img
                  alt={`${detail.product_name}`}
                  height={300}
                  src={
                    detail.product?.image
                      ? detail.product.image instanceof File
                        ? URL.createObjectURL(detail.product.image)
                        : detail.product.image?.startsWith("http")
                        ? detail.product.image
                        : urlImage + detail.product.image
                      : "default-image-url"
                  }
                  width={300}
                />
                <p>{detail.product_name}</p>
                <p>Size: {detail.attributes?.size || "N/A"}</p>
                <p>Color: {detail.attributes?.color || "N/A"}</p>
                <p>Price: ${parseFloat(detail.price).toFixed(2)}</p>
                <p>Quantity: {detail.quantity}</p>
                <p>
                  Total: $
                  {(parseFloat(detail.price) * detail.quantity).toFixed(2)}
                </p>
              </div>
            ))
          ) : (
            <p>No order details available.</p>
          )}
        </div>

        <div className="tracking-info">
          <h2>Enter Tracking Number</h2>
          <input
            placeholder="Enter tracking number"
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
          <button onClick={handleSubmitTracking}>Submit</button>
          <div className="mt-2">
            {loading && (
              <BeatLoader
                color="#36d7b7"
                loading={loading}
                aria-label="Loading Spinner"
                data-testid="loader"
                size={20}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
