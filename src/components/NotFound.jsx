import React from "react";
import { Link } from "react-router-dom";
import "../assets/notfound.css"; // Đảm bảo bạn tạo tệp CSS để trang trí

const NotFound = () => {
  return (
    <div className="not-found">
      <h1>404</h1>
      <h2>Trang không tồn tại</h2>
      <p>Rất tiếc, trang bạn đang tìm kiếm không tồn tại.</p>
      <Link to="/">Quay lại trang chủ</Link>
    </div>
  );
};

export default NotFound;
