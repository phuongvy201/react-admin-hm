import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import routerAdmin, { routerSeller } from "./routers";
import LayoutAdmin from "./layouts/layoutAdmin/LayoutAdmin";
import LayoutSeller from "./layouts/layoutSeller/LayoutSeller";
import Login from "./layouts/Login";
import PrivateRoute from "./routers/PrivateRoute";
import NotFound from "./components/NotFound";
import { toast } from "react-toastify";
import authService from "./services/authService"; // Giả sử bạn có một dịch vụ auth
import Swal from "sweetalert2";

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const navigate = useNavigate();
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
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await authService.checkSession(); // Gọi API để ki���m tra trạng thái phiên
        if (response.data.status === "error") {
          // Xóa token khỏi localStorage
          localStorage.removeItem("token");

          // Nếu phiên không hợp lệ, thông báo cho người dùng
          Toast.fire({
            icon: "error",
            title: "Tài khoản của bạn đã được đăng nhập từ một thiết bị khác.",
          });

          // Chuyển hướng đến trang đăng nhập
          navigate("/login");
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <Routes>
      <Route
        path="/admin"
        element={<PrivateRoute element={LayoutAdmin} roles={["admin"]} />}
      >
        {routerAdmin.map((route, index) => {
          const Page = route.component;
          return (
            <Route
              path={route.path}
              element={<PrivateRoute element={Page} roles={["admin"]} />}
              key={index}
            />
          );
        })}
      </Route>
      <Route
        path="/seller"
        element={<PrivateRoute element={LayoutSeller} roles={["employee"]} />}
      >
        {routerSeller.map((route, index) => {
          const Page = route.component;
          return (
            <Route
              path={route.path}
              element={<PrivateRoute element={Page} roles={["employee"]} />}
              key={index}
            />
          );
        })}
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
