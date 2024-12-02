import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      const data = await response.data;
      console.log(data);

      if (data.status === "success") {
        // Lưu token vào localStorage
        localStorage.setItem("token", data.access_token);

        // Lưu thông tin user (bao gồm role) vào localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log(localStorage.getItem("token"));
        // Nếu remember me được chọn
        if (formData.remember) {
          localStorage.setItem("rememberedEmail", formData.email);
        }
        console.log(data.user.role);

        // Chuyển hướng dựa vào role
        if (data.user.role === "admin") {
          navigate("/admin/products");
        } else if (data.user.role === "employee") {
          navigate("/seller/products");
        } else {
          // Xử lý các role khác nếu có
          alert("Không có quyền truy cập!");
          localStorage.clear(); // Xóa token và thông tin user
        }
      } else {
        // Hiển thị thông báo lỗi từ server
        alert(data.message || "Đăng nhập thất bại!");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      alert("Có lỗi xảy ra khi đăng nhập!");
    }
  };

  return (
    <div className="login-box mx-auto mt-5">
      <div className="login-logo"></div>
      <div className="card">
        <div className="card-body login-card-body">
          <p className="login-box-msg">Sign in to start your session</p>
          <form onSubmit={handleSubmit}>
            <div className="input-group mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <div className="input-group-append">
                <div className="input-group-text">
                  <span className="fas fa-envelope" />
                </div>
              </div>
            </div>
            <div className="input-group mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <div className="input-group-append">
                <div className="input-group-text">
                  <span className="fas fa-lock" />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-8">
                <div className="icheck-primary">
                  <input
                    type="checkbox"
                    id="remember"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                  />
                  <label htmlFor="remember">Remember Me</label>
                </div>
              </div>
              {/* /.col */}
              <div className="col-4">
                <button type="submit" className="btn btn-primary btn-block">
                  Sign In
                </button>
              </div>
              {/* /.col */}
            </div>
          </form>
          {/* <div className="social-auth-links text-center mb-3">
            <p>- OR -</p>
            <Link to="#" className="btn btn-block btn-primary">
              <i className="fab fa-facebook mr-2" /> Sign in using Facebook
            </Link>
            <Link to="#" className="btn btn-block btn-danger">
              <i className="fab fa-google-plus mr-2" /> Sign in using Google+
            </Link>
          </div> */}
          {/* /.social-auth-links */}
          {/* <p className="mb-1">
            <Link to="forgot-password.html">I forgot my password</Link>
          </p> */}
          {/* <p className="mb-0">
            <Link to="register.html" className="text-center">
              Register a new membership
            </Link>
          </p> */}
        </div>
        {/* /.login-card-body */}
      </div>
    </div>
  );
}
